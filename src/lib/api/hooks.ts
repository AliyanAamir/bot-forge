"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { apiGet, apiSend, listQuery } from "./client";
import { qk } from "./keys";
import { usePageParam } from "./usePage";
import type {
  ConversationListItem,
  InviteListItem,
  KnowledgeListItem,
  LeadListItem,
  Paginated,
  ProjectListItem,
} from "./types";

const PAGE_SIZE = 25;

/** Normalized shape every list facade returns — components never touch raw query state. */
export interface ListResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  /** True while showing the previous page during a page transition. */
  isPlaceholder: boolean;
}

/**
 * Generic paginated-list facade. Owns: URL page param, query key, fetch URL,
 * keepPreviousData, and next-page prefetch. Resource hooks below are thin
 * declarations; components only ever see ListResult.
 */
function usePaginatedResource<T>(args: {
  keyForPage: (page: number) => QueryKey;
  urlForPage: (page: number) => string;
  enabled?: boolean;
}): ListResult<T> {
  const page = usePageParam();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: args.keyForPage(page),
    queryFn: () => apiGet<Paginated<T>>(args.urlForPage(page)),
    placeholderData: keepPreviousData,
    enabled: args.enabled ?? true,
  });

  const totalPages = query.data?.totalPages ?? 1;
  useEffect(() => {
    if (page < totalPages) {
      qc.prefetchQuery({
        queryKey: args.keyForPage(page + 1),
        queryFn: () => apiGet<Paginated<T>>(args.urlForPage(page + 1)),
      });
    }
    // args.* are referentially stable per render-site; page/totalPages drive it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages, qc]);

  return {
    items: query.data?.data ?? [],
    page,
    pageSize: query.data?.pageSize ?? PAGE_SIZE,
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isPending,
    isError: query.isError,
    error: (query.error as Error) ?? null,
    refetch: () => void query.refetch(),
    isPlaceholder: query.isPlaceholderData,
  };
}

/* ----------------------------------------------------------------
   List facades — one line of intent each.
   ---------------------------------------------------------------- */

export function useProjectsList() {
  return usePaginatedResource<ProjectListItem>({
    keyForPage: qk.projects,
    urlForPage: (p) => `/api/projects${listQuery({ page: p, pageSize: PAGE_SIZE })}`,
  });
}

export function useLeadsList(projectId: string) {
  return usePaginatedResource<LeadListItem>({
    keyForPage: (p) => qk.leads(projectId, p),
    urlForPage: (p) => `/api/projects/${projectId}/leads${listQuery({ page: p, pageSize: PAGE_SIZE })}`,
  });
}

export function useConversationsList(projectId: string) {
  return usePaginatedResource<ConversationListItem>({
    keyForPage: (p) => qk.conversations(projectId, p),
    urlForPage: (p) => `/api/projects/${projectId}/sessions${listQuery({ page: p, pageSize: PAGE_SIZE })}`,
  });
}

export function useKnowledgeList(projectId: string) {
  return usePaginatedResource<KnowledgeListItem>({
    keyForPage: (p) => qk.knowledge(projectId, p),
    urlForPage: (p) => `/api/knowledge/${projectId}${listQuery({ page: p, pageSize: PAGE_SIZE })}`,
  });
}

export function useInvitesList(projectId: string, enabled = true) {
  return usePaginatedResource<InviteListItem>({
    keyForPage: (p) => qk.invites(projectId, p),
    urlForPage: (p) => `/api/projects/${projectId}/invites${listQuery({ page: p, pageSize: PAGE_SIZE })}`,
    enabled,
  });
}

/* ----------------------------------------------------------------
   Mutation facades — read the active page internally, own the cache
   writes (optimistic + rollback + invalidation). Components just call
   .mutate() and read .isPending / .variables / .error.
   ---------------------------------------------------------------- */

export function useUpdateLeadStatus(projectId: string) {
  const qc = useQueryClient();
  const page = usePageParam();
  const key = qk.leads(projectId, page);
  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
      apiSend(`/api/projects/${projectId}/leads`, "PATCH", { leadId, status }),
    onMutate: async ({ leadId, status }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<LeadListItem>>(key);
      if (prev) {
        qc.setQueryData<Paginated<LeadListItem>>(key, {
          ...prev,
          data: prev.data.map((l) => (l.id === leadId ? { ...l, status } : l)),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.leadsAll(projectId) }),
  });
}

export function useAddKnowledge(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; content: string; source: string; type: string }) =>
      apiSend<KnowledgeListItem>(`/api/knowledge/${projectId}`, "POST", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.knowledgeAll(projectId) }),
  });
}

export function useDeleteKnowledge(projectId: string) {
  const qc = useQueryClient();
  const page = usePageParam();
  const key = qk.knowledge(projectId, page);
  return useMutation({
    mutationFn: (docId: string) => apiSend(`/api/knowledge/${projectId}`, "DELETE", { docId }),
    onMutate: async (docId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<KnowledgeListItem>>(key);
      if (prev) {
        qc.setQueryData<Paginated<KnowledgeListItem>>(key, {
          ...prev,
          data: prev.data.filter((d) => d.id !== docId),
          total: Math.max(0, prev.total - 1),
        });
      }
      return { prev };
    },
    onError: (_e, _id, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.knowledgeAll(projectId) }),
  });
}

export interface ApiKeyState {
  apiKey: string;
  apiKeyRotatedAt: string | null;
  apiKeyRevokedAt: string | null;
}

/**
 * API-key mutation facade. The latest server state lives in `mutation.data`
 * (a React Query data point) — components read `data ?? initial`, never
 * mirror it into useState.
 */
export function useApiKeyAction(projectId: string) {
  return useMutation({
    mutationFn: (action: "rotate" | "revoke" | "reactivate") =>
      apiSend<ApiKeyState>(`/api/projects/${projectId}/api-key`, "POST", { action }),
  });
}

export function useSendInvite(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; role: string }) =>
      apiSend(`/api/projects/${projectId}/invites`, "POST", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.invitesAll(projectId) }),
  });
}

export function useRevokeInvite(projectId: string) {
  const qc = useQueryClient();
  const page = usePageParam();
  const key = qk.invites(projectId, page);
  return useMutation({
    mutationFn: (inviteId: string) => apiSend(`/api/projects/${projectId}/invites/${inviteId}`, "DELETE"),
    onMutate: async (inviteId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<InviteListItem>>(key);
      if (prev) {
        qc.setQueryData<Paginated<InviteListItem>>(key, {
          ...prev,
          data: prev.data.filter((i) => i.id !== inviteId),
          total: Math.max(0, prev.total - 1),
        });
      }
      return { prev };
    },
    onError: (_e, _id, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.invitesAll(projectId) }),
  });
}

export function useRemoveMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiSend(`/api/projects/${projectId}/members/${userId}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", projectId] }),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description: string }) =>
      apiSend<{ id: string }>(`/api/projects`, "POST", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projectsAll() }),
  });
}

export { PAGE_SIZE };

"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiGet, apiSend, listQuery } from "./client";
import { qk } from "./keys";
import type {
  ConversationListItem,
  InviteListItem,
  KnowledgeListItem,
  LeadListItem,
  Paginated,
  ProjectListItem,
} from "./types";

const PAGE_SIZE = 25;

/* ----------------------------------------------------------------
   Queries — paginated lists. keepPreviousData makes page changes
   feel instant (old page stays while the next loads).
   ---------------------------------------------------------------- */

export function useProjects(page: number) {
  return useQuery({
    queryKey: qk.projects(page),
    queryFn: () => apiGet<Paginated<ProjectListItem>>(`/api/projects${listQuery({ page, pageSize: PAGE_SIZE })}`),
    placeholderData: keepPreviousData,
  });
}

export function useLeads(projectId: string, page: number) {
  return useQuery({
    queryKey: qk.leads(projectId, page),
    queryFn: () =>
      apiGet<Paginated<LeadListItem>>(`/api/projects/${projectId}/leads${listQuery({ page, pageSize: PAGE_SIZE })}`),
    placeholderData: keepPreviousData,
  });
}

export function useConversations(projectId: string, page: number) {
  return useQuery({
    queryKey: qk.conversations(projectId, page),
    queryFn: () =>
      apiGet<Paginated<ConversationListItem>>(
        `/api/projects/${projectId}/sessions${listQuery({ page, pageSize: PAGE_SIZE })}`,
      ),
    placeholderData: keepPreviousData,
  });
}

export function useKnowledge(projectId: string, page: number) {
  return useQuery({
    queryKey: qk.knowledge(projectId, page),
    queryFn: () =>
      apiGet<Paginated<KnowledgeListItem>>(`/api/knowledge/${projectId}${listQuery({ page, pageSize: PAGE_SIZE })}`),
    placeholderData: keepPreviousData,
  });
}

export function useInvites(projectId: string, page: number, enabled = true) {
  return useQuery({
    queryKey: qk.invites(projectId, page),
    queryFn: () =>
      apiGet<Paginated<InviteListItem>>(`/api/projects/${projectId}/invites${listQuery({ page, pageSize: PAGE_SIZE })}`),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/* ----------------------------------------------------------------
   Mutations — optimistic where it improves feel, invalidate on settle.
   ---------------------------------------------------------------- */

export function useUpdateLeadStatus(projectId: string, page: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
      apiSend(`/api/projects/${projectId}/leads`, "PATCH", { leadId, status }),
    onMutate: async ({ leadId, status }) => {
      const key = qk.leads(projectId, page);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<LeadListItem>>(key);
      if (prev) {
        qc.setQueryData<Paginated<LeadListItem>>(key, {
          ...prev,
          data: prev.data.map((l) => (l.id === leadId ? { ...l, status } : l)),
        });
      }
      return { prev, key };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
    },
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

export function useDeleteKnowledge(projectId: string, page: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => apiSend(`/api/knowledge/${projectId}`, "DELETE", { docId }),
    onMutate: async (docId) => {
      const key = qk.knowledge(projectId, page);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<KnowledgeListItem>>(key);
      if (prev) {
        qc.setQueryData<Paginated<KnowledgeListItem>>(key, {
          ...prev,
          data: prev.data.filter((d) => d.id !== docId),
          total: Math.max(0, prev.total - 1),
        });
      }
      return { prev, key };
    },
    onError: (_err, _docId, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.knowledgeAll(projectId) }),
  });
}

export interface ApiKeyState {
  apiKey: string;
  apiKeyRotatedAt: string | null;
  apiKeyRevokedAt: string | null;
}

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

export function useRevokeInvite(projectId: string, page: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      apiSend(`/api/projects/${projectId}/invites/${inviteId}`, "DELETE"),
    onMutate: async (inviteId) => {
      const key = qk.invites(projectId, page);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<InviteListItem>>(key);
      if (prev) {
        qc.setQueryData<Paginated<InviteListItem>>(key, {
          ...prev,
          data: prev.data.filter((i) => i.id !== inviteId),
          total: Math.max(0, prev.total - 1),
        });
      }
      return { prev, key };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.invitesAll(projectId) }),
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

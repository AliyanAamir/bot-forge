/** Centralized query keys so mutations can invalidate precisely. */

export const qk = {
  projects: (page: number) => ["projects", page] as const,
  projectsAll: () => ["projects"] as const,

  leads: (projectId: string, page: number) => ["leads", projectId, page] as const,
  leadsAll: (projectId: string) => ["leads", projectId] as const,

  conversations: (projectId: string, page: number) => ["conversations", projectId, page] as const,
  conversationsAll: (projectId: string) => ["conversations", projectId] as const,

  knowledge: (projectId: string, page: number) => ["knowledge", projectId, page] as const,
  knowledgeAll: (projectId: string) => ["knowledge", projectId] as const,

  invites: (projectId: string, page: number) => ["invites", projectId, page] as const,
  invitesAll: (projectId: string) => ["invites", projectId] as const,
};

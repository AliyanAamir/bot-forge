export type ProjectRole = "owner" | "admin" | "editor" | "viewer";

export const PROJECT_ROLES: ProjectRole[] = ["owner", "admin", "editor", "viewer"];
export const INVITABLE_ROLES: Exclude<ProjectRole, "owner">[] = ["admin", "editor", "viewer"];

export const ROLE_LABELS: Record<ProjectRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<ProjectRole, string> = {
  owner: "Full control, including deleting the project.",
  admin: "Manage team, API key, and all content.",
  editor: "Edit configuration, knowledge base, and lead status.",
  viewer: "Read-only access to all project data.",
};

const rank: Record<ProjectRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

export type Capability =
  | "view"
  | "editContent"
  | "manageTeam"
  | "manageApiKey"
  | "deleteProject";

const CAP_REQUIRES: Record<Capability, ProjectRole> = {
  view: "viewer",
  editContent: "editor",
  manageTeam: "admin",
  manageApiKey: "admin",
  deleteProject: "owner",
};

export function can(role: ProjectRole | null | undefined, cap: Capability): boolean {
  if (!role) return false;
  return rank[role] >= rank[CAP_REQUIRES[cap]];
}

export function isProjectRole(value: unknown): value is ProjectRole {
  return typeof value === "string" && (PROJECT_ROLES as string[]).includes(value);
}

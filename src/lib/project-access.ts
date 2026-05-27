import { db } from "@/lib/db";
import type { ProjectRole } from "@/lib/permissions";

export async function hasProjectAccess(projectId: string, userId: string) {
  return db.project.findFirst({
    where: {
      id: projectId,
      OR: [{ userId }, { members: { some: { userId } } }],
    },
  });
}

export async function getProjectRole(projectId: string, userId: string): Promise<ProjectRole | null> {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return null;
  if (project.userId === userId) return "owner";
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) return null;
  const role = member.role;
  if (role === "admin" || role === "editor" || role === "viewer") return role;
  return "viewer";
}

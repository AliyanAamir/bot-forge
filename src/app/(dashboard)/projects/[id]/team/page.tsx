import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { hasProjectAccess, getProjectRole } from "@/lib/project-access";
import { can } from "@/lib/permissions";
import { TeamManager } from "@/components/project/TeamManager";
import { PageHeader } from "@/components/project/PageHeader";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const access = await hasProjectAccess(id, session!.user.id);
  if (!access) notFound();

  const role = await getProjectRole(id, session!.user.id);
  const canManage = can(role, "manageTeam");

  const project = await db.project.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!project) notFound();

  const invites = canManage
    ? await db.invite.findMany({
        where: { projectId: id, acceptedAt: null },
        orderBy: { createdAt: "desc" },
        include: { invitedBy: { select: { name: true, email: true } } },
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Invite collaborators and manage who can do what."
      />
      <TeamManager
        projectId={id}
        currentUserId={session!.user.id}
        viewerRole={role}
        owner={project.user}
        members={project.members.map((m) => ({
          id: m.id,
          role: m.role,
          createdAt: m.createdAt.toISOString(),
          user: m.user,
        }))}
        invites={invites.map((i) => ({
          id: i.id,
          email: i.email,
          role: i.role,
          token: i.token,
          expiresAt: i.expiresAt.toISOString(),
          createdAt: i.createdAt.toISOString(),
          invitedBy: i.invitedBy,
        }))}
      />
    </div>
  );
}

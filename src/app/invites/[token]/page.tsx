import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";
import { ROLE_LABELS, type ProjectRole, isProjectRole } from "@/lib/permissions";
import { LogoMark } from "@/components/brand/Logo";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();

  const invite = await db.invite.findUnique({
    where: { token },
    include: { project: { select: { id: true, name: true } }, invitedBy: { select: { name: true, email: true } } },
  });

  if (!invite) return <InviteShell title="Invite not found" body="This link is invalid or has been revoked." />;
  if (invite.acceptedAt) return <InviteShell title="Already accepted" body="This invite has already been used." />;
  if (invite.expiresAt < new Date()) return <InviteShell title="Invite expired" body="Ask the project owner to send a new one." />;

  const inviteRole: ProjectRole = isProjectRole(invite.role) ? invite.role : "viewer";

  // Already logged in path
  if (session?.user?.email) {
    const userEmail = session.user.email.toLowerCase();
    if (userEmail !== invite.email) {
      return (
        <InviteShell
          title="Wrong account"
          body={`This invite was sent to ${invite.email}. You are signed in as ${session.user.email}. Sign in with the invited account to accept.`}
        />
      );
    }

    const existing = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId: invite.projectId, userId: session.user.id } },
    });
    if (existing) {
      await db.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
      redirect(`/projects/${invite.projectId}`);
    }

    await db.$transaction([
      db.projectMember.create({
        data: { projectId: invite.projectId, userId: session.user.id, role: invite.role },
      }),
      db.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
    ]);

    redirect(`/projects/${invite.projectId}`);
  }

  // Unauthenticated path — check if user exists for that email
  const existingUser = await db.user.findUnique({ where: { email: invite.email } });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <LogoMark className="size-12 rounded-xl mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">You&apos;re invited</h1>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            <strong className="text-ink">{invite.invitedBy.name || invite.invitedBy.email}</strong> invited{" "}
            <strong className="text-ink">{invite.email}</strong> to join{" "}
            <strong className="text-ink">{invite.project.name}</strong> as a{" "}
            <strong className="text-ink">{ROLE_LABELS[inviteRole]}</strong>.
          </p>
        </div>
        <div className="panel panel-pad shadow-[0_1px_3px_oklch(0.4_0.03_60/0.06)]">
          <AcceptInviteForm token={token} email={invite.email} isNewUser={!existingUser} />
        </div>
      </div>
    </div>
  );
}

function InviteShell({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full panel panel-pad text-center">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="text-muted text-sm mt-2">{body}</p>
        <Link href="/login" className="btn btn-primary mt-6">
          Go to sign in
        </Link>
      </div>
    </div>
  );
}

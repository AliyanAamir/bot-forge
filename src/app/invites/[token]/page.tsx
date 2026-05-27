import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";
import { ROLE_LABELS, type ProjectRole, isProjectRole } from "@/lib/permissions";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-indigo-600 items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">You&apos;re invited</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            <strong>{invite.invitedBy.name || invite.invitedBy.email}</strong> invited{" "}
            <strong>{invite.email}</strong> to join <strong>{invite.project.name}</strong> as a{" "}
            <strong>{ROLE_LABELS[inviteRole]}</strong>.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <AcceptInviteForm token={token} email={invite.email} isNewUser={!existingUser} />
        </div>
      </div>
    </div>
  );
}

function InviteShell({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 text-sm mt-2">{body}</p>
        <Link
          href="/login"
          className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVITABLE_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, type ProjectRole } from "@/lib/permissions";
import { useInvitesList, useSendInvite, useRevokeInvite, useRemoveMember } from "@/lib/api/hooks";
import { ClientPager } from "@/components/ui/ClientPager";
import { Send, Copy, Loader2, Crown } from "lucide-react";

interface UserLite {
  id: string;
  name: string | null;
  email: string;
}

interface Member {
  id: string;
  role: string;
  createdAt: string;
  user: UserLite;
}

interface Props {
  projectId: string;
  currentUserId: string;
  viewerRole: ProjectRole | null;
  owner: UserLite;
  members: Member[];
}

function initials(u: UserLite) {
  return (u.name || u.email).trim()[0]?.toUpperCase() ?? "?";
}

export function TeamManager({ projectId, currentUserId, viewerRole, owner, members }: Props) {
  const router = useRouter();
  const canManage = viewerRole === "owner" || viewerRole === "admin";

  const invites = useInvitesList(projectId, canManage);
  const sendInvite = useSendInvite(projectId);
  const revokeInvite = useRevokeInvite(projectId);
  const removeMemberMut = useRemoveMember(projectId);

  // Form input + transient toast — ephemeral UI state, not server data.
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<ProjectRole, "owner">>("viewer");
  const [info, setInfo] = useState("");

  function invite(e: React.FormEvent) {
    e.preventDefault();
    setInfo("");
    sendInvite.mutate(
      { email, role },
      {
        onSuccess: () => {
          setInfo(`Invite sent to ${email}.`);
          setEmail("");
        },
      },
    );
  }

  function removeMember(userId: string, self: boolean) {
    if (!confirm(self ? "Leave this project?" : "Remove this member?")) return;
    removeMemberMut.mutate(userId, {
      onSuccess: () => {
        if (self) router.push("/dashboard");
        else router.refresh();
      },
    });
  }

  async function copyLink(token: string) {
    const link = `${window.location.origin}/invites/${token}`;
    await navigator.clipboard.writeText(link);
    setInfo("Invite link copied.");
    setTimeout(() => setInfo(""), 1800);
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <section className="panel overflow-hidden">
          <div className="panel-head">
            <div>
              <h2 className="font-semibold text-ink">Invite a teammate</h2>
              <p className="hint mt-0.5">They&apos;ll get an email with a 7-day accept link.</p>
            </div>
          </div>
          <div className="panel-pad">
            <form onSubmit={invite} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="input flex-1"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Exclude<ProjectRole, "owner">)}
                className="select sm:w-40"
              >
                {INVITABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              <button type="submit" disabled={sendInvite.isPending} className="btn btn-primary">
                {sendInvite.isPending ? (<><Loader2 className="size-4 animate-spin" /> Sending…</>) : (<><Send className="size-4" strokeWidth={1.75} /> Send invite</>)}
              </button>
            </form>
            <p className="mt-3 text-xs text-muted">
              <strong className="text-ink">{ROLE_LABELS[role]}:</strong> {ROLE_DESCRIPTIONS[role]}
            </p>
            {sendInvite.isError && <p className="mt-3 text-sm text-danger">{sendInvite.error.message}</p>}
            {info && <p className="mt-3 text-sm text-success">{info}</p>}
          </div>
        </section>
      )}

      <section className="panel overflow-hidden">
        <div className="panel-head"><h2 className="font-semibold text-ink">Members</h2></div>
        <ul className="divide-y divide-line">
          <MemberRow user={owner} badge={<span className="badge badge-ember"><Crown className="size-3" strokeWidth={2} /> owner</span>} />
          {members.map((m) => {
            const self = m.user.id === currentUserId;
            return (
              <MemberRow
                key={m.id}
                user={m.user}
                self={self}
                badge={<span className="badge badge-neutral capitalize">{m.role}</span>}
                action={
                  (canManage || self) && (
                    <button
                      type="button"
                      onClick={() => removeMember(m.user.id, self)}
                      className="text-xs text-danger hover:underline font-medium"
                    >
                      {self ? "Leave" : "Remove"}
                    </button>
                  )
                }
              />
            );
          })}
        </ul>
      </section>

      {canManage && invites.total > 0 && (
        <section className="panel overflow-hidden">
          <div className="panel-head"><h2 className="font-semibold text-ink">Pending invites</h2></div>
          <ul className={`divide-y divide-line ${invites.isPlaceholder ? "opacity-60 transition-opacity" : ""}`}>
            {invites.items.map((i) => {
              const revoking = revokeInvite.isPending && revokeInvite.variables === i.id;
              return (
                <li key={i.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-ink font-medium truncate">{i.email}</p>
                    <p className="text-xs text-faint mt-0.5">
                      by {i.invitedBy.name || i.invitedBy.email} · expires {new Date(i.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="badge badge-neutral capitalize">{i.role}</span>
                    <button type="button" onClick={() => copyLink(i.token)} className="inline-flex items-center gap-1 text-xs text-ember-strong hover:underline font-medium">
                      <Copy className="size-3" strokeWidth={1.75} /> Link
                    </button>
                    <button type="button" onClick={() => revokeInvite.mutate(i.id)} disabled={revoking} className="text-xs text-danger hover:underline font-medium inline-flex items-center gap-1">
                      {revoking && <Loader2 className="size-3 animate-spin" />} Revoke
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {invites.totalPages > 1 && (
            <div className="px-5 pb-4">
              <ClientPager
                page={invites.page}
                totalPages={invites.totalPages}
                total={invites.total}
                pageSize={invites.pageSize}
                basePath={`/projects/${projectId}/team`}
                noun="invites"
                busy={invites.isPlaceholder}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function MemberRow({
  user,
  badge,
  action,
  self,
}: {
  user: UserLite;
  badge: React.ReactNode;
  action?: React.ReactNode;
  self?: boolean;
}) {
  return (
    <li className="px-5 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-sunk text-muted text-sm font-semibold shrink-0">
          {initials(user)}
        </span>
        <div className="min-w-0">
          <p className="text-ink font-medium truncate">
            {user.name || user.email}{self && <span className="text-faint font-normal"> (you)</span>}
          </p>
          <p className="text-xs text-faint truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {badge}
        {action}
      </div>
    </li>
  );
}

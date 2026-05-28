"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVITABLE_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, type ProjectRole } from "@/lib/permissions";
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

interface Invite {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: { name: string | null; email: string };
}

interface Props {
  projectId: string;
  currentUserId: string;
  viewerRole: ProjectRole | null;
  owner: UserLite;
  members: Member[];
  invites: Invite[];
}

function initials(u: UserLite) {
  return (u.name || u.email).trim()[0]?.toUpperCase() ?? "?";
}

export function TeamManager({ projectId, currentUserId, viewerRole, owner, members, invites }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<ProjectRole, "owner">>("viewer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canManage = viewerRole === "owner" || viewerRole === "admin";

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    const res = await fetch(`/api/projects/${projectId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to send invite");
    } else {
      setInfo(`Invite sent to ${email}.`);
      setEmail("");
      router.refresh();
    }
    setBusy(false);
  }

  async function deleteInvite(inviteId: string) {
    if (!confirm("Revoke this invite?")) return;
    await fetch(`/api/projects/${projectId}/invites/${inviteId}`, { method: "DELETE" });
    router.refresh();
  }

  async function removeMember(userId: string, self: boolean) {
    if (!confirm(self ? "Leave this project?" : "Remove this member?")) return;
    await fetch(`/api/projects/${projectId}/members/${userId}`, { method: "DELETE" });
    if (self) router.push("/dashboard");
    else router.refresh();
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
              <button type="submit" disabled={busy} className="btn btn-primary">
                {busy ? (<><Loader2 className="size-4 animate-spin" /> Sending…</>) : (<><Send className="size-4" strokeWidth={1.75} /> Send invite</>)}
              </button>
            </form>
            <p className="mt-3 text-xs text-muted">
              <strong className="text-ink">{ROLE_LABELS[role]}:</strong> {ROLE_DESCRIPTIONS[role]}
            </p>
            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
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

      {invites.length > 0 && (
        <section className="panel overflow-hidden">
          <div className="panel-head"><h2 className="font-semibold text-ink">Pending invites</h2></div>
          <ul className="divide-y divide-line">
            {invites.map((i) => (
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
                  {canManage && (
                    <button type="button" onClick={() => deleteInvite(i.id)} className="text-xs text-danger hover:underline font-medium">
                      Revoke
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVITABLE_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, type ProjectRole } from "@/lib/permissions";

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
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Invite a teammate</h2>
          <p className="text-sm text-slate-500 mb-4">They&apos;ll get an email with a 7-day accept link.</p>
          <form onSubmit={invite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Exclude<ProjectRole, "owner">)}
              className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {INVITABLE_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send invite"}
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            <strong>{ROLE_LABELS[role]}:</strong> {ROLE_DESCRIPTIONS[role]}
          </p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {info && <p className="mt-3 text-sm text-emerald-600">{info}</p>}
        </section>
      )}

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Members</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          <li className="px-5 py-3 flex items-center justify-between text-sm">
            <div>
              <p className="text-slate-800 font-medium">{owner.name || owner.email}</p>
              <p className="text-xs text-slate-500">{owner.email}</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">owner</span>
          </li>
          {members.map((m) => {
            const self = m.user.id === currentUserId;
            return (
              <li key={m.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-800 font-medium">{m.user.name || m.user.email}{self && " (you)"}</p>
                  <p className="text-xs text-slate-500">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">{m.role}</span>
                  {(canManage || self) && (
                    <button
                      type="button"
                      onClick={() => removeMember(m.user.id, self)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      {self ? "Leave" : "Remove"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {invites.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Pending invites</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {invites.map((i) => (
              <li key={i.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-800 font-medium">{i.email}</p>
                  <p className="text-xs text-slate-500">
                    Invited by {i.invitedBy.name || i.invitedBy.email} · expires {new Date(i.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">{i.role}</span>
                  <button
                    type="button"
                    onClick={() => copyLink(i.token)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Copy link
                  </button>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => deleteInvite(i.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
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

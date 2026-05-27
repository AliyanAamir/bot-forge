"use client";

import { useState } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  sessionId: string;
  createdAt: string;
}

const STATUSES = ["new", "contacted", "converted", "archived"];

export function LeadsTable({ projectId, initialLeads }: { projectId: string; initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);

  async function updateStatus(leadId: string, status: string) {
    setLeads((p) => p.map((l) => (l.id === leadId ? { ...l, status } : l)));
    await fetch(`/api/projects/${projectId}/leads`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status }),
    });
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <p className="text-slate-500">No leads captured yet.</p>
        <p className="text-slate-400 text-sm mt-2">Enable Lead Capture in project Configuration to start collecting contact info.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Phone</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Captured</th>
            <th className="px-5 py-3 font-medium">Chat</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-5 py-3 text-slate-800 font-medium">{l.name || "—"}</td>
              <td className="px-5 py-3 text-slate-600">{l.email || "—"}</td>
              <td className="px-5 py-3 text-slate-600">{l.phone || "—"}</td>
              <td className="px-5 py-3">
                <select
                  value={l.status}
                  onChange={(e) => updateStatus(l.id, e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="px-5 py-3 text-slate-500 text-xs">
                {new Date(l.createdAt).toLocaleDateString()}
              </td>
              <td className="px-5 py-3">
                <Link
                  href={`/projects/${projectId}/conversations/${l.sessionId}`}
                  className="text-indigo-600 hover:underline text-xs font-medium"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

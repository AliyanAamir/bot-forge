"use client";

import { useState } from "react";

interface KeyState {
  apiKey: string;
  apiKeyRotatedAt: string | null;
  apiKeyRevokedAt: string | null;
}

interface Props {
  projectId: string;
  canManage: boolean;
  initial: KeyState;
}

function mask(key: string) {
  if (key.length <= 10) return "•".repeat(key.length);
  return key.slice(0, 4) + "•".repeat(20) + key.slice(-4);
}

export function ApiKeyManager({ projectId, canManage, initial }: Props) {
  const [state, setState] = useState(initial);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);

  const revoked = !!state.apiKeyRevokedAt;

  async function action(name: "rotate" | "revoke" | "reactivate") {
    setBusy(name);
    const res = await fetch(`/api/projects/${projectId}/api-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: name }),
    });
    if (res.ok) {
      const data = await res.json();
      setState({
        apiKey: data.apiKey,
        apiKeyRotatedAt: data.apiKeyRotatedAt,
        apiKeyRevokedAt: data.apiKeyRevokedAt,
      });
      if (name === "rotate") setRevealed(true);
    }
    setBusy(null);
    setConfirmRotate(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(state.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-5">
      {revoked && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm">
          <p className="font-semibold text-red-800">This key is revoked</p>
          <p className="text-red-700 mt-1">
            All widget requests using this key will be rejected. Reactivate it or rotate to issue a new one.
          </p>
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Key</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="text-slate-300 hover:text-white text-xs font-medium px-2 py-1 rounded"
            >
              {revealed ? "Hide" : "Reveal"}
            </button>
            <button
              type="button"
              onClick={copy}
              className="text-indigo-300 hover:text-indigo-200 text-xs font-medium px-2 py-1 rounded"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
        <code className="text-green-400 text-sm font-mono break-all block">
          {revealed ? state.apiKey : mask(state.apiKey)}
        </code>
        <div className="flex gap-4 mt-4 text-xs text-slate-500">
          {state.apiKeyRotatedAt && (
            <span>Rotated: {new Date(state.apiKeyRotatedAt).toLocaleString()}</span>
          )}
          {state.apiKeyRevokedAt && (
            <span className="text-red-400">Revoked: {new Date(state.apiKeyRevokedAt).toLocaleString()}</span>
          )}
        </div>
      </div>

      {canManage ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Manage</h2>
          <p className="text-sm text-slate-500 mb-5">
            Rotation invalidates the old key immediately. Update your embed snippet after rotating.
          </p>
          <div className="flex flex-wrap gap-3">
            {!confirmRotate ? (
              <button
                type="button"
                onClick={() => setConfirmRotate(true)}
                disabled={busy !== null}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Rotate key
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="text-sm text-amber-800">Confirm rotate? Existing embeds will break.</span>
                <button
                  type="button"
                  onClick={() => action("rotate")}
                  disabled={busy !== null}
                  className="px-3 py-1 bg-amber-600 text-white rounded-md text-xs font-semibold hover:bg-amber-700 disabled:opacity-50"
                >
                  {busy === "rotate" ? "Rotating…" : "Yes, rotate"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRotate(false)}
                  className="px-3 py-1 text-amber-700 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            )}

            {revoked ? (
              <button
                type="button"
                onClick={() => action("reactivate")}
                disabled={busy !== null}
                className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 disabled:opacity-50"
              >
                {busy === "reactivate" ? "Reactivating…" : "Reactivate"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => action("revoke")}
                disabled={busy !== null}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                {busy === "revoke" ? "Revoking…" : "Revoke"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          Only project owners and admins can rotate or revoke the API key.
        </div>
      )}
    </div>
  );
}

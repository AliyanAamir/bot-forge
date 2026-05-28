"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check, RefreshCw, Ban, RotateCcw, ShieldAlert, Loader2 } from "lucide-react";

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
        <div className="rounded-xl border border-danger/30 p-4 text-sm" style={{ backgroundColor: "var(--color-danger-soft)" }}>
          <p className="font-semibold text-ink flex items-center gap-2">
            <ShieldAlert className="size-4 text-danger" strokeWidth={1.75} /> This key is revoked
          </p>
          <p className="text-muted mt-1 ml-6">
            All widget requests using this key are rejected. Reactivate it or rotate to issue a new one.
          </p>
        </div>
      )}

      {/* Key display — warm graphite */}
      <div className="rounded-xl p-6 border border-line" style={{ backgroundColor: "oklch(0.255 0.012 56)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/55 text-xs font-medium uppercase tracking-wide">Secret key</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setRevealed((v) => !v)} className="inline-flex items-center gap-1.5 text-white/75 hover:text-white text-xs font-medium px-2 py-1 rounded-md hover:bg-white/10 transition-colors">
              {revealed ? (<><EyeOff className="size-3.5" strokeWidth={1.75} /> Hide</>) : (<><Eye className="size-3.5" strokeWidth={1.75} /> Reveal</>)}
            </button>
            <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-white/75 hover:text-white text-xs font-medium px-2 py-1 rounded-md hover:bg-white/10 transition-colors">
              {copied ? (<><Check className="size-3.5" strokeWidth={2.25} /> Copied</>) : (<><Copy className="size-3.5" strokeWidth={1.75} /> Copy</>)}
            </button>
          </div>
        </div>
        <code className="text-sm font-mono break-all block" style={{ color: "oklch(0.86 0.10 70)" }}>
          {revealed ? state.apiKey : mask(state.apiKey)}
        </code>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/45">
          {state.apiKeyRotatedAt && <span>Rotated {new Date(state.apiKeyRotatedAt).toLocaleString()}</span>}
          {state.apiKeyRevokedAt && <span className="text-danger">Revoked {new Date(state.apiKeyRevokedAt).toLocaleString()}</span>}
        </div>
      </div>

      {canManage ? (
        <div className="panel overflow-hidden">
          <div className="panel-head">
            <div>
              <h2 className="font-semibold text-ink">Manage</h2>
              <p className="hint mt-0.5">Rotation invalidates the old key immediately. Update your embed after rotating.</p>
            </div>
          </div>
          <div className="panel-pad flex flex-wrap gap-3">
            {!confirmRotate ? (
              <button type="button" onClick={() => setConfirmRotate(true)} disabled={busy !== null} className="btn btn-primary">
                <RefreshCw className="size-4" strokeWidth={1.75} /> Rotate key
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-warning/40 px-3 py-2" style={{ backgroundColor: "var(--color-warning-soft)" }}>
                <span className="text-sm text-ink">Confirm rotate? Existing embeds will break.</span>
                <button type="button" onClick={() => action("rotate")} disabled={busy !== null} className="btn btn-primary btn-sm">
                  {busy === "rotate" ? (<><Loader2 className="size-3.5 animate-spin" /> Rotating…</>) : "Yes, rotate"}
                </button>
                <button type="button" onClick={() => setConfirmRotate(false)} className="btn btn-ghost btn-sm">Cancel</button>
              </div>
            )}

            {revoked ? (
              <button type="button" onClick={() => action("reactivate")} disabled={busy !== null} className="btn btn-secondary">
                {busy === "reactivate" ? (<><Loader2 className="size-4 animate-spin" /> Reactivating…</>) : (<><RotateCcw className="size-4" strokeWidth={1.75} /> Reactivate</>)}
              </button>
            ) : (
              <button type="button" onClick={() => action("revoke")} disabled={busy !== null} className="btn btn-secondary hover:!text-danger hover:!border-danger/40">
                {busy === "revoke" ? (<><Loader2 className="size-4 animate-spin" /> Revoking…</>) : (<><Ban className="size-4" strokeWidth={1.75} /> Revoke</>)}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-warning/30 p-4 text-sm text-muted flex items-center gap-2" style={{ backgroundColor: "var(--color-warning-soft)" }}>
          <ShieldAlert className="size-4 text-warning shrink-0" strokeWidth={1.75} />
          Only project owners and admins can rotate or revoke the API key.
        </div>
      )}
    </div>
  );
}

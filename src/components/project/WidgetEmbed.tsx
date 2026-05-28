"use client";

import { useState } from "react";
import { Copy, Check, FileCode2, ShieldAlert } from "lucide-react";

interface Config {
  primaryColor: string;
  botName: string;
  welcomeMessage: string;
  placeholder: string;
  position: string;
  widgetWidth: number;
  widgetHeight: number;
}

interface Props {
  project: {
    id: string;
    name: string;
    apiKey: string;
    config: Config | null;
  };
}

export function WidgetEmbed({ project }: Props) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const snippet = `<!-- BotForge Widget: ${project.name} -->
<script>
  window.BotForgeConfig = {
    apiKey: "${project.apiKey}",
    apiUrl: "${baseUrl}/api/chat",
  };
</script>
<script src="${baseUrl}/widget/botforge.js" defer></script>
<link rel="stylesheet" href="${baseUrl}/widget/botforge.css" />`;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Snippet — warm graphite, belongs to the palette */}
      <div className="rounded-xl overflow-hidden border border-line" style={{ backgroundColor: "oklch(0.255 0.012 56)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <span className="text-white/55 text-xs font-medium uppercase tracking-wide">HTML embed snippet</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {copied ? (<><Check className="size-3.5" strokeWidth={2.25} /> Copied</>) : (<><Copy className="size-3.5" strokeWidth={1.75} /> Copy</>)}
          </button>
        </div>
        <pre className="p-5 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre" style={{ color: "oklch(0.86 0.10 70)" }}>
          {snippet}
        </pre>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="panel overflow-hidden">
          <div className="panel-head"><h2 className="font-semibold text-ink">Widget files</h2></div>
          <ul className="divide-y divide-line">
            {[
              { file: "botforge.js", tag: "JS", desc: "Widget runtime — chat UI and API calls" },
              { file: "botforge.css", tag: "CSS", desc: "Scoped styles — won't affect your site" },
            ].map((f) => (
              <li key={f.file} className="flex items-start gap-3 px-5 py-4">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-sunk text-muted shrink-0">
                  <FileCode2 className="size-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink font-mono">{f.file}</p>
                  <p className="text-xs text-muted mt-0.5">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel overflow-hidden">
          <div className="panel-head"><h2 className="font-semibold text-ink">Widget config</h2></div>
          <dl className="px-5 py-4 space-y-3 text-sm">
            {[
              { k: "Bot name", v: project.config?.botName || "Assistant" },
              { k: "Position", v: project.config?.position || "bottom-right" },
              { k: "Welcome", v: project.config?.welcomeMessage || "Hi! How can I help?" },
            ].map(({ k, v }) => (
              <div key={k} className="flex gap-3">
                <dt className="text-faint w-24 shrink-0">{k}</dt>
                <dd className="text-ink font-medium truncate">{v}</dd>
              </div>
            ))}
            <div className="flex gap-3 items-center">
              <dt className="text-faint w-24 shrink-0">Primary</dt>
              <dd className="flex items-center gap-2">
                <span className="size-4 rounded border border-line" style={{ backgroundColor: project.config?.primaryColor || "var(--color-ember)" }} />
                <span className="text-ink font-mono text-xs">{project.config?.primaryColor || "#6366f1"}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* API key warning */}
      <div className="rounded-xl border border-warning/30 p-5" style={{ backgroundColor: "var(--color-warning-soft)" }}>
        <div className="flex items-start gap-3">
          <ShieldAlert className="size-5 text-warning shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <h3 className="font-semibold text-ink mb-1">Keep your API key safe</h3>
            <p className="text-muted text-sm leading-relaxed">
              Your API key <code className="kbd">{project.apiKey.slice(0, 12)}…</code> is embedded in the widget.
              Only use it on trusted sites. Rotate it from the API Key page if it&apos;s ever compromised.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

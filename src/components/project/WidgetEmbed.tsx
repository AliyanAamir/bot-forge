"use client";

import { useState } from "react";

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
      {/* Snippet */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
          <span className="text-slate-400 text-sm font-medium">HTML embed snippet</span>
          <button
            onClick={handleCopy}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <pre className="p-5 text-sm text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre">
          {snippet}
        </pre>
      </div>

      {/* Widget details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Widget files</h2>
          <ul className="space-y-3">
            {[
              { file: "botforge.js", desc: "Widget runtime — handles chat UI and API calls" },
              { file: "botforge.css", desc: "Widget styles — scoped, won't affect your site" },
            ].map((f) => (
              <li key={f.file} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-slate-600">{f.file.endsWith(".js") ? "JS" : "CSS"}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 font-mono">{f.file}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Widget config</h2>
          <dl className="space-y-2 text-sm">
            {[
              { k: "Bot name", v: project.config?.botName || "Assistant" },
              { k: "Position", v: project.config?.position || "bottom-right" },
              { k: "Primary color", v: project.config?.primaryColor || "#6366f1" },
              { k: "Welcome", v: project.config?.welcomeMessage || "Hi! How can I help?" },
            ].map(({ k, v }) => (
              <div key={k} className="flex gap-2">
                <dt className="text-slate-500 w-28 shrink-0">{k}</dt>
                <dd className="text-slate-800 font-medium truncate">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* API key */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">Keep your API key safe</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              Your API key <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-xs">{project.apiKey.slice(0, 12)}...</code> is
              embedded in the widget. Only use it on trusted websites. You can rotate it from the project
              settings if it&apos;s ever compromised.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

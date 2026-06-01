"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconPicker } from "./IconPicker";
import type { BotIconKey } from "@/lib/bot-icons";
import { Palette, SlidersHorizontal, UserPlus, Check, Loader2, ShieldCheck } from "lucide-react";

interface ProjectConfig {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  botName: string;
  welcomeMessage: string;
  placeholder: string;
  position: string;
  iconKey: string;
  systemPrompt: string;
  groqModel: string;
  temperature: number;
  maxTokens: number;
  widgetWidth: number;
  widgetHeight: number;
  showBranding: boolean;
  leadCaptureEnabled: boolean;
  leadCaptureAfterMessages: number;
  leadCapturePrompt: string;
  allowedDomains: string | null;
}

interface Props {
  projectId: string;
  config: ProjectConfig | null;
  models: { id: string; label: string }[];
}

const POSITIONS = ["bottom-right", "bottom-left", "top-right", "top-left"];

export function ConfigForm({ projectId, config, models }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectConfig>({
    primaryColor: config?.primaryColor ?? "#6366f1",
    secondaryColor: config?.secondaryColor ?? "#f1f5f9",
    textColor: config?.textColor ?? "#1e293b",
    botName: config?.botName ?? "Assistant",
    welcomeMessage: config?.welcomeMessage ?? "Hi! How can I help you today?",
    placeholder: config?.placeholder ?? "Type a message...",
    position: config?.position ?? "bottom-right",
    iconKey: config?.iconKey ?? "bot",
    systemPrompt: config?.systemPrompt ?? "You are a helpful assistant.",
    groqModel: config?.groqModel ?? models[0]?.id ?? "",
    temperature: config?.temperature ?? 0.7,
    maxTokens: config?.maxTokens ?? 1024,
    widgetWidth: config?.widgetWidth ?? 380,
    widgetHeight: config?.widgetHeight ?? 560,
    showBranding: config?.showBranding ?? true,
    leadCaptureEnabled: config?.leadCaptureEnabled ?? false,
    leadCaptureAfterMessages: config?.leadCaptureAfterMessages ?? 3,
    leadCapturePrompt:
      config?.leadCapturePrompt ??
      "After helping the visitor, politely ask for their name, email, and phone number so a team member can follow up.",
    allowedDomains: (config?.allowedDomains ?? "").split(",").map((s) => s.trim()).filter(Boolean).join("\n"),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }


  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      allowedDomains: form.allowedDomains
        ? form.allowedDomains.split("\n").map((s) => s.trim()).filter(Boolean).join(",")
        : null,
    };

    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: payload }),
    });

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-4">
      {/* Appearance */}
      <section className="panel overflow-hidden">
        <div className="panel-head">
          <h2 className="flex items-center gap-2.5 font-semibold text-ink">
            <Palette className="size-4 text-ember" strokeWidth={1.75} />
            Appearance
          </h2>
        </div>
        <div className="panel-pad grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="cfg-botname" className="label">Bot name</label>
            <input
              id="cfg-botname"
              type="text"
              value={form.botName}
              onChange={(e) => set("botName", e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="cfg-pos" className="label">Widget position</label>
            <select
              id="cfg-pos"
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              className="select"
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Primary color</label>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="h-10 w-14 shrink-0"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="input font-mono"
              />
            </div>
          </div>
          <div>
            <label className="label">Text color</label>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={form.textColor}
                onChange={(e) => set("textColor", e.target.value)}
                className="h-10 w-14 shrink-0"
              />
              <input
                type="text"
                value={form.textColor}
                onChange={(e) => set("textColor", e.target.value)}
                className="input font-mono"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label mb-1">Bot icon</label>
            <p className="hint mb-3">Shown on the floating chat button. Tinted with your primary color.</p>
            <IconPicker
              value={form.iconKey}
              color={form.primaryColor}
              onChange={(k: BotIconKey) => set("iconKey", k)}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cfg-welcome" className="label">Welcome message</label>
            <input
              id="cfg-welcome"
              type="text"
              value={form.welcomeMessage}
              onChange={(e) => set("welcomeMessage", e.target.value)}
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cfg-placeholder" className="label">Input placeholder</label>
            <input
              id="cfg-placeholder"
              type="text"
              value={form.placeholder}
              onChange={(e) => set("placeholder", e.target.value)}
              className="input"
            />
          </div>
        </div>
      </section>

      {/* Behavior */}
      <section className="panel overflow-hidden">
        <div className="panel-head">
          <h2 className="flex items-center gap-2.5 font-semibold text-ink">
            <SlidersHorizontal className="size-4 text-ember" strokeWidth={1.75} />
            Behavior &amp; model
          </h2>
        </div>
        <div className="panel-pad grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="cfg-model" className="label">Groq model</label>
            <select
              id="cfg-model"
              value={form.groqModel}
              onChange={(e) => set("groqModel", e.target.value)}
              className="select"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label flex items-center justify-between">
              <span>Temperature</span>
              <span className="kbd">{form.temperature}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={form.temperature}
              onChange={(e) => set("temperature", parseFloat(e.target.value))}
              className="w-full mt-1.5"
            />
            <div className="flex justify-between text-xs text-faint mt-1.5">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
          <div>
            <label className="label flex items-center justify-between">
              <span>Max tokens</span>
              <span className="kbd">{form.maxTokens}</span>
            </label>
            <input
              type="range"
              min="256"
              max="4096"
              step="128"
              value={form.maxTokens}
              onChange={(e) => set("maxTokens", parseInt(e.target.value))}
              className="w-full mt-1.5"
            />
          </div>
          <label htmlFor="branding" className="flex items-center gap-3 self-end pb-2.5 cursor-pointer">
            <input
              type="checkbox"
              id="branding"
              checked={form.showBranding}
              onChange={(e) => set("showBranding", e.target.checked)}
              className="size-4"
            />
            <span className="text-sm font-medium text-ink">Show &ldquo;Powered by BotForge&rdquo;</span>
          </label>
          <div className="sm:col-span-2">
            <label htmlFor="cfg-prompt" className="label">System prompt</label>
            <textarea
              id="cfg-prompt"
              value={form.systemPrompt}
              onChange={(e) => set("systemPrompt", e.target.value)}
              rows={4}
              className="textarea font-mono text-[0.8125rem]"
            />
          </div>
        </div>
      </section>

      {/* Lead capture */}
      <section className="panel overflow-hidden">
        <div className="panel-head">
          <div>
            <h2 className="flex items-center gap-2.5 font-semibold text-ink">
              <UserPlus className="size-4 text-ember" strokeWidth={1.75} />
              Lead capture
            </h2>
            <p className="hint mt-1">Let the bot ask for email + phone after solving a query.</p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={form.leadCaptureEnabled}
              onChange={(e) => set("leadCaptureEnabled", e.target.checked)}
              className="size-4"
            />
            <span className="text-sm font-medium text-ink">Enabled</span>
          </label>
        </div>
        <div className="panel-pad grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label flex items-center justify-between">
              <span>Ask after (user messages)</span>
              <span className="kbd">{form.leadCaptureAfterMessages}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={form.leadCaptureAfterMessages}
              onChange={(e) => set("leadCaptureAfterMessages", parseInt(e.target.value))}
              className="w-full mt-1.5"
              disabled={!form.leadCaptureEnabled}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cfg-capture" className="label">Capture prompt</label>
            <textarea
              id="cfg-capture"
              value={form.leadCapturePrompt}
              onChange={(e) => set("leadCapturePrompt", e.target.value)}
              rows={3}
              disabled={!form.leadCaptureEnabled}
              className="textarea"
            />
          </div>
        </div>
      </section>

      {/* Embed & Security */}
      <section className="panel overflow-hidden">
        <div className="panel-head">
          <div>
            <h2 className="flex items-center gap-2.5 font-semibold text-ink">
              <ShieldCheck className="size-4 text-ember" strokeWidth={1.75} />
              Embed &amp; Security
            </h2>
            <p className="hint mt-1">Restrict which domains can load this widget. Leave blank to allow all origins.</p>
          </div>
        </div>
        <div className="panel-pad space-y-4">
          <div>
            <label htmlFor="cfg-domains" className="label">Allowed origins</label>
            <textarea
              id="cfg-domains"
              value={form.allowedDomains ?? ""}
              onChange={(e) => set("allowedDomains", e.target.value)}
              rows={3}
              className="textarea font-mono text-[0.8125rem]"
              placeholder={"https://example.com\nhttps://www.example.com"}
            />
            <p className="hint mt-1.5">
              One origin per line or comma-separated. Must include scheme and host —
              e.g. <span className="font-mono text-ink">https://example.com</span>.
              No trailing slashes.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 -mx-1 flex items-center gap-4 rounded-xl border border-line bg-paper/85 backdrop-blur-md px-4 py-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save changes"
          )}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-success text-sm font-medium">
            <Check className="size-4" strokeWidth={2.25} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}

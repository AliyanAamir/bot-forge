"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconPicker } from "./IconPicker";
import type { BotIconKey } from "@/lib/bot-icons";

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

    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: form }),
    });

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Appearance */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-800 mb-5">Appearance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bot Name</label>
            <input
              type="text"
              value={form.botName}
              onChange={(e) => set("botName", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Widget Position</label>
            <select
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="h-10 w-16 border border-slate-300 rounded-lg cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Text Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.textColor}
                onChange={(e) => set("textColor", e.target.value)}
                className="h-10 w-16 border border-slate-300 rounded-lg cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={form.textColor}
                onChange={(e) => set("textColor", e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Bot Icon</label>
            <p className="text-xs text-slate-500 mb-3">Shown on the floating chat button. Tinted with your primary color.</p>
            <IconPicker
              value={form.iconKey}
              color={form.primaryColor}
              onChange={(k: BotIconKey) => set("iconKey", k)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Welcome Message</label>
            <input
              type="text"
              value={form.welcomeMessage}
              onChange={(e) => set("welcomeMessage", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Input Placeholder</label>
            <input
              type="text"
              value={form.placeholder}
              onChange={(e) => set("placeholder", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Behavior */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-800 mb-5">Behavior & Model</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Groq Model</label>
            <select
              value={form.groqModel}
              onChange={(e) => set("groqModel", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Temperature: <span className="font-mono text-indigo-600">{form.temperature}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={form.temperature}
              onChange={(e) => set("temperature", parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Max Tokens: <span className="font-mono text-indigo-600">{form.maxTokens}</span>
            </label>
            <input
              type="range"
              min="256"
              max="4096"
              step="128"
              value={form.maxTokens}
              onChange={(e) => set("maxTokens", parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="branding"
              checked={form.showBranding}
              onChange={(e) => set("showBranding", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="branding" className="text-sm font-medium text-slate-700">
              Show &ldquo;Powered by BotForge&rdquo;
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">System Prompt</label>
            <textarea
              value={form.systemPrompt}
              onChange={(e) => set("systemPrompt", e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
            />
          </div>
        </div>
      </section>

      {/* Lead capture */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-800">Lead Capture</h2>
            <p className="text-xs text-slate-500 mt-1">Let the bot ask for email + phone after solving a query.</p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.leadCaptureEnabled}
              onChange={(e) => set("leadCaptureEnabled", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm font-medium text-slate-700">Enabled</span>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Ask after (user messages): <span className="font-mono text-indigo-600">{form.leadCaptureAfterMessages}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={form.leadCaptureAfterMessages}
              onChange={(e) => set("leadCaptureAfterMessages", parseInt(e.target.value))}
              className="w-full"
              disabled={!form.leadCaptureEnabled}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Capture Prompt</label>
            <textarea
              value={form.leadCapturePrompt}
              onChange={(e) => set("leadCapturePrompt", e.target.value)}
              rows={3}
              disabled={!form.leadCaptureEnabled}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
      </div>
    </form>
  );
}

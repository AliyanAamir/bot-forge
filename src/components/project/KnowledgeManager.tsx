"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface Doc {
  id: string;
  title: string;
  content: string;
  source: string | null;
  type: string;
  createdAt: string;
}

interface Props {
  projectId: string;
  initialDocs: Doc[];
}

export function KnowledgeManager({ projectId, initialDocs }: Props) {
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [type, setType] = useState("text");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/knowledge/${projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, source, type }),
    });

    if (res.ok) {
      const doc = await res.json();
      setDocs((prev) => [{ ...doc, createdAt: doc.createdAt }, ...prev]);
      setTitle("");
      setContent("");
      setSource("");
      setType("text");
      setShowForm(false);
    }

    setSaving(false);
    router.refresh();
  }

  async function handleDelete(docId: string) {
    setDeletingId(docId);

    await fetch(`/api/knowledge/${projectId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId }),
    });

    setDocs((prev) => prev.filter((d) => d.id !== docId));
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      {showForm ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-5">Add knowledge entry</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Product FAQ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {["text", "faq", "policy", "guide"].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Source URL</label>
              <input
                type="url"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/page (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
                placeholder="Paste your content here — docs, FAQs, policies..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add to knowledge base"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
        >
          <div className="text-3xl mb-2">+</div>
          <p className="text-slate-600 font-medium group-hover:text-indigo-600">Add knowledge entry</p>
          <p className="text-slate-400 text-sm mt-1">Text, FAQs, policies, guides</p>
        </button>
      )}

      {/* Doc list */}
      {docs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">No documents yet. Add your first knowledge entry above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 font-medium text-xs">
                {doc.type.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-800 truncate">{doc.title}</h3>
                <p className="text-slate-500 text-sm mt-0.5 line-clamp-2">{doc.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>{formatDate(doc.createdAt)}</span>
                  <span>{doc.content.length} chars</span>
                  {doc.source && <span className="truncate max-w-[200px]">{doc.source}</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                className="shrink-0 text-slate-400 hover:text-red-500 transition-colors text-sm disabled:opacity-50"
              >
                {deletingId === doc.id ? "..." : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

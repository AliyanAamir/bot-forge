"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, FileText, Loader2, Inbox, ExternalLink } from "lucide-react";

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

const TYPES = ["text", "faq", "policy", "guide"];

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
      {/* Add form / trigger */}
      {showForm ? (
        <section className="panel overflow-hidden">
          <div className="panel-head">
            <h2 className="font-semibold text-ink">Add knowledge entry</h2>
          </div>
          <form onSubmit={handleAdd} className="panel-pad space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="kb-title" className="label">Title <span className="text-ember">*</span></label>
                <input id="kb-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="input" placeholder="Product FAQ" />
              </div>
              <div>
                <label htmlFor="kb-type" className="label">Type</label>
                <select id="kb-type" value={type} onChange={(e) => setType(e.target.value)} className="select">
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="kb-source" className="label">Source URL</label>
              <input id="kb-source" type="url" value={source} onChange={(e) => setSource(e.target.value)} className="input" placeholder="https://example.com/page (optional)" />
            </div>
            <div>
              <label htmlFor="kb-content" className="label">Content <span className="text-ember">*</span></label>
              <textarea id="kb-content" value={content} onChange={(e) => setContent(e.target.value)} required rows={8} className="textarea font-mono text-[0.8125rem]" placeholder="Paste your content here — docs, FAQs, policies..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? (<><Loader2 className="size-4 animate-spin" /> Saving...</>) : "Add to knowledge base"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="group w-full rounded-xl border border-dashed border-line-strong bg-surface/50 px-6 py-7 text-center transition-colors hover:border-ember hover:bg-ember-soft/40 outline-none focus-visible:border-ember"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-sunk text-muted mb-2 transition-colors group-hover:bg-ember-soft group-hover:text-ember-strong">
            <Plus className="size-5" strokeWidth={2} />
          </span>
          <p className="text-ink font-medium">Add knowledge entry</p>
          <p className="text-faint text-sm mt-0.5">Text, FAQs, policies, guides</p>
        </button>
      )}

      {/* Doc list */}
      {docs.length === 0 ? (
        <div className="panel flex flex-col items-center text-center px-6 py-14">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sunk text-faint mb-3">
            <Inbox className="size-6" strokeWidth={1.5} />
          </span>
          <p className="text-ink font-medium text-sm">No documents yet</p>
          <p className="text-muted text-sm mt-1">Add your first knowledge entry above.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line overflow-hidden">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-start gap-4 px-5 py-4">
              <span className="shrink-0 inline-flex size-9 items-center justify-center rounded-lg bg-ember-soft text-ember-strong">
                <FileText className="size-4" strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-ink truncate">{doc.title}</h3>
                  <span className="badge badge-neutral capitalize shrink-0">{doc.type}</span>
                </div>
                <p className="text-muted text-sm mt-1 line-clamp-2">{doc.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-faint">
                  <span>{formatDate(doc.createdAt)}</span>
                  <span>{doc.content.length} chars</span>
                  {doc.source && (
                    <a href={doc.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ember-strong hover:underline max-w-[220px] truncate">
                      <ExternalLink className="size-3 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{doc.source}</span>
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                className="btn btn-ghost btn-icon shrink-0 hover:text-danger"
                aria-label="Delete entry"
              >
                {deletingId === doc.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" strokeWidth={1.75} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useKnowledge, useAddKnowledge, useDeleteKnowledge, PAGE_SIZE } from "@/lib/api/hooks";
import { qk } from "@/lib/api/keys";
import { apiGet, listQuery } from "@/lib/api/client";
import type { Paginated, KnowledgeListItem } from "@/lib/api/types";
import { usePageParam, ClientPager } from "@/components/ui/ClientPager";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { QueryError } from "@/components/ui/QueryState";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, FileText, Loader2, Inbox, ExternalLink } from "lucide-react";

const TYPES = ["text", "faq", "policy", "guide"];

export function KnowledgeManager({ projectId }: { projectId: string }) {
  const page = usePageParam();
  const qc = useQueryClient();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useKnowledge(projectId, page);
  const addDoc = useAddKnowledge(projectId);
  const deleteDoc = useDeleteKnowledge(projectId, page);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [type, setType] = useState("text");

  const totalPages = data?.totalPages ?? 1;
  useEffect(() => {
    if (page < totalPages) {
      qc.prefetchQuery({
        queryKey: qk.knowledge(projectId, page + 1),
        queryFn: () =>
          apiGet<Paginated<KnowledgeListItem>>(
            `/api/knowledge/${projectId}${listQuery({ page: page + 1, pageSize: PAGE_SIZE })}`,
          ),
      });
    }
  }, [page, totalPages, projectId, qc]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    addDoc.mutate(
      { title, content, source, type },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setSource("");
          setType("text");
          setShowForm(false);
        },
      },
    );
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
            {addDoc.isError && (
              <div className="badge-danger rounded-lg border px-4 py-3 text-sm font-medium w-full block">
                {addDoc.error.message}
              </div>
            )}
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
              <button type="submit" disabled={addDoc.isPending} className="btn btn-primary">
                {addDoc.isPending ? (<><Loader2 className="size-4 animate-spin" /> Saving...</>) : "Add to knowledge base"}
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
      {isPending ? (
        <ListSkeleton rows={5} />
      ) : isError ? (
        <QueryError message={error.message} onRetry={() => refetch()} />
      ) : data.total === 0 ? (
        <div className="panel flex flex-col items-center text-center px-6 py-14">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sunk text-faint mb-3">
            <Inbox className="size-6" strokeWidth={1.5} />
          </span>
          <p className="text-ink font-medium text-sm">No documents yet</p>
          <p className="text-muted text-sm mt-1">Add your first knowledge entry above.</p>
        </div>
      ) : (
        <>
          <div className={`panel divide-y divide-line overflow-hidden ${isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}`}>
            {data.data.map((doc) => {
              const deleting = deleteDoc.isPending && deleteDoc.variables === doc.id;
              return (
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
                    onClick={() => deleteDoc.mutate(doc.id)}
                    disabled={deleting}
                    className="btn btn-ghost btn-icon shrink-0 hover:text-danger"
                    aria-label="Delete entry"
                  >
                    {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" strokeWidth={1.75} />}
                  </button>
                </div>
              );
            })}
          </div>

          <ClientPager
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={data.pageSize}
            basePath={`/projects/${projectId}/knowledge`}
            noun="documents"
            busy={isPlaceholderData}
          />
        </>
      )}
    </div>
  );
}

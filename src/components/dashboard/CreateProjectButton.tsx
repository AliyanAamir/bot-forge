"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateProject } from "@/lib/api/hooks";
import { Plus, X, Loader2 } from "lucide-react";

export function CreateProjectButton() {
  const router = useRouter();
  const create = useCreateProject();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      { name, description },
      {
        onSuccess: (data) => {
          setOpen(false);
          setName("");
          setDescription("");
          router.push(`/projects/${data.id}`);
        },
      },
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary">
        <Plus className="size-4" strokeWidth={2.25} />
        New project
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ink/35 backdrop-blur-[2px] animate-[fadeIn_120ms_ease-out]" />
          <div
            className="relative panel w-full max-w-md shadow-[0_12px_40px_oklch(0.3_0.04_60/0.18)] animate-[popIn_160ms_cubic-bezier(0.22,1,0.36,1)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
          >
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <h2 id="create-title" className="text-lg font-semibold tracking-tight text-ink">New project</h2>
                <p className="text-muted text-sm mt-0.5">Set up a new chatbot for your site.</p>
              </div>
              <button onClick={() => setOpen(false)} className="btn btn-ghost btn-icon -mr-2 -mt-1" aria-label="Close">
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 pb-6 pt-5 space-y-4">
              {create.isError && (
                <div className="badge-danger rounded-lg border px-4 py-3 text-sm font-medium w-full block">
                  {create.error.message}
                </div>
              )}
              <div>
                <label htmlFor="proj-name" className="label">
                  Project name <span className="text-ember">*</span>
                </label>
                <input
                  id="proj-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="input"
                  placeholder="My Website Bot"
                />
              </div>
              <div>
                <label htmlFor="proj-desc" className="label">Description</label>
                <textarea
                  id="proj-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="textarea"
                  placeholder="What is this chatbot for?"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={create.isPending || !name.trim()} className="btn btn-primary flex-1">
                  {create.isPending ? (<><Loader2 className="size-4 animate-spin" /> Creating...</>) : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

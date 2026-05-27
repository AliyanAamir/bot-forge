import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { KnowledgeManager } from "@/components/project/KnowledgeManager";
import { formatDate } from "@/lib/utils";

export default async function KnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const project = await db.project.findFirst({
    where: { id, OR: [{ userId: session!.user.id }, { members: { some: { userId: session!.user.id } } }] },
  });

  if (!project) notFound();

  const docs = await db.knowledgeDoc.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Link href={`/projects/${id}`} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-6">
        ← Back to {project.name}
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Knowledge Base</h1>
          <p className="text-slate-500 text-sm mt-1">
            Add documents, FAQs, or content to train your chatbot.
          </p>
        </div>
      </div>
      <KnowledgeManager projectId={id} initialDocs={docs.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))} />
    </div>
  );
}

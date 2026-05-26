import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ConfigForm } from "@/components/project/ConfigForm";
import { AVAILABLE_MODELS } from "@/lib/groq";

export default async function ConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const project = await db.project.findFirst({
    where: { id, userId: session!.user.id },
    include: { config: true },
  });

  if (!project) notFound();

  return (
    <div>
      <Link href={`/projects/${id}`} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-6">
        ← Back to {project.name}
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Configuration</h1>
        <p className="text-slate-500 text-sm mt-1">Customize your chatbot's appearance and behavior.</p>
      </div>
      <ConfigForm projectId={id} config={project.config} models={AVAILABLE_MODELS as unknown as { id: string; label: string }[]} />
    </div>
  );
}

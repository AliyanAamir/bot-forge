import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ConfigForm } from "@/components/project/ConfigForm";
import { PageHeader } from "@/components/project/PageHeader";
import { AVAILABLE_MODELS } from "@/lib/groq";

export default async function ConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const project = await db.project.findFirst({
    where: { id, OR: [{ userId: session!.user.id }, { members: { some: { userId: session!.user.id } } }] },
    include: { config: true },
  });

  if (!project) notFound();

  return (
    <div>
      <PageHeader
        title="Configuration"
        subtitle="Shape your chatbot's appearance and behavior."
      />
      <ConfigForm projectId={id} config={project.config} models={AVAILABLE_MODELS as unknown as { id: string; label: string }[]} />
    </div>
  );
}

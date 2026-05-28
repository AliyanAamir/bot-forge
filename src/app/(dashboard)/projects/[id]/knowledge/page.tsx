import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { hasProjectAccess } from "@/lib/project-access";
import { KnowledgeManager } from "@/components/project/KnowledgeManager";
import { PageHeader } from "@/components/project/PageHeader";

export default async function KnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const access = await hasProjectAccess(id, session!.user.id);
  if (!access) notFound();

  return (
    <div>
      <PageHeader
        title="Knowledge base"
        subtitle="The material your bot answers from. Add docs, FAQs, policies, and guides."
      />
      <KnowledgeManager projectId={id} />
    </div>
  );
}

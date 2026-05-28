import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { hasProjectAccess } from "@/lib/project-access";
import { ConversationsList } from "@/components/project/ConversationsList";
import { PageHeader } from "@/components/project/PageHeader";

export default async function ConversationsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const access = await hasProjectAccess(id, session!.user.id);
  if (!access) notFound();

  return (
    <div>
      <PageHeader title="Conversations" subtitle="Every chat session with your bot." />
      <ConversationsList projectId={id} />
    </div>
  );
}

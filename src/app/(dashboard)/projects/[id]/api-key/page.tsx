import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { hasProjectAccess, getProjectRole } from "@/lib/project-access";
import { ApiKeyManager } from "@/components/project/ApiKeyManager";
import { PageHeader } from "@/components/project/PageHeader";

export default async function ApiKeyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const access = await hasProjectAccess(id, session!.user.id);
  if (!access) notFound();

  const project = await db.project.findUnique({
    where: { id },
    select: { apiKey: true, apiKeyRotatedAt: true, apiKeyRevokedAt: true },
  });
  if (!project) notFound();

  const role = await getProjectRole(id, session!.user.id);
  const canManage = role === "owner" || role === "admin";

  return (
    <div>
      <PageHeader
        title="API key"
        subtitle="Authenticates your embed snippet with the chatbot API."
      />
      <ApiKeyManager
        projectId={id}
        canManage={canManage}
        initial={{
          apiKey: project.apiKey,
          apiKeyRotatedAt: project.apiKeyRotatedAt?.toISOString() ?? null,
          apiKeyRevokedAt: project.apiKeyRevokedAt?.toISOString() ?? null,
        }}
      />
    </div>
  );
}

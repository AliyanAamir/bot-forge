import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { hasProjectAccess, getProjectRole } from "@/lib/project-access";
import { ApiKeyManager } from "@/components/project/ApiKeyManager";

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
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">API Key</h1>
        <p className="text-slate-500 text-sm mt-1">
          Used by your embed snippet to authenticate the chatbot widget.
        </p>
      </header>

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

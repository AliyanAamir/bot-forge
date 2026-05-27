import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { WidgetEmbed } from "@/components/project/WidgetEmbed";

export default async function WidgetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const project = await db.project.findFirst({
    where: { id, OR: [{ userId: session!.user.id }, { members: { some: { userId: session!.user.id } } }] },
    include: { config: true },
  });

  if (!project) notFound();

  return (
    <div>
      <Link href={`/projects/${id}`} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-6">
        ← Back to {project.name}
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Widget & Embed</h1>
        <p className="text-slate-500 text-sm mt-1">
          Copy the snippet below and paste it before the closing &lt;/body&gt; tag on any website.
        </p>
      </div>
      <WidgetEmbed project={{ id: project.id, name: project.name, apiKey: project.apiKey, config: project.config }} />
    </div>
  );
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { WidgetEmbed } from "@/components/project/WidgetEmbed";
import { PageHeader } from "@/components/project/PageHeader";

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
      <PageHeader
        title="Widget & embed"
        subtitle="Copy the snippet and paste it before the closing </body> tag on any site."
      />
      <WidgetEmbed project={{ id: project.id, name: project.name, apiKey: project.apiKey, config: project.config }} />
    </div>
  );
}

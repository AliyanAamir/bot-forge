import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProjectSidebar } from "@/components/project/ProjectSidebar";
import { hasProjectAccess } from "@/lib/project-access";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const project = await hasProjectAccess(id, session!.user.id);
  if (!project) notFound();

  const cfg = await db.projectConfig.findUnique({ where: { projectId: id } });

  return (
    <div className="flex gap-8">
      <ProjectSidebar
        projectId={id}
        projectName={project.name}
        projectInitial={project.name[0].toUpperCase()}
        projectColor={cfg?.primaryColor ?? "#6366f1"}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

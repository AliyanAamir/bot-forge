import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { hasProjectAccess } from "@/lib/project-access";
import { LeadsTable } from "@/components/project/LeadsTable";
import { PageHeader } from "@/components/project/PageHeader";

export default async function LeadsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  // Server-side access gate; data is fetched client-side via TanStack Query.
  const access = await hasProjectAccess(id, session!.user.id);
  if (!access) notFound();

  return (
    <div>
      <PageHeader title="Leads" subtitle="Visitors who shared their contact info with the bot." />
      <LeadsTable projectId={id} />
    </div>
  );
}

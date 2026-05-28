import { ProjectsList } from "@/components/dashboard/ProjectsList";

// Auth is enforced by the (dashboard) layout. Data is fetched client-side
// via TanStack Query so the list paginates, caches, and shows loading state.
export default function DashboardPage() {
  return <ProjectsList />;
}

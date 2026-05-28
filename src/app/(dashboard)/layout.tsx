import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Wordmark } from "@/components/brand/Logo";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ember/35">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-sm text-muted">
              <span className="size-1.5 rounded-full bg-success" />
              {session.user.email}
            </span>
            <span className="h-5 w-px bg-line hidden sm:block" />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-9">{children}</main>
    </div>
  );
}

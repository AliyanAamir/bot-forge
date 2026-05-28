"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="btn btn-ghost btn-sm"
      title="Sign out"
    >
      <LogOut className="size-4" strokeWidth={1.75} />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}

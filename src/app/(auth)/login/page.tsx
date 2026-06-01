"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <LogoMark className="size-12 rounded-xl mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
          <p className="text-muted mt-1.5 text-sm">Sign in to your BotForge workshop</p>
        </div>

        <div className="panel panel-pad shadow-[0_1px_3px_oklch(0.4_0.03_60/0.06)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="badge-danger rounded-lg border px-4 py-3 text-sm font-medium w-full block">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="label !mb-0">Password</label>
                <Link href="/forgot-password" className="text-xs text-ember-strong hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-1">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="size-4" strokeWidth={2} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-faint mt-6 leading-relaxed">
          Access is invite-only. Ask your team admin for an invitation.
        </p>
      </div>
    </div>
  );
}

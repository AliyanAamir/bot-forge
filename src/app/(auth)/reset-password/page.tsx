"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Loader2, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-3 py-2">
        <p className="text-sm font-medium text-danger">Invalid reset link</p>
        <Link href="/forgot-password" className="text-sm text-ember-strong hover:underline">
          Request a new one
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-2 py-2">
        <p className="text-sm font-medium text-success">Password updated!</p>
        <p className="text-xs text-faint">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="badge-danger rounded-lg border px-4 py-3 text-sm font-medium w-full block">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="password" className="label">New password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="input"
          placeholder="Min 8 characters"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="label">Confirm password</label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="input"
          placeholder="••••••••"
        />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary w-full mt-1">
        {loading ? (
          <><Loader2 className="size-4 animate-spin" /> Saving…</>
        ) : (
          <>Set new password <ArrowRight className="size-4" strokeWidth={2} /></>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <LogoMark className="size-12 rounded-xl mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Set new password</h1>
          <p className="text-muted mt-1.5 text-sm">Choose a strong password for your account</p>
        </div>

        <div className="panel panel-pad shadow-[0_1px_3px_oklch(0.4_0.03_60/0.06)]">
          <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-sunk" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-faint mt-6">
          <Link href="/login" className="text-ember-strong hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

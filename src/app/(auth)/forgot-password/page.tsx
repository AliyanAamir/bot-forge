"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Loader2, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError("Too many requests. Please wait a few minutes and try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <LogoMark className="size-12 rounded-xl mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Forgot password?</h1>
          <p className="text-muted mt-1.5 text-sm">We&apos;ll send a reset link to your email</p>
        </div>

        <div className="panel panel-pad shadow-[0_1px_3px_oklch(0.4_0.03_60/0.06)]">
          {sent ? (
            <div className="text-center space-y-2 py-2">
              <p className="text-sm font-medium text-ink">Check your inbox</p>
              <p className="text-sm text-muted">
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
              </p>
            </div>
          ) : (
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
              <button type="submit" disabled={loading} className="btn btn-primary w-full mt-1">
                {loading ? (
                  <><Loader2 className="size-4 animate-spin" /> Sending…</>
                ) : (
                  <>Send reset link <ArrowRight className="size-4" strokeWidth={2} /></>
                )}
              </button>
            </form>
          )}
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

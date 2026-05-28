"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  token: string;
  email: string;
  isNewUser: boolean;
}

export function AcceptInviteForm({ token, email, isNewUser }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isNewUser) {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to accept invite");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const signed = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signed?.error) {
        setError("Account created but sign-in failed. Please sign in manually.");
        setLoading(false);
        return;
      }
      router.push(`/projects/${data.projectId}`);
    } else {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/invites/${token}`)}`);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="badge-danger rounded-lg border px-4 py-3 text-sm font-medium w-full block">{error}</div>
      )}
      <div>
        <label className="label">Email</label>
        <input type="email" value={email} disabled className="input" />
      </div>
      {isNewUser ? (
        <>
          <div>
            <label htmlFor="inv-name" className="label">Your name</label>
            <input
              id="inv-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="inv-pass" className="label">Choose a password</label>
            <input
              id="inv-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-1">
            {loading ? (<><Loader2 className="size-4 animate-spin" /> Creating account...</>) : "Accept & create account"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">You already have an account. Sign in to accept this invite.</p>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (<><Loader2 className="size-4 animate-spin" /> Redirecting...</>) : "Continue to sign in"}
          </button>
        </>
      )}
    </form>
  );
}

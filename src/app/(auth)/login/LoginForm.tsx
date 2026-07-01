"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithEmail } from "@/lib/firebase/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const user = await signInWithEmail(email, password);
      if (user) {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (res.ok) {
          const redirect = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";
          window.location.href = redirect;
        } else {
          setError("Signed in, but session setup failed. Please try again.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4" data-testid="login-form">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400" data-testid="login-error">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          autoComplete="email"
          disabled={loading}
          className="w-full rounded-lg border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors focus:border-blue-500/40 focus:bg-white/6 focus:outline-none disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          disabled={loading}
          className="w-full rounded-lg border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors focus:border-blue-500/40 focus:bg-white/6 focus:outline-none disabled:opacity-50"
        />
      </div>

      <div className="flex justify-end">
        <Link
          href="/reset-password"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        data-testid="login-submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

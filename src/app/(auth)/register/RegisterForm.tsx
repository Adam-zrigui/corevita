"use client";

import { useState } from "react";
import { signUpWithEmail } from "@/lib/firebase/auth";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const user = await signUpWithEmail(email, password, name.trim());
      if (user) {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, name: name.trim() }),
        });

        if (res.ok) {
          const redirect = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";
          window.location.href = redirect;
        } else {
          const data = await res.json();
          setError(data.error ?? "Account created, but setup failed. Please try signing in.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4" data-testid="register-form">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400" data-testid="register-error">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="sr-only">Full name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          autoComplete="name"
          disabled={loading}
          className="w-full rounded-lg border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors focus:border-blue-500/40 focus:bg-white/6 focus:outline-none disabled:opacity-50"
        />
      </div>

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
          placeholder="Password (min. 6 characters)"
          autoComplete="new-password"
          disabled={loading}
          className="w-full rounded-lg border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors focus:border-blue-500/40 focus:bg-white/6 focus:outline-none disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        data-testid="register-submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

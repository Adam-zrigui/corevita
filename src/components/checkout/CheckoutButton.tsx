"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CheckoutButtonProps = {
  plan: string | null;
  popular?: boolean;
  children: React.ReactNode;
};

export function CheckoutButton({ plan, popular, children }: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const isThisLoading = loading === plan;

  const handleCheckout = async () => {
    if (!plan) return;
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) { router.push("/login"); return; }
        throw new Error(data.error ?? "Checkout failed");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Checkout failed");
    }
    setLoading(null);
  };

  if (!plan) {
    return (
      <a
        href="mailto:sales@corevita.com?subject=Enterprise%20plan%20inquiry"
        className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-xs font-semibold transition-colors ${
          popular
            ? "bg-emerald-500 text-white hover:bg-emerald-400"
            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
        }`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={isThisLoading}
      onClick={handleCheckout}
      className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-xs font-semibold transition-colors disabled:opacity-40 ${
        popular
          ? "bg-emerald-500 text-white hover:bg-emerald-400"
          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
      }`}
    >
      {isThisLoading ? "Redirecting..." : children}
    </button>
  );
}
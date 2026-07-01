export const dynamic = 'force-static';

import { PublicHeader } from "@/components/PublicHeader";
import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "€0",
    period: "/mo",
    detail: "For individual clinicians",
    plan: null,
    features: ["Up to 3 studies", "7-day link expiry", "Powered by CoreVita watermark", "Basic viewer tools"],
  },
  {
    name: "Pro",
    price: "€29",
    period: "/mo",
    detail: "For practices and small clinics",
    plan: "pro",
    features: ["Unlimited studies", "Custom link expiry (up to 365d)", "No watermark", "Password protection", "Download toggle", "Advanced viewer tools", "Measurement & annotation"],
    popular: true,
  },
  {
    name: "Clinic",
    price: "€149",
    period: "/mo",
    detail: "For hospitals and large clinics",
    plan: "clinic",
    features: ["Everything in Pro", "Unlimited team members", "AI-assisted triage", "Structured reports", "Priority support", "On-premise option", "Audit log & SSO"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <PublicHeader />

      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Simple, transparent pricing
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                tier.popular
                  ? "border-blue-500/30 bg-blue-500/[0.04] shadow-xl shadow-blue-500/5"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg">
                  Most Popular
                </div>
              )}
              <div className={tier.popular ? "mt-2" : ""}>
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-slate-500">{tier.period}</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">{tier.detail}</p>
              </div>

              <ul className="mt-7 flex-1 space-y-3.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className={`h-4 w-4 shrink-0 ${tier.popular ? "text-blue-400" : "text-slate-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {tier.plan ? (
                <CheckoutButton plan={tier.plan} popular={tier.popular}>
                  Get Started
                </CheckoutButton>
              ) : (
                <Link
                  href="/register"
                  className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-xs font-semibold transition-colors ${
                    tier.popular
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  Start for free
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-600 transition-colors hover:text-slate-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Building2, BarChart3, ExternalLink, Settings2, CheckCircle2 } from "lucide-react";

type Usage = {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
  status: string;
};
type Tenant = { id: string; name: string; slug: string };

export default function SettingsPage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    const load = async () => {
      try {
        const [usageRes, teamRes] = await Promise.all([
          fetch("/api/billing/usage", { signal: ac.signal }),
          fetch("/api/team", { signal: ac.signal }),
        ]);
        if (!mounted) return;
        if (usageRes.ok) { const u = await usageRes.json(); if (mounted) setUsage(u); }
        if (teamRes.ok) { const d = await teamRes.json(); if (mounted) setTenant(d.tenant ?? null); }
      } catch { /* aborted or network error */ }
    };
    load();
    return () => { mounted = false; ac.abort(); };
  }, []);

  const handleBillingPortal = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error ?? "No active subscription");
    } catch { toast.error("Failed to open billing portal"); }
    setLoadingPortal(false);
  };

  const usagePercent = usage && usage.limit > 0 ? Math.round((usage.used / usage.limit) * 100) : 0;
  const isActive = usage?.status === "active" || usage?.status === "trialing";

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2.5">
          <Settings2 className="h-5 w-5 text-slate-500" />
          <h1 className="text-xl font-semibold tracking-tight text-white">Settings</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">Organization &amp; billing</p>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.09]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shadow-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-white">{tenant?.name ?? "Organization"}</div>
              <div className="text-sm text-slate-500">{tenant?.slug ?? ""}</div>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-400">
              Active
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.09]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shadow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-base font-semibold text-white capitalize">{usage?.plan ?? "-"} Plan</div>
                {isActive && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                )}
              </div>
              <div className="text-sm text-slate-500 capitalize">{usage?.status ?? "No subscription"}</div>
            </div>
            <button
              type="button"
              onClick={handleBillingPortal}
              disabled={loadingPortal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-white/[0.1] active:scale-95 disabled:opacity-40"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {loadingPortal ? "Loading..." : "Manage"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.09]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shadow-sm">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-white">Study Usage</div>
                <div className="text-sm text-slate-500 tabular-nums">
                  {usage?.used ?? 0} <span className="text-slate-600">/ {usage?.limit ?? 500}</span>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent > 90 ? "bg-red-500" : usagePercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
                {usage?.remaining ?? 0} remaining
                {usage && usagePercent > 80 && (
                  <span className="ml-2 text-amber-400">
                    {usagePercent > 90 ? "Critical — upgrade your plan" : "Running low"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

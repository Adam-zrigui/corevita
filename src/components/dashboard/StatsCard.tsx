"use client";

import type { ReactNode } from "react";

export function StatsCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  trend?: { direction: "up" | "down"; label: string };
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all hover:border-emerald-500/20 hover:bg-white/[0.05]">
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-emerald-500/10 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/5">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </div>
          <div className="mt-0.5 text-2xl font-semibold tracking-tight text-white tabular-nums">
            {value}
          </div>
          {trend && (
            <div
              className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                trend.direction === "up"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              <span>{trend.direction === "up" ? "\u2191" : "\u2193"}</span>
              {trend.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

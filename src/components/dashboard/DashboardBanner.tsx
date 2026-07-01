"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";

export function DashboardBanner({
  used,
  limit,
  usagePercent,
}: {
  used: number;
  limit: number;
  usagePercent: number;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className={`mb-6 rounded-xl border px-5 py-3 ${
        usagePercent > 90
          ? "border-red-500/20 bg-red-500/5"
          : "border-amber-500/20 bg-amber-500/5"
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              usagePercent > 90 ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
            }`}>
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <div className={`text-xs font-medium ${
                usagePercent > 90 ? "text-red-300" : "text-amber-300"
              }`}>
                {usagePercent > 90 ? "Study limit critical" : "Study limit running low"}
              </div>
              <div className="text-[10px] text-slate-500">
                {used} / {limit} studies used ({usagePercent}%)
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-emerald-400"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>

      <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} currentPlan="starter" />
    </>
  );
}

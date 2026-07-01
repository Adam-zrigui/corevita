"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ReportModal({
  open,
  onClose,
  studyId,
}: {
  open: boolean;
  onClose: () => void;
  studyId: string;
}) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyId, content }),
      });
      if (res.ok) {
        toast.success("Report saved");
        onClose();
      } else {
        toast.error("Failed to save report");
      }
    } catch {
      toast.error("Network error");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-white/[0.06] bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Structured Report</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {["Normal", "Abnormal", "Critical"].map((t) => (
            <button
              key={t}
              type="button"
              className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
              onClick={() => setContent((prev) => prev + `**${t.toUpperCase()}**\n`)}
            >
              {t}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-3 h-60 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/30 focus:outline-none resize-none"
          placeholder="Write findings, impressions, and recommendations..."
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-xs text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="rounded-md bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

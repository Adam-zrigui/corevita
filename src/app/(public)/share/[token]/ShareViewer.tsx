"use client";

import { useEffect, useState } from "react";
import { Clock, Download, Eye } from "lucide-react";
import { ViewerShell } from "@/components/viewer/ViewerShell";

interface SeriesItem {
  id: string;
  seriesUid: string;
  modality: string | null;
  instanceCount: number;
  seriesNumber: number | null;
  firstImageId?: string | null;
  equipment?: {
    manufacturer?: string | null;
    manufacturerModelName?: string | null;
    stationName?: string | null;
    institutionName?: string | null;
    institutionalDepartmentName?: string | null;
    deviceSerialNumber?: string | null;
    softwareVersions?: string | null;
  };
}

interface StudyData {
  studyUid: string;
  patientName: string | null;
  patientId: string | null;
  modality: string | null;
  studyDate: string | null;
  description: string | null;
  slices: number;
  series: SeriesItem[];
}

export function ShareViewer({
  token,
  study,
  allowDownload,
  expiresAt,
}: {
  token: string;
  study: StudyData;
  allowDownload: boolean;
  expiresAt: Date;
}) {
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expiryText, setExpiryText] = useState("");
  const [plan, setPlan] = useState<string>("starter");

  const totalImages = study.series.reduce((s, series) => s + series.instanceCount, 0);

  useEffect(() => {
    loadImages();
    updateExpiry();
    const interval = setInterval(updateExpiry, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateExpiry = () => {
    const now = Date.now();
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) {
      setExpiryText("Expired");
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (days > 0) setExpiryText(`${days}d ${hours}h remaining`);
    else if (hours > 0) setExpiryText(`${hours}h ${minutes}m remaining`);
    else setExpiryText(`${minutes}m remaining`);
  };

  const loadImages = async () => {
    try {
      const res = await fetch(`/api/share/${token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");

      setPlan(data.plan || "starter");
      setImageIds(data.imageIds || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/share/${token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");

      for (const inst of data.instances || []) {
        if (!inst.signedUrl) continue;
        const a = document.createElement("a");
        a.href = `${inst.signedUrl}&download=1`;
        a.download = inst.id;
        a.click();
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (err: any) {
      console.error("Download failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">Loading shared study...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <Eye className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">Failed to Load</h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (imageIds.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Eye className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-white">
            {study.patientName || "Medical Study"}
          </h1>
          {study.description && (
            <p className="mt-2 text-sm text-slate-500">{study.description}</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {study.modality && (
              <span className="rounded-md bg-white/[0.04] px-3 py-1 text-xs font-mono text-slate-400">
                {study.modality}
              </span>
            )}
            {study.studyDate && (
              <span className="rounded-md bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                {study.studyDate}
              </span>
            )}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-lg mx-auto">
            {study.series.map((s) => (
              <div key={s.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-slate-200">
                  {s.modality || "Series"}
                </p>
                <p className="mt-1 text-xs text-slate-600">{s.instanceCount} images</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {expiryText}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <ViewerShell
        study={study}
        imageIds={imageIds}
        total={totalImages}
        plan={plan === "enterprise" ? "enterprise" : plan === "pro" ? "pro" : "starter"}
        backHref="/"
        headerExtra={
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 tabular-nums">
              <Clock className="h-3 w-3" />
              {expiryText}
            </span>
            {allowDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:bg-white/[0.08]"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
          </div>
        }
      />
    </div>
  );
}

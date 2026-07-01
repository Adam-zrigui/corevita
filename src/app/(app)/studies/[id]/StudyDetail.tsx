"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Share2,
  Clock,
  Activity,
  FileText,
  Layers,
  Calendar,
  User,
  Info,
  XCircle,
  Sparkles,
  Loader2,
  CalendarPlus,
  Check,
} from "lucide-react";
import { ShareModal } from "@/components/share/ShareModal";
import { DeleteStudyButton } from "@/components/studies/DeleteStudyButton";

interface SeriesItem {
  id: string;
  seriesUid: string;
  modality: string | null;
  instanceCount: number;
  seriesNumber: number | null;
  _count: { instances: number };
}

interface ReportItem {
  id: string;
  status: string;
  content: string | null;
  createdAt: Date;
  author: { name: string | null } | null;
}

interface ShareTokenItem {
  id: string;
  token: string;
  expiresAt: Date;
  password: string | null;
  allowDownload: boolean;
  createdAt: Date;
}

interface StudyData {
  id: string;
  studyUid: string;
  patientName: string | null;
  patientId: string | null;
  modality: string | null;
  studyDate: string | null;
  slices: number;
  status: string;
  description: string | null;
  createdAt: Date;
  series: SeriesItem[];
  reports: ReportItem[];
  shareTokens: ShareTokenItem[];
}

export function StudyDetail({ study, plan, hasAiFeature }: { study: StudyData; plan: string; hasAiFeature: boolean }) {
  const [showShare, setShowShare] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [extending, setExtending] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState<number>(7);
  const [tokens, setTokens] = useState(study.shareTokens);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState("");
  const router = useRouter();

  const canExtend = plan === "pro" || plan === "enterprise";

  const generateAiReport = useCallback(async () => {
    setGeneratingAi(true);
    setAiError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyId: study.id, ai: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate AI report");
      }
      router.refresh();
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setGeneratingAi(false);
    }
  }, [study.id, router]);

  const extendToken = useCallback(async (token: string) => {
    setExtending(token);
    try {
      const res = await fetch(`/api/share/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInDays: extendDays }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extend");
      }
      const data = await res.json();
      setTokens((prev) =>
        prev.map((t) =>
          t.token === token ? { ...t, expiresAt: new Date(data.expiresAt) } : t
        )
      );
    } catch {
      // silently fail
    } finally {
      setExtending(null);
    }
  }, [extendDays]);

  const revokeToken = useCallback(async (token: string) => {
    setRevoking(token);
    try {
      const res = await fetch(`/api/share/${token}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke");
      setTokens((prev) => prev.filter((t) => t.token !== token));
    } catch {
      setRevoking(null);
    }
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "border-amber-500/20 bg-amber-500/8 text-amber-400";
      case "READING": return "border-blue-500/20 bg-blue-500/8 text-blue-400";
      case "REPORTED": return "border-emerald-500/20 bg-emerald-500/8 text-emerald-400";
      default: return "border-slate-500/20 bg-slate-500/8 text-slate-400";
    }
  };

  const totalInstances = study.series.reduce((sum, s) => sum + s._count.instances, 0);

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8 animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/studies"
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All studies
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight text-white truncate">
                    {study.patientName || "Unknown Patient"}
                  </h1>
                  <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColor(study.status)}`}>
                    {study.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                  {study.patientId && (
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-600" />
                      Patient ID: {study.patientId}
                    </span>
                  )}
                  {study.modality && (
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-slate-600" />
                      Modality: {study.modality}
                    </span>
                  )}
                  {study.studyDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-600" />
                      Study date: {study.studyDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-600" />
                    Uploaded {new Date(study.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                  <span>{study.series.length} series</span>
                  <span>{totalInstances} images</span>
                  <span>{study.slices} slices</span>
                </div>
              </div>
            </div>

            {study.description && (
              <div className="mt-4 rounded-lg bg-white/[0.03] px-4 py-3">
                <p className="text-sm text-slate-400">{study.description}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/viewer/${study.studyUid}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.98]"
              >
                <Eye className="h-4 w-4" />
                Open Viewer
              </Link>
              <button
                onClick={() => setShowShare(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <DeleteStudyButton studyUid={study.studyUid} />
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="h-4 w-4 text-slate-500" />
              Series ({study.series.length})
            </h2>
            <div className="mt-4 space-y-2">
              {study.series.length === 0 ? (
                <p className="text-sm text-slate-600">No series found</p>
              ) : (
                study.series.map((series, i) => (
                  <div
                    key={series.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[11px] font-mono text-slate-500">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {series.modality || "Series"} {series.seriesNumber ? `#${series.seriesNumber}` : ""}
                        </p>
                        <p className="text-xs text-slate-600">
                          {series._count.instances} image{series._count.instances !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-slate-500">
                      {series.modality || "N/A"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {tokens.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Share2 className="h-4 w-4 text-slate-500" />
                  Shared Links
                </h2>
                <span className="text-[10px] text-slate-600">{tokens.length} link{tokens.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="mt-3 space-y-2">
                {tokens.map((st) => (
                  <div key={st.id} className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-slate-400 font-mono flex-1">
                        /share/{st.token.slice(0, 8)}...
                      </p>
                      <div className="flex items-center gap-1">
                        {canExtend && (
                          <button
                            onClick={() => { setExtendDays(7); setExtending(extending === st.token ? null : st.token); }}
                            className="rounded p-0.5 text-slate-600 hover:text-blue-400 transition-colors"
                            title="Extend expiry"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => revokeToken(st.token)}
                          disabled={revoking === st.token}
                          className="rounded p-0.5 text-slate-600 hover:text-red-400 transition-colors disabled:opacity-30"
                          title="Revoke share link"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600">
                      <span>Expires {new Date(st.expiresAt).toLocaleDateString()}</span>
                      {st.password && <span className="text-amber-400">Protected</span>}
                      {st.allowDownload && <span className="text-blue-400">Download</span>}
                    </div>
                    {extending === st.token && (
                      <div className="mt-2 flex items-center gap-2 border-t border-white/[0.04] pt-2">
                        <select
                          value={extendDays}
                          onChange={(e) => setExtendDays(Number(e.target.value))}
                          className="flex-1 rounded border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[10px] text-white outline-none"
                        >
                          <option value={7}>7 days</option>
                          <option value={14}>14 days</option>
                          <option value={30}>30 days</option>
                          <option value={90}>90 days</option>
                          <option value={365}>1 year</option>
                        </select>
                        <button
                          onClick={() => extendToken(st.token)}
                          disabled={extending === st.token}
                          className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                        >
                          {extending === st.token ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Extend
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(study.reports.length > 0 || hasAiFeature) && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Reports
                </h2>
                {hasAiFeature && (
                  <button
                    onClick={generateAiReport}
                    disabled={generatingAi}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-3 py-1.5 text-[10px] font-medium text-violet-400 transition-colors hover:bg-violet-500/20 disabled:opacity-40"
                  >
                    {generatingAi ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    AI Report
                  </button>
                )}
              </div>
              {aiError && (
                <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-[10px] text-red-400">{aiError}</div>
              )}
              {study.reports.length > 0 && (
                <div className="mt-3 space-y-3">
                  {study.reports.slice(0, 3).map((report) => (
                    <div key={report.id} className="rounded-lg bg-white/[0.03] px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          report.status === "FINAL"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-slate-600">
                          {report.author?.name || "Unknown"}
                        </span>
                      </div>
                      {report.content && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-slate-400">{report.content}</p>
                      )}
                      <p className="mt-1 text-[10px] text-slate-600">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {study.reports.length === 0 && (
                <p className="mt-3 text-xs text-slate-600">No reports yet. Click "AI Report" to generate one.</p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Info className="h-4 w-4 text-slate-500" />
              Study Info
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Study UID</dt>
                <dd className="text-slate-300 font-mono text-xs truncate ml-4 max-w-[200px]">{study.studyUid}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Tenant</dt>
                <dd className="text-slate-300 text-xs">Default</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {showShare && (
        <ShareModal
          studyId={study.id}
          studyUid={study.studyUid}
          plan={plan === "enterprise" ? "enterprise" : plan === "pro" ? "pro" : "starter"}
          onClose={() => setShowShare(false)}
          onShare={() => router.refresh()}
        />
      )}
    </main>
  );
}

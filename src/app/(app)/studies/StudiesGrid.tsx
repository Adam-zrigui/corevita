"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, FileText, Eye, Calendar, Activity, Share2 } from "lucide-react";

interface StudyItem {
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
  _count: { series: number; reports: number; shareTokens: number };
}

const MODALITY_COLORS: Record<string, string> = {
  MR: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  CT: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  CR: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  DX: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  XA: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  US: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  NM: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  PT: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  MG: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  OT: "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

function modalityColor(modality: string | null): string {
  return MODALITY_COLORS[modality ?? ""] ?? MODALITY_COLORS.OT;
}

function modalityLetter(modality: string | null): string {
  if (!modality) return "?";
  if (modality === "MR") return "M";
  if (modality === "CT") return "C";
  if (modality === "CR" || modality === "DX") return "X";
  if (modality === "XA") return "A";
  if (modality === "US") return "U";
  if (modality === "NM" || modality === "PT") return "N";
  if (modality === "MG") return "G";
  return modality.charAt(0);
}

export function StudiesGrid({ studies }: { studies: StudyItem[] }) {
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("");

  const modalities = useMemo(() => {
    const m = new Set(studies.map((s) => s.modality).filter((x): x is string => !!x));
    return [...m].sort();
  }, [studies]);

  const filtered = useMemo(() => {
    return studies.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        const name = (s.patientName ?? "").toLowerCase();
        const desc = (s.description ?? "").toLowerCase();
        const uid = s.studyUid.toLowerCase();
        if (!name.includes(q) && !desc.includes(q) && !uid.includes(q)) return false;
      }
      if (modalityFilter && s.modality !== modalityFilter) return false;
      return true;
    });
  }, [studies, search, modalityFilter]);

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "border-amber-500/20 bg-amber-500/8 text-amber-400";
      case "READING": return "border-blue-500/20 bg-blue-500/8 text-blue-400";
      case "REPORTED": return "border-emerald-500/20 bg-emerald-500/8 text-emerald-400";
      default: return "border-slate-500/20 bg-slate-500/8 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, description, or UID..."
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] py-2 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50"
          />
        </div>
        {modalities.length > 1 && (
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500/50 sm:w-40"
          >
            <option value="">All modalities</option>
            {modalities.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] py-16">
          <FileText className="mb-3 h-10 w-10 text-slate-700" />
          <p className="text-sm text-slate-500">
            {search || modalityFilter ? "No studies match your search" : "No studies yet"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((study) => (
            <Link
              key={study.id}
              href={`/studies/${study.id}`}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xs font-bold uppercase leading-none ${modalityColor(study.modality)}`}>
                  {modalityLetter(study.modality)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {study.patientName || "Unknown Patient"}
                  </h3>
                  {study.patientId && (
                    <p className="mt-0.5 text-xs text-slate-600">ID: {study.patientId}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColor(study.status)}`}>
                  {study.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                {study.studyDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {study.studyDate}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                <span>{study._count.series} series</span>
                <span>{study.slices} slices</span>
                <span>{study._count.reports} report{study._count.reports !== 1 ? "s" : ""}</span>
              </div>

              {study.description && (
                <p className="mt-2 line-clamp-2 text-xs text-slate-600">{study.description}</p>
              )}

              <div className="mt-4 flex items-center gap-2 border-t border-white/[0.04] pt-3">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-xs text-slate-600">Open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-xs text-slate-600">{study._count.shareTokens}</span>
                </div>
                <Activity className="ml-auto h-3.5 w-3.5 text-slate-700 transition-colors group-hover:text-blue-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

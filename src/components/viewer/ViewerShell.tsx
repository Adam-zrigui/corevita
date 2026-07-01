"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CornerstoneViewport } from "@/components/viewer/CornerstoneViewport";
import { MedicalToolbar } from "@/components/viewer/MedicalToolbar";
import { StudySidebar } from "@/components/viewer/StudySidebar";
import { MetadataPanel } from "@/components/viewer/MetadataPanel";
import { StatusBar } from "@/components/viewer/StatusBar";
import { ToolDock } from "@/components/viewer/ToolDock";
import { KeyboardOverlay } from "@/components/viewer/KeyboardOverlay";
import { ReportModal } from "@/components/viewer/ReportModal";
import { toast } from "sonner";
import type { Types } from "@cornerstonejs/core";
import { ArrowLeft, ChevronLeft, ChevronRight, Crown } from "lucide-react";

type Series = {
  id: string;
  seriesUid: string;
  modality?: string | null;
  instanceCount: number;
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
};

export function ViewerShell({
  study,
  imageIds,
  total,
  plan = "starter",
  backHref,
  headerExtra,
}: {
  study: {
    studyUid: string;
    patientName?: string | null;
    studyDate?: string | null;
    description?: string | null;
    series: Series[];
  };
  imageIds: string[];
  total: number;
  plan?: "starter" | "pro" | "enterprise";
  backHref?: string;
  headerExtra?: React.ReactNode;
}) {
  const [activeTool, setActiveTool] = useState("wl");
  const [sliceIndex, setSliceIndex] = useState(0);
  const [cinePlaying, setCinePlaying] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [viewport, setViewport] = useState<Types.IStackViewport | null>(null);
  const viewportRef = useRef<Types.IStackViewport | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const maxSlice = Math.max(total - 1, 0);

  const activeSeriesIndex = (() => {
    let acc = 0;
    for (let i = 0; i < study.series.length; i++) {
      acc += study.series[i]?.instanceCount ?? 0;
      if (sliceIndex < acc) return i;
    }
    return 0;
  })();

  const goToSlice = useCallback((nextIndex: number) => {
    setCinePlaying(false);
    setSliceIndex(Math.min(Math.max(nextIndex, 0), maxSlice));
  }, [maxSlice]);

  const exportSnapshot = useCallback(() => {
    const el = elementRef.current;
    const canvas = el?.querySelector("canvas");
    if (!canvas) { toast.error("Export not available"); return; }
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `corevita-${study.studyUid}-slice-${sliceIndex + 1}.png`;
    link.click();
    toast.success("Snapshot exported");
  }, [sliceIndex, study.studyUid]);

  const downloadDicom = useCallback(() => {
    const ids = imageIds
      .map((id) => id.split("/").pop())
      .filter(Boolean) as string[];

    if (ids.length === 0) {
      toast.error("No DICOM files available for download");
      return;
    }

    (async () => {
      for (const id of ids) {
        try {
          const res = await fetch(`/api/dicom/instance/${id}?download=1`);
          if (!res.ok) continue;
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = id;
          a.click();
          URL.revokeObjectURL(url);
          await new Promise((r) => setTimeout(r, 300));
        } catch {
          // skip failed downloads
        }
      }
      toast.success("DICOM download started");
    })();
  }, [imageIds]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (reportOpen) return;
      if (e.key === "1") setActiveTool("wl");
      if (e.key === "2") setActiveTool("pan");
      if (e.key === "3") setActiveTool("zoom");
      if (e.key === "4") setActiveTool("measure");
      if (e.key === "5") setActiveTool("annotate");
      if (e.key === " ") { e.preventDefault(); setCinePlaying((v) => !v); }
      if (e.key === "f" || e.key === "F") {
        const el = elementRef.current;
        if (el && document.fullscreenElement !== el) {
          el.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen?.();
        }
      }
      if (e.key === "e" || e.key === "E") exportSnapshot();
      if (e.key === "r" || e.key === "R") setReportOpen((v) => !v);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToSlice(sliceIndex + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToSlice(sliceIndex - 1);
      }
      if (e.key === "Escape") { setActiveTool("wl"); setCinePlaying(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [exportSnapshot, goToSlice, sliceIndex, reportOpen]);

  const handleViewportReady = useCallback((vp: Types.IStackViewport) => {
    viewportRef.current = vp;
    setViewport(vp);
  }, []);

  const handleElementReady = useCallback((el: HTMLDivElement) => {
    elementRef.current = el;
  }, []);

  const handleToolbarAction = (action: string) => {
    if (action === "download") { downloadDicom(); return; }
    if (action === "export") { exportSnapshot(); return; }
    if (action === "report") { setReportOpen(true); return; }
    const viewport = viewportRef.current;
    if (action === "fullscreen") {
      const el = elementRef.current;
      if (el && document.fullscreenElement !== el) {
        el.requestFullscreen().catch(() => toast.error("Fullscreen failed"));
      } else {
        document.exitFullscreen?.();
      }
      return;
    }
    if (action === "zoomIn" && viewport) {
      viewport.setZoom(viewport.getZoom() * 1.15);
      viewport.render();
      return;
    }
    if (action === "zoomOut" && viewport) {
      viewport.setZoom(viewport.getZoom() * 0.85);
      viewport.render();
      return;
    }
    if (action === "invert" && viewport) {
      const props = viewport.getProperties();
      viewport.setProperties({ invert: !props.invert });
      viewport.render();
      return;
    }
    if (action === "reset" && viewport) {
      viewport.resetProperties();
      viewport.render();
      return;
    }
  };

  return (
    <main className="mx-auto flex min-h-screen flex-col bg-slate-950">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-4">
          <a
            href={backHref ?? "/dashboard"}
            className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </a>
          <div>
            <h1 className="text-sm font-semibold text-white">
              {study.patientName ?? "Unknown"}
            </h1>
            <div className="text-[11px] text-slate-600 font-mono">
              {study.studyUid.slice(0, 24)}&hellip;
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-slate-500 tabular-nums">
            {total} images
          </span>
          {headerExtra}
        </div>
      </div>

      <div className="flex flex-1 gap-4 p-5">
        <div className="hidden w-[220px] shrink-0 xl:block">
          <StudySidebar
            studyUid={study.studyUid}
            patientName={study.patientName}
            series={study.series}
            imageIds={imageIds}
            activeSeriesIndex={activeSeriesIndex}
            onSeriesClick={(i) => {
              let idx = 0;
              for (let s = 0; s < i; s++) idx += study.series[s]?.instanceCount ?? 0;
              goToSlice(idx);
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center justify-between">
            <MedicalToolbar onAction={handleToolbarAction} />
            <div className="flex items-center gap-2">
            {plan === "pro" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                  <Crown className="h-3 w-3" />
                  Pro
                </span>
              )}
              {plan === "enterprise" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-400">
                  <Crown className="h-3 w-3" />
                  Enterprise
                </span>
              )}
              <KeyboardOverlay />
            </div>
          </div>

          <CornerstoneViewport
            imageIds={imageIds}
            activeTool={activeTool}
            onSliceChange={setSliceIndex}
            onViewportReady={handleViewportReady}
            onElementReady={handleElementReady}
            sliceIndex={sliceIndex}
            cinePlaying={cinePlaying}
            patientName={study.patientName}
            studyDate={study.studyDate}
            plan={plan}
          />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => goToSlice(sliceIndex - 1)}
              disabled={sliceIndex <= 0}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={maxSlice}
                value={sliceIndex}
                disabled={total <= 1}
                onChange={(e) => goToSlice(Number(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/[0.06] accent-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={() => goToSlice(sliceIndex + 1)}
              disabled={sliceIndex >= maxSlice}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <ToolDock
              active={activeTool}
              onChange={setActiveTool}
              cinePlaying={cinePlaying}
              onCineToggle={() => setCinePlaying((v) => !v)}
            />
            <StatusBar
              viewport={viewport}
              sliceIndex={sliceIndex}
              total={total}
            />
          </div>
        </div>

        <div className="hidden w-[280px] shrink-0 xl:block">
          <MetadataPanel
            patientName={study.patientName}
            studyDate={study.studyDate}
            description={study.description}
            series={study.series}
            plan={plan}
            activeSeriesIndex={activeSeriesIndex}
          />
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        studyId={study.studyUid}
      />
    </main>
  );
}

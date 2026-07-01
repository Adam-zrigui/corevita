"use client";

import {
  Maximize,
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  Camera,
  RotateCcw,
  Contrast,
} from "lucide-react";

const baseTools = [
  { id: "fullscreen", label: "Fullscreen", icon: Maximize },
  { id: "zoomIn", label: "Zoom +", icon: ZoomIn },
  { id: "zoomOut", label: "Zoom -", icon: ZoomOut },
  { id: "invert", label: "Invert", icon: Contrast },
  { id: "reset", label: "Reset", icon: RotateCcw },
  { id: "download", label: "DICOM", icon: Download },
  { id: "export", label: "Snapshot", icon: Camera },
  { id: "report", label: "Report", icon: FileText },
];

export function MedicalToolbar({
  onAction,
}: {
  onAction: (action: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
      {baseTools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => onAction(tool.id)}
          data-testid={`tool-${tool.id}`}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
        >
          <tool.icon className="h-3.5 w-3.5" />
          {tool.label}
        </button>
      ))}
    </div>
  );
}

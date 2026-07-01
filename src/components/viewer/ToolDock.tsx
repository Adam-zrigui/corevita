"use client";

import { Sliders, Hand, ZoomIn, Ruler, PenTool, Play, Pause } from "lucide-react";

const tools = [
  { id: "wl", label: "WL", icon: Sliders },
  { id: "pan", label: "Pan", icon: Hand },
  { id: "zoom", label: "Zoom", icon: ZoomIn },
  { id: "measure", label: "Measure", icon: Ruler },
  { id: "annotate", label: "Annotate", icon: PenTool },
];

export function ToolDock({
  active,
  onChange,
  cinePlaying,
  onCineToggle,
}: {
  active: string;
  onChange: (tool: string) => void;
  cinePlaying: boolean;
  onCineToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => onChange(tool.id)}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            active === tool.id
              ? "bg-emerald-500/10 text-emerald-400"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
          }`}
        >
          <tool.icon className="h-3.5 w-3.5" />
          {tool.label}
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-white/[0.06]" />
      <button
        type="button"
        onClick={onCineToggle}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
          cinePlaying
            ? "bg-emerald-500/10 text-emerald-400"
            : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
        }`}
      >
        {cinePlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {cinePlaying ? "Stop" : "Cine"}
      </button>
    </div>
  );
}

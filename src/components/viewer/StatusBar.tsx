"use client";

import type { Types } from "@cornerstonejs/core";
import { useEffect, useState } from "react";

export function StatusBar({
  viewport,
  sliceIndex,
  total,
}: {
  viewport: Types.IStackViewport | null;
  sliceIndex: number;
  total: number;
}) {
  const [wl, setWl] = useState("-");
  const [ww, setWw] = useState("-");
  const [zoom, setZoom] = useState("-");

  useEffect(() => {
    if (!viewport) return;
    const update = () => {
      try {
        const props = viewport.getProperties();
        if (props?.voiRange) {
          const { lower, upper } = props.voiRange;
          setWl(((lower + upper) / 2).toFixed(0));
          setWw((upper - lower).toFixed(0));
        }
        setZoom((viewport.getZoom() * 100).toFixed(0) + "%");
      } catch {
        // viewport not ready
      }
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [viewport]);

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[11px] text-slate-500 tabular-nums">
      <div>
        Slice {Math.min(sliceIndex + 1, total)} / {total}
      </div>
      <div className="flex items-center gap-4">
        <span>WL: {wl}</span>
        <span>WW: {ww}</span>
        <span>Zoom: {zoom}</span>
      </div>
    </div>
  );
}

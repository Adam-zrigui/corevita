"use client";

import { useEffect, useState } from "react";
import { formatUnknownError } from "@/lib/format-error";

export function GlobalErrorTrap() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setMessage(formatUnknownError(event.reason, "Unexpected async error"));
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      setMessage(formatUnknownError(event.error ?? event.message, "Unexpected runtime error"));
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-md rounded-xl border border-red-500/20 bg-red-950/95 p-4 text-sm text-red-100 shadow-2xl backdrop-blur">
      <div className="font-semibold">Runtime error caught</div>
      <div className="mt-1 break-words text-xs text-red-100/75">{message}</div>
      <button
        type="button"
        onClick={() => setMessage(null)}
        className="mt-3 rounded-md bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-50 hover:bg-red-500/30"
      >
        Dismiss
      </button>
    </div>
  );
}

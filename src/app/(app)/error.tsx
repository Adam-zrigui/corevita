"use client";

import { useEffect } from "react";
import { formatUnknownError } from "@/lib/format-error";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = formatUnknownError(error, "Something went wrong while loading this page.");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-100">
        <h1 className="text-lg font-semibold">Unable to load this view</h1>
        <p className="mt-2 break-words text-sm text-red-100/75">{message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-50 transition-colors hover:bg-red-500/30"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

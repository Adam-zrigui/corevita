"use client";

import { formatUnknownError } from "@/lib/format-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = formatUnknownError(error, "The app hit an unexpected runtime error.");

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-100">
            <h1 className="text-lg font-semibold">CoreVita hit an error</h1>
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
      </body>
    </html>
  );
}

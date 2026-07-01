import Link from "next/link";

export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl font-bold tracking-tight text-white/[0.04]">
        404
      </div>
      <h1 className="mt-4 text-lg font-semibold text-white">
        Page not found
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
      >
        Back to Home
      </Link>
    </main>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

      <Link
        href="/"
        className="absolute left-5 top-5 z-10 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-white/4 hover:text-slate-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Home
      </Link>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="relative rounded-2xl border border-white/6 bg-white/4 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/4 pointer-events-none" />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5">
            <span className="text-xl font-bold tracking-tight">CV</span>
          </div>
          <h1 className="mt-5 text-lg font-semibold tracking-tight text-white">
            CoreVita
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your workspace
          </p>

          <LoginForm />

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          <div className="mt-5 flex justify-center">
            <GoogleSignInButton />
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Create one
            </Link>
          </p>

          <div className="mt-6 rounded-lg bg-white/4 px-4 py-3">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Only authorized personnel can access this system.<br />
              Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

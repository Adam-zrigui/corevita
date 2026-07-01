"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus, Trash2, Mail, UserCog } from "lucide-react";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string | null; image: string | null };
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
};

const ROLES = ["ADMIN", "RADIOLOGIST", "ASSISTANT", "VIEWER"] as const;

function planLabel(plan: string) {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [plan, setPlan] = useState("starter");
  const [memberLimit, setMemberLimit] = useState(1);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("VIEWER");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/team", { signal: ac.signal });
        if (!mounted) return;
        const data = res.ok ? await res.json() : { members: [], tenant: null };
        if (mounted) {
          setMembers(data.members ?? []);
          setTenant(data.tenant ?? null);
          setPlan(data.plan ?? "starter");
          setMemberLimit(data.memberLimit ?? 1);
        }
      } catch { /* aborted or network error */ }
    })();
    return () => { mounted = false; ac.abort(); };
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        const newMember = await res.json();
        setMembers((prev) => [...prev, newMember]);
        setInviteEmail("");
        toast.success("Member invited");
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Invite failed");
      }
    } catch { toast.error("Network error"); }
    setBusy(false);
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
        toast.success("Role updated");
      } else {
        toast.error("Failed to update role");
      }
    } catch { toast.error("Network error"); }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member from the organization?")) return;
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        toast.success("Member removed");
      } else {
        toast.error("Failed to remove member");
      }
    } catch { toast.error("Network error"); }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-white">Team</h1>
          <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-slate-500 tabular-nums">
            {members.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {tenant?.name ?? "Organization"}
          <span className="mx-1.5 text-slate-700">&middot;</span>
          <span className="text-slate-600">{planLabel(plan)} plan</span>
          <span className="mx-1.5 text-slate-700">&middot;</span>
          <span className="text-slate-600">
            {members.length} / {memberLimit === 999999 ? "∞" : memberLimit} members
          </span>
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            placeholder="colleague@clinic.com"
            className="h-9 flex-1 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/30 focus:outline-none"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="h-9 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 text-xs text-slate-300 focus:outline-none"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            type="button"
            onClick={handleInvite}
            disabled={busy || !inviteEmail.trim()}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-xs font-semibold text-white transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-30 disabled:active:scale-100"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-1">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 transition-all hover:bg-white/[0.04] hover:border-white/[0.09]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-400 shadow-sm">
                {m.user.name?.[0] ?? m.user.email?.[0] ?? "?"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {m.user.name ?? "Unknown"}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {m.user.email ?? ""}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1">
                <UserCog className="h-3 w-3 text-slate-600" />
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.id, e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(m.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

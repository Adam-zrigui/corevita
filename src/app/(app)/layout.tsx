import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <AppNav name={session.user.name} role={session.user.role} />
      <div className="pt-14">{children}</div>
    </div>
  );
}

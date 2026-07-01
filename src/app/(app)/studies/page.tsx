import { prisma } from "@/lib/prisma";
import { getDefaultTenant } from "@/lib/db";
import { StudiesGrid } from "./StudiesGrid";

export const dynamic = "force-dynamic";

export default async function StudiesPage() {
  const tenant = await getDefaultTenant();

  const studies = await prisma.study.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      studyUid: true,
      patientName: true,
      patientId: true,
      modality: true,
      studyDate: true,
      slices: true,
      status: true,
      description: true,
      createdAt: true,
      _count: { select: { series: true, reports: true, shareTokens: { where: { expiresAt: { gt: new Date() } } } } },
    },
  });

  const total = studies.length;
  const seriesCount = studies.reduce((sum, s) => sum + s._count.series, 0);
  const totalShares = studies.reduce((sum, s) => sum + s._count.shareTokens, 0);

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-8 animate-fade-in">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Studies</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} study{total !== 1 ? "ies" : "y"} &middot; {seriesCount} series
            {totalShares > 0 && <span> &middot; {totalShares} shared</span>}
          </p>
        </div>
      </div>
      <StudiesGrid studies={studies} />
    </main>
  );
}

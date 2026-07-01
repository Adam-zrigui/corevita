import { prisma } from "@/lib/prisma";

export type DashboardData = {
  totalStudies: number;
  studiesByStatus: { status: string; _count: number }[];
  totalReports: number;
  teamMembers: number;
  totalImages: number;
  activeShares: number;
  sharesThisMonth: number;
  recentStudies: Array<{
    id: string;
    studyUid: string;
    patientName: string | null;
    modality: string | null;
    slices: number;
    status: string;
    shareCount: number;
    createdAt: Date;
  }>;
  recentShares: Array<{
    id: string;
    token: string;
    createdAt: Date;
    expiresAt: Date;
    study: { patientName: string | null; id: string };
  }>;
};

export async function getDashboardData(tenantId: string, take = 20): Promise<DashboardData> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalStudies, studiesByStatus, totalReports, teamMembers, imageAgg, recentStudies, activeShares, sharesThisMonth, recentShares] =
    await Promise.all([
      prisma.study.count({ where: { tenantId } }),
      prisma.study.groupBy({
        by: ["status"],
        where: { tenantId },
        _count: true,
      }),
      prisma.report.count({
        where: { study: { tenantId } },
      }),
      prisma.membership.count({ where: { tenantId } }),
      prisma.study.aggregate({
        where: { tenantId },
        _sum: { slices: true },
      }),
      prisma.study.findMany({
        where: { tenantId },
        select: {
          id: true,
          studyUid: true,
          patientName: true,
          modality: true,
          slices: true,
          status: true,
          createdAt: true,
          _count: { select: { shareTokens: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
      }),
      prisma.shareToken.count({
        where: {
          study: { tenantId },
          expiresAt: { gt: new Date() },
        },
      }),
      prisma.shareToken.count({
        where: {
          study: { tenantId },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.shareToken.findMany({
        where: { study: { tenantId } },
        select: {
          id: true,
          token: true,
          createdAt: true,
          expiresAt: true,
          study: { select: { patientName: true, id: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  return {
    totalStudies,
    studiesByStatus,
    totalReports,
    teamMembers,
    totalImages: imageAgg._sum.slices ?? 0,
    activeShares,
    sharesThisMonth,
    recentStudies: recentStudies.map((s) => ({
      id: s.id,
      studyUid: s.studyUid,
      patientName: s.patientName,
      modality: s.modality,
      slices: s.slices,
      status: s.status,
      shareCount: s._count.shareTokens,
      createdAt: s.createdAt,
    })),
    recentShares,
  };
}

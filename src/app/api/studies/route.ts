import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma, getDefaultTenant } from "@/lib/db";
import { getRedis, clearStudiesCache } from "@/lib/redis";
import { StudyStatus, type Prisma } from "../../../../prisma/generated";

function parseStudyStatus(status: string | null) {
  if (!status) return undefined;
  return Object.values(StudyStatus).includes(status as StudyStatus)
    ? (status as StudyStatus)
    : undefined;
}

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const studyUid = url.searchParams.get("studyUid");
  const modality = url.searchParams.get("modality");
  const patient = url.searchParams.get("patient");
  const status = url.searchParams.get("status");
  const take = Math.min(Math.max(parseInt(url.searchParams.get("take") ?? "50", 10) || 50, 1), 200);
  const skip = Math.max(parseInt(url.searchParams.get("skip") ?? "0", 10) || 0, 0);
  const parsedStatus = parseStudyStatus(status);
  const tenant = await getDefaultTenant();
  const redis = getRedis();

  if (!studyUid && redis) {
    const key = `studies:all:${tenant.id}:${take}:${skip}:${modality ?? ""}:${patient ?? ""}:${status ?? ""}`;
    const cached = await redis.get(key);
    if (cached) {
      try {
        return NextResponse.json(JSON.parse(cached));
      } catch {
        // fall through
      }
    }
  }

  const where: Prisma.StudyWhereInput = {
    tenantId: tenant.id,
    ...(studyUid ? { studyUid } : {}),
    ...(modality ? { modality } : {}),
    ...(parsedStatus ? { status: parsedStatus } : {}),
    ...(patient
      ? { patientName: { contains: patient, mode: "insensitive" } }
      : {}),
  };

  const [studies, total] = await Promise.all([
    prisma.study.findMany({
      where,
      select: {
        id: true,
        studyUid: true,
        patientName: true,
        modality: true,
        slices: true,
        status: true,
        createdAt: true,
        series: { select: { id: true, seriesUid: true, modality: true, instanceCount: true }, take: 50 },
        reports: { select: { id: true, status: true, createdAt: true, authorId: true }, take: 50 },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.study.count({ where }),
  ]);

  if (!studyUid && redis) {
    try {
      const key = `studies:all:${tenant.id}:${take}:${skip}:${modality ?? ""}:${patient ?? ""}:${status ?? ""}`;
      await redis.set(key, JSON.stringify(studies), "EX", 60);
    } catch {
      // cache write failure is non-fatal
    }
  }
  return NextResponse.json(studies, { headers: { "X-Total-Count": String(total) } });
}

export async function DELETE(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const studyUid = url.searchParams.get("studyUid");
  if (!studyUid) {
    return NextResponse.json({ error: "Missing studyUid" }, { status: 400 });
  }

  const tenant = await getDefaultTenant();
  const study = await prisma.study.findUnique({ where: { studyUid } });
  if (!study || study.tenantId !== tenant.id) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  await prisma.study.delete({ where: { studyUid } });
  try {
    const redis2 = getRedis();
    if (redis2) await clearStudiesCache(redis2);
  } catch {
    // cache invalidation failure is non-fatal
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { getCurrentPlan, planHasFeature } from "@/lib/plans";
import { generateAiReport } from "@/lib/ai-report";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { memberships: { take: 1 } },
  });
  const tenantId = user?.memberships[0]?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const { studyId, content, ai } = await request.json();

  if (ai) {
    const planInfo = await getCurrentPlan(session);
    if (!planHasFeature(planInfo.plan, "ai_triage")) {
      return NextResponse.json({ error: "AI report generation requires Pro plan" }, { status: 402 });
    }

    const study = await prisma.study.findFirst({
      where: { OR: [{ id: studyId }, { studyUid: studyId }], tenantId },
    });
    if (!study) {
      return NextResponse.json({ error: "Study not found" }, { status: 404 });
    }

    try {
      const result = await generateAiReport(study.id, tenantId);
      const report = await prisma.report.create({
        data: {
          studyId: study.id,
          content: result.content,
          status: "DRAFT",
        },
      });
      prisma.study.updateMany({
        where: { id: study.id, status: "READING" },
        data: { status: "REPORTED" },
      }).catch(() => {});

      return NextResponse.json(report, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  if (!studyId || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Missing or invalid studyId or content" }, { status: 400 });
  }

  const study = await prisma.study.findFirst({
    where: { OR: [{ id: studyId }, { studyUid: studyId }], tenantId },
  });
  if (!study) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  const report = await prisma.report.create({
    data: {
      studyId: study.id,
      authorId: session.user.id,
      content,
      status: "DRAFT",
    },
  });

  prisma.study.updateMany({
    where: { id: study.id, status: "READING" },
    data: { status: "REPORTED" },
  }).catch(() => {});

  return NextResponse.json(report, { status: 201 });
}

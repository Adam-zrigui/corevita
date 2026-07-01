import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPlan } from "@/lib/plans";
import crypto from "crypto";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planInfo = await getCurrentPlan(session);
  const isFree = planInfo.plan === "starter" || planInfo.status === "none";

  const { studyId, expiresInDays, password, allowDownload } = await request.json();
  if (!studyId) {
    return NextResponse.json({ error: "Missing studyId" }, { status: 400 });
  }

  let days: number;
  if (isFree) {
    days = 7;
  } else {
    const allowed = [7, 14, 30];
    days = allowed.includes(expiresInDays) ? expiresInDays : 7;
  }

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const token = crypto.randomUUID();

  const share = await prisma.shareToken.create({
    data: {
      token,
      studyId,
      expiresAt,
      password: password || null,
      allowDownload: !!allowDownload,
    },
  });

  const origin = request.headers.get("origin") ?? "http://localhost:3000";
  const shareUrl = `${origin}/share/${share.token}`;

  return NextResponse.json({ token: share.token, url: shareUrl, expiresAt: share.expiresAt });
}

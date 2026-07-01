import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "../../../../prisma/generated";
import { getCurrentPlan, getMaxUsers } from "@/lib/plans";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { memberships: { include: { tenant: true } } },
  });
  const tenantId = user?.memberships[0]?.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const [members, planInfo] = await Promise.all([
    prisma.membership.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { createdAt: "asc" },
    }),
    getCurrentPlan(),
  ]);

  return NextResponse.json({
    members,
    tenant: user?.memberships[0]?.tenant ?? null,
    plan: planInfo.plan,
    memberLimit: getMaxUsers(planInfo.plan),
    memberCount: members.length,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await request.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const validRole = Object.values(Role).includes(role) ? role : "VIEWER";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { memberships: true },
  });
  const myMembership = user?.memberships[0];
  if (!myMembership || myMembership.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can invite" }, { status: 403 });
  }

  const currentMemberCount = await prisma.membership.count({
    where: { tenantId: myMembership.tenantId },
  });

  const planInfo = await getCurrentPlan();
  const userLimit = getMaxUsers(planInfo.plan);
  if (currentMemberCount >= userLimit) {
    return NextResponse.json(
      { error: `User limit reached (${userLimit}). Upgrade to add more members.` },
      { status: 403 }
    );
  }

  const inviteUser = await prisma.user.findUnique({ where: { email } });
  if (!inviteUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: inviteUser.id, tenantId: myMembership.tenantId } },
  });
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  const membership = await prisma.membership.create({
    data: {
      userId: inviteUser.id,
      tenantId: myMembership.tenantId,
      role: validRole,
    },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  return NextResponse.json(membership, { status: 201 });
}

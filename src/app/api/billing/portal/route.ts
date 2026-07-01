import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { memberships: { include: { tenant: true } } },
  });
  const membership = user?.memberships[0];
  if (!membership) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const subscription = await prisma.subscription.findUnique({
    where: { tenantId: membership.tenantId },
  });
  if (!subscription?.stripeId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  const sub = await stripe.subscriptions.retrieve(subscription.stripeId);
  const origin = request.headers.get("origin") ?? "http://localhost:3000";
  const portal = await stripe.billingPortal.sessions.create({
    customer: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    return_url: `${origin}/dashboard/settings`,
  });

  return NextResponse.json({ url: portal.url });
}

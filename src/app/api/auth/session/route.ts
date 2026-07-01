import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import { getDefaultTenant } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  let idToken: string;
  try {
    const body = await request.json();
    idToken = body.idToken;
    if (!idToken) {
      return Response.json({ error: "Missing idToken" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return Response.json({ error: "Firebase Admin not configured" }, { status: 500 });
  }

  let decoded: { uid: string; email?: string; name?: string; picture?: string };
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error("[auth/session] verifyIdToken failed:", error);
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const { uid, email, name, picture } = decoded;

  let tenant: { id: string };
  try {
    tenant = await getDefaultTenant();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[auth/session] getDefaultTenant failed:", error);
    return Response.json({ error: `Tenant error: ${msg.slice(0, 120)}` }, { status: 500 });
  }

  try {
    if (!email) {
      await prisma.user.upsert({
        where: { id: uid },
        update: { name, image: picture },
        create: { id: uid, name, email, image: picture },
      });
    } else {
      const conflict = await prisma.user.findUnique({ where: { id: uid } });
      if (conflict && conflict.email !== email) {
        const byEmail = await prisma.user.findUnique({ where: { email } });
        if (byEmail) {
          await prisma.membership.updateMany({
            where: { userId: uid },
            data: { userId: byEmail.id },
          });
        }
        await prisma.user.delete({ where: { id: uid } });
      }
      await prisma.user.upsert({
        where: { email },
        update: { id: uid, name, image: picture },
        create: { id: uid, name, email, image: picture },
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[auth/session] user upsert failed:", error);
    return Response.json({ error: `User error: ${msg.slice(0, 120)}` }, { status: 500 });
  }

  try {
    const resolvedUserId = email
      ? (await prisma.user.findUnique({ where: { email } }))?.id ?? uid
      : uid;
    await prisma.membership.upsert({
      where: { userId_tenantId: { userId: resolvedUserId, tenantId: tenant.id } },
      update: {},
      create: { userId: resolvedUserId, tenantId: tenant.id, role: "VIEWER" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[auth/session] membership upsert failed:", error);
    return Response.json({ error: `Member error: ${msg.slice(0, 120)}` }, { status: 500 });
  }

  let sessionCookie: string;
  try {
    sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  } catch (error) {
    console.error("[auth/session] createSessionCookie failed:", error);
    return Response.json({ error: "Session creation failed" }, { status: 500 });
  }

  try {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    cookieStore.set("__session", sessionCookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });
  } catch (error) {
    console.error("[auth/session] Cookie set failed:", error);
    return Response.json({ error: "Cookie error" }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function DELETE() {
  const adminAuth = getAdminAuth();
  if (adminAuth) {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("__session")?.value;
      if (sessionCookie) {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        await adminAuth.revokeRefreshTokens(decoded.uid);
      }
    } catch {
      // best-effort revocation
    }
  }

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  cookieStore.set("__session", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });
  return Response.json({ success: true });
}

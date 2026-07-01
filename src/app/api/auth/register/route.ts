import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import { getDefaultTenant } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { idToken, name } = await request.json();
    if (!idToken) {
      return Response.json({ error: "Missing idToken" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return Response.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const { uid, email, picture } = decoded;

    if (!email) {
      return Response.json({ error: "Email is required for registration" }, { status: 400 });
    }

    const tenant = await getDefaultTenant();

    const user = await prisma.user.upsert({
      where: { email },
      update: { id: uid, name: name ?? decoded.name, image: picture },
      create: {
        id: uid,
        name: name ?? decoded.name,
        email,
        image: picture,
      },
    });

    await prisma.membership.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
      update: {},
      create: { userId: user.id, tenantId: tenant.id, role: "ADMIN" },
    });

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    cookieStore.set("__session", sessionCookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return Response.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("[auth/register] Failed:", error);
    if (error instanceof Error && error.message.includes("Firebase")) {
      return Response.json({ error: "Registration failed" }, { status: 401 });
    }
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { formatUnknownError } from "@/lib/format-error";

let cachedTenant: { id: string; name: string; slug: string } | null = null;

export async function getDefaultTenant() {
  if (cachedTenant) return cachedTenant;
  const slug = process.env.DEFAULT_TENANT_SLUG ?? "default";
  let tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: "Default Clinic", slug },
    });
  }
  cachedTenant = tenant;
  return tenant;
}

export { prisma };

export async function withDbRetry<T>(fn: () => Promise<T>, attempts = 3) {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts) {
        await new Promise((r) => setTimeout(r, 400 * i));
        continue;
      }
    }
  }
  throw new Error(formatUnknownError(lastErr, "Database operation failed"));
}

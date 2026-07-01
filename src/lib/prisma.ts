import { PrismaClient } from "../../prisma/generated";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return databaseUrl;

  try {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get("sslmode");
    if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    return databaseUrl;
  }

  return databaseUrl;
}

const pool = globalForPrisma.pgPool ?? new Pool({
  connectionString: getDatabaseUrl(),
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
}

const _prisma = new PrismaClient({
  adapter: new PrismaPg(pool as unknown as ConstructorParameters<typeof PrismaPg>[0]),
  log: ["error", "warn"],
});

export const prisma = globalForPrisma.prisma ?? _prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

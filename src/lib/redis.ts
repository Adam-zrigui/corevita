import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!client) {
    client = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return client;
}

export async function clearStudiesCache(redis: Redis) {
  let cursor = "0";
  do {
    const result = await redis.scan(cursor, "MATCH", "studies:all:*", "COUNT", "100");
    cursor = result[0];
    const keys = result[1];
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== "0");
}
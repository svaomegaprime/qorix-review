import { connection } from "./redis.js";

const DEFAULT_TTL = 300; // 5 minutes

export async function getCache(key) {
  try {
    const raw = await connection.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("[CACHE::GET] error, falling through to DB", err);
    return null;
  }
}

export async function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    await connection.set(key, JSON.stringify(data), "EX", ttl);
  } catch (err) {
    console.error("[CACHE::SET] error, skipping cache write", err);
  }
}

export async function invalidateReviewCache(storeId, productId) {
  // If productId is provided, invalidate both product-specific and storewide ('all') caches
  const patterns = productId
    ? [`reviews:${storeId}:${productId}:*`, `reviews:${storeId}:all:*`]
    : [`reviews:${storeId}:*`];

  try {
    for (const pattern of patterns) {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await connection.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await connection.del(...keys);
        }
      } while (cursor !== "0");
    }
  } catch (err) {
    console.error("[CACHE::INVALIDATE] error", err);
  }
}

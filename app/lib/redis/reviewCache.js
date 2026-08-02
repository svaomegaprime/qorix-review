import { connection } from "./redis.js";

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Read a cached JSON value.
 * @param {string} key
 * @returns {Promise<any | null>}
 */
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

/**
 * Write a JSON value with an expiry.
 * @param {string} key
 * @param {any} data
 * @param {number} [ttl=DEFAULT_TTL] seconds
 */
export async function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    await connection.set(key, JSON.stringify(data), "EX", ttl);
  } catch (err) {
    console.error("[CACHE::SET] error, skipping cache write", err);
  }
}

/**
 * Invalidate all review cache entries for a store + optional product.
 * Uses SCAN (not KEYS) so it's safe in production.
 *
 * @param {string} storeId
 * @param {string} [productId] — if omitted, clears ALL review cache for the store
 */
export async function invalidateReviewCache(storeId, productId) {
  const pattern = productId
    ? `reviews:${storeId}:${productId}:*`
    : `reviews:${storeId}:*`;

  try {
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
  } catch (err) {
    console.error("[CACHE::INVALIDATE] error", err);
  }
}

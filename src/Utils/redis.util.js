import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisClient = null;

/**
 * Returns the singleton Redis client, creating it on first call.
 * Logs connection events and falls back gracefully if Redis is unavailable.
 */
export const getRedisClient = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis(REDIS_URL, {
    // Reconnect at most 3 times so the app doesn't hang in development
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  redisClient.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  return redisClient;
};

/**
 * Add a token to the Redis blacklist so it can no longer be used.
 * The key expires automatically at the same TTL as the token so the
 * blacklist never grows unbounded.
 *
 * @param {string} rawToken   - The raw JWT string (without "Bearer " prefix)
 * @param {number} expSeconds - Seconds until the token naturally expires (from jwt `exp` claim)
 */
export const blacklistToken = async (rawToken, expSeconds) => {
  try {
    const client = getRedisClient();
    // Key: bl:<token>  Value: "1"  TTL: remaining lifetime in seconds
    const key = `bl:${rawToken}`;
    if (expSeconds && expSeconds > 0) {
      await client.set(key, '1', 'EX', expSeconds);
    } else {
      // Fallback: 30 days if exp is unknown
      await client.set(key, '1', 'EX', 60 * 60 * 24 * 30);
    }
  } catch (err) {
    // Non-fatal: log but don't crash the request
    console.error('[Redis] blacklistToken error:', err.message);
  }
};

/**
 * Check whether a token is in the blacklist.
 * @param {string} rawToken
 * @returns {Promise<boolean>}
 */
export const isBlacklisted = async (rawToken) => {
  try {
    const client = getRedisClient();
    const result = await client.get(`bl:${rawToken}`);
    return result === '1';
  } catch (err) {
    console.error('[Redis] isBlacklisted error:', err.message);
    // If Redis is down, fail open (do NOT block requests) — log the warning
    return false;
  }
};

export default {
  getRedisClient,
  blacklistToken,
  isBlacklisted,
};

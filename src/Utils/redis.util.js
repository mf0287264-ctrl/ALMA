import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisClient = null;
let isRedisReady = false;
let hasLoggedOfflineWarning = false;

// In-memory blacklist fallback (token -> expiration timestamp in ms)
const inMemoryBlacklist = new Map();

/**
 * Check if token is in the in-memory blacklist and still valid
 */
const checkInMemoryBlacklist = (rawToken) => {
  if (!inMemoryBlacklist.has(rawToken)) return false;
  const expiresAt = inMemoryBlacklist.get(rawToken);
  if (Date.now() > expiresAt) {
    inMemoryBlacklist.delete(rawToken);
    return false;
  }
  return true;
};

/**
 * Add token to in-memory blacklist with TTL
 */
const saveToInMemoryBlacklist = (rawToken, expSeconds) => {
  const ttlMs = (expSeconds && expSeconds > 0 ? expSeconds : 60 * 60 * 24 * 30) * 1000;
  inMemoryBlacklist.set(rawToken, Date.now() + ttlMs);
};

/**
 * Returns the singleton Redis client, creating it on first call.
 * Logs connection events and falls back gracefully if Redis is unavailable.
 */
export const getRedisClient = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: false,
    retryStrategy: (times) => {
      // In development or when Redis is not started, retry a few times then back off quietly
      if (times > 3) {
        if (!hasLoggedOfflineWarning) {
          console.warn('[Redis] Redis server not reachable at ' + REDIS_URL + '. Operating with in-memory blacklist fallback.');
          hasLoggedOfflineWarning = true;
        }
        return null; // Stop retrying indefinitely to prevent console flooding
      }
      return 1000;
    },
  });

  redisClient.on('ready', () => {
    isRedisReady = true;
    hasLoggedOfflineWarning = false;
    console.log('[Redis] Connected and ready');
  });

  redisClient.on('connect', () => {
    isRedisReady = true;
  });

  redisClient.on('close', () => {
    isRedisReady = false;
  });

  redisClient.on('end', () => {
    isRedisReady = false;
  });

  redisClient.on('error', (err) => {
    isRedisReady = false;
    if (!hasLoggedOfflineWarning) {
      console.warn('[Redis] Connection notice (will use in-memory fallback):', err.message);
      hasLoggedOfflineWarning = true;
    }
  });

  return redisClient;
};

/**
 * Add a token to the blacklist (both in-memory and Redis if available)
 *
 * @param {string} rawToken   - The raw JWT string (without "Bearer " prefix)
 * @param {number} expSeconds - Seconds until the token naturally expires
 */
export const blacklistToken = async (rawToken, expSeconds) => {
  if (!rawToken) return;

  // Always save in in-memory fallback
  saveToInMemoryBlacklist(rawToken, expSeconds);

  // Also persist to Redis if connected
  try {
    const client = getRedisClient();
    if (isRedisReady && client.status === 'ready') {
      const key = `bl:${rawToken}`;
      const ttl = expSeconds && expSeconds > 0 ? expSeconds : 60 * 60 * 24 * 30;
      await client.set(key, '1', 'EX', ttl);
    }
  } catch (err) {
    // Non-fatal: in-memory fallback already recorded the token
  }
};

/**
 * Check whether a token is in the blacklist.
 * @param {string} rawToken
 * @returns {Promise<boolean>}
 */
export const isBlacklisted = async (rawToken) => {
  if (!rawToken) return false;

  // Check in-memory blacklist first
  if (checkInMemoryBlacklist(rawToken)) {
    return true;
  }

  // Check Redis if connected
  try {
    const client = getRedisClient();
    if (isRedisReady && client.status === 'ready') {
      const result = await client.get(`bl:${rawToken}`);
      return result === '1';
    }
  } catch (err) {
    // Fail open safely on Redis error
  }

  return false;
};

export default {
  getRedisClient,
  blacklistToken,
  isBlacklisted,
};

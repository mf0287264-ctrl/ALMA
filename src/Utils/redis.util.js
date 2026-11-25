import Redis from 'ioredis';
import crypto from 'node:crypto';
import { db } from '../DB/db.connection.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisClient = null;
let isRedisReady = false;
let hasLoggedOfflineWarning = false;

// In-memory blacklist fallback (token -> expiration timestamp in ms)
const inMemoryBlacklist = new Map();

// In-memory student codes set (for fast lookup and offline fallback)
const inMemoryStudentCodes = new Set();
let isStudentCodesLoaded = false;

/**
 * Load all existing student codes from the database into Redis set and memory
 */
export const loadStudentCodesToRedis = async (dbInstance) => {
  try {
    const database = dbInstance || db;
    if (!database) return;
    const students = await database.collection('students').find({}, { projection: { student_code: 1 } }).toArray();
    const codes = students.map((s) => s.student_code).filter(Boolean);

    for (const code of codes) {
      inMemoryStudentCodes.add(code);
    }

    const client = getRedisClient();
    if (codes.length > 0 && isRedisReady && client?.status === 'ready') {
      await client.sadd('student_codes', ...codes);
    }
    isStudentCodesLoaded = true;
    console.log(`[Redis] Loaded ${codes.length} student code(s) into Redis list`);
  } catch (err) {
    console.warn('[Redis] Notice when populating student codes to Redis:', err.message);
  }
};

/**
 * Check if a student code exists in Redis or in the database
 */
export const isStudentCodeInRedis = async (code, dbInstance) => {
  if (!code) return false;

  // 1. In-memory check
  if (inMemoryStudentCodes.has(code)) {
    return true;
  }

  // 2. Redis set check
  try {
    const client = getRedisClient();
    if (isRedisReady && client?.status === 'ready') {
      const exists = await client.sismember('student_codes', code);
      if (exists === 1) {
        inMemoryStudentCodes.add(code);
        return true;
      }
    }
  } catch (_) {}

  // 3. Fallback check against DB directly
  try {
    const database = dbInstance || db;
    if (database) {
      const found = await database.collection('students').findOne({ student_code: code }, { projection: { _id: 1 } });
      if (found) {
        inMemoryStudentCodes.add(code);
        try {
          const client = getRedisClient();
          if (isRedisReady && client?.status === 'ready') {
            await client.sadd('student_codes', code);
          }
        } catch (_) {}
        return true;
      }
    }
  } catch (_) {}

  return false;
};

/**
 * Add a confirmed student code to Redis set and in-memory cache
 */
export const addStudentCodeToRedis = async (code) => {
  if (!code) return;
  inMemoryStudentCodes.add(code);
  try {
    const client = getRedisClient();
    if (isRedisReady && client?.status === 'ready') {
      await client.sadd('student_codes', code);
    }
  } catch (_) {}
};

/**
 * Generate a cryptographically secure, unique 5-digit student code (STU-XXXXX)
 * Verified against Redis to ensure zero duplicates.
 */
export const generateUniqueStudentCode = async (dbInstance) => {
  if (!isStudentCodesLoaded) {
    await loadStudentCodesToRedis(dbInstance);
  }

  let code = '';
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    attempts++;
    // Generate 5 digits (one more digit than previous 4 digits: 10000 - 99999) using crypto
    const randomFiveDigits = crypto.randomInt(10000, 100000);
    code = `STU-${randomFiveDigits}`;

    const isTaken = await isStudentCodeInRedis(code, dbInstance);
    if (!isTaken) {
      await addStudentCodeToRedis(code);
      return code;
    }
  }

  // Fallback
  const fallbackCode = `STU-${Date.now().toString().slice(-5)}`;
  await addStudentCodeToRedis(fallbackCode);
  return fallbackCode;
};

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

export const disconnectRedis = async () => {
  if (redisClient) {
    try {
      redisClient.disconnect(false);
    } catch (_) {}
    redisClient = null;
    isRedisReady = false;
  }
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
    lazyConnect: true,
    retryStrategy: (times) => {
      // In development or when Redis is not started, do not loop reconnecting indefinitely
      if (times > 1) {
        if (!hasLoggedOfflineWarning) {
          console.warn('[Redis] Redis server not reachable at ' + REDIS_URL + '. Operating with in-memory fallback.');
          hasLoggedOfflineWarning = true;
        }
        return null;
      }
      return 500;
    },
  });

  redisClient.connect().catch((err) => {
    isRedisReady = false;
    if (!hasLoggedOfflineWarning) {
      console.warn('[Redis] Connection notice (will use in-memory fallback):', err.message);
      hasLoggedOfflineWarning = true;
    }
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
  disconnectRedis,
  blacklistToken,
  isBlacklisted,
  loadStudentCodesToRedis,
  isStudentCodeInRedis,
  addStudentCodeToRedis,
  generateUniqueStudentCode,
};

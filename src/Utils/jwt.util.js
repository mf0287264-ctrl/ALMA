import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'alma_jwt_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'alma_jwt_refresh_secret_key_2026_separate';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '30d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generates a signed ACCESS JWT token (expires in JWT_ACCESS_EXPIRES_IN)
 * @param {Object} payload
 * @param {string} [secret=JWT_SECRET]
 * @param {Object} [options={}]
 * @returns {string}
 */
export const generateToken = (payload, secret = JWT_SECRET, options = {}) => {
  return jwt.sign(payload, secret, { expiresIn: JWT_ACCESS_EXPIRES_IN, ...options });
};

/**
 * Generates a signed REFRESH JWT token (expires in JWT_REFRESH_EXPIRES_IN)
 * Refresh token uses a separate secret so it cannot be used as an access token.
 * @param {Object} payload
 * @returns {string}
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    { ...payload, tokenType: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

/**
 * Verifies and decodes an ACCESS JWT token with signature verification
 * @param {string} token - Raw JWT token or "Bearer <token>"
 * @param {string} [secret=JWT_SECRET]
 * @returns {Object} decodedData
 */
export const verifyToken = (token, secret = JWT_SECRET) => {
  if (!token) {
    const error = new Error('Authorization token is required');
    error.statusCode = 401;
    throw error;
  }

  const cleanToken = typeof token === 'string' && token.startsWith('Bearer ')
    ? token.slice(7).trim()
    : String(token).trim();

  try {
    const decodedData = jwt.verify(cleanToken, secret);
    return decodedData;
  } catch (err) {
    const error = new Error(err.message || 'Invalid or expired token');
    error.statusCode = 401;
    throw error;
  }
};

/**
 * Verifies and decodes a REFRESH JWT token
 * @param {string} token - Raw refresh token
 * @returns {Object} decodedData
 */
export const verifyRefreshToken = (token) => {
  if (!token) {
    const error = new Error('Refresh token is required');
    error.statusCode = 401;
    throw error;
  }

  const cleanToken = typeof token === 'string' && token.startsWith('Bearer ')
    ? token.slice(7).trim()
    : String(token).trim();

  try {
    const decodedData = jwt.verify(cleanToken, JWT_REFRESH_SECRET);
    if (decodedData.tokenType !== 'refresh') {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }
    return decodedData;
  } catch (err) {
    const error = new Error(err.message || 'Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }
};

/**
 * Extracts the raw token string from a "Bearer <token>" header
 * @param {string} authorization
 * @returns {string}
 */
export const extractRawToken = (authorization) => {
  if (!authorization) return null;
  return typeof authorization === 'string' && authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : String(authorization).trim();
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  extractRawToken,
};

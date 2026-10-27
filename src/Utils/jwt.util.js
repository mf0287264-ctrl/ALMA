import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'alma_jwt_secret_key_2026';

/**
 * Generates a signed JWT token
 * @param {Object} payload 
 * @param {string} [secret=JWT_SECRET] 
 * @param {Object} [options={}] - Options (no expiration date for now)
 * @returns {string}
 */
export const generateToken = (payload, secret = JWT_SECRET, options = {}) => {
  return jwt.sign(payload, secret, options);
};

/**
 * Verifies and decodes a JWT token with signature verification
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

export default {
  generateToken,
  verifyToken
};

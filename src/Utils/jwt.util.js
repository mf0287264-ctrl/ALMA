import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { requiredSecret } from '../Security/config.js';

const issuer = () => process.env.JWT_ISSUER || 'alma-api';
const audience = () => process.env.JWT_AUDIENCE || 'alma-web';
const unauthorized = () => Object.assign(new Error('Invalid or expired authentication token.'), { statusCode: 401 });

export function extractRawToken(value) {
  if (typeof value !== 'string' || value.length > 8192) return null;
  return value.startsWith('Bearer ') ? value.slice(7).trim() : value.trim();
}

export function generateToken(payload) {
  return jwt.sign({ ...payload, tokenType: 'access', jti: randomUUID() }, requiredSecret('JWT_SECRET'), { algorithm: 'HS256', issuer: issuer(), audience: audience(), expiresIn: 900 });
}

export function generateRefreshToken(payload) {
  return jwt.sign({ ...payload, tokenType: 'refresh', jti: randomUUID() }, requiredSecret('JWT_REFRESH_SECRET'), { algorithm: 'HS256', issuer: issuer(), audience: audience(), expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
}

function verify(value, secretName, tokenType) {
  const raw = extractRawToken(value);
  if (!raw) throw unauthorized();
  try {
    const decoded = jwt.verify(raw, requiredSecret(secretName), { algorithms: ['HS256'], issuer: issuer(), audience: audience() });
    if (!decoded || typeof decoded !== 'object' || decoded.tokenType !== tokenType || !['student', 'teacher', 'parent', 'admin'].includes(decoded.role)) throw unauthorized();
    return decoded;
  } catch { throw unauthorized(); }
}

export const verifyToken = token => verify(token, 'JWT_SECRET', 'access');
export const verifyRefreshToken = token => verify(token, 'JWT_REFRESH_SECRET', 'refresh');
export const tokenExpiration = token => new Date(jwt.decode(token).exp * 1000);
export default { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken, extractRawToken };

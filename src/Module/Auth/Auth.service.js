import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractRawToken,
} from '../../Utils/jwt.util.js';
import { blacklistToken, isBlacklisted } from '../../Utils/redis.util.js';
import studentsRepository from '../Students/Students.repository.js';
import teachersRepository from '../Teachers/Teachers.repository.js';
import adminsRepository from '../Admins/Admins.repository.js';
import parentsRepository from '../Parents/Parents.repository.js';

class AuthService {
  /**
   * Build the token payload for a user
   */
  buildPayload(user, role) {
    return {
      id: user._id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      role,
    };
  }

  /**
   * Generate both access + refresh tokens for a user payload
   */
  generateTokenPair(payload) {
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  /**
   * Logout: blacklist the provided access token in Redis.
   * TTL = remaining seconds until token expires (from jwt `exp` claim).
   * @param {string} rawToken   - Raw JWT access token string
   * @param {number} exp        - Token `exp` claim (unix timestamp in seconds)
   */
  async logout(rawToken, exp) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const remainingSeconds = exp ? exp - nowSeconds : 60 * 60 * 24 * 30;
    await blacklistToken(rawToken, remainingSeconds > 0 ? remainingSeconds : 0);
  }

  /**
   * Refresh token rotation:
   * - Verify the incoming refresh token (separate secret, type check)
   * - Blacklist the old refresh token so it can't be reused
   * - Issue a new access token + new refresh token
   *
   * @param {string} refreshToken - Raw refresh token (without Bearer prefix)
   * @returns {{ accessToken, refreshToken }}
   */
  async refresh(refreshToken) {
    // Check blacklist first (handles cases where the refresh token was already used or the user logged out)
    const blacklisted = await isBlacklisted(refreshToken);
    if (blacklisted) {
      const error = new Error('Refresh token has been invalidated. Please log in again.');
      error.statusCode = 401;
      throw error;
    }

    // Verify the refresh token signature + expiry
    const decoded = verifyRefreshToken(refreshToken);

    // Blacklist the old refresh token so it can only be used once (rotation)
    const nowSeconds = Math.floor(Date.now() / 1000);
    const remainingSeconds = decoded.exp ? decoded.exp - nowSeconds : 60 * 60 * 24 * 30;
    await blacklistToken(refreshToken, remainingSeconds > 0 ? remainingSeconds : 0);

    // Look up the user to make sure they still exist and are active
    const userId = decoded.id || decoded._id;
    const role = decoded.role;
    let user = null;

    if (role === 'student') {
      user = await studentsRepository.findById(userId);
    } else if (role === 'teacher') {
      user = await teachersRepository.findById(userId);
    } else if (role === 'admin') {
      user = await adminsRepository.findById(userId);
    } else if (role === 'parent') {
      user = await parentsRepository.findById(userId);
    }

    if (!user) {
      const error = new Error('User not found. Please log in again.');
      error.statusCode = 401;
      throw error;
    }

    // Build fresh payload and issue new pair
    const payload = this.buildPayload(user, role);
    return this.generateTokenPair(payload);
  }
}

export default new AuthService();

import authService from './Auth.service.js';
import { extractRawToken } from '../../Utils/jwt.util.js';

class AuthController {
  /**
   * POST /api/v1/auth/refresh-token
   * Body: { refreshToken: "<raw_refresh_token>" }
   * Returns: { accessToken, refreshToken }
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        const error = new Error('refreshToken is required in request body');
        error.statusCode = 400;
        throw error;
      }

      const rawRefreshToken = extractRawToken(refreshToken) || refreshToken;
      const tokens = await authService.refresh(rawRefreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Requires Authorization header with valid access token.
   * Blacklists the token in Redis.
   */
  async logout(req, res, next) {
    try {
      // req.rawToken and req.decodedToken are attached by authenticate middleware
      const rawToken = req.rawToken;
      const exp = req.decodedToken?.exp;

      await authService.logout(rawToken, exp);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully. Token has been invalidated.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

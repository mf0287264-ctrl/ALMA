import express from 'express';
import authController from './Auth.controller.js';

const router = express.Router();

/**
 * POST /api/v1/auth/refresh-token
 * Public endpoint — exchange a valid (non-expired, non-blacklisted) refresh token
 * for a fresh access token + refresh token pair.
 * Body: { "refreshToken": "<raw_refresh_token>" }
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * POST /api/v1/auth/logout
 * Protected — must send valid access token in Authorization header.
 * Blacklists the token so it can no longer be used.
 */
// Logout verifies an access or refresh token and revokes its entire session family.
router.post('/logout', authController.logout);

export default router;

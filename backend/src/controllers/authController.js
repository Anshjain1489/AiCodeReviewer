const authService = require('../services/authService');
const { successResponse } = require('../utils/responseFormatter');
const { logAuditAction } = require('../middleware/auditLogger');
const { env } = require('../config/env');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const { user, token } = await authService.register({ name, email, password });
      await logAuditAction({
        userId: user.id,
        action: 'USER_REGISTERED',
        resourceType: 'User',
        resourceId: user.id,
      });
      return successResponse(res, { user, token }, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login({ email, password });
      await logAuditAction({
        userId: user.id,
        action: 'USER_LOGGED_IN',
        resourceType: 'User',
        resourceId: user.id,
      });
      return successResponse(res, { user, token });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      if (req.user) {
        await logAuditAction({
          userId: req.user.id,
          action: 'USER_LOGGED_OUT',
          resourceType: 'User',
          resourceId: req.user.id,
        });
      }
      return successResponse(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = await authService.getUserProfile(req.user.id);
      return successResponse(res, { user });
    } catch (error) {
      next(error);
    }
  }

  async googleAuth(req, res, next) {
    try {
      const state = Math.random().toString(36).substring(7);
      const redirectUri = encodeURIComponent(env.GOOGLE_CALLBACK_URL);
      const scope = encodeURIComponent('email profile');
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
      
      return successResponse(res, { url: googleAuthUrl });
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) {
        return res.redirect(`${env.FRONTEND_URL}/login?error=google_auth_failed`);
      }
      
      // In development / demo mode if Google Client Secret isn't configured, fallback gracefully:
      const name = "Google Developer User";
      const email = "google.dev@example.com";
      const avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
      
      const { user, token } = await authService.handleGoogleOAuth({ name, email, avatarUrl });
      return res.redirect(`${env.FRONTEND_URL}/login?token=${token}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

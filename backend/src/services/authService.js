const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const userRepository = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { AppError } = require('../utils/responseFormatter');

class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400, 'VALIDATION_ERROR');
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400, 'INVALID_PASSWORD');
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('An account with this email address already exists', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({
      name,
      email,
      passwordHash,
      provider: 'email',
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
    }

    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DISABLED');
    }

    const token = this.generateToken(user);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token };
  }

  async handleGoogleOAuth({ name, email, avatarUrl }) {
    let user = await userRepository.findByEmail(email);
    if (!user) {
      user = await userRepository.create({
        name: name || email.split('@')[0],
        email,
        avatarUrl,
        provider: 'google',
      });
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
    }
    return user;
  }
}

module.exports = new AuthService();

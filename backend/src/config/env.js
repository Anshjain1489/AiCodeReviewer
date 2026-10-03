require('dotenv').config();

function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();

  const missing = [];

  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');

  if (isProd) {
    if (!process.env.FRONTEND_URL) missing.push('FRONTEND_URL');
    if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
    if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
    if (provider === 'gemini' && !process.env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
    if (provider === 'openai' && !process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  }

  if (missing.length > 0) {
    throw new Error(
      `FATAL ENVIRONMENT ERROR: Missing required environment variable(s): ${missing.join(', ')}. Please configure them in your backend .env file.`
    );
  }
}

module.exports = {
  validateEnv,
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL:
      process.env.GOOGLE_CALLBACK_URL ||
      (process.env.RENDER_EXTERNAL_URL
        ? `${process.env.RENDER_EXTERNAL_URL}/api/v1/auth/google/callback`
        : 'http://localhost:5000/api/v1/auth/google/callback'),
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/v1/github/callback',
    AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

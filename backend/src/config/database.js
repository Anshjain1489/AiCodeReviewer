const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Successfully connected to PostgreSQL database via Prisma.');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL database:', error);
    throw error;
  }
}

module.exports = {
  prisma,
  connectDatabase,
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(
  process.env.NODE_ENV === 'test' 
    ? { datasources: { db: { url: process.env.TEST_DATABASE_URL || 'file:./test.db' } } }
    : undefined
);
module.exports = prisma;

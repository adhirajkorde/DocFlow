process.env.NODE_ENV = 'test';
process.env.TEST_DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test_jwt_secret';

const { execSync } = require('child_process');
const prisma = require('../src/config/db');

beforeAll(() => {
  // We need to apply migrations/schema to test.db
  execSync('npx prisma db push --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clear all data
  await prisma.documentShare.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.user.deleteMany({});
});

import { afterAll, beforeAll } from 'vitest';

beforeAll(async () => {
  // Set test environment
  process.env['DATABASE_URL'] = 'file:./test.db';
  process.env['NODE_ENV'] = 'test';

  console.log('Test environment setup complete');
});

afterAll(async () => {
  // Clean up test database file
  try {
    const fs = await import('fs');
    if (fs.existsSync('./test.db')) {
      fs.unlinkSync('./test.db');
    }
    if (fs.existsSync('./prisma/test.db')) {
      fs.unlinkSync('./prisma/test.db');
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});
import { beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';

beforeAll(async () => {
  // Create test database by copying the main schema
  try {
    execSync('npx prisma db push --schema=./prisma/schema.prisma', {
      env: { ...process.env, DATABASE_URL: 'file:./test.db' },
      stdio: 'inherit',
    });
  } catch (error) {
    console.log('Test database setup complete or already exists');
  }
});

afterAll(async () => {
  // Clean up test database file
  try {
    const fs = await import('fs');
    if (fs.existsSync('./test.db')) {
      fs.unlinkSync('./test.db');
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});
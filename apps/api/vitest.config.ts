import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    hookTimeout: 30000, // 30 seconds for setup
    testTimeout: 10000, // 10 seconds per test
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dreamer/shared': path.resolve(__dirname, '../../libs/shared/src'),
    },
  },
});
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'threads', maxWorkers: 1,
    environment: 'jsdom', include: ['frontend/**/*.test.tsx', 'shared/**/*.test.ts'],
    coverage: {
      provider: 'v8', reportsDirectory: 'coverage-frontend',
      include: ['frontend/src/**/*.{ts,tsx}', 'shared/**/*.ts'],
      exclude: ['**/*.test.*', '**/types/**', '**/main.tsx'],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});

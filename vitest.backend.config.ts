import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'threads', maxWorkers: 1,
    environment: 'node', include: ['backend/**/*.test.ts'],
    coverage: {
      provider: 'v8', reportsDirectory: 'coverage-backend',
      include: ['backend/**/*.ts', 'shared/**/*.ts'],
      exclude: ['**/*.test.*', '**/types/**', 'backend/index.ts', 'shared/money.ts'],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});

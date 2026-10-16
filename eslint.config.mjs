import js from '@eslint/js';
import ts from 'typescript-eslint';

export default ts.config(
  { ignores: ['src/**', 'server/**', 'dist*/**', 'work/**', 'coverage*/**', 'node_modules/**', 'docs/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['frontend/**/*.{ts,tsx}', 'backend/**/*.ts', 'shared/**/*.ts'],
    rules: {
      eqeqeq: ['error', 'always'], 'no-var': 'error', 'prefer-const': 'error',
      'max-lines': ['error', 100],
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: false, skipComments: false }],
      'max-params': ['error', 3], 'max-depth': ['error', 3],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
);

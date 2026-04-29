import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Inject dummy env vars before any test module is loaded.
  // Jest does not read .env.local automatically (that is a Next.js feature).
  setupFiles: ['./jest.env.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'modules/**/*.ts',
    'lib/**/*.ts',
    '!**/*.d.ts',
    '!**/infrastructure/**', // integration tests use emulator
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'CommonJS' } }],
  },
};

export default config;

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['.kiro'],
  testMatch: [
    '**/*.property.test.ts',
    '**/*.test.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    '.kiro/**/*.ts',
    '!.kiro/**/*.test.ts',
    '!.kiro/**/*.d.ts',
  ],
  setupFilesAfterEnv: [],
  testTimeout: 30000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(fast-check)/)',
  ],
};
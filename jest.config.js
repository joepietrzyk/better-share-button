export default {
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/test/integration/', // Ignore Selenium integration tests
    '/node_modules/', // Always ignore node_modules
  ],
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/test/unit/**/?(*.)+(test).[tj]s?(x)'],
      testPathIgnorePatterns: ['/node_modules/', '/tests/integration/'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/style-mock.js',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'test/unit/tsconfig.json' }],
      },
    },
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testMatch: ['**/test/integration/**/*.test.[tj]s?(x)'],
      testPathIgnorePatterns: ['/node_modules/', '/src/'],
      extensionsToTreatAsEsm: ['.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/integration/jest.setup.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'test/integration/tsconfig.json' }],
      },
    },
  ],
};

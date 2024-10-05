export default {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/__test__/**/*', '!src/**/*.test.ts'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/e2e/'],
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/tests/integration/'],
      setupFilesAfterEnv: ['<rootDir>/src/__test__/jest.setup.ts'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/style-mock.js',
        '\\.svg$': '<rootDir>/__mocks__/svg-mock.js',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
      },
    },
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/e2e/**/*.test.[tj]s?(x)'],
      testPathIgnorePatterns: ['/node_modules/'],
      extensionsToTreatAsEsm: ['.ts'],
      setupFilesAfterEnv: ['<rootDir>/e2e/jest.setup.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'e2e/tsconfig.json' }],
      },
    },
  ],
};

export default {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/__test__/**/*', '!src/**/*.test.ts'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/automation/'],
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/automation/'],
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
      displayName: 'automation',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/automation/**/*.test.[tj]s?(x)'],
      testPathIgnorePatterns: ['/node_modules/'],
      extensionsToTreatAsEsm: ['.ts'],
      setupFilesAfterEnv: ['<rootDir>/automation/jest.setup.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.automation.json' }],
      },
    },
  ],
};

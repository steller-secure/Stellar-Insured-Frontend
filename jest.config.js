// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/layout.tsx',
    '!src/app/**/layout.tsx',
    '!src/middleware.ts',
  ],
  // Enforce minimum 80% coverage across all metrics (issue #156)
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    // Per-file threshold for core hooks
    './src/hooks/useDataFetch.ts': {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    './src/hooks/useForm.ts': {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    './src/hooks/useNotifications.ts': {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    './src/hooks/useWallet.ts': {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    './src/hooks/useErrorHandler.ts': {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uuid$': '<rootDir>/__mocks__/uuid.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

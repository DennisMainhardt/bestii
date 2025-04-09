/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Use node environment for Firebase rules testing
  roots: ['<rootDir>/tests'], // Specify the directory where your tests live
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
  // Add setup file if needed for global setup/teardown (optional)
  // setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  // Test timeout (increase if emulator startup is slow)
  testTimeout: 30000, // 30 seconds
  // Add transform to handle potential issues with ES modules in dependencies
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true, // Tell ts-jest to use ES Modules
      },
    ],
  },
  // Explicitly state it's an ES module project for Jest
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Helps Jest resolve module paths correctly in ESM context
  },
};

export default config; // Use ES module export

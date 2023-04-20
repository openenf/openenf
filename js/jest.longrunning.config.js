/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ["<rootDir>/jest.setup.js"],
  globalSetup: './global-longrunning-setup.js',
  globalTeardown: './global-teardown.js',
};

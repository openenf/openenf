/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ["<rootDir>/jest.setup.js"],
  globalSetup: './global-setup.js',
  globalTeardown: './global-teardown.js',
};

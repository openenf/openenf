/** @type {import('ts-jest').JestConfigWithTsJest} */

process.argv.push('--experimental-wasm-eh');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ["<rootDir>/jest.setup.js"],
};

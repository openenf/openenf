module.exports = {
    preset: 'jest-puppeteer',
    testMatch: ["**/?(*.)+(spec|test).[t]s"],
    testPathIgnorePatterns: ['/node_modules/', 'dist'], // 
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transform: {
        "^.+\\.ts?$": "ts-jest"
    }
};
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'scripts/holidays/**/*.ts',
    'scripts/auto-update-holidays.ts',
    'scripts/fetch.ts',
  ],
};

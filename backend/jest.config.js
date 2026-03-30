export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'services/**/*.js',
  ],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
};

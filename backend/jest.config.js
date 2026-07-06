module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  clearMocks: true,
  moduleNameMapper: {
    '^marked$': '<rootDir>/tests/__mocks__/marked.js'
  }
};

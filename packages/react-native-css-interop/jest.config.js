module.exports = {
  preset: 'jest-expo',
  roots: ['src'],
  setupFiles: ['./src/testing-library/setup.ts'],
  setupFilesAfterEnv: ['./src/testing-library/setupAfterEnv.ts'],
};

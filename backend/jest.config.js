/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./src/test/setup.ts"],
  modulePathIgnorePatterns: ["./dist"],
  testTimeout: 1000 * 10,
};

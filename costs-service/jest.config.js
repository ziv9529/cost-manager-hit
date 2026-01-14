/*
 * Jest Configuration File
 * This module exports the configuration settings for the Jest testing framework.
 * It specifies the test environment, coverage patterns, and test file locations.
 */
module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/tests/**/*.test.js"],
};

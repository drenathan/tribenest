/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "@src/(.*)": "<rootDir>/src/$1",
    "@config/(.*)": "<rootDir>/src/config/$1",
  },
  modulePathIgnorePatterns: ["<rootDir>/src/config", "<rootDir>/build"],
};

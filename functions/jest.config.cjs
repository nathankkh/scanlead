/** @type {import('jest').Config} */
const config = {
  verbose: true,
  transform: {},
  testMatch: ["**/?(*.)+(spec|test).[cm][jt]s?(x)", "**/src/test/**/*.[jt]s?(x)"],
};

module.exports = config;

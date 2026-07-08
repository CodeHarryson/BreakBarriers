// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // server/ and api/ are a separate Node package with their own tsconfig;
    // src/generated is Prisma's emitted client.
    ignores: ["dist/*", "server/*", "api/*"],
  }
]);

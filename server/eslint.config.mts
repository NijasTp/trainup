import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import path from "path";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, "./tsconfig.json"),
        tsconfigRootDir: __dirname,
      },
      globals: globals.node,
    },
    plugins: {
      js,
    },
    extends: ["js/recommended", ...tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
]);

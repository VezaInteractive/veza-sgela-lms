import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/** Shared flat config for all TS packages. */
export default tseslint.config(
  { ignores: ["**/dist/**", "**/.next/**", "**/generated/**", "**/coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
);

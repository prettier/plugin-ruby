import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        node: "readonly",
        jest: "readonly"
      }
    },
    rules: {
      "no-undef": "off"
    },
    ignores: ["/coverage/"]
  }
];

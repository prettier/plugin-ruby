import eslintJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
  eslintJs.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.jest,
        ...globals.node
      }
    },
    rules: {
      "no-unused-vars": "off"
    }
  },
  { ignores: ["coverage"] }
];

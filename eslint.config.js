// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    // File generati (codegen, es. OpenAPI → *.generated.ts): non si lintano né
    // si correggono a mano (verrebbero rigenerati).
    ignores: ["**/*.generated.ts"],
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Allineate a customer-portal (.eslintrc.js): suffisso classe, readonly,
      // niente non-null-assertion vietato, no-console, niente righe vuote
      // multiple, trailing comma, arrow-parens.
      "@angular-eslint/component-class-suffix": [
        "error",
        { suffixes: ["Component", "Page"] },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "comma-dangle": ["error", "always-multiline"],
      "arrow-parens": ["error", "always"],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      // Ordine standard degli attributi (struttura → ref → attributo → input →
      // two-way → output): pulito, prevedibile, e il lint indica la riga in errore.
      // Il "una proprietà per riga" è applicato da prettier (singleAttributePerLine).
      "@angular-eslint/template/attributes-order": "error",
    },
  }
]);

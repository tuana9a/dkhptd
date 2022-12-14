module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    "airbnb-base",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    indent: ["error", 2],
    quotes: [2, "double", "avoid-escape"],
    "no-underscore-dangle": "off",
    "no-unused-vars": "warn",
    "no-restricted-syntax": "off",
    "max-len": "off",
  },
  ignorePatterns: ["node_modules/**/*"],
};

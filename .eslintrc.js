module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ["airbnb-base"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    indent: ["error", 2],
    quotes: [2, "double", "avoid-escape"],
    "class-methods-use-this": "off",
    radix: "off",
    "max-len": "off",
    "no-restricted-syntax": "off",
    "no-await-in-loop": "off",
    "import/no-unresolved": "warn",
    "object-curly-newline": "off",
    "object-shorthand": "off",
    "operator-linebreak": "warn",
    "no-underscore-dangle": "off",
    "no-unused-vars": "warn",
  },
};

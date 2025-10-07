module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:promise/recommended',
  ],
  plugins: [
    'jest',
    'promise',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // General code quality
    'no-console': 'off', // We're building a console tool
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',

    // Promise handling
    'promise/always-return': 'error',
    'promise/catch-or-return': 'error',

    // Jest
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/valid-expect': 'error',
  },
  globals: {
    chrome: 'readonly',
  },
};

import sharedConfig from '../../.config/eslint.config.js';

export default [
  ...sharedConfig,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...sharedConfig[1].languageOptions.globals,
      },
    },
    rules: {
      ...sharedConfig[1].rules,
    },
  },
]; 
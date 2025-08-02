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
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      ...sharedConfig[1].rules,
      'no-console': 'off', // Allow console in server for logging
      'no-useless-catch': 'off', // Allow explicit try/catch for error handling
      'no-useless-escape': 'off', // Allow escape characters in regex
    },
  },
];
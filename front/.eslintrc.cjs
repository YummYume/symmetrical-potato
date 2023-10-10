module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  ignorePatterns: ['*.cjs'],
  rules: {
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    'import/extensions': 'off',
    'import/first': ['error'],
    'import/newline-after-import': [
      'error',
      {
        count: 1,
      },
    ],
    'import/no-absolute-path': ['error'],
    'import/no-duplicates': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-mutable-exports': 'off',
    'import/no-relative-packages': ['error'],
    'import/no-unresolved': ['error'],
    'import/no-useless-path-segments': [
      'error',
      {
        noUselessIndex: true,
      },
    ],
    'import/order': [
      'error',
      {
        alphabetize: {
          caseInsensitive: false,
          order: 'asc',
        },
        groups: ['external', 'builtin', 'internal', 'sibling', 'parent', 'index', 'object', 'type'],
        'newlines-between': 'always',
        pathGroups: [
          {
            group: 'internal',
            pattern: '@(lib|api|client-components|server-components)?/*',
          },
        ],
      },
    ],
    'import/prefer-default-export': 'off',
  },
  settings: {
    'import/resolver': {
      node: true,
      typescript: true,
    },
  },
};

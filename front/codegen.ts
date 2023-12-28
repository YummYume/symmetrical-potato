import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://api:9000/graphql',
  generates: {
    './app/lib/api/types/index.ts': {
      plugins: ['typescript'],
      config: {
        useTypeImports: true,
        maybeValue: 'T',
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
          defaultValue: false,
        },
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['bunx eslint ./app/lib/api/types/index.ts --fix'],
  },
};

export default config;

import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/node/index.ts',
    },
    bundle: true,
    splitting: true,
    outDir: 'dist',
    format: 'esm',
  },
  {
    entry: {
      client: 'src/client/index.ts',
    },
    bundle: true,
    splitting: true,
    outDir: 'dist/client',
    format: 'esm',
  },
]);

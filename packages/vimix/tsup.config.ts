import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/node/index.ts',
      cli: 'src/node/cli.ts',
      dev: 'src/node/dev.ts',
    },
    bundle: true,
    platform: 'node',
    splitting: true,
    treeshake: true,
    keepNames: true,
    outDir: 'dist',
    dts: true,
    format: ['cjs', 'esm'],
    external: [
      'esbuild',
      'typescript',
      'vite',
      'tsup',
      'es-module-lexer',
      '@vimix/node',
      /compiled/,
      'mustache',
      /vimix\/package.json/,
    ],
  },
  {
    entry: {
      client: 'src/client/index.ts',
      entry: 'src/client/entry.ts',
    },
    bundle: true,
    dts: true,
    splitting: true,
    outDir: 'dist/client',
    format: ['cjs', 'esm'],
  },
]);

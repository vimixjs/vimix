import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/node/config.ts',
    },
    bundle: true,
    platform: 'node',
    splitting: false,
    clean: true,
    treeshake: true,
    keepNames: true,
    outDir: 'config',
    dts: true,
    format: ['cjs', 'esm'],
    external: [
      'esbuild',
      'vite',
      'tsup',
      'es-module-lexer',
      '@vimix/node',
      'mustache',
      /vimix\/package.json/,
    ],
  },
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
      'vite',
      'tsup',
      'es-module-lexer',
      '@vimix/node',
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

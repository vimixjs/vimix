import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  bundle: true,
  splitting: true,
  platform: 'node',
  format: 'esm',
  external: ['vite'],
});

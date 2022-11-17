import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  bundle: true,
  splitting: true,
  outDir: 'dist',
  platform: 'node',
  format: 'esm',
});

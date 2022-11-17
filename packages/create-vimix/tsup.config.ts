import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  minifyIdentifiers: false,
  bundle: true,
  splitting: true,
  dts: true,
  clean: true,
  outDir: 'dist',
  format: 'esm',
});

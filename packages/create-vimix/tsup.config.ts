import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  minifyIdentifiers: false,
  bundle: true,
  splitting: true,
  outDir: 'dist',
  format: 'esm',
});

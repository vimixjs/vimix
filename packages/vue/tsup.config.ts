import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/node/index.ts',
    render: 'src/render/index.ts',
  },
  bundle: true,
  splitting: true,
  outDir: 'dist',
  format: 'esm',
});

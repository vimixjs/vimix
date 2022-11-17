import type { Plugin } from 'esbuild';

export const resolvePlugin = (): Plugin => {
  return {
    name: 'vimix-server-resolve',
    async setup(build) {},
  };
};

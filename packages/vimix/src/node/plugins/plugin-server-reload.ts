import fs from 'fs';
import path from 'path';
import { mergeConfig, Plugin } from 'vite';
import { VimixConfig } from '../core';
import { PUBLIC_DIR } from '../core/constants';

export function pluginServerReload(
  config: VimixConfig,
  restartServer?: () => Promise<void>,
): Plugin {
  return {
    name: 'vimix:server-reload',
    config() {
      return mergeConfig(
        {
          root: path.join(config.root),
          esbuild: {
            jsx: 'preserve',
          },
          optimizeDeps: {
            include: [
              'react',
              'react-dom',
              'react-dom/client',
              'react-router-dom',
              'react/jsx-runtime',
            ],
            exclude: ['vimix'],
          },
          css: {
            modules: {
              localsConvention: 'camelCaseOnly',
            },
          },
        },
        config.vite ?? {},
      );
    },
    enforce: 'pre',
    async handleHotUpdate(ctx) {
      console.log(`handleHotUpdate`, ctx.file);
      await restartServer?.();
    },
    configureServer(server) {
      // Serve public dir
      // Cause by the pre-bundle problem, we have to set the island package as the root dir
      // So we need to serve the public dir in user's root dir manually
      const publicDir = path.join(config.root, PUBLIC_DIR);
      if (fs.existsSync(publicDir)) {
        // server.middlewares.use(sirv(publicDir));
      }
      //   server.middlewares.use(sirv(config.root));
    },
  };
}

import react from '@vitejs/plugin-react';
import { createServer as createViteDevServer } from 'vite';
import { resolveConfig } from './core/config';
import { pluginServerReload } from './plugins/plugin-server-reload';
// import { createVitePlugins } from './vitePlugin';
import path from 'path';
import inspect from 'vite-plugin-inspect';
import pluginVimix from './plugins/vimix';

function cleanOptions(options: any) {
  const option = { ...options };
  delete option['--'];
  delete option.cacheDir;
  delete option.force;
  delete option.logLevel;
  delete option.clearScreen;
  delete option.config;
  return option;
}

export async function createDevServer(
  root = process.cwd(),
  cliOptions: any,
  restartServer: () => Promise<void>,
) {
  const config = await resolveConfig({
    root,
    mode: 'development',
  });
  console.log('config', config);
  const plugins = [
    pluginVimix(),
    react({
      include: [/\.tsx?$/, /\.jsx?$/],
    }),
    cliOptions.inspect ? inspect({ outputDir: path.join('.vimix', 'inspect') }) : undefined,
    pluginServerReload(config, restartServer),
  ];
  return createViteDevServer({
    root,
    base: '/',
    optimizeDeps: { force: cliOptions.force },
    cacheDir: cliOptions.cacheDir,
    logLevel: cliOptions.logLevel,
    clearScreen: cliOptions.clearScreen,
    configFile: false,
    server: {
      open: cliOptions.open,
      ...cleanOptions(cliOptions),
      port: config.port ?? cliOptions.port ?? 3000,
    },
    plugins,
  });
}

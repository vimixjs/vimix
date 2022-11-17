import react from '@vitejs/plugin-react';
import { createServer as createViteDevServer } from 'vite';
import { resolveConfig } from './core/config';
import { pluginServerReload } from './plugins/plugin-server-reload';
// import { createVitePlugins } from './vitePlugin';

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
    react({
      include: [/\.tsx?$/, /\.jsx?$/],
    }),
    pluginServerReload(config, restartServer),
  ];
  return createViteDevServer({
    root,
    base: '/',
    optimizeDeps: { force: cliOptions.force },
    cacheDir: cliOptions.cacheDir,
    logLevel: cliOptions.logLevel,
    clearScreen: cliOptions.clearScreen,
    server: {
      ...cleanOptions(cliOptions),
      port: config.port ?? 3000,
    },
    plugins,
  });
}

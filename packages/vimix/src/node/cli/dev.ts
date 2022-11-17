import type { WatchOptions } from 'chokidar';
import { resolveConfig, VimixConfig } from '../core';

export async function createDevServer(config: VimixConfig) {
  // logger.debug('vimix createDevServer', { config: JSON.stringify(config) });
  // const closeWatcher = await watch(config);
  // logger.debug('vimix createDevServer closeWatcher');
  // let resolve: () => void;
  // exitHook(() => {
  //   closeWatcher();
  //   resolve();
  // });
  // return new Promise<void>((r) => {
  //   resolve = r;
  // }).then(async () => {
  //   await closeWatcher();
  // });
}

export function resolveChokidarOptions(opts?: WatchOptions) {
  const { ignored = [], ...otherOptions } = opts ?? {};
  const resolvedChokidarOptions: WatchOptions = {
    ignored: [
      '**/.git/**',
      '**/node_modules/**',
      '**/test-results/**',
      ...(Array.isArray(ignored) ? ignored : [ignored]),
    ],
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ...otherOptions,
  };

  return resolvedChokidarOptions;
}

async function rebuildServer() {}

export async function dev(root: string, opts: any) {
  const config = await resolveConfig({
    root,
    mode: 'development',
  });
  // console.log(config);
  // const closeWatcher = await watch(config);
  // logger.debug('vimix createDevServer closeWatcher');
  // let resolve: () => void;
  // process.on('exit', () => {
  //   // })
  //   // exitHook(() => {
  //   closeWatcher();
  //   resolve();
  // });
  // return new Promise<void>((r) => {
  //   resolve = r;
  // }).then(async () => {
  //   await closeWatcher();
  // });
  try {
    const createServer = async () => {
      const { createDevServer } = await import(`./dev.js?t=${Date.now()}`);
      const server = await createDevServer(config.root, opts, async () => {
        await server.close();
        await createServer();
      });
      await server.listen();
      server.printUrls();
    };
    await createServer();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

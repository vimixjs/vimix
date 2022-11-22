import spawn from 'cross-spawn';
import { isObject } from 'lodash-es';
import type { ChildProcess, Serializable } from 'node:child_process';
import { treeKillSync as killProcessSync } from '../../shared/lib/tree-kill';
import { logger, VimixConfig } from '../core';

export interface VimixServer {
  config: VimixConfig;
  /**
   * Start the server.
   */
  listen(port?: number, isRestart?: boolean): Promise<VimixServer>;
  /**
   * Stop the server.
   */
  close(): Promise<void>;
  /**
   * Print server urls
   */
  printUrls(): void;
  /**
   * Restart the server.
   *
   * @param forceOptimize - force the optimizer to re-bundle, same as --force cli flag
   */
  restart(forceOptimize?: boolean): Promise<void>;
}

function isReadyPayload(
  payload: unknown,
): payload is { type: 'vimix:ready'; finishTime: number; memoryUsage: string } {
  return isObject(payload) && (payload as Record<string, unknown>).type === 'vimix:ready';
}

function getMemoryUsage() {
  const size = 1 << 20;
  const used = process.memoryUsage().heapUsed / size;
  const rss = process.memoryUsage().rss / size;
  return `Memory Usage: ${Math.round(used * 100) / 100} MB (RSS: ${
    Math.round(rss * 100) / 100
  } MB)`;
}

/**
 * Create a new Vimix server.
 */
export async function createServer(opt: VimixConfig, cb?: (server: VimixServer) => void) {
  const config = opt;

  let childRef: ChildProcess | undefined;

  const createChildProcess = ({ port }: { port?: number } = {}) => {
    const ref = spawn('node', [config.serverBuildPath], {
      env: {
        ...process.env,
        PORT: String(port ?? config.port),
      },
      cwd: process.cwd(),
      shell: true,
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    });

    function onReady(payload: Serializable) {
      if (isReadyPayload(payload)) {
        logger.debug('vimix createServer fork onReady');
        const memoryUsage = getMemoryUsage();
        logger.info(`Server is ready. \n${memoryUsage || ''}`);
        ref.removeListener('message', onReady);
      }
    }
    ref.on('message', onReady);
    ref.on('error', () => {
      ref.removeListener('message', onReady);
    });
    return ref;
  };

  const server: VimixServer = {
    config,
    listen: async (port: number, isRestart = false) => {
      if (!isRestart) {
        childRef = createChildProcess({ port });
        childRef.on('exit', () => (childRef = undefined));
      }
      return Promise.resolve(server);
    },
    printUrls: () => {
      // console.log('111');
    },
    close: async () => {
      childRef?.pid && killProcessSync(childRef.pid);
    },
    restart: async () => {
      if (childRef) {
        childRef.removeAllListeners('exit');
        childRef.on('exit', () => {
          childRef = createChildProcess();
          childRef.on('exit', () => (childRef = undefined));
        });
        childRef.stdin && childRef.stdin.destroy();
        childRef.pid && killProcessSync(childRef.pid);
      } else {
        childRef = createChildProcess();
        childRef.on('exit', () => (childRef = undefined));
      }
    },
  };

  cb?.(server);
  return server;
}

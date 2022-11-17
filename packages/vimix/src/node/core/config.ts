import fs from 'fs';
import path, { isAbsolute, join } from 'node:path';
import { loadConfigFromFile } from 'vite';
import { DEFAULT_PORT } from '../constants';
import { isValidServerMode, ServerMode } from './config/server-mode';
import type { VimixConfig, VimixUserConfig } from './config/types';
import { configFiles } from './constants';

interface ResolveConfigOptions {
  root: string;
  mode: ServerMode;
}

export function defineConfig(config: VimixUserConfig): VimixUserConfig {
  return config;
}

export async function resolveUserConfig(opts: ResolveConfigOptions) {
  const { root } = opts;
  const configPaths = configFiles
    .map((p) => path.join(root, p))
    .filter((p) => fs.existsSync(p));
  if (!configPaths.length) return null;
  if (configPaths.length > 1) {
    console.log(`Exist multiple config files. Now use ${configPaths[0]}`);
  }
  // Use vite internal config loader
  const result = await loadConfigFromFile(
    { command: 'serve', mode: opts.mode },
    configPaths[0],
    root,
  );
  if (result) {
    const { config, dependencies = [], path: configPath } = result;
    return { configPath, config, dependencies };
  } else {
    return null;
  }
}

export function readConfig() {
  const config = resolveConfig({
    root: process.env.VIMIX_ROOT || (process.cwd() as string),
    mode: 'production',
  });
  return config;
}

export function generateConfig(
  userConfig: Awaited<ReturnType<typeof resolveUserConfig>>,
  opts: ResolveConfigOptions,
) {
  const config: VimixConfig = {
    root: process.cwd!(),
    serverBuildPath: '',
    port: DEFAULT_PORT,
    mode: 'production',
    buildPath: '.vimix',
    server: {
      format: 'cjs',
      outDir: 'server',
      entry: 'server/index.ts',
      outputFile: 'server/index.js',
    },
    ...(userConfig?.config || {}),
  } as any;
  config.serverBuildPath = isAbsolute(config.serverBuildPath)
    ? config.serverBuildPath
    : join(
        opts.root,
        config.serverBuildPath || join(config.buildPath, 'server/index.js'),
      );
  config.root = opts.root;
  return config as VimixConfig;
}

export async function resolveConfig(opts: ResolveConfigOptions) {
  const { mode, root } = opts;
  let vimixRoot = root;
  if (!vimixRoot) {
    vimixRoot = process.env.VIMIX_ROOT || process.cwd!();
    process.env.VIMIX_ROOT = vimixRoot;
  }

  if (!isValidServerMode(mode)) {
    throw new Error(`Invalid server mode "${mode}"`);
  }

  const userConfig = await resolveUserConfig({
    root: vimixRoot,
    mode,
  });
  const config = generateConfig(userConfig, { root: vimixRoot, mode });

  (global as any).__vimix_config = config;

  return config;
}

export { ServerMode, VimixConfig, VimixUserConfig, isValidServerMode };

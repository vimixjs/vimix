import type { UserConfig as ViteConfiguration } from 'vite';
import { ServerMode } from './server-mode';

export interface VimixAdapter {
  name: string;
  serverEntrypoint?: string;
  exports?: string[];
  args?: any;
}

export interface VimixIntegration {
  name: string;
  hooks?: {
    onConfigDone?: (options: {
      config: VimixConfig;
      setAdapter: (adapter: VimixAdapter) => void;
    }) => void | Promise<void>;
  };
}

export interface VimixConfig {
  port: number;
  serverBuildPath: string;
  buildPath: string;
  root: string;
  mode: ServerMode;
  adapter?: VimixIntegration[];
  server: {
    format: 'cjs';
    outDir: string;
    entry: string;
    outputFile: string;
  };
  vite?: ViteConfiguration;
}

export type VimixUserConfig = Partial<VimixConfig>;

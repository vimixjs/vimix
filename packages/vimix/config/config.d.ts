import { UserConfig } from 'vite';

type ServerMode = 'development' | 'production' | 'test';

interface VimixAdapter {
    name: string;
    serverEntrypoint?: string;
    exports?: string[];
    args?: any;
}
interface VimixIntegration {
    name: string;
    hooks?: {
        onConfigDone?: (options: {
            config: VimixConfig;
            setAdapter: (adapter: VimixAdapter) => void;
        }) => void | Promise<void>;
    };
}
interface VimixConfig {
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
    vite?: UserConfig;
}
type VimixUserConfig = Partial<VimixConfig>;

declare function defineConfig(config: VimixUserConfig): VimixUserConfig;

export { VimixConfig, defineConfig };

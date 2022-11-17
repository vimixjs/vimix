import chokidar from 'chokidar';
import esbuild from 'esbuild';
import fs from 'fs';
import { debounce } from 'lodash-es';
import { createRequire } from 'module';
import path from 'path';
import { templateDir } from '../constants';
import { VimixConfig, logger, Mustache, ServerMode } from '../core';

const require = createRequire(import.meta.url);
function defaultWarningHandler(message: string, key: string) {
  console.log(message, key);
}

export type BuildError = Error | esbuild.BuildFailure;

function defaultBuildFailureHandler(failure: BuildError) {
  console.log(failure);
}

async function buildEverything(
  config: VimixConfig,
  options: Required<BuildOptions> & { incremental?: boolean },
): Promise<(esbuild.BuildResult | undefined)[]> {
  try {
    const serverBuildPromise = createServerBuild(config, options);
    const browserBuildPromise = createBrowserBuild(config, options);

    return await Promise.all([serverBuildPromise, browserBuildPromise]);
  } catch (error: any) {
    logger.error(error.message);
    return [undefined, undefined];
  }
}

interface BuildConfig {
  mode: ServerMode;
  format: 'cjs' | 'esm';
}

interface BuildOptions extends Partial<BuildConfig> {
  onWarning?(message: string, key: string): void;

  onBuildFailure?(failure: Error | esbuild.BuildFailure): void;
}

interface WatchOptions extends BuildOptions {
  onRebuildStart?(): void;
  onRebuildFinish?(): void;
  onFileCreated?(file: string): void;
  onFileChanged?(file: string): void;
  onFileDeleted?(file: string): void;
  onInitialBuild?(): void;
}

export async function watch(
  config: VimixConfig,
  {
    mode = 'development',
    onFileChanged,
    onFileCreated,
    onFileDeleted,
    onInitialBuild,
    onRebuildFinish,
    onRebuildStart,
    onWarning = defaultWarningHandler,
    onBuildFailure = defaultBuildFailureHandler,
  }: WatchOptions = {},
) {
  const toWatch = [path.join(config.root, 'server')];
  const options = {
    mode,
    format: config.server.format,
    onWarning,
    onBuildFailure,
    incremental: true,
  };
  logger.debug('before buildEverything');
  let [serverBuild, browserBuild] = await buildEverything(config, options);
  logger.debug('after buildEverything');

  const initialBuildComplete = !!browserBuild && !!serverBuild;
  if (initialBuildComplete && onInitialBuild) {
    onInitialBuild();
  }

  function disposeBuilders() {
    browserBuild?.rebuild?.dispose();
    serverBuild?.rebuild?.dispose();
    browserBuild = undefined;
    serverBuild = undefined;
  }

  const rebuildEverything = debounce(async () => {
    if (onRebuildStart) onRebuildStart();
    if (!serverBuild?.rebuild) {
      disposeBuilders();
      return;
    }
    await Promise.all([
      serverBuild
        .rebuild()
        .then((build) =>
          writeServerBuildResult(
            config,
            { mode, format: config.server.format },
            build.outputFiles!,
          ),
        ),
    ]);
    if (onRebuildFinish) onRebuildFinish();
  }, 500);

  const watcher = chokidar
    .watch(toWatch, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    })
    .on('error', (error) => console.error(error))
    .on('change', async (file) => {
      if (onFileChanged) onFileChanged(file);
      await rebuildEverything();
    })
    .on('add', async (file) => {
      if (onFileCreated) onFileCreated(file);
      await rebuildEverything();
    })
    .on('unlink', async (file) => {
      if (onFileDeleted) onFileDeleted(file);
      await rebuildEverything();
    });

  return async () => {
    await watcher.close().catch(() => {});
    disposeBuilders();
  };
}

export async function createServerBuild(
  config: VimixConfig,
  {
    mode,
    incremental,
    format,
  }: Required<BuildOptions> & { incremental?: boolean },
) {
  // auto externalize node_modules
  logger.debug('start createServerBuild');
  const pkg = require(path.join(config.root, 'package.json'));
  const localeTpl = fs.readFileSync(
    path.join(templateDir, 'server/main.ts.mustache'),
    'utf-8',
  );
  const entryPath = path.join(config.root, config.buildPath, 'src/server.ts');
  fs.mkdirSync(path.dirname(entryPath), { recursive: true });
  const entryContent = Mustache.render(localeTpl, {
    config: JSON.stringify(config),
    serverPath: path.join(config.root, 'server/index'),
  });

  fs.writeFileSync(entryPath, entryContent);
  logger.debug('write server entry file');
  const build = await esbuild.build({
    entryPoints: [entryPath],
    outfile: config.serverBuildPath,
    minifySyntax: true,
    jsx: 'automatic',
    sourceRoot: config.root,
    write: false,
    format,
    minify: mode === 'production',
    platform: 'node',
    target: 'es2020',
    bundle: true,
    mainFields: ['module', 'main'],
    plugins: [],
    keepNames: true,
    sourcemap: true,
    incremental,
    treeShaking: true,
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ].filter((dep) => !dep.startsWith('@vimix/')),
  });
  logger.debug('server build done');
  await writeServerBuildResult(config, { mode, format }, build.outputFiles);
  logger.debug('server write output done');
  return build;
}

export function createBrowserBuild(
  config: VimixConfig,
  { mode, incremental }: Required<BuildOptions> & { incremental?: boolean },
) {
  return esbuild.build({
    absWorkingDir: config.root,
    entryPoints: { index: 'app/root.tsx' },
    outdir: path.join(config.root, config.buildPath, 'browser'),
    minifySyntax: true,
    jsx: 'automatic',
    format: 'esm',
    target: 'es2020',
    minify: mode === 'production',
    platform: 'browser',
    bundle: true,
    metafile: true,
    incremental,
    entryNames: '[dir]/[name]-[hash]',
    chunkNames: '_shared/[name]-[hash]',
    assetNames: '_assets/[name]-[hash]',
    mainFields: ['browser', 'module', 'main'],
    splitting: true,
    jsxDev: mode !== 'production',
    keepNames: true,
    treeShaking: true,
  });
}

export async function build(
  config: VimixConfig,
  {
    mode = 'production',
    onWarning = defaultWarningHandler,
    onBuildFailure = defaultBuildFailureHandler,
  }: BuildOptions = {},
) {
  const options = {
    mode,
    format: config.server.format,
    onWarning,
    onBuildFailure,
  };
  return buildEverything(config, options);
}

export async function writeServerBuildResult(
  config: VimixConfig,
  { mode }: BuildConfig,
  outputFiles: esbuild.OutputFile[] = [],
) {
  if (!outputFiles) return;

  for (const file of outputFiles) {
    fs.mkdirSync(path.dirname(file.path), { recursive: true });
    if (file.path.endsWith('.js')) {
      if (mode === 'development') {
        delete require.cache[file.path];
      }
      // fix sourceMappingURL to be relative to current path instead of /build
      const filename = file.path.substring(file.path.lastIndexOf(path.sep) + 1);
      const escapedFilename = filename.replace(/\./g, '\\.');
      const pattern = `(//# sourceMappingURL=)(.*)${escapedFilename}`;
      let contents = Buffer.from(file.contents).toString('utf-8');
      contents = contents.replace(new RegExp(pattern), `$1${filename}`);
      fs.writeFileSync(file.path, contents, 'utf-8');
    } else if (file.path.endsWith('.map')) {
      // remove route: prefix from source filenames so breakpoints work
      let contents = Buffer.from(file.contents).toString('utf-8');
      contents = contents.replace(/"route:/gm, '"');
      fs.writeFileSync(file.path, contents, 'utf-8');
    } else {
      fs.mkdirSync(path.dirname(file.path), { recursive: true });
      fs.writeFileSync(file.path, file.contents, 'utf-8');
    }
  }
}

import { createRequire } from 'module';
import tsup, { Options } from 'tsup';
import yArgs from 'yargs-parser';
import 'zx/globals';
const _require = createRequire(import.meta.url);

const args = yArgs(process.argv.slice(2));

function bundless(files: string[], format: 'cjs' | 'esm', opts: Options) {
  const outDir = format;
  const { name } = _require(path.join(process.cwd(), './package.json'));
  const options: Options = {
    ...opts,
    name: `bundless ${name} ${format}`,
    entry: files,
    format,
    outDir,
    outExtension() {
      return { js: '.js' };
    },
    async onSuccess() {
      console.log(`Built ${format} files`);
      await fs.promises.writeFile(
        path.resolve(`${outDir}/package.json`),
        JSON.stringify({ type: format === 'esm' ? 'module' : 'commonjs' }),
        'utf-8',
      );
    },
  };
  return options;
}

(async () => {
  const opts = _require(path.join(process.cwd(), 'tsup.config.ts')).default;

  const options = [opts].flat();
  const { watch } = args;
  // const files = await glob(['src/**/*.ts', '!src/**/*.(d|test|spec).ts'], {});
  const baseOptions: Options = {
    skipNodeModulesBundle: false,
    silent: true,
    minifyIdentifiers: false,
    shims: true,
    dts: true,
    config: false,
    sourcemap: watch ? 'inline' : false,
    target: 'node14',
  };
  const umdBuild: Options[] = options.map((opt) => ({
    ...baseOptions,
    ...opt,
    outDir: opt.outDir ?? 'dist',
  }));

  // const buildOptions = [
  //   bundless(files, 'cjs', baseOptions),
  //   bundless(files, 'esm', baseOptions),
  //   ...umdBuild,
  // ];

  // await Promise.all(
  //   buildOptions.map((option) => {
  await tsup.build({
    silent: false,
  });
  // }),
  // );
})();

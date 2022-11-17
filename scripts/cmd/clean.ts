import path from 'node:path';
import rimraf from 'rimraf';
import { eachPkg, getPkgs } from '../utils';

(async () => {
  const pkgs = getPkgs();
  eachPkg(pkgs, ({ dir }) => {
    rimraf.sync(path.join(dir, 'dist'));
    rimraf.sync(path.join(dir, '.turbo'));
    rimraf.sync(path.join(dir, 'esm'));
    rimraf.sync(path.join(dir, 'cjs'));
  });
  rimraf.sync(path.join(process.cwd(), '.turbo'));
})();

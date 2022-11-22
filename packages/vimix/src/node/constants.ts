import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const getRoot = () => {
  if (typeof require !== 'undefined' && typeof require.resolve !== 'undefined') {
    return dirname(require.resolve('vimix/package.json'));
  }
  return dirname(createRequire(import.meta.url).resolve('vimix/package.json'));
};

export const pkgRoot = getRoot();
console.log(pkgRoot);
export const templateDir = join(pkgRoot, 'templates');

export const PATHS = {
  ROOT: pkgRoot,
  TEMPLATE_DIR: templateDir,
};

export const DEFAULT_PORT = 3001;

import fsCache from 'file-system-cache';
import path from 'path';
import { _rDefault } from './utils';

const CACHE_PATH = 'node_modules/.cache/vimix';

const Cache = _rDefault<typeof fsCache>(fsCache);

const caches: Record<string, ReturnType<typeof Cache>> = {};

/**
 * get file-system cache for specific namespace
 */
export function getCache(ns: string): typeof caches['0'] {
  if (process.env.VIMIX_CACHE === 'none') {
    return { set() {}, get() {}, setSync() {}, getSync() {} } as any;
  }

  return (caches[ns] ??= Cache({ basePath: path.join(CACHE_PATH, ns) }));
}

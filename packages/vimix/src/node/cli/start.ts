import { logger, resolveConfig } from '../core';

export async function start(vimixRoot: string, opts: { port?: number }) {
  logger.debug(`vimix start vimixRoot:${vimixRoot}`);
  const config = await resolveConfig({
    root: vimixRoot,
    mode: 'production',
  });
  logger.debug('vimix start config');
}

import { logger, resolveConfig } from '../core';

export async function build(vimixRoot: string) {
  logger.debug('111');
  const config = resolveConfig({
    root: vimixRoot,
    mode: 'production',
  });
  console.log(config);
  logger.debug('222');
  // await compiler.build(config, { mode: 'production' });
}

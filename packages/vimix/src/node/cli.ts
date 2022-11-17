import { cac } from 'cac';
import path from 'node:path';
// @ts-expect-error
import { version } from '../../package.json';
import { build } from './cli/build';
import { dev } from './cli/dev';
import { routes } from './cli/routes';
import { start } from './cli/start';
import { DEFAULT_PORT } from './constants';

const cli = cac('vimix').version(version).help();

export async function run() {
  // logger.debug('vimix Service');
  cli
    .command('dev [root]', 'start dev server')
    .allowUnknownOptions()
    .option('--config <path>', 'Use a custom config file')
    .option('-p, --port <port>', 'dev server port', { default: DEFAULT_PORT })
    .action((root: string, devOptions: any) =>
      dev(path.resolve(root), devOptions),
    );

  cli
    .command('build [root]', 'build for production')
    .allowUnknownOptions()
    .option('--config <path>', 'Use a custom config file')
    .action(build);

  cli
    .command('start [root]', 'serve for production')
    .allowUnknownOptions()
    .option('--port <port>', 'port to use for serve')
    .option('--watch', 'watch for file changes')
    .option('--config <path>', 'Use a custom config file')
    .option('--inspect', 'enable the Node.js inspector')
    .option('-h, --host <host>', 'dev server host', { default: '0.0.0.0' })
    .option('-p, --port <port>', 'dev server port', { default: DEFAULT_PORT })
    .action(start);

  cli
    .command('routes [root]', 'routes for vimix')
    .option('--type <type>', 'type of routes', {
      default: 'json',
      type: ['json', 'jsx'],
    })
    .action(routes);

  // Listen to unknown commands
  cli.on('command:*', () => {
    console.error('Invalid command: %s', cli.args.join(' '));
    process.exit(1);
  });

  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
}

import { cac } from 'cac';
import makeDebug from 'debug';
import path from 'node:path';
import { version } from '../../package.json';
import { build } from './cli/build';
import { dev } from './cli/dev';
import { routes } from './cli/routes';
import { start } from './cli/start';
import { DEFAULT_PORT } from './constants';

const DEBUG = makeDebug('vimix');

const cli = cac('vimix').version(version).help();

export async function run() {
  cli
    .command('dev [root]', 'Start a development server')
    .allowUnknownOptions()
    .option('--config <path>', 'Use a custom config file')
    .option('-i, --inspect', 'Node inspector', { default: false })
    .option('-p, --port <port>', 'Port to start server on', { default: DEFAULT_PORT })
    .option('-o, --open', 'Open a browser tab', { default: false })
    .action(async (_root: string, devOptions: any) => {
      console.log(devOptions);
      const root = path.resolve(_root || '.');
      await dev(root, devOptions);
    });

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

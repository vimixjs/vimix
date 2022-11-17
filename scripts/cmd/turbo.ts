import { PATHS } from '../internal/const';
import { spawnSync } from '../utils';

(async () => {
  const args = process.argv.slice(2);

  // no cache
  if (args.includes('--no-cache')) {
    args.push('--force');
  }

  // filter
  if (!args.includes('--filter')) {
    // Tips: should use double quotes, single quotes are not valid on windows.
    args.push('--filter="./packages/*"');
  }

  // turbo cache
  if (!args.includes('--cache-dir')) {
    args.push('--cache-dir=".turbo"');
  }

  //turbo env
  if (args.includes('--prod')) {
    process.env.NODE_ENV = 'production';
    args.splice(args.indexOf('--prod'), 1);
    args.push('--force');
  }

  const command = `turbo run ${args.join(' ')}`;
  spawnSync(command, { cwd: PATHS.ROOT, env: process.env });
})();

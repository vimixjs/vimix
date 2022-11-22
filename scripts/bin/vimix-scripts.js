#!/usr/bin/env node

import assert from 'assert';
import { sync } from 'cross-spawn';
import fs from 'node:fs';
import path from 'node:path';
import colors from 'picocolors';
import { fileURLToPath } from 'url';

const argv = process.argv.slice(2);
const name = argv[0];

const scriptsPath = path.join(fileURLToPath(import.meta.url), `../../cmd/${name}.ts`);

assert(
  fs.existsSync(scriptsPath) && !name.startsWith('.'),
  `Executed script '${colors.red(name)}' does not exist`,
);

console.log(colors.cyan(`vimix-scripts: ${name}\n`));

const spawn = sync('tsx', [scriptsPath, ...argv.slice(1)], {
  env: process.env,
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
});
if (spawn.status !== 0) {
  console.log(colors.red(`vimix-scripts: ${name} execute fail`));
  process.exit(1);
}

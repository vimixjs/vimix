#!/usr/bin/env node

(async () => {
  const { run } = await import('../dist/cli.js');
  await run(process.argv.slice(2));
})();

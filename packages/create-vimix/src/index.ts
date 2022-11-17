#!/usr/bin/env node

(async () => {
  const { run } = await import('./cli');
  await run(process.argv.slice(2));
})();

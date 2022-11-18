#!/usr/bin/env node

(async () => {
  const { run } = await import('./dist/index.js');
  await run(process.argv.slice(2));
})();

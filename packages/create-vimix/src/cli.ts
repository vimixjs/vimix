#!/usr/bin/env node

(async () => {
  const { run } = await import('.');
  await run(process.argv.slice(2));
})();

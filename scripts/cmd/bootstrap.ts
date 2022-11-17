import 'zx/globals';

(async () => {
  $.verbose = false;
  await $`pnpm build`;
  $.verbose = true;
})();

import 'zx/globals';
import { version } from '../../lerna.json';
import { getPkgs } from '../utils';

async function main() {
  const pkgs = getPkgs();

  let tag = 'latest';
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    tag = 'next';
  }
  if (version.includes('-canary.')) tag = 'canary';
  const innersPkgs: string[] = [];
  const publishPkgs = pkgs.filter(
    // do not publish
    (pkg) => !innersPkgs.includes(pkg),
  );
  await Promise.all(
    publishPkgs.map((pkg) => $`cd packages/${pkg} && npm publish --tag ${tag}`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

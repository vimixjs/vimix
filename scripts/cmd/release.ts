import fse from 'fs-extra';
import getGitRepoInfo from 'git-repo-info';
import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import rimraf from 'rimraf';
import 'zx/globals';
import { PATHS } from '../internal/const';
import { eachPkg, getPkgs } from '../utils';
import { logger } from '../utils/logger';

(async () => {
  const { branch } = getGitRepoInfo();
  logger.info(`branch: ${branch}`);

  const pkgs = getPkgs();
  logger.event(`pkgs: ${pkgs.join(', ')}`);

  // check git status
  logger.event('check git status');
  const isGitClean = (await $`git status --porcelain`).stdout.trim().length;
  assert(!isGitClean, 'git status is not clean');

  // check git remote update
  logger.event('check git remote update');
  await $`git fetch`;
  const gitStatus = (await $`git status --short --branch`).stdout.trim();
  assert(!gitStatus.includes('behind'), 'git status is behind remote');

  // check npm registry
  logger.event('check npm registry');
  const registry = (await $`npm config get registry`).stdout.trim();
  assert(
    registry === 'https://registry.npmjs.org/',
    'npm registry is not https://registry.npmjs.org/',
  );

  // check package changed
  logger.event('check package changed');
  const changed = (await $`pnpm exec changeset status`).stdout.trim();
  assert(changed, 'no package is changed');

  // check npm ownership
  logger.event('check npm ownership');
  const whoami = (await $`npm whoami`).stdout.trim();
  await Promise.all(
    ['vimix'].map(async (pkg) => {
      const owners = (await $`npm owner ls ${pkg}`).stdout
        .trim()
        .split('\n')
        .map((line) => {
          return line.split(' ')[0];
        });
      assert(owners.includes(whoami), `${pkg} is not owned by ${whoami}`);
    }),
  );

  // clean
  logger.event('clean');
  eachPkg(pkgs, ({ dir, name }) => {
    logger.event(`clean dist of ${name}`);
    rimraf.sync(join(dir, 'dist'));
  });

  $.verbose = false;
  console.log('pnpm i');
  await $`pnpm i`;
  $.verbose = true;

  console.log('pnpm build');
  await $`pnpm build`;

  // generate changelog
  // TODO
  logger.event('generate changelog');

  // bump version
  logger.event('bump version');
  await $`lerna version --exact --no-commit-hooks --no-git-tag-version --no-push --loglevel error`;
  const { version } = await import(PATHS.LERNA_CONFIG);
  let tag = 'latest';
  if (version.includes('-alpha.') || version.includes('-beta.') || version.includes('-rc.')) {
    tag = 'next';
  } else if (version.includes('-canary.')) {
    tag = 'canary';
  } else if (!/^\d+\.\d+(?:\.\d+)?$/.test(version)) {
    console.warn(`version ${version} is not valid`);
    return;
  }

  logger.event('update example versions');
  const examplesDir = PATHS.EXAMPLES;
  const examples = fs.readdirSync(examplesDir).filter((dir) => {
    return !dir.startsWith('.') && existsSync(join(examplesDir, dir, 'package.json'));
  });
  examples.forEach((example) => {
    const pkg = fse.readJSONSync(join(examplesDir, example, 'package.json'));
    // change deps version
    setDepsVersion({
      pkg,
      version,
      deps: ['@vimix/node', '@vimix/react', '@vimix/vue', 'create-vimix', 'vimix'],
    });
    delete pkg.version;
    fs.writeFileSync(
      join(examplesDir, example, 'package.json'),
      `${JSON.stringify(pkg, null, 2)}\n`,
    );
  });

  // update pnpm lockfile
  logger.event('update pnpm lockfile');
  $.verbose = false;
  await $`pnpm i`;
  $.verbose = true;

  // commit
  logger.event('commit');
  await $`git commit --all --message "chore(release): ${version}"`;

  // git tag
  if (tag !== 'canary') {
    await $`git tag v${version}`;
  }

  // git push
  logger.event('git push');
  $.verbose = false;
  await $`git push origin ${branch} --tags`;

  const innersPkgs: string[] = ['@vimix/codemod'];

  // check 2fa config
  let otpArg: string[] = [];
  if ((await $`npm profile get "two-factor auth"`).toString().includes('writes')) {
    let code = '';
    do {
      // get otp from user
      code = await question('This operation requires a one-time password: ');
      // generate arg for zx command
      // why use array? https://github.com/google/zx/blob/main/docs/quotes.md
      otpArg = ['--otp', code];
    } while (code.length !== 6);
  }

  const publishPkgs = pkgs.filter(
    // do not publish
    (pkg) => !innersPkgs.includes(pkg),
  );
  await Promise.all(
    publishPkgs.map(async (pkg) => {
      await $`cd packages/${pkg} && npm publish --tag ${tag} ${otpArg}`;
      logger.info(`+ ${pkg}`);
    }),
  );
  $.verbose = true;
})();

function setDepsVersion(opts: { deps: string[]; pkg: Record<string, any>; version: string }) {
  const { deps, pkg, version } = opts;
  pkg.dependencies ||= {};
  deps.forEach((dep) => {
    if (pkg?.dependencies?.[dep]) {
      pkg.dependencies[dep] = version;
    }
    if (pkg?.devDependencies?.[dep]) {
      pkg.devDependencies[dep] = version;
    }
  });
  return pkg;
}

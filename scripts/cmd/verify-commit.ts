import fs from 'fs';
import colors from 'picocolors';

const msgPath = process.argv[2];
if (!msgPath) process.exit();

const msg = removeComment(fs.readFileSync(msgPath, 'utf-8').trim());
const commitRE =
  /^(revert: )?(feat|fix|docs|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release|dep|example|Merge)(\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${colors.bgWhite(' ERROR ')} ${colors.red(
      'invalid commit message format.',
    )}\n\n` +
      colors.red(
        '  Proper commit message format is required for automated changelog generation. Examples:\n\n',
      ) +
      `    ${colors.green("feat(bundler-webpack): add 'comments' option")}\n` +
      `    ${colors.green(
        'fix(core): handle events on blur (close #28)',
      )}\n\n` +
      colors.red('  See .github/commit-convention.md for more details.\n'),
  );
  process.exit(1);
}

function removeComment(msg: string) {
  return msg.replace(/^#.*[\n\r]*/gm, '');
}

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const generatedFile = resolve(projectRoot, 'src/app/core/config/build-version.ts');

let commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '';

if (!commit) {
  try {
    commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: projectRoot,
      encoding: 'utf8'
    }).trim();
  } catch {
    commit = 'development';
  }
}

commit = commit.slice(0, 7) || 'development';
mkdirSync(dirname(generatedFile), { recursive: true });
writeFileSync(
  generatedFile,
  `export const BUILD_VERSION = '${commit}';\n`,
  'utf8'
);

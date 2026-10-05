import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function getMermaidBlock(markdown) {
  const match = markdown.match(/```mermaid\r?\n([\s\S]*?)\r?\n```/);

  if (!match) {
    throw new Error('No mermaid code block found in the provided Markdown file.');
  }

  return match[1].trim();
}

const [, , inputArg, outputArg, scaleArg] = process.argv;

if (!inputArg) {
  console.error('Usage: node scripts/export-mermaid.mjs <input.md> [output.png] [scale]');
  process.exit(1);
}

const inputPath = resolve(inputArg);
const outputPath = outputArg
  ? resolve(outputArg)
  : resolve(dirname(inputPath), `${basename(inputPath, '.md')}.png`);
const scale = scaleArg ?? '2';

const markdown = readFileSync(inputPath, 'utf8');
const mermaidSource = getMermaidBlock(markdown);

const tempDir = mkdtempSync(join(tmpdir(), 'mermaid-export-'));
const tempInputPath = join(tempDir, `${basename(inputPath, '.md')}.mmd`);

writeFileSync(tempInputPath, `${mermaidSource}\n`, 'utf8');

const result =
  process.platform === 'win32'
    ? spawnSync(
        'cmd.exe',
        [
          '/d',
          '/s',
          '/c',
          `npx -y @mermaid-js/mermaid-cli -i ${tempInputPath} -o ${outputPath} -s ${scale}`,
        ],
        {
          stdio: 'inherit',
        },
      )
    : spawnSync(
        'npx',
        ['-y', '@mermaid-js/mermaid-cli', '-i', tempInputPath, '-o', outputPath, '-s', scale],
        {
          stdio: 'inherit',
        },
      );

rmSync(tempDir, { recursive: true, force: true });

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

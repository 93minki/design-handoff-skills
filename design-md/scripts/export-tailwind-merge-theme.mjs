#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function usage() {
  console.log(`Usage: node scripts/export-tailwind-merge-theme.mjs [options]

Generates a TypeScript tailwind-merge extension from DESIGN.md typography keys.

Options:
  --design <path>  DESIGN.md path. Default: DESIGN.md
  --out <path>     Output TypeScript path. Defaults to stdout.
  --help           Show this help.
`);
}

function parseArgs(argv) {
  const options = {
    design: 'DESIGN.md',
    out: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help') {
      options.help = true;
    } else if (arg === '--design') {
      options.design = readValue(argv, ++index, arg);
    } else if (arg === '--out') {
      options.out = readValue(argv, ++index, arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function readValue(argv, index, arg) {
  const value = argv[index];
  if (!value || value.startsWith('--')) {
    throw new Error(`${arg} requires a value`);
  }
  return value;
}

function extractFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : '';
}

function stripYamlQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function extractTypographyNames(frontmatter) {
  const names = [];
  let inTypography = false;

  for (const line of frontmatter.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')) {
    const topLevel = line.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (topLevel) {
      inTypography = topLevel[1] === 'typography';
      continue;
    }

    if (!inTypography) {
      continue;
    }

    const token = line.match(/^  ([^:\s][^:]*):\s*$/);
    if (token) {
      names.push(stripYamlQuotes(token[1]));
    }
  }

  if (names.length === 0) {
    throw new Error('DESIGN.md contains no typography tokens.');
  }

  return names;
}

function renderTailwindMergeTheme(typographyNames) {
  const tokenLines = typographyNames.map((name) => `  ${JSON.stringify(name)},`);

  return `// Generated from DESIGN.md by design-md. Do not edit manually.
import { extendTailwindMerge } from "tailwind-merge";

const typographyTokens = [
${tokenLines.join('\n')}
] as const;

export const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: typographyTokens,
    },
  },
});
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    usage();
    return;
  }

  const designText = await readFile(resolve(options.design), 'utf8');
  const output = renderTailwindMergeTheme(
    extractTypographyNames(extractFrontmatter(designText)),
  );

  if (options.out) {
    await writeFile(resolve(options.out), output);
  } else {
    process.stdout.write(output);
  }
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});

#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function usage() {
  console.log(`Usage: node scripts/export-tailwind-theme.mjs [options]

Exports a Tailwind v4 @theme artifact from DESIGN.md, removes role-scoped font
family variables, and emits Tailwind composite typography companion variables
so one text utility applies size, line-height, letter-spacing, and weight.

Options:
  --design <path>  DESIGN.md path. Default: DESIGN.md
  --out <path>     Output CSS path. Defaults to stdout.
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

function toCssVarName(tokenName) {
  return tokenName
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-');
}

function extractTypographyTokens(frontmatter) {
  const entries = [];
  const lines = frontmatter.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let inTypography = false;
  let currentToken = undefined;
  let currentValues = undefined;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const topLevel = line.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (topLevel) {
      if (currentToken && currentValues) {
        entries.push([currentToken, currentValues]);
      }
      inTypography = topLevel[1] === 'typography';
      currentToken = undefined;
      currentValues = undefined;
      continue;
    }

    if (!inTypography) {
      continue;
    }

    const token = line.match(/^  ([^:\s][^:]*):\s*$/);
    if (token) {
      if (currentToken && currentValues) {
        entries.push([currentToken, currentValues]);
      }
      currentToken = toCssVarName(token[1]);
      currentValues = {};
      continue;
    }

    const property = line.match(
      /^    (fontSize|fontWeight|lineHeight|letterSpacing):\s*(.+?)\s*$/,
    );
    if (currentToken && currentValues && property) {
      currentValues[property[1]] = stripYamlQuotes(property[2]);
    }
  }

  if (currentToken && currentValues) {
    entries.push([currentToken, currentValues]);
  }

  return entries;
}

function addCompositeTypographyVariables(css, typographyTokens) {
  if (typographyTokens.length === 0) {
    return css;
  }

  const typographyByName = new Map(typographyTokens);
  const roleNames = new Set(typographyByName.keys());
  const normalized = css.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const output = [];

  for (const line of normalized.split('\n')) {
    const splitVariable = line.match(
      /^\s*--(?:leading|tracking|font-weight)-([a-zA-Z0-9_-]+)\s*:/,
    );
    if (splitVariable && roleNames.has(splitVariable[1])) {
      continue;
    }

    const companionVariable = line.match(
      /^\s*--text-([a-zA-Z0-9_-]+)--(?:line-height|letter-spacing|font-weight)\s*:/,
    );
    if (companionVariable && roleNames.has(companionVariable[1])) {
      continue;
    }

    output.push(line);

    const textVariable = line.match(/^\s*--text-([a-zA-Z0-9_-]+)\s*:/);
    if (!textVariable || !roleNames.has(textVariable[1])) {
      continue;
    }

    const values = typographyByName.get(textVariable[1]);
    if (values.lineHeight !== undefined) {
      output.push(`  --text-${textVariable[1]}--line-height: ${values.lineHeight};`);
    }
    if (values.letterSpacing !== undefined) {
      output.push(`  --text-${textVariable[1]}--letter-spacing: ${values.letterSpacing};`);
    }
    if (values.fontWeight !== undefined) {
      output.push(`  --text-${textVariable[1]}--font-weight: ${values.fontWeight};`);
    }
  }

  return output.join('\n');
}

function stripRoleFontFamilyVariables(css, roleNames) {
  const roleNameSet = new Set(roleNames);
  return css
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => {
      const match = line.match(/^\s*--font-([a-zA-Z0-9_-]+)\s*:/);
      return !match || !roleNameSet.has(match[1]);
    })
    .join('\n');
}

function extractSharedFontAliases(css, roleNames) {
  const roleNameSet = new Set(roleNames);
  return css
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => {
      const match = line.match(/^\s*--font-([a-zA-Z0-9_-]+)\s*:/);
      return match && !match[1].startsWith('weight-') && !roleNameSet.has(match[1]);
    });
}

function addSharedFontAliases(css, aliases) {
  if (aliases.length === 0) {
    return css;
  }

  const withoutExistingAliases = css
    .split('\n')
    .filter((line) => !aliases.some((alias) => alias.trim().split(':')[0] === line.trim().split(':')[0]))
    .join('\n');
  const insertion = `${aliases.join('\n')}\n`;
  const textIndex = withoutExistingAliases.indexOf('  --text-');
  if (textIndex !== -1) {
    return `${withoutExistingAliases.slice(0, textIndex)}${insertion}${withoutExistingAliases.slice(textIndex)}`;
  }
  return withoutExistingAliases.replace(/\n}\s*$/, `\n${insertion}}`);
}

async function exportRawTailwindCss(designPath) {
  const { stdout } = await execFileAsync(
    'npx',
    ['@google/design.md', 'export', '--format', 'css-tailwind', resolve(designPath)],
    {
      maxBuffer: 1024 * 1024 * 10,
      timeout: 120000,
    },
  );

  return stdout;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    usage();
    return;
  }

  const designPath = resolve(options.design);
  const designText = await import('node:fs/promises').then(({ readFile }) => readFile(designPath, 'utf8'));
  const frontmatter = extractFrontmatter(designText);
  const typographyTokens = extractTypographyTokens(frontmatter);
  const roleNames = typographyTokens.map(([name]) => name);
  const rawCss = await exportRawTailwindCss(designPath);
  let existingAliases = [];
  if (options.out) {
    try {
      existingAliases = extractSharedFontAliases(await readFile(resolve(options.out), 'utf8'), roleNames);
    } catch {
      existingAliases = [];
    }
  }
  const enhancedCss = `${addSharedFontAliases(
    addCompositeTypographyVariables(
      stripRoleFontFamilyVariables(rawCss, roleNames),
      typographyTokens,
    ),
    existingAliases,
  ).trimEnd()}\n`;

  if (options.out) {
    await writeFile(resolve(options.out), enhancedCss);
  } else {
    process.stdout.write(enhancedCss);
  }
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});

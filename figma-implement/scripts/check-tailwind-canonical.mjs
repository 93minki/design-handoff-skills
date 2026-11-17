#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_SEARCH_DIRS = ["app", "components", "src"];
const EXTENSIONS = new Set([".css", ".js", ".jsx", ".ts", ".tsx"]);
const STRING_LITERAL_PATTERN = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;

function parseArgs(argv) {
  const args = {
    files: [],
    root: process.cwd(),
    theme: "tailwind.theme.css",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--root") {
      args.root = argv[++i];
    } else if (arg === "--theme") {
      args.theme = argv[++i];
    } else if (arg === "--files") {
      while (argv[i + 1] && !argv[i + 1].startsWith("--")) {
        args.files.push(argv[++i]);
      }
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      args.files.push(arg);
    }
  }

  return {
    ...args,
    root: path.resolve(args.root),
  };
}

function printHelp() {
  console.log(`Usage:
  node check-tailwind-canonical.mjs --root <project-root> --files <changed files...>

Options:
  --root <path>    Project root. Defaults to the current working directory.
  --theme <path>   Tailwind theme CSS path relative to root. Defaults to tailwind.theme.css.
  --files <paths>  Files to inspect. If omitted, scans app, components, and src.
`);
}

function lineAndColumn(source, index) {
  const lines = source.slice(0, index).split("\n");
  return {
    column: lines.at(-1).length + 1,
    line: lines.length,
  };
}

async function collectFiles(root, dir) {
  const absoluteDir = path.join(root, dir);
  let entries;

  try {
    entries = await readdir(absoluteDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

    const relativePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(root, relativePath)));
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      files.push(relativePath);
    }
  }

  return files;
}

function extractCandidates(source) {
  const candidates = [];
  let match;

  while ((match = STRING_LITERAL_PATTERN.exec(source))) {
    const literal = match[2];
    const literalStart = match.index + 1;

    for (const tokenMatch of literal.matchAll(/\S+/g)) {
      const token = tokenMatch[0];

      if (!/[a-zA-Z\[]/.test(token)) continue;
      if (token.includes("${")) continue;

      candidates.push({
        index: literalStart + tokenMatch.index,
        token,
      });
    }
  }

  return candidates;
}

async function loadProjectTailwind(root, themePath) {
  let modulePath;

  try {
    const projectRequire = createRequire(path.join(root, "package.json"));
    modulePath = projectRequire.resolve("@tailwindcss/node");
  } catch {
    throw new Error(
      "Could not resolve @tailwindcss/node from the project. Install Tailwind CSS v4 tooling or run the project's normal build/lint instead.",
    );
  }

  const { __unstable__loadDesignSystem } = await import(pathToFileURL(modulePath).href);
  const themeImport = themePath.replaceAll("\\", "/");

  return __unstable__loadDesignSystem(
    `@import "tailwindcss"; @import "./${themeImport}";`,
    { base: root },
  );
}

const args = parseArgs(process.argv.slice(2));
const designSystem = await loadProjectTailwind(args.root, args.theme);
const files =
  args.files.length > 0
    ? args.files
    : (await Promise.all(DEFAULT_SEARCH_DIRS.map((dir) => collectFiles(args.root, dir)))).flat();

const failures = [];

for (const file of files) {
  const relativeFile = path.relative(args.root, path.resolve(args.root, file));
  const extension = path.extname(relativeFile);

  if (!EXTENSIONS.has(extension)) continue;

  const source = await readFile(path.join(args.root, relativeFile), "utf8");

  for (const candidate of extractCandidates(source)) {
    const canonical = designSystem.canonicalizeCandidates([candidate.token])[0];

    if (!canonical || canonical === candidate.token) continue;

    failures.push({
      ...lineAndColumn(source, candidate.index),
      canonical,
      file: relativeFile,
      token: candidate.token,
    });
  }
}

if (failures.length > 0) {
  console.error("Non-canonical Tailwind classes found:");

  for (const failure of failures) {
    console.error(
      `- ${failure.file}:${failure.line}:${failure.column} ${failure.token} -> ${failure.canonical}`,
    );
  }

  process.exit(1);
}

console.log("Tailwind canonical class check passed.");

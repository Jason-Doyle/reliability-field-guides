import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseDocument } from 'yaml';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const excludedDirectories = new Set(['.git', 'node_modules']);
const textExtensions = new Set([
  '.cff',
  '.json',
  '.md',
  '.mjs',
  '.yaml',
  '.yml',
]);
const textFileNames = new Set([
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  'CODEOWNERS',
  'LICENSE',
  'NOTICE',
]);

async function listFiles(directory) {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function repositoryPath(filePath) {
  return path.relative(repositoryRoot, filePath).replaceAll('\\', '/');
}

function firstNonAsciiLocation(text) {
  const index = text.search(/[^\x00-\x7F]/u);

  if (index === -1) {
    return null;
  }

  const precedingText = text.slice(0, index);
  const lines = precedingText.split('\n');

  return {
    character: text[index],
    line: lines.length,
    column: lines.at(-1).length + 1,
  };
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

const files = await listFiles(repositoryRoot);
const textFiles = files.filter(
  (filePath) =>
    textExtensions.has(path.extname(filePath)) ||
    textFileNames.has(path.basename(filePath)),
);
const markdownFiles = files.filter(
  (filePath) => path.extname(filePath) === '.md',
);
const yamlExtensions = new Set(['.cff', '.yaml', '.yml']);
const failures = [];
let structuredFileCount = 0;

for (const filePath of textFiles) {
  const text = await readFile(filePath, 'utf8');
  const relativePath = repositoryPath(filePath);
  const nonAscii = firstNonAsciiLocation(text);

  if (nonAscii) {
    failures.push(
      `${relativePath}:${nonAscii.line}:${nonAscii.column} contains non-ASCII character ${JSON.stringify(nonAscii.character)}`,
    );
  }

  if (!text.endsWith('\n')) {
    failures.push(`${relativePath} does not end with a newline`);
  }

  for (const [lineIndex, line] of text.split('\n').entries()) {
    if (/[ \t]+$/.test(line)) {
      failures.push(
        `${relativePath}:${lineIndex + 1} contains trailing whitespace`,
      );
    }
  }

  if (path.extname(filePath) === '.json') {
    try {
      const document = JSON.parse(text);
      structuredFileCount += 1;

      if (
        typeof document.$schema === 'string' &&
        !document.$schema.startsWith('#') &&
        !/^[a-z][a-z0-9+.-]*:/i.test(document.$schema)
      ) {
        const schemaPath = path.resolve(
          path.dirname(filePath),
          decodeURIComponent(document.$schema.split('#', 1)[0]),
        );

        if (!(await pathExists(schemaPath))) {
          failures.push(
            `${relativePath} references missing schema ${document.$schema}`,
          );
        }
      }
    } catch (error) {
      failures.push(`${relativePath} is invalid JSON: ${error.message}`);
    }
  }

  if (yamlExtensions.has(path.extname(filePath))) {
    const document = parseDocument(text, {
      prettyErrors: false,
    });
    structuredFileCount += 1;

    for (const error of document.errors) {
      failures.push(`${relativePath} is invalid YAML: ${error.message}`);
    }
  }
}

const markdownLinkPattern = /\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
let localLinkCount = 0;

for (const filePath of markdownFiles) {
  const text = await readFile(filePath, 'utf8');

  for (const match of text.matchAll(markdownLinkPattern)) {
    const target = match[1];

    if (
      target.startsWith('#') ||
      /^[a-z][a-z0-9+.-]*:/i.test(target)
    ) {
      continue;
    }

    const decodedTarget = decodeURIComponent(
      target.split('#', 1)[0].split('?', 1)[0],
    );
    const resolvedTarget = path.resolve(path.dirname(filePath), decodedTarget);
    localLinkCount += 1;

    if (!(await pathExists(resolvedTarget))) {
      failures.push(
        `${repositoryPath(filePath)} links to missing path ${target}`,
      );
      continue;
    }

    const targetStats = await stat(resolvedTarget);

    if (target.endsWith('/') && !targetStats.isDirectory()) {
      failures.push(
        `${repositoryPath(filePath)} expects directory at ${target}`,
      );
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Repository validation failed:\n${failures.join('\n')}`);
}

console.log(
  `Validated ${textFiles.length} text files, ${structuredFileCount} structured files, and ${localLinkCount} local Markdown links.`,
);

#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');

const TARGET_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const files = await walk(SRC_DIR);
  const violations = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes('import')) continue;
      if (!line.includes('assets/models/')) continue;
      if (line.includes('assets/models/optimized/')) continue;

      const rel = path.relative(ROOT, filePath);
      violations.push(`${rel}:${i + 1}`);
    }
  }

  if (violations.length > 0) {
    console.error('Forbidden model import path found. Use assets/models/optimized/* only.');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('Model import check passed: only optimized model paths found.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

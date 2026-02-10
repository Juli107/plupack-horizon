#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const MODELS_ROOT = path.join(ROOT, 'src/assets/models');
const ORIGINALS_DIR = path.join(MODELS_ROOT, 'originals');
const OPTIMIZED_DIR = path.join(MODELS_ROOT, 'optimized');
const REPORT_PATH = path.join(MODELS_ROOT, 'optimization-report.json');

const args = new Set(process.argv.slice(2));
const inspectOnly = args.has('--inspect');
const reportOnly = args.has('--report');

function toKB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function pct(before, after) {
  if (before <= 0) return '0.0%';
  return `${(((before - after) / before) * 100).toFixed(1)}%`;
}

async function getModelFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.glb'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function fileSizeSafe(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

function runGltfTransform(commandArgs) {
  const result = spawnSync('npx', ['gltf-transform', ...commandArgs], {
    cwd: ROOT,
    encoding: 'utf-8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    throw new Error(stderr || stdout || 'Unknown gltf-transform error');
  }
}

async function inspect() {
  const originals = await getModelFiles(ORIGINALS_DIR);
  if (originals.length === 0) {
    console.log('No source .glb files found in src/assets/models/originals');
    return;
  }

  let totalOriginal = 0;
  let totalOptimized = 0;

  console.log('\nModel Size Overview\n');
  for (const fileName of originals) {
    const originalPath = path.join(ORIGINALS_DIR, fileName);
    const optimizedPath = path.join(OPTIMIZED_DIR, fileName);
    const originalSize = await fileSizeSafe(originalPath);
    const optimizedSize = await fileSizeSafe(optimizedPath);
    totalOriginal += originalSize;
    totalOptimized += optimizedSize;

    const optimizedLabel =
      optimizedSize > 0 ? `${toKB(optimizedSize)} (${pct(originalSize, optimizedSize)} smaller)` : 'missing';

    console.log(`- ${fileName}`);
    console.log(`  original : ${toKB(originalSize)}`);
    console.log(`  optimized: ${optimizedLabel}`);
  }

  console.log('\nTotals');
  console.log(`- original : ${toKB(totalOriginal)}`);
  console.log(`- optimized: ${toKB(totalOptimized)}`);
  if (totalOptimized > 0) {
    console.log(`- reduction: ${pct(totalOriginal, totalOptimized)}`);
  }
}

async function report() {
  try {
    const content = await fs.readFile(REPORT_PATH, 'utf-8');
    console.log(content);
  } catch {
    console.log('No optimization report found yet. Run `npm run models:optimize` first.');
  }
}

async function optimize() {
  await fs.mkdir(OPTIMIZED_DIR, { recursive: true });

  const files = await getModelFiles(ORIGINALS_DIR);
  if (files.length === 0) {
    throw new Error('No source .glb files found in src/assets/models/originals');
  }

  const rows = [];

  for (const fileName of files) {
    const input = path.join(ORIGINALS_DIR, fileName);
    const output = path.join(OPTIMIZED_DIR, fileName);

    console.log(`Optimizing ${fileName} ...`);

    let strategy = 'meshopt + webp';
    try {
      runGltfTransform([
        'optimize',
        input,
        output,
        '--compress',
        'meshopt',
        '--texture-compress',
        'webp',
        '--texture-size',
        '1024',
      ]);
    } catch (error) {
      strategy = 'meshopt fallback';
      try {
        runGltfTransform(['optimize', input, output, '--compress', 'meshopt']);
      } catch {
        strategy = 'copy fallback';
        runGltfTransform(['copy', input, output]);
      }
      console.warn(`  fallback used for ${fileName}: ${error.message}`);
    }

    const before = await fileSizeSafe(input);
    let after = await fileSizeSafe(output);

    if (after > before) {
      await fs.copyFile(input, output);
      after = before;
      strategy = `${strategy} (kept original; optimized was larger)`;
    }

    rows.push({
      file: fileName,
      strategy,
      before,
      after,
      reductionPercent: before > 0 ? Number((((before - after) / before) * 100).toFixed(2)) : 0,
    });
  }

  const totals = rows.reduce(
    (acc, row) => {
      acc.before += row.before;
      acc.after += row.after;
      return acc;
    },
    { before: 0, after: 0 }
  );

  const reportData = {
    generatedAt: new Date().toISOString(),
    sourceDir: 'src/assets/models/originals',
    outputDir: 'src/assets/models/optimized',
    totals: {
      beforeBytes: totals.before,
      afterBytes: totals.after,
      reductionPercent:
        totals.before > 0 ? Number((((totals.before - totals.after) / totals.before) * 100).toFixed(2)) : 0,
    },
    files: rows,
  };

  await fs.writeFile(REPORT_PATH, JSON.stringify(reportData, null, 2));

  console.log('\nOptimization Complete\n');
  console.log(`- models optimized: ${rows.length}`);
  console.log(`- total before   : ${toKB(totals.before)}`);
  console.log(`- total after    : ${toKB(totals.after)}`);
  console.log(`- reduction      : ${pct(totals.before, totals.after)}`);
  console.log(`- report         : src/assets/models/optimization-report.json`);
}

async function main() {
  if (reportOnly) {
    await report();
    return;
  }
  if (inspectOnly) {
    await inspect();
    return;
  }
  await optimize();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

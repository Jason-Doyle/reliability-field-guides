import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scoreNames = [
  'purpose',
  'owner',
  'evidence',
  'interpretation',
  'action',
  'feedback',
  'validation',
];

export function calculateDecisionCoverage(record) {
  const scores = scoreNames.map((name) => record.scoring[name]);
  const weight = record.decision.weight;
  const conservativeCoverage = weight * Math.min(...scores);
  const supportScore =
    weight * (scores.reduce((total, score) => total + score, 0) / scores.length);

  return {
    weight,
    conservativeCoverage,
    supportScore,
    falseConfidenceGap: supportScore - conservativeCoverage,
  };
}

function numbersMatch(left, right) {
  return Math.abs(left - right) < 1e-9;
}

export function verifyStoredDecisionCoverage(record) {
  const calculated = calculateDecisionCoverage(record);
  const stored = record.scoring;

  if (stored.weight !== calculated.weight) {
    throw new Error(
      `Stored scoring weight ${stored.weight} does not match decision weight ${calculated.weight}.`,
    );
  }

  for (const field of [
    'conservativeCoverage',
    'supportScore',
    'falseConfidenceGap',
  ]) {
    if (!numbersMatch(stored[field], calculated[field])) {
      throw new Error(
        `Stored ${field} ${stored[field]} does not match calculated value ${calculated[field]}.`,
      );
    }
  }

  return calculated;
}

const invokedPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined;
const modulePath = fileURLToPath(import.meta.url);

if (invokedPath === modulePath) {
  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error(
      'Usage: node scripts/calculate-decision-coverage.mjs <decision-map.json>',
    );
  }

  const record = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
  const result = verifyStoredDecisionCoverage(record);
  console.log(JSON.stringify(result, null, 2));
}

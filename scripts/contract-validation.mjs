import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import {
  verifyContractSemantics,
} from './semantic-validation.mjs';

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

export const contractDefinitions = [
  {
    key: 'agent-memory',
    directory: 'agent-memory',
    schema: 'memory-record.schema.json',
    schemaVersion: '2.0.0',
    markers: ['memoryClass', 'provenance', 'lifecycle'],
  },
  {
    key: 'integration-selection',
    directory: 'integration-selection',
    schema: 'integration-decision.schema.json',
    schemaVersion: '2.0.0',
    markers: ['existingCapabilities', 'candidates', 'decision'],
  },
  {
    key: 'behavioural-slo',
    directory: 'behavioural-slo',
    schema: 'behavioural-slo.schema.json',
    schemaVersion: '2.0.0',
    markers: ['workflow', 'objective', 'evaluation'],
  },
  {
    key: 'incident-command',
    directory: 'incident-command',
    schema: 'decision-log.schema.json',
    schemaVersion: '2.0.0',
    markers: ['incidentId', 'incidentCommander', 'decisions'],
  },
  {
    key: 'observability-decision-map',
    directory: 'observability-decision-map',
    schema: 'decision-map.schema.json',
    schemaVersion: '2.0.0',
    markers: ['serviceOrJourney', 'interpretation', 'scoring'],
  },
];

const definitionsByKey = new Map(
  contractDefinitions.map((definition) => [definition.key, definition]),
);
let compiledContracts;

export function formatErrors(errors) {
  return errors
    .map((error) => {
      const location = error.instancePath || '/';
      return `${location} ${error.message}`;
    })
    .join('\n');
}

export async function compileContracts() {
  if (compiledContracts) {
    return compiledContracts;
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    // Conditional fragments extend object definitions declared by parents.
    strictRequired: false,
    strictTypes: false,
  });
  addFormats(ajv);

  const contracts = new Map();

  for (const definition of contractDefinitions) {
    const schemaPath = path.join(
      repositoryRoot,
      definition.directory,
      definition.schema,
    );
    const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
    contracts.set(definition.key, {
      definition,
      schemaPath,
      validate: ajv.compile(schema),
    });
  }

  compiledContracts = contracts;
  return compiledContracts;
}

export function inferContractKey(record) {
  const schemaReference = String(record.$schema ?? '').toLowerCase();
  const schemaMatches = contractDefinitions.filter((definition) =>
    schemaReference.endsWith(definition.schema.toLowerCase()),
  );

  if (schemaMatches.length === 1) {
    return schemaMatches[0].key;
  }

  const markerMatches = contractDefinitions.filter((definition) =>
    definition.markers.every((marker) =>
      Object.hasOwn(record, marker),
    ),
  );

  if (markerMatches.length === 1) {
    return markerMatches[0].key;
  }

  throw new Error(
    'Unable to infer the contract. Supply --contract with one of: ' +
      contractDefinitions.map((definition) => definition.key).join(', '),
  );
}

export async function validateContractRecord(
  contractKey,
  record,
  source = 'Record',
) {
  const definition = definitionsByKey.get(contractKey);

  if (!definition) {
    throw new Error(
      `Unknown contract ${contractKey}. Expected one of: ` +
        contractDefinitions.map((item) => item.key).join(', '),
    );
  }

  const contracts = await compileContracts();
  const validate = contracts.get(contractKey).validate;

  if (!validate(record)) {
    throw new Error(
      `${source} does not satisfy ${contractKey} ${definition.schemaVersion}:\n` +
        formatErrors(validate.errors),
    );
  }

  try {
    verifyContractSemantics(contractKey, record);
  } catch (error) {
    throw new Error(
      `${source} violates ${contractKey} semantic validation: ${error.message}`,
      {
        cause: error,
      },
    );
  }

  return definition;
}

export async function validateArtifactFile(filePath, forcedContractKey) {
  const resolvedPath = path.resolve(filePath);
  let text;
  let record;

  try {
    text = await readFile(resolvedPath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read ${resolvedPath}: ${error.message}`, {
      cause: error,
    });
  }

  try {
    record = JSON.parse(text);
  } catch (error) {
    throw new Error(`${resolvedPath} is invalid JSON: ${error.message}`, {
      cause: error,
    });
  }

  const contractKey = forcedContractKey ?? inferContractKey(record);
  const definition = await validateContractRecord(
    contractKey,
    record,
    resolvedPath,
  );

  return {
    contractKey,
    definition,
    resolvedPath,
  };
}

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import {
  verifyStoredDecisionCoverage,
} from './calculate-decision-coverage.mjs';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const contractDefinitions = [
  {
    key: 'agent-memory',
    directory: 'agent-memory',
    schema: 'memory-record.schema.json',
  },
  {
    key: 'integration-selection',
    directory: 'integration-selection',
    schema: 'integration-decision.schema.json',
  },
  {
    key: 'behavioural-slo',
    directory: 'behavioural-slo',
    schema: 'behavioural-slo.schema.json',
  },
  {
    key: 'incident-command',
    directory: 'incident-command',
    schema: 'decision-log.schema.json',
  },
  {
    key: 'observability-decision-map',
    directory: 'observability-decision-map',
    schema: 'decision-map.schema.json',
  },
];

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function formatErrors(errors) {
  return errors
    .map((error) => {
      const location = error.instancePath || '/';
      return `${location} ${error.message}`;
    })
    .join('\n');
}

function clone(value) {
  return structuredClone(value);
}

function without(object, key) {
  delete object[key];
  return object;
}

function matchesExpectedError(error, expected) {
  if (
    error.keyword !== expected.keyword ||
    error.instancePath !== expected.instancePath
  ) {
    return false;
  }

  if (expected.missingProperty) {
    return error.params.missingProperty === expected.missingProperty;
  }

  return true;
}

function verifyIntegrationDecision(record) {
  const candidateMechanisms = record.candidates.map(
    (candidate) => candidate.mechanism,
  );
  const candidateSet = new Set(candidateMechanisms);
  const selectedMechanism = record.decision.selectedMechanism;

  if (candidateSet.size !== candidateMechanisms.length) {
    throw new Error('Integration decision contains duplicate mechanisms.');
  }

  if (!candidateSet.has(selectedMechanism)) {
    throw new Error(
      `Selected mechanism ${selectedMechanism} was not evaluated as a candidate.`,
    );
  }

  const selectedCandidate = record.candidates.find(
    (candidate) => candidate.mechanism === selectedMechanism,
  );

  if (selectedCandidate.fit === 'does-not-meet') {
    throw new Error(
      `Selected mechanism ${selectedMechanism} is marked as not meeting the requirement.`,
    );
  }

  for (const alternative of record.decision.rejectedAlternatives) {
    if (!candidateSet.has(alternative.mechanism)) {
      throw new Error(
        `Rejected mechanism ${alternative.mechanism} was not evaluated as a candidate.`,
      );
    }

    if (alternative.mechanism === selectedMechanism) {
      throw new Error(
        `Selected mechanism ${selectedMechanism} is also listed as rejected.`,
      );
    }
  }
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  // Conditional fragments extend object definitions declared by parent schemas.
  strictRequired: false,
  strictTypes: false,
});
addFormats(ajv);

const contracts = new Map();
let exampleCount = 0;

for (const definition of contractDefinitions) {
  const contractPath = path.join(repositoryRoot, definition.directory);
  const schema = await readJson(path.join(contractPath, definition.schema));
  const validate = ajv.compile(schema);
  const examplesPath = path.join(contractPath, 'examples');
  const exampleFiles = (await readdir(examplesPath))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();
  const examples = new Map();

  for (const fileName of exampleFiles) {
    const record = await readJson(path.join(examplesPath, fileName));

    if (!validate(record)) {
      throw new Error(
        `${definition.key}/${fileName} does not satisfy its contract:\n${formatErrors(validate.errors)}`,
      );
    }

    if (definition.key === 'observability-decision-map') {
      verifyStoredDecisionCoverage(record);
    }

    if (definition.key === 'integration-selection') {
      verifyIntegrationDecision(record);
    }

    examples.set(fileName, record);
    exampleCount += 1;
  }

  contracts.set(definition.key, {
    examples,
    validate,
  });
}

const memoryExamples = contracts.get('agent-memory').examples;
const operationalFact = memoryExamples.get('operational-fact.json');
const approvedProcedure = memoryExamples.get('approved-procedure.json');
const deletedTombstone = memoryExamples.get('deleted-tombstone.json');

const integrationExamples = contracts.get('integration-selection').examples;
const releaseSkill = integrationExamples.get('repository-release-skill.json');
const incidentMcp = integrationExamples.get('incident-briefing-mcp.json');

const sloExamples = contracts.get('behavioural-slo').examples;
const refundSlo = sloExamples.get('refund-policy-path.json');
const actionSlo = sloExamples.get('unauthorised-tool-action.json');

const incidentExamples = contracts.get('incident-command').examples;
const incidentDecisions = incidentExamples.get(
  'checkout-incident-decisions.json',
);

const observabilityExamples = contracts.get(
  'observability-decision-map',
).examples;
const checkoutFailover = observabilityExamples.get('checkout-failover.json');

const negativeCases = [
  {
    contract: 'agent-memory',
    name: 'active memory without content',
    record: without(clone(operationalFact), 'content'),
    expected: {
      keyword: 'required',
      instancePath: '',
      missingProperty: 'content',
    },
  },
  {
    contract: 'agent-memory',
    name: 'active memory with unverified validation',
    record: {
      ...clone(operationalFact),
      validation: {
        status: 'unverified',
      },
    },
    expected: {
      keyword: 'enum',
      instancePath: '/validation/status',
    },
  },
  {
    contract: 'agent-memory',
    name: 'tier 2 memory without review or expiry',
    record: (() => {
      const record = clone(operationalFact);
      delete record.lifecycle.reviewAfter;
      delete record.lifecycle.expiresAt;
      return record;
    })(),
    expected: {
      keyword: 'anyOf',
      instancePath: '/lifecycle',
    },
  },
  {
    contract: 'agent-memory',
    name: 'tier 4 memory without authoritative revalidation',
    record: (() => {
      const record = clone(operationalFact);
      record.riskTier = 4;
      record.policy.authoritativeSourceRequiredBeforeAction = false;
      return record;
    })(),
    expected: {
      keyword: 'const',
      instancePath: '/policy/authoritativeSourceRequiredBeforeAction',
    },
  },
  {
    contract: 'agent-memory',
    name: 'superseded memory without a successor',
    record: (() => {
      const record = clone(operationalFact);
      record.status = 'superseded';
      record.relationships = {};
      return record;
    })(),
    expected: {
      keyword: 'required',
      instancePath: '/relationships',
      missingProperty: 'supersededBy',
    },
  },
  {
    contract: 'agent-memory',
    name: 'active procedure without governance',
    record: without(clone(approvedProcedure), 'governance'),
    expected: {
      keyword: 'required',
      instancePath: '',
      missingProperty: 'governance',
    },
  },
  {
    contract: 'agent-memory',
    name: 'deleted memory retaining content',
    record: {
      ...clone(deletedTombstone),
      content: {
        statement: 'Content that should have been removed.',
      },
    },
    expected: {
      keyword: 'not',
      instancePath: '',
    },
  },
  {
    contract: 'agent-memory',
    name: 'TTL retention without a duration',
    record: (() => {
      const record = clone(operationalFact);
      delete record.lifecycle.retention.ttlDays;
      return record;
    })(),
    expected: {
      keyword: 'required',
      instancePath: '/lifecycle/retention',
      missingProperty: 'ttlDays',
    },
  },
  {
    contract: 'integration-selection',
    name: 'skill selected for a non-procedural requirement',
    record: (() => {
      const record = clone(releaseSkill);
      record.requirement.repeatableProcedure = false;
      return record;
    })(),
    expected: {
      keyword: 'const',
      instancePath: '/requirement/repeatableProcedure',
    },
  },
  {
    contract: 'integration-selection',
    name: 'MCP selected without live state or action',
    record: (() => {
      const record = clone(incidentMcp);
      record.requirement.liveExternalState = false;
      record.requirement.externalWriteAction = false;
      return record;
    })(),
    expected: {
      keyword: 'anyOf',
      instancePath: '/requirement',
    },
  },
  {
    contract: 'integration-selection',
    name: 'MCP selected without an operational owner',
    record: (() => {
      const record = clone(incidentMcp);
      delete record.mcpEligibility.operationalOwner;
      return record;
    })(),
    expected: {
      keyword: 'required',
      instancePath: '/mcpEligibility',
      missingProperty: 'operationalOwner',
    },
  },
  {
    contract: 'integration-selection',
    name: 'consequential action enforced only by model guidance',
    record: (() => {
      const record = clone(releaseSkill);
      record.correctnessBoundaries = [
        {
          rule: 'Ask the model to avoid unsafe release actions.',
          enforcementPoint: 'model-guidance',
          failureBehaviour: 'The model should stop.',
        },
      ];
      return record;
    })(),
    expected: {
      keyword: 'contains',
      instancePath: '/correctnessBoundaries',
    },
  },
  {
    contract: 'behavioural-slo',
    name: 'active SLO without validation evidence',
    record: (() => {
      const record = clone(refundSlo);
      record.validation.evidence = [];
      return record;
    })(),
    expected: {
      keyword: 'minItems',
      instancePath: '/validation/evidence',
    },
  },
  {
    contract: 'behavioural-slo',
    name: 'high-impact action without payload-bound approval',
    record: (() => {
      const record = clone(actionSlo);
      record.controls.humanApprovalBoundToPayload = false;
      return record;
    })(),
    expected: {
      keyword: 'const',
      instancePath: '/controls/humanApprovalBoundToPayload',
    },
  },
  {
    contract: 'behavioural-slo',
    name: 'irreversible behaviour without a stop condition',
    record: (() => {
      const record = clone(actionSlo);
      delete record.response.stopCondition;
      return record;
    })(),
    expected: {
      keyword: 'required',
      instancePath: '/response',
      missingProperty: 'stopCondition',
    },
  },
  {
    contract: 'behavioural-slo',
    name: 'prohibited autonomy with execution enabled',
    record: (() => {
      const record = clone(actionSlo);
      record.workflow.riskTier = 'prohibited-autonomy';
      record.controls.executionAllowed = true;
      return record;
    })(),
    expected: {
      keyword: 'const',
      instancePath: '/controls/executionAllowed',
    },
  },
  {
    contract: 'incident-command',
    name: 'executed incident decision without confirmation',
    record: (() => {
      const record = clone(incidentDecisions);
      delete record.decisions[0].confirmation;
      return record;
    })(),
    expected: {
      keyword: 'required',
      instancePath: '/decisions/0',
      missingProperty: 'confirmation',
    },
  },
  {
    contract: 'incident-command',
    name: 'rejected incident decision without a reason',
    record: (() => {
      const record = clone(incidentDecisions);
      delete record.decisions[1].rejectionReason;
      return record;
    })(),
    expected: {
      keyword: 'required',
      instancePath: '/decisions/1',
      missingProperty: 'rejectionReason',
    },
  },
  {
    contract: 'incident-command',
    name: 'incident decision without evidence',
    record: (() => {
      const record = clone(incidentDecisions);
      record.decisions[0].evidence = [];
      return record;
    })(),
    expected: {
      keyword: 'minItems',
      instancePath: '/decisions/0/evidence',
    },
  },
  {
    contract: 'incident-command',
    name: 'closed incident without closure time',
    record: {
      ...clone(incidentDecisions),
      status: 'closed',
    },
    expected: {
      keyword: 'required',
      instancePath: '',
      missingProperty: 'closedAt',
    },
  },
  {
    contract: 'observability-decision-map',
    name: 'decision map without evidence',
    record: {
      ...clone(checkoutFailover),
      evidence: [],
    },
    expected: {
      keyword: 'minItems',
      instancePath: '/evidence',
    },
  },
  {
    contract: 'observability-decision-map',
    name: 'active decision map with failed validation',
    record: (() => {
      const record = clone(checkoutFailover);
      record.validation.outcome = 'fail';
      return record;
    })(),
    expected: {
      keyword: 'enum',
      instancePath: '/validation/outcome',
    },
  },
];

for (const testCase of negativeCases) {
  const validate = contracts.get(testCase.contract).validate;

  if (validate(testCase.record)) {
    throw new Error(
      `${testCase.contract} accepted invalid case: ${testCase.name}`,
    );
  }

  if (
    !validate.errors.some((error) =>
      matchesExpectedError(error, testCase.expected),
    )
  ) {
    throw new Error(
      `${testCase.contract} failed for an unexpected reason: ${testCase.name}\n${formatErrors(validate.errors)}`,
    );
  }
}

const incorrectCoverage = clone(checkoutFailover);
incorrectCoverage.scoring.supportScore = 4;
let coverageMismatchRejected = false;

try {
  verifyStoredDecisionCoverage(incorrectCoverage);
} catch {
  coverageMismatchRejected = true;
}

if (!coverageMismatchRejected) {
  throw new Error('Decision coverage accepted an incorrect stored score.');
}

const invalidIntegrationDecisions = [
  {
    name: 'selected mechanism absent from candidate comparison',
    record: (() => {
      const record = clone(releaseSkill);
      record.decision.selectedMechanism = 'user-interface';
      return record;
    })(),
  },
  {
    name: 'rejected mechanism absent from candidate comparison',
    record: (() => {
      const record = clone(releaseSkill);
      record.decision.rejectedAlternatives[0].mechanism = 'user-interface';
      return record;
    })(),
  },
  {
    name: 'duplicate mechanisms in candidate comparison',
    record: (() => {
      const record = clone(releaseSkill);
      record.candidates[1].mechanism = record.candidates[0].mechanism;
      return record;
    })(),
  },
];

for (const testCase of invalidIntegrationDecisions) {
  let rejected = false;

  try {
    verifyIntegrationDecision(testCase.record);
  } catch {
    rejected = true;
  }

  if (!rejected) {
    throw new Error(
      `Integration decision validation accepted invalid case: ${testCase.name}`,
    );
  }
}

console.log(
  `Validated ${contractDefinitions.length} schemas, ${exampleCount} examples, ${negativeCases.length} schema-negative cases, ${invalidIntegrationDecisions.length} integration semantic cases, and decision coverage calculations.`,
);

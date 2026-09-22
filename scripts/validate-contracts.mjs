import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import {
  compileContracts,
  contractDefinitions,
  formatErrors,
  repositoryRoot,
  validateContractRecord,
} from './contract-validation.mjs';
import {
  verifyContractSemantics,
} from './semantic-validation.mjs';

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
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

const compiledContracts = await compileContracts();
const contracts = new Map();
let exampleCount = 0;

for (const definition of contractDefinitions) {
  const contractPath = path.join(repositoryRoot, definition.directory);
  const validate = compiledContracts.get(definition.key).validate;
  const examplesPath = path.join(contractPath, 'examples');
  const exampleFiles = (await readdir(examplesPath))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();
  const examples = new Map();

  for (const fileName of exampleFiles) {
    const record = await readJson(path.join(examplesPath, fileName));
    await validateContractRecord(
      definition.key,
      record,
      `${definition.key}/${fileName}`,
    );

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
    name: 'ratio threshold above one',
    record: (() => {
      const record = clone(refundSlo);
      record.objective.indicator.threshold = 1.5;
      return record;
    })(),
    expected: {
      keyword: 'maximum',
      instancePath: '/objective/indicator/threshold',
    },
  },
  {
    contract: 'behavioural-slo',
    name: 'percentage threshold above one hundred',
    record: (() => {
      const record = clone(refundSlo);
      record.objective.indicator.unit = 'percentage';
      record.objective.indicator.threshold = 100.1;
      return record;
    })(),
    expected: {
      keyword: 'maximum',
      instancePath: '/objective/indicator/threshold',
    },
  },
  {
    contract: 'behavioural-slo',
    name: 'fractional count threshold',
    record: (() => {
      const record = clone(refundSlo);
      record.objective.indicator.unit = 'count';
      record.objective.indicator.threshold = 1.5;
      return record;
    })(),
    expected: {
      keyword: 'type',
      instancePath: '/objective/indicator/threshold',
    },
  },
  {
    contract: 'behavioural-slo',
    name: 'non-zero exact harmful-action target',
    record: (() => {
      const record = clone(actionSlo);
      record.objective.indicator.direction = 'exactly';
      record.objective.indicator.threshold = 0.5;
      return record;
    })(),
    expected: {
      keyword: 'const',
      instancePath: '/objective/indicator/threshold',
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
    name: 'executed incident decision without a selected option',
    record: (() => {
      const record = clone(incidentDecisions);
      record.decisions[0].options.forEach((option) => {
        option.disposition = 'rejected';
      });
      return record;
    })(),
    expected: {
      keyword: 'contains',
      instancePath: '/decisions/0/options',
    },
  },
  {
    contract: 'incident-command',
    name: 'incident decision with multiple selected options',
    record: (() => {
      const record = clone(incidentDecisions);
      record.decisions[0].options[1].disposition = 'selected';
      return record;
    })(),
    expected: {
      keyword: 'contains',
      instancePath: '/decisions/0/options',
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

const semanticNegativeCases = [
  {
    contract: 'agent-memory',
    name: 'memory use both allowed and prohibited',
    record: (() => {
      const record = clone(operationalFact);
      record.policy.prohibitedUses.push(record.policy.allowedUses[0]);
      return record;
    })(),
  },
  {
    contract: 'agent-memory',
    name: 'memory captured before observation',
    record: (() => {
      const record = clone(operationalFact);
      record.provenance.capturedAt = '2026-08-31T17:00:00Z';
      return record;
    })(),
  },
  {
    contract: 'integration-selection',
    name: 'selected mechanism absent from candidate comparison',
    record: (() => {
      const record = clone(releaseSkill);
      record.decision.selectedMechanism = 'user-interface';
      return record;
    })(),
  },
  {
    contract: 'integration-selection',
    name: 'rejected mechanism absent from candidate comparison',
    record: (() => {
      const record = clone(releaseSkill);
      record.decision.rejectedAlternatives[0].mechanism = 'user-interface';
      return record;
    })(),
  },
  {
    contract: 'integration-selection',
    name: 'duplicate mechanisms in candidate comparison',
    record: (() => {
      const record = clone(releaseSkill);
      record.candidates[1].mechanism = record.candidates[0].mechanism;
      return record;
    })(),
  },
  {
    contract: 'integration-selection',
    name: 'duplicate rejected alternatives',
    record: (() => {
      const record = clone(releaseSkill);
      record.decision.rejectedAlternatives[1].mechanism =
        record.decision.rejectedAlternatives[0].mechanism;
      return record;
    })(),
  },
  {
    contract: 'integration-selection',
    name: 'next review before completed review',
    record: (() => {
      const record = clone(releaseSkill);
      record.nextReviewAt = '2026-08-31T17:30:00Z';
      return record;
    })(),
  },
  {
    contract: 'behavioural-slo',
    name: 'next review before validation',
    record: (() => {
      const record = clone(refundSlo);
      record.validation.nextReviewAt = '2026-08-30T00:00:00Z';
      return record;
    })(),
  },
  {
    contract: 'incident-command',
    name: 'duplicate decision IDs',
    record: (() => {
      const record = clone(incidentDecisions);
      record.decisions[1].id = record.decisions[0].id;
      return record;
    })(),
  },
  {
    contract: 'incident-command',
    name: 'duplicate decision option text',
    record: (() => {
      const record = clone(incidentDecisions);
      record.decisions[0].options[1].option =
        record.decisions[0].options[0].option;
      return record;
    })(),
  },
  {
    contract: 'incident-command',
    name: 'decision review before decision time',
    record: (() => {
      const record = clone(incidentDecisions);
      record.decisions[0].reviewAt = '2026-08-31T19:05:00Z';
      return record;
    })(),
  },
  {
    contract: 'observability-decision-map',
    name: 'duplicate evidence IDs',
    record: (() => {
      const record = clone(checkoutFailover);
      record.evidence[1].id = record.evidence[0].id;
      return record;
    })(),
  },
  {
    contract: 'observability-decision-map',
    name: 'incorrect stored decision coverage',
    record: (() => {
      const record = clone(checkoutFailover);
      record.scoring.supportScore = 4;
      return record;
    })(),
  },
  {
    contract: 'observability-decision-map',
    name: 'review before validation',
    record: (() => {
      const record = clone(checkoutFailover);
      record.reviewedAt = '2026-08-31T19:00:00Z';
      return record;
    })(),
  },
];

for (const testCase of semanticNegativeCases) {
  let rejected = false;

  try {
    verifyContractSemantics(testCase.contract, testCase.record);
  } catch {
    rejected = true;
  }

  if (!rejected) {
    throw new Error(
      `${testCase.contract} semantic validation accepted invalid case: ${testCase.name}`,
    );
  }
}

console.log(
  `Validated ${contractDefinitions.length} schemas, ${exampleCount} examples, ${negativeCases.length} schema-negative cases, and ${semanticNegativeCases.length} semantic-negative cases.`,
);

import {
  verifyStoredDecisionCoverage,
} from './calculate-decision-coverage.mjs';

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function ensureUnique(values, label) {
  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`${label} contains duplicate value ${value}.`);
    }

    seen.add(value);
  }
}

function ensureOnOrAfter(later, earlier, message) {
  ensure(Date.parse(later) >= Date.parse(earlier), message);
}

function ensureAfter(later, earlier, message) {
  ensure(Date.parse(later) > Date.parse(earlier), message);
}

export function verifyAgentMemoryRecord(record) {
  const prohibitedUses = new Set(record.policy.prohibitedUses);
  const overlappingUse = record.policy.allowedUses.find((use) =>
    prohibitedUses.has(use),
  );

  ensure(
    !overlappingUse,
    `Memory use ${overlappingUse} is both allowed and prohibited.`,
  );
  ensureOnOrAfter(
    record.provenance.capturedAt,
    record.provenance.observedAt,
    'Memory capture time precedes its observation time.',
  );
  ensureOnOrAfter(
    record.audit.updatedAt,
    record.audit.createdAt,
    'Memory audit update time precedes its creation time.',
  );

  for (const relationshipName of [
    'derivedFrom',
    'supersedes',
    'supersededBy',
    'conflictsWith',
  ]) {
    for (const reference of record.relationships[relationshipName] ?? []) {
      ensure(
        reference.id !== record.id || reference.version !== record.version,
        `Memory relationship ${relationshipName} references the current record version.`,
      );
    }
  }

  if (record.status === 'deleted') {
    const deletion = record.lifecycle.deletion;
    ensureOnOrAfter(
      deletion.completedAt,
      deletion.requestedAt,
      'Memory deletion completed before it was requested.',
    );
    ensureOnOrAfter(
      record.lifecycle.deletedAt,
      deletion.completedAt,
      'Memory deletion timestamp precedes deletion completion.',
    );

    if (deletion.verifiedAt) {
      ensureOnOrAfter(
        deletion.verifiedAt,
        deletion.completedAt,
        'Memory deletion verification precedes deletion completion.',
      );
    }
  }
}

export function verifyIntegrationDecision(record) {
  const candidateMechanisms = record.candidates.map(
    (candidate) => candidate.mechanism,
  );
  const candidateSet = new Set(candidateMechanisms);
  const selectedMechanism = record.decision.selectedMechanism;
  const rejectedMechanisms = record.decision.rejectedAlternatives.map(
    (alternative) => alternative.mechanism,
  );

  ensureUnique(candidateMechanisms, 'Integration candidates');
  ensureUnique(rejectedMechanisms, 'Rejected integration alternatives');
  ensure(
    candidateSet.has(selectedMechanism),
    `Selected mechanism ${selectedMechanism} was not evaluated as a candidate.`,
  );

  const selectedCandidate = record.candidates.find(
    (candidate) => candidate.mechanism === selectedMechanism,
  );

  ensure(
    selectedCandidate.fit !== 'does-not-meet',
    `Selected mechanism ${selectedMechanism} is marked as not meeting the requirement.`,
  );

  for (const alternative of record.decision.rejectedAlternatives) {
    ensure(
      candidateSet.has(alternative.mechanism),
      `Rejected mechanism ${alternative.mechanism} was not evaluated as a candidate.`,
    );
    ensure(
      alternative.mechanism !== selectedMechanism,
      `Selected mechanism ${selectedMechanism} is also listed as rejected.`,
    );
  }

  if (record.status === 'approved') {
    ensureOnOrAfter(
      record.reviewedAt,
      record.createdAt,
      'Integration review time precedes its creation time.',
    );
    ensureOnOrAfter(
      record.decision.approvedAt,
      record.reviewedAt,
      'Integration approval time precedes its review time.',
    );
    ensureAfter(
      record.nextReviewAt,
      record.reviewedAt,
      'Integration next review must follow its completed review.',
    );
  }
}

export function verifyBehaviouralSlo(record) {
  const indicator = record.objective.indicator;

  if (indicator.unit === 'count') {
    ensure(
      Number.isInteger(indicator.threshold),
      'Behavioural SLO count threshold must be an integer.',
    );
  }

  if (record.status === 'active') {
    ensureOnOrAfter(
      record.validation.lastValidatedAt,
      record.createdAt,
      'Behavioural SLO validation time precedes its creation time.',
    );
    ensureAfter(
      record.validation.nextReviewAt,
      record.validation.lastValidatedAt,
      'Behavioural SLO next review must follow its validation time.',
    );
  }
}

export function verifyIncidentDecisionLog(record) {
  ensureUnique(
    record.decisions.map((decision) => decision.id),
    'Incident decision IDs',
  );
  ensureOnOrAfter(
    record.updatedAt,
    record.openedAt,
    'Incident update time precedes its opening time.',
  );

  if (record.closedAt) {
    ensureOnOrAfter(
      record.closedAt,
      record.openedAt,
      'Incident closure time precedes its opening time.',
    );
  }

  for (const decision of record.decisions) {
    ensureOnOrAfter(
      decision.timestamp,
      record.openedAt,
      `Incident decision ${decision.id} precedes the incident opening time.`,
    );
    ensureOnOrAfter(
      decision.reviewAt,
      decision.timestamp,
      `Incident decision ${decision.id} review precedes the decision time.`,
    );
    ensureUnique(
      decision.options.map((option) => option.option),
      `Incident decision ${decision.id} options`,
    );

    const selectedCount = decision.options.filter(
      (option) => option.disposition === 'selected',
    ).length;

    ensure(
      selectedCount <= 1,
      `Incident decision ${decision.id} selects more than one option.`,
    );

    if (['approved', 'executed'].includes(decision.status)) {
      ensure(
        selectedCount === 1,
        `Incident decision ${decision.id} must select exactly one option.`,
      );
    }

    if (decision.status === 'executed') {
      ensureOnOrAfter(
        decision.executedAt,
        decision.timestamp,
        `Incident decision ${decision.id} was executed before it was recorded.`,
      );
      ensureOnOrAfter(
        decision.confirmation.observedAt,
        decision.executedAt,
        `Incident decision ${decision.id} was confirmed before execution.`,
      );
    }
  }
}

export function verifyObservabilityDecisionMap(record) {
  verifyStoredDecisionCoverage(record);
  ensureUnique(
    record.evidence.map((evidence) => evidence.id),
    'Observability evidence IDs',
  );
  ensureOnOrAfter(
    record.reviewedAt,
    record.createdAt,
    'Observability decision review time precedes its creation time.',
  );
  ensureOnOrAfter(
    record.validation.lastValidatedAt,
    record.createdAt,
    'Observability validation time precedes its creation time.',
  );
  ensureOnOrAfter(
    record.reviewedAt,
    record.validation.lastValidatedAt,
    'Observability review time precedes its validation time.',
  );
  ensureAfter(
    record.nextValidationAt,
    record.reviewedAt,
    'Observability next validation must follow its review time.',
  );
}

const semanticValidators = new Map([
  ['agent-memory', verifyAgentMemoryRecord],
  ['integration-selection', verifyIntegrationDecision],
  ['behavioural-slo', verifyBehaviouralSlo],
  ['incident-command', verifyIncidentDecisionLog],
  ['observability-decision-map', verifyObservabilityDecisionMap],
]);

export function verifyContractSemantics(contractKey, record) {
  const verify = semanticValidators.get(contractKey);

  if (!verify) {
    throw new Error(`Unknown contract ${contractKey}.`);
  }

  verify(record);
}

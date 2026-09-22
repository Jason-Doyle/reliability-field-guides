# Observability Decision Map

| Field | Value |
| --- | --- |
| Author | Jason Doyle |
| Version | 2.0.0 |
| Created | 31 August 2026 |
| Last reviewed | 22 September 2026 |

The smallest useful unit of observability design is a decision, not a
dashboard.

This guide maps a material operational decision to the owner, evidence,
interpretation, action, feedback, and validation needed to support it.

## Included artifacts

| Artifact | Use |
| --- | --- |
| [decision-map.schema.json](decision-map.schema.json) | Validate a decision-to-signal record |
| [decision-to-signal-canvas.md](decision-to-signal-canvas.md) | Design or review one consequential decision path |
| [checkout-failover.json](examples/checkout-failover.json) | Example covering a customer-visible failover decision |
| [calculate-decision-coverage.mjs](../scripts/calculate-decision-coverage.mjs) | Recalculate conservative coverage and false-confidence gap |

## Seven coverage elements

| Element | Question |
| --- | --- |
| Purpose | Is the decision stated in terms of consequence? |
| Owner | Can a named owner or controller decide and act? |
| Evidence | Is required evidence available with freshness, scope, and quality? |
| Interpretation | Is there a rule, playbook, or hypothesis path? |
| Action | Can the owner take a concrete action in time? |
| Feedback | Does the outcome improve signals, thresholds, ownership, or playbooks? |
| Validation | Has the complete path been tested? |

Score each element as:

- `0` when absent;
- `0.5` when informal or partial;
- `1` when explicit, current, and tested.

Weight the decision from 1 for convenience to 5 for critical safety, security,
legal, or existential consequence.

```text
Conservative coverage = weight x weakest element
Support score = weight x average of all seven elements
False-confidence gap = support score - conservative coverage
```

The weakest element is conservative because a dashboard without authority, an
alert without action, or an SLO without validation can still leave the decision
unsupported.

## Use the calculator

From the repository root:

```powershell
npm run decision-coverage -- observability-decision-map/examples/checkout-failover.json
```

The command verifies the stored weight and derived scores before printing the
result.

Validate the complete adopted record, including evidence identity and temporal
checks:

```powershell
npm run validate -- path/to/decision-map.json
```

## Design sequence

1. State the decision in operational language.
2. Name the owner, backup, authority, options, and latency objective.
3. Identify evidence by question, freshness, scope, quality limit, and fallback.
4. Record the interpretation rule and known blind spots.
5. Define permitted actions, rollback, communication, and confirmation.
6. Close the feedback loop.
7. Validate the full path through a drill, replay, incident, or sample.

Instrumentation should be added when it improves one of these elements or
supports exploratory investigation, compliance, or a declared retention need.

## Validate the example

```powershell
npm ci
npm test
```

Version `1.0.0` remains available from release tag `v0.1.0`.

## Related paper

This field guide is a companion to
[Observability Is a Decision System](https://jasondoyle.ie/whitepapers/observability-is-a-decision-system/).

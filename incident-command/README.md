# Incident Command

| Field | Value |
| --- | --- |
| Author | Jason Doyle |
| Version | 2.0.0 |
| Created | 31 August 2026 |
| Last reviewed | 22 September 2026 |

Incident command converts incomplete evidence, distributed authority, parallel
work, and communication pressure into a recoverable operating model.

## Included artifacts

| Artifact | Use |
| --- | --- |
| [role-cards.md](role-cards.md) | Assign explicit command, operations, investigation, communication, and recovery responsibilities |
| [incident-command-template.md](incident-command-template.md) | Maintain the current operating picture |
| [handover-template.md](handover-template.md) | Transfer authority and context during a long incident |
| [decision-log-template.md](decision-log-template.md) | Record material decisions with evidence and review points |
| [decision-log.schema.json](decision-log.schema.json) | Validate a machine-readable incident decision log |
| [checkout-incident-decisions.json](examples/checkout-incident-decisions.json) | Inspect an executed and a rejected decision |

## Four interface channels

A useful incident process makes four channels explicit:

1. Evidence: what is known, uncertain, assumed, and contradicted.
2. Authority: who may decide, act, escalate, and close.
3. Ownership: who owns each workstream and next action.
4. Communication: who needs which facts, at what cadence.

The incident document is the shared interface state. Chat, calls, dashboards,
and ticket systems may feed it, but no single channel should be the only place
where material state exists.

## Operating rules

- Declare when impact, scope, authority, or coordination is unclear.
- Separate mitigation from diagnosis.
- Give every workstream one owner and one next check-in.
- Record material decisions with evidence, authority, and a review point.
- Protect operators from repeated status requests.
- Plan relief before judgement degrades.
- Require explicit acknowledgement when command changes hands.
- Keep recovery debt visible after immediate impact ends.

Small incidents may combine roles. The responsibilities must remain visible so
unassigned work does not become interruption or memory.

## Contract constraints

The decision-log schema requires:

- evidence, rationale, authority, an action owner, and review time for every
  material decision;
- at most one selected option for every decision and exactly one for approved
  or executed decisions;
- execution time and confirmation evidence for an executed decision;
- a reason for rejection;
- a successor for a superseded decision;
- a closure time when the incident is closed.

Semantic validation also rejects duplicate decision identifiers and duplicate
option text. The schema does not grant authority or prove that evidence is
correct. Runbooks, access controls, escalation policy, and command practice
must establish those properties.

## Validate the example

From the repository root:

```powershell
npm ci
npm test
```

Validate an adopted decision log:

```powershell
npm run validate -- path/to/incident-decision-log.json
```

Version `1.0.0` remains available from release tag `v0.1.0`.

## Related paper

This field guide is a companion to
[Incident Command Is an Organisational Interface](https://jasondoyle.ie/whitepapers/incident-command-is-an-organisational-interface/).

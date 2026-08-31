# Incident Command Role Cards

| Field | Value |
| --- | --- |
| Template version | 1.0.0 |
| Created | 31 August 2026 |
| Last reviewed | 31 August 2026 |

Roles are decision surfaces, not status titles. Assign named people and state
when one person is carrying more than one role.

## Incident Commander

Mission:

- maintain the overall operating picture;
- set priorities and control span of work;
- make decisions within delegated authority or route them quickly;
- stop unsafe or conflicting actions;
- ensure evidence, ownership, and communication remain connected.

Authority:

- assign and combine incident roles;
- create workstreams and subincidents;
- approve mitigations within the incident policy;
- set update cadence;
- escalate business, legal, security, or customer decisions;
- move the incident between active, monitoring, recovery, and closed states.

Required inputs:

- current customer impact and trajectory;
- confirmed facts, unknowns, constraints, and confidence;
- mitigation and investigation status;
- decisions waiting for authority;
- next communication and handover clocks.

Required outputs:

- priorities;
- named owners;
- recorded decisions;
- escalation requests;
- current status and next check-in.

Avoid:

- becoming the primary keyboard operator;
- treating the loudest hypothesis as fact;
- allowing unowned work;
- closing before recovery debt is visible.

## Operations Lead

Mission:

- reduce customer impact through controlled technical action.

Authority:

- execute approved mitigations;
- delegate bounded operational tasks;
- stop a change that violates safety constraints;
- request additional authority from command.

Required outputs:

- action, owner, expected effect, and abort condition;
- execution evidence;
- confirmation of effect;
- temporary changes requiring later reversal.

Avoid:

- making several uncoordinated changes at once;
- continuing a failed mitigation without a review point;
- hiding uncertainty to make progress appear faster.

## Investigation Lead

Mission:

- reduce uncertainty without blocking safe mitigation.

Authority:

- create and assign hypotheses;
- request evidence capture;
- reject unsupported causal claims;
- preserve evidence needed for later review.

Required outputs:

- confirmed facts and their sources;
- active hypotheses, tests, owners, and deadlines;
- contradictions and data-quality limits;
- evidence that changes mitigation safety.

Avoid:

- delaying mitigation until root cause is known;
- reporting correlation as cause;
- allowing the diagnosis board to become a list of untested ideas.

## Communications Lead

Mission:

- provide accurate information without interrupting operators.

Authority:

- collect approved facts from the incident record;
- maintain audience-specific cadence;
- route legal, privacy, support, partner, and executive questions;
- reject unsupported certainty.

Required outputs:

- responder, support, executive, customer, and partner updates;
- affected population and known workaround;
- what remains unknown;
- next update time;
- commitments requiring follow-up.

Avoid:

- announcing root cause before evidence supports it;
- saying "resolved" before customer recovery is confirmed;
- copying raw technical speculation into customer communication.

## Planning and Recovery Lead

Mission:

- preserve endurance, handoffs, dependencies, and return to normal.

Authority:

- schedule relief and command handoff;
- track dependency restoration and vendor work;
- maintain recovery debt;
- assign post-incident review and follow-up owners.

Required outputs:

- staffing and relief plan;
- handover package;
- dependency register;
- backlog, data repair, temporary-change, and commitment tracking;
- closure criteria.

Avoid:

- waiting for fatigue to become visible;
- treating restored traffic as complete recovery;
- allowing temporary controls to become permanent by omission.

## Evidence Scribe

For larger incidents, assign a scribe to maintain timestamps, evidence links,
decision entries, and action state. The scribe records the interface but does
not decide what is true or approve actions.

## Combining roles

Roles may be combined when:

- customer impact is small and stable;
- one service and one team are involved;
- communication demand is low;
- authority is clear;
- the combined owner can still maintain the incident record.

Split roles when impact grows, several teams act in parallel, external
communication begins, or the current owner becomes a bottleneck.

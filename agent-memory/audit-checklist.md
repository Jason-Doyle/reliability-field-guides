# Agent Memory Audit Checklist

| Field | Value |
| --- | --- |
| Template version | 1.1.0 |
| Created | 31 August 2026 |
| Last reviewed | 22 September 2026 |

Use this checklist before enabling persistent memory, when adding a new memory
class or use, and after a material incident or architecture change.

For each item record:

- `Yes`, with an evidence link;
- `No`, with an owner and target date;
- `Not applicable`, with a reason.

A policy statement alone is not evidence that the control operates.

## 1. Purpose and inventory

- [ ] Is there a defined reason this information must persist beyond the
  current task or session?
- [ ] Is each retained category classified as working context, preference,
  episodic memory, business fact, procedure, or shared memory?
- [ ] Has the highest consequence produced by each memory class been assigned a
  risk tier?
- [ ] Are unnecessary, duplicate, sensitive, and high-volatility fields
  excluded?
- [ ] Is there an inventory of every primary store, index, cache, summary,
  replica, log, and backup that may contain memory or a derivative?

## 2. Capture and provenance

- [ ] Does every record identify its source type, source identifier, writer,
  observation time, and capture time?
- [ ] Can the system distinguish direct statements, authoritative observations,
  tool results, model inferences, summaries, and imported procedures?
- [ ] Is the source allowed to establish this memory class?
- [ ] Can a reviewer inspect the source revision or integrity evidence where
  policy permits?
- [ ] Are partial failures across extraction, persistence, embedding, and
  indexing surfaced to the caller?
- [ ] Is model-generated content prevented from presenting itself as a trusted
  system source?

## 3. Scope and access

- [ ] Is scope derived from authenticated application context rather than model
  output?
- [ ] Are tenant, user, agent, team, and environment boundaries represented
  where applicable?
- [ ] Are read and write permissions enforced before semantic retrieval or
  ranking?
- [ ] Do isolation tests cover missing, malformed, reused, and attacker-chosen
  scope identifiers?
- [ ] Can shared memory be made read-only for consumers that should not update
  it?
- [ ] Are sensitive records excluded from logs, traces, prompts, and metrics
  unless explicitly required?

## 4. Validation and classification

- [ ] Does every persisted record pass a versioned schema?
- [ ] Does active memory require evidence beyond an unverified model assertion?
- [ ] Are sensitivity, permitted uses, prohibited uses, retention, and ownership
  assigned before activation?
- [ ] Are permitted and prohibited uses disjoint?
- [ ] Is confidence clearly defined as extraction or interpretation confidence,
  rather than truth probability?
- [ ] Is untrusted or suspicious content quarantined before it can influence an
  agent?
- [ ] Do risk tier 3 and 4 records require an explicit promotion path?

## 5. Persistence and concurrent updates

- [ ] Does acknowledged write success mean every required durable component
  succeeded?
- [ ] Are record versions monotonic and protected by compare-and-swap,
  transactions, or equivalent conflict detection?
- [ ] Can concurrent writers update different scopes without sharing an unsafe
  global file or record?
- [ ] Does retry behaviour avoid duplicate writes and accidental resurrection?
- [ ] Can the system recover a known-good memory set without restoring
  superseded or poisoned records?

## 6. Consolidation and conflict handling

- [ ] Are new records compared with active records for duplication,
  contradiction, refinement, and supersession?
- [ ] Does correction create visible history rather than silently overwriting
  the prior value?
- [ ] Are superseded records excluded from ordinary retrieval within a defined
  time?
- [ ] Are unresolved conflicts visible to the agent and operator?
- [ ] Does the agent abstain or consult an authoritative source when conflicts
  cannot be resolved safely?
- [ ] Do derived summaries retain links to the records and revisions from which
  they were produced?

## 7. Retrieval and application

- [ ] Does retrieval filter by authenticated scope, status, temporal validity,
  and policy before relevance ranking?
- [ ] Are expired, superseded, quarantined, and deleted records excluded from
  ordinary retrieval?
- [ ] Are source authority and freshness considered alongside similarity?
- [ ] Does each material output or action record the memory identifiers and
  versions supplied to the agent?
- [ ] Does tier 4 memory trigger a current authoritative lookup and
  deterministic policy check before action?
- [ ] Can the system explain that memory influenced an output without claiming
  that memory alone caused it?

## 8. Procedures and shared memory

- [ ] Is an extracted procedure proposed rather than activated automatically?
- [ ] Does every active procedure have a named owner, approval, representative
  tests, adversarial tests, and rollback reference?
- [ ] Is procedure activation bounded by agent, team, tenant, environment, or
  rollout cohort?
- [ ] Are unexpected writers and out-of-band procedure changes detected?
- [ ] Are shared-memory writes atomic or conflict-aware?
- [ ] Can a reviewed procedure be restored without restoring unsafe state
  created after it?

## 9. Correction, expiry, and deletion

- [ ] Can the user or accountable owner inspect and correct memory directly?
- [ ] Does an accepted correction stop the previous version influencing normal
  retrieval within a declared objective?
- [ ] Does each record have a review date, expiry time, or event-based end
  condition appropriate to its risk?
- [ ] Is expiry processing monitored for delay and failure?
- [ ] Is the deletion boundary documented across primary records, indexes,
  caches, derivatives, logs, and backups?
- [ ] Is deletion verified in each store claimed as complete?
- [ ] Is a deleted tombstone stripped of the original content and limited to
  what is needed to prevent resurrection?

## 10. Security and poisoning

- [ ] Is untrusted content prevented from changing system policy, permissions,
  trusted instructions, or storage scope?
- [ ] Are source trust and writer identity evaluated independently from fluent
  or plausible content?
- [ ] Are imported and cross-agent memories treated as untrusted until policy
  establishes otherwise?
- [ ] Are abnormal write volume, unexpected writers, scope changes, and
  procedure modifications detectable?
- [ ] Do red-team tests cover persistent prompt injection, cross-scope
  retrieval, poisoned summaries, and unsafe procedure promotion?
- [ ] Can operators quarantine related records and derived memories during an
  investigation?

## 11. Observability and recovery

- [ ] Are memory writes, failures, reads, corrections, consolidations, expiry,
  deletion, and material influence observable?
- [ ] Are audit events protected from the agents and users whose activity they
  record?
- [ ] Are write durability, provenance coverage, contradiction density,
  correction latency, expiry latency, and deletion completion measured?
- [ ] Can an incident reviewer reconstruct the record versions available to an
  agent at the time of an action?
- [ ] Are backup restoration and replay tested against deleted, superseded, and
  quarantined state?
- [ ] Does recovery have a known-good checkpoint and a controlled reactivation
  process?

## Release gates by consequence

| Highest tier | Minimum release gate |
| --- | --- |
| 0 | Session isolation, bounded retention, and compaction or recovery tests |
| 1 | User visibility, direct correction, identity isolation, and expiry tests |
| 2 | Provenance coverage, freshness policy, conflict handling, and source revalidation |
| 3 | Owner approval, test evidence, bounded rollout, mutation audit, and rollback |
| 4 | Authoritative lookup, deterministic policy, strict influence audit, and failure-safe abstention |

Any unresolved failure in the minimum gate should block activation for that
tier. Lower-risk functionality may proceed only if it is technically isolated
from the blocked path.

## Review record

```text
System:
Review date:
Reviewer:
Memory classes:
Highest risk tier:
Namespaces reviewed:
Decision: pass | conditional | fail
Open risks:
Risk owners:
Target dates:
Evidence links:
Next review:
```

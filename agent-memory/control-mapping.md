# Agent Memory Control Mapping

| Field | Value |
| --- | --- |
| Mapping version | 1.0.0 |
| Created | 31 August 2026 |
| Last reviewed | 31 August 2026 |

JSON Schema can reject malformed or incomplete records. It cannot prove that
the surrounding system enforces access, resolves conflicts, or completes
deletion. This mapping separates record evidence from runtime evidence.

| Control objective | Record evidence | Runtime evidence |
| --- | --- | --- |
| Stable identity and history | `id`, `version`, `schemaVersion` | Compare-and-swap tests and immutable mutation events |
| Memory classification | `memoryClass`, `riskTier` | Classification rules and reviewed examples |
| Retrieval eligibility | `status` | Query tests excluding non-active records |
| Human and machine meaning | `content` | Extraction quality samples and consumer tests |
| Scope isolation | `scope.namespace`, `owner`, `subjects`, `audience` | Authorisation tests using invalid and cross-tenant identifiers |
| Source traceability | `provenance.source`, `writer`, timestamps | Source availability and revision or hash verification |
| Extraction transparency | `provenance.extractionMethod` | Logs identifying the extractor and deployed version |
| Validation status | `validation` | Validator execution, owner confirmation, and dispute workflow |
| Freshness | `reviewAfter`, `expiresAt`, `retention` | Expiry sweeps, latency measures, and stale-record tests |
| Permitted use | `policy.allowedUses`, `prohibitedUses` | Enforcement tests at retrieval and action boundaries |
| Consequential revalidation | `authoritativeSourceRequiredBeforeAction` | Traces showing authoritative lookup and deterministic policy |
| Conflict and correction | `relationships` | Consolidation tests and correction propagation measures |
| Procedure promotion | `governance` | Approval records, test runs, bounded rollout, and rollback drill |
| Deletion boundary | `lifecycle.deletion` | Store-by-store deletion results and restoration tests |
| Memory influence | `audit.influenceLogReference` | Protected events containing memory IDs and versions |

## Required implementation decisions

An adopting system should document:

1. How an authenticated request becomes `scope.namespace`.
2. Which source types may create each memory class.
3. Which validation statuses allow activation.
4. How record versions prevent lost updates.
5. How non-active records are excluded before relevance ranking.
6. How contradictions are detected, surfaced, and resolved.
7. Which actions require authoritative revalidation.
8. Where immutable mutation and influence events are stored.
9. What each deletion scope means and how it is verified.
10. How backups avoid resurrecting deleted or unsafe records.

## Suggested evidence set

A production review should be able to inspect:

- one successful and one failed write trace;
- a cross-scope isolation test;
- a stale or expired record retrieval test;
- a correction showing the old version leaving normal retrieval;
- a conflict that causes abstention or source lookup;
- a procedure promotion and rollback;
- a tier 4 action trace with current source validation;
- a deletion verification covering every claimed store;
- a restore exercise that does not reactivate deleted or quarantined state.

The record schema and audit checklist are useful only when these runtime
properties can also be demonstrated.

# Agent Memory Examples

| Field | Value |
| --- | --- |
| Example-set version | 2.0.0 |
| Created | 31 August 2026 |
| Last reviewed | 22 September 2026 |

These fictional records demonstrate the contract in
[`memory-record.schema.json`](../memory-record.schema.json).

| Example | Class and tier | Purpose |
| --- | --- | --- |
| [operational-fact.json](operational-fact.json) | Business fact, tier 2 | Service ownership with provenance, freshness, and a superseded version |
| [user-preference.json](user-preference.json) | User preference, tier 1 | A directly stated formatting preference with bounded permitted uses |
| [approved-procedure.json](approved-procedure.json) | Procedure, tier 3 | A tested and approved deployment procedure with rollback evidence |
| [deleted-tombstone.json](deleted-tombstone.json) | User preference, tier 1 | Minimal retained state after deletion without the original content |

The examples are not templates for blind copying. Identifiers, retention
periods, risk tiers, and permitted uses must reflect the adopting system.

Run `npm test` from the repository root to validate all examples and the
contract's negative cases.

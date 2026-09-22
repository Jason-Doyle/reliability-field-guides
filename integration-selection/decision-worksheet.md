# Integration Decision Worksheet

| Field | Value |
| --- | --- |
| Template version | 1.1.0 |
| Created | 31 August 2026 |
| Last reviewed | 22 September 2026 |

## Decision identity

```text
Decision ID:
Title:
Owner:
Created:
Review date:
Status: draft | approved | superseded | rejected
```

## 1. Requirement

```text
User goal:
Scope: task | repository | team | organisation | multi-organisation
Is this a broad rule that should apply to most tasks?
Is the missing element a repeatable procedure?
Does the workflow require live external state?
Does it perform an external write action?
Could an action create customer, financial, security, legal, or operational consequence?
How fresh must the data be?
Which hosts and teams need the capability?
```

## 2. Existing capability check

Review built-in tools, approved connectors, native product integrations, CLIs,
libraries, APIs, scripts, skills, MCP servers, and ordinary user interfaces.

| Existing capability | Type | Fit | Unmet requirement |
| --- | --- | --- | --- |
|  |  | meets / partial / does-not-meet |  |

Do not build a new interface merely to rename a capability that already works.

## 3. Candidate comparison

| Candidate | Functional fit | Main advantage | Main limitation | Operational burden |
| --- | --- | --- | --- | --- |
| Instructions |  |  |  | Low |
| Agent Skill |  |  |  | Low |
| Native integration |  |  |  | Depends on provider |
| CLI or library |  |  |  | Low |
| Local script |  |  |  | Low to medium |
| MCP server |  |  |  | High |
| User interface |  |  |  | Depends on product |

Record each mechanism once. The selected mechanism and every rejected
alternative must appear in this comparison.

## 4. Skill eligibility

```text
Is the value primarily sequence, context, examples, or domain judgement?
Can existing tools perform the underlying operations?
Can the skill avoid holding credentials?
Can permissions and policy remain outside the skill?
Are trigger conditions and missing-information behaviour explicit?
Are bundled scripts, dependencies, and network destinations inspectable?
Can representative success and failure cases be tested?
```

## 5. MCP eligibility

```text
Does the workflow need live external state or action?
Will multiple hosts or teams reuse the interface?
Do clients need discoverable changing capabilities?
Will typed schemas prevent material error classes?
Must credentials remain behind the server boundary?
Must authorisation or tenant policy be centralised?
Does the capability need a stable remote endpoint?
Are structured calls required for audit?
Who owns the service?
What are its availability, latency, timeout, and rate-limit expectations?
How is it monitored and supported?
How will versions be deprecated and the service retired?
```

If most value is procedural, start with a skill. If the capability is narrow and
deterministic, compare MCP with a direct script or API client.

## 6. Correctness boundaries

| Rule or precondition | Enforcement point | Failure behaviour |
| --- | --- | --- |
|  | model guidance / client code / server code / policy engine / human approval / external system |  |

Permissions, spending limits, recipient restrictions, destructive operations,
and regulated policy must not depend only on model compliance.

## 7. Decision

```text
Selected mechanism:
Rationale:
Rejected alternatives and reasons:
Named owner:
Approver:
Approval date:
Next review:
Replacement or retirement trigger:
```

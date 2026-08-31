# Behavioural SLO Worksheet

| Field | Value |
| --- | --- |
| Template version | 1.0.0 |
| Created | 31 August 2026 |
| Last reviewed | 31 August 2026 |

## Identity and ownership

```text
SLO ID:
Title:
Product:
Workflow:
Owner:
Status: draft | active | retired
Created:
Next review:
```

## 1. Product contract

```text
Intended use:
Prohibited reliance:
Population or workflow covered:
Affected people or teams:
Authoritative sources:
Risk tier:
Reversibility: reversible | compensable | containable | irreversible
Maximum credible consequence:
```

## 2. Objective statement

Write one measurable operational claim:

```text
For [eligible population], [measured behaviour] must be
[at least / at most / exactly] [threshold] during [window]
because [user, business, security, or safety consequence].
```

## 3. Indicator

```text
Behaviour category:
Indicator name:
Numerator definition:
Denominator definition:
Unit: ratio | percentage | count | seconds
Direction: at-least | at-most | exactly
Threshold:
Minimum sample size:
Measurement window:
Segmentation required:
Exclusions and reasons:
```

Avoid a denominator that removes difficult or failed cases merely because the
system could not evaluate them.

## 4. Evaluation and evidence

```text
Evaluation method:
Ground-truth owner:
Dataset or policy version:
Required cohorts:
Golden cases:
High-consequence cases:
Omission cases:
Prompt-injection cases:
Retrieval miss and stale-source cases:
Tool precondition cases:
Incident regression cases:
Production data source:
Human review or sampling plan:
Known measurement limitations:
```

## 5. Breach response

```text
Release gate:
Incident trigger:
Stop condition:
Breach actions:
Compensation or correction path:
Response owner:
Customer-impact process:
```

## 6. Deterministic controls

```text
Is model execution allowed?
Which preconditions are enforced outside the model?
Is approval bound to the exact action payload?
Are tools least privilege?
Is replay required?
Where are model, prompt, retrieval, tool, policy, and feature versions recorded?
```

## 7. Validation

```text
Validation result: pass | conditional | fail
Evidence:
Last validated:
Next review:
Open limitations:
Named risk owner:
```

# Decision-to-Signal Canvas

| Field | Value |
| --- | --- |
| Template version | 1.1.0 |
| Created | 31 August 2026 |
| Last reviewed | 22 September 2026 |

## Decision identity

```text
Record ID:
Service or user journey:
Decision title:
Owner:
Backup owner:
Automated controller:
Created:
Next validation:
```

## 1. Decision statement

```text
When [condition] occurs, [owner or controller] must decide whether to
[actions] within [latency objective] because [consequence].
```

```text
Condition:
Actor:
Choices:
1.
2.
Latency objective:
Consequence:
Weight: 1 convenience | 2 operational | 3 customer-visible | 4 material | 5 critical
```

## 2. Evidence required

Create one row for each question the decision maker must answer.

| Evidence ID | Evidence question | Signals and source | Freshness | Scope | Quality limits | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
|  |  | Metric / log / trace / event / profile / probe / customer / support / change / dependency |  |  |  |  |

Useful categories include:

- user journey or SLO state;
- recent deploy, configuration, model, prompt, policy, or feature changes;
- request or trace correlation;
- dependency state;
- affected customer cohorts;
- support and customer reports;
- evidence access when the primary observability system fails.

## 3. Interpretation

```text
Method: threshold | playbook | hypothesis-path | trained-judgement | policy
Rule or playbook:
Confidence required:
Known blind spots:
When to escalate:
```

## 4. Action

```text
Permitted actions:
Authority required:
Rollback or recovery path:
Customer communication path:
Signals that confirm effect:
```

## 5. Feedback

```text
Incident or review record:
Feedback owner:
Due within:
Signals, thresholds, runbooks, or ownership that may change:
Telemetry retirement considered:
```

## 6. Validation

```text
Method: drill | game-day | incident-review | replay | sampling
Last validated:
Evidence:
Outcome: pass | conditional | fail
Next validation:
```

## 7. Scoring

```text
Purpose: 0 | 0.5 | 1
Owner: 0 | 0.5 | 1
Evidence: 0 | 0.5 | 1
Interpretation: 0 | 0.5 | 1
Action: 0 | 0.5 | 1
Feedback: 0 | 0.5 | 1
Validation: 0 | 0.5 | 1
Weight: 1 | 2 | 3 | 4 | 5

Conservative coverage = weight x weakest score
Support score = weight x average score
False-confidence gap = support score - conservative coverage
```

A large false-confidence gap means visible pieces exist but at least one link
in the decision path remains weak.

# Behavioural SLO

| Field | Value |
| --- | --- |
| Author | Jason Doyle |
| Version | 2.0.0 |
| Created | 31 August 2026 |
| Last reviewed | 22 September 2026 |

A behavioural service level objective measures product behaviour that matters
to users or affected people, including failures that ordinary availability and
latency measures can miss.

## Included artifacts

| Artifact | Use |
| --- | --- |
| [behavioural-slo.schema.json](behavioural-slo.schema.json) | Validate an operational behavioural SLO |
| [slo-worksheet.md](slo-worksheet.md) | Define the workflow, indicator, evaluation, response, and controls |
| [refund-policy-path.json](examples/refund-policy-path.json) | Decision-support example for grounded policy handling |
| [unauthorised-tool-action.json](examples/unauthorised-tool-action.json) | High-impact example with a zero harmful-action target |

## Required parts

A behavioural SLO needs:

1. an intended use;
2. a population or workflow;
3. a ground-truth or evaluation method;
4. a threshold and measurement window;
5. a defined consequence when the threshold is missed.

"The assistant should be helpful" is not operational. A useful objective names
the behaviour, eligible cases, numerator, denominator, threshold, evidence, and
release or incident response.

## Risk tiers

| Tier | Example | Default control |
| --- | --- | --- |
| Advisory | Drafting and low-impact summaries | User review and lightweight evaluation |
| Decision support | Policy interpretation or incident briefing | Grounding, escalation, replay, and behavioural SLOs |
| Bounded action | Updating tickets or internal workflow state | Deterministic preconditions and limited tools |
| High-impact action | External messages, access, deletion, or financial change | Approval bound to the exact payload and strong policy |
| Prohibited autonomy | Legal commitment or irreversible destructive action | Model execution is not allowed |

Thresholds must follow consequence. Some failures are retryable. Others are
irreversible, difficult to detect, or harmful after a single occurrence.

## Contract constraints

The schema enforces several baseline rules:

- an active SLO must have validation evidence and a next review date;
- decision-support and higher tiers require authoritative sources and replay;
- high-impact actions require deterministic preconditions, least privilege,
  approval bound to the exact payload, and an incident trigger;
- prohibited-autonomy workflows cannot enable model execution;
- irreversible behaviour requires a stop condition and incident response;
- ratio and percentage thresholds remain within their valid ranges;
- count thresholds are integers;
- harmful-action objectives use an at-most direction or an exactly-zero
  target.

The adopting system must still verify dataset quality, temporal ordering,
measurement implementation, cohort coverage, and whether deterministic controls
operate as claimed.

## Validate the examples

From the repository root:

```powershell
npm ci
npm test
```

Validate an adopted SLO:

```powershell
npm run validate -- path/to/behavioural-slo.json
```

Version `1.0.0` remains available from release tag `v0.1.0`.

## Related paper

This field guide is a companion to
[When the Endpoint Is Up but the Product Is Failing](https://jasondoyle.ie/whitepapers/when-the-endpoint-is-up/).

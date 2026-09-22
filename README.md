# Reliability Field Guides

Practical, reviewable artifacts for reliability engineering, observability,
incident response, and dependable AI operations.

| Field | Value |
| --- | --- |
| Author and maintainer | Jason Doyle |
| Collection version | 0.2.0 |
| Created | 31 August 2026 |
| Last reviewed | 22 September 2026 |

The guides turn reliability arguments into schemas, checklists, examples, and
decision tools that can be inspected, adapted, and tested. They are designed
for engineers and technical leaders who need controls that work in real
systems, not only principles stated in prose.

## Available field guides

| Guide | Purpose | Status |
| --- | --- | --- |
| [Agent Memory Record](agent-memory/README.md) | Govern persistent agent memory through provenance, scope, lifecycle, and consequence-aware controls | Available |
| [Integration Selection](integration-selection/README.md) | Choose among instructions, skills, native tools, scripts, MCP, and ordinary interfaces | Available |
| [Behavioural SLO](behavioural-slo/README.md) | Define measurable reliability objectives for consequential product behaviour | Available |
| [Incident Command](incident-command/README.md) | Make evidence, authority, ownership, communication, decisions, and handoffs explicit | Available |
| [Observability Decision Map](observability-decision-map/README.md) | Connect operational decisions to evidence, interpretation, action, feedback, and validation | Available |

Each guide is independently usable. New guides will be added only when their
core artifacts and validation examples are complete.

## Collection contents

The initial collection contains:

- five versioned JSON Schemas;
- eleven valid examples across normal, high-risk, rejected, executed, and
  deleted states;
- human review worksheets and operational templates;
- consequence-aware controls that distinguish guidance from deterministic
  enforcement;
- executable positive and negative contract tests;
- a decision-coverage calculator for observability reviews.

Validate the artifacts locally:

```powershell
npm ci
npm test
```

The test suite compiles every JSON Schema, validates all published examples,
exercises schema and semantic negative cases, verifies decision-coverage
calculations, parses repository YAML, and checks local documentation links.

Validate an adopted artifact against its declared contract:

```powershell
npm run validate -- path/to/artifact.json
```

Use `--contract <name>` when the artifact does not include `$schema`. Supported
contract names are `agent-memory`, `integration-selection`,
`behavioural-slo`, `incident-command`, and
`observability-decision-map`.

Calculate one decision-coverage record:

```powershell
npm run decision-coverage -- observability-decision-map/examples/checkout-failover.json
```

## Design principles

1. Evidence over assertion. Controls identify what can be inspected or tested.
2. Consequence-aware governance. A formatting preference and an access decision
   should not carry the same obligations.
3. Technology-neutral contracts. The artifacts do not depend on a particular
   model, vector database, or agent framework.
4. Safe boundaries. Memory may help locate evidence, but it must not grant
   authority or replace an authoritative system of record.
5. Operational usefulness. Each guide should support implementation, review,
   testing, or incident investigation.

## Related writing

- [When Memory Becomes Production State](https://jasondoyle.ie/whitepapers/when-memory-becomes-production-state/)
- [When You Need an MCP Server and When You Really Don't](https://jasondoyle.ie/whitepapers/when-you-need-an-mcp-server/)
- [When the Endpoint Is Up but the Product Is Failing](https://jasondoyle.ie/whitepapers/when-the-endpoint-is-up/)
- [Incident Command Is an Organisational Interface](https://jasondoyle.ie/whitepapers/incident-command-is-an-organisational-interface/)
- [Observability Is a Decision System](https://jasondoyle.ie/whitepapers/observability-is-a-decision-system/)

## Project status

This repository is an evolving collection of field guides. Changes to schemas
and templates are documented in [CHANGELOG.md](CHANGELOG.md).

Schema version `1.0.0` remains available from release tag `v0.1.0`. Current
release `v0.2.0` provides schema version `2.0.0` and resolvable canonical
schema identifiers. Check out `v0.1.0` to validate records against the previous
contracts.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the evidence and validation expected
from changes. Participation is governed by
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Security defects should follow [SECURITY.md](SECURITY.md), not a public issue.

## Citation

Citation metadata is available in [CITATION.cff](CITATION.cff). When referring
to a specific schema in implementation documentation, include its
`schemaVersion` as well as the repository revision.

## Licence

Licensed under the [Apache License 2.0](LICENSE).

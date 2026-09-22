# Integration Selection

| Field | Value |
| --- | --- |
| Author | Jason Doyle |
| Version | 2.0.0 |
| Created | 31 August 2026 |
| Last reviewed | 22 September 2026 |

Use the minimum sufficient integration that satisfies the requirement and puts
correctness at the right boundary.

This guide helps teams choose among persistent instructions, an Agent Skill, a
native integration, an existing CLI or library, a small script, an MCP server,
or an ordinary user interface.

## Included artifacts

| Artifact | Use |
| --- | --- |
| [integration-decision.schema.json](integration-decision.schema.json) | Validate a versioned integration decision |
| [decision-worksheet.md](decision-worksheet.md) | Run a design review before implementation |
| [repository-release-skill.json](examples/repository-release-skill.json) | Example where procedure, not infrastructure, is missing |
| [incident-briefing-mcp.json](examples/incident-briefing-mcp.json) | Example where live shared capabilities justify MCP |
| [document-conversion-script.json](examples/document-conversion-script.json) | Example where a deterministic local script is sufficient |

## Selection sequence

1. Use instructions when a broad rule should apply to most work.
2. Reuse an existing built-in tool, connector, CLI, library, API, or user
   interface when it already meets the need.
3. Use an Agent Skill when the missing element is a repeatable procedure,
   examples, templates, or domain judgement.
4. Prefer a supported native integration for live external state or action.
5. Use a direct CLI, library, or script for narrow deterministic work.
6. Use MCP when a protocol boundary creates material value and a named owner
   can operate it.
7. Enforce permissions and irreversible-action controls in deterministic code
   or policy, not only in model instructions.

## What makes MCP materially valuable

An MCP server becomes a stronger choice when several conditions are true:

- multiple hosts or teams need the same capability;
- clients need discoverable tools or resources;
- typed schemas prevent meaningful error classes;
- credentials must remain behind a service boundary;
- authorisation, tenant scope, or policy must be enforced centrally;
- the capability needs a stable remote endpoint;
- structured tool calls materially improve auditability.

These benefits must outweigh service ownership, availability, latency,
monitoring, support, security review, versioning, and retirement costs.

## Contract constraints

The schema rejects several common shortcuts:

- an approved decision without an approver and review date;
- an MCP decision without live state or action;
- an MCP decision without an operational owner, monitoring, support, and
  retirement plan;
- an MCP decision that identifies no material protocol-boundary value;
- a skill decision when the requirement is not procedural;
- a skill that is expected to hold credentials or enforce server policy;
- a consequential action whose only correctness boundary is model guidance.

The schema does not calculate the right answer. It makes the assumptions,
alternatives, operating obligations, and deterministic controls reviewable.
Semantic validation also confirms that candidate and rejected mechanisms are
unique, and that selected and rejected mechanisms were actually included in
the candidate comparison.

## Validate the examples

From the repository root:

```powershell
npm ci
npm test
```

Validate an adopted decision:

```powershell
npm run validate -- path/to/integration-decision.json
```

Version `1.0.0` remains available from release tag `v0.1.0`.

## Related paper

This field guide is a companion to
[When You Need an MCP Server and When You Really Don't](https://jasondoyle.ie/whitepapers/when-you-need-an-mcp-server/).

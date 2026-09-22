# Changelog

All notable changes to this repository will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Schema compatibility is tracked separately through the `schemaVersion` field in
each governed artifact.

## [Unreleased]

## [0.2.0] - 2026-09-22

### Breaking

- Advanced all five field-guide schemas to version 2.0.0.
- Bounded behavioural SLO ratio, percentage, count, and exactly-zero
  harmful-action thresholds.
- Required exactly one selected option for approved and executed incident
  decisions.

### Added

- Consumer-facing artifact validation through `npm run validate`.
- Shared semantic validation for record identity, chronology, decision
  consistency, and derived observability scores.
- Updated worksheets and templates to capture the new semantic requirements.
- YAML and local JSON Schema reference validation.
- Dependabot configuration for npm and GitHub Actions.
- Issue and pull-request templates and a repository code of conduct.

### Changed

- Replaced non-resolving schema identifiers with immutable `v0.2.0` release
  URLs.
- Updated security reporting and supported-version guidance.
- Pinned third-party Actions to full commit SHAs.
- Normalised the artifact-retention workflow to LF line endings.

### Security

- Enabled repository security reporting and dependency alerting.
- Added release-tag and immutable-release protections.

## [0.1.0] - 2026-08-31

### Added

- Agent memory record schema version 1.0.0.
- Examples for operational facts, user preferences, approved procedures, and
  deletion tombstones.
- Agent memory audit checklist and control mapping.
- Integration selection schema, worksheet, and worked decisions for an Agent
  Skill, MCP server, and local script.
- Behavioural SLO schema, worksheet, and decision-support and high-impact
  examples.
- Incident command role cards, working document, handover, decision log, schema,
  and example.
- Observability decision map schema, canvas, worked example, and coverage
  calculator.
- Automated repository, contract, negative-case, and score validation.

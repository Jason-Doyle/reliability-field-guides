# Security Policy

The field guides describe controls for systems that may process sensitive or
consequential state. A defect in a schema or example could encourage an unsafe
implementation even though this repository does not operate a hosted service.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could enable scope leakage,
memory poisoning, policy bypass, unsafe procedure activation, or exposure of
sensitive records.

Use the repository's
[private vulnerability reporting form](https://github.com/Jason-Doyle/reliability-field-guides/security/advisories/new).
Include:

- the affected artifact and revision;
- the failure scenario;
- the expected and observed behaviour;
- a minimal reproduction where it is safe to provide one;
- the likely consequence and affected risk tier.

If GitHub private reporting is unavailable, use the contact route at
[jasondoyle.ie](https://jasondoyle.ie/) and avoid including exploit details
in the first message.

## Supported versions

The current `main` branch and the latest tagged collection release receive
security corrections. Older release tags remain immutable references for
compatibility and citation, but they do not receive updates.

Schema consumers should include both the schema version and repository revision
in reports so a defect can be assessed against the correct contract.

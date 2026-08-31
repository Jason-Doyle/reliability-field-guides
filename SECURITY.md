# Security Policy

The field guides describe controls for systems that may process sensitive or
consequential state. A defect in a schema or example could encourage an unsafe
implementation even though this repository does not operate a hosted service.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could enable scope leakage,
memory poisoning, policy bypass, unsafe procedure activation, or exposure of
sensitive records.

Use GitHub's private vulnerability reporting option on the repository Security
tab. Include:

- the affected artifact and revision;
- the failure scenario;
- the expected and observed behaviour;
- a minimal reproduction where it is safe to provide one;
- the likely consequence and affected risk tier.

If private vulnerability reporting is unavailable, use the contact route at
[jasondoyle.ie](https://jasondoyle.ie/) and avoid including exploit details in
the first message.

## Supported versions

Until the first tagged release, only the current `main` branch is maintained.
After releases begin, support status will be recorded here.

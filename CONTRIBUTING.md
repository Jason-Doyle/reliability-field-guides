# Contributing

Contributions should improve the practical reliability value of a field guide.
Small, evidence-backed changes are preferred to broad collections of
unvalidated advice.

## Before proposing a change

1. Identify the decision, implementation problem, or failure mode the change
   addresses.
2. Check whether an existing artifact can be extended instead of adding a
   parallel structure.
3. Explain the evidence behind a new required field or control.
4. Consider compatibility for existing consumers and examples.

## Schema changes

A schema change should include:

- the updated JSON Schema;
- at least one representative valid example;
- a negative contract test when the change introduces a required safety
  property;
- documentation of the operational behaviour the field represents;
- a changelog entry;
- a `schemaVersion` change when compatibility requires one.

Tightening a contract so that previously accepted records become invalid is a
breaking change and requires a new major schema version. Published release tags
and their schema versions must remain immutable.

Do not add a field solely because a specific vendor exposes it. Prefer
technology-neutral concepts with a clear reliability purpose.

## Documentation changes

Use direct language and describe observable behaviour. Distinguish requirements
that a schema can enforce from controls that require runtime evidence.

Examples must use fictional organisations, identifiers, and records. Do not
submit credentials, private operational data, personal information, or copied
customer content.

## Validation

Install the locked development dependencies and run:

```powershell
npm ci
npm test
```

All examples must pass. Negative contract cases must continue to fail for their
intended reason.

Validate a proposed or adopted artifact directly with:

```powershell
npm run validate -- path/to/artifact.json
```

Use `--contract <name>` when the artifact does not declare `$schema`.

## Pull requests

Keep each pull request focused on one field guide or one coherent contract
change. Include:

- the problem being addressed;
- the affected risk tier or lifecycle stage;
- compatibility impact;
- validation evidence;
- any control that still depends on the adopting system.

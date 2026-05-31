# Contributing

Contributions are welcome when they preserve the project boundary: local-only,
authorized testing, and minimal browser permissions.

## Ground Rules

- Keep collection user-initiated.
- Prefer redacted metadata over raw sensitive values.
- Do not add remote services, telemetry, analytics, or auto-update code.
- Do not add exploit payloads or request fuzzing.
- Document any new permission in the README before requesting it.
- Keep the extension dependency-free unless a dependency removes meaningful
  risk or maintenance burden.

## Development

```bash
npm run verify
npm run lint
npm run start
```

`npm run lint` and `npm run start` use Mozilla's `web-ext` tool through `npx`.

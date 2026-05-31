# Security Policy

## Supported Scope

This project is for lawful, authorized security testing, defensive review, bug
bounty work, and local lab learning.

Do not use it against systems you do not own or do not have explicit permission
to test.

## Design Boundaries

- No request modification.
- No request replay.
- No request body collection.
- No response body collection.
- No cookie value collection.
- No credential collection.
- No telemetry.
- No remote upload.
- No stealth behavior.
- No persistence outside Firefox extension storage and user exports.

## Reporting Issues

Open a GitHub issue with:

- expected behavior
- actual behavior
- Firefox version
- operating system
- reproduction steps using a local or public test page

Do not include private target URLs, secrets, cookies, tokens, or credentials in
public issues.

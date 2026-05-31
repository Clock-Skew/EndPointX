# EndPointX

[![Firefox WebExtension](https://img.shields.io/badge/Firefox-WebExtension-FF7139?style=for-the-badge&logo=firefoxbrowser&logoColor=white)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4f46e5?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
[![Privacy: Local Only](https://img.shields.io/badge/Privacy-Local_Only-16a34a?style=for-the-badge)](PRIVACY.md)
[![No Telemetry](https://img.shields.io/badge/Telemetry-None-111827?style=for-the-badge)](PRIVACY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)
[![Static Verify](https://img.shields.io/badge/Static_Verify-Passing-22c55e?style=for-the-badge)](scripts/verify_extension.py)
[![GitHub Release](https://img.shields.io/github/v/release/Clock-Skew/EndPointX?style=for-the-badge&logo=github)](https://github.com/Clock-Skew/EndPointX/releases)

![EndPointX](a.png)

> A Firefox-first, local-only WebExtension for mapping endpoint URLs from the
> active tab during authorized security review.

EndPointX helps security testers, bug bounty researchers,
developers, and defenders quickly turn the currently open page into a compact
endpoint inventory. It collects URLs from visible page structure and browser
resource timing metadata, redacts query values, deduplicates endpoints, and
exports a local JSON artifact.

It is intentionally not a proxy, crawler, fuzzer, scanner, exploit tool, or
request replayer.

## Status

Prototype: `0.1.0`

The first release is an unpacked Firefox extension for local development and
review. A development zip is attached to GitHub releases. It is not listed on
Mozilla Add-ons yet.

## Lawful Use Only

Use this tool only on systems you own, systems you administer, explicit bug
bounty scope, written client scope, or local lab targets.

This project is designed for:

- authorized application security testing
- defensive endpoint inventory
- bug bounty note preparation
- local lab learning
- developer self-review before release

This project is not designed for unauthorized reconnaissance or automated
probing of third-party systems.

## Security Warning

Use only on systems and content you own or are explicitly authorized to test.
Unauthorized use may violate policy, law, or both.

## Disclaimer

To the maximum extent permitted by law, this software is provided "as is"
without warranties of any kind. The authors and contributors are not liable
for misuse, unauthorized use, or any loss or damage resulting from use of the
software.

## What It Collects

Collection happens only after the user clicks **Collect Current Tab** in the
extension popup.

The collector records:

- links from `a[href]`, `area[href]`, and `link[href]`
- form action URLs, form methods, and form field names
- script, image, frame, media, embed, object, and source URLs
- `srcset` image candidates
- inline CSS `url(...)` and `@import` references
- metadata URLs from selected `meta[content]` values
- `PerformanceResourceTiming` metadata exposed by the browser
- same-origin versus cross-origin classification
- query parameter names with query values redacted

The latest capture is stored in Firefox extension storage so the popup can be
closed and reopened without losing the current map.

## What It Does Not Collect

- No request bodies.
- No response bodies.
- No cookie values.
- No credential values.
- No browser history.
- No keystrokes.
- No localStorage or sessionStorage values.
- No data from inactive tabs.
- No background crawling.
- No remote upload.
- No telemetry.
- No request modification.

## Why This Exists

Most security workflows eventually need a clean list of observed routes,
assets, forms, and API-looking URLs. Browser devtools can show this, but the
output is scattered across Elements, Network, Sources, and manual notes.

EndPointX makes a narrow promise:

1. Ask the active tab what endpoint-like URLs are visible.
2. Redact risky URL values.
3. Deduplicate the result.
4. Keep it local.
5. Export a useful artifact for notes and reports.

## Features

- **Click-to-collect**: no persistent content script and no continuous
  collection.
- **Active-tab only**: uses `activeTab` with `scripting` rather than broad host
  permissions.
- **Endpoint deduplication**: groups repeated URLs across DOM, forms, CSS, and
  timing sources.
- **Query redaction**: keeps query keys but replaces values with `<redacted>`.
- **Origin grouping**: marks same-origin and cross-origin endpoints.
- **Local persistence**: keeps the latest capture in `browser.storage.local`.
- **JSON export**: downloads a structured evidence file from the popup.
- **URL copy**: copies the redacted endpoint list to the clipboard.
- **Dependency-free runtime**: plain HTML, CSS, and JavaScript.

## Permissions

The extension follows Mozilla's WebExtension permission model and keeps the
permission set small.

| Permission | Why it is used | Boundary |
| --- | --- | --- |
| `activeTab` | Grants temporary access to the current tab after user action. | Current active tab only. |
| `scripting` | Injects the collector script on demand. | One-shot execution from the popup. |
| `storage` | Saves the latest capture locally. | Firefox extension storage only. |

Permissions intentionally not requested:

- `<all_urls>`
- `cookies`
- `downloads`
- `history`
- `tabs`
- `webRequest`
- `webRequestBlocking`

The manifest also declares Firefox's `data_collection_permissions.required` as
`["none"]`. The extension does not transmit collected data outside the local
browser.

## Installation

### Temporary Firefox Install

1. Open Firefox.
2. Visit `about:debugging`.
3. Select **This Firefox**.
4. Select **Load Temporary Add-on**.
5. Choose `manifest.json` from this folder.

Firefox keeps temporary extensions installed until the browser is restarted.

### Development With web-ext

Mozilla's official `web-ext` workflow can lint and run the extension:

```bash
npm run lint
npm run start
```

The scripts use `npx --yes web-ext ...`, so no committed dependency folder is
required.

## Usage

1. Navigate to an authorized target page.
2. Click the EndPointX toolbar icon.
3. Click **Collect Current Tab**.
4. Review the endpoint list and origin labels.
5. Use the filter box to narrow the list.
6. Click **Copy URLs** to copy the currently visible endpoints, or **Export JSON** to save the full capture.

For a local smoke test, load the extension temporarily and collect endpoints
from Seedboard:

```text
http://127.0.0.1:8787/
```

The smoke test is local-only and keeps the collection flow inside the browser.

## Output Format

Example export:

```json
{
  "version": 1,
  "collectedAt": "2026-05-08T20:30:00.000Z",
  "page": {
    "url": "https://example.test/app?view=<redacted>",
    "origin": "https://example.test",
    "host": "example.test",
    "title": "Example App"
  },
  "counts": {
    "endpoints": 3,
    "sameOrigin": 2,
    "crossOrigin": 1
  },
  "endpoints": [
    {
      "url": "https://example.test/api/users?page=<redacted>",
      "origin": "https://example.test",
      "host": "example.test",
      "path": "/api/users",
      "queryKeys": ["page"],
      "sameOrigin": true,
      "sources": ["performance"],
      "kinds": ["fetch"],
      "methods": [],
      "count": 1,
      "details": [
        {
          "initiatorType": "fetch",
          "durationMs": 42,
          "transferSize": 2048,
          "nextHopProtocol": "h2"
        }
      ]
    }
  ],
  "warnings": []
}
```

## Security And Privacy Model

EndPointX is built around a narrow collection surface:

- user action gates collection
- the active tab gates access
- URL query values are redacted before storage
- collected data stays in Firefox extension storage unless exported
- runtime code contains no `fetch`, `XMLHttpRequest`, or `sendBeacon` calls
- runtime code does not access `document.cookie`
- runtime code does not read web storage values from the target page

See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md) for the full policy.

## Verification

Run the local static verifier:

From the repository root:

```bash
npm run verify
```

The verifier checks:

- manifest JSON validity
- expected minimal permissions
- absence of forbidden permissions
- Firefox no-data-collection declaration
- referenced icons and popup files
- no network API calls in runtime scripts
- no cookie access in runtime scripts
- no page web storage value reads
- README security/privacy markers

When `web-ext` is available, also run:

```bash
npm run lint
```

Mozilla recommends `web-ext lint` before running or submitting an extension.

## Project Layout

```text
.
├── manifest.json
├── src/
│   ├── collector.js
│   ├── popup.css
│   ├── popup.html
│   └── popup.js
├── icons/
│   ├── endpoint-48.svg
│   └── endpoint-96.svg
├── scripts/
│   └── verify_extension.py
├── PRIVACY.md
├── SECURITY.md
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

## Design Choices

### No webRequest In The MVP

`webRequest` is powerful, but it expands the permission story and can move a
small endpoint mapper toward proxy-like behavior. The MVP relies on active-tab
DOM inspection and browser Performance API metadata instead.

Future versions may add optional network observation only after the scope guard,
redaction model, and permission explanation are stronger.

### No Broad Host Permissions

Mozilla documents `activeTab` as a way to let an extension act on the current
page after explicit user interaction without requesting broad host access. This
matches the product boundary: collect only when asked.

### Redacted URLs By Default

Endpoint mapping usually needs paths and parameter names, not live secret
values. Query values are replaced with `<redacted>` before display, storage, or
export.

## License

MIT. See [LICENSE](LICENSE).

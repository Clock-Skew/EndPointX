# Privacy

EndPointX is designed to be local-only.

## What It Collects

When the user clicks **Collect Current Tab**, the extension reads the active tab
and records endpoint metadata visible to the page:

- HTTP and HTTPS URLs from links, forms, scripts, images, frames, media, embeds,
  inline CSS references, metadata URLs, and the browser Performance API.
- Form methods and field names.
- Resource timing metadata such as duration, transfer size, initiator type, and
  protocol when the browser exposes it.

## What It Does Not Collect

- Request bodies.
- Response bodies.
- Cookie names or values.
- Local storage or session storage values.
- Passwords or credential values.
- Keystrokes.
- Browser history.
- Data from inactive tabs.

## Redaction

Query parameter values are replaced with `<redacted>` before storage or export.
Query parameter names are retained because they are useful for endpoint mapping.

## Transmission

The extension does not send collected data to any remote server. Data stays in
Firefox extension storage until the user exports or clears browser data.

## Storage

The latest capture is saved in `browser.storage.local` so the popup can be
reopened without losing context. Extension storage is local to the browser
profile and is not encrypted by Firefox.

#!/usr/bin/env python3
"""Static verification for EndPointX."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORBIDDEN_PERMISSIONS = {
    "<all_urls>",
    "cookies",
    "downloads",
    "history",
    "tabs",
    "webRequest",
    "webRequestBlocking",
}
EXPECTED_PERMISSIONS = {"activeTab", "scripting", "storage"}


def fail(message: str) -> None:
    print(f"verify_extension: {message}", file=sys.stderr)
    raise SystemExit(1)


def read_manifest() -> dict:
    try:
        return json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        fail(f"manifest.json is invalid JSON: {error}")


def assert_manifest(manifest: dict) -> None:
    permissions = set(manifest.get("permissions", []))
    missing = EXPECTED_PERMISSIONS - permissions
    forbidden = FORBIDDEN_PERMISSIONS & permissions
    if missing:
        fail(f"missing expected permissions: {sorted(missing)}")
    if forbidden:
        fail(f"forbidden permissions present: {sorted(forbidden)}")
    if manifest.get("manifest_version") != 3:
        fail("manifest_version must be 3")
    gecko = manifest.get("browser_specific_settings", {}).get("gecko", {})
    data_permissions = gecko.get("data_collection_permissions", {})
    if data_permissions.get("required") != ["none"]:
        fail("manifest must declare no data collection for Firefox")

    for icon_path in manifest.get("icons", {}).values():
        if not (ROOT / icon_path).exists():
            fail(f"missing icon: {icon_path}")
    popup = manifest.get("action", {}).get("default_popup")
    if not popup or not (ROOT / popup).exists():
        fail("default popup is missing")


def assert_sources() -> None:
    for path in [ROOT / "src" / "collector.js", ROOT / "src" / "popup.js"]:
        text = path.read_text(encoding="utf-8")
        if re.search(r"\b(fetch|XMLHttpRequest|sendBeacon)\s*\(", text):
            fail(f"network API call found in {path.relative_to(ROOT)}")
        if "document.cookie" in text:
            fail(f"cookie access found in {path.relative_to(ROOT)}")
        if "localStorage" in text or "sessionStorage" in text:
            fail(f"web storage value access found in {path.relative_to(ROOT)}")

    collector = (ROOT / "src" / "collector.js").read_text(encoding="utf-8")
    for required in ["<redacted>", "performance.getEntriesByType", "queryKeys"]:
        if required not in collector:
            fail(f"collector missing required marker: {required}")


def assert_docs() -> None:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    required_phrases = [
        "Lawful Use Only",
        "Permissions",
        "No request bodies",
        "No cookie values",
        "Mozilla",
        "EndPointX",
        "shields.io",
    ]
    for phrase in required_phrases:
        if phrase not in readme:
            fail(f"README missing phrase: {phrase}")


def main() -> int:
    manifest = read_manifest()
    assert_manifest(manifest)
    assert_sources()
    assert_docs()
    print("endpointx static verification passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

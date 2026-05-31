const api = globalThis.browser || globalThis.chrome;
const STORAGE_KEY = "endpointx:lastCapture";

const elements = {
  collectButton: document.querySelector("#collectButton"),
  copyButton: document.querySelector("#copyButton"),
  exportButton: document.querySelector("#exportButton"),
  endpointCount: document.querySelector("#endpointCount"),
  sameOriginCount: document.querySelector("#sameOriginCount"),
  crossOriginCount: document.querySelector("#crossOriginCount"),
  filterInput: document.querySelector("#filterInput"),
  status: document.querySelector("#status"),
  list: document.querySelector("#endpointList")
};

let latestCapture = null;

function setStatus(message, type = "ok") {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", type === "error");
}

function enableExport(enabled) {
  elements.copyButton.disabled = !enabled;
  elements.exportButton.disabled = !enabled;
}

function getVisibleEndpoints(capture) {
  const endpoints = capture?.endpoints || [];
  const filter = elements.filterInput.value.trim().toLowerCase();
  if (!filter) {
    return endpoints;
  }
  return endpoints.filter((endpoint) => endpoint.url.toLowerCase().includes(filter));
}

function renderCapture(capture) {
  latestCapture = capture;
  const endpoints = capture?.endpoints || [];
  const visible = getVisibleEndpoints(capture);

  elements.endpointCount.textContent = String(capture?.counts?.endpoints || 0);
  elements.sameOriginCount.textContent = String(capture?.counts?.sameOrigin || 0);
  elements.crossOriginCount.textContent = String(capture?.counts?.crossOrigin || 0);
  elements.list.replaceChildren();

  if (!endpoints.length) {
    setStatus("No endpoints collected yet.");
    enableExport(false);
    return;
  }

  enableExport(true);
  if (visible.length) {
    setStatus(`Showing ${visible.length} of ${endpoints.length} endpoints.`);
  } else {
    setStatus("No endpoints match the current filter.");
  }

  for (const endpoint of visible) {
    const item = document.createElement("li");
    item.className = "endpoint";

    const code = document.createElement("code");
    code.textContent = endpoint.url;
    item.append(code);

    const meta = document.createElement("div");
    meta.className = "endpoint-meta";
    const originChip = document.createElement("span");
    originChip.className = `chip ${endpoint.sameOrigin ? "safe" : "cross"}`;
    originChip.textContent = endpoint.sameOrigin ? "same-origin" : "cross-origin";
    meta.append(originChip);

    for (const source of endpoint.sources || []) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = source;
      meta.append(chip);
    }

    for (const kind of endpoint.kinds || []) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = kind;
      meta.append(chip);
    }

    item.append(meta);
    elements.list.append(item);
  }
}

async function collectCurrentTab() {
  try {
    setStatus("Collecting active tab...");
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new Error("No active tab found.");
    }

    const results = await api.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/collector.js"]
    });
    const capture = results?.[0]?.result;
    if (!capture || !Array.isArray(capture.endpoints)) {
      throw new Error("Collector did not return endpoint data.");
    }

    await api.storage.local.set({ [STORAGE_KEY]: capture });
    renderCapture(capture);
  } catch (error) {
    setStatus(error.message || String(error), "error");
  }
}

function exportJson() {
  if (!latestCapture) {
    return;
  }

  const host = latestCapture.page?.host || "capture";
  const stamp = latestCapture.collectedAt.replace(/[:.]/g, "-");
  const filename = `endpointx-${host}-${stamp}.json`;
  const blob = new Blob([JSON.stringify(latestCapture, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus(`Exported ${latestCapture.counts.endpoints} endpoints.`);
}

async function copyUrls() {
  if (!latestCapture) {
    return;
  }

  const urls = getVisibleEndpoints(latestCapture).map((endpoint) => endpoint.url).join("\n");
  try {
    await navigator.clipboard.writeText(urls);
    setStatus(`Copied ${getVisibleEndpoints(latestCapture).length} endpoint URLs.`);
  } catch (error) {
    setStatus(`Clipboard failed: ${error.message}`, "error");
  }
}

async function loadLastCapture() {
  try {
    const data = await api.storage.local.get(STORAGE_KEY);
    if (data?.[STORAGE_KEY]) {
      renderCapture(data[STORAGE_KEY]);
    }
  } catch (error) {
    setStatus(`Could not load local capture: ${error.message}`, "error");
  }
}

elements.collectButton.addEventListener("click", collectCurrentTab);
elements.exportButton.addEventListener("click", exportJson);
elements.copyButton.addEventListener("click", copyUrls);
elements.filterInput.addEventListener("input", () => renderCapture(latestCapture));
loadLastCapture();

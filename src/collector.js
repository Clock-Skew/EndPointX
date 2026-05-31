(() => {
  const URL_TYPES = {
    a: ["href", "link"],
    area: ["href", "link"],
    link: ["href", "resource"],
    script: ["src", "script"],
    img: ["src", "image"],
    iframe: ["src", "frame"],
    frame: ["src", "frame"],
    source: ["src", "media"],
    video: ["src", "media"],
    audio: ["src", "media"],
    track: ["src", "media"],
    embed: ["src", "embed"],
    input: ["src", "input-resource"],
    object: ["data", "object"]
  };

  const endpoints = new Map();
  const warnings = [];

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function safeNumber(value) {
    if (!Number.isFinite(value)) {
      return undefined;
    }
    return Math.round(value);
  }

  function sanitizeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") {
      return null;
    }

    let parsed;
    try {
      parsed = new URL(rawUrl, document.baseURI);
    } catch {
      return null;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    const queryKeys = uniqueSorted([...parsed.searchParams.keys()]);
    parsed.hash = "";
    parsed.search = "";
    if (queryKeys.length) {
      parsed.search = queryKeys
        .map((key) => `${encodeURIComponent(key)}=<redacted>`)
        .join("&");
    }

    return {
      url: parsed.toString(),
      origin: parsed.origin,
      host: parsed.host,
      path: parsed.pathname,
      queryKeys,
      sameOrigin: parsed.origin === location.origin
    };
  }

  function addEndpoint(rawUrl, source, kind, details = {}) {
    const sanitized = sanitizeUrl(rawUrl);
    if (!sanitized) {
      return;
    }

    const key = sanitized.url;
    const current = endpoints.get(key) || {
      url: sanitized.url,
      origin: sanitized.origin,
      host: sanitized.host,
      path: sanitized.path,
      queryKeys: sanitized.queryKeys,
      sameOrigin: sanitized.sameOrigin,
      sources: [],
      kinds: [],
      methods: [],
      count: 0,
      details: []
    };

    current.sources = uniqueSorted([...current.sources, source]);
    current.kinds = uniqueSorted([...current.kinds, kind]);
    if (details.method) {
      current.methods = uniqueSorted([...current.methods, details.method.toUpperCase()]);
    }
    current.count += 1;

    const compactDetails = {};
    for (const [detailKey, detailValue] of Object.entries(details)) {
      if (detailValue !== undefined && detailValue !== null && detailValue !== "") {
        compactDetails[detailKey] = detailValue;
      }
    }
    if (Object.keys(compactDetails).length) {
      current.details.push(compactDetails);
    }

    endpoints.set(key, current);
  }

  function collectDomAttributes() {
    for (const [tagName, [attribute, kind]] of Object.entries(URL_TYPES)) {
      document.querySelectorAll(`${tagName}[${attribute}]`).forEach((element) => {
        const rawUrl = element.getAttribute(attribute);
        const details = {
          tag: tagName,
          rel: element.getAttribute("rel") || undefined,
          type: element.getAttribute("type") || undefined,
          method: tagName === "form" ? element.getAttribute("method") || "GET" : undefined
        };
        addEndpoint(rawUrl, "dom", kind, details);
      });
    }

    document.querySelectorAll("form").forEach((form) => {
      const action = form.getAttribute("action") || location.href;
      const fields = [...form.elements]
        .map((field) => field.getAttribute("name"))
        .filter(Boolean)
        .slice(0, 50);
      addEndpoint(action, "form", "form-action", {
        method: form.getAttribute("method") || "GET",
        fieldNames: uniqueSorted(fields)
      });
    });
  }

  function collectSrcSets() {
    document.querySelectorAll("[srcset]").forEach((element) => {
      const entries = String(element.getAttribute("srcset") || "")
        .split(",")
        .map((entry) => entry.trim().split(/\s+/)[0])
        .filter(Boolean);
      entries.forEach((rawUrl) => addEndpoint(rawUrl, "dom-srcset", "image-candidate", {
        tag: element.tagName.toLowerCase()
      }));
    });
  }

  function collectInlineCssUrls() {
    const cssTexts = [];
    document.querySelectorAll("style").forEach((style) => cssTexts.push(style.textContent || ""));
    document.querySelectorAll("[style]").forEach((element) => cssTexts.push(element.getAttribute("style") || ""));

    const urlPattern = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;
    const importPattern = /@import\s+(?:url\(\s*)?(['"])(.*?)\1/gi;

    for (const cssText of cssTexts) {
      for (const match of cssText.matchAll(urlPattern)) {
        addEndpoint(match[2], "inline-css", "css-url");
      }
      for (const match of cssText.matchAll(importPattern)) {
        addEndpoint(match[2], "inline-css", "css-import");
      }
    }
  }

  function collectPerformanceResources() {
    if (!performance?.getEntriesByType) {
      return;
    }

    performance.getEntriesByType("resource").forEach((entry) => {
      addEndpoint(entry.name, "performance", entry.initiatorType || "resource", {
        initiatorType: entry.initiatorType || undefined,
        durationMs: safeNumber(entry.duration),
        transferSize: safeNumber(entry.transferSize),
        nextHopProtocol: entry.nextHopProtocol || undefined
      });
    });

    performance.getEntriesByType("navigation").forEach((entry) => {
      addEndpoint(entry.name, "performance", "navigation", {
        durationMs: safeNumber(entry.duration),
        nextHopProtocol: entry.nextHopProtocol || undefined
      });
    });
  }

  function collectCanonicalAndMetadataUrls() {
    document.querySelectorAll("meta[content]").forEach((meta) => {
      const content = meta.getAttribute("content") || "";
      if (/^https?:\/\//i.test(content)) {
        addEndpoint(content, "metadata", "meta-url", {
          property: meta.getAttribute("property") || meta.getAttribute("name") || undefined
        });
      }
    });
  }

  function collectAll() {
    try {
      collectDomAttributes();
      collectSrcSets();
      collectInlineCssUrls();
      collectPerformanceResources();
      collectCanonicalAndMetadataUrls();
    } catch (error) {
      warnings.push(`Collector warning: ${error.message}`);
    }

    const endpointList = [...endpoints.values()]
      .map((endpoint) => ({
        ...endpoint,
        details: endpoint.details.slice(0, 10)
      }))
      .sort((a, b) => a.url.localeCompare(b.url));

    const sameOriginCount = endpointList.filter((endpoint) => endpoint.sameOrigin).length;
    const crossOriginCount = endpointList.length - sameOriginCount;

    return {
      version: 1,
      collectedAt: new Date().toISOString(),
      page: {
        url: sanitizeUrl(location.href)?.url || location.origin,
        origin: location.origin,
        host: location.host,
        title: document.title || ""
      },
      counts: {
        endpoints: endpointList.length,
        sameOrigin: sameOriginCount,
        crossOrigin: crossOriginCount
      },
      endpoints: endpointList,
      warnings
    };
  }

  return collectAll();
})();

function uniqueAndTrimmed(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const trimmed = (item || "").replace(/\s+/g, " ").trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
}

function collectMatchesForSelector(selector) {
  let matches = [];
  try {
    // Special case: meta tags often need content attribute
    if (selector.startsWith("meta")) {
      const nodes = Array.from(document.querySelectorAll(selector));
      matches = nodes.map(node => node.getAttribute("content") || node.getAttribute("value") || node.innerText || node.textContent || "");
    } else {
      const nodes = Array.from(document.querySelectorAll(selector));
      matches = nodes.map(node => node.innerText || node.textContent || "");
    }
  } catch (e) {
    // Invalid selector or access issue
    matches = [];
  }
  return uniqueAndTrimmed(matches);
}

function scanSelectors(selectors) {
  const perSelector = [];
  const allTexts = [];
  for (const selector of selectors) {
    const matches = collectMatchesForSelector(selector);
    perSelector.push({ selector, matches });
    allTexts.push(...matches);
  }
  const combinedText = allTexts.join("\n");
  return { results: perSelector, combinedText };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "SCAN_SELECTORS") return;
  const selectors = Array.isArray(message.selectors) ? message.selectors : [];
  const payload = scanSelectors(selectors);
  sendResponse(payload);
  return true;
});
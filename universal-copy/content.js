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

const STORAGE_KEY = "universal_copy_targets";

function getStorageArea() {
  return chrome.storage && chrome.storage.sync ? chrome.storage.sync : chrome.storage.local;
}

function loadTargets() {
  const storage = getStorageArea();
  return new Promise(resolve => {
    storage.get([STORAGE_KEY], data => {
      const targets = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
      resolve(targets);
    });
  });
}

function createCopyButton(getText) {
  const btn = document.createElement("button");
  btn.textContent = "Copy";
  btn.style.marginLeft = "8px";
  btn.style.padding = "2px 6px";
  btn.style.fontSize = "12px";
  btn.style.cursor = "pointer";
  btn.addEventListener("click", async e => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(getText());
      btn.textContent = "Copied";
      setTimeout(() => (btn.textContent = "Copy"), 1200);
    } catch (err) {
      console.error("Clipboard error", err);
    }
  });
  return btn;
}

function markInjected(element) {
  element.setAttribute("data-universal-copy-injected", "1");
}

function isInjected(element) {
  return element.getAttribute("data-universal-copy-injected") === "1";
}

function getNodeText(node) {
  return (node && (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim()) || "";
}

function injectForTarget(target) {
  let nodes = [];
  try {
    nodes = Array.from(document.querySelectorAll(target.selector));
  } catch (e) {
    return;
  }
  for (const node of nodes) {
    if (!node || isInjected(node)) continue;
    const text = getNodeText(node);
    const btn = createCopyButton(() => getNodeText(node));
    // Try to append near the node without breaking layout
    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      const wrapper = document.createElement("span");
      wrapper.style.display = "inline-flex";
      wrapper.style.alignItems = "center";
      node.insertAdjacentElement("afterend", wrapper);
      wrapper.appendChild(btn);
    } else {
      const container = node.closest("h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,th,td,caption,figcaption,header,footer,summary") || node;
      const holder = document.createElement("span");
      holder.style.display = "inline-flex";
      holder.style.alignItems = "center";
      holder.style.marginLeft = "6px";
      holder.appendChild(btn);
      container.appendChild(holder);
    }
    markInjected(node);
  }
}

async function runInjection() {
  const targets = await loadTargets();
  targets.forEach(injectForTarget);
}

// Initial run
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runInjection);
} else {
  runInjection();
}

// Observe future DOM changes
const observer = new MutationObserver(() => {
  runInjection();
});
observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
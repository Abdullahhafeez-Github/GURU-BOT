const STORAGE_KEY = "universal_copy_selectors";

function loadSelectors() {
  return new Promise(resolve => {
    chrome.storage.sync.get([STORAGE_KEY], data => {
      const selectors = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
      resolve(selectors);
    });
  });
}

function saveSelectors(selectors) {
  return new Promise(resolve => {
    chrome.storage.sync.set({ [STORAGE_KEY]: selectors }, resolve);
  });
}

function renderSelectors(selectors) {
  const list = document.getElementById("selector-list");
  list.innerHTML = "";
  selectors.forEach((selector, index) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = selector;
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "small";
    del.addEventListener("click", async () => {
      const updated = selectors.filter((_, i) => i !== index);
      await saveSelectors(updated);
      renderSelectors(updated);
    });
    li.appendChild(text);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function getActiveTab() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0]));
  });
}

async function scanPage(selectors) {
  const tab = await getActiveTab();
  if (!tab?.id) return { results: [], combinedText: "" };
  return new Promise(resolve => {
    chrome.tabs.sendMessage(tab.id, { type: "SCAN_SELECTORS", selectors }, response => {
      if (chrome.runtime.lastError) {
        console.error("Message error:", chrome.runtime.lastError);
        resolve({ results: [], combinedText: "" });
        return;
      }
      resolve(response || { results: [], combinedText: "" });
    });
  });
}

function renderResults(payload) {
  const container = document.getElementById("results");
  container.innerHTML = "";
  const { results = [], combinedText = "" } = payload || {};
  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "result-item";
    const title = document.createElement("div");
    title.className = "muted";
    title.textContent = `${item.selector} (${item.matches.length} matches)`;
    const list = document.createElement("ul");
    list.style.listStyle = "none";
    list.style.padding = "0";
    item.matches.forEach((match, idx) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.gap = "8px";
      li.style.marginBottom = "4px";
      const text = document.createElement("span");
      text.textContent = match.text;
      const btn = document.createElement("button");
      btn.className = "small";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(match.text);
        } catch (e) {
          console.error(e);
        }
      });
      li.appendChild(text);
      li.appendChild(btn);
      list.appendChild(li);
    });
    div.appendChild(title);
    div.appendChild(list);
    container.appendChild(div);
  });
  const copyAllBtn = document.getElementById("copy-all");
  copyAllBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(combinedText);
    } catch (e) {
      console.error(e);
    }
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const input = document.getElementById("selector-input");
  const addBtn = document.getElementById("add-selector");
  const scanBtn = document.getElementById("scan");

  let selectors = await loadSelectors();
  renderSelectors(selectors);

  addBtn.addEventListener("click", async () => {
    const value = (input.value || "").trim();
    if (!value) return;
    if (!selectors.includes(value)) selectors = [...selectors, value];
    await saveSelectors(selectors);
    input.value = "";
    renderSelectors(selectors);
  });

  scanBtn.addEventListener("click", async () => {
    selectors = await loadSelectors();
    const payload = await scanPage(selectors);
    renderResults(payload);
  });
});
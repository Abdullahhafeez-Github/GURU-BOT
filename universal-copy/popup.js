const STORAGE_KEY = "universal_copy_targets";

function getStorageArea() {
  // Prefer sync if available, else local
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

function saveTargets(targets) {
  const storage = getStorageArea();
  return new Promise(resolve => {
    storage.set({ [STORAGE_KEY]: targets }, resolve);
  });
}

function renderTargets(targets) {
  const ul = document.getElementById("targets");
  ul.innerHTML = "";
  if (!targets.length) {
    const li = document.createElement("li");
    li.textContent = "No targets saved yet.";
    ul.appendChild(li);
    return;
  }
  targets.forEach((t, index) => {
    const li = document.createElement("li");
    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.flexDirection = "column";
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = t.name;
    const selector = document.createElement("span");
    selector.className = "selector";
    selector.textContent = t.selector;
    left.appendChild(name);
    left.appendChild(selector);

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "small";
    del.addEventListener("click", async () => {
      const updated = targets.filter((_, i) => i !== index);
      await saveTargets(updated);
      renderTargets(updated);
    });

    li.appendChild(left);
    li.appendChild(del);
    ul.appendChild(li);
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
  const nameInput = document.getElementById("target-name");
  const selectorInput = document.getElementById("target-selector");
  const saveBtn = document.getElementById("save");

  let targets = await loadTargets();
  renderTargets(targets);

  saveBtn.addEventListener("click", async () => {
    const name = (nameInput.value || "").trim();
    const selector = (selectorInput.value || "").trim();
    if (!name || !selector) return;

    // Always append; do not replace existing entries
    const latest = await loadTargets();
    const next = Array.isArray(latest) ? latest.slice() : [];
    next.push({ name, selector });

    await saveTargets(next);
    nameInput.value = "";
    selectorInput.value = "";
    renderTargets(next);
    targets = next;
  });
});
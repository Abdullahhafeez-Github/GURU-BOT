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

function getTargetKey(target) {
	return `${target.name || ""}::${target.selector || ""}`;
}

// Track which targets have been injected for which elements in this page session
const injectedForElement = new WeakMap(); // Element -> Set<string(targetKey)>

function hasInjectedFor(element, targetKey) {
	const set = injectedForElement.get(element);
	return !!(set && set.has(targetKey));
}

function setInjectedFor(element, targetKey) {
	let set = injectedForElement.get(element);
	if (!set) {
		set = new Set();
		injectedForElement.set(element, set);
	}
	set.add(targetKey);
}

function getNodeVisibleText(element) {
	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		return (element.value || "").replace(/\s+/g, " ").trim();
	}
	// Collect text nodes under element, ignoring any of our injected holders if nested
	const walker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode: node => {
				const parent = node.parentNode;
				if (parent && parent.nodeType === 1) {
					const el = parent;
					if (el.getAttribute && el.getAttribute("data-universal-copy-holder") === "1") {
						return NodeFilter.FILTER_REJECT;
					}
				}
				return NodeFilter.FILTER_ACCEPT;
			}
		},
		false
	);
	let buffer = "";
	let current;
	// eslint-disable-next-line no-cond-assign
	while ((current = walker.nextNode())) {
		buffer += current.nodeValue + " ";
	}
	return buffer.replace(/\s+/g, " ").trim();
}

function createCopyButton(getText) {
	const btn = document.createElement("button");
	btn.type = "button";
	btn.textContent = "Copy";
	btn.setAttribute("data-universal-copy-button", "1");
	btn.style.marginLeft = "8px";
	btn.style.padding = "2px 6px";
	btn.style.fontSize = "12px";
	btn.style.cursor = "pointer";
	btn.addEventListener("click", async e => {
		e.stopPropagation();
		try {
			const text = getText();
			await navigator.clipboard.writeText(text);
			btn.textContent = "Copied";
			setTimeout(() => (btn.textContent = "Copy"), 1200);
		} catch (err) {
			console.error("Clipboard error", err);
		}
	});
	return btn;
}

function injectForTarget(target) {
	const selector = target && target.selector;
	if (!selector) return;
	const targetKey = getTargetKey(target);
	let nodes = [];
	try {
		nodes = Array.from(document.querySelectorAll(selector));
	} catch (_) {
		return; // invalid selector
	}
	for (const node of nodes) {
		if (!node) continue;
		if (hasInjectedFor(node, targetKey)) continue;
		// Create holder as a sibling so its label never becomes part of the node's text
		const holder = document.createElement("span");
		holder.setAttribute("data-universal-copy-holder", "1");
		holder.setAttribute("data-target-key", targetKey);
		holder.style.display = "inline-flex";
		holder.style.alignItems = "center";
		holder.style.marginLeft = "6px";
		const btn = createCopyButton(() => getNodeVisibleText(node));
		holder.appendChild(btn);
		// Place button right after the matched node
		node.insertAdjacentElement("afterend", holder);
		setInjectedFor(node, targetKey);
	}
}

async function runInjection() {
	const targets = await loadTargets();
	for (const t of targets) injectForTarget(t);
}

// Debounced re-injection on DOM changes
let scheduled = false;
function scheduleInjection() {
	if (scheduled) return;
	scheduled = true;
	setTimeout(() => {
		scheduled = false;
		runInjection();
	}, 200);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", runInjection);
} else {
	runInjection();
}

const observer = new MutationObserver(scheduleInjection);
observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

// Re-run when storage changes (targets added/removed)
if (chrome.storage && chrome.storage.onChanged) {
	chrome.storage.onChanged.addListener((changes, area) => {
		if (area !== (getStorageArea() === chrome.storage.sync ? "sync" : "local")) return;
		if (changes[STORAGE_KEY]) scheduleInjection();
	});
}
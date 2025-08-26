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
	btn.setAttribute("data-universal-copy-button", "1");
	btn.setAttribute("aria-label", "Copy");
	btn.title = "Copy";
	btn.style.marginLeft = "8px";
	btn.style.padding = "2px";
	btn.style.fontSize = "12px";
	btn.style.cursor = "pointer";
	btn.style.background = "transparent";
	btn.style.border = "none";
	btn.style.lineHeight = "0";

	const copyIcon = (
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
		'<path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>' +
		"</svg>"
	);
	const checkIcon = (
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
		'<path d="M9 16.2l-3.5-3.5L4 14.2 9 19l12-12-1.5-1.5z"/>' +
		"</svg>"
	);

	btn.innerHTML = copyIcon;

	btn.addEventListener("click", async e => {
		e.stopPropagation();
		try {
			const text = getText();
			await navigator.clipboard.writeText(text);
			btn.innerHTML = checkIcon;
			btn.title = "Copied";
			setTimeout(() => {
				btn.innerHTML = copyIcon;
				btn.title = "Copy";
			}, 1200);
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
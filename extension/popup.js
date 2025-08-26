const toggleDarkModeOnPage = () => {
  const styleElementId = "__cursor_dark_mode__";
  const existingStyle = document.getElementById(styleElementId);
  if (existingStyle) {
    existingStyle.remove();
    return;
  }
  const css = `
html, body {
  background-color: #0e0e10 !important;
  color: #e6e6e6 !important;
}
html {
  filter: invert(0.9) hue-rotate(180deg) !important;
}
img, video, picture, canvas, svg, iframe {
  filter: invert(1) hue-rotate(180deg) !important;
}
input, textarea, select, button {
  background-color: #1a1a1d !important;
  color: #e6e6e6 !important;
  border-color: #333 !important;
}
`;
  const style = document.createElement("style");
  style.id = styleElementId;
  style.textContent = css;
  document.documentElement.appendChild(style);
};

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("toggle");
  button.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: toggleDarkModeOnPage
      });
      window.close();
    } catch (err) {
      console.error("Failed to toggle dark mode:", err);
    }
  });
});
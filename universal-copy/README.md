# Universal Copy Tool (Chrome Extension)

Save named targets (name + CSS selector). The extension injects a small "Copy" button next to each matching element on any page you visit.

## Install (English)

1. Chrome → `chrome://extensions` → Enable Developer mode → Load unpacked → select `universal-copy` folder.
2. Click the extension icon to open popup.
3. Enter Target name and CSS selector → Save.
4. Reload/visit any page: a Copy button appears near matching elements.

## استعمال (اردو)

1. Chrome میں `chrome://extensions` کھولیں → "Developer mode" آن کریں → "Load unpacked" → `universal-copy` فولڈر منتخب کریں۔
2. پاپ اپ میں "Target name" اور "CSS selector" درج کریں اور Save کریں۔
3. جب آپ کوئی ویب پیج کھولیں گے تو متعلقہ عناصر کے ساتھ "Copy" بٹن خود کار طریقے سے نظر آئے گا۔

## Permissions

- `storage` (to persist your saved targets)

## Files

- `manifest.json` – MV3 config
- `popup.html` – UI to add/delete targets
- `popup.js` – stores targets in Chrome storage
- `content.js` – injects Copy buttons near matching elements automatically
- `icon.png` – extension icon
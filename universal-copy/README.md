# Universal Copy Tool (Chrome Extension)

Save CSS selectors, scan any page, and copy all matching text.

## Install (English)

1. Load the folder as an unpacked extension: Chrome → `chrome://extensions` → Developer mode → Load unpacked → select the `universal-copy` folder.
2. Pin the extension and open the popup.
3. Add CSS selectors (e.g., `h1`, `article .price`, `meta[name=description]`).
4. Click "Scan Current Page" and then "Copy All" or copy individual items.

## استعمال (اردو)

1. Chrome میں `chrome://extensions` کھولیں → "Developer mode" آن کریں → "Load unpacked" پر کلک کریں → `universal-copy` فولڈر منتخب کریں۔
2. پاپ اَپ میں مطلوبہ CSS سلیکٹرز شامل کریں۔
3. "Scan Current Page" دبائیں → نتائج سے "Copy All" یا ہر آئٹم کے ساتھ "Copy" دبائیں۔

## Notes

- Data is stored with `chrome.storage.sync` when available.
- The content script only acts when the popup sends a scan message.
- Permissions: `storage`, `activeTab`, `scripting`, `tabs`, `host_permissions: <all_urls>`.
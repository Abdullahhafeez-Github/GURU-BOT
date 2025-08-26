# Dark Mode Toggle (Chrome Extension)

A minimal Chrome Extension (Manifest V3) to toggle a readable dark mode on the current page.

## Install (English)

1. Unzip the archive `dark-mode-extension.zip` if zipped.
2. Open Chrome and go to `chrome://extensions`.
3. Enable "Developer mode" (top-right).
4. Click "Load unpacked" and select the `extension` folder.
5. Pin the extension from the toolbar and click it to toggle dark mode on the current tab.

## استعمال (اردو)

1. اگر فائل zip میں ہے تو پہلے اسے unzip کریں۔
2. Chrome کھولیں اور `chrome://extensions` پر جائیں۔
3. اوپر دائیں طرف سے "Developer mode" آن کریں۔
4. "Load unpacked" پر کلک کریں اور `extension` فولڈر منتخب کریں۔
5. ٹول بار سے ایکسٹینشن کو pin کریں اور کلک کر کے موجودہ صفحے پر ڈارک موڈ آن/آف کریں۔

## Notes

- Requires Chrome 88+ (Manifest V3 support).
- Uses `activeTab` and `scripting` permissions to inject a small CSS snippet.
- The toggle adds/removes a `<style>` element with id `__cursor_dark_mode__` on the page.
# Manual Tests for Console Bridge v2.0.0

This directory contains manual and semi-automated tests for the Console Bridge extension.

## Files

### puppeteer-devtools-test-limited.js
**Created:** October 7, 2025
**Purpose:** Automated Chrome launch with extension loaded
**Limitations:**
- Cannot fully test DevTools extension context (Puppeteer limitation)
- Cannot verify Console Bridge injection messages in DevTools console
- Can verify page-level console still works

**Usage:**
```bash
node tests/manual/puppeteer-devtools-test-limited.js
```

**What it tests:**
- ✅ Extension loads in Chrome
- ✅ Test page navigates successfully
- ✅ Console methods still work (original behavior preserved)
- ❌ Cannot verify Console Bridge capture (DevTools context isolation)

## Why Manual Testing is Required

Chrome DevTools extensions run in a separate context from the inspected page:
1. **DevTools Context:** Where Console Bridge runs and displays its UI
2. **Page Context:** Where the web app runs (test-page.html)
3. **Injected Context:** Where console-capture.js intercepts console calls

Puppeteer can access the Page Context but not the DevTools Context, so automated testing of the capture events is not possible with basic Puppeteer.

## Manual Testing Procedure

See: `../../test-page.html` for comprehensive manual test page with instructions.

**Quick Steps:**
1. Load extension: `chrome://extensions` → Load unpacked → `extension/src/`
2. Open test page: `http://127.0.0.1:8000/test-page.html`
3. Open DevTools (F12) → Click "Console Bridge" tab
4. Click test buttons and verify capture events in DevTools Console
5. Look for `[Console Bridge Event]` messages with serialized data

## Future: Full Automated Testing

For full automated testing, we would need:
- Chrome DevTools Protocol (CDP) integration to access DevTools context
- Custom test harness that can inspect extension background pages
- Or use Selenium WebDriver with full extension support

This is planned for Subtask 2.5 (Integration & Testing).

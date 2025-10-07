# Manual Testing Guide - Chrome Extension POC

**Purpose:** Validate the Chrome DevTools API proof-of-concept extension

**Status:** Sprint 1, Subtask 1.1
**Last Updated:** October 7, 2025

---

## Prerequisites

- Google Chrome (or any Chromium-based browser: Edge, Brave, Opera, Vivaldi)
- Console Bridge v2.0.0 POC extension files (in this directory)
- Basic understanding of Chrome DevTools

---

## Test Plan

### Test 1: Extension Loading

**Objective:** Verify the extension loads correctly in Chrome

**Steps:**

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `chrome-extension-poc` directory
6. Verify extension appears in the list

**Expected Results:**
- ✅ Extension loads without errors
- ✅ Extension name: "Console Bridge POC"
- ✅ Extension version: "2.0.0-poc"
- ✅ No error badges on the extension card

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue):

---

### Test 2: DevTools Panel Creation

**Objective:** Verify the Console Bridge panel appears in DevTools

**Steps:**

1. With extension loaded, open any web page (e.g., `http://localhost:3000` or `about:blank`)
2. Open Chrome DevTools (F12 or right-click → Inspect)
3. Look for "Console Bridge" tab in DevTools (may be in overflow menu ">>")
4. Click the "Console Bridge" tab

**Expected Results:**
- ✅ "Console Bridge" tab appears in DevTools
- ✅ Panel loads without errors
- ✅ Panel displays connection status UI
- ✅ Panel shows statistics (events captured, messages sent, errors)

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue):

---

### Test 3: WebSocket Connection Attempt

**Objective:** Verify the extension attempts to connect to WebSocket server

**Steps:**

1. Open the Console Bridge DevTools panel (from Test 2)
2. Check the "Connection Status" section
3. Observe connection status indicator

**Expected Results:**
- ✅ Status shows "Connecting..." or "Disconnected"
- ✅ WebSocket URL displayed: `ws://localhost:9223`
- ✅ No JavaScript errors in DevTools console
- ⚠️  Connection fails (expected - no CLI server running yet)

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue):

**Note:** Connection failure is expected at this stage because the CLI WebSocket server (Sprint 4) hasn't been built yet.

---

### Test 4: Console Event Capture

**Objective:** Verify the extension captures console events from the page

**Steps:**

1. Open the Console Bridge panel in DevTools
2. In the main DevTools Console tab, run these commands:
   ```javascript
   console.log('Test log message')
   console.info('Test info message')
   console.warn('Test warning message')
   console.error('Test error message')
   console.debug('Test debug message')
   ```
3. Switch back to the Console Bridge panel
4. Check the "Statistics" section

**Expected Results:**
- ✅ "Events Captured" counter increases
- ✅ Counter shows at least 5 events captured
- ✅ No JavaScript errors

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue):

---

### Test 5: Object Serialization

**Objective:** Verify the extension can serialize complex objects

**Steps:**

1. Open the Console Bridge panel in DevTools
2. In the main DevTools Console tab, run:
   ```javascript
   console.log('Object test:', { foo: 'bar', nested: { value: 42 } })
   console.log('Array test:', [1, 2, 3, 4, 5])
   console.log('Circular test:', (() => { const obj = {}; obj.self = obj; return obj; })())
   console.log('DOM test:', document.body)
   console.log('Function test:', function myFunc() { return 'test'; })
   ```
3. Check DevTools Console for any serialization errors
4. Check Console Bridge panel statistics

**Expected Results:**
- ✅ No serialization errors in DevTools Console
- ✅ Events Captured counter increases by 5
- ✅ Extension handles circular references gracefully
- ✅ Extension handles DOM elements
- ✅ Extension handles functions

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue):

---

### Test 6: Extension Stability

**Objective:** Verify the extension runs stably over time

**Steps:**

1. Open the Console Bridge panel
2. Navigate to different web pages (3-5 different URLs)
3. Generate console logs on each page
4. Check for memory leaks or crashes

**Expected Results:**
- ✅ Extension continues working across page navigations
- ✅ No crashes or errors
- ✅ Statistics counters work correctly
- ✅ No excessive memory usage

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue):

---

## Known Limitations (POC)

This is a proof-of-concept with intentional limitations:

1. **No WebSocket Server:** CLI server (Sprint 4) not implemented yet
2. **Limited Console Methods:** Only 5 methods (log, info, warn, error, debug) - full implementation will support all 18 methods
3. **Basic Serialization:** Simple object serialization - production version will be more robust
4. **No Error Recovery:** Basic error handling - production version will have retry logic
5. **No UI Feedback:** Minimal UI - production version will show actual log output

---

## Success Criteria

POC is considered successful if:

- ✅ Extension loads in Chrome without errors
- ✅ DevTools panel appears and is functional
- ✅ Console events are captured (verified by statistics counter)
- ✅ WebSocket connection attempt occurs (connection may fail - that's OK)
- ✅ Object serialization works for basic types
- ✅ No major crashes or errors during testing

---

## Troubleshooting

### Extension won't load
- Check manifest.json syntax (validate with JSON validator)
- Check DevTools extension page for error messages
- Verify all required files exist (manifest.json, devtools.html, devtools.js, panel.html, panel.js)

### DevTools panel doesn't appear
- Refresh the extension (click reload button on chrome://extensions/)
- Close and reopen DevTools
- Check for JavaScript errors in DevTools Console

### Console events not captured
- Verify you're looking at the Console Bridge panel (not the main Console tab)
- Check DevTools Console for JavaScript errors
- Reload the page and try again

### WebSocket errors
- This is expected - the CLI server isn't running yet
- Verify the error message shows `ws://localhost:9223`
- If error is different, check panel.js WebSocket URL

---

## Testing Checklist

- [ ] Test 1: Extension Loading
- [ ] Test 2: DevTools Panel Creation
- [ ] Test 3: WebSocket Connection Attempt
- [ ] Test 4: Console Event Capture
- [ ] Test 5: Object Serialization
- [ ] Test 6: Extension Stability

**Overall POC Result:**
- [ ] ✅ Success - All tests passed
- [ ] ⚠️  Partial - Some tests passed (document issues above)
- [ ] ❌ Failure - Major issues prevent POC validation

---

## Next Steps After Manual Testing

1. Document results in ADR (`.claude/adr/phase-1/subtask-1.1-chrome-devtools-api-poc.md`)
2. Update implementation plan with findings
3. Proceed to Sprint 2 if POC successful
4. Revise approach if POC shows fundamental issues

---

**Tester Name:** _________________
**Test Date:** _________________
**Browser:** _________________ (version: _______)
**OS:** _________________


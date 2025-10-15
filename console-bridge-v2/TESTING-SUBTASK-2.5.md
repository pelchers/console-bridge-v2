# Testing Guide: Subtask 2.5 - Comprehensive Console Capture

**Date:** October 15, 2025
**Status:** Implementation Complete - Awaiting Manual Testing
**Tester:** User (requires Chrome extension + DevTools)

---

## 📋 What Has Been Verified

✅ **Implementation Complete:**
- Global error handler (`window.addEventListener('error')`) added to panel.js
- Promise rejection handler (`window.addEventListener('unhandledrejection')`) added to panel.js
- Fetch API interception implemented
- XMLHttpRequest API interception implemented
- All code changes committed and pushed to branch `phase-2-subtask-2.5-comprehensive-console-capture`

✅ **CLI Functionality:**
- `console-bridge start --extension-mode` launches successfully
- WebSocket server starts on ws://localhost:9223
- CLI waits for extension connection

✅ **Test Page Created:**
- `test-comprehensive-console-capture.html` created with 7 test cases
- Page loads successfully in browser
- All test buttons functional
- Expected output documented for each test

---

## ❌ What Requires Manual Testing (User Action Required)

The following tests **cannot be automated** because they require:
1. Chrome browser with Console Bridge DevTools extension installed
2. Extension connected to CLI via WebSocket
3. Real Chrome DevTools Console for 1:1 parity validation

**You must perform these tests manually.**

---

## 🧪 Manual Testing Instructions

### Step 1: Reload the Chrome Extension

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Find "Console Bridge DevTools Extension"
4. Click the **"Reload"** button (circular arrow icon)
5. Verify no errors appear

### Step 2: Start the CLI in Extension Mode

```bash
cd C:/Claude/console-bridge-v2
console-bridge start --extension-mode
```

**Expected Output:**
```
🌉 Console Bridge v1.0.0 (Extension Mode)

📡 Starting WebSocket server...
✓ Listening for extension on ws://localhost:9223

Waiting for Chrome extension to connect...
Press Ctrl+C to stop.
```

### Step 3: Open Test Page in Chrome

1. Open a new Chrome tab
2. Navigate to: `file:///C:/Claude/console-bridge-v2/test-comprehensive-console-capture.html`
3. Page should load with test suite UI

### Step 4: Open DevTools and Connect Extension

1. Press `F12` to open Chrome DevTools
2. Click on the **"Console Bridge"** tab (far right)
3. Verify the panel shows:
   - **Status:** Connected (green indicator)
   - **Server Address:** ws://localhost:9223
   - **Tab URL:** file:///C:/Claude/console-bridge-v2/test-comprehensive-console-capture.html

**Check CLI Terminal:**
You should see:
```
✓ Extension connected
[Extension ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx]
```

### Step 5: Run Test Cases

**Important:** Keep your terminal/CLI window visible next to Chrome so you can see output in real-time.

#### Test 1: Console.log (Baseline - No Breaking Changes)

**Action:** Click "Run Test 1" button

**Expected in Chrome Console:**
```
Hello from Extension Mode! Test 1 passed.
```

**Expected in Terminal:**
```
[HH:MM:SS] [file:///C:/Claude/...] log: Hello from Extension Mode! Test 1 passed.
```

**Success Criteria:** ✅ Both Chrome Console and terminal show the message

---

#### Test 2: Uncaught Exception (NEW)

**Action:** Click "Run Test 2 (Will cause error)" button

**Expected in Chrome Console:**
```
Uncaught Error: Test uncaught exception from Test 2
    at test2_uncaughtException (test-comprehensive-console-capture.html:XXX:XX)
    at HTMLButtonElement.onclick (test-comprehensive-console-capture.html:1:1)
```

**Expected in Terminal:**
```
[HH:MM:SS] [file:///C:/Claude/...] error: Uncaught Error: Test uncaught exception from Test 2
  at test2_uncaughtException (...)
  at HTMLButtonElement.onclick (...)
```

**Success Criteria:** ✅ Error appears in BOTH Chrome Console AND terminal with stack trace

**CRITICAL:** If this error ONLY appears in Chrome Console but NOT in terminal, the implementation failed.

---

#### Test 3: Unhandled Promise Rejection (NEW)

**Action:** Click "Run Test 3" button

**Expected in Chrome Console:**
```
Uncaught (in promise) Test promise rejection from Test 3
```

**Expected in Terminal:**
```
[HH:MM:SS] [file:///C:/Claude/...] error: Unhandled Promise Rejection: Test promise rejection from Test 3
```

**Success Criteria:** ✅ Promise rejection appears in BOTH Chrome Console AND terminal

**CRITICAL:** If this rejection ONLY appears in Chrome Console but NOT in terminal, the implementation failed.

---

#### Test 4: Network 404 Error (NEW)

**Action:** Click "Run Test 4" button

**Expected in Chrome Console:**
```
GET http://localhost:4000/nonexistent 404 (Not Found)
```

**Expected in Terminal:**
```
[HH:MM:SS] [file:///C:/Claude/...] error: GET http://localhost:4000/nonexistent 404 (Not Found)
```

**Success Criteria:** ✅ 404 error appears in BOTH Chrome Console AND terminal

**CRITICAL:** This is the PRIMARY bug the user reported. If 404 errors don't appear in terminal, the implementation failed.

---

#### Test 5: Fetch Failure / Network Error (NEW)

**Action:** Click "Run Test 5" button

**Expected in Chrome Console:**
```
GET http://localhost:9999/nonexistent net::ERR_CONNECTION_REFUSED
```

**Expected in Terminal:**
```
[HH:MM:SS] [file:///C:/Claude/...] error: Fetch failed loading: GET "http://localhost:9999/nonexistent".
```

**Success Criteria:** ✅ Network error appears in BOTH Chrome Console AND terminal

---

#### Test 6: Multiple Errors in Sequence

**Action:** Click "Run Test 6" button

**Expected in Chrome Console:**
```
Starting Test 6: Multiple errors test
Explicit console.error call from Test 6
This is a warning from Test 6
GET http://localhost:4000/api/components/modal-dialog/source 404 (Not Found)
Test 6 complete
```

**Expected in Terminal:**
```
[HH:MM:SS] [file:///C:/Claude/...] log: Starting Test 6: Multiple errors test
[HH:MM:SS] [file:///C:/Claude/...] error: Explicit console.error call from Test 6
[HH:MM:SS] [file:///C:/Claude/...] warn: This is a warning from Test 6
[HH:MM:SS] [file:///C:/Claude/...] error: GET http://localhost:4000/api/components/modal-dialog/source 404 (Not Found)
[HH:MM:SS] [file:///C:/Claude/...] log: Test 6 complete
```

**Success Criteria:** ✅ ALL 5 messages appear in terminal in the correct order

---

#### Test 7: Real-World Scenario (FileViewModal.tsx 404) - USER'S BUG

**Action:** Click "Run Test 7" button

**Expected in Chrome Console:**
```
Simulating FileViewModal.tsx fetch...
GET http://localhost:4000/api/components/modal-dialog/source 404 (Not Found)
```

**Expected in Terminal:**
```
[HH:MM:SS] [file:///C:/Claude/...] log: Simulating FileViewModal.tsx fetch...
[HH:MM:SS] [file:///C:/Claude/...] error: GET http://localhost:4000/api/components/modal-dialog/source 404 (Not Found)
[HH:MM:SS] [file:///C:/Claude/...] error: Fetch failed loading: GET "http://localhost:4000/api/components/modal-dialog/source".
```

**Success Criteria:** ✅ This EXACTLY reproduces the user's bug - the 404 error MUST appear in terminal

**CRITICAL:** This is the ultimate validation. If this works, the user's original bug is fixed.

---

### Step 6: Run All Tests (Automated)

**Action:** Click "▶️ Run All Tests (Auto)" button

This will run all 7 tests sequentially with 2-second delays.

**Expected Behavior:**
- Tests run automatically one by one
- Status updates show progress
- All messages appear in terminal in sequence

**Success Criteria:** ✅ All 7 test outputs appear in terminal without manual intervention

---

## ✅ Success Criteria Summary

For Subtask 2.5 to be considered **COMPLETE AND PASSING**, ALL of the following must be true:

1. ✅ Test 1 passes (console.log still works - no breaking changes)
2. ✅ Test 2 passes (uncaught exceptions captured in terminal)
3. ✅ Test 3 passes (promise rejections captured in terminal)
4. ✅ Test 4 passes (404 errors captured in terminal)
5. ✅ Test 5 passes (network errors captured in terminal)
6. ✅ Test 6 passes (multiple errors captured in sequence)
7. ✅ Test 7 passes (user's FileViewModal.tsx bug fixed)
8. ✅ **1:1 Parity:** Everything visible in Chrome Console appears in terminal
9. ✅ **No Duplicates:** No messages appear twice in terminal
10. ✅ **Stack Traces:** Error stack traces included in terminal output

---

## ❌ Failure Scenarios

### Scenario 1: Extension Won't Connect to CLI

**Symptom:** "Console Bridge" tab shows "Disconnected" or "Connecting..."

**Possible Causes:**
- CLI not running (`console-bridge start --extension-mode`)
- WebSocket port 9223 blocked
- Extension not reloaded after code changes

**Fix:**
1. Stop CLI (Ctrl+C)
2. Restart CLI: `console-bridge start --extension-mode`
3. Reload extension at `chrome://extensions/`
4. Refresh test page (F5)

---

### Scenario 2: Only Test 1 Passes, Tests 2-7 Fail

**Symptom:**
- console.log() messages appear in terminal ✅
- Errors, 404s, promise rejections DON'T appear in terminal ❌

**Root Cause:** The comprehensive console capture code didn't load properly

**Debug Steps:**
1. Open Chrome Console (in the test page, not DevTools)
2. Type: `window.__consoleBridgeQueue`
3. It should return an empty array `[]`
4. Run Test 2 (uncaught exception)
5. Type: `window.__consoleBridgeQueue` again
6. It should now contain the error object

**If queue is undefined:** The monitoring script didn't inject
**If queue doesn't update:** The error handlers aren't working

**Fix:**
1. Check panel.js lines 364-520 for syntax errors
2. Reload extension at `chrome://extensions/`
3. Hard refresh test page (Ctrl+Shift+R)

---

### Scenario 3: Errors Appear Twice in Terminal

**Symptom:** Each error shows up 2x in terminal

**Root Cause:** Both the error handler AND console.error() are firing

**Expected Behavior:**
- Uncaught exceptions should appear ONCE (from error handler)
- Explicit console.error() calls should appear ONCE (from console override)

**This is normal for Test 6** which intentionally calls console.error()

---

### Scenario 4: Stack Traces Missing

**Symptom:** Errors appear in terminal but without file/line numbers

**Debug:**
1. Check if `stackTrace` field is in the message
2. Check CLI's message processing code

**Fix:** May need to update CLI's error formatting logic

---

## 📊 Test Results Template

Copy this template and fill it out after testing:

```
## Subtask 2.5 Test Results

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Branch:** phase-2-subtask-2.5-comprehensive-console-capture

### Connection Status
- [ ] Extension connected to CLI successfully
- [ ] "Console Bridge" tab shows green "Connected" status

### Test Results
- [ ] Test 1: Console.log (Baseline) - PASS / FAIL
- [ ] Test 2: Uncaught Exception - PASS / FAIL
- [ ] Test 3: Promise Rejection - PASS / FAIL
- [ ] Test 4: Network 404 Error - PASS / FAIL
- [ ] Test 5: Fetch Failure - PASS / FAIL
- [ ] Test 6: Multiple Errors - PASS / FAIL
- [ ] Test 7: FileViewModal.tsx 404 (User's Bug) - PASS / FAIL

### Overall Result
- [ ] ✅ ALL TESTS PASS - Ready to merge
- [ ] ❌ FAILURES DETECTED - See notes below

### Notes
[Any issues, observations, or additional testing performed]

### Console Parity Assessment
- [ ] 100% of Chrome Console messages appear in terminal
- [ ] No duplicate messages
- [ ] Stack traces present
- [ ] No performance issues

### Recommendation
- [ ] ✅ APPROVE - Merge to phase-8-chrome-web-store-submission
- [ ] ❌ NEEDS FIXES - Document required changes
```

---

## 🚀 Next Steps After Testing

### If ALL Tests Pass ✅

1. **Update ADR:**
   - Change status from "Awaiting Testing" to "Complete and Validated"
   - Add test results section
   - Mark all checklist items complete

2. **Merge to phase-8 branch:**
   ```bash
   git checkout phase-8-chrome-web-store-submission
   git merge phase-2-subtask-2.5-comprehensive-console-capture
   git push origin phase-8-chrome-web-store-submission
   ```

3. **Push to all 4 branches** (as user requested):
   ```bash
   git checkout master
   git merge phase-2-subtask-2.5-comprehensive-console-capture
   git push origin master

   git checkout pre-release
   git merge phase-2-subtask-2.5-comprehensive-console-capture
   git push origin pre-release

   git checkout snapshot
   git merge phase-2-subtask-2.5-comprehensive-console-capture
   git push origin snapshot
   ```

4. **Proceed with Chrome Web Store submission:**
   - Create screenshots showing the extension working
   - Package extension for Chrome Web Store
   - Submit for review

---

### If Tests Fail ❌

1. **Document failures:**
   - Which specific tests failed?
   - What appeared in Chrome Console?
   - What appeared (or didn't appear) in terminal?
   - Screenshots of both

2. **Debug with me:**
   - Share test results template (filled out)
   - Share screenshots of failures
   - I'll help identify the root cause

3. **Do NOT merge** until all tests pass

---

## 📞 Support

If you encounter issues during testing:

1. **Check CLI output** for WebSocket errors
2. **Check Chrome Console** (in test page) for JavaScript errors
3. **Check DevTools Console Bridge tab** for extension errors
4. **Share:**
   - Filled-out test results template
   - Screenshots of failures
   - CLI terminal output
   - Chrome Console output

---

**Remember:** The goal is **1:1 parity** between Chrome Console and terminal. Anything less means the implementation needs refinement.

**Good luck with testing!** 🚀

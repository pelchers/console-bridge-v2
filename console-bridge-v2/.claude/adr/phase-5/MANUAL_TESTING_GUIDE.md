# Manual Testing Guide - Phase 5 (--merge-output)

**Purpose:** Comprehensive manual testing guide for Phase 5 Subtask 5.2
**Status:** Ready for execution
**Last Updated:** October 9, 2025

---

## 🎯 CRITICAL: Working Directory

**ALL COMMANDS MUST BE RUN FROM THIS DIRECTORY:**
```
C:\Claude\console-bridge-v2\
```

**Verify you're in the correct directory:**
```bash
pwd
# Should output: /c/Claude/console-bridge-v2
```

**If not in correct directory:**
```bash
cd /c/Claude/console-bridge-v2
```

---

## 📦 Setup (One-Time)

### Step 1: Install Console Bridge Globally

**From:** `C:\Claude\console-bridge-v2\`

```bash
npm install -g .
```

**Verify installation:**
```bash
console-bridge --version
# Should output: 1.0.0
```

### Step 2: Install HTTP Server (for test page)

**Option A: Use npx (No Installation Required)**
```bash
# No installation needed - npx downloads temporarily
```

**Option B: Install Globally (Faster for repeated use)**
```bash
npm install -g http-server
```

**Option C: Use Python (if you have Python installed)**
```bash
python --version
# If Python 3.x is installed, you can use: python -m http.server 8080
```

---

## 🚀 Pre-Test Setup

### Terminal 1: Start Test Dev Server

**Directory:** `C:\Claude\console-bridge-v2\`

**Option A: Using npx (Recommended)**
```bash
npx http-server -p 8080
```

**Option B: Using globally installed http-server**
```bash
http-server -p 8080
```

**Option C: Using Python**
```bash
python -m http.server 8080
```

**Expected Output:**
```
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.x.x:8080
Hit CTRL-C to stop the server
```

**Verify test page works:**
- Open browser to http://localhost:8080/test-page.html
- You should see "Console Bridge - Manual Test Page" with test buttons

**Keep Terminal 1 running throughout all tests!**

---

## ✅ THE 12 MANUAL TESTS

### Terminal 2: Run Tests

**Directory:** `C:\Claude\console-bridge-v2\`

**Important:** For each test below:
1. Verify you're in `C:\Claude\console-bridge-v2\`
2. Run the command in Terminal 2
3. Verify the expected output
4. Press `Ctrl+C` to stop before next test
5. Check for any error messages

---

### PART 1: Phase 5 (`--merge-output`) Tests

#### Test 1: Puppeteer Mode + Unified Terminal (Headless)

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
console-bridge start localhost:8080 --merge-output
```

**Expected Output:**
```
✓ Successfully attached to process [PID] (node) on port 8080
[HH:MM:SS] [localhost:8080] log: [Test Page] Page loaded - Console Bridge should be capturing this message
```

**Pass Criteria:**
- ✅ Shows "Successfully attached to process..." message
- ✅ Logs from test-page.html appear in terminal
- ✅ No errors
- ✅ Browser runs in background (no window visible)

**Stop:** Press `Ctrl+C`

---

#### Test 2: Puppeteer Mode + Unified Terminal (Headful)

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
console-bridge start localhost:8080 --merge-output --no-headless
```

**Expected Output:**
- Same as Test 1
- PLUS: Browser window opens and is visible

**Pass Criteria:**
- ✅ Shows "Successfully attached to process..." message
- ✅ Browser window visible
- ✅ Logs appear in terminal
- ✅ Can interact with browser manually

**Stop:** Press `Ctrl+C` (browser closes automatically)

---

#### Test 3: Extension Mode + Unified Terminal

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
console-bridge start --extension-mode --merge-output
```

**Expected Output:**
```
WebSocket server listening on ws://localhost:9223
Waiting for extension connection...
```

**Pass Criteria:**
- ✅ WebSocket server starts
- ✅ No errors
- ✅ Extension mode works with --merge-output flag (flag is ignored but doesn't cause errors)

**Stop:** Press `Ctrl+C`

---

#### Test 4: Graceful Fallback (Invalid Port)

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
console-bridge start localhost:9999 --merge-output
```

**Expected Output:**
```
ℹ️  No process found listening on port 9999. Using separate terminal.
Error: net::ERR_CONNECTION_REFUSED at http://localhost:9999
```

**Pass Criteria:**
- ✅ Shows graceful fallback message
- ✅ Does NOT crash
- ✅ Continues running (even though page doesn't exist)

**Stop:** Press `Ctrl+C`

---

#### Test 5: Unified Terminal with Concurrently

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
npx concurrently "npx http-server -p 8080" "console-bridge start localhost:8080 --merge-output"
```

**Expected Output:**
- Both dev server and console-bridge output in SAME terminal
- Interleaved output from both processes

**Pass Criteria:**
- ✅ Both processes start
- ✅ Outputs appear in same terminal window
- ✅ Dev server logs visible
- ✅ Console Bridge logs visible
- ✅ Both processes running simultaneously

**Stop:** Press `Ctrl+C` once (stops both)

---

#### Test 6: Cross-Platform Verification (Windows)

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
console-bridge start localhost:8080 --merge-output
```

**Expected Output:**
```
✓ Successfully attached to process [PID] (node) on port 8080
```

**Pass Criteria:**
- ✅ Works on Windows (uses netstat internally)
- ✅ Finds process correctly
- ✅ Attaches successfully

**Note:** This is the same as Test 1, but explicitly verifies Windows compatibility.

**Stop:** Press `Ctrl+C`

---

### PART 2: Backward Compatibility Tests

#### Test 7: Basic Puppeteer Mode (v1 Default)

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
console-bridge start localhost:8080
```

**Expected Output:**
```
[HH:MM:SS] [localhost:8080] log: [Test Page] Page loaded...
```

**Pass Criteria:**
- ✅ Logs appear (separate terminal - no "Successfully attached" message)
- ✅ Headless mode (no browser window)
- ✅ Color-coded output
- ✅ Timestamps shown

**Stop:** Press `Ctrl+C`

---

#### Test 8: Multi-Instance Monitoring

**Directory:** `C:\Claude\console-bridge-v2\`

**Setup:** Start second server on port 3000 (in Terminal 3):
```bash
npx http-server -p 3000
```

**Command (Terminal 2):**
```bash
console-bridge start localhost:8080 localhost:3000
```

**Expected Output:**
- Logs from BOTH ports appear
- Different colors for each source
- Both `[localhost:8080]` and `[localhost:3000]` labels visible

**Pass Criteria:**
- ✅ Monitors both URLs
- ✅ Different colors per source
- ✅ Both sources labeled clearly

**Stop:**
- Terminal 2: `Ctrl+C` (console-bridge)
- Terminal 3: `Ctrl+C` (second server)

---

#### Test 9: Log Filtering

**Directory:** `C:\Claude\console-bridge-v2\`

**Setup:** In browser (http://localhost:8080/test-page.html), click:
- "Test console.error()" button
- "Test console.warn()" button
- "Test console.log()" button

**Command:**
```bash
console-bridge start localhost:8080 --levels error,warn
```

**Expected Output:**
- Only error and warn logs shown
- NO log/info/debug messages

**Pass Criteria:**
- ✅ Only errors and warnings appear
- ✅ Other log levels filtered out
- ✅ Filtering works correctly

**Stop:** Press `Ctrl+C`

---

#### Test 10: File Export

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
console-bridge start localhost:8080 --output logs.txt
```

**Run for 10 seconds, then:**
```bash
# Stop with Ctrl+C

# Verify file exists
cat logs.txt
```

**Pass Criteria:**
- ✅ logs.txt file created
- ✅ Contains console logs
- ✅ Plain text format (no color codes like `\x1b[`)
- ✅ File closes cleanly on Ctrl+C

**Clean up:**
```bash
rm logs.txt
```

---

#### Test 11: Headful Mode

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
console-bridge start localhost:8080 --no-headless
```

**Expected Output:**
- Browser window opens and stays visible
- Logs appear in terminal

**Pass Criteria:**
- ✅ Browser window visible
- ✅ Can see test-page.html in browser
- ✅ Logs still appear in terminal
- ✅ Can interact with page manually

**Stop:** Press `Ctrl+C` (browser closes)

---

#### Test 12: Combined Flags Test

**Directory:** `C:\Claude\console-bridge-v2\`

**Command:**
```bash
console-bridge start localhost:8080 --no-headless --levels error,warn --output logs2.txt --location
```

**Expected Output:**
- Browser visible (`--no-headless`)
- Only errors/warnings shown (`--levels error,warn`)
- File created (`--output logs2.txt`)
- File locations shown (`--location`)

**Pass Criteria:**
- ✅ All 4 flags work together
- ✅ Browser visible
- ✅ Only errors/warnings in terminal
- ✅ logs2.txt created
- ✅ Locations like `test-page.html:251:9` shown

**Stop:** Press `Ctrl+C`

**Clean up:**
```bash
rm logs2.txt
```

---

## 📊 Test Results Template

**Copy this template to report results:**

```
PHASE 5 MANUAL TESTING RESULTS
Date: [YYYY-MM-DD]
Tester: [Your Name]
Working Directory: C:\Claude\console-bridge-v2\

PART 1: Phase 5 (--merge-output) Tests
[ ] Test 1: Puppeteer + Unified Terminal (Headless) - PASS/FAIL
[ ] Test 2: Puppeteer + Unified Terminal (Headful) - PASS/FAIL
[ ] Test 3: Extension Mode + Unified Terminal - PASS/FAIL
[ ] Test 4: Graceful Fallback - PASS/FAIL
[ ] Test 5: Concurrently - PASS/FAIL
[ ] Test 6: Cross-Platform (Windows) - PASS/FAIL

PART 2: Backward Compatibility Tests
[ ] Test 7: Basic Puppeteer Mode - PASS/FAIL
[ ] Test 8: Multi-Instance - PASS/FAIL
[ ] Test 9: Log Filtering - PASS/FAIL
[ ] Test 10: File Export - PASS/FAIL
[ ] Test 11: Headful Mode - PASS/FAIL
[ ] Test 12: Combined Flags - PASS/FAIL

BUGS FOUND:
[If any tests failed, describe the issue here]

OVERALL RESULT: ALL PASS / SOME FAILURES
```

---

## 🐛 If Tests Fail

**What to report:**
1. Which test failed (Test #)
2. What command you ran
3. What directory you were in (verify with `pwd`)
4. Copy/paste the error message
5. Describe what you expected vs what happened

**Example:**
```
Test 5 failed
Command: npx concurrently "npx http-server -p 8080" "console-bridge start localhost:8080 --merge-output"
Directory: /c/Claude/console-bridge-v2
Error: [paste error here]
Expected: Both outputs in same terminal
Actual: [describe what happened]
```

---

## 🧹 Cleanup After Testing

```bash
# Remove test log files (if any created)
rm -f logs.txt logs2.txt

# Stop any running servers (Ctrl+C in each terminal)

# Verify no hung processes
ps aux | grep console-bridge
ps aux | grep http-server
```

---

## ✅ Success Criteria

**All tests pass if:**
- All 12 tests complete without errors
- Expected output matches actual output
- No crashes or hung processes
- File export works correctly
- All CLI flags function as documented

**Next Steps After All Tests Pass:**
1. Report "all tests pass" to Claude
2. Claude updates IMPLEMENTATION_PLAN.md
3. Proceed to Phase 8 (Chrome Web Store submission)

---

**Document Version:** 1.0
**Last Updated:** October 9, 2025
**Branch:** `phase-5-subtask-5.1-user-docs-and-testing`

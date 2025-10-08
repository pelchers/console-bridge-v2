# Browser MCP - Complete Setup & Usage Guide

**Last Updated:** 2025-10-07
**Purpose:** Automate browser testing and interactions with Claude Code
**Best For:** Chrome extension testing, web automation, console log monitoring

---

## 🎯 What is Browser MCP?

**Browser MCP** is an MCP server + Chrome extension that allows Claude to control your **existing browser** (not a headless instance). This is crucial for:

- ✅ Testing Chrome extensions (they persist in your browser)
- ✅ Automating web tasks with existing login sessions
- ✅ Reading console logs and debugging
- ✅ Avoiding bot detection (uses real browser)
- ✅ Local automation (fast, private)

**Key Difference from Puppeteer/Playwright:**
- Browser MCP controls your **live browser** with extensions loaded
- Puppeteer/Playwright launch **new browser instances** without extensions

---

## 📦 Installation

### Step 1: Install MCP Server

**Option A: CLI Wizard (Recommended)**
```bash
claude mcp add --scope user browsermcp npx @browsermcp/mcp@latest
```

**Option B: Manual Configuration**

Edit `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "browsermcp": {
      "command": "npx",
      "args": ["@browsermcp/mcp@latest"]
    }
  }
}
```

### Step 2: Install Chrome Extension

1. Visit Chrome Web Store:
   https://chromewebstore.google.com/detail/browser-mcp-automate-your/bjfgambnhccakkhmkepdoekmckoijdlc

2. Click **"Add to Chrome"**

3. Grant required permissions when prompted

### Step 3: Restart Claude Code

After installation, **fully restart Claude Code** to load the MCP server.

### Step 4: Verify Installation

Ask Claude:
```
What MCP tools do you have access to?
```

You should see Browser MCP tools listed.

---

## 🔌 Connecting a Browser Tab

**IMPORTANT:** You must "Connect" a tab before Claude can control it.

1. Navigate to the page you want to automate
2. Click the **Browser MCP extension icon** in Chrome toolbar
3. Click **"Connect"** button for that tab
4. The tab is now controllable by Claude

**Note:** You need to connect each tab you want to automate.

---

## 🛠️ Available Tools

Browser MCP provides these tools for Claude:

### Navigation
- `browser_navigate` - Navigate to a URL
- `browser_go_back` - Go back in history
- `browser_go_forward` - Go forward in history

### Interaction
- `browser_click` - Click an element (by selector, text, or coordinates)
- `browser_type` - Type text into an input field
- `browser_press_key` - Press keyboard keys (Enter, Escape, etc.)
- `browser_hover` - Hover over an element
- `browser_drag_drop` - Drag and drop elements

### Scrolling
- `browser_scroll` - Scroll the page (up, down, to coordinates)

### Data Extraction
- `browser_get_state` - Get current page state (HTML, URL, title)
- `browser_get_console_logs` - **Get console output** (critical for testing!)
- `browser_screenshot` - Take screenshot
- `browser_snapshot` - Capture page snapshot

### Tab Management
- `browser_list_tabs` - List all connected tabs
- `browser_switch_tab` - Switch to different tab
- `browser_close_tab` - Close a tab

### Waiting
- `browser_wait` - Wait for specified time (ms)

---

## 💡 Usage Examples

### Example 1: Navigate and Click

```
Use browser MCP to:
1. Navigate to http://localhost:3000
2. Click the button with text "Submit"
3. Wait 2 seconds
4. Take a screenshot
```

### Example 2: Test Chrome Extension

```
Use browser MCP to:
1. Navigate to http://localhost:8080/test-page.html
2. Click all buttons with class "test-button"
3. Get console logs after each click
4. Verify no errors appear
```

### Example 3: Fill Form

```
Use browser MCP to:
1. Navigate to https://example.com/form
2. Type "John Doe" in the input with id "name"
3. Type "john@example.com" in the input with id "email"
4. Click the submit button
5. Get the page state to verify submission
```

### Example 4: Monitor Console Logs

```
Use browser MCP to:
1. Get console logs from the current page
2. Filter for error messages
3. Report any errors found
```

---

## 🧪 Chrome Extension Testing (Our Use Case)

### Scenario: Testing Console Bridge Extension

**Setup:**
1. Load extension in Chrome (`chrome://extensions` → "Load unpacked")
2. Navigate to test page (`http://localhost:8080/test-page-advanced.html`)
3. Open DevTools (F12) and go to "Console Bridge" panel
4. Connect the tab with Browser MCP extension

**Automated Test:**
```
Use browser MCP to test all 48 buttons on the test page:

1. Navigate to http://localhost:8080/test-page-advanced.html
2. For each button with class "test-button":
   a. Click the button
   b. Wait 500ms
   c. Get console logs
   d. Verify expected output appears
   e. Check for errors
3. Generate summary report with:
   - Total tests run
   - Passed/failed count
   - Any error messages
   - Screenshots of failures
```

**Benefits:**
- ✅ No manual clicking
- ✅ Consistent test execution
- ✅ Detailed error reporting
- ✅ Automated verification
- ✅ Saves ~30 minutes per test run

---

## 🔍 How to Get Console Logs

**Critical for testing:** Browser MCP can read console logs!

```
Use browser MCP to get console logs
```

**Expected output:**
```json
{
  "logs": [
    {
      "type": "log",
      "text": "Console Bridge initialized",
      "timestamp": "2025-10-07T12:34:56.789Z"
    },
    {
      "type": "error",
      "text": "ReferenceError: foo is not defined",
      "timestamp": "2025-10-07T12:35:01.234Z"
    }
  ]
}
```

**Verification patterns:**
- Check for `[Circular: root.self]` (circular references)
- Check for `[Object - max depth exceeded]` (depth limits)
- Check for `... [N more characters]` (string truncation)
- Check for error messages or stack traces

---

## 🎯 Best Practices

### 1. Always Connect Tabs First
❌ **Don't:** Start automation without connecting
✅ **Do:** Connect tab → Verify connection → Start automation

### 2. Use Specific Selectors
❌ **Don't:** "Click the button"
✅ **Do:** "Click the button with text 'Test Circular References'"

### 3. Add Wait Times
❌ **Don't:** Click rapidly without waiting
✅ **Do:** "Wait 500ms after each click to allow processing"

### 4. Verify After Actions
❌ **Don't:** Just click buttons
✅ **Do:** "Click button → Get logs → Verify expected output"

### 5. Batch Similar Operations
❌ **Don't:** Test buttons one at a time manually
✅ **Do:** "Test all buttons in the 'Circular References' section"

---

## 🐛 Troubleshooting

### "Tab not connected"

**Problem:** You forgot to connect the tab in Browser MCP extension

**Solution:**
1. Click Browser MCP extension icon
2. Click "Connect" for the tab you want to automate

### "Element not found"

**Problem:** Selector doesn't match any element

**Solution:**
- Use more specific selectors (ID, class, data attributes)
- Check element exists before clicking
- Use "Get page state" to inspect HTML

### "Cannot read console logs"

**Problem:** Console is cleared or empty

**Solution:**
- Ensure DevTools is open (console logs are buffered)
- Check timing - get logs immediately after action
- Verify extension is capturing logs correctly

### "MCP server not responding"

**Problem:** Browser MCP server crashed or disconnected

**Solution:**
1. Restart Claude Code
2. Reconnect tabs in Browser MCP extension
3. Check `~/.claude/logs/mcp.log` for errors

---

## 📊 Comparison with Alternatives

| Feature | Browser MCP | Puppeteer | Playwright | Chrome DevTools MCP |
|---------|-------------|-----------|------------|---------------------|
| Uses existing browser | ✅ | ❌ | ❌ | ❌ |
| Extensions persist | ✅ | ❌ | ⚠️ | ❌ |
| Read console logs | ✅ | ✅ | ✅ | ✅ |
| Access DevTools panels | ✅ (via extension) | ❌ | ❌ | ❌ |
| Login sessions preserved | ✅ | ❌ | ❌ | ❌ |
| Avoids bot detection | ✅ | ❌ | ⚠️ | ❌ |
| Setup complexity | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Claude integration | Native | Script | Script | Native |

**Verdict:** Browser MCP is **best for Chrome extension testing**.

---

## 🔐 Privacy & Security

### What Browser MCP Has Access To:
- ✅ Connected tabs only
- ✅ Page HTML, console logs, screenshots
- ✅ Browser actions (click, type, navigate)

### What Browser MCP Does NOT Access:
- ❌ Other tabs (unless explicitly connected)
- ❌ Passwords or sensitive form data (unless you automate filling it)
- ❌ Browser history or bookmarks
- ❌ Files on your computer (beyond what Claude Code already has)

### Privacy Notes:
- **Local execution:** Browser MCP runs locally, not on external servers
- **You control what's shared:** Only connected tabs are accessible
- **Disconnect anytime:** Click extension icon → Disconnect

---

## 📖 Advanced Usage

### Parallel Testing

Test multiple sections simultaneously:
```
Use browser MCP to test these sections in parallel:
1. Circular reference tests (6 tests)
2. Depth limiting tests (5 tests)
3. Size limiting tests (9 tests)

For each section, generate a summary report.
```

### Conditional Logic

```
Use browser MCP to:
1. Click "Test Large String"
2. Get console logs
3. If truncation indicator appears: ✅ Pass
4. If no truncation: ❌ Fail with error
```

### Screenshot Comparison

```
Use browser MCP to:
1. Take screenshot before clicking button
2. Click button
3. Take screenshot after
4. Compare and report differences
```

---

## 🎓 Learning Resources

- **Browser MCP Docs:** https://docs.browsermcp.io/
- **GitHub:** https://github.com/BrowserMCP/mcp
- **MCP Protocol Spec:** https://modelcontextprotocol.io/
- **Chrome Web Store:** https://chromewebstore.google.com/detail/browser-mcp

---

## ✅ Quick Checklist

Before asking Claude to use Browser MCP:

- [ ] MCP server installed (`claude mcp add ...`)
- [ ] Chrome extension installed
- [ ] Claude Code restarted
- [ ] Test page loaded in Chrome
- [ ] Tab connected in Browser MCP extension
- [ ] DevTools open (for console logs)
- [ ] Extension loaded and active (if testing extension)

---

## 📝 Real-World Example: Console Bridge Testing

**Goal:** Test all 48 advanced serialization scenarios automatically

**Command to Claude:**
```
Use Browser MCP to thoroughly test the Console Bridge extension:

1. Navigate to http://localhost:8080/test-page-advanced.html
2. Verify the page loads (check for "Console Bridge Advanced Test Page" heading)
3. Test each section systematically:

   SECTION 1: Circular References (6 tests)
   - Click "Simple Circular" → Get logs → Verify [Circular: root.self]
   - Click "Mutual Circular" → Get logs → Verify [Circular: ...]
   - Click "Array Circular" → Get logs → Verify [Circular: ...]
   - Click "Nested Circular" → Get logs → Verify [Circular: ...]
   - Click "Circular Map" → Get logs → Verify [Circular: ...]
   - Click "Circular Set" → Get logs → Verify [Circular: ...]

   SECTION 2: Depth Limiting (5 tests)
   - Click "Depth 5" → Get logs → Verify normal serialization
   - Click "Depth 10" → Get logs → Verify at limit (should work)
   - Click "Depth 11" → Get logs → Verify [max depth exceeded]
   - Click "Depth 15" → Get logs → Verify [max depth exceeded]
   - Click "Mixed Depth" → Get logs → Verify [max depth exceeded]

   [... continue for all sections ...]

4. Generate comprehensive report:
   - Total tests: 48
   - Passed: X
   - Failed: Y
   - Errors: [list any errors]
   - Performance: [any slowdowns or crashes]
   - Recommendations: [any issues found]

5. Take screenshots of any failures
```

**Expected time savings:** ~30 minutes per test run

**Result:** Automated, repeatable, comprehensive test suite

---

**Created:** 2025-10-07
**Research by:** Claude Code (Sonnet 4.5)
**Use Case:** Chrome Extension Testing Automation
**Status:** Production Ready ✅

# Console Bridge v2.0.0 - Requirements

**Version:** 2.0.0 "Browser Extension Support"
**Last Updated:** October 6, 2025
**Status:** Development

---

## ✅ v2.0.0 Solves v1.0.0 Limitations

**v1.0.0 Limitation (SOLVED):** Puppeteer Chromium Only

**v2.0.0 Solution:** Browser Extension Mode
- ✅ Monitor YOUR Chrome/Firefox/Safari browser
- ✅ Works with browser extensions (React DevTools, Vue DevTools)
- ✅ Cross-browser testing support
- ✅ 100% backward compatible with Puppeteer mode

**See [v2.0.0-spec/clarifications.md](v2.0.0-spec/clarifications.md) for complete documentation.**

---

# v1.0.0 Requirements (For Reference)


# Console Bridge v1.0.0 - Requirements and Limitations

**Version:** 1.0.0 "Unified Terminal"
**Last Updated:** October 6, 2025
**Status:** Production Release

---

## Table of Contents
- [System Requirements](#system-requirements)
- [Browser Requirements](#browser-requirements)
- [Critical Limitations](#critical-limitations)
- [Supported Use Cases](#supported-use-cases)
- [Unsupported Use Cases](#unsupported-use-cases)
- [Future Enhancements](#future-enhancements)

---

## System Requirements

### Runtime Environment

**Node.js:**
- Minimum: Node.js 14.x
- Recommended: Node.js 18.x or higher
- LTS versions supported

**Operating Systems:**
- ✅ Windows 10/11 (verified)
- ✅ macOS 11+ (documented, community-tested)
- ✅ Linux (Ubuntu 20.04+, Fedora 35+) (documented, community-tested)

**Dependencies:**
- Puppeteer v21.x (automatically installed)
- Chrome/Chromium (downloaded by Puppeteer)
- concurrently v8.x (optional, for unified terminal workflows)

---

## Browser Requirements

### ⚠️ CRITICAL: Puppeteer Chromium Only

Console Bridge v1.0.0 **ONLY** monitors the Puppeteer-controlled Chromium browser instance.

**What This Means:**
- Console Bridge launches its own Chromium browser via Puppeteer
- Logs are captured ONLY from that Puppeteer browser
- **Cannot monitor your personal Chrome, Firefox, Safari, or Edge browsers**

### Supported Browser Modes

**Headless Mode (default):**
- Chromium runs invisibly in the background
- No GUI window visible
- Lightweight and efficient
- Use with: `console-bridge start localhost:3000`

**Headful Mode (`--no-headless`):**
- Chromium window visible on screen
- Can interact with the browser manually
- Useful for debugging and visual verification
- Use with: `console-bridge start localhost:3000 --no-headless`

---

## Critical Limitations

### ❌ Limitation 1: Cannot Monitor Personal Browsers

**What Doesn't Work:**

```bash
# Terminal: Start Console Bridge in headless mode
console-bridge start localhost:3000

# Browser: User opens their own Chrome and goes to localhost:3000
# Browser: User clicks buttons and interacts with their app

# Result: ❌ Console logs do NOT appear in terminal
# Reason: Console Bridge only monitors Puppeteer browser, not personal Chrome
```

**Why:**
- Puppeteer's API (`page.on('console')`) only works on Puppeteer-controlled pages
- Cannot attach to arbitrary browser instances from outside
- Browser security prevents external process from monitoring console
- No universal API to "hook into" Chrome/Firefox/Safari

**Impact:**
- Must use Puppeteer headful mode to interact with the browser
- Cannot use your Chrome with React DevTools, Vue DevTools, etc.
- Cannot test in Firefox, Safari, or other browsers
- Cannot use headless mode + personal browser simultaneously

---

### ❌ Limitation 2: User Interaction Viewing

**What This Means:**

Watching user actions on the page and seeing console output in the terminal **ONLY works when**:
- Using Puppeteer headful mode (`--no-headless`)
- Interacting with the **Puppeteer Chromium window** (not your personal browser)
- The Puppeteer browser is the one displaying your application

**What Doesn't Work:**
```
Scenario:
1. Developer starts Console Bridge in headless mode (background)
2. Developer uses their own Chrome to test localhost:3000
3. Developer wants AI to see console logs in terminal

Result: ❌ AI cannot see logs from developer's Chrome browser
Reason: Console Bridge is monitoring invisible Puppeteer browser, not Chrome
```

**Workaround:**
- Use headful mode: `console-bridge start localhost:3000 --no-headless`
- Interact with the **Puppeteer Chromium window** that opens
- Console logs from that Puppeteer window will appear in terminal

---

### ⚠️ Limitation 3: Chromium-Only Browser Support

**Supported:**
- ✅ Puppeteer Chromium (headless or headful)

**NOT Supported:**
- ❌ Personal Google Chrome browser
- ❌ Firefox
- ❌ Safari
- ❌ Edge
- ❌ Brave
- ❌ Opera
- ❌ Any browser not launched by Puppeteer

**Why:**
- Puppeteer only supports Chromium
- Each browser has different DevTools protocol
- No universal monitoring standard exists

---

### ⚠️ Limitation 4: Extension Support

**Puppeteer Chromium Limitations:**
- Limited extension support compared to regular Chrome
- Cannot use most Chrome Web Store extensions
- React DevTools, Vue DevTools may not work properly in Puppeteer browser

**Workaround:**
- None available in v1.0.0
- Planned for v2.0.0 (see Future Enhancements)

---

## Supported Use Cases

### ✅ Use Case 1: CI/CD and Automated Testing

**Perfect For:**
```bash
# GitHub Actions, GitLab CI, Jenkins, etc.
- name: Run tests with console monitoring
  run: |
    npm run dev &
    console-bridge start localhost:3000 -o test-logs.txt &
    npm test
```

**Why It Works:**
- Headless Puppeteer is designed for CI/CD
- No human interaction needed
- Automated tests control the Puppeteer browser
- Logs captured and saved to file

---

### ✅ Use Case 2: AI-Driven Development

**Perfect For:**
```bash
# AI agent develops application with Puppeteer
# AI sees console logs in terminal
# AI debugs based on console output
```

**Why It Works:**
- AI controls Puppeteer browser programmatically
- AI doesn't need personal browser with extensions
- Headless mode is sufficient for AI workflows

---

### ✅ Use Case 3: Debugging with Headful Mode

**Perfect For:**
```bash
# Developer wants to see browser + console logs
console-bridge start localhost:3000 --no-headless --merge-output

# Puppeteer browser window opens
# Developer interacts with Puppeteer browser
# Console logs appear in terminal
```

**Why It Works:**
- Headful mode shows the browser window
- Developer can click and interact
- Console logs stream to terminal
- All within Puppeteer ecosystem

---

### ✅ Use Case 4: Unified Terminal Output

**Perfect For:**
```bash
# Single terminal with dev server + browser logs
npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:3000 --merge-output"
```

**Why It Works:**
- Puppeteer browser monitors localhost:3000
- Dev server logs and browser logs merge in one terminal
- Clean workflow for Puppeteer-based development

---

## Unsupported Use Cases

### ❌ Use Case 1: Testing in Personal Chrome

**Scenario:**
```
Developer wants to:
1. Start Console Bridge in headless mode (background)
2. Use their own Chrome browser with installed extensions
3. Test localhost:3000 in their Chrome
4. See console logs in terminal

Status: ❌ NOT SUPPORTED in v1.0.0
Reason: Console Bridge only monitors Puppeteer browser
Workaround: Use headful mode and interact with Puppeteer browser
Planned: v2.0.0 with browser extension support
```

---

### ❌ Use Case 2: Cross-Browser Testing

**Scenario:**
```
Developer wants to:
1. Test localhost:3000 in Firefox for cross-browser compatibility
2. See Firefox console logs in terminal

Status: ❌ NOT SUPPORTED in v1.0.0
Reason: Puppeteer only supports Chromium, not Firefox
Workaround: Use Firefox DevTools directly
Planned: v2.0.0 with Firefox extension support
```

---

### ❌ Use Case 3: Using React DevTools in Monitored Browser

**Scenario:**
```
Developer wants to:
1. Use React DevTools to inspect component state
2. See console logs from same browser in terminal

Status: ❌ PARTIALLY SUPPORTED
Reason: Puppeteer Chromium has limited extension support
Workaround: Use personal Chrome with React DevTools, but console logs won't appear in terminal
Planned: v2.0.0 with extension support for personal Chrome
```

---

### ❌ Use Case 4: Headless Mode + Personal Browser

**Scenario:**
```
Developer wants to:
1. Run Console Bridge in headless mode (resource efficient)
2. Use their own Chrome browser for testing
3. See console logs from their Chrome in terminal

Status: ❌ NOT SUPPORTED in v1.0.0
Reason: Headless Puppeteer browser and personal Chrome are separate instances
Workaround: Choose between:
  - Headless Puppeteer (efficient, no personal browser)
  - Headful Puppeteer (can interact, but not personal browser)
Planned: v2.0.0 with browser extension allows this workflow
```

---

## Technical Explanation

### Why Can't Console Bridge Monitor Personal Browsers?

**1. Puppeteer API Design:**
```javascript
// Console Bridge code (simplified)
const page = await browser.newPage();
await page.goto('http://localhost:3000');

// This event listener is tied to THIS specific page object
page.on('console', (msg) => {
  // Capture console logs from THIS page only
});
```

The `page.on('console')` listener is **tightly coupled** to the Puppeteer `page` object. It cannot monitor arbitrary browser instances.

**2. Browser Security:**
- Browsers prevent external processes from monitoring console for security
- No API to "attach" to an already-running Chrome instance
- Remote debugging requires special launch flags (`--remote-debugging-port`)

**3. Chrome DevTools Protocol (CDP) Limitations:**
- CDP requires browser launched with specific flags
- Cannot retroactively attach to running browser
- Even with CDP, browser-specific (Chrome/Chromium only)

---

## Future Enhancements

### v2.0.0: Browser Extension Support (Planned Q1 2026)

**Goal:** Allow Console Bridge to monitor ANY browser (Chrome, Firefox, Safari)

**How:**
- Browser extension captures console events
- Extension sends logs to Console Bridge via WebSocket
- Works with developer's actual browser (with extensions installed)
- Natural developer workflow

**Benefits:**
- ✅ Use your personal Chrome with React DevTools
- ✅ Test in Firefox, Safari, Edge
- ✅ Headless mode + personal browser works
- ✅ AI can monitor console from human developer's browser

**Status:** Planning phase (see `.claude/versions/2.0.0/` for details)

---

## Migration Path to v2.0.0

When v2.0.0 is released, you will have two options:

**Option 1: Extension Mode (New)**
```bash
# Install Console Bridge extension in Chrome/Firefox
# Start CLI in extension mode
console-bridge start --extension-mode

# Use your actual browser to test localhost:3000
# Console logs appear in terminal
```

**Option 2: Puppeteer Mode (Existing)**
```bash
# Same as v1.0.0
console-bridge start localhost:3000 --no-headless
```

**Backward Compatibility:**
- v1.0.0 Puppeteer mode will remain fully supported
- No breaking changes to existing workflows
- Users can choose which mode fits their needs

---

## Recommendations

### When to Use Console Bridge v1.0.0

**✅ Recommended For:**
- CI/CD pipelines and automated testing
- AI-driven development workflows
- Debugging with Puppeteer headful mode
- Situations where browser extensions are not needed

**⚠️ Not Recommended For:**
- Testing with personal Chrome/Firefox/Safari browsers
- Workflows requiring browser extensions (React DevTools, etc.)
- Cross-browser compatibility testing
- Headless mode + personal browser scenarios

### Alternative Solutions (Until v2.0.0)

**If you need to test in your personal browser:**
1. Use browser DevTools console directly
2. Use browser extension console exporters
3. Wait for Console Bridge v2.0.0 (Q1 2026)

**If you need cross-browser testing:**
1. Use Playwright (supports Firefox, WebKit, Chromium)
2. Use browser-specific DevTools
3. Wait for Console Bridge v2.0.0

---

## Summary

**Console Bridge v1.0.0 is:**
- ✅ Excellent for CI/CD and automated testing
- ✅ Perfect for AI-assisted development
- ✅ Great for Puppeteer-based workflows
- ✅ Production-ready and stable

**Console Bridge v1.0.0 is NOT:**
- ❌ A universal browser console monitor
- ❌ Compatible with personal Chrome/Firefox/Safari
- ❌ Suitable for workflows requiring browser extensions

**For universal browser support, wait for v2.0.0 (Q1 2026) with browser extension support.**

---

## Related Documentation

- [Getting Started Guide](./guides/getting-started.md)
- [Daily Development Guide](./guides/daily-development.md)
- [Headless Implications Explainer](./explainer/headless-implications.md)
- [Advanced Usage](./guides/advanced-usage.md)
- [v2.0.0 Planning](../.claude/versions/2.0.0/goals-and-understanding.md)

---

**Questions or Feedback:** Open an issue on GitHub

**Last Reviewed:** October 6, 2025
**Next Review:** v2.0.0 release

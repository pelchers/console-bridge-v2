# Console Bridge System Architecture

Complete architectural overview explaining how Console Bridge works, browser modes, terminal output options, and application structure.

**Version:** 2.0.0-beta (Dual-Mode Support)

## Table of Contents

### v2.0.0 Architecture
- [Dual-Mode Overview (v2.0.0)](#dual-mode-overview-v200)
- [Mode 1: Puppeteer Mode (v1 Architecture)](#mode-1-puppeteer-mode-v1-architecture)
- [Mode 2: Extension Mode (v2 NEW)](#mode-2-extension-mode-v2-new)
- [When to Use Which Mode](#when-to-use-which-mode)

### v1.0.0 Architecture (Puppeteer Mode)
- [Chromium vs Chrome (Headless Mode)](#chromium-vs-chrome-headless-mode)
- [Terminal Output - Combined vs Separate](#terminal-output---combined-vs-separate)
- [Which Mode Has Visual Output?](#which-mode-has-visual-output)
- [What ARE Those Visuals?](#what-are-those-visuals)
- [Visual Architecture Breakdown](#visual-architecture-breakdown)
- [Why Headful Mode Exists](#why-headful-mode-exists)
- [Current and Future Output Options](#current-and-future-output-options)
- [Application Structure](#application-structure)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)

---

## Dual-Mode Overview (v2.0.0)

Console Bridge v2.0.0 supports **two independent modes** for console log capture:

### Mode 1: Puppeteer Mode (v1.0.0 - Unchanged)
```bash
console-bridge start localhost:3000
```
- Launches Puppeteer-controlled Chromium browser
- Perfect for CI/CD, automated testing, headless workflows
- Cannot use personal browser or browser extensions

### Mode 2: Extension Mode (v2.0.0 - NEW)
```bash
console-bridge start --extension-mode
```
- Monitors YOUR Chrome browser via Chrome extension
- Works with browser extensions (React DevTools, Vue DevTools, etc.)
- Perfect for interactive development

**Both modes use the same CLI, same output formatting, same flags (where applicable).**

---

## Mode 1: Puppeteer Mode (v1 Architecture)

See sections below for complete Puppeteer mode architecture. Key points:
- Puppeteer launches and controls Chromium
- Console events captured via CDP (Chrome DevTools Protocol)
- Headless (invisible) or headful (visible browser window)
- Multi-URL support (monitor multiple apps simultaneously)

**Use Cases:**
- ✅ CI/CD pipelines
- ✅ Automated testing
- ✅ Headless browser automation
- ❌ NOT for: Using YOUR Chrome with React DevTools

---

## Mode 2: Extension Mode (v2 NEW)

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│           YOUR Chrome Browser (localhost:3000)           │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Application (React, Next.js, etc.)             │   │
│  │  console.log("Button clicked")                  │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│                     ▼                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Chrome Extension (Console Bridge)              │   │
│  │  - DevTools Panel UI                            │   │
│  │  - Console event capture (chrome.devtools API)  │   │
│  │  - Advanced serialization (Maps, Sets, DOM)     │   │
│  │  - Message queuing (1000 messages)              │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
└─────────────────────┼────────────────────────────────────┘
                      │
                      │ WebSocket (ws://localhost:9223)
                      │ JSON Message Protocol v1.0.0
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│              Console Bridge CLI                          │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  WebSocketServer (localhost:9223)               │   │
│  │  - Accepts extension connections                │   │
│  │  - Ping/pong keep-alive (30s interval)          │   │
│  │  - Auto-reconnect detection                     │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│                     ▼                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  LogFormatter (reused from v1)                  │   │
│  │  - Color-coded output                           │   │
│  │  - Timestamps, source labels                    │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│                     ▼                                    │
│              Terminal Output                             │
│              [12:34:56] [localhost:3000] log: ...        │
└──────────────────────────────────────────────────────────┘
```

### Components

#### 1. Chrome Extension (Frontend)

**Location:** `chrome-extension-poc/`

**Key Files:**
- `manifest.json` - Manifest V3 configuration
- `background.js` - WebSocket client service worker
- `devtools/panel.html` - DevTools panel UI
- `devtools/panel.js` - Console capture logic
- `serializer.js` - Advanced object serialization

**Responsibilities:**
- Capture console events via `chrome.devtools.inspectedWindow`
- Serialize complex objects (Maps, Sets, Promises, DOM elements, circular refs)
- Send messages to CLI via WebSocket
- Queue messages during disconnection (up to 1000)
- Auto-reconnect with exponential backoff
- Display connection status in DevTools panel

#### 2. WebSocket Protocol v1.0.0

**Port:** 9223 (localhost only - security)

**Message Types:**
1. `console_event` - Console log from browser → CLI
2. `connection_status` - Connection state changes
3. `ping` - CLI → Extension (keep-alive)
4. `pong` - Extension → CLI (response)
5. `welcome` - CLI → Extension (on connection)

**Message Envelope:**
```json
{
  "type": "console_event | connection_status | ping | pong | welcome",
  "timestamp": 1696345678901,
  "data": { ... }
}
```

**Security:**
- Localhost-only (127.0.0.1)
- No external network access
- JSON-only (no code execution)

#### 3. CLI WebSocketServer (Backend)

**Location:** `src/core/WebSocketServer.js`

**Responsibilities:**
- Listen on ws://localhost:9223
- Accept extension connections
- Send welcome message on connection
- Send ping every 30 seconds
- Receive console_event messages
- Format logs via LogFormatter (reused from v1)
- Output to terminal (same as v1)

### Data Flow (Extension Mode)

```
1. User opens Chrome DevTools on localhost:3000
2. Console Bridge extension panel activates
3. Extension connects to ws://localhost:9223 (CLI)
4. CLI sends "welcome" message
5. User's app calls console.log("Hello")
6. Extension captures via chrome.devtools.inspectedWindow
7. Extension serializes arguments (Maps, Sets, DOM, etc.)
8. Extension sends console_event via WebSocket
9. CLI receives message
10. CLI formats with LogFormatter (same as v1)
11. CLI outputs to terminal: [12:34:56] [localhost:3000] log: Hello
```

### Advanced Features

**Message Queuing:**
- Extension queues up to 1000 messages during disconnection
- FIFO (first in, first out)
- Auto-flush on reconnection

**Ping/Pong Keep-Alive:**
- CLI sends ping every 30 seconds
- Extension must respond with pong within 5 seconds
- Timeout triggers reconnection

**Auto-Reconnect (Exponential Backoff):**
- 1st attempt: 1 second
- 2nd attempt: 2 seconds
- 3rd attempt: 4 seconds
- 4th attempt: 8 seconds
- 5th attempt: 16 seconds
- Max 5 attempts, then give up

**Advanced Serialization:**
- Maps → `{ __type__: 'Map', entries: [[key, value], ...] }`
- Sets → `{ __type__: 'Set', values: [...] }`
- Promises → `{ __type__: 'Promise', state: 'pending' }`
- Symbols → `{ __type__: 'Symbol', description: '...' }`
- BigInt → `{ __type__: 'BigInt', value: '123...' }`
- Circular refs → `{ __circular__: true }`
- DOM elements → `{ __type__: 'Element', tagName: 'div', id: 'app', className: '...' }`

### Browser Support (Extension Mode)

| Browser | Supported | Notes |
|---------|-----------|-------|
| Chrome/Chromium | ✅ Yes | Primary target |
| Microsoft Edge | ✅ Yes | Chromium-based |
| Brave | ✅ Yes | Chromium-based |
| Opera | ✅ Yes | Chromium-based |
| Vivaldi | ✅ Yes | Chromium-based |
| Firefox | ⏳ Planned | Phase 4 (Q1 2026) |
| Safari | ⏳ Planned | Phase 4 (Q1 2026) |

---

## When to Use Which Mode

### Use Puppeteer Mode When:
- ✅ Running automated tests in CI/CD
- ✅ Need headless browser (no GUI)
- ✅ Monitoring multiple URLs simultaneously
- ✅ Don't need browser extensions (React DevTools, etc.)

### Use Extension Mode When:
- ✅ Interactive development with YOUR browser
- ✅ Using browser extensions (React DevTools, Vue DevTools, Redux DevTools)
- ✅ Testing in YOUR Chrome with your setup
- ✅ Cross-browser testing (Chromium-based browsers)

### Use Both Modes (Dual-Mode Workflow)
```bash
# Terminal 1: Automated testing (Puppeteer mode)
console-bridge start localhost:3000 --levels error

# Terminal 2: Interactive development (Extension mode)
console-bridge start --extension-mode
```

---

## Port and URL Configuration

### Extension Mode: No URL Required

**Key Point:** Extension Mode does NOT require specifying a URL or port.

```bash
# Start extension mode (no URL needed)
console-bridge start --extension-mode

# Extension captures from whatever page you browse to:
# localhost:3000 → Shows [localhost:3000] in terminal
# localhost:8080 → Shows [localhost:8080] in terminal
# localhost:3847 → Shows [localhost:3847] in terminal
```

**How it works:**
1. WebSocket server starts on port 9090 (configurable with `--port`)
2. You browse to ANY localhost URL in Chrome
3. Open DevTools → "Console Bridge" tab → "Connect"
4. Logs from that page stream to terminal
5. URL label appears dynamically based on the page

**No URL configuration needed - extension captures from whichever page has DevTools open and connected.**

### Puppeteer Mode: URL Required

**Key Point:** Puppeteer Mode REQUIRES specifying the URL and port.

```bash
# URL/port REQUIRED
console-bridge start localhost:3000

# Multiple URLs supported
console-bridge start localhost:3000 localhost:8080 localhost:5173
```

**Supported formats:**
- `localhost:PORT` (recommended)
- `http://localhost:PORT`
- `127.0.0.1:PORT`
- `https://localhost:PORT`

**Security:** Only localhost/127.0.0.1 URLs allowed (no remote sites).

### localhost vs 127.0.0.1

Both work identically:
```bash
console-bridge start localhost:3000
console-bridge start 127.0.0.1:3000  # Equivalent
```

**See:** [Port and URL Configuration Guide](../guides/port-and-url-configuration.md) for complete details.

---

# v1.0.0 Puppeteer Mode Architecture

The sections below detail the Puppeteer mode architecture (v1.0.0), which is 100% preserved in v2.0.0.

---

---

## Chromium vs Chrome (Headless Mode)

**Both** headless and headful modes use **Chromium**, not traditional Chrome.

- **Chromium** = Open-source browser project (what Puppeteer uses)
- **Chrome** = Google's branded version with extra features

The difference between modes:
- **Headless**: Chromium runs **without** a GUI (invisible, no window)
- **Headful** (`--no-headless`): Chromium runs **with** a GUI (window visible)

Both use the same Chromium engine, just with/without visual rendering.

---

## Terminal Output - Combined vs Separate

### Current Behavior:
```bash
# Terminal 1 - Dev server
npm run dev
# Output: ✓ Ready on localhost:3847
# Output: ○ Compiling /...

# Terminal 2 - Console Bridge (SEPARATE)
console-bridge start localhost:3847
# Output: [03:14:22] [localhost:3847] log: Button clicked
```

### Desired Future Option: **Unified Terminal**

Unified terminal would allow Console Bridge logs to stream to the **SAME terminal** as your dev server:
```bash
# Single Terminal - Both together
npm run dev
# ✓ Ready on localhost:3847
# ○ Compiling /...
# [03:14:22] [localhost:3847] log: Button clicked  ← Console Bridge
# ○ Compiling /page...
# [03:14:25] [localhost:3847] error: Failed!        ← Console Bridge
```

**This is NOT currently a built-in option**, but can be achieved with:
- `concurrently` npm package
- Custom shell scripting
- OR: Would need a new CLI flag like `--attach-to-pid` or `--merge-output`

This would be useful for both headless AND headful modes!

---

## Which Mode Has Visual Output?

| Mode | Visual Output? | What You See |
|------|---------------|--------------|
| **Headless** (default) | ❌ **NO** | Nothing. Browser is invisible. |
| **Headful** (`--no-headless`) | ✅ **YES** | A Chromium browser window appears on your screen. |

In **both modes**, logs still stream to terminal. The only difference is whether you see a browser window.

---

## What ARE Those Visuals?

### When you run `console-bridge start localhost:3847 --no-headless`:

**The browser window shows:**
- ✅ Your **ACTUAL application** (e.g., Next.js site on localhost:3847)
- ❌ NOT a separate Console Bridge UI
- ❌ NOT a dedicated frontend for manual triggers
- ❌ NOT a different app

**It's literally:** A Chromium browser window navigated to `http://localhost:3847`, showing your application.

### Critical Understanding

The headful mode browser window is:
- ✅ Your application rendered in Chromium
- ✅ The exact same HTML/CSS/JS as your dev server serves
- ✅ The specific browser instance being monitored

The window is NOT:
- ❌ A Console Bridge GUI/dashboard
- ❌ A separate trigger interface
- ❌ A different app

---

## Visual Architecture Breakdown

```
┌─────────────────────────────────────────────────┐
│  YOUR DEV SERVER (e.g., Next.js on :3847)      │
│  - Serves your application                     │
│  - Same app regardless of who views it         │
└─────────────────────────────────────────────────┘
                       ▲
                       │ HTTP requests
        ┌──────────────┼──────────────┐
        │              │              │
        │              │              │
┌───────▼──────┐  ┌───▼──────┐  ┌───▼──────────────┐
│ Personal     │  │ Puppeteer │  │ Puppeteer        │
│ Chrome       │  │ HEADLESS  │  │ HEADFUL          │
│              │  │           │  │                  │
│ Shows app    │  │ ❌ NO GUI  │  │ ✅ GUI VISIBLE   │
│ ❌ NOT       │  │ Shows app │  │ Shows app        │
│  monitored   │  │ invisibly │  │ in window        │
│              │  │ ✅ Monitored│ │ ✅ Monitored     │
└──────────────┘  └───────────┘  └──────────────────┘
                       │              │
                       │              │
                       ▼              ▼
                  ┌─────────────────────┐
                  │ Console Bridge      │
                  │ Captures logs       │
                  └─────────────────────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │ YOUR TERMINAL       │
                  │ [03:14] log: ...    │
                  └─────────────────────┘
```

---

## Why Headful Mode Exists

**Use cases:**
1. **Debugging Console Bridge** - See what Puppeteer sees
2. **Manual Testing** - Click buttons in the monitored browser
3. **Visual Verification** - Confirm Puppeteer loaded the right page
4. **Layout Debugging** - See if CSS/layout issues affect capture

**NOT for:**
- Normal development (use headless)
- Production (use headless)
- CI/CD (use headless)

---

## Current and Future Output Options

### Option 1: Headless + Separate Terminal (Current Default)
```bash
console-bridge start localhost:3847
# Invisible browser, logs to Console Bridge terminal
```

**Characteristics:**
- ✅ Lightweight (no GUI rendering)
- ✅ Non-intrusive
- ❌ Requires switching between terminals

---

### Option 2: Headful + Separate Terminal (Current `--no-headless`)
```bash
console-bridge start localhost:3847 --no-headless
# Visible browser window, logs to Console Bridge terminal
```

**Characteristics:**
- ✅ Visual debugging
- ✅ Manual interaction possible
- ❌ Requires switching between terminals
- ❌ More resource intensive

---

### Option 3: Headless + Unified Terminal (AVAILABLE v1.0.0+)
```bash
console-bridge start localhost:3847 --merge-output
# Invisible browser, logs to dev server terminal
```

**Characteristics:**
- ✅ Lightweight (no GUI rendering)
- ✅ Single terminal view
- ✅ Seamless integration with dev workflow
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ Graceful fallback when attachment fails

**Implementation:**
- `--merge-output` CLI flag ✅
- Cross-platform process discovery (netstat/lsof) ✅
- TerminalAttacher component ✅
- processUtils for platform detection ✅
- Automatic graceful fallback ✅

**Best practice:**
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:debug": "concurrently \"npm run dev\" \"console-bridge start localhost:3000 --merge-output\""
  }
}
```

---

### Option 4: Headful + Unified Terminal (AVAILABLE v1.0.0+)
```bash
console-bridge start localhost:3847 --no-headless --merge-output
# Visible browser window, logs to dev server terminal
```

**Characteristics:**
- ✅ Visual debugging
- ✅ Manual interaction possible
- ✅ Single terminal view
- ❌ More resource intensive
- ✅ Fully implemented

---

## Application Structure

### Q: What is the overall architecture of Console Bridge?

**A:** Console Bridge follows a layered architecture:

```
┌─────────────────────────────────────────────────┐
│              CLI Layer (bin/)                   │
│  - Parses commands and options                  │
│  - Validates inputs                             │
│  - Initializes BridgeManager                    │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│         Core Layer (src/core/)                  │
│  - BridgeManager: Orchestration                 │
│  - BrowserPool: Browser lifecycle               │
│  - LogCapturer: Event capture                   │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│       Formatter Layer (src/formatters/)         │
│  - LogFormatter: Format log entries             │
│  - colors.js: Color schemes                     │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│        Utility Layer (src/utils/)               │
│  - url.js: URL normalization                    │
│  - validation.js: Input validation              │
└─────────────────────────────────────────────────┘
```

---

### Q: How does the BridgeManager work?

**A:** BridgeManager is the central orchestrator:

**Responsibilities:**
1. **Browser Lifecycle Management**
   - Creates BrowserPool with configured max instances
   - Manages browser creation/destruction

2. **URL Monitoring**
   - Tracks active URLs being monitored
   - Creates LogCapturer for each URL
   - Handles add/remove operations

3. **Log Processing**
   - Receives logs from LogCapturers
   - Passes to LogFormatter
   - Outputs to terminal or file

**Key Methods:**
```javascript
class BridgeManager {
  async addUrl(url)      // Start monitoring a URL
  async removeUrl(url)   // Stop monitoring a URL
  async start(urls)      // Start monitoring multiple URLs
  async stop()           // Stop all monitoring
  getActiveUrls()        // List active URLs
  isActive(url)          // Check if URL is monitored
  handleLog(logData)     // Process log entry (private)
}
```

---

### Q: What does the BrowserPool do?

**A:** BrowserPool manages browser instances efficiently:

**Purpose:**
- Prevent resource exhaustion
- Reuse browser instances when possible
- Enforce max instance limits

**Key Features:**
1. **Instance Pooling**
   - Creates Puppeteer browser instances
   - Associates each with a URL
   - Tracks instance count

2. **Resource Limits**
   - Default max: 10 instances
   - Configurable via `--max-instances`
   - Prevents memory issues

3. **Lifecycle Management**
   ```javascript
   create(url)      // Create new browser + page
   destroy(url)     // Close browser for URL
   destroyAll()     // Close all browsers
   ```

---

### Q: How does LogCapturer work?

**A:** LogCapturer attaches to Puppeteer pages and captures console events:

**Architecture:**
```javascript
class LogCapturer {
  constructor(page, url, options) {
    this.page = page;              // Puppeteer page
    this.url = url;                // Source URL
    this.levels = options.levels;  // Log levels to capture
    this.callback = null;          // Log handler
  }

  async start(callback) {
    // Define event handlers (stored as instance methods)
    this.consoleHandler = async (msg) => { ... }
    this.pageErrorHandler = (error) => { ... }
    this.requestFailedHandler = (request) => { ... }

    // Attach listeners
    this.attachListeners();

    // Re-attach on frame navigation (CRITICAL for SPA/React)
    this.page.on('framenavigated', () => {
      this.page.off('console', this.consoleHandler);
      this.page.off('pageerror', this.pageErrorHandler);
      this.page.off('requestfailed', this.requestFailedHandler);
      this.attachListeners();
    });
  }

  attachListeners() {
    this.page.on('console', this.consoleHandler);
    this.page.on('pageerror', this.pageErrorHandler);
    this.page.on('requestfailed', this.requestFailedHandler);
  }

  async handleConsoleMessage(msg) {
    // Extract args from JSHandles
    const args = await this.extractPuppeteerArgs(msg.args());

    // Create log data object
    const logData = {
      type: msg.type(),
      args,
      source: this.url,
      timestamp: Date.now(),
      location: msg.location() || {}
    };

    // Call callback (BridgeManager.handleLog)
    if (this.callback) {
      this.callback(logData);
    }
  }
}
```

**Critical Feature: Frame Navigation Handling**

The `framenavigated` listener is essential for:
- React Fast Refresh
- SPA navigation
- Hot module replacement
- Page refreshes

Without it, listeners remain attached to the OLD page context and miss new console events.

---

### Q: How does the LogFormatter work?

**A:** LogFormatter transforms raw log data into terminal-friendly output:

**Features:**
1. **Stateful Tracking**
   ```javascript
   class LogFormatter {
     constructor() {
       this.counters = new Map();  // console.count()
       this.timers = new Map();    // console.time/timeEnd()
       this.groupDepth = 0;        // console.group()
     }
   }
   ```

2. **Type-Specific Formatting**
   - `log/info/error/debug` → Standard format
   - `table` → ASCII table rendering
   - `count` → Increment counter state
   - `timeEnd` → Calculate duration
   - `group/groupEnd` → Indentation management
   - `trace` → Stack trace formatting
   - `assert` → Assertion failure display

3. **Output Customization**
   ```javascript
   format(logData) {
     switch (logData.type) {
       case 'count': return this.formatCount(logData);
       case 'timeEnd': return this.formatTimeEnd(logData);
       case 'table': return this.formatTable(logData);
       // ... 18 console types total
     }
   }
   ```

---

### Q: What are the 18 console types supported?

**A:** Console Bridge supports all Chrome DevTools console types:

**Basic Types (5):**
1. `log` - General logging
2. `info` - Informational messages
3. `warning` - Warnings (note: Puppeteer uses 'warning' not 'warn')
4. `error` - Errors
5. `debug` - Debug information

**Advanced Types (13):**
6. `table` - Tabular data (renders as ASCII table)
7. `dir` - Object inspection
8. `dirxml` - XML/HTML inspection
9. `trace` - Stack traces
10. `clear` - Clear console
11. `startGroup` - Start collapsible group
12. `startGroupCollapsed` - Start collapsed group
13. `endGroup` - End group
14. `assert` - Assertion failures
15. `profile` - Performance profiling start
16. `profileEnd` - Performance profiling end
17. `count` - Counter increment
18. `timeEnd` - Timer end (paired with `console.time()`)

---

## Data Flow

### Complete Request-Response Flow

```
1. USER RUNS COMMAND
   │
   ▼
   console-bridge start localhost:3847
   │
   ▼
2. CLI LAYER (bin/console-bridge.js)
   │ - Parses arguments
   │ - Creates BridgeManager
   │
   ▼
3. BRIDGE MANAGER (src/core/BridgeManager.js)
   │ - Calls browserPool.create(url)
   │ - Navigates to URL
   │ - Creates LogCapturer
   │
   ▼
4. LOG CAPTURER (src/core/LogCapturer.js)
   │ - Attaches page.on('console') listener
   │ - Attaches page.on('pageerror') listener
   │ - Attaches page.on('requestfailed') listener
   │ - Attaches page.on('framenavigated') listener
   │
   ▼
5. BROWSER NAVIGATION
   │ Puppeteer navigates to http://localhost:3847
   │ Page loads JavaScript
   │
   ▼
6. APPLICATION RUNS
   │ User's app executes console.log()
   │
   ▼
7. CONSOLE EVENT FIRED
   │ Puppeteer emits 'console' event
   │
   ▼
8. LOG CAPTURER HANDLES EVENT
   │ - handleConsoleMessage(msg)
   │ - extractPuppeteerArgs(msg.args())
   │ - Creates logData object
   │ - Calls callback (BridgeManager.handleLog)
   │
   ▼
9. BRIDGE MANAGER PROCESSES LOG
   │ - Receives logData
   │ - Calls formatter.format(logData)
   │
   ▼
10. LOG FORMATTER FORMATS OUTPUT
   │ - Adds timestamp
   │ - Adds source URL with color
   │ - Formats message
   │ - Handles stateful types (count, time, group)
   │
   ▼
11. OUTPUT TO TERMINAL
   │ - console.log(formattedLog)
   │ - OR: fs.appendFile(outputFile, formattedLog)
   │
   ▼
12. USER SEES IN TERMINAL
    [03:14:22] [localhost:3847] log: Button clicked!
```

---

### Frame Navigation Flow (React Fast Refresh)

```
1. REACT HOT RELOAD TRIGGERED
   │ User saves file
   │
   ▼
2. NEXT.JS REBUILDS
   │ Fast Refresh updates page
   │
   ▼
3. FRAME NAVIGATION EVENT
   │ Puppeteer emits 'framenavigated'
   │
   ▼
4. LOG CAPTURER RE-ATTACHES
   │ - page.off('console', oldHandler)
   │ - page.off('pageerror', oldHandler)
   │ - page.off('requestfailed', oldHandler)
   │ - attachListeners() // Fresh listeners on new context
   │
   ▼
5. NEW PAGE CONTEXT READY
   │ Console events now captured from new context
   │
   ▼
6. USER CLICKS BUTTON
   │ console.log('Button clicked!')
   │
   ▼
7. LOG CAPTURED FROM NEW CONTEXT ✅
   [03:14:22] [localhost:3847] log: Button clicked!
```

**Without framenavigated listener:**
- ❌ Listeners stay on OLD page context
- ❌ New console events go to dead context
- ❌ No logs appear in terminal
- ❌ Only periodic logs from old intervals still work

**With framenavigated listener:**
- ✅ Listeners move to NEW page context
- ✅ All console events captured
- ✅ Works across hot reloads, navigations, refreshes

---

## Component Architecture

### File Structure

```
console-bridge-c-s-4.5/
├── bin/
│   └── console-bridge.js         # CLI entry point
├── src/
│   ├── core/
│   │   ├── BridgeManager.js      # Central orchestrator
│   │   ├── BrowserPool.js        # Browser lifecycle
│   │   ├── LogCapturer.js        # Event capture
│   │   └── TerminalAttacher.js   # Terminal output attachment
│   ├── formatters/
│   │   ├── LogFormatter.js       # Log formatting
│   │   └── colors.js             # Color schemes
│   └── utils/
│       ├── url.js                # URL utilities
│       ├── validation.js         # Input validation
│       └── processUtils.js       # Cross-platform process discovery
├── tests/
│   ├── unit/                     # Unit tests
│   └── integration/              # Integration tests
├── docs/
│   ├── guides/                   # User guides
│   └── architecture/             # Architecture docs
└── package.json
```

---

### Dependency Graph

```
┌─────────────────────────────────────────┐
│         bin/console-bridge.js           │
│         (CLI Entry Point)               │
└─────────────────────────────────────────┘
                   │
                   │ requires
                   ▼
┌─────────────────────────────────────────┐
│      src/core/BridgeManager.js          │
└─────────────────────────────────────────┘
       │               │              │              │
       │ requires      │ requires     │ requires     │ requires (optional)
       ▼               ▼              ▼              ▼
┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐
│ BrowserPool│  │LogCapturer │  │LogFormatter  │  │TerminalAttacher  │
└────────────┘  └────────────┘  └──────────────┘  └──────────────────┘
                                       │                    │
                                       │ requires           │ requires
                                       ▼                    ▼
                                ┌──────────────┐  ┌──────────────────┐
                                │  colors.js   │  │  processUtils.js │
                                └──────────────┘  └──────────────────┘
```

---

### Key Interfaces

**BridgeManager Options:**
```typescript
interface BridgeManagerOptions {
  maxInstances?: number;           // Default: 10
  headless?: boolean;              // Default: true
  levels?: string[];               // Default: all 18 types
  mergeOutput?: boolean;           // Default: false (v1.0.0+)
  output?: (log: string) => void;  // Default: console.log
  formatterOptions?: {
    showTimestamp?: boolean;       // Default: true
    showSource?: boolean;          // Default: true
    showLocation?: boolean;        // Default: false
    timestampFormat?: 'time' | 'iso'; // Default: 'time'
  };
}
```

**LogData Object:**
```typescript
interface LogData {
  type: string;          // e.g., 'log', 'error', 'table'
  args: any[];          // Serialized console arguments
  source: string;       // Source URL
  timestamp: number;    // Unix timestamp
  location: {           // Optional source location
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
}
```

---

## Summary Q&A

### Q: Is headless mode using Chromium or Chrome?
**A:** Both modes use **Chromium** (open-source). Chrome is Google's branded version with extras.

### Q: Can Console Bridge output to the same terminal as my dev server?
**A:** Yes! Use the `--merge-output` flag (available in v1.0.0+). Works best with `concurrently` to run both dev server and Console Bridge in the same terminal. See [Advanced Usage Guide](../guides/advanced-usage.md#unified-terminal-output-merge-output) for details.

### Q: What does the headful mode browser window show?
**A:** Your **actual application** running in Chromium. NOT a separate Console Bridge UI.

### Q: Which file handles the frame navigation fix?
**A:** `src/core/LogCapturer.js` - the `framenavigated` listener re-attaches console handlers on page context changes.

### Q: How are complex console types like `console.table()` handled?
**A:** `src/formatters/LogFormatter.js` has specialized formatters for each type. For example, `formatTable()` creates ASCII tables from array data.

### Q: What's the max number of URLs I can monitor simultaneously?
**A:** Default is 10 (configurable via `--max-instances`). Each browser instance uses ~50-100MB RAM.

### Q: Does Console Bridge work with any framework?
**A:** Yes! It's framework-agnostic. Works with React, Next.js, Vue, Svelte, vanilla JS - anything serving to localhost.

---

**For implementation details, see:**
- [Getting Started Guide](../guides/getting-started.md)
- [Advanced Usage Guide](../guides/advanced-usage.md)
- [Troubleshooting Guide](../guides/troubleshooting.md)

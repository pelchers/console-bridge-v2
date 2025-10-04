# Console Bridge System Architecture

Complete architectural overview explaining how Console Bridge works, browser modes, terminal output options, and application structure.

## Table of Contents
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

### Option 3: Headless + Unified Terminal (FUTURE - NOT YET AVAILABLE)
```bash
console-bridge start localhost:3847 --merge-output
# Invisible browser, logs to dev server terminal
```

**Characteristics:**
- ✅ Lightweight (no GUI rendering)
- ✅ Single terminal view
- ✅ Seamless integration with dev workflow
- 🚧 Requires new CLI flag implementation
- 🚧 Requires process attachment logic

**Implementation requirements:**
- New `--merge-output` or `--attach` CLI flag
- Process discovery (find dev server terminal)
- Output stream redirection
- Graceful handling when dev server stops

---

### Option 4: Headful + Unified Terminal (FUTURE - NOT YET AVAILABLE)
```bash
console-bridge start localhost:3847 --no-headless --merge-output
# Visible browser window, logs to dev server terminal
```

**Characteristics:**
- ✅ Visual debugging
- ✅ Manual interaction possible
- ✅ Single terminal view
- ❌ More resource intensive
- 🚧 Requires new CLI flag implementation

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
│   │   └── LogCapturer.js        # Event capture
│   ├── formatters/
│   │   ├── LogFormatter.js       # Log formatting
│   │   └── colors.js             # Color schemes
│   └── utils/
│       ├── url.js                # URL utilities
│       └── validation.js         # Input validation
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
       │               │              │
       │ requires      │ requires     │ requires
       ▼               ▼              ▼
┌────────────┐  ┌────────────┐  ┌──────────────┐
│ BrowserPool│  │LogCapturer │  │LogFormatter  │
└────────────┘  └────────────┘  └──────────────┘
                                       │
                                       │ requires
                                       ▼
                                ┌──────────────┐
                                │  colors.js   │
                                └──────────────┘
```

---

### Key Interfaces

**BridgeManager Options:**
```typescript
interface BridgeManagerOptions {
  maxInstances?: number;           // Default: 10
  headless?: boolean;              // Default: true
  levels?: string[];               // Default: all 18 types
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
**A:** Not built-in yet (Options 3 & 4). Currently requires `concurrently` package or custom scripting. This would be a valuable future feature.

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

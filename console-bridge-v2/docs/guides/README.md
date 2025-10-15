# Console Bridge User Guides

Complete documentation for using Console Bridge in your development workflow.

## 🚀 Quick Start (For Beginners)

**New to Console Bridge?** Follow these numbered guides in order:

### 1. [Setup Guide](./1-setup-guide.md)
**Install and configure Console Bridge from scratch**

Step-by-step instructions:
- Install Console Bridge globally
- Install concurrently in your project
- Add unified terminal script
- Verify everything works
- Fix common setup issues

👉 **[Read Setup Guide →](./1-setup-guide.md)**

---

### 2. [Workflow Guide](./2-workflow-guide.md)
**Learn the 5 ways to run Console Bridge**

Choose your method:
- **Method 1:** Basic Puppeteer (2 terminals) - Simple learning
- **Method 2:** Manual merge (2 terminals) - Advanced
- **Method 3:** Unified Puppeteer (1 terminal) - Recommended for automation
- **Method 4:** Headful debug - Visual debugging
- **Method 5:** Extension Mode (1 terminal) - **Recommended for daily development**

👉 **[Read Workflow Guide →](./2-workflow-guide.md)**

---

## 📚 Comprehensive Guides

### [Getting Started](./getting-started.md)
**Detailed introduction to Console Bridge**

Learn how to:
- Install Console Bridge
- Monitor your first localhost app
- Understand console output format
- Set up common workflows (React, Next.js, Vite)

👉 **[Read Getting Started Guide →](./getting-started.md)**

---

### [Port and URL Configuration](./port-and-url-configuration.md)
**Understand how ports and URLs work in Console Bridge**

Topics covered:
- Extension Mode: No URL required
- Puppeteer Mode: URL required
- localhost vs 127.0.0.1
- Port discovery and process attachment
- Multi-port and multi-tab support
- Common configuration questions

👉 **[Read Port Configuration Guide →](./port-and-url-configuration.md)**

---

### [Advanced Usage](./advanced-usage.md)
**Master advanced features and CLI options**

Topics covered:
- CLI options reference
- Headless vs headful mode explained
- Output format customization
- Log filtering strategies
- Monitoring multiple URLs
- Integration examples (CI/CD, Docker)
- Programmatic API usage

👉 **[Read Advanced Usage Guide →](./advanced-usage.md)**

---

### [Troubleshooting](./troubleshooting.md)
**Fix common issues and errors**

Solutions for:
- "No console output appearing"
- "Button clicks not captured"
- "Logs out of sync after refresh"
- Browser launch failures
- Performance issues
- Complete diagnostic checklist

👉 **[Read Troubleshooting Guide →](./troubleshooting.md)**

---

## Quick Start

```bash
# Install globally
npm install -g @yourorg/console-bridge

# Start your dev server
npm run dev

# Monitor console logs
console-bridge start localhost:3000
```

That's it! Console logs now stream to your terminal.

---

## Common Use Cases

### React Development
```bash
console-bridge start localhost:3000
```

### Next.js with Debugging
```bash
console-bridge start localhost:3000 --location
```

### Error Monitoring Only
```bash
console-bridge start localhost:3000 -l error,warning
```

### Multiple Apps
```bash
console-bridge start localhost:3000 localhost:8080
```

### Save Logs to File
```bash
console-bridge start localhost:3000 -o logs.txt
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│          Your Development Server            │
│          (React, Next.js, etc.)             │
│          http://localhost:3000              │
└─────────────────────────────────────────────┘
                      │
                      │ Puppeteer navigates to URL
                      ▼
┌─────────────────────────────────────────────┐
│          Console Bridge (Puppeteer)         │
│          - Launches headless browser        │
│          - Attaches console listeners       │
│          - Captures all console events      │
└─────────────────────────────────────────────┘
                      │
                      │ Streams formatted logs
                      ▼
┌─────────────────────────────────────────────┐
│          Your Terminal                      │
│          [14:32:15] [localhost:3000] log:   │
│          Button clicked!                    │
└─────────────────────────────────────────────┘
```

**Key Points:**
- Console Bridge runs **its own browser** (Puppeteer)
- It doesn't capture logs from your personal Chrome browser
- Logs stream in real-time as they occur
- Listeners automatically re-attach on page refresh/navigation

---

## Supported Console Types

Console Bridge captures all 18 Chrome DevTools console types:

**Basic Types:**
- `console.log()` - General logging
- `console.info()` - Informational messages
- `console.warn()` - Warnings
- `console.error()` - Errors
- `console.debug()` - Debug information

**Advanced Types:**
- `console.table()` - Tabular data display
- `console.dir()` - Object inspection
- `console.dirxml()` - XML/HTML inspection
- `console.trace()` - Stack traces
- `console.group()` - Collapsible groups
- `console.groupCollapsed()` - Collapsed groups
- `console.groupEnd()` - End group
- `console.count()` - Counter
- `console.time()` / `console.timeEnd()` - Timing
- `console.assert()` - Assertions
- `console.clear()` - Clear console
- `console.profile()` / `console.profileEnd()` - Performance profiling

---

## Key Features

✅ **Real-time Streaming** - Logs appear instantly in terminal
✅ **Color-Coded Output** - Easy visual distinction
✅ **Multiple URLs** - Monitor several apps simultaneously
✅ **Auto-Reconnection** - Handles page refresh/navigation
✅ **Flexible Filtering** - Capture only what you need
✅ **File Output** - Save logs for later analysis
✅ **Zero Config** - Works out of the box
✅ **Framework Agnostic** - Works with any localhost app

---

## Guide Navigation

1. **New to Console Bridge?** → [Getting Started](./getting-started.md)
2. **Need advanced features?** → [Advanced Usage](./advanced-usage.md)
3. **Encountering issues?** → [Troubleshooting](./troubleshooting.md)

---

## Additional Resources

- 📖 [Main README](../../README.md) - Project overview
- 🧪 [Testing Guide](../../../portfolio-test/TESTING_GUIDE.md) - Manual testing instructions
- 🤖 [AI Context](../../../portfolio-test/AI_CONTEXT.md) - Technical context for AI assistants
- 📋 [API Reference](../api/) - Detailed API documentation

---

## Getting Help

**Found a bug?** [Report an issue](https://github.com/yourorg/console-bridge/issues)

**Have a question?** [Start a discussion](https://github.com/yourorg/console-bridge/discussions)

**Need urgent help?** Check the [Troubleshooting Guide](./troubleshooting.md) diagnostic checklist

---

## Quick Reference Card

### Essential Commands

| Command | Description |
|---------|-------------|
| `console-bridge start <url>` | Start monitoring |
| `console-bridge --version` | Check version |
| `console-bridge start --help` | Show all options |

### Common Options

| Option | Example | Purpose |
|--------|---------|---------|
| `-l, --levels` | `-l error,warning` | Filter log types |
| `--no-headless` | `--no-headless` | Show browser window |
| `-o, --output` | `-o logs.txt` | Save to file |
| `--location` | `--location` | Show file locations |
| `--no-timestamp` | `--no-timestamp` | Hide timestamps |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+C` | Stop monitoring |

---

**Happy debugging! 🐛🔍**

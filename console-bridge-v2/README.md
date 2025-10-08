# Console Bridge 🌉

> Bridge browser console logs from localhost applications to your terminal with multi-instance support

[![npm version](https://img.shields.io/npm/v/console-bridge.svg)](https://www.npmjs.com/package/console-bridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/console-bridge.svg)](https://nodejs.org)

**Status:** Phase 2 Complete ✅ | Phase 3 In Progress 🚧 (Chrome Web Store Prep)

## Overview

Console Bridge streams browser console outputs from localhost applications directly to your terminal in real-time. Perfect for debugging microservices, monitoring multiple dev servers, or keeping an eye on frontend logs without switching browser tabs.

## Quick Start

```bash
# Install
npm install -g console-bridge

# Monitor a single localhost
console-bridge start localhost:3000

# Monitor multiple instances
console-bridge start localhost:3000 localhost:8080 localhost:5000
```

## Features

**Implemented (v1.0.0-rc):**
- ✅ Multi-Instance Monitoring - Monitor multiple localhost URLs simultaneously
- ✅ Color-Coded Output - Different colors for different sources
- ✅ Timestamps - Configurable time or ISO format
- ✅ Log Filtering - Filter by log level (log, info, warn, error, debug)
- ✅ File Export - Save logs to file (ANSI codes stripped for readability)
- ✅ Graceful Exit - Clean shutdown with Ctrl+C
- ✅ CLI Interface - Full-featured command-line tool

**In Development:**
- 🔜 Chrome Web Store publication
- 🔜 Comprehensive documentation website

## Installation

```bash
npm install -g console-bridge
```

## Usage

### Basic Usage

```bash
# Start monitoring a single URL
console-bridge start localhost:3000

# Monitor multiple URLs
console-bridge start localhost:3000 localhost:8080 localhost:5000
```

### Advanced Options

```bash
# Filter by log levels
console-bridge start localhost:3000 --levels error,warn

# Show browser (non-headless mode)
console-bridge start localhost:3000 --no-headless

# Show file locations in logs
console-bridge start localhost:3000 --location

# Use ISO timestamp format
console-bridge start localhost:3000 --timestamp-format iso

# Hide timestamps or source
console-bridge start localhost:3000 --no-timestamp --no-source

# Save logs to file
console-bridge start localhost:3000 --output logs.txt
```

### All Options

- `-o, --output <file>` - Save logs to file (appends if file exists)
- `--levels <levels>` - Comma-separated log levels (default: log,info,warn,error,debug)
- `--no-headless` - Show browser windows
- `--max-instances <n>` - Maximum concurrent browser instances (default: 10)
- `--no-timestamp` - Hide timestamps
- `--no-source` - Hide source URLs
- `--location` - Show file location for each log
- `--timestamp-format <format>` - Use 'time' or 'iso' format (default: time)

## v2.0.0 - Browser Extension Support ✨

**Console Bridge v2.0.0 solves the v1.0.0 Puppeteer-only limitation!**

### Dual-Mode Operation

**Puppeteer Mode (v1.0.0 - Preserved):**
```bash
# Works exactly like v1.0.0
console-bridge start localhost:3000
console-bridge start localhost:3000 --no-headless --merge-output
```
- ✅ 100% backward compatible
- ✅ Perfect for CI/CD, automated testing
- ✅ No changes to existing workflows

**Extension Mode (v2.0.0 - NEW):**
```bash
# NEW: Monitor your personal Chrome browser!
console-bridge start --extension-mode

# Extension mode supports most v1 formatting flags:
console-bridge start --extension-mode --output logs.txt --no-timestamp --location
```
- ✅ Use YOUR Chrome browser (or Edge, Brave, Opera, Vivaldi)
- ✅ Works with browser extensions (React DevTools, Vue DevTools, etc.)
- ✅ Works on all Chromium-based browsers
- ✅ Console logs from YOUR browser appear in terminal

**Extension Mode Supported Flags:**
- ✅ `--output` - File export (works identically to v1)
- ✅ `--no-timestamp` - Hide timestamps
- ✅ `--no-source` - Hide source URLs
- ✅ `--location` - Show file locations
- ✅ `--timestamp-format` - Time vs ISO format
- ⚠️ `--levels` - Log filtering (coming in Phase 3.2)
- ❌ `--no-headless`, `--max-instances` - N/A (you control your own browser)

**Extension Installation (Development Mode):**
1. Clone this repository
2. Open Chrome → `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" → Select `console-bridge-v2/chrome-extension-poc/`
5. Open DevTools on any localhost page → "Console Bridge" panel
6. Start CLI: `console-bridge start --extension-mode`
7. Console logs from browser appear in terminal!

**See [chrome-extension-poc/README.md](chrome-extension-poc/README.md) for complete extension documentation.**

## Previous v1.0.0 Limitations (SOLVED in v2.0.0)

**⚠️ CRITICAL: Puppeteer Chromium Only**

Console Bridge v1.0.0 ONLY monitors the Puppeteer-controlled Chromium browser:
- ❌ Cannot monitor personal Chrome/Firefox/Safari browsers
- ❌ User interactions in personal browsers will NOT appear in terminal
- ✅ Must use Puppeteer headful mode (`--no-headless`) for manual interaction
- ✅ Designed for CI/CD, automated testing, and AI-assisted development

v2.0.0 solves all these limitations with Extension Mode - see above!


## Development Status

### v1.0.0 (Puppeteer Mode)
- ✅ **Phase 1 Complete** - Core components (BrowserPool, LogCapturer, utilities)
- ✅ **Phase 2 Complete** - BridgeManager and LogFormatter
- ✅ **Phase 3 Complete** - CLI implementation
- ✅ **Phase 4 Complete** - Documentation, file export, npm publish

### v2.0.0 (Extension Mode)
- ✅ **Subtask 2.1** - Console capture system in extension
- ✅ **Subtask 2.2** - Advanced object serialization
- ✅ **Subtask 2.3** - WebSocket client (extension → CLI)
- ✅ **Subtask 2.4** - WebSocket server (CLI receives messages)
- 🚧 **Phase 3** - Chrome Web Store publication & documentation (IN PROGRESS)
  - 🚧 **Subtask 3.1** - Chrome Web Store preparation (manifest, privacy policy, listing content)

**Test Coverage:** 211/211 core tests passing (100%)

### Testing Strategy

Console Bridge v2 uses a multi-tool testing approach:

1. **Jest** - Unit tests (core modules, utilities)
   ```bash
   npm test  # 211/211 tests passing
   ```

2. **Puppeteer** - Integration tests for v1 Puppeteer mode
   ```bash
   npm run test:integration
   ```

3. **Playwright MCP** - Extension E2E tests (planned Phase 3.4)
   - Cross-browser testing (Chrome, Edge, Brave)
   - Extension loading and automation
   - CDP access for DevTools interaction

4. **BrowserMCP** - Chrome-specific automation (planned Phase 3.4)
   - DevTools panel interaction
   - Visual testing (screenshots)
   - Real Chrome browser control

**Note:** Desktop Automation MCP available but not needed for console streaming tests.

## Documentation

- **[v1 to v2 Comparison](.claude/versions/comparison/v1-to-v2.md)** - Comprehensive comparison of v1 (Puppeteer-only) vs v2 (Dual-mode)
- [Chrome Extension README](chrome-extension-poc/README.md) - Extension documentation
- [Phase 3 ADRs](.claude/adr/phase-3/) - Architecture decision records

## License

MIT © 2025

## Architecture

### Puppeteer Mode (v1.0.0)
```
CLI → Puppeteer → Chromium → Console Logs → Terminal
```

### Extension Mode (v2.0.0)
```
Your Chrome Browser → Console Logs → Extension → WebSocket (ws://localhost:9223) → CLI → Terminal
```

**Protocol:** WebSocket Protocol v1.0.0 (JSON messages)
**Port:** 9223 (WebSocket server on CLI)
**Security:** Localhost only, no external connections

## Contributing

This project is under active development. Contributions welcome!

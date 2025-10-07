# Console Bridge 🌉

> Bridge browser console logs from localhost applications to your terminal with multi-instance support

[![npm version](https://img.shields.io/npm/v/console-bridge.svg)](https://www.npmjs.com/package/console-bridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/console-bridge.svg)](https://nodejs.org)

**Status:** Phase 3 Complete - Pre-Release (Preparing for npm publish)

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

**Coming in v1.0.0:**
- 🔜 Programmatic API - Use as a library in Node.js apps
- 🔜 Comprehensive documentation

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
```
- ✅ Use YOUR Chrome browser (or Edge, Brave, Opera, Vivaldi)
- ✅ Works with browser extensions (React DevTools, Vue DevTools, etc.)
- ✅ Works on all Chromium-based browsers
- ✅ Console logs from YOUR browser appear in terminal

**See [docs/v2.0.0-spec/clarifications.md](docs/v2.0.0-spec/clarifications.md) for complete dual-mode documentation.**

## Previous v1.0.0 Limitations (SOLVED in v2.0.0)

**⚠️ CRITICAL: Puppeteer Chromium Only**

Console Bridge v1.0.0 ONLY monitors the Puppeteer-controlled Chromium browser:
- ❌ Cannot monitor personal Chrome/Firefox/Safari browsers
- ❌ User interactions in personal browsers will NOT appear in terminal
- ✅ Must use Puppeteer headful mode (`--no-headless`) for manual interaction
- ✅ Designed for CI/CD, automated testing, and AI-assisted development

v2.0.0 solves all these limitations with Extension Mode - see above!


## Development Status

- ✅ **Phase 1 Complete** - Core components (BrowserPool, LogCapturer, utilities)
- ✅ **Phase 2 Complete** - BridgeManager and LogFormatter
- ✅ **Phase 3 Complete** - CLI implementation
- ✅ **Phase 4 Complete** - Documentation, file export, npm publish (v1.0.0 released)

**Test Coverage:** 186/186 tests passing (100%)

## Documentation

- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Technical Requirements](TRD.md)
- [Product Requirements](PRD.md)

## License

MIT © 2025

## Contributing

This project is under active development. Contributions welcome once v1.0.0 is released.

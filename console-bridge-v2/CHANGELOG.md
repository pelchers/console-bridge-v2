# Changelog

All notable changes to Console Bridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0-beta] - 2025-10-08

### Added - Extension Mode 🎉

**Major Feature:** Chrome Extension WebSocket integration!

#### Extension Mode
- **`--extension-mode` CLI flag:** Start WebSocket server for Chrome extension communication
- **WebSocket Protocol v1.0.0:** JSON-based message protocol (extension ↔ CLI)
- **WebSocket Server:** Listens on ws://localhost:9223 for extension connections
- **Chrome Extension Panel:** Custom DevTools panel "Console Bridge" for console capture
- **Console Capture System:** Browser-side console log interception and serialization
- **Advanced Serialization:** Support for complex objects, circular references, DOM elements, errors, Map, Set, Promise, Symbol, BigInt

#### Resilience Features
- **Message Queuing:** 1000 message queue with FIFO overflow during disconnections
- **Ping/Pong Keep-Alive:** 30s ping interval with 5s pong timeout
- **Exponential Backoff Reconnection:** Auto-reconnect with 1s → 16s delays (max 5 attempts)

#### WebSocket Protocol v1.0.0
- **Message Types:** connection_status, console_event, ping, pong, error, welcome
- **Envelope Structure:** {version, type, timestamp, source, payload}
- **Typed Arguments:** {type: 'string', value: 'Hello'}
- **ISO 8601 Timestamps**
- **Source Metadata:** tabId, URL, page title

#### Developer Experience
- **Zero Breaking Changes:** v1.0.0 Puppeteer mode unchanged (100% backward compatible)
- **Dual-Mode Operation:** Seamlessly switch between Puppeteer and Extension modes
- **Optional URLs:** `start [urls...]` supports extension mode without URLs
- **LogFormatter Integration:** Extension logs formatted identically to Puppeteer mode
- **Development Installation:** Load unpacked from `chrome-extension-poc/` directory

### Changed
- **CLI Command:** `start <urls...>` → `start [urls...]` (URLs optional for extension mode)
- **Test Coverage:** 186 tests → 211 tests (+25 tests)

### Technical Details
- **Files Added:** WebSocketServer.js (245 lines), console-capture.js (489 lines), protocol.js (226 lines)
- **Files Modified:** console-bridge.js (CLI), panel.js (extension), cli.test.js
- **Dependencies:** Added `ws` (WebSocket library)
- **Protocol Port:** 9223 (localhost only, no external connections)
- **Performance:** <5ms message latency, ~1ms serialization overhead, ~5MB extension memory

### Documentation
- **8 Phase 2 ADRs:** Complete architecture decision records
- **README Updates:** Extension installation guide, architecture diagrams
- **Protocol Specification:** Complete WebSocket Protocol v1.0.0 documentation

### Testing
- **Core Tests:** 211/211 passing (100%)
- **Manual Verification:** Full extension ↔ CLI flow tested
- **Test Scenarios:** 48 advanced serialization test cases

### Known Limitations
- **Chromium Only:** Works on Chrome, Edge, Brave, Opera, Vivaldi (no Firefox yet)
- **Single CLI Instance:** Port 9223 allows one extension mode instance
- **Localhost Restriction:** Development servers only
- **No Authentication:** Localhost-only by design

### Migration Guide
**No migration needed!** v2.0.0 is 100% backward compatible.

**Puppeteer Mode (unchanged):**
```bash
console-bridge start localhost:3000
```

**Extension Mode (new):**
```bash
console-bridge start --extension-mode
```

## [1.0.0] - 2025-10-02

### Added
- **Core Functionality**
  - BrowserPool: Manages multiple Puppeteer browser instances with resource limits
  - LogCapturer: Captures console events, page errors, and request failures from browsers
  - BridgeManager: Central orchestrator coordinating all components
  - LogFormatter: Formats logs with colors, timestamps, and source labels

- **CLI Interface**
  - `console-bridge start <urls...>` command to monitor localhost applications
  - Multi-instance monitoring (monitor multiple URLs simultaneously)
  - Color-coded output with different colors for different sources
  - Configurable timestamps (time or ISO format)
  - Log level filtering (`--levels` option)
  - File export (`--output` option) with ANSI stripping
  - Graceful shutdown on Ctrl+C (SIGINT/SIGTERM)
  - Browser visibility toggle (`--no-headless`)
  - Instance limit configuration (`--max-instances`)
  - Optional file location display (`--location`)
  - Customizable output formatting (`--no-timestamp`, `--no-source`)

- **Programmatic API**
  - Exposed main classes for Node.js library usage
  - BridgeManager API for dynamic URL management
  - Custom output handlers support
  - LogFormatter customization and extension
  - Direct BrowserPool and LogCapturer access

- **Documentation**
  - Comprehensive user guide (docs/USAGE.md)
  - Complete API reference (docs/API.md)
  - CLI usage examples (examples/basic-cli/)
  - Programmatic API examples (examples/programmatic/)
  - Custom formatter examples (examples/custom-formatter/)
  - File export examples (examples/file-export/)
  - Advanced usage patterns (examples/advanced/)

- **Utilities**
  - URL validation and normalization
  - Source color assignment
  - Log level color mapping

### Technical Details
- Node.js >= 16.0.0 required
- Uses Puppeteer for browser automation
- Commander.js for CLI argument parsing
- Chalk for terminal colors
- Full CommonJS compatibility

### Testing
- 193 tests passing (100% of active tests)
- 96.68% code coverage
- Unit tests for all core components
- Integration tests for CLI functionality
- Comprehensive error handling tests

---

*Console Bridge is now ready for v1.0.0 release.*

# Changelog

All notable changes to Console Bridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

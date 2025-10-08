# Product Requirements Document (PRD)
## Browser Console to Terminal Bridge

### Product Overview
A developer-focused npm package that captures browser console output from localhost applications and streams it to the terminal in real-time. This tool bridges the gap between browser development tools and terminal-based workflows, allowing developers to monitor console logs directly in their terminal without switching contexts.

### Target Users
- **Primary**: Front-end developers working on localhost applications
- **Secondary**: Full-stack developers debugging multiple services simultaneously
- **Tertiary**: QA engineers monitoring application logs during testing

### Problem Statement
Developers working with localhost applications need to constantly switch between their code editor/terminal and browser DevTools to monitor console output. This context switching reduces productivity and makes it difficult to maintain focus on the code while debugging.

### Solution
A zero-configuration npm package that:
1. Captures browser console output using Puppeteer and Chrome DevTools Protocol
2. Streams logs to the terminal interface
3. Labels each log with its source URL
4. Provides unified terminal output with dev server logs
5. Requires no browser integration or code changes

### Core Features

#### 1. Zero-Configuration Console Capture
- **Description**: Automatically capture console logs without any browser setup
- **User Story**: As a developer, I want to see console output in my terminal without adding scripts to my app
- **Acceptance Criteria**:
  - No browser integration required
  - No code modifications needed
  - Works with any localhost URL
  - Automatic Puppeteer browser management

#### 2. Comprehensive Console Method Support
- **Description**: Capture all 18 console methods
- **User Story**: As a developer, I want all console outputs captured automatically
- **Acceptance Criteria**:
  - Support all 18 console methods: log, info, warn, error, debug, dir, dirxml, table, trace, clear, group, groupCollapsed, groupEnd, assert, profile, profileEnd, count, timeEnd
  - Preserve original formatting and data types
  - Handle complex objects and circular references via CDP

#### 3. Unified Terminal Output
- **Description**: Merge browser console logs with dev server output
- **User Story**: As a developer, I want to see both dev server logs and browser console logs in one terminal
- **Acceptance Criteria**:
  - `--merge-output` flag for unified output
  - Cross-platform process discovery (Windows, macOS, Linux)
  - Graceful fallback when dev server not found
  - Seamless integration without disrupting dev server

#### 4. Terminal Formatting
- **Description**: Color-coded and formatted output for easy reading
- **User Story**: As a developer, I want to quickly identify log types and sources
- **Acceptance Criteria**:
  - Color-code by log type (error=red, warn=yellow, info=blue, etc.)
  - Include timestamps
  - Display source URL prominently
  - Support for light/dark terminal themes

#### 5. Simple CLI Interface
- **Description**: Easy-to-use command line interface
- **User Story**: As a developer, I want to start console capture with a simple command
- **Acceptance Criteria**:
  - `console-bridge start <url>` - starts console capture
  - `--merge-output` - unified terminal with dev server
  - `--no-headless` - visible browser for debugging
  - `--levels` - filter by log levels
  - `--location` - show file locations
  - Ctrl+C to exit gracefully

#### 6. Multi-URL Support
- **Description**: Monitor multiple localhost apps simultaneously
- **User Story**: As a developer, I want to monitor console output from multiple localhost apps
- **Acceptance Criteria**:
  - Support multiple URLs in single command
  - Independent browser instances per URL
  - Clear source labeling for each URL
  - Maintain chronological order across sources

### Non-Functional Requirements

#### Performance
- Minimal latency between console call and terminal display (via CDP)
- Low CPU and memory footprint
- Handle high-frequency logging without dropping messages
- Efficient browser lifecycle management

#### Reliability
- Graceful handling of browser crashes
- Automatic browser cleanup on exit
- No data loss during normal operation
- Graceful fallback when terminal attachment fails

#### Compatibility
- Node.js 14.x and above
- Chrome/Chromium via Puppeteer
- Works with all JavaScript frameworks (React, Next.js, Vue, Svelte, etc.)
- Cross-platform: Windows, macOS, Linux

#### Security
- Localhost-only operation
- No remote code execution
- No network exposure beyond localhost

### User Experience

#### Installation Flow
1. `npm install -g console-bridge`
2. `console-bridge start localhost:3000`
3. Console output appears in terminal automatically

#### Usage Patterns

**Basic Usage:**
```bash
console-bridge start localhost:3000
```

**Unified Terminal:**
```bash
console-bridge start localhost:3000 --merge-output
```

**Multiple URLs:**
```bash
console-bridge start localhost:3000 localhost:8080
```

**Filtered Output:**
```bash
console-bridge start localhost:3000 --levels error,warn
```

**Visible Browser:**
```bash
console-bridge start localhost:3000 --no-headless
```

### Success Metrics
- Installation count growth
- GitHub stars and community engagement
- Average session duration
- Number of users using --merge-output flag
- Cross-platform adoption rates

### Future Enhancements
1. **Filtering**: Regex-based log filtering in real-time
2. **Search**: Real-time search across captured logs
3. **Export**: Save logs to file with formatting
n### Known Limitations (v1.0.0)

**CRITICAL: Puppeteer Chromium Only**

Console Bridge v1.0.0 ONLY monitors the Puppeteer-controlled Chromium browser:
- ❌ Cannot monitor personal Chrome/Firefox/Safari browsers
- ❌ User interactions in personal browsers will NOT appear in terminal
- ✅ Must use Puppeteer headful mode (`--no-headless`) for manual interaction
- ✅ Designed for CI/CD, automated testing, and AI-assisted development

**See [REQUIREMENTS.md](../docs/REQUIREMENTS.md) for complete limitation documentation.**

**v2.0.0 (October 8, 2025 - Phase 2 Complete)** adds browser extension support to monitor personal Chrome/Chromium browsers. See "v2.0.0 Extension Mode" section below.

4. **Remote Debugging**: Support for non-localhost URLs (with security)
5. **Browser Extension**: Alternative capture method
6. **Log Persistence**: Optional database storage
7. **Performance Monitoring**: Capture performance metrics
8. **Network Monitoring**: Capture network requests

### MVP Scope (v1.0.0 - Achieved)
1. ✅ Zero-configuration console capture via Puppeteer + CDP
2. ✅ All 18 console methods supported
3. ✅ Terminal color formatting
4. ✅ CLI interface with multiple flags
5. ✅ Unified terminal output (--merge-output)
6. ✅ Multi-URL support
7. ✅ Cross-platform compatibility
8. ✅ Headless/headful mode

### Constraints
- Must not interfere with existing console functionality
- Should work without modifying application code
- Terminal-only interface for MVP (no GUI)
- Requires Chrome/Chromium via Puppeteer

### Dependencies
- **puppeteer** - Browser automation and CDP access
- **chalk** - Terminal colors
- **commander** - CLI framework
- Minimal external dependencies for reliability

### Architecture
- **Puppeteer + Chrome DevTools Protocol** for console capture
- **Cross-platform process utilities** for dev server discovery
- **BridgeManager** orchestrates browser instances
- **BrowserPool** manages Puppeteer lifecycle
- **LogCapturer** captures console events via CDP
- **LogFormatter** formats logs for terminal
- **TerminalAttacher** merges output with dev server

---

## v2.0.0 Extension Mode (October 8, 2025)

### Problem Statement (v1 Limitation)
v1.0.0 only monitors Puppeteer-controlled browsers. Developers want to use THEIR personal Chrome browser with THEIR extensions (React DevTools, Vue DevTools, etc.) while streaming console logs to terminal.

### Solution: Chrome Extension as Bridge
A Chrome extension that acts as the "bridge" between user's personal Chrome browser and the CLI tool.

### Core Features (v2.0.0)

#### 1. Extension Mode - Monitor Personal Chrome
- **Description**: Use YOUR Chrome browser instead of Puppeteer-controlled browser
- **User Story**: As a developer, I want to use my personal Chrome with all my extensions while streaming console logs to terminal
- **Acceptance Criteria**:
  - ✅ Extension installed via Chrome Web Store or developer mode
  - ✅ Works with user's daily Chrome browser
  - ✅ Compatible with all Chrome extensions (React DevTools, Redux DevTools, etc.)
  - ✅ Supports all Chromium-based browsers (Chrome, Edge, Brave, Opera, Vivaldi)

#### 2. WebSocket Protocol v1.0.0
- **Description**: Extension communicates with CLI via WebSocket
- **User Story**: As a developer, I want reliable streaming from extension to CLI
- **Acceptance Criteria**:
  - ✅ WebSocket server on CLI (port 9223, localhost only)
  - ✅ JSON message protocol with envelope structure
  - ✅ Message types: console_event, connection_status, ping, pong, welcome
  - ✅ Protocol documentation in v1-to-v2 comparison doc

#### 3. Advanced Features (Beyond v1)
- **Message Queuing**: Queue up to 1000 messages during disconnections
- **Ping/Pong Keep-Alive**: 30s ping interval, 5s pong timeout
- **Auto-Reconnect**: Exponential backoff (1s → 2s → 4s → 8s → 16s, max 5 attempts)
- **Advanced Serialization**: Maps, Sets, Promises, Symbols, BigInt, circular refs, DOM elements
- **DevTools Panel UI**: Connection status, statistics, error display

#### 4. Dual-Mode Operation (100% Backward Compatible)
- **Puppeteer Mode**: Same as v1.0.0, no changes
- **Extension Mode**: NEW, use `--extension-mode` flag
- **User Experience**:
  ```bash
  # v1 Puppeteer mode (unchanged)
  console-bridge start localhost:3000

  # v2 Extension mode (NEW)
  console-bridge start --extension-mode
  ```

### Extension Mode Supported Flags
- ✅ `--output` - File export (works identically to v1)
- ✅ `--no-timestamp` - Hide timestamps
- ✅ `--no-source` - Hide source URLs
- ✅ `--location` - Show file locations
- ✅ `--timestamp-format` - Time vs ISO format
- ⚠️ `--levels` - Log filtering (coming in Phase 3.2)
- ❌ `--no-headless`, `--max-instances` - N/A (you control your own browser)

### Testing Strategy (v2 ADDS tools, not replaces)
**v1 Testing Tools (2 - Preserved):**
1. Jest - Unit tests (186 tests in v1, 211 in v2)
2. Puppeteer - Integration tests (v1 Puppeteer mode)

**v2 ADDS Testing Tools (+2 NEW):**
3. Playwright MCP - Extension E2E tests (cross-browser, extension loading, CDP access)
4. BrowserMCP - Chrome-specific automation (DevTools panel, visual testing)

**Rationale:** v2 does NOT remove any v1 tests. We KEEP all v1 tests and ADD new extension tests using Playwright MCP + BrowserMCP.

### MVP Scope (v2.0.0 - Phase 2 Complete)
1. ✅ Chrome extension with console capture via chrome.devtools APIs
2. ✅ WebSocket client in extension (connects to CLI)
3. ✅ WebSocket server in CLI (receives extension messages)
4. ✅ Advanced object serialization (Maps, Sets, Promises, circular refs, DOM)
5. ✅ Message queuing (1000 messages)
6. ✅ Ping/pong keep-alive
7. ✅ Auto-reconnect with exponential backoff
8. ✅ DevTools panel UI
9. ✅ 100% v1 backward compatibility (Puppeteer mode still works)
10. ✅ 211/211 core tests passing (100%)

### Phase 3 - In Progress (Chrome Web Store Publication)
- 🚧 Subtask 3.1: Chrome Web Store preparation (manifest, privacy policy, listing content) - Documentation complete
- ⏳ Subtask 3.2: User documentation (installation guide, usage tutorial, troubleshooting)
- ⏳ Subtask 3.3: Video tutorials
- ⏳ Subtask 3.4: Performance testing with Playwright/BrowserMCP
- ⏳ Subtask 3.5: Beta testing program
- ⏳ Subtask 3.6: Migration guide v1 → v2

---

## Version History

**v1.0.0 (October 5, 2025) - "Unified Terminal"**
- Zero-configuration console capture
- All 18 console methods supported
- Unified terminal output feature
- Cross-platform support (Windows, macOS, Linux)
- 96.68% test coverage
- Comprehensive documentation
- **Limitation:** Puppeteer-controlled browser only

**v2.0.0-beta (October 8, 2025) - "Extension Mode"**
- 🎉 Chrome Extension support (monitor personal Chrome browser)
- 🎉 WebSocket Protocol v1.0.0 (extension ↔ CLI)
- 🎉 Advanced serialization (Maps, Sets, Promises, DOM elements)
- 🎉 Message queuing, ping/pong, auto-reconnect
- 🎉 DevTools panel UI
- ✅ 100% v1 backward compatibility (Puppeteer mode preserved)
- ✅ 211/211 core tests passing (100%)
- 🚧 Phase 3: Chrome Web Store publication in progress

**v2.0.0 (Planned - After Chrome Web Store Approval)**
- Chrome Web Store publication
- User documentation complete
- Video tutorials
- Beta testing complete
- Performance testing complete

---

**Document Status:** Living Document (Updated for v2.0.0)
**Last Updated:** October 8, 2025
**Location:** `.claude/PRD.md`

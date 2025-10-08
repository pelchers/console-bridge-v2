# Console Bridge Implementation Plan

Multi-phase development plan for Console Bridge features and improvements.

## Table of Contents
- [Completed Phases](#completed-phases)
- [Future Phases](#future-phases)

---

## Completed Phases

### Phase 1: Core Infrastructure ✅
**Status:** COMPLETE

**Scope:**
- Basic CLI setup with Commander.js
- BridgeManager orchestration
- BrowserPool for browser lifecycle
- LogCapturer with Puppeteer integration
- Basic log formatting

**Deliverables:**
- ✅ `bin/console-bridge.js` - CLI entry point
- ✅ `src/core/BridgeManager.js` - Central orchestrator
- ✅ `src/core/BrowserPool.js` - Browser management
- ✅ `src/core/LogCapturer.js` - Console event capture
- ✅ `src/formatters/LogFormatter.js` - Basic formatting

---

### Phase 2: Console Type Support ✅
**Status:** COMPLETE

**Scope:**
- Support for all 18 Chrome DevTools console types
- Stateful console method tracking (count, time, group)
- Advanced formatting (tables, traces, assertions)
- Color-coded output

**Deliverables:**
- ✅ Support for: log, info, warning, error, debug
- ✅ Support for: table, dir, dirxml, trace, clear
- ✅ Support for: startGroup, startGroupCollapsed, endGroup
- ✅ Support for: assert, profile, profileEnd, count, timeEnd
- ✅ ASCII table rendering for console.table()
- ✅ Stateful counters Map for console.count()
- ✅ Stateful timers Map for console.time/timeEnd()
- ✅ Group depth tracking for indentation

**Bug Fixes:**
- ✅ Fixed 'warn' vs 'warning' type mismatch

---

### Phase 3: React Fast Refresh Fix ✅
**Status:** COMPLETE

**Scope:**
- Fix console capture breaking after React Fast Refresh
- Handle SPA navigation and hot module replacement
- Ensure continuous capture across page context changes

**Deliverables:**
- ✅ `framenavigated` event listener in LogCapturer
- ✅ Automatic re-attachment of console handlers
- ✅ Support for React, Next.js, and other HMR frameworks

**Bug Fixes:**
- ✅ Fixed listeners staying on old page context
- ✅ Fixed button clicks not captured after refresh
- ✅ Fixed periodic logs going out of sync

---

### Phase 4: Testing & Documentation ✅
**Status:** COMPLETE

**Scope:**
- Comprehensive unit tests
- Integration tests
- User documentation
- Manual smoke testing setup

**Deliverables:**
- ✅ 193 passing unit/integration tests
- ✅ Portfolio test app (Next.js 15.5.4 on port 3847)
- ✅ Getting Started Guide
- ✅ Advanced Usage Guide
- ✅ Troubleshooting Guide
- ✅ Architecture Documentation
- ✅ Testing Guide
- ✅ AI Context File

**Test Coverage:**
- ✅ Core functionality (BridgeManager, BrowserPool, LogCapturer)
- ✅ All 18 console types
- ✅ Log filtering
- ✅ Multiple URL monitoring
- ✅ Error handling

---

---

## v2.0.0 Phases (Extension Mode)

### Phase 2: Extension Mode Core Implementation ✅
**Status:** COMPLETE (October 8, 2025)

**Scope:**
- Chrome extension with console capture
- Advanced object serialization (Maps, Sets, Promises, circular refs, DOM)
- WebSocket Protocol v1.0.0 (extension ↔ CLI)
- Message queuing, ping/pong, auto-reconnect
- DevTools panel UI
- 100% v1 backward compatibility

**Subtasks:**

#### Subtask 2.1: Console Capture System ✅
**Deliverables:**
- ✅ `chrome-extension-poc/manifest.json` - Extension manifest V3
- ✅ `chrome-extension-poc/background.js` - WebSocket client service worker
- ✅ `chrome-extension-poc/devtools/devtools.js` - DevTools panel entry
- ✅ `chrome-extension-poc/devtools/panel.html` - Panel UI
- ✅ `chrome-extension-poc/devtools/panel.js` - Console capture logic
- ✅ Basic console interception (log, info, warn, error, debug)
- ✅ Message envelope protocol (type, timestamp, data)

#### Subtask 2.2: Advanced Serialization ✅
**Deliverables:**
- ✅ `chrome-extension-poc/serializer.js` - Advanced object serialization
- ✅ Support for Maps, Sets, Promises, Symbols, BigInt
- ✅ Circular reference detection
- ✅ DOM element serialization
- ✅ Test page: `test-advanced-serialization.html`
- ✅ 100% test coverage for all edge cases

#### Subtask 2.3: WebSocket Client (Extension) ✅
**Deliverables:**
- ✅ WebSocket client in `background.js`
- ✅ Message queuing (1000 messages max)
- ✅ Ping/pong keep-alive (30s interval, 5s timeout)
- ✅ Auto-reconnect with exponential backoff (1s → 16s, max 5 attempts)
- ✅ Connection status tracking
- ✅ DevTools panel connection UI

#### Subtask 2.4: WebSocket Server (CLI) ✅
**Deliverables:**
- ✅ `src/core/WebSocketServer.js` - WebSocket server class
- ✅ Localhost-only binding (security)
- ✅ Welcome message protocol
- ✅ Ping/pong server-side
- ✅ `--extension-mode` CLI flag
- ✅ Integration with LogFormatter (reuse v1 formatting)
- ✅ 25 new unit tests (211 total, 100% passing)

**Testing:**
- ✅ 25 new WebSocketServer unit tests
- ✅ All 186 v1 tests still passing (100% v1 compatibility)
- ✅ Manual E2E testing (extension + CLI)
- ✅ Test coverage: 211/211 tests passing (100%)

**Bug Fixes:**
- ✅ Fixed WebSocket server port conflict handling
- ✅ Fixed message queuing overflow
- ✅ Fixed serialization of nested Maps/Sets

---

### Phase 3: Chrome Web Store Publication & Documentation 🚧
**Status:** IN PROGRESS

**Scope:**
- Chrome Web Store preparation
- User documentation
- Video tutorials
- Performance testing with Playwright/BrowserMCP
- Beta testing program
- Migration guide v1 → v2

**Subtasks:**

#### Subtask 3.1: Chrome Web Store Preparation 🚧
**Status:** Documentation Complete, Submission Pending
**Deliverables:**
- ✅ manifest.json updated for Web Store requirements
- ✅ Privacy policy documentation
- ✅ Store listing content (title, description, screenshots)
- ⏳ Official icons (pending design)
- ⏳ Promotional images (1280x800, 640x400)
- ⏳ Web Store submission

#### Subtask 3.2: User Documentation ⏳
**Status:** PLANNED
**Deliverables:**
- ⏳ Installation guide (extension + CLI)
- ⏳ Usage tutorial (basic + advanced)
- ⏳ Troubleshooting guide
- ⏳ FAQ section
- ⏳ Update README.md with extension mode
- ⏳ Update docs/USAGE.md

#### Subtask 3.3: Video Tutorials ⏳
**Status:** PLANNED
**Deliverables:**
- ⏳ Quick start video (2-3 minutes)
- ⏳ Advanced features video (5-7 minutes)
- ⏳ Comparison: Puppeteer mode vs Extension mode

#### Subtask 3.4: Performance Testing ⏳
**Status:** PLANNED
**Deliverables:**
- ⏳ Playwright MCP E2E tests for extension
- ⏳ BrowserMCP Chrome-specific automation tests
- ⏳ Load testing (high-volume logging)
- ⏳ Memory leak detection
- ⏳ Latency benchmarks

**Testing Tools (v2 ADDS 2 new tools):**
- **v1 Tools (Preserved):**
  - Jest (211 tests)
  - Puppeteer (v1 Puppeteer mode integration tests)
- **v2 ADDS:**
  - Playwright MCP (extension E2E, cross-browser)
  - BrowserMCP (Chrome DevTools panel, visual testing)

#### Subtask 3.5: Beta Testing Program ⏳
**Status:** PLANNED
**Deliverables:**
- ⏳ Beta tester recruitment
- ⏳ Feedback collection form
- ⏳ Issue tracking
- ⏳ Beta release notes

#### Subtask 3.6: Migration Guide v1 → v2 ⏳
**Status:** PLANNED
**Deliverables:**
- ⏳ Breaking changes documentation (none expected)
- ⏳ Feature comparison table
- ⏳ Migration examples
- ⏳ When to use Puppeteer vs Extension mode

---

## Future Phases

### Phase 4: Firefox & Safari Extension Support 🚧
**Status:** PLANNED

**Scope:**
- Firefox WebExtensions API port
- Safari extension port
- Cross-browser extension testing
- Unified extension codebase

---

### Phase 5: Unified Terminal Output 🚧
**Status:** BACKLOG (v1 Feature - May Revisit)

**Problem Statement:**
Currently, Console Bridge requires a separate terminal from the dev server, forcing users to switch between terminals. This adds friction to the development workflow.

**Goals:**
1. Allow Console Bridge logs to stream to the **same terminal** as the dev server
2. Support both headless and headful modes with unified output
3. Provide seamless integration without breaking existing separate terminal workflow

**Proposed Solution:**

#### New CLI Flags
```bash
# Option 3: Headless + Unified Terminal
console-bridge start localhost:3847 --merge-output

# Option 4: Headful + Unified Terminal
console-bridge start localhost:3847 --no-headless --merge-output
```

#### Implementation Requirements

**1. Process Discovery**
- Detect running dev server process
- Find associated terminal/TTY
- Handle multiple dev servers gracefully

**2. Output Stream Redirection**
- Redirect Console Bridge output to dev server's stdout
- Maintain color/formatting
- Preserve existing terminal output behavior as default

**3. Graceful Degradation**
- Fallback to separate terminal if process discovery fails
- Warn user if `--merge-output` cannot attach
- Continue functioning normally

**4. Lifecycle Management**
- Detach gracefully when dev server stops
- Handle dev server restart
- Clean up streams on Console Bridge exit

#### Technical Approach

**Option A: Process Attachment (Recommended)**
```javascript
// Pseudo-code
class TerminalAttacher {
  findDevServerProcess(port) {
    // Use `lsof -i :3847` (Unix) or `netstat` (Windows)
    // to find process listening on port
  }

  attachToProcess(pid) {
    // Get process stdout
    // Redirect Console Bridge output to same stream
  }
}
```

**Option B: IPC/Socket Communication**
```javascript
// Create Unix socket or named pipe
// Dev server writes to socket
// Console Bridge reads from socket and merges output
```

**Option C: NPM Package Integration**
```javascript
// Provide `console-bridge` as npm package
// Dev server imports and uses programmatically
// Output naturally unified since same process
```

#### Files to Create/Modify

**New Files:**
- `src/core/TerminalAttacher.js` - Process discovery and attachment
- `src/utils/processUtils.js` - Process utilities (lsof, netstat wrappers)
- `tests/unit/TerminalAttacher.test.js` - Unit tests
- `tests/integration/unified-output.test.js` - Integration tests

**Modified Files:**
- `bin/console-bridge.js` - Add `--merge-output` flag
- `src/core/BridgeManager.js` - Accept output redirection config
- `docs/guides/advanced-usage.md` - Document new options
- `docs/architecture/system-overview.md` - Update architecture diagrams

#### Testing Strategy

**Unit Tests:**
- Process discovery on various platforms (Unix, Windows)
- Stream redirection logic
- Graceful fallback behavior
- Cleanup on exit

**Integration Tests:**
- Start dev server + Console Bridge with `--merge-output`
- Verify logs appear in unified terminal
- Test dev server restart
- Test Console Bridge restart
- Test graceful degradation

**Manual Tests:**
- React dev server (port 3000)
- Next.js dev server (port 3000)
- Vite dev server (port 5173)
- Custom Express server
- Multiple concurrent dev servers

#### Edge Cases to Handle

1. **Multiple dev servers on same port** (different interfaces)
   - Solution: Prompt user to specify which process

2. **Dev server running in Docker**
   - Solution: Document limitation or implement Docker-aware discovery

3. **Permission issues** (accessing other process streams)
   - Solution: Graceful fallback with warning

4. **Windows vs Unix differences** (process management)
   - Solution: Platform-specific implementations

5. **Terminal emulator compatibility**
   - Solution: Test with common emulators (iTerm, Hyper, Windows Terminal, etc.)

#### Success Criteria

- ✅ Logs appear in dev server terminal when `--merge-output` used
- ✅ Works in both headless and headful modes
- ✅ Graceful fallback when attachment fails
- ✅ No breaking changes to existing CLI
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ Documented in user guides
- ✅ 90%+ test coverage for new code

#### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Process discovery fails on certain platforms | High | Graceful fallback + clear error messages |
| Permission denied accessing process streams | Medium | Document sudo requirements or alternative approaches |
| Stream redirection breaks terminal formatting | Medium | Extensive testing across terminals |
| Dev server framework incompatibility | Low | Framework-agnostic process discovery |

#### Timeline Estimate

- **Research & Design:** 2-3 days
- **Implementation:** 5-7 days
- **Testing:** 3-4 days
- **Documentation:** 1-2 days
- **Total:** 11-16 days

#### Dependencies

- `lsof` (Unix) or `netstat` (Windows) for port-to-process mapping
- Node.js `process` module for stream manipulation
- Platform detection (`os` module)

#### Future Enhancements (Post-Phase 5)

- Auto-detect dev server and attach without `--merge-output` flag
- GUI dashboard option (Electron app showing logs)
- Browser extension for in-browser log viewing
- Remote monitoring (monitor localhost from different machine)

---

### Phase 6: Advanced Log Serialization 🚧
**Status:** PLANNED

**Problem Statement:**
Complex console types (table, dir, dirxml) currently show as `JSHandle@array` or `JSHandle@object` instead of actual data.

**Goals:**
- Improve JSHandle serialization for complex objects
- Full support for DOM nodes (console.dirxml)
- Better error stack trace display
- Circular reference handling

**Proposed Solutions:**
- Enhanced `extractPuppeteerArgs()` with recursive serialization
- Custom CDP evaluators for complex types
- Pretty-printing for large objects

---

### Phase 7: Performance Optimization 🚧
**Status:** PLANNED

**Goals:**
- Reduce memory footprint for long-running sessions
- Optimize log processing for high-volume apps
- Browser instance pooling improvements
- Log buffering and batching

**Proposed Solutions:**
- Stream processing instead of in-memory accumulation
- Configurable log buffer size
- Browser instance reuse across URLs
- Worker threads for log formatting

---

### Phase 8: Distribution & Publishing 🚧
**Status:** PLANNED

**Goals:**
- Publish to npm registry
- Set up CI/CD pipeline
- Automated releases
- Semantic versioning

**Distribution Options:**
1. Public npm package (@yourorg/console-bridge)
2. Private npm registry
3. GitHub Packages
4. Manual .tgz distribution
5. Dual license (free + enterprise)

**Requirements:**
- npm account and organization
- CI/CD pipeline (GitHub Actions)
- Automated testing before publish
- Changelog automation

---

## Version Roadmap

### v1.0.0 (October 5, 2025) - "Unified Terminal"
| Version | Phase | Target Date | Status |
|---------|-------|-------------|--------|
| 0.1.0 | Phase 1 - Core | - | ✅ Complete |
| 0.2.0 | Phase 2 - Console Types | - | ✅ Complete |
| 0.3.0 | Phase 3 - React Fix | - | ✅ Complete |
| 1.0.0 | Phase 4 - Testing & Docs | Oct 5, 2025 | ✅ Complete |

### v2.0.0 (October 8, 2025) - "Extension Mode"
| Version | Phase | Target Date | Status |
|---------|-------|-------------|--------|
| 2.0.0-alpha | Phase 2.1-2.2 - Console Capture & Serialization | Oct 6, 2025 | ✅ Complete |
| 2.0.0-beta | Phase 2.3-2.4 - WebSocket Protocol | Oct 7, 2025 | ✅ Complete |
| 2.0.0 | Phase 3 - Chrome Web Store & Documentation | TBD | 🚧 In Progress |

### Future Versions
| Version | Phase | Target Date | Status |
|---------|-------|-------------|--------|
| 2.1.0 | Phase 4 - Firefox/Safari Extensions | Q1 2026 | 🚧 Planned |
| 2.2.0 | Performance & Optimization | TBD | 🚧 Planned |
| 3.0.0 | Advanced Features (Remote Debugging, etc.) | TBD | 🚧 Planned |

---

## Contributing

When implementing a new phase:

1. **Create feature branch**
   ```bash
   git checkout -b phase-5-unified-output
   ```

2. **Update this plan**
   - Move phase from "Future" to "In Progress"
   - Update status and dates

3. **Implement with tests**
   - Write tests first (TDD approach)
   - Implement feature
   - Ensure tests pass

4. **Update documentation**
   - Update user guides
   - Update architecture docs
   - Add examples

5. **Submit for review**
   - Create detailed PR description
   - Reference this plan
   - Include test results

6. **Merge and update plan**
   - Mark phase as complete
   - Update version roadmap
   - Plan next phase

---

## Questions or Suggestions?

Open an issue or discussion to propose new phases or modifications to this plan.

# Console Bridge v2.0.0 - Implementation Plan

**Version:** 2.0.0 "Browser Extension"
**Created:** October 6, 2025
**Status:** Planning
**Target Release:** Q1 2026

---

## Executive Summary

Console Bridge v2.0.0 transforms the tool from a Puppeteer-only automation utility into a universal development companion by introducing browser extension support. This allows developers to use their preferred browsers (Chrome, Firefox, Safari) while monitoring console output in their terminal.

**Key Changes:**
- Browser extension for Chrome (primary), Firefox (secondary), Safari (optional)
- WebSocket-based communication between extension and CLI tool
- Dual-mode operation: Extension Mode (new) + Puppeteer Mode (existing)
- Zero breaking changes - fully backward compatible with v1.0.0

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Architecture](#architecture)
- [Implementation Phases](#implementation-phases)
- [Sprint Breakdown](#sprint-breakdown)
- [Technical Specifications](#technical-specifications)
- [Testing Strategy](#testing-strategy)
- [Risks and Mitigations](#risks-and-mitigations)
- [Success Criteria](#success-criteria)

---

## Problem Statement

### v1.0.0 Limitation

Console Bridge v1.0.0 can ONLY monitor Puppeteer-controlled Chromium browsers. It CANNOT monitor:
- User's personal Chrome browser
- Firefox, Safari, Edge
- Any browser instance not launched by Puppeteer

### Impact

**Broken User Story:**
```
Developer wants to:
1. Start Console Bridge in headless mode (background)
2. Use THEIR Chrome browser to test localhost:3000
3. See console logs from THEIR Chrome in the terminal
4. Allow AI agent to monitor console without MCPs

Current Reality:
❌ Console Bridge only sees Puppeteer browser (not user's Chrome)
❌ User must use Puppeteer headful mode (separate browser window)
❌ Can't use Chrome with extensions (React DevTools, etc.)
```

### Solution Required

Enable Console Bridge to monitor ANY browser the developer uses, not just Puppeteer.

---

## Solution Overview

### Browser Extension Approach

**How it works:**
1. Developer installs Console Bridge extension in their browser (Chrome/Firefox/Safari)
2. Extension captures console events using browser DevTools API
3. Extension sends logs to Console Bridge CLI via WebSocket
4. Console Bridge formats and displays logs in terminal
5. Developer uses their actual browser naturally

**Benefits:**
- ✅ Works with developer's preferred browser
- ✅ Browser extensions already installed (React DevTools, etc.)
- ✅ Natural workflow (no Puppeteer window)
- ✅ Cross-browser support (Chrome, Firefox, Safari)
- ✅ Multi-tab support (monitor multiple tabs simultaneously)

---

## Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Developer's Browser                   │
│                    (Chrome/Firefox/Safari)               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │        Console Bridge Extension                    │ │
│  │                                                    │ │
│  │  Components:                                       │ │
│  │  ├─ Background Script (service worker)            │ │
│  │  ├─ DevTools Panel (UI)                           │ │
│  │  ├─ Content Script (injected into pages)          │ │
│  │  ├─ Console Capture Layer                         │ │
│  │  └─ WebSocket Client                              │ │
│  │                                                    │ │
│  │  Flow:                                             │ │
│  │  1. DevTools API captures console events          │ │
│  │  2. Background script serializes event data        │ │
│  │  3. WebSocket client sends to CLI                 │ │
│  │  4. UI shows connection status                    │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
└───────────────────┼──────────────────────────────────────┘
                    │
                    │ WebSocket Connection
                    │ ws://localhost:9223
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│              Console Bridge CLI (Terminal)               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  New: WebSocket Server (--extension-mode)          │ │
│  │                                                    │ │
│  │  Components:                                       │ │
│  │  ├─ WebSocket Server (ws library)                 │ │
│  │  ├─ Connection Manager (multi-client)             │ │
│  │  ├─ Message Parser                                │ │
│  │  ├─ Log Aggregator (from multiple tabs/browsers) │ │
│  │  └─ Session Manager                               │ │
│  │                                                    │ │
│  │  Flow:                                             │ │
│  │  1. Accept WebSocket connections                  │ │
│  │  2. Parse incoming log messages                   │ │
│  │  3. Aggregate logs from multiple sources          │ │
│  │  4. Pass to LogFormatter (existing)               │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│                   ▼                                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Existing: LogFormatter + Terminal Output          │ │
│  │                                                    │ │
│  │  - Format logs for terminal                       │ │
│  │  - Color coding by log type                       │ │
│  │  - Timestamp formatting                            │ │
│  │  - Source labeling ([Chrome Tab 1], [Firefox])    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Existing: Puppeteer Mode (v1.0.0)                 │ │
│  │                                                    │ │
│  │  - Falls back when no extension connected          │ │
│  │  - Can run simultaneously with extension mode     │ │
│  │  - Unchanged from v1.0.0                           │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Browser Extension:**
- Capture console events via `chrome.devtools.network` or inspectedWindow
- Serialize complex objects (handle circular references)
- Manage WebSocket connection to CLI
- Show connection status in DevTools panel
- Handle multi-tab scenarios

**WebSocket Server (CLI):**
- Accept connections from multiple extensions/tabs
- Parse and validate incoming messages
- Aggregate logs from multiple sources
- Maintain connection state
- Handle disconnections gracefully

**LogFormatter (existing):**
- Format extension logs same as Puppeteer logs
- Add source labels ([Chrome], [Firefox], [Tab 1], etc.)
- Preserve all existing formatting features

---

## Implementation Phases

### Phase 1: Architecture & Planning (Sprint 1)
**Duration:** 1 sprint (2 weeks)

**Goals:**
- Finalize architecture decisions
- Research browser extension APIs
- Design WebSocket protocol
- Create technical specifications
- Set up development environment

**Deliverables:**
1. ✅ Architecture design document
2. ✅ WebSocket message protocol specification
3. ✅ Extension manifest v3 structure
4. ✅ Development environment setup guide
5. ✅ Risk assessment and mitigation plan

---

### Phase 2: Chrome Extension MVP (Sprint 2-3)
**Duration:** 2 sprints (4 weeks)

**Goals:**
- Build Chrome extension with core functionality
- Implement console capture using DevTools API
- Create WebSocket client in extension
- Build DevTools panel UI

**Deliverables:**
1. Chrome extension with manifest v3
2. Console event capture for all 18 console methods
3. WebSocket client with connection management
4. DevTools panel showing connection status
5. Object serialization (handle circular refs)
6. Chrome Web Store submission

---

### Phase 3: CLI WebSocket Server (Sprint 3-4)
**Duration:** 2 sprints (4 weeks)

**Goals:**
- Implement WebSocket server in CLI
- Add `--extension-mode` flag
- Create connection manager
- Implement log aggregation

**Deliverables:**
1. WebSocket server using `ws` library
2. `--extension-mode` CLI flag
3. Multi-client connection manager
4. Message parser and validator
5. Log aggregation from multiple tabs
6. Graceful fallback to Puppeteer mode

---

### Phase 4: Firefox Extension (Sprint 5)
**Duration:** 1 sprint (2 weeks)

**Goals:**
- Port Chrome extension to Firefox
- Handle Firefox-specific API differences
- Submit to Firefox Add-ons store

**Deliverables:**
1. Firefox extension using WebExtensions API
2. Compatibility layer for browser APIs
3. Firefox Add-ons store submission
4. Cross-browser testing

---

### Phase 5: Testing & Documentation (Sprint 6)
**Duration:** 1 sprint (2 weeks)

**Goals:**
- Comprehensive testing across browsers
- Write user documentation
- Create video tutorials
- Beta testing with real users

**Deliverables:**
1. Test suite for extension mode
2. User guide for extension installation
3. Extension mode vs. Puppeteer mode comparison doc
4. Video tutorials (YouTube)
5. Migration guide from v1.0.0 to v2.0.0

---

### Phase 6: Safari Extension (Sprint 7) - Optional
**Duration:** 1 sprint (2 weeks)

**Goals:**
- Create Safari extension (if user demand exists)
- Submit to Safari Extension Gallery

**Deliverables:**
1. Safari extension
2. Safari Extension Gallery submission
3. macOS/iOS testing

---

## Sprint Breakdown

### Sprint 1: Architecture & Planning

**Week 1:**
- Research Chrome DevTools API (`chrome.devtools.network`, `chrome.devtools.inspectedWindow`)
- Research Firefox WebExtensions API
- Design WebSocket message protocol
- Define extension manifest structure

**Week 2:**
- Create technical specifications
- Set up extension development environment
- Create proof-of-concept WebSocket connection
- Risk assessment

**Acceptance Criteria:**
- [ ] Chrome DevTools API proof-of-concept
- [ ] WebSocket protocol documented
- [ ] Extension manifest v3 structure defined
- [ ] Development environment documented

---

### Sprint 2: Chrome Extension - Core Functionality

**Week 1:**
- Create extension file structure
- Implement manifest v3 configuration
- Create background service worker
- Implement DevTools panel

**Week 2:**
- Implement console event capture
- Create object serialization logic
- Handle circular references
- Basic WebSocket client

**Acceptance Criteria:**
- [ ] Extension loads in Chrome DevTools
- [ ] Can capture `console.log()` events
- [ ] DevTools panel displays basic info
- [ ] WebSocket client connects to localhost

**Files Created:**
```
chrome-extension/
├── manifest.json
├── background.js (service worker)
├── devtools.html
├── devtools.js
├── panel.html
├── panel.js
├── content.js (if needed)
└── websocket-client.js
```

---

### Sprint 3: Chrome Extension - Complete Implementation

**Week 1:**
- Implement all 18 console method captures
- Add connection status UI
- Implement reconnection logic
- Handle multi-tab scenarios

**Week 2:**
- Error handling and edge cases
- Performance optimization
- Prepare Chrome Web Store submission
- Create store listing assets

**Acceptance Criteria:**
- [ ] All 18 console methods captured
- [ ] Connection status shown in panel
- [ ] Auto-reconnects on disconnect
- [ ] Works with multiple tabs
- [ ] Chrome Web Store submission complete

**Testing:**
- Test with portfolio-test application
- Test with React DevTools installed
- Test with multiple tabs open
- Test reconnection scenarios

---

### Sprint 4: CLI WebSocket Server

**Week 1:**
- Install and configure `ws` library
- Create WebSocket server class
- Implement connection manager
- Add `--extension-mode` flag to CLI

**Week 2:**
- Implement message parser
- Create log aggregator
- Add source labeling ([Chrome], [Tab 1])
- Implement graceful fallback

**Acceptance Criteria:**
- [ ] `console-bridge start --extension-mode` starts WebSocket server
- [ ] Accepts connections from Chrome extension
- [ ] Parses log messages correctly
- [ ] Aggregates logs from multiple tabs
- [ ] Falls back to Puppeteer if no extension

**Files Modified:**
```
src/
├── core/
│   ├── BridgeManager.js (add extension mode)
│   ├── WebSocketServer.js (new)
│   ├── ConnectionManager.js (new)
│   └── MessageParser.js (new)
├── utils/
│   └── validation.js (add message validation)
└── bin/
    └── console-bridge.js (add --extension-mode flag)
```

---

### Sprint 5: Firefox Extension

**Week 1:**
- Port Chrome extension to Firefox
- Handle API differences (browser.* vs chrome.*)
- Test with Firefox Developer Edition

**Week 2:**
- Firefox Add-ons store submission
- Cross-browser compatibility testing
- Documentation updates

**Acceptance Criteria:**
- [ ] Firefox extension works identically to Chrome
- [ ] Firefox Add-ons submission complete
- [ ] Cross-browser tests passing

---

### Sprint 6: Testing & Documentation

**Week 1:**
- Comprehensive testing (Chrome + Firefox)
- Write user installation guide
- Create comparison doc (Extension vs Puppeteer)

**Week 2:**
- Record video tutorials
- Beta testing with real developers
- Bug fixes from beta testing

**Acceptance Criteria:**
- [ ] All tests passing (Chrome + Firefox)
- [ ] User guide published
- [ ] Video tutorial on YouTube
- [ ] 10+ beta testers validated functionality

---

### Sprint 7: Safari Extension (Optional)

**Week 1:**
- Research Safari Extension APIs
- Port extension to Safari
- Test on macOS

**Week 2:**
- Safari Extension Gallery submission
- iOS testing (if applicable)

**Acceptance Criteria:**
- [ ] Safari extension works on macOS
- [ ] Safari Extension Gallery submission complete

---

## Technical Specifications

### WebSocket Message Protocol

**Extension → CLI (Log Message):**
```json
{
  "version": "2.0",
  "type": "console",
  "method": "log",
  "args": [
    "Button clicked!",
    {
      "count": 1,
      "timestamp": "2025-10-06T14:32:15.123Z"
    }
  ],
  "timestamp": 1728226335123,
  "location": {
    "url": "http://localhost:3847",
    "lineNumber": 42,
    "columnNumber": 12,
    "filename": "App.jsx",
    "functionName": "handleClick"
  },
  "tabId": "chrome-tab-abc123",
  "browser": "chrome",
  "browserVersion": "118.0.5993.117",
  "extensionVersion": "2.0.0"
}
```

**CLI → Extension (Acknowledgment):**
```json
{
  "type": "ack",
  "messageId": "msg-abc123",
  "status": "received",
  "timestamp": 1728226335125
}
```

**Extension → CLI (Connection):**
```json
{
  "type": "connect",
  "browser": "chrome",
  "browserVersion": "118.0.5993.117",
  "extensionVersion": "2.0.0",
  "tabId": "chrome-tab-abc123",
  "tabUrl": "http://localhost:3847",
  "timestamp": 1728226335000
}
```

**CLI → Extension (Welcome):**
```json
{
  "type": "welcome",
  "serverId": "console-bridge-server-xyz",
  "serverVersion": "2.0.0",
  "message": "Connected to Console Bridge v2.0.0",
  "timestamp": 1728226335001
}
```

**Heartbeat (bidirectional):**
```json
{
  "type": "ping"
}
```

```json
{
  "type": "pong"
}
```

---

### Chrome Extension Manifest v3

```json
{
  "manifest_version": 3,
  "name": "Console Bridge",
  "version": "2.0.0",
  "description": "Bridge browser console output to your terminal",
  "permissions": [
    "devtools"
  ],
  "host_permissions": [
    "http://localhost/*",
    "http://127.0.0.1/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "devtools_page": "devtools.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

---

### CLI Flag Additions

**New Flags:**

```bash
--extension-mode         # Start WebSocket server for extension connections
--extension-port <port>  # WebSocket server port (default: 9223)
--extension-only         # Disable Puppeteer fallback
```

**Example Usage:**

```bash
# Extension mode + Puppeteer fallback
console-bridge start localhost:3000 --extension-mode

# Extension mode only (no Puppeteer)
console-bridge start localhost:3000 --extension-mode --extension-only

# Custom WebSocket port
console-bridge start localhost:3000 --extension-mode --extension-port 9000

# Extension mode + unified output
console-bridge start localhost:3000 --extension-mode --merge-output
```

---

### Object Serialization Strategy

**Challenge:** Console arguments can include:
- Circular references
- DOM elements
- Functions
- Symbols
- Large nested objects

**Solution:**

```javascript
// In extension background.js
function serializeConsoleArgs(args) {
  return args.map(arg => {
    try {
      // Handle primitives
      if (typeof arg !== 'object' || arg === null) {
        return arg;
      }

      // Handle DOM elements
      if (arg instanceof Element) {
        return {
          __type: 'DOMElement',
          tagName: arg.tagName,
          id: arg.id,
          className: arg.className,
          outerHTML: arg.outerHTML.substring(0, 500) // Truncate
        };
      }

      // Handle functions
      if (typeof arg === 'function') {
        return {
          __type: 'Function',
          name: arg.name,
          source: arg.toString().substring(0, 200)
        };
      }

      // Handle circular references with WeakSet
      const seen = new WeakSet();
      return JSON.parse(JSON.stringify(arg, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }));

    } catch (error) {
      return {
        __type: 'Error',
        message: `Failed to serialize: ${error.message}`
      };
    }
  });
}
```

---

## Testing Strategy

### Unit Tests

**Extension:**
- WebSocket client connection/disconnection
- Message serialization
- Console event capture
- Error handling

**CLI:**
- WebSocket server creation
- Connection manager
- Message parsing
- Log aggregation

### Integration Tests

**End-to-End Scenarios:**
1. Extension connects → CLI receives connection
2. Console.log() in browser → appears in terminal
3. Multiple tabs → logs aggregated correctly
4. Extension disconnects → CLI handles gracefully
5. Extension reconnects → resumes logging

**Test with Real Apps:**
- portfolio-test (Next.js)
- Vite app
- Create React App
- Plain HTML/JS

### Browser Compatibility Tests

**Chrome:**
- Latest stable
- Chrome Beta
- Chrome Dev
- Chromium

**Firefox:**
- Latest stable
- Firefox Developer Edition
- Firefox ESR

**Safari (if implemented):**
- Safari 16+
- Safari Technology Preview

---

## Risks and Mitigations

### Risk 1: Chrome Web Store Approval Delays

**Impact:** High
**Probability:** Medium

**Mitigation:**
- Submit early in Sprint 2
- Follow all Chrome Web Store policies
- Prepare detailed privacy policy
- Have backup plan for sideloading during beta

---

### Risk 2: WebSocket Connection Instability

**Impact:** High
**Probability:** Medium

**Mitigation:**
- Implement robust reconnection logic
- Heartbeat pings every 30 seconds
- Exponential backoff on reconnect
- Queue messages during disconnect

---

### Risk 3: Extension Performance Impact

**Impact:** Medium
**Probability:** Medium

**Mitigation:**
- Batch messages (send every 100ms)
- Throttle high-frequency logs
- Optimize serialization
- Allow user to disable capture

---

### Risk 4: Cross-Browser API Differences

**Impact:** Medium
**Probability:** Low

**Mitigation:**
- Use WebExtensions polyfill
- Abstract browser-specific code
- Comprehensive cross-browser testing

---

### Risk 5: User Adoption

**Impact:** Medium
**Probability:** Low

**Mitigation:**
- Clear migration guide
- Video tutorials
- Maintain v1.0.0 Puppeteer mode
- Beta program with early adopters

---

## Success Criteria

### Must Have (v2.0.0 Release Blocker)

1. ✅ Chrome extension published on Chrome Web Store
2. ✅ Extension mode (`--extension-mode`) working
3. ✅ All 18 console methods captured via extension
4. ✅ WebSocket connection stable
5. ✅ Multi-tab support
6. ✅ Backward compatible with v1.0.0 Puppeteer mode
7. ✅ Documentation complete

### Should Have (v2.1.0)

1. Firefox extension published
2. Graceful reconnection on disconnect
3. Connection status UI in extension
4. Performance optimizations

### Nice to Have (v2.2.0)

1. Safari extension
2. Extension settings panel
3. Log filtering in extension
4. Visual console replay

---

## Dependencies

**NPM Packages:**
- `ws` - WebSocket server (v8.x)
- Existing dependencies from v1.0.0

**Development Tools:**
- Chrome DevTools
- Firefox Developer Edition
- Chrome Web Store Developer account
- Firefox Add-ons Developer account

**Documentation Tools:**
- Screen recording software for tutorials
- Markdown editors
- Diagram tools (for architecture docs)

---

## Timeline

**Sprint 1 (Architecture):** Week 1-2
**Sprint 2 (Chrome Extension Core):** Week 3-4
**Sprint 3 (Chrome Extension Complete):** Week 5-6
**Sprint 4 (CLI WebSocket Server):** Week 7-8
**Sprint 5 (Firefox Extension):** Week 9-10
**Sprint 6 (Testing & Docs):** Week 11-12
**Sprint 7 (Safari Extension - Optional):** Week 13-14

**Total Duration:** 12-14 weeks (3-3.5 months)

**Target Release:** Q1 2026

---

## Post-Release

### v2.0.1 (Patch)
- Bug fixes from initial release
- Performance improvements
- Documentation clarifications

### v2.1.0 (Minor)
- Firefox extension improvements
- Additional CLI flags
- Enhanced error messages

### v2.2.0 (Minor)
- Safari extension
- Extension settings panel
- Advanced filtering

---

## Appendix

### File Structure for v2.0.0

```
console-bridge-c-s-4.5/
├── chrome-extension/
│   ├── manifest.json
│   ├── background.js
│   ├── devtools.html
│   ├── devtools.js
│   ├── panel.html
│   ├── panel.js
│   ├── websocket-client.js
│   ├── serializer.js
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── firefox-extension/
│   └── (similar structure to chrome-extension)
├── src/
│   ├── core/
│   │   ├── BridgeManager.js (updated)
│   │   ├── WebSocketServer.js (new)
│   │   ├── ConnectionManager.js (new)
│   │   └── MessageParser.js (new)
│   └── (existing files unchanged)
├── test/
│   ├── extension/
│   │   ├── websocket-client.test.js
│   │   └── serializer.test.js
│   └── unit/
│       ├── WebSocketServer.test.js
│       ├── ConnectionManager.test.js
│       └── MessageParser.test.js
└── docs/
    ├── extension-mode.md
    ├── extension-installation.md
    └── migration-guide-v2.md
```

---

**Document Version:** 1.0
**Last Updated:** October 6, 2025
**Status:** ✅ Ready for Implementation
**Next Review:** Sprint 1 Kickoff

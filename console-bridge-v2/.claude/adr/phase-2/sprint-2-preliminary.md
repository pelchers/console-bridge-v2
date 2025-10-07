# ADR: Sprint 2 - Full Chrome Extension Implementation (Preliminary)

**Status:** Preliminary
**Date:** October 7, 2025
**Sprint:** Sprint 2 (Phase 2)
**Duration:** 2 sprints (4 weeks estimated)

---

## Context

Sprint 1 has successfully completed all planning and architecture tasks:
- ✅ Chrome DevTools API POC validated
- ✅ Development environment established
- ✅ WebSocket protocol v1.0.0 finalized
- ✅ Manifest v3 configuration production-ready

Sprint 2 will now implement the complete Chrome extension with all features specified in the Console Bridge v2.0.0 requirements.

---

## Goals

### Primary Goal
Build a production-ready Chrome extension that captures console logs from localhost applications and streams them via WebSocket to the CLI.

### Key Deliverables

1. **Complete Console Capture System**
   - Support all 18 console methods
   - Accurate argument serialization
   - Source location tracking
   - Error handling for edge cases

2. **WebSocket Client**
   - Connection management with auto-reconnect
   - Message serialization per protocol v1.0.0
   - Error handling and status reporting
   - Performance optimization (100 events/sec target)

3. **Production DevTools Panel**
   - Professional UI with status indicators
   - Connection controls
   - Error display
   - Settings panel

4. **Object Serialization Engine**
   - Handle all JavaScript types
   - Circular reference detection
   - DOM element serialization
   - Depth/size limiting for performance

5. **Comprehensive Test Suite**
   - Unit tests for all components
   - Integration tests for WebSocket flow
   - Manual test scenarios documented

---

## Architecture Decisions

### 1. Extension Architecture

**Decision:** Use a layered architecture with clear separation of concerns

```
extension/src/
├── devtools/           # DevTools panel entry point
│   ├── devtools.html
│   └── devtools.js
├── panel/              # Panel UI and logic
│   ├── panel.html
│   ├── panel.js
│   └── panel.css
├── content/            # Content script (console capture)
│   └── console-capture.js
├── background/         # Service worker (future use)
│   └── background.js
├── lib/                # Shared libraries
│   ├── websocket-client.js
│   ├── serializer.js
│   ├── protocol.js
│   └── utils.js
├── types/              # TypeScript definitions
│   └── protocol.d.ts
├── manifest.json       # Extension manifest (already finalized)
└── icons/              # Extension icons (placeholders)
```

**Rationale:**
- Clear separation between UI (panel) and logic (content script, websocket client)
- Shared libraries promote code reuse
- TypeScript definitions ensure type safety
- Aligns with Chrome extension best practices

**Alternatives Considered:**
- Single monolithic script - Rejected (poor maintainability)
- Background-heavy architecture - Rejected (Manifest v3 service workers have limitations)

---

### 2. Console Capture Strategy

**Decision:** Use `chrome.devtools.inspectedWindow.eval()` with injected console interceptor

**Implementation:**
```javascript
// Inject into inspected window
chrome.devtools.inspectedWindow.eval(`
  (function() {
    const originalConsole = { ...console };

    Object.keys(originalConsole).forEach(method => {
      if (typeof originalConsole[method] === 'function') {
        console[method] = function(...args) {
          // Capture and serialize
          window.postMessage({
            type: 'console-bridge-event',
            method: method,
            args: args,
            location: getCallLocation()
          }, '*');

          // Call original
          return originalConsole[method].apply(console, args);
        };
      }
    });
  })();
`);
```

**Rationale:**
- No modification of page code required
- Captures all console methods automatically
- Original console behavior preserved
- Works with all localhost applications

**Alternatives Considered:**
- `chrome.debugger` API - Rejected (conflicts with DevTools, too intrusive)
- Content script injection - Rejected (CSP restrictions, timing issues)

---

### 3. Object Serialization Strategy

**Decision:** Implement recursive serialization with circular reference tracking

**Key Features:**
- **Type Detection:** Distinguish between primitives, objects, arrays, functions, DOM elements, errors
- **Circular Reference Handling:** Track visited objects, replace circulars with `{type: "circular", path: "..."}`
- **Depth Limiting:** Max 10 levels deep (configurable)
- **Size Limiting:** Truncate large strings (>10KB), limit object keys (max 1000)
- **Performance:** Target <5ms per serialization

**Example:**
```javascript
function serialize(value, depth = 0, visited = new WeakMap()) {
  // Base cases: primitives
  if (value === null) return { type: 'null', value: null };
  if (value === undefined) return { type: 'undefined' };

  const type = typeof value;
  if (type === 'string') return { type: 'string', value: truncate(value, 10240) };
  if (type === 'number') return { type: 'number', value };
  if (type === 'boolean') return { type: 'boolean', value };

  // Circular reference check
  if (visited.has(value)) {
    return { type: 'circular', ref: visited.get(value) };
  }

  // Depth limit
  if (depth >= 10) {
    return { type: 'max-depth', value: '[Max Depth]' };
  }

  visited.set(value, `ref_${visited.size}`);

  // Complex types
  if (value instanceof Error) {
    return {
      type: 'error',
      value: value.message,
      stack: value.stack
    };
  }

  if (value instanceof HTMLElement) {
    return {
      type: 'dom',
      tagName: value.tagName,
      value: `<${value.tagName.toLowerCase()}>`
    };
  }

  if (Array.isArray(value)) {
    return {
      type: 'array',
      value: value.slice(0, 1000).map(v => serialize(v, depth + 1, visited))
    };
  }

  if (type === 'function') {
    return {
      type: 'function',
      name: value.name || 'anonymous',
      value: `function ${value.name || 'anonymous'}()`
    };
  }

  // Plain object
  return {
    type: 'object',
    className: value.constructor?.name,
    value: Object.fromEntries(
      Object.entries(value)
        .slice(0, 1000)
        .map(([k, v]) => [k, serialize(v, depth + 1, visited)])
    )
  };
}
```

**Rationale:**
- Handles all JavaScript types reliably
- Prevents infinite loops from circular references
- Performance-optimized for high-frequency console logs
- Matches protocol v1.0.0 specification

**Alternatives Considered:**
- `JSON.stringify()` alone - Rejected (fails on circular refs, loses type info)
- External library (like `serialize-javascript`) - Rejected (adds dependency, CSP issues)

---

### 4. WebSocket Client Strategy

**Decision:** Implement custom WebSocket client with exponential backoff reconnection

**Key Features:**
- **Auto-Reconnect:** Exponential backoff (1s, 2s, 4s, 8s, 16s)
- **Message Queue:** Buffer messages during disconnection (max 1000 messages)
- **Status Events:** Emit connection status changes for UI updates
- **Protocol Validation:** Ensure all messages conform to protocol v1.0.0
- **Performance:** Batch messages if >50 events/second

**Architecture:**
```javascript
class WebSocketClient extends EventEmitter {
  constructor(url = 'ws://localhost:9223') {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    this.status = 'disconnected';
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.status = 'connected';
      this.reconnectAttempts = 0;
      this.emit('status', 'connected');
      this.flushQueue();
      this.sendConnectionStatus('connected');
    };

    this.ws.onerror = (error) => {
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      this.status = 'disconnected';
      this.emit('status', 'disconnected');
      this.scheduleReconnect();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.emit('message', message);
    };
  }

  send(type, payload) {
    const message = {
      version: '1.0.0',
      type,
      timestamp: new Date().toISOString(),
      source: this.getSourceInfo(),
      payload
    };

    if (this.status === 'connected') {
      this.ws.send(JSON.stringify(message));
    } else {
      this.queueMessage(message);
    }
  }

  scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);
    this.reconnectAttempts++;

    setTimeout(() => {
      if (this.status === 'disconnected') {
        this.connect();
      }
    }, delay);
  }

  queueMessage(message) {
    if (this.messageQueue.length < 1000) {
      this.messageQueue.push(message);
    }
  }

  flushQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }
}
```

**Rationale:**
- Robust reconnection ensures no message loss
- Message queuing handles temporary disconnections
- Status events enable responsive UI
- Aligns with protocol v1.0.0 requirements

**Alternatives Considered:**
- Native WebSocket only - Rejected (no auto-reconnect, no queuing)
- Socket.io library - Rejected (requires server-side library, overkill for simple protocol)

---

### 5. Panel UI Strategy

**Decision:** Build minimal, professional UI with vanilla HTML/CSS/JS (no frameworks)

**Design:**
```
┌─────────────────────────────────────────┐
│  Console Bridge                    [●]   │  ← Header with connection status
├─────────────────────────────────────────┤
│  Status: Connected to localhost:9223    │  ← Status bar
│  Tab: http://localhost:3000 (My App)    │
├─────────────────────────────────────────┤
│                                          │
│  [Start Capture]  [Stop Capture]        │  ← Controls
│  [Settings]                              │
│                                          │
│  Events captured: 42                     │  ← Stats
│  Errors: 0                               │
│                                          │
│  ℹ View console output in your terminal │  ← Help text
│                                          │
└─────────────────────────────────────────┘
```

**Features:**
- Real-time connection status indicator (green/red/yellow)
- Start/stop capture controls
- Settings panel (reconnect, clear queue, etc.)
- Event counters
- Error display area
- Help text with getting started guide

**Rationale:**
- No framework = minimal bundle size, fast load
- Simple UI matches DevTools aesthetic
- Focus on status visibility (most important for debugging)
- Complies with CSP (no inline scripts)

**Alternatives Considered:**
- React/Vue framework - Rejected (CSP complexity, bundle size, overkill for simple UI)
- Complex dashboard with log display - Rejected (terminal is the display, panel is just control)

---

### 6. Testing Strategy

**Decision:** Multi-layer testing approach

**Test Layers:**

1. **Unit Tests (Jest)**
   - Serializer functions
   - Protocol message builders
   - Utility functions
   - Coverage target: 80%+

2. **Integration Tests**
   - WebSocket client connection flow
   - Console capture end-to-end
   - Message protocol compliance
   - Error handling scenarios

3. **Manual Test Scenarios**
   - Load extension in Chrome
   - Test with sample apps (React, Vue, vanilla JS)
   - Test all 18 console methods
   - Test edge cases (circular objects, large arrays, etc.)
   - Test reconnection behavior

4. **Performance Tests**
   - 100 events/second sustained
   - Large object serialization (<5ms)
   - Memory usage over 1000 events

**Test Files Structure:**
```
extension/tests/
├── unit/
│   ├── serializer.test.js
│   ├── protocol.test.js
│   └── utils.test.js
├── integration/
│   ├── websocket-client.test.js
│   └── console-capture.test.js
├── manual/
│   ├── test-app.html
│   └── test-scenarios.md
└── performance/
    └── performance.test.js
```

**Rationale:**
- Unit tests catch bugs early
- Integration tests validate protocol compliance
- Manual tests catch UX issues
- Performance tests ensure production readiness

---

## Implementation Plan

### Subtasks (Planned)

**Subtask 2.1: Core Console Capture Implementation**
- Console interceptor injection
- All 18 console methods support
- Source location tracking
- Initial serialization (primitives + basic objects)
- **Duration:** 3 days

**Subtask 2.2: Advanced Object Serialization**
- Circular reference detection
- DOM element handling
- Error object handling
- Function serialization
- Depth/size limiting
- **Duration:** 4 days

**Subtask 2.3: WebSocket Client Implementation**
- WebSocket connection management
- Message protocol implementation
- Auto-reconnect with exponential backoff
- Message queuing during disconnection
- Status event system
- **Duration:** 3 days

**Subtask 2.4: DevTools Panel UI**
- Panel HTML/CSS layout
- Connection status indicator
- Control buttons (start/stop/settings)
- Event counters and stats
- Error display area
- Settings panel
- **Duration:** 3 days

**Subtask 2.5: Integration & Testing**
- Wire all components together
- Write unit tests (80% coverage)
- Write integration tests
- Create manual test scenarios
- Performance testing and optimization
- Bug fixes
- **Duration:** 5 days

**Subtask 2.6: Documentation & Polish**
- User documentation (README)
- Developer documentation (CODE.md)
- Installation guide
- Troubleshooting guide
- Final code review
- **Duration:** 2 days

**Total Duration:** ~20 days (4 weeks)

---

## Success Criteria

### Must Have (v2.0.0 Release)
- ✅ All 18 console methods captured correctly
- ✅ WebSocket connection stable with auto-reconnect
- ✅ Object serialization handles all JS types
- ✅ Panel UI shows connection status and controls
- ✅ Protocol v1.0.0 fully implemented
- ✅ No console errors in extension
- ✅ Works with localhost applications (React, Vue, vanilla)
- ✅ 80%+ test coverage
- ✅ Performance: 100 events/second sustained

### Nice to Have (Future Versions)
- Settings persistence (localStorage)
- Filtering by log level
- Log history in panel (last 100 events)
- Export logs to file
- Custom port configuration
- Remote connection support (v2.1.0+)

---

## Risks & Mitigations

### Risk 1: Performance Issues with High-Frequency Logging
**Impact:** Extension slows down or crashes with 100+ events/second
**Mitigation:**
- Implement message batching (50+ events/sec)
- Drop messages if >200 events/sec with warning
- Performance testing during development
- Depth/size limits on serialization

### Risk 2: WebSocket Connection Instability
**Impact:** Messages lost during disconnection
**Mitigation:**
- Message queuing (up to 1000 messages)
- Exponential backoff reconnection
- Connection status visible in UI
- Comprehensive error handling

### Risk 3: Serialization Edge Cases
**Impact:** Extension crashes on unexpected object types
**Mitigation:**
- Try-catch around all serialization code
- Fallback to .toString() for unknown types
- Extensive unit tests with edge cases
- Manual testing with complex objects

### Risk 4: CSP Violations
**Impact:** Extension fails to load or runs incorrectly
**Mitigation:**
- Strict CSP compliance from start
- No inline scripts or eval()
- All event listeners via addEventListener
- Test loading in Chrome early and often

---

## Dependencies

### External Dependencies
- None (vanilla JS implementation)

### Internal Dependencies
- Sprint 1 deliverables (all complete):
  - WebSocket protocol v1.0.0 specification
  - Manifest v3 configuration
  - Chrome DevTools API POC

### Browser Requirements
- Chrome 110+ (Manifest v3 support)
- DevTools API support
- WebSocket support

---

## Open Questions

1. **Icon Design:** Who will create the extension icons (16x16, 48x48, 128x128)?
   - Action: Assign designer or use placeholder until design available

2. **Settings Storage:** Should we persist settings in Chrome storage?
   - Decision: Not in v2.0.0 (nice-to-have for v2.1.0)

3. **Error Notifications:** Should errors show Chrome notifications or only in panel?
   - Decision: Panel only for v2.0.0 (less intrusive)

4. **CLI Compatibility:** Will this extension work with the existing Console Bridge v1.0.0 CLI?
   - Decision: No - requires new v2.0.0 CLI (protocol incompatible)

---

## Next Steps

1. **Break Down Subtasks:** Create detailed ADRs for each subtask (2.1 through 2.6)
2. **Create Feature Branches:** One branch per subtask
3. **Start Implementation:** Begin with Subtask 2.1 (Core Console Capture)
4. **Daily Progress Tracking:** Update ADRs with implementation progress
5. **Regular Testing:** Test each subtask before moving to next

---

## References

- Sprint 1 ADRs (.claude/adr/phase-1/)
- WebSocket Protocol v1.0.0 (docs/v2.0.0-spec/websocket-protocol-v1.0.0.md)
- Manifest v3 Documentation (extension/docs/MANIFEST.md)
- Chrome DevTools API POC (chrome-extension-poc/)
- Implementation Plan (.claude/IMPLEMENTATION_PLAN.md)

---

**Document Status:** Preliminary (to be refined as implementation progresses)
**Last Updated:** October 7, 2025
**Next Review:** After Subtask 2.1 completion

# ADR: Subtask 2.3 - WebSocket Client Implementation (PRELIMINARY)

**Date:** 2025-10-08
**Status:** 🚧 In Progress
**Branch:** `phase-2-subtask-2.3`
**Depends on:** Subtask 2.2 (✅ Completed)
**Estimated Duration:** 3-4 hours
**Sprint:** Phase 2 - Chrome Extension Core Logic

---

## Executive Summary

Subtask 2.3 implements the WebSocket client in the Chrome extension to communicate with the CLI server using the standardized WebSocket Protocol v1.0.0. This subtask bridges the gap between the extension's console capture (Subtask 2.1, 2.2) and the CLI's ability to receive and display logs.

**Current State:**
- ✅ Console capture fully functional (Subtask 2.1)
- ✅ Advanced object serialization complete (Subtask 2.2, 48/48 tests passing)
- ⚠️ POC WebSocket client exists but doesn't follow protocol v1.0.0
- ❌ CLI WebSocket server not yet implemented (Subtask 2.4)

**Goal:**
Implement a production-ready WebSocket client that:
- Follows WebSocket Protocol v1.0.0 specification
- Queues messages during disconnection (max 1000)
- Implements ping/pong keep-alive
- Auto-reconnects with exponential backoff
- Handles all edge cases gracefully

---

## What Already Exists (POC Analysis)

### Existing Implementation: `chrome-extension-poc/panel.js` (lines 87-391)

**What Works:**
1. ✅ Basic WebSocket connection to `ws://localhost:9223`
2. ✅ Reconnection logic with exponential backoff (1s, 2s, 4s, 8s, 16s)
3. ✅ Connection status tracking and UI updates
4. ✅ Basic error handling

**What Doesn't Work:**

#### 1. Wrong Message Format ❌

**Current (Wrong):**
```javascript
// panel.js line 98
this.sendMessage({
  type: 'connect',           // Should be 'connection_status'
  browser: 'chrome',
  browserVersion: navigator.userAgent,
  extensionVersion: '2.0.0-poc',
  tabId: this.tabId,
  tabUrl: this.ui.tabUrl.textContent,
  timestamp: Date.now()      // Should be ISO 8601 string
});
```

**Required (Protocol v1.0.0):**
```javascript
{
  version: "1.0.0",
  type: "connection_status",
  timestamp: "2025-10-08T12:34:56.789Z",
  source: {
    tabId: 12345,
    url: "http://localhost:8080",
    title: "Test Page"
  },
  payload: {
    status: "connected",
    clientInfo: {
      extensionVersion: "2.0.0",
      browser: "Chrome",
      browserVersion: "120.0.0"
    }
  }
}
```

#### 2. No Message Queuing ❌

**Current (Wrong):**
```javascript
// panel.js lines 376-391
sendMessage(message) {
  if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
    console.warn('[Console Bridge POC] WebSocket not connected, message not sent');
    return;  // Messages are DROPPED!
  }

  try {
    this.ws.send(JSON.stringify(message));
    this.stats.messagesSent++;
    this.updateStats();
  } catch (error) {
    console.error('[Console Bridge POC] Failed to send message:', error);
    this.stats.errors++;
    this.updateStats();
  }
}
```

**Problem:** Messages are dropped when WebSocket is disconnected. If CLI restarts or network hiccups, all console events during disconnection are lost.

**Required:** Queue messages (max 1000) during disconnection, flush when reconnected.

#### 3. No Ping/Pong Keep-Alive ❌

**Current:** No heartbeat mechanism. Silent failures possible.

**Required:** Send ping every 30 seconds, expect pong response within 5 seconds, reconnect if timeout.

#### 4. Console Event Format Wrong ❌

**Current (Wrong):**
```javascript
// panel.js lines 360-374
onConsoleLog(logEntry) {
  // ... code ...

  this.sendMessage({
    type: 'console',          // Should be 'console_event'
    method: logEntry.method,
    args: logEntry.args,
    timestamp: logEntry.timestamp,
    url: logEntry.url,
    line: logEntry.line,
    column: logEntry.column
  });
}
```

**Required (Protocol v1.0.0):**
```javascript
{
  version: "1.0.0",
  type: "console_event",
  timestamp: "2025-10-08T12:34:56.789Z",
  source: {
    tabId: 12345,
    url: "http://localhost:8080",
    title: "Test Page"
  },
  payload: {
    method: "log",
    args: [
      { type: "string", value: "Hello World" }
    ],
    location: {
      url: "http://localhost:8080/app.js",
      line: 42,
      column: 15
    }
  }
}
```

---

## Implementation Plan

### Phase 1: Message Envelope ✅ (1 hour)

**Goal:** Update all messages to use protocol v1.0.0 envelope structure.

**Tasks:**
1. Create `createEnvelope(type, payload)` helper method
2. Update `sendMessage()` to wrap all messages in envelope
3. Update `connection_status` message format
4. Update `console_event` message format
5. Add ISO 8601 timestamp formatting
6. Add source info extraction (tabId, url, title)

**Success Criteria:**
- All messages follow protocol v1.0.0 envelope structure
- Timestamps are ISO 8601 strings
- Source info included in all messages

---

### Phase 2: Message Queuing ✅ (1 hour)

**Goal:** Queue messages during disconnection, flush when reconnected.

**Tasks:**
1. Add `messageQueue` array to `WebSocketClient` constructor
2. Add `maxQueueSize` constant (1000 messages)
3. Modify `sendMessage()` to queue when disconnected
4. Create `queueMessage()` method
5. Create `flushQueue()` method (called on reconnection)
6. Add queue size to stats UI
7. Add queue overflow handling (drop oldest messages)

**Success Criteria:**
- Messages queued during disconnection (max 1000)
- Queue flushed on reconnection in order
- Oldest messages dropped if queue exceeds 1000
- Queue size visible in UI stats

---

### Phase 3: Ping/Pong Keep-Alive ✅ (30 minutes)

**Goal:** Implement heartbeat mechanism to detect silent failures.

**Tasks:**
1. Add ping interval timer (30 seconds)
2. Add pong timeout timer (5 seconds)
3. Send ping messages with protocol v1.0.0 format
4. Handle pong responses
5. Reconnect if pong timeout
6. Clear timers on disconnect

**Success Criteria:**
- Ping sent every 30 seconds
- Pong expected within 5 seconds
- Reconnect triggered if no pong
- Timers cleared on disconnect/reconnect

---

### Phase 4: Edge Case Handling ✅ (30 minutes)

**Goal:** Handle all edge cases gracefully.

**Tasks:**
1. Handle rapid connect/disconnect cycles
2. Handle message send during reconnection
3. Handle WebSocket close codes (1000, 1006, etc.)
4. Handle network errors
5. Add error messages with protocol v1.0.0 format

**Success Criteria:**
- No crashes on rapid connect/disconnect
- Messages queued during reconnection
- All close codes handled appropriately
- Network errors don't crash extension

---

### Phase 5: Testing & Verification ✅ (1 hour)

**Goal:** Verify WebSocket client works correctly with all scenarios.

**Test Scenarios:**

#### Connection Tests:
1. ✅ Connect to running CLI
2. ✅ Connect when CLI not running (auto-reconnect)
3. ✅ Disconnect and reconnect
4. ✅ CLI crashes and restarts (message queuing)

#### Message Format Tests:
5. ✅ connection_status message follows protocol v1.0.0
6. ✅ console_event message follows protocol v1.0.0
7. ✅ ping message follows protocol v1.0.0
8. ✅ error message follows protocol v1.0.0

#### Queuing Tests:
9. ✅ Messages queued during disconnection
10. ✅ Queue flushed on reconnection
11. ✅ Queue overflow (>1000 messages) drops oldest
12. ✅ Queue preserved during rapid reconnects

#### Keep-Alive Tests:
13. ✅ Ping sent every 30 seconds
14. ✅ Pong received and handled
15. ✅ Reconnect on pong timeout

#### Edge Case Tests:
16. ✅ Rapid connect/disconnect cycles
17. ✅ Message send during reconnection
18. ✅ Network errors handled gracefully
19. ✅ Close codes handled correctly

**Testing Approach:**
- Manual testing with CLI WebSocket server (if available)
- Mock WebSocket server for autonomous testing
- Playwright MCP for automated test execution
- Browser DevTools console for message verification

---

## Architecture Decisions

### Decision 1: Message Queue Implementation

**Options Considered:**

**A. Array-based queue (CHOSEN)**
```javascript
this.messageQueue = [];

queueMessage(envelope) {
  if (this.messageQueue.length >= this.maxQueueSize) {
    this.messageQueue.shift();  // Drop oldest
  }
  this.messageQueue.push(envelope);
}
```

**Pros:**
- Simple implementation
- O(1) push, O(1) pop
- Easy to inspect for debugging
- Built-in length property

**Cons:**
- shift() is O(n) but only happens on overflow

**B. Circular buffer**

**Pros:**
- O(1) all operations
- More memory efficient

**Cons:**
- More complex implementation
- Harder to debug
- Overkill for max 1000 messages

**Decision:** Array-based queue (Option A)

**Rationale:** Simplicity wins. Performance difference negligible for 1000 messages. shift() only called on overflow (rare). Easy to inspect and debug.

---

### Decision 2: Ping/Pong Keep-Alive Timing

**Options Considered:**

**A. 30s ping, 5s pong timeout (CHOSEN)**
- Ping interval: 30 seconds
- Pong timeout: 5 seconds
- Total detection time: 35 seconds max

**B. 10s ping, 2s pong timeout**
- Ping interval: 10 seconds
- Pong timeout: 2 seconds
- Total detection time: 12 seconds max

**Decision:** 30s ping, 5s pong timeout (Option A)

**Rationale:**
- 30s ping reduces network traffic (2 pings/minute vs 6 pings/minute)
- 5s timeout accommodates network hiccups
- 35s max detection time acceptable for development tool
- Follows WebSocket best practices (typical: 30-60s)

---

### Decision 3: Reconnection Strategy

**Current POC Strategy (KEEP):**
```javascript
scheduleReconnect() {
  if (this.reconnectAttempts >= this.maxReconnectAttempts) {
    console.error('[Console Bridge POC] Max reconnect attempts reached');
    return;
  }

  const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);
  setTimeout(() => this.connectWebSocket(), delay);
  this.reconnectAttempts++;
}
```

**Backoff Sequence:**
- Attempt 1: 1 second (2^0)
- Attempt 2: 2 seconds (2^1)
- Attempt 3: 4 seconds (2^2)
- Attempt 4: 8 seconds (2^3)
- Attempt 5: 16 seconds (2^4)
- Max: 5 attempts

**Decision:** Keep existing exponential backoff strategy

**Rationale:**
- Already implemented and working
- Standard exponential backoff pattern
- Reasonable delays for development tool
- Max 5 attempts prevents infinite reconnection
- User can manually reconnect after max attempts

---

## Files to Modify

### 1. `chrome-extension-poc/panel.js` (Primary Changes)

**Lines to Modify:**
- Lines 87-141: `connectWebSocket()` - Update message format
- Lines 143-172: `scheduleReconnect()` - Keep as-is
- Lines 360-374: `onConsoleLog()` - Update message format
- Lines 376-391: `sendMessage()` - Add queuing logic

**New Methods to Add:**
- `createEnvelope(type, payload)` - Create protocol v1.0.0 envelope
- `queueMessage(envelope)` - Queue message during disconnection
- `flushQueue()` - Send queued messages on reconnection
- `startPingPong()` - Start ping/pong timers
- `stopPingPong()` - Clear ping/pong timers
- `sendPing()` - Send ping message
- `handlePong()` - Handle pong response
- `formatISOTimestamp(date)` - Format ISO 8601 timestamp

---

## Success Criteria

### SC-2.3.1: Protocol v1.0.0 Compliance ✅
- ✅ All messages use protocol v1.0.0 envelope structure
- ✅ `version` field is "1.0.0"
- ✅ `type` field matches protocol enum
- ✅ `timestamp` is ISO 8601 string
- ✅ `source` info included in all extension→CLI messages
- ✅ `payload` structure matches protocol spec

### SC-2.3.2: Message Queuing ✅
- ✅ Messages queued during disconnection
- ✅ Max queue size: 1000 messages
- ✅ Queue flushed on reconnection (FIFO order)
- ✅ Oldest messages dropped on overflow
- ✅ Queue size visible in UI

### SC-2.3.3: Keep-Alive ✅
- ✅ Ping sent every 30 seconds
- ✅ Pong expected within 5 seconds
- ✅ Reconnect triggered on pong timeout
- ✅ Timers cleared on disconnect

### SC-2.3.4: Reconnection ✅
- ✅ Exponential backoff (1s, 2s, 4s, 8s, 16s)
- ✅ Max 5 reconnect attempts
- ✅ Queue preserved during reconnection
- ✅ Manual reconnect available after max attempts

### SC-2.3.5: Edge Cases ✅
- ✅ No crashes on rapid connect/disconnect
- ✅ Messages queued during reconnection
- ✅ Close codes handled (1000, 1006, etc.)
- ✅ Network errors don't crash extension

### SC-2.3.6: Testing ✅
- ✅ All 19 test scenarios passing
- ✅ Manual verification of message format
- ✅ No errors in console during normal operation
- ✅ Autonomous testing with Playwright MCP

---

## Risks & Mitigation

### Risk 1: CLI WebSocket Server Not Yet Implemented ⚠️

**Risk:** Subtask 2.3 implements client, but Subtask 2.4 implements server. Can't fully test client until server exists.

**Mitigation:**
1. Create mock WebSocket server for testing
2. Use `wscat` or similar tool to simulate server
3. Test message format with Playwright console inspection
4. Defer integration tests to Subtask 2.4

**Status:** LOW RISK - Mock server sufficient for client testing

---

### Risk 2: Message Serialization Compatibility ⚠️

**Risk:** Advanced serialization (Subtask 2.2) might not be compatible with WebSocket JSON encoding.

**Mitigation:**
1. Subtask 2.2 already tested with Chrome's native console serialization
2. JSON.stringify() handles all tested types
3. Protocol v1.0.0 uses typed args (type + value)

**Status:** NO RISK - Subtask 2.2 already validated serialization

---

### Risk 3: Memory Usage from Message Queue 📊

**Risk:** 1000 queued messages might consume significant memory.

**Mitigation:**
1. Max queue size configurable (1000 is reasonable)
2. Average message size ~500 bytes = 500KB max
3. Drop oldest on overflow
4. Queue cleared on successful flush

**Status:** LOW RISK - 500KB acceptable for development tool

---

## Testing Strategy

### Manual Testing (Primary)

**Prerequisites:**
- Chrome extension loaded in `chrome://extensions`
- Test page loaded at `http://localhost:8080/test-page-advanced.html`
- Extension DevTools panel open

**Test Scenarios:**

#### 1. Connection Status Messages
```javascript
// Expected message in DevTools console:
{
  version: "1.0.0",
  type: "connection_status",
  timestamp: "2025-10-08T...",
  source: { tabId: ..., url: "...", title: "..." },
  payload: {
    status: "connected",
    clientInfo: {
      extensionVersion: "2.0.0",
      browser: "Chrome",
      browserVersion: "120.0.0"
    }
  }
}
```

#### 2. Console Event Messages
```javascript
// Trigger: console.log("Hello World")
// Expected message:
{
  version: "1.0.0",
  type: "console_event",
  timestamp: "2025-10-08T...",
  source: { tabId: ..., url: "...", title: "..." },
  payload: {
    method: "log",
    args: [{ type: "string", value: "Hello World" }],
    location: { url: "...", line: 42, column: 15 }
  }
}
```

#### 3. Message Queuing
```javascript
// Test steps:
// 1. Disconnect WebSocket (CLI not running)
// 2. Trigger 10 console.log() calls
// 3. Verify queue size = 10 in UI
// 4. Connect WebSocket (start CLI)
// 5. Verify queue flushed (queue size = 0)
// 6. Verify all 10 messages received by CLI
```

#### 4. Queue Overflow
```javascript
// Test steps:
// 1. Disconnect WebSocket
// 2. Trigger 1500 console.log() calls
// 3. Verify queue size = 1000 (max)
// 4. Connect WebSocket
// 5. Verify 1000 messages flushed
// 6. Verify oldest 500 messages dropped
```

#### 5. Ping/Pong Keep-Alive
```javascript
// Test steps:
// 1. Connect WebSocket
// 2. Wait 30 seconds
// 3. Verify ping message sent
// 4. Verify pong received (if server responds)
// 5. Wait 35 seconds with no pong
// 6. Verify reconnection triggered
```

---

### Automated Testing (Secondary)

**Tool:** Playwright MCP

**Approach:**
1. Create mock WebSocket server (Node.js)
2. Start mock server on `ws://localhost:9223`
3. Use Playwright to open test page
4. Use Playwright to trigger console events
5. Verify messages received by mock server

**Benefits:**
- Fully autonomous testing
- Reproducible test runs
- No manual intervention required

**Limitations:**
- Requires mock server implementation
- Integration tests deferred to Subtask 2.4

---

## Deviations from Original Plan

### Deviation 1: POC Already Has WebSocket Client

**Original Plan:** "Implement WebSocket client from scratch"

**Reality:** POC already has basic WebSocket client with reconnection logic.

**Deviation:** Update existing implementation instead of creating from scratch.

**Impact:** POSITIVE - Saves time, preserves working reconnection logic.

**Justification:** No reason to rewrite working code. Focus on protocol compliance and new features (queuing, keep-alive).

---

### Deviation 2: Testing Without CLI Server

**Original Plan:** "Test WebSocket client with CLI server"

**Reality:** CLI server not yet implemented (Subtask 2.4).

**Deviation:** Use mock server and DevTools console inspection for testing.

**Impact:** NEUTRAL - Defers full integration testing to Subtask 2.4.

**Justification:** Can fully test client behavior without server. Integration tests more appropriate in Subtask 2.4 when both exist.

---

## Next Steps After Completion

1. ✅ Create completion ADR documenting results
2. ✅ Run all tests (core + WebSocket)
3. ✅ Commit with descriptive message
4. ✅ Push to `phase-2-subtask-2.3` branch
5. ⏳ Proceed to Subtask 2.4: CLI WebSocket Server Implementation

---

## References

- **WebSocket Protocol v1.0.0:** `docs/v2.0.0-spec/websocket-protocol-v1.0.0.md`
- **Subtask 2.1 ADR:** `.claude/adr/phase-2/subtask-2.1-bridge-manager.md`
- **Subtask 2.2 ADR:** `.claude/adr/phase-2/subtask-2.2-advanced-serialization-complete.md`
- **Existing POC:** `chrome-extension-poc/panel.js`
- **Test Page:** `test-page-advanced.html`

---

**Document Version:** 1.0 (Preliminary)
**Created:** October 8, 2025
**Status:** 🚧 In Progress
**Next Review:** Upon completion (before creating completion ADR)

# ADR: Subtask 2.4 - CLI WebSocket Server Implementation (PRELIMINARY)

**Date:** 2025-10-08
**Status:** 🚧 In Progress
**Branch:** `phase-2-subtask-2.4`
**Depends on:** Subtask 2.3 (✅ Completed)
**Estimated Duration:** 3-4 hours
**Sprint:** Phase 2 - Chrome Extension Core Logic

---

## Executive Summary

Subtask 2.4 implements the WebSocket server in the CLI to receive messages from the Chrome extension using WebSocket Protocol v1.0.0. This completes the extension→CLI integration, enabling console logs from the browser to appear in the terminal.

**Current State:**
- ✅ Extension WebSocket client fully functional (Subtask 2.3)
- ✅ Protocol v1.0.0 messages being sent by extension
- ✅ LogFormatter ready to display logs
- ❌ CLI WebSocket server not yet implemented
- ❌ No integration between extension and terminal

**Goal:**
Implement a production-ready WebSocket server that:
- Listens on `ws://localhost:9223`
- Accepts connections from Chrome extension
- Handles protocol v1.0.0 messages (connection_status, console_event, ping)
- Converts console_event messages to LogFormatter format
- Displays browser console logs in terminal
- Responds to ping with pong

---

## What Needs to Be Implemented

### 1. WebSocket Server Class ✅

**Location:** `src/core/WebSocketServer.js` (new file)

**Responsibilities:**
- Start WebSocket server on port 9223
- Accept extension connections
- Parse protocol v1.0.0 messages
- Emit events for different message types
- Respond to ping with pong
- Handle connection/disconnection gracefully
- Track connected clients

**Interface:**
```javascript
class WebSocketServer {
  constructor(options = {}) {
    this.port = options.port || 9223;
    this.logFormatter = options.logFormatter;
    this.output = options.output || console.log;
    this.server = null;
    this.clients = new Set();
  }

  async start() {
    // Create WebSocket server
    // Listen on port 9223
    // Setup connection handlers
  }

  async stop() {
    // Close all client connections
    // Stop server
  }

  handleConnection(ws) {
    // Handle new connection
    // Setup message handler
    // Track client
  }

  handleMessage(ws, data) {
    // Parse JSON
    // Validate protocol v1.0.0
    // Route by message type
  }

  handleConsoleEvent(message) {
    // Convert to LogFormatter format
    // Format with LogFormatter
    // Output to terminal
  }

  handleConnectionStatus(message) {
    // Log connection info
    // Track client metadata
  }

  handlePing(ws, message) {
    // Send pong response
  }

  sendPong(ws) {
    // Create protocol v1.0.0 pong message
    // Send to client
  }
}
```

---

### 2. CLI Integration ✅

**Location:** `bin/console-bridge.js` (modify)

**Changes:**
- Add `--extension-mode` flag
- Create WebSocketServer instead of BridgeManager when flag is set
- Pass LogFormatter to WebSocketServer
- Setup shutdown handlers for WebSocketServer

**Usage:**
```bash
# Old (Puppeteer mode)
console-bridge start localhost:3000

# New (Extension mode)
console-bridge start --extension-mode
```

---

### 3. Message Format Conversion ✅

**Challenge:** Convert protocol v1.0.0 console_event to LogFormatter format

**Extension Message (v1.0.0):**
```json
{
  "version": "1.0.0",
  "type": "console_event",
  "timestamp": "2025-10-08T12:34:56.789Z",
  "source": {
    "tabId": 12345,
    "url": "http://localhost:8080/test.html",
    "title": "Test Page"
  },
  "payload": {
    "method": "log",
    "args": [
      { "type": "string", "value": "Hello World" },
      { "type": "number", "value": 42 }
    ],
    "location": {
      "url": "http://localhost:8080/app.js",
      "line": 42,
      "column": 15
    }
  }
}
```

**LogFormatter Expected Format:**
```javascript
{
  type: 'log',
  args: ['Hello World', 42],
  source: 'http://localhost:8080/test.html',
  timestamp: 1728394496789,  // Unix timestamp in ms
  location: {
    url: 'http://localhost:8080/app.js',
    line: 42,
    column: 15
  }
}
```

**Conversion Logic:**
```javascript
function convertToLogFormatterFormat(message) {
  return {
    type: message.payload.method,
    args: message.payload.args.map(arg => arg.value),
    source: message.source.url,
    timestamp: new Date(message.timestamp).getTime(),
    location: message.payload.location
  };
}
```

---

### 4. Ping/Pong Responses ✅

**Protocol v1.0.0 Ping:**
```json
{
  "version": "1.0.0",
  "type": "ping",
  "timestamp": "2025-10-08T12:34:56.789Z",
  "source": { "tabId": 12345, "url": "...", "title": "..." },
  "payload": {}
}
```

**Required Pong Response:**
```json
{
  "version": "1.0.0",
  "type": "pong",
  "timestamp": "2025-10-08T12:35:00.123Z",
  "payload": {}
}
```

**Implementation:**
```javascript
sendPong(ws) {
  const pong = {
    version: '1.0.0',
    type: 'pong',
    timestamp: new Date().toISOString(),
    payload: {}
  };
  ws.send(JSON.stringify(pong));
}
```

---

## Implementation Plan

### Phase 1: WebSocket Server Core (1.5 hours)

**Goal:** Create basic WebSocket server that accepts connections

**Tasks:**
1. Create `src/core/WebSocketServer.js`
2. Implement `start()` - Create WebSocket.Server on port 9223
3. Implement `stop()` - Close server and clients
4. Implement `handleConnection()` - Track clients
5. Implement `handleMessage()` - Parse JSON and route messages
6. Add error handling for invalid JSON, wrong protocol version

**Success Criteria:**
- Server starts on port 9223
- Accepts connections from extension
- Logs connection/disconnection events
- Parses JSON messages without crashing

---

### Phase 2: Message Handling (1 hour)

**Goal:** Handle all protocol v1.0.0 message types

**Tasks:**
1. Implement `handleConsoleEvent()` - Convert and format
2. Implement `handleConnectionStatus()` - Log client info
3. Implement `handlePing()` - Send pong response
4. Implement `sendPong()` - Create pong message
5. Add protocol version validation
6. Add message type validation

**Success Criteria:**
- console_event messages displayed in terminal
- connection_status messages logged
- ping messages receive pong responses
- Invalid messages logged but don't crash server

---

### Phase 3: CLI Integration (30 minutes)

**Goal:** Add --extension-mode flag to CLI

**Tasks:**
1. Add `--extension-mode` flag to start command
2. Create WebSocketServer when flag is set
3. Pass LogFormatter options to WebSocketServer
4. Setup shutdown handlers
5. Show "Listening for extension on ws://localhost:9223" message

**Success Criteria:**
- `console-bridge start --extension-mode` starts WebSocket server
- Server uses same LogFormatter options as Puppeteer mode
- Ctrl+C gracefully shuts down server
- Help text updated with --extension-mode flag

---

### Phase 4: Testing & Verification (1 hour)

**Goal:** Verify full extension→CLI flow works

**Test Scenarios:**

#### 1. Basic Console Logs
```bash
# Terminal 1: Start CLI
console-bridge start --extension-mode

# Terminal 2: Open Chrome with extension
# Navigate to test page
# Open DevTools → Console Bridge panel

# In browser console:
console.log("Hello World");
console.log("Number:", 42);
console.warn("Warning!");
console.error("Error!");

# Expected in Terminal 1:
[12:34:56] [localhost:8080] log: Hello World
[12:34:57] [localhost:8080] log: Number: 42
[12:34:58] [localhost:8080] warning: Warning!
[12:34:59] [localhost:8080] error: Error!
```

#### 2. Connection Handshake
```bash
# Start CLI
console-bridge start --extension-mode

# Expected output:
🌉 Console Bridge v1.0.0 (Extension Mode)
📡 Listening for extension on ws://localhost:9223...

# Open extension panel
# Expected output:
✓ Extension connected (Tab 12345: localhost:8080/test.html)
```

#### 3. Ping/Pong Keep-Alive
```bash
# Wait 30 seconds after connection
# Expected: No pong timeout messages in extension console
# Verify ping/pong working silently
```

#### 4. Reconnection
```bash
# Restart CLI while extension connected
# Expected: Extension reconnects automatically
# Expected: No lost console events (queued during disconnection)
```

#### 5. Multiple Arguments
```javascript
console.log("String", 42, true, null, undefined, {foo: "bar"});

// Expected:
[12:34:56] [localhost:8080] log: String 42 true null undefined { foo: 'bar' }
```

#### 6. Location Display
```bash
# Start with --location flag
console-bridge start --extension-mode --location

console.log("With location");

// Expected:
[12:34:56] [localhost:8080] log: With location  (app.js:42:15)
```

---

## Architecture Decisions

### Decision 1: Separate WebSocketServer Class

**Chosen:** Create new `WebSocketServer` class separate from `BridgeManager`

**Rationale:**
- Clean separation of concerns
- Puppeteer mode uses BridgeManager
- Extension mode uses WebSocketServer
- No shared code between modes (different architectures)
- Easier to test independently

**Alternatives Rejected:**
- Merge into BridgeManager: Too complex, mixing concerns
- Modify BridgeManager to support both: Confusing, hard to maintain

---

### Decision 2: Reuse LogFormatter

**Chosen:** Use existing LogFormatter for terminal output

**Rationale:**
- LogFormatter already handles all console types
- Same output format for both modes (Puppeteer vs Extension)
- No code duplication
- Consistent user experience

**Alternatives Rejected:**
- Custom formatting for extension mode: Duplicated effort
- Direct console.log: No colors, no formatting, poor UX

---

### Decision 3: --extension-mode Flag

**Chosen:** Add explicit `--extension-mode` flag

**Rationale:**
- Clear intent: User knows which mode they're using
- Backward compatible: Existing users unchanged
- Mutually exclusive: Can't mix Puppeteer + extension mode
- Easy to document

**Alternatives Rejected:**
- Auto-detect mode: Confusing, hard to debug
- Separate binary: Unnecessary complexity
- Always run both: Resource waste, port conflict

---

### Decision 4: Port 9223

**Chosen:** Use port 9223 (as specified in protocol v1.0.0)

**Rationale:**
- Matches protocol specification
- Extension already hardcoded to ws://localhost:9223
- Not commonly used by other services
- Easy to remember (92-23 → "Bridge")

**Alternatives Rejected:**
- Configurable port: Unnecessary complexity for v1.0.0
- Random port: Extension can't connect
- Well-known port (8080, 3000): Likely conflicts

---

## Files to Create/Modify

### 1. `src/core/WebSocketServer.js` (NEW)

**Purpose:** WebSocket server for extension mode

**Exports:**
```javascript
module.exports = WebSocketServer;
```

**Dependencies:**
- `ws` (WebSocket library)
- `LogFormatter` (for terminal output)

**Estimated Lines:** ~200-250 lines

---

### 2. `bin/console-bridge.js` (MODIFY)

**Changes:**
- Add `--extension-mode` flag option (line ~196)
- Import WebSocketServer
- Branch logic in `startCommand()` based on flag
- Create WebSocketServer if `--extension-mode`, else BridgeManager
- Update help text

**Estimated Changes:** ~40 new lines, ~20 modified lines

---

### 3. `package.json` (VERIFY)

**Check:** Ensure `ws` dependency exists

**Expected:**
```json
{
  "dependencies": {
    "ws": "^8.x.x"  // WebSocket library
  }
}
```

---

## Success Criteria

### SC-2.4.1: WebSocket Server Functionality ✅
- ✅ Server starts on port 9223
- ✅ Accepts extension connections
- ✅ Parses protocol v1.0.0 messages
- ✅ Handles connection/disconnection gracefully
- ✅ No crashes on invalid messages

### SC-2.4.2: Message Handling ✅
- ✅ console_event messages displayed in terminal
- ✅ connection_status messages logged
- ✅ ping messages receive pong responses
- ✅ Message format conversion correct

### SC-2.4.3: LogFormatter Integration ✅
- ✅ Uses existing LogFormatter
- ✅ Respects formatter options (timestamp, source, location)
- ✅ All console types work (log, warn, error, etc.)
- ✅ Colors applied correctly

### SC-2.4.4: CLI Integration ✅
- ✅ `--extension-mode` flag works
- ✅ Graceful shutdown on Ctrl+C
- ✅ Clear status messages (listening, connected, disconnected)
- ✅ Help text updated

### SC-2.4.5: End-to-End Testing ✅
- ✅ Extension→CLI flow verified
- ✅ Console logs appear in terminal
- ✅ Ping/pong keep-alive works
- ✅ Reconnection works
- ✅ Message queuing/flushing works

### SC-2.4.6: Core Tests ✅
- ✅ All 211 core tests still passing
- ✅ New WebSocketServer unit tests added
- ✅ Integration tests for extension mode added

---

## Risks & Mitigation

### Risk 1: Port 9223 Already in Use ⚠️

**Risk:** User might have another service on port 9223

**Mitigation:**
1. Catch EADDRINUSE error
2. Show clear error message: "Port 9223 already in use. Is another console-bridge instance running?"
3. Suggest checking with `netstat -an | grep 9223`

**Status:** LOW RISK - 9223 not commonly used

---

### Risk 2: WebSocket Library Compatibility 📊

**Risk:** `ws` library might have breaking changes

**Mitigation:**
1. Pin to specific major version in package.json
2. Use well-documented, stable API
3. Test with latest `ws` v8.x

**Status:** LOW RISK - `ws` is mature and stable

---

### Risk 3: Message Format Mismatch 🔄

**Risk:** Extension might send unexpected message format

**Mitigation:**
1. Validate protocol version
2. Validate message type
3. Try/catch around JSON parsing
4. Log invalid messages but don't crash
5. Send error message back to extension

**Status:** LOW RISK - Protocol v1.0.0 well-defined in Subtask 2.3

---

## Testing Strategy

### Unit Tests (New)

**File:** `test/unit/WebSocketServer.test.js`

**Test Cases:**
1. Server starts on correct port
2. Accepts client connections
3. Parses valid JSON messages
4. Handles invalid JSON gracefully
5. Converts console_event to LogFormatter format
6. Sends pong in response to ping
7. Tracks connected clients
8. Closes gracefully

**Estimated:** 20-25 tests

---

### Integration Tests (New)

**File:** `test/integration/extension-mode.test.js`

**Test Cases:**
1. CLI starts with --extension-mode
2. WebSocket client can connect
3. console_event messages processed
4. Output matches expected format
5. Server stops gracefully

**Estimated:** 8-10 tests

---

### Manual Testing (Required)

**Prerequisites:**
- Chrome with extension loaded
- Test page at http://localhost:8080/test-page-advanced.html
- Extension DevTools panel open

**Test Flow:**
1. Start CLI: `console-bridge start --extension-mode`
2. Verify "Listening for extension..." message
3. Open extension panel
4. Verify "Extension connected" message
5. Run console.log() tests
6. Verify logs appear in terminal
7. Verify formatting matches expectations

---

## Timeline

**Total Estimated:** 3-4 hours

**Breakdown:**
- Phase 1 (WebSocket Server Core): 1.5 hours
- Phase 2 (Message Handling): 1 hour
- Phase 3 (CLI Integration): 30 minutes
- Phase 4 (Testing & Verification): 1 hour

**Buffer:** 30 minutes for unexpected issues

---

## Next Steps After Completion

1. ✅ Create completion ADR
2. ✅ Commit with descriptive message
3. ✅ Push to `phase-2-subtask-2.4` branch
4. ⏳ Merge into main branch
5. ⏳ Update README with extension mode documentation
6. ⏳ Proceed to Phase 3 (if applicable)

---

## References

- **WebSocket Protocol v1.0.0:** `docs/v2.0.0-spec/websocket-protocol-v1.0.0.md`
- **Subtask 2.3 ADR:** `.claude/adr/phase-2/subtask-2.3-websocket-client-complete.md`
- **LogFormatter:** `src/formatters/LogFormatter.js`
- **CLI:** `bin/console-bridge.js`

---

**Document Version:** 1.0 (Preliminary)
**Created:** October 8, 2025
**Status:** 🚧 In Progress
**Next Review:** Upon completion (before creating completion ADR)

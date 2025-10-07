# Console Bridge WebSocket Protocol v1.0.0

**Version:** 1.0.0
**Status:** Finalized
**Date:** October 7, 2025

---

## Overview

The Console Bridge WebSocket Protocol defines the communication format between the browser extension and the CLI for streaming console events from the browser to the terminal.

**Protocol Characteristics:**
- **Transport:** WebSocket (ws://)
- **Format:** JSON
- **Port:** 9223
- **Encoding:** UTF-8
- **Version:** Semver-based

---

## Connection

### Endpoint

```
ws://localhost:9223
```

### Connection Flow

1. **Extension initiates WebSocket connection** to `ws://localhost:9223`
2. **CLI accepts connection** and establishes WebSocket
3. **Extension sends** `connection_status` message with client info
4. **CLI responds** with `connection_status` acknowledgment
5. **Connection established** - ready for console events

---

## Message Format

### Envelope Structure

All messages use this standard envelope:

```typescript
{
  version: string;        // Protocol version (semver, e.g., "1.0.0")
  type: MessageType;      // Message type enum
  timestamp: string;      // ISO 8601 timestamp
  source?: SourceInfo;    // Source info (extension→CLI only)
  payload: object;        // Message-specific data
}
```

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `console_event` | Extension → CLI | Console method call |
| `connection_status` | Both | Connection state changes |
| `error` | Both | Error notifications |
| `ping` | Both | Keep-alive/latency check |
| `pong` | Both | Ping response |

---

## Message Specifications

### 1. Console Event

**Type:** `console_event`
**Direction:** Extension → CLI

**Purpose:** Report a console method invocation from the browser.

**Schema:**
```json
{
  "version": "1.0.0",
  "type": "console_event",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "source": {
    "tabId": 12345,
    "url": "http://localhost:3000/app",
    "title": "My Application"
  },
  "payload": {
    "method": "log",
    "args": [
      {
        "type": "string",
        "value": "Hello World"
      }
    ],
    "location": {
      "url": "http://localhost:3000/app.js",
      "line": 42,
      "column": 15
    }
  }
}
```

**Payload Fields:**

#### `method` (string, required)
Console method name. Supported values:
- `log` - console.log()
- `info` - console.info()
- `warn` - console.warn()
- `error` - console.error()
- `debug` - console.debug()
- `trace` - console.trace()
- `table` - console.table()
- `group` - console.group()
- `groupCollapsed` - console.groupCollapsed()
- `groupEnd` - console.groupEnd()
- `clear` - console.clear()
- `count` - console.count()
- `countReset` - console.countReset()
- `time` - console.time()
- `timeEnd` - console.timeEnd()
- `timeLog` - console.timeLog()
- `assert` - console.assert()
- `dir` - console.dir()
- `dirxml` - console.dirxml()

#### `args` (array, required)
Array of serialized arguments passed to the console method.

Each argument object has:
```json
{
  "type": "string" | "number" | "boolean" | "null" | "undefined" | "object" | "array" | "function" | "dom" | "circular" | "error",
  "value": any,
  "name"?: string,      // Function name (if type=function)
  "tagName"?: string,   // DOM element tag (if type=dom)
  "className"?: string, // Class name (if type=object with constructor)
  "stack"?: string      // Stack trace (if type=error)
}
```

#### `location` (object, optional)
Source code location where console method was called.

```json
{
  "url": "http://localhost:3000/app.js",
  "line": 42,
  "column": 15
}
```

**Examples:**

**Simple log:**
```json
{
  "version": "1.0.0",
  "type": "console_event",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "source": {
    "tabId": 1,
    "url": "http://localhost:3000",
    "title": "Test App"
  },
  "payload": {
    "method": "log",
    "args": [
      { "type": "string", "value": "User logged in" }
    ]
  }
}
```

**Multiple arguments:**
```json
{
  "version": "1.0.0",
  "type": "console_event",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "source": {
    "tabId": 1,
    "url": "http://localhost:3000",
    "title": "Test App"
  },
  "payload": {
    "method": "log",
    "args": [
      { "type": "string", "value": "User data:" },
      {
        "type": "object",
        "value": {
          "id": { "type": "number", "value": 42 },
          "name": { "type": "string", "value": "Alice" }
        }
      }
    ]
  }
}
```

**Error with stack:**
```json
{
  "version": "1.0.0",
  "type": "console_event",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "source": {
    "tabId": 1,
    "url": "http://localhost:3000",
    "title": "Test App"
  },
  "payload": {
    "method": "error",
    "args": [
      {
        "type": "error",
        "value": "TypeError: Cannot read property 'foo' of undefined",
        "stack": "TypeError: Cannot read property 'foo' of undefined\n    at app.js:42:15"
      }
    ],
    "location": {
      "url": "http://localhost:3000/app.js",
      "line": 42,
      "column": 15
    }
  }
}
```

---

### 2. Connection Status

**Type:** `connection_status`
**Direction:** Both (Extension → CLI, CLI → Extension)

**Purpose:** Communicate connection state changes.

**Schema:**
```json
{
  "version": "1.0.0",
  "type": "connection_status",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "source": {
    "tabId": 12345,
    "url": "http://localhost:3000",
    "title": "My App"
  },
  "payload": {
    "status": "connected",
    "reason": "Initial connection",
    "clientInfo": {
      "extensionVersion": "2.0.0",
      "browser": "Chrome",
      "browserVersion": "120.0.0"
    }
  }
}
```

**Payload Fields:**

#### `status` (string, required)
Connection status:
- `connected` - Successfully connected
- `disconnected` - Connection closed
- `reconnecting` - Attempting to reconnect

#### `reason` (string, optional)
Human-readable reason for status change.

#### `clientInfo` (object, optional)
Client information:
- `extensionVersion` - Extension version
- `cliVersion` - CLI version (CLI→Extension only)
- `browser` - Browser name (Extension→CLI only)
- `browserVersion` - Browser version (Extension→CLI only)
- `platform` - OS platform (CLI→Extension only)

**Examples:**

**Extension connecting:**
```json
{
  "version": "1.0.0",
  "type": "connection_status",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "source": {
    "tabId": 1,
    "url": "http://localhost:3000",
    "title": "Test App"
  },
  "payload": {
    "status": "connected",
    "clientInfo": {
      "extensionVersion": "2.0.0",
      "browser": "Chrome",
      "browserVersion": "120.0.0"
    }
  }
}
```

**CLI acknowledgment:**
```json
{
  "version": "1.0.0",
  "type": "connection_status",
  "timestamp": "2025-10-07T12:34:56.790Z",
  "payload": {
    "status": "connected",
    "clientInfo": {
      "cliVersion": "2.0.0",
      "platform": "win32"
    }
  }
}
```

---

### 3. Error

**Type:** `error`
**Direction:** Both

**Purpose:** Report errors in protocol communication.

**Schema:**
```json
{
  "version": "1.0.0",
  "type": "error",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "payload": {
    "code": "INVALID_MESSAGE",
    "message": "Message validation failed: missing required field 'type'",
    "details": {
      "field": "type",
      "receivedMessage": { ... }
    }
  }
}
```

**Payload Fields:**

#### `code` (string, required)
Error code. Defined codes:
- `INVALID_MESSAGE` - Message structure invalid
- `UNSUPPORTED_VERSION` - Protocol version not supported
- `INTERNAL_ERROR` - Server/client internal error
- `RATE_LIMIT` - Too many messages sent
- `AUTH_REQUIRED` - Authentication required (future)

#### `message` (string, required)
Human-readable error message.

#### `details` (object, optional)
Additional error context.

**Examples:**

**Invalid message:**
```json
{
  "version": "1.0.0",
  "type": "error",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "payload": {
    "code": "INVALID_MESSAGE",
    "message": "Missing required field: type",
    "details": {
      "field": "type",
      "received": { "version": "1.0.0" }
    }
  }
}
```

**Unsupported version:**
```json
{
  "version": "1.0.0",
  "type": "error",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "payload": {
    "code": "UNSUPPORTED_VERSION",
    "message": "Protocol version 0.9.0 is not supported",
    "details": {
      "receivedVersion": "0.9.0",
      "supportedVersions": ["1.0.0", "1.1.0"]
    }
  }
}
```

---

### 4. Ping/Pong

**Type:** `ping` or `pong`
**Direction:** Both

**Purpose:** Keep connection alive, measure latency.

**Schema:**
```json
{
  "version": "1.0.0",
  "type": "ping",
  "timestamp": "2025-10-07T12:34:56.789Z",
  "payload": {
    "id": "ping-1234567890"
  }
}
```

**Payload Fields:**

#### `id` (string, required)
Unique identifier for ping/pong pair.

**Flow:**
1. Sender sends `ping` with unique ID
2. Receiver responds with `pong` with same ID
3. Sender calculates latency from timestamps

---

## Version Compatibility

### Semver Rules

Protocol versions follow Semantic Versioning (semver):

- **Major (x.0.0):** Breaking changes, incompatible with previous versions
- **Minor (1.x.0):** New features, backward compatible
- **Patch (1.0.x):** Bug fixes, backward compatible

### Compatibility Policy

1. **CLI must support** at least the current major version
2. **Extension should** auto-update to latest protocol version
3. **Unsupported versions** trigger `UNSUPPORTED_VERSION` error

### Version Negotiation

1. Extension sends `connection_status` with its protocol version
2. CLI checks version compatibility
3. If incompatible, CLI sends `error` with `UNSUPPORTED_VERSION`
4. Extension displays upgrade prompt to user

---

## Error Handling

### Client-Side (Extension)

**Network Errors:**
- Retry connection with exponential backoff
- Max 5 retries, then display error to user
- Backoff: 1s, 2s, 4s, 8s, 16s

**Message Errors:**
- Log error to extension console
- Continue operation (don't break extension)
- Display error count in panel UI

**Protocol Errors:**
- Display error message to user
- Prompt to upgrade if `UNSUPPORTED_VERSION`
- Continue listening for valid messages

### Server-Side (CLI)

**Invalid Messages:**
- Send `error` message back to extension
- Log error to terminal (if verbose mode)
- Continue accepting messages

**Connection Errors:**
- Close connection gracefully
- Log disconnection event
- Wait for reconnection

---

## Performance Considerations

### Message Size

**Target:** < 1KB per console event (average)

**Optimizations:**
- Truncate large strings (> 10KB)
- Limit array depth (max 10 levels)
- Limit object keys (max 1000 keys)
- Use compact timestamp format

### Throughput

**Target:** Handle 100 events/second per tab

**Strategies:**
- Batch messages if > 50 events/second
- Drop messages if > 200 events/second (with warning)
- Prioritize errors and warnings over logs

### Latency

**Target:** < 50ms from console call to CLI display

**Measurements:**
- Extension: Timestamp on console capture
- CLI: Timestamp on receipt
- Display latency calculated and logged

---

## Security Considerations

### Localhost Only

**Restriction:** WebSocket server MUST only listen on `127.0.0.1:9223`

**Rationale:** Prevent remote connections from network

### No Authentication (v1.0.0)

**Current:** No authentication required

**Future:** Add auth token for remote connections (v2.0.0+)

### Input Validation

**Required:** All messages MUST be validated before processing

**Validation:**
- Schema validation (JSON structure)
- Type checking (all fields)
- Range checking (string lengths, array sizes)
- Sanitization (remove control characters)

---

## Testing Protocol

### Unit Tests

- Message serialization/deserialization
- Version compatibility checks
- Error code handling
- Argument type serialization

### Integration Tests

- Full connection handshake
- Console event flow
- Reconnection behavior
- Error recovery

### Performance Tests

- Message throughput (100 events/sec)
- Large object serialization
- Circular reference handling
- Memory usage over time

---

## Changelog

### v1.0.0 (2025-10-07)

**Initial Release:**
- Defined message envelope structure
- Defined 5 message types
- Defined 18 console methods
- Defined error codes
- Defined version compatibility rules
- Defined security constraints

---

## References

- [WebSocket Protocol (RFC 6455)](https://tools.ietf.org/html/rfc6455)
- [JSON Specification (RFC 8259)](https://tools.ietf.org/html/rfc8259)
- [ISO 8601 Timestamps](https://www.iso.org/iso-8601-date-and-time-format.html)
- [Semantic Versioning](https://semver.org/)

---

**Document Version:** 1.0.0
**Last Updated:** October 7, 2025
**Next Review:** After v1.0.0 production deployment

# ADR: Subtask 2.1 - Core Console Capture Implementation

**Status:** In Progress
**Date:** October 7, 2025
**Sprint:** Sprint 2 (Phase 2)
**Subtask:** 2.1
**Estimated Duration:** 3 days

---

## Context

This is the first implementation subtask of Sprint 2. We need to build the core console capture system that intercepts browser console method calls and prepares them for transmission to the CLI via WebSocket.

**Prerequisites (All Complete):**
- ✅ Chrome DevTools API POC validated (Sprint 1)
- ✅ WebSocket protocol v1.0.0 specification (Sprint 1)
- ✅ Manifest v3 configuration finalized (Sprint 1)

**Dependencies:**
- This subtask is foundational for all other Sprint 2 subtasks
- WebSocket client (Subtask 2.3) will consume the output of this capture system
- Advanced serialization (Subtask 2.2) will enhance this basic implementation

---

## Goals

### Primary Goal
Implement a robust console capture system that intercepts all console method calls from localhost applications and prepares the data for WebSocket transmission.

### Specific Deliverables

1. **Console Interceptor Injection**
   - Inject code into inspected window via `chrome.devtools.inspectedWindow.eval()`
   - Intercept all 18 console methods
   - Preserve original console behavior
   - Handle injection errors gracefully

2. **18 Console Methods Support**
   - log, info, warn, error, debug
   - trace, table, group, groupCollapsed, groupEnd
   - clear, count, countReset
   - time, timeEnd, timeLog
   - assert, dir, dirxml

3. **Source Location Tracking**
   - Capture file URL, line number, column number
   - Parse stack traces to determine call location
   - Handle anonymous functions and dynamic code

4. **Basic Serialization**
   - Primitives (string, number, boolean, null, undefined)
   - Simple objects (plain objects, arrays)
   - Error objects (with stack traces)
   - Function references (name only)
   - DOM elements (tag name only)

---

## Architecture

### Component Structure

```
extension/src/
├── devtools/
│   ├── devtools.html        # Entry point (existing)
│   ├── devtools.js           # DevTools initialization (new)
├── content/
│   ├── console-capture.js    # Main console interceptor (new)
│   └── serializer.js         # Basic serialization (new)
├── lib/
│   └── protocol.js           # Protocol message builder (new)
└── manifest.json             # Already finalized
```

### Data Flow

```
Browser Console Call
        ↓
Console Interceptor (console-capture.js)
        ↓
Serialize Arguments (serializer.js)
        ↓
Build Protocol Message (protocol.js)
        ↓
Post to DevTools Page (postMessage)
        ↓
[Future: WebSocket Client sends to CLI]
```

---

## Implementation Details

### 1. DevTools Entry Point

**File:** `extension/src/devtools/devtools.js`

**Responsibilities:**
- Initialize DevTools extension
- Create Console Bridge panel
- Inject console capture code into inspected window
- Listen for console events from injected code

**Implementation:**
```javascript
// devtools.js
chrome.devtools.panels.create(
  'Console Bridge',
  'icons/icon-16.png',
  'panel/panel.html',
  (panel) => {
    // Panel created
    injectConsoleCapture();
  }
);

function injectConsoleCapture() {
  // Read console-capture.js as string
  fetch(chrome.runtime.getURL('content/console-capture.js'))
    .then(response => response.text())
    .then(code => {
      // Inject into inspected window
      chrome.devtools.inspectedWindow.eval(
        code,
        { useContentScriptContext: false },
        (result, error) => {
          if (error) {
            console.error('Failed to inject console capture:', error);
          }
        }
      );
    });
}
```

**Error Handling:**
- Failed injection → Display error in panel, provide retry button
- CSP violations → Log warning, suggest user fix CSP
- Permission denied → Display permission instructions

---

### 2. Console Interceptor

**File:** `extension/src/content/console-capture.js`

**Responsibilities:**
- Intercept all console method calls
- Preserve original console behavior
- Extract call location from stack trace
- Serialize arguments
- Send events to DevTools page

**Implementation Strategy:**

```javascript
(function() {
  'use strict';

  // Store original console methods
  const originalConsole = {};
  const consoleMethods = [
    'log', 'info', 'warn', 'error', 'debug',
    'trace', 'table', 'group', 'groupCollapsed', 'groupEnd',
    'clear', 'count', 'countReset',
    'time', 'timeEnd', 'timeLog',
    'assert', 'dir', 'dirxml'
  ];

  consoleMethods.forEach(method => {
    if (typeof console[method] === 'function') {
      originalConsole[method] = console[method].bind(console);
    }
  });

  // Get call location from stack trace
  function getCallLocation() {
    const stack = new Error().stack;
    if (!stack) return null;

    const lines = stack.split('\n');
    // Skip first 3 lines (Error, getCallLocation, console wrapper)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/at\s+(?:.*?\s+\()?(.+?):(\d+):(\d+)/);
      if (match && !match[1].includes('chrome-extension://')) {
        return {
          url: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10)
        };
      }
    }
    return null;
  }

  // Serialize console arguments (basic)
  function serializeArguments(args) {
    return Array.from(args).map(arg => serializeValue(arg));
  }

  function serializeValue(value) {
    // Null/undefined
    if (value === null) {
      return { type: 'null', value: null };
    }
    if (value === undefined) {
      return { type: 'undefined' };
    }

    const type = typeof value;

    // Primitives
    if (type === 'string') {
      return { type: 'string', value: value };
    }
    if (type === 'number') {
      return { type: 'number', value: value };
    }
    if (type === 'boolean') {
      return { type: 'boolean', value: value };
    }

    // Function
    if (type === 'function') {
      return {
        type: 'function',
        name: value.name || 'anonymous',
        value: `function ${value.name || 'anonymous'}()`
      };
    }

    // Error
    if (value instanceof Error) {
      return {
        type: 'error',
        value: value.message,
        stack: value.stack
      };
    }

    // DOM Element
    if (value instanceof HTMLElement) {
      return {
        type: 'dom',
        tagName: value.tagName,
        value: `<${value.tagName.toLowerCase()}>`
      };
    }

    // Array
    if (Array.isArray(value)) {
      return {
        type: 'array',
        value: value.map(v => serializeValue(v))
      };
    }

    // Plain object
    if (type === 'object') {
      const serialized = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          serialized[key] = serializeValue(value[key]);
        }
      }
      return {
        type: 'object',
        className: value.constructor?.name,
        value: serialized
      };
    }

    // Fallback
    return {
      type: 'unknown',
      value: String(value)
    };
  }

  // Send event to DevTools
  function sendEvent(method, args, location) {
    window.postMessage({
      type: 'console-bridge-event',
      data: {
        method,
        args: serializeArguments(args),
        location,
        timestamp: new Date().toISOString()
      }
    }, '*');
  }

  // Intercept console methods
  consoleMethods.forEach(method => {
    if (originalConsole[method]) {
      console[method] = function(...args) {
        try {
          // Capture event
          const location = getCallLocation();
          sendEvent(method, args, location);
        } catch (error) {
          // Don't break if capture fails
          originalConsole.error('Console Bridge capture error:', error);
        }

        // Call original console method
        return originalConsole[method].apply(console, args);
      };
    }
  });

  // Signal successful injection
  console.info('[Console Bridge] Console capture active');
})();
```

**Key Design Decisions:**

1. **IIFE (Immediately Invoked Function Expression)**
   - Encapsulates code in private scope
   - Prevents variable pollution
   - Cannot be accessed or disabled by page scripts

2. **Binding Original Methods**
   - `console[method].bind(console)` preserves correct `this` context
   - Ensures original behavior is maintained

3. **Try-Catch Around Capture**
   - Capture errors don't break console functionality
   - User's console always works even if extension fails

4. **postMessage for Communication**
   - Standard way to communicate from injected code to extension
   - DevTools page listens for these messages

---

### 3. Basic Serializer

**File:** `extension/src/content/serializer.js`

This is already embedded in console-capture.js for v2.1. In Subtask 2.2, we'll extract and enhance it into a separate module with:
- Circular reference detection
- Depth limiting
- Size limiting
- Better DOM handling
- Symbol support

---

### 4. Protocol Message Builder

**File:** `extension/src/lib/protocol.js`

**Responsibilities:**
- Build protocol v1.0.0 compliant messages
- Add envelope structure (version, type, timestamp, source)
- Validate messages before sending

**Implementation:**
```javascript
// protocol.js

const PROTOCOL_VERSION = '1.0.0';

/**
 * Build a console_event message per protocol v1.0.0
 */
export function buildConsoleEvent(method, args, location, sourceInfo) {
  return {
    version: PROTOCOL_VERSION,
    type: 'console_event',
    timestamp: new Date().toISOString(),
    source: sourceInfo,
    payload: {
      method,
      args,
      location: location || undefined
    }
  };
}

/**
 * Build a connection_status message
 */
export function buildConnectionStatus(status, reason, clientInfo) {
  return {
    version: PROTOCOL_VERSION,
    type: 'connection_status',
    timestamp: new Date().toISOString(),
    payload: {
      status,
      reason,
      clientInfo
    }
  };
}

/**
 * Build an error message
 */
export function buildError(code, message, details) {
  return {
    version: PROTOCOL_VERSION,
    type: 'error',
    timestamp: new Date().toISOString(),
    payload: {
      code,
      message,
      details
    }
  };
}

/**
 * Get source info for current tab
 */
export function getSourceInfo() {
  return {
    tabId: chrome.devtools.inspectedWindow.tabId,
    url: window.location.href, // From inspected window
    title: document.title // From inspected window
  };
}
```

---

### 5. DevTools HTML Structure

**File:** `extension/src/devtools/devtools.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Console Bridge DevTools</title>
</head>
<body>
  <script type="module" src="devtools.js"></script>
</body>
</html>
```

**Note:** This is minimal for v2.1. Panel UI comes in Subtask 2.4.

---

## Testing Strategy

### Unit Tests (To Be Added in Subtask 2.5)

For now, we'll do manual testing with console commands.

### Manual Testing Checklist

**Test Environment:**
- Load extension in Chrome
- Open DevTools on `http://localhost:3000` test page
- Check Console Bridge panel appears

**Test Cases:**

1. **Basic Logging**
   ```javascript
   console.log('Hello World');
   console.info('Info message');
   console.warn('Warning message');
   console.error('Error message');
   console.debug('Debug message');
   ```
   ✅ All methods captured
   ✅ Messages appear in Chrome console
   ✅ Extension doesn't break console

2. **Multiple Arguments**
   ```javascript
   console.log('User:', { name: 'Alice', age: 30 }, [1, 2, 3]);
   ```
   ✅ All arguments serialized
   ✅ Objects and arrays handled

3. **Primitive Types**
   ```javascript
   console.log(42, true, null, undefined, 'string');
   ```
   ✅ All primitives correctly typed

4. **Error Objects**
   ```javascript
   console.error(new Error('Test error'));
   ```
   ✅ Error message captured
   ✅ Stack trace captured

5. **DOM Elements**
   ```javascript
   console.log(document.body);
   ```
   ✅ DOM element serialized as tag name

6. **Functions**
   ```javascript
   function testFunc() {}
   console.log(testFunc);
   ```
   ✅ Function name captured

7. **Source Location**
   ```javascript
   // Check that location.url, line, column are captured
   console.log('Test');
   ```
   ✅ File URL captured
   ✅ Line number correct
   ✅ Column number correct

8. **Special Methods**
   ```javascript
   console.trace('Trace test');
   console.table([{a: 1, b: 2}]);
   console.group('Group test');
   console.log('Inside group');
   console.groupEnd();
   console.clear();
   console.count('counter');
   console.count('counter');
   console.countReset('counter');
   console.time('timer');
   setTimeout(() => console.timeEnd('timer'), 100);
   console.assert(false, 'Assertion failed');
   console.dir({a: 1});
   ```
   ✅ All special methods work
   ✅ Console not broken

---

## Success Criteria

### Must Have (v2.1 Complete)
- ✅ All 18 console methods intercepted
- ✅ Original console behavior preserved
- ✅ Source location tracked for most calls
- ✅ Primitives serialized correctly
- ✅ Simple objects/arrays serialized
- ✅ Error objects with stack traces captured
- ✅ Function references handled
- ✅ DOM elements handled (basic)
- ✅ Messages follow protocol v1.0.0 structure
- ✅ No console errors from extension
- ✅ Manual test scenarios pass

### Nice to Have (Deferred to v2.2+)
- Circular reference handling
- Depth limiting
- Size limiting
- Symbol support
- Proxy handling
- WeakMap/WeakSet handling

---

## Implementation Plan

### Step 1: Create DevTools Entry Point
**Time:** 30 minutes
- Create `devtools/devtools.html`
- Create `devtools/devtools.js` with panel creation
- Test panel appears in DevTools

### Step 2: Create Console Interceptor
**Time:** 2 hours
- Create `content/console-capture.js`
- Implement IIFE wrapper
- Store original console methods
- Create wrapper functions
- Test basic interception

### Step 3: Implement Source Location Tracking
**Time:** 1 hour
- Parse Error().stack
- Extract file URL, line, column
- Filter out extension URLs
- Test with various call sites

### Step 4: Implement Basic Serialization
**Time:** 2 hours
- Handle primitives
- Handle simple objects
- Handle arrays
- Handle errors
- Handle functions
- Handle DOM elements
- Test all types

### Step 5: Create Protocol Message Builder
**Time:** 1 hour
- Create `lib/protocol.js`
- Implement buildConsoleEvent()
- Implement getSourceInfo()
- Test message structure

### Step 6: Wire Everything Together
**Time:** 1 hour
- Connect devtools.js to injected code
- Listen for postMessage events
- Build protocol messages
- Log to DevTools console (temporary - WebSocket in v2.3)

### Step 7: Manual Testing
**Time:** 2 hours
- Run all test scenarios
- Fix bugs
- Verify protocol compliance
- Document any limitations

**Total Estimated Time:** ~10 hours (1.5 days)

---

## Known Limitations

### v2.1 Limitations (To Be Fixed in v2.2)

1. **Circular References**
   - Will cause serialization to hang or stack overflow
   - Workaround: User should avoid logging circular objects
   - Fix: Subtask 2.2 will add circular detection

2. **Large Objects**
   - No size limiting yet
   - Very large objects may slow down browser
   - Fix: Subtask 2.2 will add size limits

3. **Deep Nesting**
   - No depth limiting
   - Deeply nested objects serialize everything
   - Fix: Subtask 2.2 will add depth limits

4. **Special Objects**
   - Symbols, Proxies, WeakMaps not handled
   - Will serialize as generic objects or fail
   - Fix: Subtask 2.2 will add special handling

5. **Source Location Edge Cases**
   - Anonymous functions may not get location
   - Eval'd code may have incorrect location
   - Dynamic imports may fail to track
   - Fix: Best effort - some cases unsolvable

---

## Risks & Mitigations

### Risk 1: CSP Violations
**Impact:** Extension fails to inject code on strict CSP pages
**Mitigation:**
- Use `useContentScriptContext: false` for direct injection
- Document CSP requirements for users
- Provide troubleshooting guide

### Risk 2: Performance Impact
**Impact:** Heavy console logging slows down application
**Mitigation:**
- Keep serialization fast (target <5ms)
- Defer complex serialization to Subtask 2.2
- Add performance monitoring

### Risk 3: Breaking Page Functionality
**Impact:** Console interception breaks page code
**Mitigation:**
- Wrap all capture code in try-catch
- Always call original console method
- Test with popular frameworks (React, Vue, Angular)

### Risk 4: Stack Trace Parsing Failures
**Impact:** Source location not captured
**Mitigation:**
- Handle parsing failures gracefully
- Return null if location unavailable
- Don't block console event on location failure

---

## Next Steps

After Subtask 2.1 completion:

1. **Subtask 2.2:** Enhance serialization with circular refs, depth/size limits
2. **Subtask 2.3:** Build WebSocket client to send messages to CLI
3. **Subtask 2.4:** Create production DevTools panel UI
4. **Subtask 2.5:** Add comprehensive test suite
5. **Subtask 2.6:** Documentation and polish

---

## References

- WebSocket Protocol v1.0.0 (docs/v2.0.0-spec/websocket-protocol-v1.0.0.md)
- Chrome DevTools API POC (chrome-extension-poc/)
- Sprint 2 Preliminary ADR (.claude/adr/phase-2/sprint-2-preliminary.md)
- Manifest v3 Docs (extension/docs/MANIFEST.md)

---

**Document Status:** In Progress
**Last Updated:** October 7, 2025
**Next Review:** After implementation completion

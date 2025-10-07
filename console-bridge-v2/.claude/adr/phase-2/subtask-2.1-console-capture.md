# ADR: Subtask 2.1 - Core Console Capture System

**Date:** 2025-10-07
**Status:** ✅ Completed
**Branch:** `phase-2-subtask-2.1`
**Final Commit:** `0eb3436`

---

## Context

Subtask 2.1 implements the foundational console capture system for Console Bridge v2.0. This is the first implementation task in Sprint 2 (Full Chrome Extension Implementation).

The goal is to intercept all 18 standard console methods in the browser, serialize their arguments, capture source location information, and transmit events to the DevTools page via `postMessage`.

---

## Decision

### Architecture

**1. IIFE-Based Console Interception**
- Wrapped all console capture code in an IIFE to avoid global scope pollution
- Stores references to original console methods before wrapping
- Creates wrapper functions that capture data then call original methods

**2. Console Method Coverage**
Intercept all 18 standard console methods:
- Output: `log`, `info`, `warn`, `error`, `debug`
- Inspection: `trace`, `dir`, `dirxml`, `table`
- Grouping: `group`, `groupCollapsed`, `groupEnd`
- Timing: `time`, `timeEnd`, `timeLog`
- Counting: `count`, `countReset`
- Other: `clear`, `assert`

**3. Source Location Tracking**
- Parse `Error().stack` to extract call location
- Return `{ url, line, column }` object
- Skip chrome-extension:// and chrome:// URLs
- Handle parsing failures gracefully (return null)

**4. Basic Serialization**
Serialize primitive types and basic structures:
- Primitives: `string`, `number`, `boolean`, `null`, `undefined`
- Functions: Extract name, return `function name()`
- Errors: Extract message and stack
- DOM Elements: Return `<tagName>`
- Arrays: Recursively serialize items
- Objects: Serialize enumerable properties

**Deferred to Subtask 2.2:**
- Circular reference detection
- Depth limiting
- Size limiting
- Special types (Symbol, BigInt, WeakMap, etc.)

**5. Event Transmission**
- Use `window.postMessage()` with type `'console-bridge-event'`
- Include: method, serialized args, location, timestamp
- Catch and log serialization errors without breaking console

**6. DevTools Integration**
- Inject capture code via `chrome.devtools.inspectedWindow.eval()`
- Fetch `console-capture.js` from extension resources
- Run injection on DevTools open (100ms delay)
- Set up message listener to count captured events
- Log initialization status to inspected window console

---

## Implementation Files

### Core Files

**`extension/src/content/console-capture.js`** (276 lines)
- IIFE-wrapped console interceptor
- Functions: `getCallLocation()`, `serializeValue()`, `serializeArguments()`, `sendEvent()`, `createConsoleWrapper()`
- Intercepts all 18 console methods
- Runs in inspected window context

**`extension/src/devtools/devtools.js`** (94 lines)
- DevTools entry point
- Functions: `injectConsoleCapture()`, `setupEventListener()`, `logToInspectedConsole()`
- Creates Console Bridge panel
- Injects capture code on DevTools open
- Sets up message listener (counts events, TODO: forward to WebSocket)

**`extension/src/lib/protocol.js`** (149 lines)
- Protocol v1.0.0 message builders
- IIFE-wrapped with `window.ConsoleBridgeProtocol` namespace
- Functions: `buildConsoleEvent()`, `buildConnectionStatus()`, `buildError()`, `buildPing()`, `buildPong()`
- Helper functions: `getSourceInfo()`, `getClientInfo()`, `validateMessage()`

**`extension/src/manifest.json`** (21 lines)
- Chrome Extension Manifest v3
- Permissions: `devtools`
- Host permissions: `http://localhost/*`, `http://127.0.0.1/*`
- Web accessible resources: `console-capture.js`
- No icons (deferred to future subtask)

### Test Files

**`test-page.html`** (285 lines)
- Comprehensive manual test page
- 20+ test scenarios covering:
  - All console methods
  - All data types
  - Source location tracking
  - Error handling
  - Multiple arguments
  - Nested structures

**`tests/manual/verify-extension-structure.js`** (203 lines)
- Automated structure validation
- Checks file existence and syntax
- Result: ✅ 55 checks passed, 3 warnings (missing icons - optional)

---

## Technical Challenges & Solutions

### Challenge 1: ES6 Module Syntax Not Supported
**Problem:** Used `export` statements in `protocol.js`, which Chrome extensions don't support without a build step.

**Solution:** Converted to IIFE pattern with window namespace:
```javascript
(function() {
  'use strict';
  function buildConsoleEvent(...) { ... }

  window.ConsoleBridgeProtocol = {
    buildConsoleEvent,
    // ... other exports
  };
})();
```

### Challenge 2: Missing Icon Files Broke Extension Loading
**Problem:** manifest.json referenced `icons/icon-16.png` which doesn't exist yet.

**Solution:**
- Removed `icons` section from manifest.json
- Changed panel icon parameter to empty string `''`
- Deferred icon creation to future subtask

### Challenge 3: Console Capture Not Injecting
**Problem:** Injection was tied to panel visibility event, which didn't fire reliably.

**Solution:**
- Changed to immediate injection on DevTools open with 100ms delay
- Added `logToInspectedConsole()` to log messages where user can see them
- Used `chrome.devtools.inspectedWindow.eval()` to inject directly

### Challenge 4: Infinite Loop in Event Display
**Problem:** Logging captured events to console created infinite recursion (logged events got captured again).

**Solution:**
- Removed `console.log()` of capture events
- Count events silently with `capturedEventCount++`
- Added TODO comment for WebSocket forwarding in Subtask 2.3

---

## Testing

### Manual Testing ✅
**Test Environment:**
- Browser: Chrome (latest)
- Extension loaded via Developer Mode
- Test page: `test-page.html` served via local web server

**Test Results:**
- ✅ All 18 console methods captured successfully
- ✅ All data types serialized correctly (primitives, objects, arrays, functions, errors, DOM elements)
- ✅ Source location tracking works (file, line, column)
- ✅ Original console behavior preserved
- ✅ No breaking errors or infinite loops
- ✅ Events transmitted via postMessage
- ✅ Performance excellent (no noticeable slowdown)

**User Feedback:**
> "User tested all buttons and confirmed ALL features working"
> Provided extensive console logs showing successful capture

### Automated Validation ✅
- Structure validation: ✅ 55 checks passed
- 3 warnings for missing icons (optional, deferred)

---

## Success Criteria

All success criteria for Subtask 2.1 met:

✅ **SC-2.1.1:** Console interception works for all 18 standard console methods
✅ **SC-2.1.2:** Original console behavior preserved (no breaking changes)
✅ **SC-2.1.3:** Source location captured (file, line, column)
✅ **SC-2.1.4:** Basic serialization handles primitives, objects, arrays, functions, errors, DOM elements
✅ **SC-2.1.5:** Events transmitted to DevTools via postMessage
✅ **SC-2.1.6:** Manual test page validates all functionality
✅ **SC-2.1.7:** No performance impact on console operations

---

## Known Limitations (To Address in Subtask 2.2)

1. **No circular reference detection** - Will cause stack overflow for circular structures
2. **No depth limiting** - Deep nested objects can cause performance issues
3. **No size limiting** - Large strings/objects not truncated
4. **Missing special types** - Symbol, BigInt, WeakMap, WeakSet, Proxy not handled
5. **Basic error handling** - Serialization failures return generic error message

---

## Next Steps

**Subtask 2.2: Advanced Object Serialization**
- Implement circular reference detection using WeakSet
- Add depth limiting (max 10 levels)
- Add size limiting (10KB strings, 1000 object keys)
- Handle special types (Symbol, BigInt, etc.)
- Add truncation indicators `[Circular]`, `[Object - max depth]`, `[String - truncated]`

**Dependencies:**
- None - Subtask 2.1 fully independent

**Branch Strategy:**
- Create `phase-2-subtask-2.2` from `phase-2-subtask-2.1`
- Merge 2.2 back to phase-2 when complete
- Continue pattern for 2.3, 2.4, 2.5, 2.6

---

## References

- Chrome DevTools Extension API: https://developer.chrome.com/docs/extensions/mv3/devtools/
- Console API Standard: https://console.spec.whatwg.org/
- postMessage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
- Error.stack parsing: https://v8.dev/docs/stack-trace-api

---

**Approved by:** User (manual testing confirmed)
**Implementation time:** ~4 hours
**Lines of code:** ~770 lines (implementation + tests)

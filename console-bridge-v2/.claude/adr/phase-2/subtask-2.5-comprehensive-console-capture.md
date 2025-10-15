# ADR: Comprehensive Console Capture - Phase 2, Subtask 2.5

**Date:** 2025-10-15
**Status:** ✅ Implementation Complete - Awaiting Testing (P0 - Critical Blocker for v2.0.0)
**Context:** Phase 2 - Extension Mode Development
**Subtask:** 2.5 - Comprehensive Console Capture (All Chrome Console Events)
**Implementation Date:** 2025-10-15

---

## Problem Statement

**Critical Issue Discovered:** Extension Mode currently captures ONLY explicit JavaScript `console.*()` method calls, but **misses 80% of what appears in Chrome DevTools Console**.

### What's Currently Captured ✅

- `console.log()` statements
- `console.info()` statements
- `console.warn()` statements
- `console.error()` statements (only if explicitly called in code)
- `console.debug()` statements

### What's Currently MISSING ❌

**1. Network Errors**
- 404 Not Found errors
- CORS errors
- Failed fetch requests
- XHR failures
- WebSocket connection errors

**2. Uncaught Exceptions**
- Uncaught TypeError
- Uncaught ReferenceError
- Uncaught SyntaxError
- Any `throw new Error()` not caught

**3. Unhandled Promise Rejections**
- `Promise.reject()` without `.catch()`
- Async/await errors not caught
- Failed async operations

**4. Framework Errors**
- React error boundary messages
- Vue/Angular framework warnings
- React development warnings
- Deprecation warnings

**5. Stack Traces**
- Full error stack traces (currently truncated or missing)
- Source map resolution
- File/line number information

**6. Browser-Generated Messages**
- Security warnings (CSP violations)
- Performance warnings
- Deprecation notices
- Extension conflicts

---

## Evidence of the Problem

### User's Test Case (October 15, 2025)

**Chrome Console Shows:**
```
[Presence] Joined as: Wise Tiger
[Presence] User left: a3351454-f093-40b7-bf84-ef4c6b28f560
[Presence] User joined: Wise Tiger
[Presence] Received users list: 1

FileViewModal.tsx:38  GET http://localhost:4000/api/components/modal-dialog/source 404 (Not Found)
fetchSourceCode @ FileViewModal.tsx:38
(anonymous) @ FileViewModal.tsx:29
commitHookEffectListMount @ chunk-AVJPV5ZH.js?v=9b8ed755:16915
... [full stack trace]

FileViewModal.tsx:38 Fetch failed loading: GET "http://localhost:4000/api/components/modal-dialog/source".
fetchSourceCode @ FileViewModal.tsx:38
... [full stack trace]
```

**Terminal Shows (via Extension Mode):**
```
[01:20:24] [unknown] log: [Presence] Joined as: Wise Tiger
[01:20:24] [unknown] log: [Presence] User left: a3351454-f093-40b7-bf84-ef4c6b28f560
[01:20:24] [unknown] log: [Presence] User joined: Wise Tiger
[01:20:24] [unknown] log: [Presence] Received users list: 1
```

**Missing in Terminal:**
- ❌ 404 Network Error
- ❌ "Fetch failed loading" error message
- ❌ Stack traces from FileViewModal.tsx
- ❌ React internal stack traces

**Result:** Only ~20% of console activity captured!

---

## Root Cause Analysis

### Current Implementation (Incomplete)

**File:** `chrome-extension-poc/panel.js`

**Current Strategy:** Override JavaScript `console.*` methods only
```javascript
// Lines 297-378: monitorConsoleAPI()
['log', 'info', 'warn', 'error', 'debug', 'dir', 'table', 'trace'].forEach(function(method) {
  const original = console[method];
  console[method] = function(...args) {
    // Capture and queue event
    window.__consoleBridgeQueue.push({...});
    original.apply(console, args);
  };
});
```

**Why This Fails:**
- Only captures **explicit** `console.error()` calls in user code
- Does **NOT** capture browser-generated errors (404s, exceptions)
- Does **NOT** capture errors from `window.onerror`
- Does **NOT** capture promise rejections from `window.onunhandledrejection`
- Does **NOT** capture network failures (fetch/XHR errors)

---

## Solution Design

### Required Event Listeners

To achieve **1:1 parity** with Chrome Console, we need:

#### 1. Console API Override (Already Working ✅)
```javascript
// Current implementation - KEEP THIS
console.log/info/warn/error/debug/dir/table/trace
```

#### 2. Global Error Handler ❌ (NEW)
```javascript
window.addEventListener('error', function(event) {
  // Captures:
  // - Uncaught exceptions
  // - Script loading errors
  // - Syntax errors
  window.__consoleBridgeQueue.push({
    method: 'error',
    args: [event.message],
    timestamp: Date.now(),
    location: {
      url: window.location.href,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    },
    stackTrace: event.error ? event.error.stack : null
  });
});
```

#### 3. Unhandled Promise Rejection Handler ❌ (NEW)
```javascript
window.addEventListener('unhandledrejection', function(event) {
  // Captures:
  // - Promise.reject() without .catch()
  // - Async/await errors
  window.__consoleBridgeQueue.push({
    method: 'error',
    args: [`Unhandled Promise Rejection: ${event.reason}`],
    timestamp: Date.now(),
    location: { url: window.location.href },
    stackTrace: event.reason ? event.reason.stack : null
  });
});
```

#### 4. Network Error Monitoring ❌ (NEW - Complex)

**Option A: Intercept Fetch API**
```javascript
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args)
    .then(response => {
      if (!response.ok) {
        // Capture 404, 500, etc.
        window.__consoleBridgeQueue.push({
          method: 'error',
          args: [`GET ${args[0]} ${response.status} (${response.statusText})`],
          timestamp: Date.now(),
          location: { url: window.location.href }
        });
      }
      return response;
    })
    .catch(error => {
      // Capture network failures
      window.__consoleBridgeQueue.push({
        method: 'error',
        args: [`Fetch failed: ${error.message}`],
        timestamp: Date.now(),
        location: { url: window.location.href }
      });
      throw error;
    });
};
```

**Option B: Intercept XMLHttpRequest**
```javascript
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...args) {
  this.__url = url;
  this.__method = method;
  return originalOpen.apply(this, [method, url, ...args]);
};

XMLHttpRequest.prototype.send = function(...args) {
  this.addEventListener('load', function() {
    if (this.status >= 400) {
      window.__consoleBridgeQueue.push({
        method: 'error',
        args: [`${this.__method} ${this.__url} ${this.status} (${this.statusText})`],
        timestamp: Date.now(),
        location: { url: window.location.href }
      });
    }
  });

  this.addEventListener('error', function() {
    window.__consoleBridgeQueue.push({
      method: 'error',
      args: [`Network error: ${this.__method} ${this.__url}`],
      timestamp: Date.now(),
      location: { url: window.location.href }
    });
  });

  return originalSend.apply(this, args);
};
```

#### 5. Chrome DevTools Console API ❌ (NEW - Advanced)

**Use Chrome DevTools Protocol to listen to Console domain:**
```javascript
// In panel.js (DevTools context, NOT page context)
chrome.devtools.inspectedWindow.eval(
  `(() => {
    // This approach won't work - needs CDP access
    // Alternative: Use chrome.debugger API
  })();`
);
```

**Better Approach: chrome.debugger API**
```javascript
// Request debugger permission in manifest.json
// Attach to Console domain
// Listen to Console.messageAdded events
```

---

## Implementation Plan

### Phase 1: Basic Error Capture (P0 - Must Have)

**File:** `chrome-extension-poc/panel.js`

**Tasks:**
1. Add `window.addEventListener('error')` for uncaught exceptions
2. Add `window.addEventListener('unhandledrejection')` for promise rejections
3. Test with:
   - `throw new Error('test')`
   - `Promise.reject('test')`
   - Syntax errors
4. Verify stack traces are captured

**Estimated Time:** 1-2 hours

---

### Phase 2: Network Error Capture (P0 - Must Have)

**File:** `chrome-extension-poc/panel.js`

**Tasks:**
1. Intercept `window.fetch` API
2. Intercept `XMLHttpRequest` API
3. Capture:
   - HTTP error codes (404, 500, etc.)
   - Network failures (CORS, connection refused)
   - Failed fetch requests
4. Test with:
   - `fetch('http://localhost:4000/nonexistent')` → 404
   - `fetch('https://cors-fail.example.com')` → CORS error
   - Offline network simulation

**Estimated Time:** 2-3 hours

**Complexity:** Medium (need to preserve original behavior)

---

### Phase 3: Chrome DevTools Console Integration (P1 - Nice to Have)

**Approach:** Use `chrome.debugger` API to attach to Console domain

**Challenges:**
- Requires `debugger` permission (may trigger user warning)
- More complex implementation
- May conflict with other debugging tools

**Decision:** Defer to v2.1.0 if Phases 1-2 provide sufficient coverage

**Estimated Time:** 4-6 hours (if pursued)

---

## Testing Strategy

### Test Cases

#### Test 1: Uncaught Exception
```javascript
// In page console
throw new Error('Uncaught test error');
```
**Expected Terminal Output:**
```
[HH:MM:SS] [localhost:5173] error: Uncaught Error: Uncaught test error
  at <file>:<line>:<col>
```

---

#### Test 2: Unhandled Promise Rejection
```javascript
// In page console
Promise.reject('Unhandled promise rejection');
```
**Expected Terminal Output:**
```
[HH:MM:SS] [localhost:5173] error: Unhandled Promise Rejection: Unhandled promise rejection
```

---

#### Test 3: Network 404 Error
```javascript
// In page console
fetch('http://localhost:4000/nonexistent');
```
**Expected Terminal Output:**
```
[HH:MM:SS] [localhost:5173] error: GET http://localhost:4000/nonexistent 404 (Not Found)
```

---

#### Test 4: Fetch Failure
```javascript
// In page console (with network offline)
fetch('https://example.com');
```
**Expected Terminal Output:**
```
[HH:MM:SS] [localhost:5173] error: Fetch failed: Failed to fetch
```

---

#### Test 5: Console.log (Already Working)
```javascript
// In page console
console.log('Hello from Extension Mode!');
```
**Expected Terminal Output:**
```
[HH:MM:SS] [localhost:5173] log: Hello from Extension Mode!
```

---

#### Test 6: Real-World Scenario (User's Bug)
**Reproduce user's FileViewModal.tsx 404 error:**
```javascript
fetch('http://localhost:4000/api/components/modal-dialog/source');
```
**Expected Terminal Output:**
```
[HH:MM:SS] [localhost:5173] error: GET http://localhost:4000/api/components/modal-dialog/source 404 (Not Found)
[HH:MM:SS] [localhost:5173] error: Fetch failed loading: GET "http://localhost:4000/api/components/modal-dialog/source"
  at fetchSourceCode (FileViewModal.tsx:38)
  ... [stack trace]
```

---

## Success Criteria

### Definition of Done

- ✅ **100% Console Parity** - Everything visible in Chrome Console appears in terminal
- ✅ **Test Coverage** - All 6 test cases pass
- ✅ **Real-World Validation** - User's FileViewModal.tsx 404 error captured
- ✅ **No Breaking Changes** - Existing console.log() capture still works
- ✅ **Stack Traces** - Error stack traces included in terminal output
- ✅ **Performance** - No noticeable performance degradation

### Acceptance Criteria

**Before (Current State):**
- ❌ Only captures explicit `console.*()` calls
- ❌ Misses network errors
- ❌ Misses uncaught exceptions
- ❌ Misses promise rejections
- ❌ ~20% console coverage

**After (Target State):**
- ✅ Captures explicit `console.*()` calls
- ✅ Captures network errors (404, fetch failures)
- ✅ Captures uncaught exceptions
- ✅ Captures promise rejections
- ✅ Captures stack traces
- ✅ ~100% console coverage (same as Chrome DevTools Console)

---

## Risks & Mitigation

### Risk 1: Breaking Existing Functionality
**Mitigation:**
- Keep existing `console.*` overrides unchanged
- Add new listeners without removing old code
- Test all existing console.log() test cases

### Risk 2: Performance Impact
**Mitigation:**
- Intercept only at top level (not recursive)
- Queue messages efficiently
- Test with high-frequency logging

### Risk 3: Conflicts with Other Extensions
**Mitigation:**
- Don't use `chrome.debugger` API (deferred to v2.1.0)
- Use standard web APIs (fetch, XHR, window events)
- Test in clean Chrome profile

### Risk 4: Missing Edge Cases
**Mitigation:**
- Comprehensive test suite (6+ test cases)
- Real-world validation with user's app
- Document known limitations

---

## Dependencies

**Blocks:**
- v2.0.0 Chrome Web Store submission (P0 blocker)
- Screenshot creation (need functional extension)
- GitHub release v2.0.0

**Requires:**
- Template literal bug fix (Subtask 2.3) - ✅ Complete
- Extension Mode basic implementation (Subtask 2.1-2.4) - ✅ Complete

---

## Timeline

**Estimated Total Time:** 3-5 hours

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| Phase 1 | Uncaught exceptions + promise rejections | 1-2 hours | P0 |
| Phase 2 | Network error interception (fetch + XHR) | 2-3 hours | P0 |
| Testing | All 6 test cases + real-world validation | 1 hour | P0 |
| **Total** | **P0 work only** | **4-6 hours** | **Must complete before v2.0.0** |

**Phase 3 (Chrome DevTools Console API):** Deferred to v2.1.0 (not required for v2.0.0 launch)

---

## Related ADRs

- Subtask 2.1: Console Capture System (basic implementation)
- Subtask 2.3: Template Literal Bug Fix (fixed console.log capture)
- Subtask 2.4: WebSocket Server (CLI integration)

---

## Decision

**Proceed with Phases 1-2** (error handlers + network interception) as **P0 blocker** for v2.0.0.

**Defer Phase 3** (Chrome DevTools Console API) to v2.1.0 based on user feedback.

**Rationale:**
- Phases 1-2 provide ~95% console coverage (sufficient for v2.0.0)
- Phase 3 adds complexity (debugger permission) for minimal benefit
- User testing will reveal if Phase 3 is needed

---

## Implementation Checklist

### Before Starting
- [x] Create branch: `phase-2-subtask-2.5-comprehensive-console-capture`
- [x] Review existing panel.js implementation
- [ ] Set up test environment (localhost app with errors)

### Phase 1: Error Handlers
- [x] Add `window.addEventListener('error')` handler
- [x] Add `window.addEventListener('unhandledrejection')` handler
- [ ] Test uncaught exception capture
- [ ] Test promise rejection capture
- [ ] Verify stack traces included

### Phase 2: Network Interception
- [x] Intercept `window.fetch` API
- [x] Intercept `XMLHttpRequest` API
- [ ] Test 404 error capture
- [ ] Test fetch failure capture
- [ ] Test CORS error capture (if applicable)
- [ ] Verify error messages match Chrome Console format

### Testing & Validation
- [ ] All 6 test cases passing
- [ ] User's FileViewModal.tsx 404 error captured
- [ ] No performance degradation
- [ ] No breaking changes to existing console.log() capture
- [ ] Stack traces properly formatted

### Documentation & Merge
- [x] Update ADR with implementation completion status
- [x] Add code comments explaining error handlers
- [ ] Test in clean Chrome profile (no conflicts)
- [x] Commit with descriptive message
- [ ] Merge to `phase-8-chrome-web-store-submission`
- [ ] Push to all relevant branches (master, pre-release, phase-8, snapshot)

---

## Implementation Complete (October 15, 2025)

### What Was Implemented

**File Modified:** `chrome-extension-poc/panel.js` (lines 364-520 in `monitorConsoleAPI()` function)

**Phase 1: Global Error Handlers** ✅
- Added `window.addEventListener('error')` to capture uncaught exceptions
- Added `window.addEventListener('unhandledrejection')` to capture promise rejections
- Both handlers include stack trace capture and location information
- Errors pushed to `window.__consoleBridgeQueue` with proper structure

**Phase 2: Network Error Interception** ✅
- Intercepted `window.fetch` API to capture HTTP errors (404, 500, etc.)
- Intercepted `XMLHttpRequest` API to capture XHR errors
- Both HTTP status code errors and network failures captured
- Original behavior preserved (re-throw errors to maintain app functionality)

### Code Additions

**Error Handler (lines 364-386):**
```javascript
window.addEventListener('error', function(event) {
  try {
    if (!window.__consoleBridgeQueue) {
      window.__consoleBridgeQueue = [];
    }

    window.__consoleBridgeQueue.push({
      method: 'error',
      args: [event.message],
      timestamp: Date.now(),
      location: {
        url: window.location.href,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      stackTrace: event.error ? event.error.stack : null
    });
  } catch (error) {
    console.error('[Console Bridge] Error handler failed:', error);
  }
}, true);
```

**Promise Rejection Handler (lines 388-412):**
```javascript
window.addEventListener('unhandledrejection', function(event) {
  try {
    if (!window.__consoleBridgeQueue) {
      window.__consoleBridgeQueue = [];
    }

    const reason = event.reason;
    const message = reason instanceof Error
      ? reason.message
      : String(reason);

    window.__consoleBridgeQueue.push({
      method: 'error',
      args: [`Unhandled Promise Rejection: ${message}`],
      timestamp: Date.now(),
      location: {
        url: window.location.href
      },
      stackTrace: reason instanceof Error ? reason.stack : null
    });
  } catch (error) {
    console.error('[Console Bridge] Promise rejection handler failed:', error);
  }
});
```

**Fetch Interception (lines 414-464):**
```javascript
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || 'unknown';
  const method = args[1] && args[1].method ? args[1].method.toUpperCase() : 'GET';

  return originalFetch.apply(this, args)
    .then(response => {
      if (!response.ok) {
        // Capture HTTP errors
        window.__consoleBridgeQueue.push({
          method: 'error',
          args: [`${method} ${url} ${response.status} (${response.statusText})`],
          timestamp: Date.now(),
          location: { url: window.location.href }
        });
      }
      return response;
    })
    .catch(error => {
      // Capture network failures
      window.__consoleBridgeQueue.push({
        method: 'error',
        args: [`Fetch failed loading: ${method} "${url}".`],
        timestamp: Date.now(),
        location: { url: window.location.href },
        stackTrace: error.stack || null
      });
      throw error; // Preserve original behavior
    });
};
```

**XHR Interception (lines 466-520):**
```javascript
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...args) {
  this.__consoleBridge_url = url;
  this.__consoleBridge_method = method;
  return originalXHROpen.apply(this, [method, url, ...args]);
};

XMLHttpRequest.prototype.send = function(...args) {
  this.addEventListener('load', function() {
    if (this.status >= 400) {
      // Capture HTTP errors
      window.__consoleBridgeQueue.push({
        method: 'error',
        args: [`${this.__consoleBridge_method} ${this.__consoleBridge_url} ${this.status} (${this.statusText})`],
        timestamp: Date.now(),
        location: { url: window.location.href }
      });
    }
  });

  this.addEventListener('error', function() {
    // Capture network failures
    window.__consoleBridgeQueue.push({
      method: 'error',
      args: [`Network error: ${this.__consoleBridge_method} ${this.__consoleBridge_url}`],
      timestamp: Date.now(),
      location: { url: window.location.href }
    });
  });

  return originalXHRSend.apply(this, args);
};
```

### Expected Coverage Improvement

**Before:** ~20% console coverage (only explicit `console.*()` calls)
**After:** ~95-100% console coverage including:
- ✅ console.log/info/warn/error/debug (already working)
- ✅ Uncaught exceptions
- ✅ Unhandled promise rejections
- ✅ HTTP errors (404, 500, etc.)
- ✅ Network failures (CORS, connection refused)
- ✅ Stack traces

### Next Steps

**Required Testing:**
1. Load extension in Chrome (chrome://extensions/ → Reload)
2. Start CLI in extension mode: `console-bridge start --extension-mode`
3. Run 6 test cases (see Testing Strategy section above)
4. Validate user's FileViewModal.tsx 404 error is captured
5. Verify no breaking changes to existing console.log() capture

**On Test Success:**
- Merge to `phase-8-chrome-web-store-submission`
- Push to all 4 branches (master, pre-release, phase-8, snapshot)
- Proceed with Chrome Web Store screenshots and submission

---

## Notes

**User Quote (October 15, 2025):**
> "this is an issue we have to finish before we repush to those 4 branches again and then proceed to the images and publishing to google extensions since by this being the case, we know the apps not fully functional beside just console log streaming. we need more than that. all interaction streaming direct console on google to terminal ide 1-1 relationship"

**Key Insight:** User expects **1:1 relationship** between Chrome Console and terminal output. Anything less is unacceptable for v2.0.0 launch.

---

**Status:** ✅ Implementation Complete - Awaiting Testing (October 15, 2025)

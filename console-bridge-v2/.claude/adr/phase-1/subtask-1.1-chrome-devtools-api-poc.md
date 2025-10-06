# ADR: Subtask 1.1 - Chrome DevTools API Proof-of-Concept

**Status:** In Progress
**Date:** 2025-10-06
**Phase:** Sprint 1 - Architecture & Planning
**Subtask:** 1.1 - Chrome DevTools API Research & POC
**Branch:** `phase-1-subtask-1.1`

---

## Context

Console Bridge v2.0.0 requires a browser extension to capture console events from the user's actual browser (Chrome/Firefox/Safari), solving the v1.0.0 limitation where only Puppeteer-controlled browsers could be monitored.

**v1.0.0 Limitation:**
- Can ONLY monitor Puppeteer-controlled Chromium browser
- Cannot monitor user's personal Chrome, Firefox, Safari browsers
- User must use Puppeteer headful mode for manual interaction
- Breaks natural developer workflow

**v2.0.0 Solution:**
- Browser extension captures console events inside user's actual browser
- Extension sends logs to Console Bridge CLI via WebSocket
- User can use their preferred browser with extensions (React DevTools, etc.)
- Dual-mode operation: Extension Mode (new) + Puppeteer Mode (preserved)

**Why POC First:**
Before building the full Chrome extension (Sprint 2-3), we need to validate:
1. Chrome DevTools APIs can capture all 18 console methods
2. Extension can serialize complex objects (circular references, DOM elements, functions)
3. WebSocket connection from extension to CLI is reliable
4. Extension performance impact is acceptable
5. No blocking API limitations exist

---

## Decision

**Create minimal Chrome extension POC with:**

### Core Components
1. **Manifest v3 structure** - Modern Chrome extension format
2. **DevTools panel integration** - Official Chrome DevTools extension point
3. **Console event capture** - Using Chrome DevTools APIs
4. **WebSocket client** - Connect to `ws://localhost:9223`
5. **Simple UI** - Connection status indicator in DevTools panel

### Technical Approach
- Use `chrome.devtools.inspectedWindow.eval()` for console capture
- Create DevTools panel (appears alongside Console, Network, etc.)
- Capture console events in panel context (isolated from page)
- Serialize arguments before sending via WebSocket
- Show "Connected" / "Disconnected" status in panel UI

---

## Alternatives Considered

### Alternative 1: chrome.devtools.network API
**Description:** Use Network panel APIs to intercept console-related network activity

**Pros:**
- Access to network requests and responses
- Can see XHR/fetch console output

**Cons:**
- ❌ Doesn't directly capture console events
- ❌ Would require intercepting/patching console API on page
- ❌ Indirect approach, fragile

**Rejected:** Not designed for console capture

---

### Alternative 2: chrome.debugger API
**Description:** Use Chrome Debugging Protocol via chrome.debugger API

**Pros:**
- ✅ Full Chrome DevTools Protocol access
- ✅ Can capture everything CDP supports
- ✅ Same protocol Puppeteer uses

**Cons:**
- ❌ Requires `debugger` permission (scary for users: "This extension can read and change all your data")
- ❌ Incompatible with DevTools being open (shows "DevTools disconnected" warning)
- ❌ Conflicts with developer's actual DevTools usage
- ❌ Heavy-handed approach for simple console capture

**Rejected:** Permission model too intrusive, conflicts with DevTools

---

### Alternative 3: Content Script Console Interception
**Description:** Inject content script that patches console methods

**Pros:**
- ✅ Direct access to console API
- ✅ Can capture before console methods execute

**Cons:**
- ❌ Pollutes page context (visible to user's app)
- ❌ Blocked by Content Security Policy (CSP)
- ❌ Can be detected/blocked by page scripts
- ❌ Fragile (can be overwritten by page code)
- ❌ Ethical concerns (modifying user's page behavior)

**Rejected:** Too invasive, breaks CSP, unreliable

---

### Alternative 4: chrome.devtools.inspectedWindow.eval() (CHOSEN)
**Description:** Use DevTools inspectedWindow API with DevTools panel

**Pros:**
- ✅ Clean separation from page context
- ✅ Official Chrome DevTools extension integration
- ✅ Works alongside user's open DevTools
- ✅ No scary permissions needed (just `devtools`)
- ✅ Doesn't pollute page environment
- ✅ Can evaluate code in page context safely
- ✅ Access to console API via inspectedWindow

**Cons:**
- ⚠️ Requires DevTools to be open (acceptable for developer tool)
- ⚠️ Slightly more complex than content script approach

**Chosen:** Best balance of capability, user trust, and reliability

---

## Implementation Plan

### File Structure

```
console-bridge-v2/
└── chrome-extension-poc/
    ├── manifest.json          # Manifest v3 configuration
    ├── devtools.html          # DevTools page entry point
    ├── devtools.js            # Creates DevTools panel
    ├── panel.html             # Panel UI (shows in DevTools)
    ├── panel.js               # Console capture logic + WebSocket
    └── icons/                 # Extension icons
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

### Implementation Steps

**Step 1: Create manifest.json**
- Manifest version 3
- Request `devtools` permission only
- Specify `devtools_page: "devtools.html"`
- Add host permissions for localhost

**Step 2: Create devtools.html/js**
- Simple HTML page (required by manifest)
- JavaScript creates DevTools panel using `chrome.devtools.panels.create()`
- Panel points to `panel.html`

**Step 3: Create panel.html**
- Simple UI showing:
  - Connection status (Connected / Disconnected)
  - WebSocket server address (ws://localhost:9223)
  - Console event count
  - Last error (if any)

**Step 4: Implement panel.js - Console Capture**
- Use `chrome.devtools.inspectedWindow.eval()` to inject capture script
- Capture all console methods: log, info, warn, error, debug, dir, dirxml, table, trace, etc.
- Serialize arguments (handle objects, arrays, DOM elements, circular refs)
- Queue captured events

**Step 5: Implement panel.js - WebSocket Client**
- Connect to `ws://localhost:9223`
- Send captured events as JSON messages
- Handle connection/disconnection/reconnection
- Update UI with connection status

**Step 6: Test POC**
- Load extension in Chrome (chrome://extensions/ → Developer mode → Load unpacked)
- Open DevTools on localhost page
- Navigate to "Console Bridge" panel
- Trigger console.log() events
- Verify events sent via WebSocket

---

## Console Method Coverage

**Must capture all 18 console methods:**

### Logging Methods (Primary)
1. `console.log()` - General logging
2. `console.info()` - Informational messages
3. `console.warn()` - Warnings
4. `console.error()` - Errors
5. `console.debug()` - Debug messages

### Object Inspection
6. `console.dir()` - Object properties
7. `console.dirxml()` - XML/HTML element tree
8. `console.table()` - Tabular data

### Tracing & Stack
9. `console.trace()` - Stack trace

### Grouping
10. `console.group()` - Start group
11. `console.groupCollapsed()` - Start collapsed group
12. `console.groupEnd()` - End group

### Utilities
13. `console.clear()` - Clear console
14. `console.assert()` - Assertion logging
15. `console.count()` - Counter
16. `console.countReset()` - Reset counter

### Timing
17. `console.time()` - Start timer
18. `console.timeEnd()` - End timer and log

### Profiling (Optional - v2.1.0)
19. `console.profile()` - Start profile
20. `console.profileEnd()` - End profile

---

## Object Serialization Strategy

**Challenge:** Console arguments can include:
- Primitive values (strings, numbers, booleans, null, undefined)
- Objects and arrays (including nested)
- Circular references (object referring to itself)
- DOM elements (e.g., `console.log(document.body)`)
- Functions (e.g., `console.log(myFunction)`)
- Symbols
- Large objects (potentially MB of data)

**Solution:**

```javascript
function serializeConsoleArgs(args) {
  return args.map(arg => {
    try {
      // Primitives - pass through
      if (typeof arg !== 'object' || arg === null) {
        return arg;
      }

      // DOM Elements - special handling
      if (arg instanceof Element) {
        return {
          __type: 'DOMElement',
          tagName: arg.tagName,
          id: arg.id,
          className: arg.className,
          outerHTML: arg.outerHTML.substring(0, 500) // Truncate large HTML
        };
      }

      // Functions - special handling
      if (typeof arg === 'function') {
        return {
          __type: 'Function',
          name: arg.name || '(anonymous)',
          source: arg.toString().substring(0, 200) // Truncate large functions
        };
      }

      // Objects/Arrays - handle circular references
      const seen = new WeakSet();
      return JSON.parse(JSON.stringify(arg, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }
        return value;
      }));

    } catch (error) {
      return {
        __type: 'SerializationError',
        message: `Failed to serialize: ${error.message}`,
        originalType: typeof arg
      };
    }
  });
}
```

---

## WebSocket Message Protocol (POC)

**Extension → CLI (Console Event):**

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
  "extensionVersion": "2.0.0-poc"
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

**Extension → CLI (Connection Handshake):**

```json
{
  "type": "connect",
  "browser": "chrome",
  "browserVersion": "118.0.5993.117",
  "extensionVersion": "2.0.0-poc",
  "tabId": "chrome-tab-abc123",
  "tabUrl": "http://localhost:3847",
  "timestamp": 1728226335000
}
```

---

## Acceptance Criteria

### POC Must Demonstrate:
- [ ] Extension loads in Chrome DevTools without errors
- [ ] "Console Bridge" panel appears in DevTools tabs
- [ ] Panel UI shows connection status
- [ ] WebSocket connects to `ws://localhost:9223`
- [ ] `console.log()` events captured and serialized
- [ ] Complex objects serialized correctly (nested objects, arrays)
- [ ] Circular references handled (don't crash)
- [ ] DOM elements serialized with tag/id/class info
- [ ] Functions serialized with name and source preview
- [ ] Messages sent via WebSocket in correct JSON format
- [ ] No noticeable performance impact on test page
- [ ] Works with React DevTools also installed (no conflicts)

### Documentation:
- [ ] All 18 console methods tested (document which ones work)
- [ ] API limitations documented
- [ ] Performance characteristics documented
- [ ] Object serialization edge cases documented

---

## Research Questions

**Questions to Answer During POC:**

1. **Console Method Coverage:**
   - Can we capture all 18 console methods via DevTools API?
   - Are there methods that don't fire events we can capture?
   - Do different console methods provide different metadata?

2. **Object Serialization:**
   - What's the maximum object size we can serialize?
   - How do we handle circular references reliably?
   - Can we preserve object types (Date, RegExp, Error, etc.)?

3. **WebSocket:**
   - What's the message size limit for WebSocket?
   - Does WebSocket connection stay alive across page navigations?
   - How quickly can we reconnect on disconnect?

4. **Performance:**
   - What's the overhead of capturing console events?
   - Does high-frequency logging cause performance issues?
   - Should we throttle/batch messages?

5. **Browser Compatibility:**
   - Does this approach work in Chrome Canary/Beta/Dev?
   - Will the same APIs work in Chromium-based browsers (Edge, Brave)?
   - What's different for Firefox (prep for Sprint 5)?

6. **Edge Cases:**
   - What happens if DevTools is closed?
   - What happens if WebSocket server isn't running?
   - Can we capture logs from iframes?
   - Can we capture logs from service workers?

---

## Risks

### Risk 1: Chrome DevTools API Limitations
**Probability:** Medium
**Impact:** High

**Risk:** DevTools APIs might not provide access to all console methods or metadata we need

**Mitigation:**
- Research official Chrome extension documentation thoroughly
- Test all 18 console methods explicitly
- Document workarounds for any limitations
- Have fallback plan (chrome.debugger API if absolutely necessary)

---

### Risk 2: Object Serialization Failures
**Probability:** Medium
**Impact:** Medium

**Risk:** Complex objects (circular refs, large objects, special types) might fail to serialize

**Mitigation:**
- Implement robust try-catch in serialization
- Test with intentionally complex objects (circular refs, DOM trees, etc.)
- Truncate large strings/objects
- Return error placeholders instead of crashing

---

### Risk 3: WebSocket Connection Instability
**Probability:** Low
**Impact:** High

**Risk:** WebSocket connection might drop frequently, causing lost logs

**Mitigation:**
- Implement automatic reconnection logic
- Queue messages during disconnect
- Show clear connection status in UI
- Test connection stability over extended periods

---

### Risk 4: Performance Impact
**Probability:** Medium
**Impact:** Medium

**Risk:** Capturing and serializing high-frequency console logs might slow down browser

**Mitigation:**
- Profile extension performance
- Test with high-frequency logging (e.g., console.log in animation frame)
- Consider throttling/batching if necessary
- Monitor memory usage

---

### Risk 5: DevTools Must Be Open
**Probability:** N/A (Known Limitation)
**Impact:** Low

**Known Limitation:** DevTools APIs only work when DevTools is open

**Mitigation:**
- Document this clearly in user guide
- This is acceptable for developer tool (developers have DevTools open anyway)
- Not a blocker for v2.0.0 MVP

---

## Success Metrics

**POC is successful if:**

1. ✅ All 18 console methods can be captured (or workarounds documented)
2. ✅ WebSocket connection works reliably
3. ✅ Complex object serialization works (circular refs, DOM elements, functions)
4. ✅ No critical API limitations discovered
5. ✅ Performance impact is acceptable (< 5% overhead)
6. ✅ Clear path forward to full extension implementation (Sprint 2)

**POC would fail if:**
- ❌ Cannot capture essential console methods (log, error, warn)
- ❌ WebSocket connection is too unstable
- ❌ Severe API limitations block core functionality
- ❌ Unacceptable performance impact (> 20% overhead)

---

## Next Steps

### After POC Completion:

**If POC Succeeds:**
1. Update this ADR with findings and lessons learned
2. Document API capabilities and limitations
3. Create detailed implementation plan for Sprint 2
4. Proceed to Subtask 1.2: Development Environment Setup
5. Start Sprint 2: Full Chrome extension implementation

**If POC Reveals Issues:**
1. Document issues in this ADR
2. Evaluate alternative approaches
3. Determine if issues are blockers or can be worked around
4. Adjust Sprint 2 plan accordingly

### Immediate Next Subtasks:
- **Subtask 1.2:** Development environment setup (Sprint 1)
- **Subtask 1.3:** WebSocket message protocol finalization (Sprint 1)
- **Subtask 1.4:** Extension manifest v3 finalization (Sprint 1)

---

## Related Documentation

- [Console Bridge v2.0.0 Implementation Plan](../../versions/2.0.0/implementation-plan.md)
- [Console Bridge v2.0.0 Goals and Understanding](../../versions/2.0.0/goals-and-understanding.md)
- [Console Bridge v2.0.0 Clarifications](../../../docs/v2.0.0-spec/clarifications.md)
- [ADR 0002: Version 1.0.0 Release](../../../docs/adr/0002-version-1.0.0-release.md)

---

## Appendix: Chrome DevTools Extension APIs

### Key APIs for POC:

**chrome.devtools.panels.create()**
- Creates a new panel in DevTools
- Panel appears alongside Console, Network, Elements, etc.
- Provides isolated environment for extension UI

**chrome.devtools.inspectedWindow.eval()**
- Evaluate JavaScript in context of inspected page
- Can access page's console API
- Returns results to extension context

**chrome.devtools.inspectedWindow.onResourceAdded**
- Fires when page adds new resources
- Useful for detecting page navigation

**chrome.devtools.network** (optional)
- Access to Network panel events
- Can see XHR/fetch requests
- Not primary approach, but good for context

### Resources:
- [Chrome DevTools Extensions](https://developer.chrome.com/docs/extensions/mv3/devtools/)
- [chrome.devtools API Reference](https://developer.chrome.com/docs/extensions/reference/devtools_panels/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

**Status:** ⏳ Ready to Implement
**Created:** 2025-10-06
**Last Updated:** 2025-10-06
**Next Review:** After POC completion

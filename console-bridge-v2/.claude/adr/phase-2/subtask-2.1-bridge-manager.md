# ADR: 2.1 - BridgeManager Implementation

**Status:** Draft
**Date Created:** 2025-10-02
**Date Completed:** _pending_
**Author:** Claude + User
**Subtask:** 2.1 - BridgeManager Core Logic

---

## Context

Phase 1 established the foundation with `BrowserPool`, `LogCapturer`, URL utilities, and color formatting. Phase 2 focuses on creating the **BridgeManager** - the central orchestrator that ties all components together to enable multi-instance console bridging.

**Requirements:**
- Coordinate multiple browser instances via BrowserPool
- Manage LogCapturers for each URL
- Format and output logs to the terminal
- Handle lifecycle (start, stop, cleanup)
- Support adding/removing URLs dynamically
- Handle errors gracefully

**From Phase 1:**
- ✅ BrowserPool manages browser instances
- ✅ LogCapturer captures console events
- ✅ URL utilities validate and normalize localhost URLs
- ✅ Color system assigns consistent colors to sources

---

## Decision

**Approach:**
Create a `BridgeManager` class in `src/core/BridgeManager.js` that:

1. **Manages the lifecycle** of console bridging
2. **Coordinates components**: BrowserPool + LogCapturers + Formatters
3. **Handles multiple URLs** simultaneously
4. **Outputs formatted logs** to terminal in real-time

**Key Design Choices:**

### Architecture:
```
BridgeManager
├── BrowserPool (manages browser instances)
├── Map<url, LogCapturer> (one capturer per URL)
├── LogFormatter (formats logs for output)
└── EventEmitter (for extensibility)
```

### API Design:
```javascript
class BridgeManager {
  constructor(options)              // Initialize with options
  async addUrl(url)                 // Add URL to monitor
  async removeUrl(url)              // Stop monitoring URL
  async start(urls)                 // Start monitoring multiple URLs
  async stop()                      // Stop all monitoring
  getActiveUrls()                   // Get list of active URLs
  isActive(url)                     // Check if URL is being monitored
}
```

### Log Flow:
```
Browser Console Event
  ↓
LogCapturer (captures & serializes)
  ↓
BridgeManager (receives log data)
  ↓
LogFormatter (formats with colors)
  ↓
Terminal Output (console.log)
```

### Error Handling Strategy:
- **URL validation**: Reject invalid/non-localhost URLs upfront
- **Browser failures**: Log error, allow other instances to continue
- **Capturer errors**: Catch and log, don't crash entire bridge
- **Cleanup**: Always cleanup resources in finally blocks

---

## Alternatives Considered

### Option 1: Single Process for All URLs
**Pros:**
- Simpler architecture
- Lower resource usage
- Faster startup

**Cons:**
- All URLs share browser instance
- One crash affects all
- Harder to isolate issues

**Why not chosen:** Isolation is crucial. Each URL should have independent browser for stability.

### Option 2: Separate Process Per URL
**Pros:**
- Maximum isolation
- Truly independent
- Can restart individual URLs

**Cons:**
- Much higher resource usage
- Complex IPC required
- Overkill for localhost monitoring

**Why not chosen:** Too complex for the use case. In-process isolation via BrowserPool is sufficient.

### Option 3: Event-Based Architecture Only
**Pros:**
- Highly decoupled
- Easy to extend
- Testable in isolation

**Cons:**
- Harder to trace flow
- More boilerplate
- Debugging complexity

**Why not chosen:** Direct method calls are clearer for this use case. Can add events later if needed.

### Option 4: Stream-Based Output
**Pros:**
- Backpressure handling
- Buffering support
- Pipe-able

**Cons:**
- More complex API
- Harder to use
- Unnecessary for terminal output

**Why not chosen:** Direct console.log is simpler and sufficient. Streams add complexity without clear benefit.

---

## Implementation Plan

### Phase 2.1 Tasks:

1. **Create `src/core/BridgeManager.js`**
   - Constructor with options
   - URL management (add/remove)
   - Lifecycle methods (start/stop)
   - Log handling callback

2. **Create `src/formatters/LogFormatter.js`**
   - Format log entries with colors
   - Include timestamp, source, level
   - Handle different log types (log, warn, error, etc.)
   - Pretty-print objects/arrays

3. **Integration:**
   - BridgeManager uses BrowserPool
   - BridgeManager creates LogCapturers
   - LogCapturer callbacks → BridgeManager → LogFormatter → terminal

4. **Testing:**
   - Unit tests for BridgeManager
   - Unit tests for LogFormatter
   - Integration test for full flow
   - **100% passing required** ⭐

---

## Technical Specifications

### BridgeManager State:
```javascript
{
  browserPool: BrowserPool,           // Manages browsers
  capturers: Map<url, LogCapturer>,   // One per URL
  formatter: LogFormatter,            // Formats logs
  options: {
    maxInstances: 10,                 // Max concurrent URLs
    headless: true,                   // Browser mode
    levels: ['log', 'info', ...],     // Log levels to capture
  }
}
```

### Log Data Format:
```javascript
{
  type: 'log' | 'info' | 'warn' | 'error' | 'debug',
  args: Array<any>,                   // Serialized arguments
  source: 'http://localhost:5555/',   // Source URL
  timestamp: 1234567890,              // Unix timestamp
  location: {url, lineNumber, columnNumber}
}
```

### Formatted Output Example:
```
[12:34:56] [localhost:5555] log: Hello world
[12:34:57] [localhost:6666] warn: Something happened
[12:34:58] [localhost:5555] error: Error occurred
```

---

## Consequences

### Positive:
- ✅ Clean separation of concerns
- ✅ Easy to test each component
- ✅ Extensible design
- ✅ Handles multiple URLs efficiently
- ✅ Graceful error handling

### Negative:
- Memory usage scales with number of URLs
- Each URL requires ~100-150MB (Puppeteer overhead)
- Complex lifecycle management
- Need careful cleanup to prevent leaks

### Neutral:
- Event system can be added later if needed
- Output format can be customized later
- CLI integration is Phase 3

---

## Testing Strategy

### Unit Tests:
```javascript
describe('BridgeManager', () => {
  test('adds URL and creates browser instance')
  test('removes URL and cleans up resources')
  test('handles multiple URLs simultaneously')
  test('rejects invalid URLs')
  test('handles browser launch failures')
  test('stops all instances on stop()')
  test('formats logs correctly')
})
```

### Integration Test:
```javascript
describe('Bridge Integration', () => {
  test('captures and outputs logs from test server')
  test('handles errors from browser')
  test('correctly colors different sources')
})
```

### Coverage Target:
- BridgeManager: **> 90%**
- LogFormatter: **> 90%**
- Integration: Key flows covered

---

## Success Criteria

- [ ] BridgeManager created and working
- [ ] LogFormatter created and working
- [ ] Can add/remove URLs dynamically
- [ ] Logs output to terminal with correct formatting
- [ ] All tests passing (100%) ⭐
- [ ] No memory leaks (verified with repeated add/remove)
- [ ] Error handling works correctly
- [ ] Code coverage > 90%

---

## Post-Implementation (To be filled after coding)

_Will document:_
- Actual implementation details
- Deviations from plan
- Challenges encountered
- Test results
- Lessons learned

---

## Related Decisions

- Builds on Phase 1: BrowserPool, LogCapturer, utilities
- Sets foundation for Phase 3: CLI integration
- References testing conventions in `.claude/workflows/conventions/testing-conventions.md`

---

## Notes

This is the **core of the console bridge**. Everything else feeds into or out of the BridgeManager. Quality and reliability are critical.

**Next Steps:** Implement, test rigorously, verify 100% success.

# ADR: 1.2 - Basic Puppeteer Integration

**Status:** Draft  
**Date Created:** 2025-10-02  
**Date Completed:** _pending_  
**Author:** Claude + User  
**Subtask:** 1.2 - Basic Puppeteer Integration

---

## Context

Need to integrate Puppeteer to launch Chrome/Chromium browsers and capture console events. This is the core technology that enables Console Bridge to work.

**Requirements from Implementation Plan:**
- Create BrowserPool class to manage browser instances
- Implement browser instance creation with proper configuration
- Add instance tracking with Map
- Implement max instances limit (default: 10)
- Implement destroy() and destroyAll() methods
- Create LogCapturer class for console event handling
- Implement page.on('console', ...) event listener
- Extract console message type and arguments
- Convert JSHandles to JSON values
- Handle serialization errors gracefully
- Write comprehensive unit tests (>80% coverage)

---

## Decision

**Approach:**
1. Create `BrowserPool` class in `src/core/BrowserPool.js`
2. Create `LogCapturer` class in `src/core/LogCapturer.js`
3. Use Puppeteer v21.0 with custom configuration for stability
4. Implement resource limits and cleanup mechanisms
5. Add robust error handling for browser launch failures

**Key Technical Choices:**

### Browser Configuration:
```javascript
{
  headless: 'new',  // Use new headless mode
  args: [
    '--no-sandbox',              // Required for some environments
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',   // Overcome limited resource problems
    '--disable-gpu',             // Applicable to Windows
    '--disable-web-security',    // Allow localhost cross-origin
  ],
  defaultViewport: {
    width: 1920,
    height: 1080
  }
}
```

### Instance Management:
- Use Map<url, {browser, page, url}> for O(1) lookups
- Maximum 10 instances by default (configurable)
- Each instance tracked independently
- Graceful cleanup on destroy

### Console Event Capture:
- Listen to 'console', 'pageerror', 'requestfailed' events
- Async extraction of JSHandle arguments
- Fallback to toString() for non-serializable objects
- Handle errors during argument extraction gracefully

---

## Alternatives Considered

### Option 1: Playwright instead of Puppeteer
**Pros:**
- Multi-browser support (Chrome, Firefox, Safari)
- Modern API design
- Better TypeScript support
- Built-in retry mechanisms

**Cons:**
- Heavier dependency (~200MB vs ~130MB)
- More complex for simple use case
- Localhost-only doesn't need multi-browser
- Less familiar to many developers

**Why not chosen:** Over-engineered for our needs. Puppeteer is sufficient for Chrome/Chromium on localhost.

### Option 2: Direct Chrome DevTools Protocol (CDP)
**Pros:**
- Lower-level control
- No abstraction layer
- Smaller dependency footprint

**Cons:**
- Much more code to write
- Have to handle protocol versioning
- Harder to maintain
- No high-level convenience methods

**Why not chosen:** Puppeteer provides perfect abstraction level. Don't need lower-level control.

### Option 3: Selenium WebDriver
**Pros:**
- Multi-browser support
- Well-established standard
- Large community

**Cons:**
- Requires separate browser drivers
- More complex setup
- Overkill for console log capture
- Slower than Puppeteer

**Why not chosen:** Too heavyweight. Puppeteer is purpose-built for Chrome automation.

### Option 4: Single global browser with multiple pages
**Pros:**
- Lower resource usage
- Faster page creation
- Simpler lifecycle

**Cons:**
- Shared crash risk (one crash kills all)
- More complex error recovery
- Potential resource contention

**Why not chosen:** Isolation is more important than resource savings. Each URL gets its own browser for stability.

---

## Consequences

### Positive:
- Stable, well-tested Puppeteer API
- Active community and frequent updates
- Excellent documentation
- Browser instances isolated (crash doesn't affect others)
- Clean resource management with BrowserPool

### Negative:
- Chrome/Chromium dependency required on user's system
- ~130MB dependency size for Puppeteer
- Memory usage: ~100-150MB per browser instance
- Limited to Chromium-based browsers only

### Neutral:
- Node.js 16+ requirement (acceptable, it's 2025)
- Headless mode only (actually preferred for this tool)

---

## Implementation Notes

### Pre-Implementation (Written BEFORE coding):

**Files to Create:**
- `src/core/BrowserPool.js`
- `src/core/LogCapturer.js`
- `test/unit/BrowserPool.test.js`
- `test/unit/LogCapturer.test.js`

**BrowserPool API:**
```javascript
class BrowserPool {
  constructor(options)       // maxInstances, headless
  async create(url)          // Create browser for URL
  get(url)                   // Get existing instance
  has(url)                   // Check if exists
  async destroy(url)         // Destroy specific instance
  async destroyAll()         // Destroy all instances
  count()                    // Get active count
  getUrls()                  // Get all URLs
}
```

**LogCapturer API:**
```javascript
class LogCapturer {
  constructor(page, url, options)  // Page, URL, filter options
  start(callback)                  // Start capturing
  stop()                           // Stop capturing
  handleConsoleMessage(msg)        // Process console event
  handlePageError(error)           // Process page error
  handleRequestFailed(request)     // Process failed request
  extractArgs(msg)                 // Extract and serialize args
}
```

**Testing Strategy:**
- Mock Puppeteer browser/page objects
- Test browser creation and cleanup
- Test instance limits
- Test error scenarios (launch failures, crashes)
- Test console event capture
- Test argument serialization for different types

**Expected Challenges:**
- Handling non-serializable objects in console
- Browser launch timeouts
- Race conditions during cleanup
- Memory leaks if cleanup fails

---

## Post-Implementation (Updated AFTER coding):

_To be filled after implementation_

---

## Related Decisions

- Links to TRD.md section on Puppeteer configuration
- Builds on subtask 1.1 (project initialization)
- Foundation for subtask 2.1 (BridgeManager)

---

## Verification

- [ ] BrowserPool creates browsers successfully
- [ ] Instance limit enforced
- [ ] Cleanup properly closes all browsers
- [ ] LogCapturer captures all console event types
- [ ] Arguments serialized correctly for primitives, objects, arrays
- [ ] Non-serializable objects handled gracefully
- [ ] Tests pass with >80% coverage
- [ ] No memory leaks during repeated create/destroy cycles
- [ ] Error messages are clear and helpful

---

## Notes

This is a critical foundation subtask. Everything else depends on reliable browser management and console capture.

Next subtask (1.3) will add URL utilities to validate and normalize localhost URLs.

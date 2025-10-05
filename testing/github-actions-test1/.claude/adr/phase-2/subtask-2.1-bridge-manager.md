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

For full ADR content, see original in console-bridge-c-s-4.5 project.

# ADR: 3.0 - CLI Integration

**Status:** Draft
**Date Created:** 2025-10-02
**Date Completed:** _pending_
**Author:** Claude + User
**Phase:** 3 - CLI Integration

---

## Context

Phase 2 completed the BridgeManager and LogFormatter, providing the core functionality for console bridging. Phase 3 focuses on creating a user-friendly CLI that makes the tool accessible via command line.

**Current State:**
- ✅ BridgeManager orchestrates console bridging
- ✅ LogFormatter outputs colored logs
- ✅ All core functionality tested and working

**Requirements:**
- CLI entry point for global installation
- Commands: `start`, `stop`, `status`
- Options for customization (log levels, headless mode, etc.)
- Graceful shutdown on Ctrl+C
- User-friendly output and error messages
- Help documentation

---

## Decision

**Approach:**
Create a CLI using Commander.js in `bin/console-bridge.js` that:

1. **Provides intuitive commands** for common operations
2. **Connects to BridgeManager** to execute operations
3. **Handles signals gracefully** (SIGINT, SIGTERM)
4. **Shows helpful output** (startup, logs, errors)

**Key Design Choices:**

### CLI Architecture:
```
bin/console-bridge.js (CLI entry)
  ↓
Commander.js (parse args)
  ↓
BridgeManager (execute)
  ↓
Terminal output
```

### Command Structure:
```bash
# Start monitoring
console-bridge start <urls...>

# Options
console-bridge start localhost:3000 --levels log,error --no-timestamp

# Future commands (if needed)
console-bridge stop
console-bridge status
```

### Signal Handling:
```
SIGINT (Ctrl+C) → Graceful shutdown
  1. Display shutdown message
  2. Stop BridgeManager
  3. Close all browsers
  4. Exit cleanly (code 0)

SIGTERM → Graceful shutdown
  1. Same as SIGINT
```

---

## Alternatives Considered

### Option 1: Separate Server Process
**Pros:**
- Can control running bridges remotely
- `start` launches daemon, `stop` kills it
- Status tracking

**Cons:**
- Much more complex
- Need IPC or socket communication
- Daemon management overhead
- Overkill for dev tool

**Why not chosen:** Single-process is simpler for a dev tool. No need for daemon.

### Option 2: Interactive TUI (Terminal UI)
**Pros:**
- Rich interface with panels
- Can toggle URLs on/off
- Filter logs interactively

**Cons:**
- Complex to build/maintain
- Libraries like blessed add dependencies
- Harder to pipe output
- Steeper learning curve

**Why not chosen:** Simple CLI is more flexible. Can pipe, redirect, etc.

### Option 3: Config File Support
**Pros:**
- Can save common URL sets
- Reusable configurations
- Shareable with team

**Cons:**
- Adds complexity
- Most use cases are ad-hoc
- Can add later if needed

**Why not chosen:** YAGNI - add if users request it.

---

## Implementation Plan

### Phase 3 Tasks:

1. **Create `bin/console-bridge.js`**
   - Shebang for Node.js execution
   - Commander.js setup
   - Command definitions
   - Help text

2. **Implement `start` command**
   - Parse URLs from arguments
   - Parse options (--levels, --headless, etc.)
   - Create BridgeManager instance
   - Call manager.start(urls)
   - Display startup message

3. **Implement signal handlers**
   - Handle SIGINT (Ctrl+C)
   - Handle SIGTERM
   - Graceful cleanup
   - Exit messages

4. **Update `package.json`**
   - Add `bin` field
   - Point to `bin/console-bridge.js`
   - Make executable

5. **Testing:**
   - Unit tests for CLI parsing
   - Integration tests for full flow
   - Test graceful shutdown
   - **100% passing required** ⭐

---

## Technical Specifications

### CLI Options:
```javascript
{
  levels: 'log,info,warn,error,debug',  // Comma-separated
  headless: true,                       // --no-headless to show browser
  maxInstances: 10,                     // Max concurrent URLs
  showTimestamp: true,                  // --no-timestamp to hide
  showSource: true,                     // --no-source to hide
  showLocation: false,                  // --location to show
  timestampFormat: 'time'               // 'time' or 'iso'
}
```

### Command Examples:
```bash
# Basic usage
console-bridge start localhost:3000

# Multiple URLs
console-bridge start localhost:3000 localhost:8080 localhost:5000

# Custom log levels
console-bridge start localhost:3000 --levels error,warn

# Show browser (non-headless)
console-bridge start localhost:3000 --no-headless

# Show location info
console-bridge start localhost:3000 --location

# ISO timestamps
console-bridge start localhost:3000 --timestamp-format iso
```

### Startup Output:
```
🌉 Console Bridge v1.0.0

Starting monitors...
✓ localhost:3000
✓ localhost:8080

Monitoring 2 URLs. Press Ctrl+C to stop.

[12:34:56] [localhost:3000] log: Application started
[12:34:57] [localhost:8080] info: Server ready
```

### Shutdown Output:
```
^C
Shutting down gracefully...
✓ Stopped localhost:3000
✓ Stopped localhost:8080

Console Bridge stopped.
```

---

## Consequences

### Positive:
- ✅ User-friendly interface
- ✅ Standard CLI patterns
- ✅ Easy to install globally
- ✅ Graceful error handling
- ✅ Piping and redirection supported

### Negative:
- CLI adds another layer to test
- Need to handle edge cases (invalid URLs, ports in use, etc.)
- Signal handling can be tricky on Windows

### Neutral:
- Can add more commands later if needed
- Config file support can be added later
- TUI can be separate package later

---

## Testing Strategy

### Unit Tests:
```javascript
describe('CLI', () => {
  test('parses start command with URLs')
  test('parses options correctly')
  test('validates URL arguments')
  test('shows help when no args')
  test('shows version with --version')
})
```

### Integration Tests:
```javascript
describe('CLI Integration', () => {
  test('starts bridge with single URL')
  test('starts bridge with multiple URLs')
  test('handles invalid URLs gracefully')
  test('handles Ctrl+C shutdown')
  test('displays startup messages')
  test('outputs logs correctly')
})
```

### Coverage Target:
- CLI module: **> 85%** (signal handling hard to test)
- Integration: Key flows covered

---

## Success Criteria

- [ ] CLI entry point created and working
- [ ] `start` command works with single/multiple URLs
- [ ] Options parsed correctly
- [ ] Signal handling works (graceful shutdown)
- [ ] Helpful startup/shutdown messages
- [ ] All tests passing (100%) ⭐
- [ ] Package.json configured for global install
- [ ] Can install and run globally: `npm install -g .`

---

## Post-Implementation (To be filled after coding)

_Will document:_
- Actual implementation details
- Edge cases handled
- Test results
- User experience observations

---

## Related Decisions

- Builds on Phase 2: BridgeManager, LogFormatter
- Uses Commander.js (already in dependencies)
- References testing conventions

---

## Notes

This makes the tool **usable**. Focus on developer experience - clear messages, helpful errors, graceful behavior.

**Next Steps:** Implement CLI, test thoroughly, verify 100% success.

# ADR 0001: Unified Terminal Output

## Status
**PROPOSED** - 2025-10-04

## Context

### Problem Statement
Console Bridge currently requires developers to manage two separate terminals:
1. **Terminal 1**: Development server (e.g., `npm run dev`)
2. **Terminal 2**: Console Bridge monitor (`console-bridge start localhost:3000`)

This split-terminal workflow creates friction:
- **Context Switching**: Developers must constantly switch between terminals to correlate dev server output with console logs
- **Screen Real Estate**: Two terminals occupy more screen space, problematic on smaller displays
- **Workflow Disruption**: Breaking mental flow to check another terminal reduces productivity
- **Onboarding Complexity**: New users find the two-terminal setup confusing

### User Request
Users have requested the ability to stream Console Bridge logs to the **same terminal** as their development server, creating a unified view of all application output.

### Desired Behavior
```bash
# Single terminal with merged output
npm run dev
# ✓ Ready on localhost:3847
# ○ Compiling /...
# [03:14:22] [localhost:3847] log: Button clicked    ← Console Bridge
# ○ Compiling /page...
# [03:14:25] [localhost:3847] error: API failed      ← Console Bridge
```

---

## Decision

### Selected Approach: **Process Attachment with Graceful Fallback**

We will implement a **process discovery and stream redirection** mechanism that:

1. **Discovers the dev server process** listening on the specified port
2. **Attaches to the process's stdout stream** to merge Console Bridge output
3. **Falls back gracefully** to separate terminal if attachment fails
4. **Remains opt-in** via new `--merge-output` flag

### Implementation Strategy

#### New CLI Flag
```bash
# Headless + Unified Terminal (Option 3)
console-bridge start localhost:3847 --merge-output

# Headful + Unified Terminal (Option 4)
console-bridge start localhost:3847 --no-headless --merge-output
```

#### Core Components

**1. TerminalAttacher (`src/core/TerminalAttacher.js`)**
- Discovers process by port using `lsof` (Unix) or `netstat` (Windows)
- Attaches to process stdout stream
- Manages stream lifecycle (attach/detach)
- Handles platform differences (Windows/macOS/Linux)

**2. ProcessDiscovery (`src/utils/processUtils.js`)**
- Port-to-PID resolution
- Process validation (ensure it's a dev server)
- Cross-platform compatibility layer

**3. Enhanced BridgeManager**
- Accepts `mergeOutput` option
- Delegates stream redirection to TerminalAttacher
- Maintains backward compatibility (default: separate terminal)

#### Technical Flow

```
1. User runs: console-bridge start localhost:3847 --merge-output
                │
                ▼
2. CLI parses --merge-output flag
                │
                ▼
3. BridgeManager initializes with mergeOutput: true
                │
                ▼
4. TerminalAttacher.findDevServerProcess(3847)
                │
                ├─ lsof -i :3847 (Unix)
                └─ netstat -ano | findstr :3847 (Windows)
                │
                ▼
5. Process found? (PID: 12345)
                │
                ├─ YES → attachToProcess(12345)
                │         │
                │         └─ Redirect BridgeManager.output → process.stdout
                │
                └─ NO → Graceful fallback
                          │
                          └─ Log warning, use separate terminal
                │
                ▼
6. Console Bridge logs now appear in dev server terminal
```

---

## Consequences

### Positive

✅ **Improved Developer Experience**
- Single terminal to monitor all output
- Reduced context switching
- Cleaner workspace

✅ **Backward Compatibility**
- Opt-in via `--merge-output` flag
- Existing workflows unaffected
- No breaking changes

✅ **Graceful Degradation**
- Falls back to separate terminal if attachment fails
- Clear error messages guide users
- Continues functioning normally

✅ **Framework Agnostic**
- Works with any dev server (React, Next.js, Vite, Express)
- Port-based discovery is universal
- No framework-specific code required

✅ **Cross-Platform Support**
- Windows, macOS, Linux support
- Platform-specific implementations abstracted

### Negative

❌ **Implementation Complexity**
- Process discovery requires platform-specific logic
- Stream redirection adds complexity
- Error handling for edge cases (Docker, permissions)

❌ **Potential Permission Issues**
- Accessing other process streams may require elevated permissions
- Unix sudo requirements on some systems
- Security considerations for process attachment

❌ **Limited in Containerized Environments**
- Docker containers may block process discovery
- Requires workarounds or documentation of limitations

❌ **Testing Burden**
- Must test on Windows, macOS, Linux
- Various terminal emulators (iTerm, Hyper, Windows Terminal)
- Multiple dev server frameworks

### Neutral

⚪ **Maintenance Overhead**
- New component to maintain (TerminalAttacher)
- Platform-specific code increases maintenance surface
- Requires ongoing cross-platform testing

---

## Alternatives Considered

### Alternative 1: IPC/Socket Communication
**Approach:** Create Unix socket or named pipe for dev server to publish output, Console Bridge reads and merges.

**Pros:**
- More robust than process attachment
- Better permission model
- Cleaner architecture

**Cons:**
- Requires dev server modification
- Not transparent to users
- Framework-specific integrations needed
- **REJECTED**: Too invasive, breaks "works with any framework" promise

---

### Alternative 2: NPM Package Integration
**Approach:** Provide `console-bridge` as npm package that dev servers import programmatically.

```javascript
// server.js
const consoleBridge = require('console-bridge');
consoleBridge.start({ port: 3000 });
```

**Pros:**
- Naturally unified (same process)
- No process discovery needed
- Better error handling

**Cons:**
- Requires code changes in user projects
- Not zero-config
- Breaks standalone CLI value proposition
- **REJECTED**: Violates "just works" principle

---

### Alternative 3: Browser Extension
**Approach:** Browser extension captures console logs, sends to local server, displays in dev tools.

**Pros:**
- No separate terminal needed
- Native browser integration
- Rich UI possibilities

**Cons:**
- Different user experience (not terminal-based)
- Requires browser extension installation
- Not a terminal solution (different paradigm)
- **REJECTED**: Out of scope for Phase 5, potential future enhancement

---

### Alternative 4: `concurrently` Package Wrapper
**Approach:** Document using `concurrently` to run both commands in one terminal.

```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev\" \"console-bridge start localhost:3000\""
  }
}
```

**Pros:**
- Zero code changes required
- Standard npm practice
- Simple to implement (documentation only)

**Cons:**
- Output is split vertically, not truly merged
- Requires user configuration (not zero-config)
- Separate output streams still visually distinct
- **REJECTED**: Doesn't solve core problem (still shows separate streams)

---

## Implementation Plan

### Phase 5.1: Core Infrastructure (3 days)
- [ ] Create `src/core/TerminalAttacher.js` skeleton
- [ ] Create `src/utils/processUtils.js` with platform detection
- [ ] Implement Unix process discovery (`lsof`)
- [ ] Implement Windows process discovery (`netstat`)
- [ ] Unit tests for process discovery

### Phase 5.2: Stream Redirection (2 days)
- [ ] Implement `attachToProcess()` method
- [ ] Handle stdout stream redirection
- [ ] Implement graceful fallback logic
- [ ] Add clear error messages and warnings
- [ ] Unit tests for stream redirection

### Phase 5.3: CLI Integration (1 day)
- [ ] Add `--merge-output` flag to CLI
- [ ] Update BridgeManager to accept `mergeOutput` option
- [ ] Wire TerminalAttacher into BridgeManager
- [ ] Integration tests

### Phase 5.4: Cross-Platform Testing (3 days)
- [ ] Test on Windows 10/11
- [ ] Test on macOS (Intel + Apple Silicon)
- [ ] Test on Linux (Ubuntu, Debian)
- [ ] Test with various terminal emulators
- [ ] Test with React, Next.js, Vite, Express servers

### Phase 5.5: Edge Cases & Error Handling (2 days)
- [ ] Handle multiple processes on same port
- [ ] Handle permission denied errors
- [ ] Handle Docker containerized dev servers
- [ ] Document limitations and workarounds
- [ ] Add comprehensive error messages

### Phase 5.6: Documentation (1 day)
- [ ] Update Getting Started Guide
- [ ] Update Advanced Usage Guide
- [ ] Add examples to Troubleshooting Guide
- [ ] Update Architecture Documentation
- [ ] Create migration guide for existing users

**Total Estimated Timeline: 12 days**

---

## Success Criteria

### Functional Requirements
- ✅ `--merge-output` flag works on Windows, macOS, Linux
- ✅ Console Bridge logs appear in dev server terminal
- ✅ Works with both headless and headful modes
- ✅ Graceful fallback when attachment fails
- ✅ No breaking changes to existing CLI

### Non-Functional Requirements
- ✅ 90%+ test coverage for new code
- ✅ Performance impact < 50ms on startup
- ✅ Clear error messages for all failure modes
- ✅ Documentation includes examples for all major frameworks

### Testing Requirements
- ✅ Unit tests for TerminalAttacher
- ✅ Unit tests for processUtils
- ✅ Integration tests with real dev servers
- ✅ Cross-platform testing complete
- ✅ Edge case testing (Docker, permissions, etc.)

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Process discovery fails on certain platforms | Medium | High | Graceful fallback + clear error messages + document platform-specific requirements |
| Permission denied accessing process streams | Medium | Medium | Document sudo requirements, provide alternative approaches, ensure fallback works |
| Stream redirection breaks terminal formatting | Low | Medium | Extensive testing across terminals, preserve ANSI codes |
| Dev server framework incompatibility | Low | Low | Framework-agnostic port-based discovery |
| Docker containerization blocks discovery | High | Medium | Document limitation, suggest `concurrently` workaround for Docker |
| Performance degradation | Low | Medium | Benchmark, optimize critical path, add timeout for discovery |

---

## Future Enhancements (Post-Phase 5)

### Automatic Detection (Phase 5.5)
- Auto-detect dev server process without `--merge-output` flag
- Smart heuristics to determine when to merge
- User preference storage

### Enhanced Terminal UI (Phase 6)
- Color-coded prefixes to distinguish Console Bridge logs
- Collapsible sections
- Filtering capabilities in unified output

### Remote Monitoring (Phase 7)
- Monitor localhost from different machine
- WebSocket-based streaming
- Multi-user support

---

## References

- [IMPLEMENTATION_PLAN.md](../../IMPLEMENTATION_PLAN.md#phase-5-unified-terminal-output) - Detailed Phase 5 plan
- [System Overview](../architecture/system-overview.md) - Current architecture
- [Advanced Usage Guide](../guides/advanced-usage.md) - User documentation

---

## Decision Makers

- **Proposed By**: Claude (AI Assistant)
- **Requested By**: User (via feature request)
- **Approved By**: Pending review

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-10-04 | Initial ADR created | Claude |
| | | |
| | | |

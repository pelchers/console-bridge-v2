# Cross-Platform Testing - Unified Terminal Output (Phase 5)

## Overview

This document outlines the cross-platform testing procedures for the `--merge-output` flag and related functionality in Console Bridge.

## Test Summary

### Windows 10/11 ✅ PASSED

**Platform:** MINGW64_NT-10.0-19045 (Windows 10)
**Date:** 2025-10-04
**Tested By:** Automated tests + manual CLI testing

**Test Results:**

| Test | Status | Details |
|------|--------|---------|
| Platform detection | ✅ PASS | Correctly identifies as 'windows' |
| Find process by port (netstat) | ✅ PASS | Successfully found PID 12480 on port 3847 |
| Process exists check (tasklist) | ✅ PASS | Verified process existence |
| Get process info | ✅ PASS | Retrieved "node.exe" |
| Process permission check | ✅ PASS | User has permission |
| Terminal attachment | ✅ PASS | Successfully attached to dev server process |
| CLI --merge-output flag | ✅ PASS | End-to-end CLI test successful |
| Console log capture | ✅ PASS | All 18 console types captured |
| Graceful shutdown | ✅ PASS | Clean detachment and cleanup |

**Test Commands:**
```bash
# Test processUtils
node test-process-utils.js

# Test BridgeManager with mergeOutput
node test-merge-output.js

# Test CLI
console-bridge start localhost:3847 --merge-output
```

**Sample Output:**
```
✓ Successfully attached to process 12480 (node.exe) on port 3847
✓ http://localhost:3847/

Monitoring 1 URL. Press Ctrl+C to stop.
```

---

### macOS (Intel) ⏳ PENDING

**Required Tests:**

1. **Platform Detection**
   ```bash
   node test-process-utils.js
   ```
   Expected: Platform should be 'darwin'

2. **Process Discovery (lsof)**
   - Verify `lsof -t -i :PORT` works
   - Test with Node.js dev server running
   - Expected: Should find PID correctly

3. **Process Info (ps)**
   - Verify `ps -p PID -o comm=` works
   - Expected: Should return process command name

4. **Terminal Attachment**
   ```bash
   node test-merge-output.js
   ```
   Expected: Successfully attach to dev server

5. **CLI Integration**
   ```bash
   console-bridge start localhost:3000 --merge-output
   ```
   Expected: "Successfully attached to process..." message

**Known Considerations:**
- `lsof` may require elevated permissions for some processes
- Check `/usr/sbin/lsof` if not in PATH
- Test both with and without sudo

---

### macOS (Apple Silicon) ⏳ PENDING

**Required Tests:** Same as macOS Intel above

**Additional Considerations:**
- Verify Node.js ARM64 process detection
- Test with Rosetta 2 processes (if applicable)

---

### Linux (Ubuntu 22.04+) ⏳ PENDING

**Required Tests:**

1. **Platform Detection**
   ```bash
   node test-process-utils.js
   ```
   Expected: Platform should be 'linux'

2. **Process Discovery (lsof)**
   - Install lsof if not present: `sudo apt-get install lsof`
   - Test process discovery
   - Expected: Should find PID correctly

3. **Process Info (ps)**
   - Verify `ps -p PID -o comm=` works
   - Expected: Should return process command name

4. **Terminal Attachment**
   ```bash
   node test-merge-output.js
   ```
   Expected: Successfully attach to dev server

5. **CLI Integration**
   ```bash
   console-bridge start localhost:3000 --merge-output
   ```
   Expected: "Successfully attached to process..." message

**Known Considerations:**
- `lsof` might not be installed by default on minimal systems
- Permission issues may occur - test with regular user
- If permission denied, verify error message is helpful

---

### Linux (Debian) ⏳ PENDING

**Required Tests:** Same as Ubuntu above

**Additional Considerations:**
- Verify lsof package availability: `apt-cache search lsof`
- Test on both Debian Stable and Testing

---

## Test Setup

### Prerequisites

All platforms need:
- Node.js (v16+ recommended)
- A dev server running on a known port (e.g., 3000, 3847)
- Console Bridge installed (`npm install -g console-bridge`)

### Test Files

The following test files are available in the project root:

1. **test-process-utils.js** - Tests processUtils functions
2. **test-merge-output.js** - Tests BridgeManager with mergeOutput

### Running Tests

1. Start a dev server:
   ```bash
   cd your-project
   npm run dev
   ```

2. Note the port (e.g., 3000, 3847, 5173)

3. In another terminal, run tests:
   ```bash
   # Test 1: Process utilities
   node test-process-utils.js

   # Test 2: Merge output functionality
   node test-merge-output.js

   # Test 3: CLI integration
   console-bridge start localhost:PORT --merge-output
   ```

---

## Expected Behaviors

### Success Case

```
✓ Successfully attached to process 12345 (node.exe) on port 3000
✓ http://localhost:3000/

Monitoring 1 URL. Press Ctrl+C to stop.
```

### Failure Cases (Graceful Fallback)

**No process on port:**
```
ℹ️  No process found listening on port 3000. Using separate terminal.
✓ http://localhost:3000/

Monitoring 1 URL. Press Ctrl+C to stop.
```

**Permission denied:**
```
ℹ️  Permission denied to access process 12345. Try running with elevated permissions or use separate terminal.
✓ http://localhost:3000/

Monitoring 1 URL. Press Ctrl+C to stop.
```

**lsof not found (Linux/macOS):**
```
ℹ️  Failed to attach: lsof not found. Using separate terminal.
✓ http://localhost:3000/

Monitoring 1 URL. Press Ctrl+C to stop.
```

---

## Platform-Specific Commands

### Windows
```bash
# Find process on port
netstat -ano | findstr :3000

# Check process exists
tasklist | findstr 12345

# Get process info
tasklist /FI "PID eq 12345" /FO CSV /NH
```

### macOS / Linux
```bash
# Find process on port
lsof -t -i :3000

# Check process exists
ps -p 12345

# Get process info
ps -p 12345 -o comm=
```

---

## Reporting Test Results

When testing on a new platform, please record:

1. **Platform:** OS name and version
2. **Architecture:** x64, ARM64, etc.
3. **Test Results:** Pass/Fail for each test
4. **Error Messages:** Any unexpected errors
5. **Screenshots:** If applicable

Update this document with results and submit a PR or issue.

---

## Known Limitations

1. **Direct stdout writing:** The current implementation writes to `process.stdout` instead of the target process's stdout. This works fine for Scenario 2 (concurrently) since both processes share the same terminal, but won't work across different terminals.

2. **Permission requirements:** On Unix systems, `lsof` may require elevated permissions to see processes owned by other users.

3. **lsof availability:** Some minimal Linux installations may not have `lsof` installed by default. The system handles this gracefully with fallback to standard output.

---

## Future Enhancements

- [ ] Add IPC mechanism for cross-terminal communication
- [ ] Support Windows PowerShell (not just cmd/bash)
- [ ] Add WSL (Windows Subsystem for Linux) testing
- [ ] Test with Docker containerized dev servers
- [ ] Add automated CI/CD testing across platforms

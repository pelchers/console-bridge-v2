# ADR: 4.0 - Documentation, File Export & npm Publish Preparation

**Status:** Draft
**Date Created:** 2025-10-02
**Date Completed:** _pending_
**Author:** Claude + User
**Phase:** 4 - Polish & Publish Preparation

---

## Context

Phases 1-3 are complete with 186/186 tests passing (100%). The application is functionally complete and ready to use. Phase 4 focuses on preparing the package for npm publication by adding:

1. **File Export Feature** - Allow users to save logs to files
2. **Programmatic API** - Expose library for Node.js usage
3. **Comprehensive Documentation** - User guides and API docs
4. **Package Preparation** - Metadata, testing, publish checklist

**Current State:**
- ✅ All core functionality working
- ✅ CLI fully functional
- ✅ 186/186 tests passing
- ✅ 96.68% code coverage
- ⏳ Missing: File export, API exposure, docs

**Goals:**
- Prepare for v1.0.0 npm publish
- Complete feature set from README
- Professional documentation
- Ready for public use

---

## Decision

**Approach:**
Complete Phase 4 deliverables in priority order:

1. **File Export Feature** - Highest user value
2. **Programmatic API** - For library usage
3. **Documentation** - Usage guides and examples
4. **Package Preparation** - npm publish readiness
5. **Final Polish** - Testing and verification

---

## Phase 4 Subtasks

### 4.1 File Export Feature

**Objective:** Add `--output <file>` option to save logs to file

**Implementation:**
```javascript
// Add to CLI
.option('-o, --output <file>', 'Save logs to file')

// In startCommand:
if (options.output) {
  const logStream = fs.createWriteStream(options.output, { flags: 'a' });
  // Tee output to both console and file
}
```

**Requirements:**
- Stream logs to file in real-time
- Append mode (don't overwrite existing logs)
- Strip ANSI colors from file output
- Handle file write errors gracefully
- Test with multiple URLs

**Tests:**
- File created successfully
- Logs written correctly
- ANSI codes stripped
- Errors handled
- File closed on exit

---

### 4.2 Programmatic API

**Objective:** Allow usage as a library, not just CLI

**Implementation:**
Create `src/index.js`:
```javascript
module.exports = {
  BridgeManager: require('./core/BridgeManager'),
  BrowserPool: require('./core/BrowserPool'),
  LogCapturer: require('./core/LogCapturer'),
  LogFormatter: require('./formatters/LogFormatter'),
  utils: {
    url: require('./utils/url'),
    colors: require('./formatters/colors'),
  },
};
```

**Usage Example:**
```javascript
const { BridgeManager } = require('console-bridge');

const bridge = new BridgeManager({
  headless: true,
  levels: ['error', 'warn'],
});

await bridge.start(['localhost:3000', 'localhost:8080']);

// Custom output handler
bridge.options.output = (log) => {
  myCustomLogger.log(log);
};
```

**Documentation:**
- `docs/API.md` - Full API reference
- Examples in `examples/programmatic/`
- JSDoc comments in source

---

### 4.3 Documentation

**User Documentation (`docs/USAGE.md`):**
- Installation (local and global)
- Quick start examples
- All CLI options explained
- Common use cases
- Troubleshooting
- FAQ

**API Documentation (`docs/API.md`):**
- Installation as dependency
- BridgeManager API
- LogFormatter API
- BrowserPool API
- Configuration options
- Events and callbacks
- Examples

**Examples:**
- `examples/basic-cli/` - CLI usage
- `examples/programmatic/` - Library usage
- `examples/custom-formatter/` - Custom formatting
- `examples/file-export/` - File output
- `examples/advanced/` - Multi-instance with filters

---

### 4.4 Package Preparation

**package.json Updates:**
```json
{
  "version": "1.0.0",
  "description": "Bridge browser console logs from localhost to terminal",
  "keywords": [
    "console", "browser", "devtools", "logging",
    "terminal", "localhost", "debugging", "puppeteer",
    "chrome", "cli", "monitor", "log-streaming"
  ],
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/console-bridge.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/console-bridge/issues"
  },
  "homepage": "https://github.com/yourusername/console-bridge#readme",
  "files": [
    "bin/",
    "src/",
    "docs/",
    "examples/",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

**.npmignore:**
```
.claude/
test/
coverage/
*.test.js
.eslintrc.json
.prettierrc
```

**Pre-Publish Checklist:**
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Examples tested
- [ ] README accurate
- [ ] CHANGELOG updated
- [ ] Version bumped to 1.0.0
- [ ] Keywords optimized
- [ ] Repository links correct
- [ ] License file present
- [ ] `npm pack` works
- [ ] Global install tested
- [ ] Programmatic usage tested

---

### 4.5 Final Testing & Polish

**Manual Testing:**
1. Global install: `npm install -g .`
2. Test all CLI options
3. Test file export
4. Test programmatic API
5. Test on real dev servers
6. Verify documentation accuracy

**Automated Testing:**
- Run full test suite
- Check coverage >90%
- Test on Windows/Mac/Linux (if possible)
- Verify signal handling

**Polish:**
- Fix any bugs found
- Improve error messages
- Optimize performance
- Code cleanup

---

## Technical Specifications

### File Export Format

**Plain Text (no colors):**
```
[12:34:56] [localhost:3000] log: Application started
[12:34:57] [localhost:8080] info: Server ready
[12:34:58] [localhost:3000] error: Connection failed
```

**Implementation:**
- Use `strip-ansi` package or regex to remove ANSI codes
- Write to file after formatting
- Flush on each log (real-time)
- Close stream on shutdown

### API Structure

**Main Exports:**
- `BridgeManager` - Primary class
- `LogFormatter` - For custom formatting
- `BrowserPool` - Direct browser management
- `LogCapturer` - Direct log capture

**Helper Exports:**
- `utils.url` - URL validation/normalization
- `utils.colors` - Color utilities

---

## Alternatives Considered

### Option 1: JSON Log Format
**Pros:**
- Machine-readable
- Easy to parse
- Structured data

**Cons:**
- Not human-readable
- Larger file size

**Decision:** Plain text by default, consider JSON as `--format json` option later

### Option 2: Separate File Per URL
**Pros:**
- Easier to filter
- Clearer separation

**Cons:**
- More files to manage
- Harder to see interleaved logs

**Decision:** Single file by default, URLs are color-coded (in terminal)

### Option 3: Streaming API (EventEmitter)
**Pros:**
- More flexible
- Real-time events

**Cons:**
- More complex
- Callback approach is simpler

**Decision:** Callback-based for now, can add events later if needed

---

## Success Criteria

- [ ] File export feature working (`--output file.log`)
- [ ] ANSI codes stripped from file output
- [ ] Programmatic API exposed (`src/index.js`)
- [ ] `docs/USAGE.md` created
- [ ] `docs/API.md` created
- [ ] Examples directory with 3+ examples
- [ ] `package.json` updated for v1.0.0
- [ ] `.npmignore` configured
- [ ] All tests passing (200+ tests with new features)
- [ ] Coverage >90%
- [ ] `npm pack` successful
- [ ] Global install tested
- [ ] README complete and accurate
- [ ] CHANGELOG updated

---

## Implementation Plan

### Step 1: File Export (Priority 1)
1. Add `strip-ansi` dependency
2. Add `--output` option to CLI
3. Modify `startCommand` to create write stream
4. Modify output handler to write to both console and file
5. Ensure stream closed on shutdown
6. Write tests

### Step 2: Programmatic API (Priority 2)
1. Create `src/index.js`
2. Export all main classes
3. Update `package.json` main field
4. Write examples
5. Test programmatic usage

### Step 3: Documentation (Priority 3)
1. Create `docs/` directory
2. Write `docs/USAGE.md`
3. Write `docs/API.md`
4. Create examples
5. Update README with links

### Step 4: Package Prep (Priority 4)
1. Update `package.json` metadata
2. Configure `.npmignore`
3. Test `npm pack`
4. Create publish checklist
5. Update CHANGELOG

### Step 5: Final Polish (Priority 5)
1. Run all tests
2. Manual testing
3. Fix any issues
4. Code review
5. Final verification

---

## Testing Strategy

**New Tests:**
- File export: 10-15 tests
- Programmatic API: 5-10 tests
- Integration: 5 tests
- **Total target:** 200+ tests

**Test Areas:**
- File creation and writing
- ANSI stripping
- Multiple file formats
- API usage patterns
- Error handling
- Stream cleanup

---

## Documentation Standards

**All docs must include:**
- Table of contents
- Quick start
- Detailed examples
- Troubleshooting section
- Links to related docs

**Code examples must be:**
- Tested and working
- Well-commented
- Copy-pasteable
- Cover common use cases

---

## Post-Implementation

_Will document:_
- Actual implementation details
- Challenges encountered
- Test results
- User feedback (if any)
- Lessons learned

---

## Related Decisions

- Builds on Phases 1-3 (all core functionality)
- Prepares for v1.0.0 npm publish
- Sets foundation for future features

---

## Notes

This is the **final phase before v1.0.0 release**. Quality and polish are critical. Documentation must be excellent for first-time users.

**Focus areas:**
1. User experience (CLI and API)
2. Documentation clarity
3. Package quality
4. npm publish readiness

**Next Steps:** Implement features, write docs, test thoroughly, prepare for publish.

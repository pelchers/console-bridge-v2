# .claude Directory - Development Conventions & Workflows

---

## 📁 Directory Structure

```
.claude/
├── claude.md (this file)
├── adr/
│   ├── phase-1/
│   │   ├── subtask-1.1-project-initialization.md
│   │   └── subtask-1.2-basic-puppeteer-integration.md
│   ├── phase-2/
│   ├── phase-3/
│   └── phase-4/
└── workflows/
    ├── conventions/
    │   ├── branching-and-commits.md
    │   ├── adr-conventions.md
    │   └── testing-conventions.md ⭐
    └── development/
        ├── current-state.md
        ├── git-state.md
        ├── commits.log
        └── phase-1-summary.md
```

---

## 🎯 Quick Links

### Essential Reading:

1. **Branching & Commits Conventions**
   📄 `.claude/workflows/conventions/branching-and-commits.md`
   How we structure branches, when to commit, merge strategies

2. **ADR Conventions**
   📄 `.claude/workflows/conventions/adr-conventions.md`
   How to write Architecture Decision Records before/after each subtask

3. **Testing Conventions** ⭐
   📄 `.claude/workflows/conventions/testing-conventions.md`
   Rigorous testing standards: 100% passing, no assumptions, verified success

---

## 📚 Additional Resources

### Convention Files (⭐ Critical):
1. `.claude/workflows/conventions/branching-and-commits.md` - Git workflow
2. `.claude/workflows/conventions/adr-conventions.md` - Decision documentation
3. `.claude/workflows/conventions/testing-conventions.md` - Testing standards ⭐

### Development Status:
- `.claude/workflows/development/current-state.md` - Current project state
- `.claude/workflows/development/phase-1-verification-report.md` - Phase 1 verification
- `.claude/workflows/development/phase-2-subtask-2.1-verification.md` - Phase 2.1 verification ⭐

### ADRs by Phase:
- Phase 1: `.claude/adr/phase-1/` - Foundation & core setup decisions
- Phase 2: `.claude/adr/phase-2/` - Multi-instance & core logic
  - `.claude/adr/phase-2/subtask-2.1-bridge-manager.md` - BridgeManager architecture

---

## 📂 Critical File Index

### Core Conventions (Must Read):
- `.claude/claude.md` (this file) - Entry point & navigation
- `.claude/workflows/conventions/branching-and-commits.md` - Git workflow
- `.claude/workflows/conventions/adr-conventions.md` - Documentation standards
- `.claude/workflows/conventions/testing-conventions.md` - Testing requirements ⭐

### Source Code:

**Phase 1 - Core Components:**
- `src/core/BrowserPool.js` - Manages Puppeteer browser instances
- `src/core/LogCapturer.js` - Captures console events from pages
- `src/utils/url.js` - URL validation and normalization
- `src/formatters/colors.js` - Color definitions for terminal output

**Phase 2 - Bridge & Formatting:**
- `src/core/BridgeManager.js` - Central orchestrator for console bridging ⭐
- `src/formatters/LogFormatter.js` - Formats logs for terminal output with colors ⭐

### Tests (166 tests, 100% passing):

**Phase 1 Tests (69 tests):**
- `test/unit/BrowserPool.test.js` - BrowserPool unit tests (18 tests)
- `test/unit/url.test.js` - URL utilities tests (30 tests)
- `test/unit/colors.test.js` - Color utilities tests (21 tests)

**Phase 2 Tests (97 tests):**
- `test/unit/BridgeManager.test.js` - BridgeManager unit tests (32 tests) ⭐
- `test/unit/LogFormatter.test.js` - LogFormatter unit tests (35 tests) ⭐
- `test/unit/LogCapturer.test.js` - LogCapturer unit tests (30 tests)

**Coverage:** 96.68% statements, 94.28% branches, 89.79% functions, 96.55% lines

### Configuration:
- `package.json` - Dependencies and scripts
- `jest.config.js` - Jest testing configuration

### Documentation:
- `IMPLEMENTATION_PLAN.md` - Full project implementation plan
- `README.md` - Project overview
- `.claude/adr/phase-1/` - Phase 1 architecture decisions

---

**Created:** October 2, 2025
**Last Updated:** October 2, 2025
**Purpose:** Central guide to development conventions & critical file references
**Location:** `.claude/claude.md`

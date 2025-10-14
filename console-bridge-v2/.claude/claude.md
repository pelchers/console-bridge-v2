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

## 📝 Living Documents Policy

**IMPORTANT:** Many documentation files in this project are **living documents** that should be updated when the project evolves.

### What are Living Documents?
Living documents are files that serve as ongoing project documentation and reporting. They should be kept up-to-date as the project progresses, rather than remaining static snapshots.

### Where are Living Documents Located?
1. **`.claude/` directory** - ADRs, PRD, TRD, Implementation Plan, Project Summary, Versions, etc.
2. **`docs/` directory** - User documentation, guides, explainers, API docs, requirements, etc.
3. **Subdirectories** - Any `.md` files in subdirectories of the above

### When to Update Living Documents?
Update these files whenever:
- New features are implemented (PRD, TRD, README)
- Architecture changes are made (ADRs, TRD)
- Testing strategies evolve (Testing docs, README)
- Project status changes (Project Summary, README)
- New versions are released (Version comparison docs, CHANGELOG)
- Requirements change (REQUIREMENTS.md, PRD)

### Which Files are Living Documents?
**Core Living Documents:**
- `.claude/PRD.md` - Product Requirements (add v2, v3 sections as features evolve)
- `.claude/TRD.md` - Technical Requirements (update with new architecture)
- `.claude/IMPLEMENTATION_PLAN.md` - Update with phase progress
- `.claude/PROJECT_SUMMARY.md` - Always reflects current state
- `.claude/versions/comparison/v1-to-v2.md` - Update as v2 evolves
- `README.md` - Primary project overview (always current)
- `CHANGELOG.md` - Version history (append, don't overwrite)
- `docs/REQUIREMENTS.md`, `docs/USAGE.md`, `docs/API.md` - User docs

**Static Documents:**
- ADR completion files (once subtask complete, document is frozen)
- Phase summaries in `docs/summaries/` (snapshot at completion)
- Specific version specs in `docs/versions/` or `.claude/versions/`

### Best Practices:
1. ✅ Update "Last Updated" date when modifying living documents
2. ✅ Add version sections (v2.0.0, v3.0.0) rather than overwriting v1
3. ✅ Keep historical information (show evolution, not just current state)
4. ✅ Update document status ("Living Document", "Updated for v2.0.0", etc.)
5. ❌ Don't freeze living documents at version milestones (keep updating)
6. ❌ Don't remove old version info (append, don't replace)

---

## 📚 Additional Resources

### Convention Files (⭐ Critical):
1. `.claude/workflows/conventions/branching-and-commits.md` - Git workflow
2. `.claude/workflows/conventions/adr-conventions.md` - Decision documentation
3. `.claude/workflows/conventions/testing-conventions.md` - Testing standards ⭐

### Development Status:
- `.claude/workflows/development/current-state.md` - Current project state
- `.claude/workflows/development/phase-1-verification-report.md` - Phase 1 verification
- `.claude/workflows/development/phase-2-subtask-2.1-verification.md` - Phase 2.1 verification
- `.claude/workflows/development/phase-3-cli-verification.md` - Phase 3 verification ⭐

### ADRs by Phase:
- Phase 1: `.claude/adr/phase-1/` - Foundation & core setup decisions
- Phase 2: `.claude/adr/phase-2/` - Multi-instance & core logic
  - `.claude/adr/phase-2/subtask-2.1-bridge-manager.md` - BridgeManager architecture
- Phase 3: `.claude/adr/phase-3/` - CLI Integration
  - `.claude/adr/phase-3/cli-integration.md` - CLI architecture ⭐

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

**Phase 3 - CLI:**
- `bin/console-bridge.js` - Command-line interface entry point ⭐

### Tests (~188 tests):

**Phase 1 Tests (69 tests):**
- `test/unit/BrowserPool.test.js` - BrowserPool unit tests (18 tests)
- `test/unit/url.test.js` - URL utilities tests (30 tests)
- `test/unit/colors.test.js` - Color utilities tests (21 tests)

**Phase 2 Tests (97 tests):**
- `test/unit/BridgeManager.test.js` - BridgeManager unit tests (32 tests) ⭐
- `test/unit/LogFormatter.test.js` - LogFormatter unit tests (35 tests) ⭐
- `test/unit/LogCapturer.test.js` - LogCapturer unit tests (30 tests)

**Phase 3 Tests (25 tests):**
- `test/integration/cli.test.js` - CLI integration tests (25 tests) ⭐

**Coverage:** 96.68% statements, 94.28% branches (Phase 1+2 core modules)

### Configuration:
- `package.json` - Dependencies, scripts, and bin entry for CLI
- `jest.config.js` - Jest testing configuration

### CLI Usage:
```bash
# Global install
npm install -g .

# Basic usage
console-bridge start localhost:3000

# Multiple URLs
console-bridge start localhost:3000 localhost:8080

# With options
console-bridge start localhost:3000 --levels error,warn --location
```

### Documentation:
- `IMPLEMENTATION_PLAN.md` - Full project implementation plan
- `README.md` - Project overview
- `.claude/adr/phase-1/` - Phase 1 architecture decisions

---

**Created:** October 2, 2025
**Last Updated:** October 2, 2025
**Purpose:** Central guide to development conventions & critical file references
**Location:** `.claude/claude.md`

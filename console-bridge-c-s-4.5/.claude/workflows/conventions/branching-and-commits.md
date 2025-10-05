# Git Branching & Commit Conventions
## Console Bridge Development Workflow

---

## 🌳 BRANCH STRUCTURE

### Hierarchy:
```
main
├── phase-1
│   ├── phase-1/subtask-1.1
│   ├── phase-1/subtask-1.2
│   ├── phase-1/subtask-1.3
│   └── phase-1/subtask-1.4
├── phase-2
│   ├── phase-2/subtask-2.1
│   ├── phase-2/subtask-2.2
│   └── phase-2/subtask-2.3
├── phase-3
│   └── ...
└── phase-4
    └── ...
```

---

## 📋 BRANCH NAMING CONVENTIONS

### Phase Branches (off main):
```
phase-1
phase-2
phase-3
phase-4
```

**Purpose:** Major implementation phases from IMPLEMENTATION_PLAN.md

### Subtask Branches (off phase branches):
```
phase-1/subtask-1.1
phase-1/subtask-1.2
phase-2/subtask-2.1
```

**Format:** `phase-{N}/subtask-{N}.{M}`
- N = Phase number
- M = Subtask number

**Example from Implementation Plan:**
- Phase 1, Subtask 1.1: `phase-1/subtask-1.1` (Project Initialization)
- Phase 1, Subtask 1.2: `phase-1/subtask-1.2` (Basic Puppeteer Integration)

---

## 🔄 WORKFLOW

### Starting a New Phase:

1. **Create phase branch from main:**
```bash
git checkout main
git pull origin main
git checkout -b phase-1
git push -u origin phase-1
```

2. **Create ADR for the phase:**
- Create ADR file in `.claude/adr/phase-1/`
- Document decisions before implementation

### Working on a Subtask:

1. **Create subtask branch from phase branch:**
```bash
git checkout phase-1
git pull origin phase-1
git checkout -b phase-1/subtask-1.1
```

2. **Create pre-implementation ADR:**
```bash
# Create: .claude/adr/phase-1/subtask-1.1-project-initialization.md
# Document: Planned approach, decisions, alternatives considered
```

3. **Do the work:**
- Make code changes
- Chat with Claude = Code changes = Commits
- Every meaningful conversation/change = 1 commit

4. **Commit frequently:**
```bash
git add .
git commit -m "feat(subtask-1.1): initialize npm package structure"
```

5. **Update ADR after completion:**
```bash
# Update: .claude/adr/phase-1/subtask-1.1-project-initialization.md
# Document: What actually happened, deviations from plan, lessons learned
git add .claude/adr/phase-1/subtask-1.1-project-initialization.md
git commit -m "docs(subtask-1.1): update ADR with implementation details"
```

6. **Merge back to phase branch:**
```bash
git checkout phase-1
git merge phase-1/subtask-1.1 --no-ff
git push origin phase-1
```

### Completing a Phase:

1. **All subtasks merged to phase branch**
2. **Phase testing complete**
3. **Merge phase to main:**
```bash
git checkout main
git merge phase-1 --no-ff -m "feat(phase-1): complete foundation & core setup"
git push origin main
git tag v0.1.0-phase-1
git push --tags
```

---

## 💬 COMMIT MESSAGE CONVENTIONS

### Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code change that neither fixes bug nor adds feature
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependency updates

### Scope:
Use subtask identifier: `subtask-1.1`, `subtask-2.3`, etc.

### Examples:

**Feature implementation:**
```
feat(subtask-1.1): create npm package.json with dependencies

- Added puppeteer, commander, chalk
- Configured dev dependencies (jest, eslint)
- Set up npm scripts for testing and linting
```

**Documentation:**
```
docs(subtask-1.1): update ADR after project initialization

- Documented actual folder structure created
- Added notes on dependency version choices
- Recorded decision to use Puppeteer 21.0
```

**Bug fix:**
```
fix(subtask-2.1): handle browser launch timeout correctly

- Added retry logic with exponential backoff
- Improved error messages
- Updated tests
```

**Refactor:**
```
refactor(subtask-1.2): simplify BrowserPool constructor

- Reduced parameter complexity
- Used options object pattern
- Maintains backward compatibility
```

---

## 📊 COMMIT FREQUENCY

### Rule: Every Chat Session = Commit

**When to commit:**
- After each meaningful code change
- After each conversation with Claude that results in changes
- After completing a logical unit of work
- Before switching context/tasks
- After updating ADRs

**Commit early, commit often!**

---

## 🔀 MERGE STRATEGY

### Subtask → Phase:
```bash
git merge phase-1/subtask-1.1 --no-ff
```
**Use:** `--no-ff` (no fast-forward) to preserve branch history

### Phase → Main:
```bash
git merge phase-1 --no-ff -m "feat(phase-1): complete foundation & core setup"
```
**Use:** `--no-ff` with descriptive merge commit message

---

## 🏷️ TAGGING CONVENTIONS

### After Each Phase:
```bash
git tag v0.1.0-phase-1
git tag v0.2.0-phase-2
git tag v0.3.0-phase-3
git tag v1.0.0-phase-4  # Final release
```

### Semantic Versioning:
- Phase 1 complete: `v0.1.0-phase-1`
- Phase 2 complete: `v0.2.0-phase-2`
- Phase 3 complete: `v0.3.0-phase-3`
- Phase 4 complete: `v1.0.0` (production ready)

---

## 📝 BRANCH PROTECTION

### Main Branch:
- Requires phase branch merge (no direct commits)
- Requires all tests to pass
- Requires ADR updates

### Phase Branches:
- Requires subtask branch merge (no direct commits)
- Requires subtask completion
- Requires ADR for subtask

---

## 🔍 BRANCH STATUS TRACKING

### Current State File:
Keep track in `.claude/workflows/development/current-state.md`:

```markdown
## Current Development State

**Active Phase:** phase-1
**Active Subtask:** phase-1/subtask-1.2
**Last Completed:** phase-1/subtask-1.1
**Next Up:** phase-1/subtask-1.3

### Phase 1 Progress:
- [x] 1.1 Project Initialization
- [ ] 1.2 Basic Puppeteer Integration (IN PROGRESS)
- [ ] 1.3 URL Utilities
- [ ] 1.4 Log Formatting
- [ ] 1.5 Phase 1 Integration
```

---

## 🎯 QUICK REFERENCE

### Start new phase:
```bash
git checkout main && git checkout -b phase-{N}
```

### Start new subtask:
```bash
git checkout phase-{N} && git checkout -b phase-{N}/subtask-{N}.{M}
```

### Commit changes:
```bash
git add . && git commit -m "feat(subtask-{N}.{M}): description"
```

### Update ADR and commit:
```bash
git add .claude/adr/ && git commit -m "docs(subtask-{N}.{M}): update ADR"
```

### Merge subtask to phase:
```bash
git checkout phase-{N} && git merge phase-{N}/subtask-{N}.{M} --no-ff
```

### Merge phase to main:
```bash
git checkout main && git merge phase-{N} --no-ff -m "feat(phase-{N}): description"
```

---

**Created:** October 2, 2025  
**Purpose:** Maintain clean, traceable development history  
**Location:** `.claude/workflows/conventions/branching-and-commits.md`

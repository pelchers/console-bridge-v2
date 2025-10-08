# ADR (Architecture Decision Record) Conventions
## Console Bridge Development Workflow

---

## 📋 WHAT IS AN ADR?

An Architecture Decision Record (ADR) documents:
- **What** decision was made
- **Why** it was made
- **What alternatives** were considered
- **What consequences** resulted

---

## 🎯 PURPOSE

ADRs help us:
1. **Remember why** we made decisions
2. **Communicate** architectural choices
3. **Onboard** new contributors
4. **Avoid repeating** past mistakes
5. **Track evolution** of the codebase

---

## 📁 FILE STRUCTURE

### Location:
```
.claude/adr/
├── phase-1/
│   ├── subtask-1.1-project-initialization.md
│   ├── subtask-1.2-basic-puppeteer-integration.md
│   ├── subtask-1.3-url-utilities.md
│   ├── subtask-1.4-log-formatting.md
│   └── subtask-1.5-phase-1-integration.md
├── phase-2/
│   ├── subtask-2.1-bridge-manager-development.md
│   └── ...
└── phase-N/
    └── ...
```

### Naming Convention:
```
subtask-{N}.{M}-{descriptive-name}.md
```

**Examples:**
- `subtask-1.1-project-initialization.md`
- `subtask-2.1-bridge-manager-development.md`
- `subtask-3.2-advanced-cli-features.md`

---

## 📝 ADR TEMPLATE

Each ADR should follow this structure:

```markdown
# ADR: [Subtask Number] - [Descriptive Title]

**Status:** [Draft | Active | Completed | Superseded]  
**Date Created:** YYYY-MM-DD  
**Date Completed:** YYYY-MM-DD  
**Author:** Claude + User  
**Subtask:** [N.M] - [Full Subtask Name from Implementation Plan]

---

## Context

What is the issue we're addressing? What requirements drive this decision?

- Background information
- Current state
- Problem statement
- Requirements from Implementation Plan

---

## Decision

What is the change we're making?

- High-level approach
- Key architectural choices
- Technologies/patterns to use
- File structures to create

---

## Alternatives Considered

What other options did we evaluate?

### Option 1: [Name]
**Pros:**
- Advantage 1
- Advantage 2

**Cons:**
- Disadvantage 1
- Disadvantage 2

**Why not chosen:** Explanation

### Option 2: [Name]
**Pros:**
...

**Cons:**
...

**Why not chosen:** Explanation

---

## Consequences

What are the implications of this decision?

### Positive:
- Benefit 1
- Benefit 2

### Negative:
- Trade-off 1
- Trade-off 2

### Neutral:
- Change 1
- Change 2

---

## Implementation Notes

### Pre-Implementation (Written BEFORE coding):
- Planned approach
- Expected file changes
- Dependencies needed
- Testing strategy

### Post-Implementation (Updated AFTER coding):
- Actual implementation details
- Deviations from plan
- Issues encountered
- Solutions applied
- Additional changes made
- Lessons learned

---

## Related Decisions

- Links to related ADRs
- References to Implementation Plan sections
- External documentation

---

## Verification

How do we verify this decision worked?

- [ ] Tests pass
- [ ] Code review complete
- [ ] Documentation updated
- [ ] Manual testing successful
- [ ] Performance acceptable

---

## Notes

Any additional context, thoughts, or future considerations.
```

---

## 🔄 ADR LIFECYCLE

### 1. Pre-Implementation (BEFORE coding):

**When:** At the start of each subtask, before writing any code

**Create ADR with:**
- Context from Implementation Plan
- Planned decision/approach
- Alternatives considered
- Expected consequences
- Pre-implementation notes

**Status:** `Draft`

**Commit:**
```bash
git add .claude/adr/phase-N/subtask-N.M-name.md
git commit -m "docs(subtask-N.M): create pre-implementation ADR"
```

### 2. During Implementation:

**Update as needed:**
- Add notes about discoveries
- Document unexpected issues
- Record mid-course corrections

**Status:** `Active`

### 3. Post-Implementation (AFTER coding):

**When:** After completing the subtask, before merging

**Update ADR with:**
- Actual implementation details
- What differed from the plan
- Issues encountered and solutions
- Additional changes made beyond original plan
- Lessons learned
- Final consequences

**Status:** `Completed`

**Commit:**
```bash
git add .claude/adr/phase-N/subtask-N.M-name.md
git commit -m "docs(subtask-N.M): update ADR with implementation results"
```

### 4. Superseded (If decision changes later):

**Status:** `Superseded by ADR: [new-adr-name]`

---

## ✅ ADR CHECKLIST

### Pre-Implementation:
- [ ] ADR file created in correct phase folder
- [ ] Context section explains the problem
- [ ] Decision section outlines planned approach
- [ ] Alternatives section evaluates at least 2 options
- [ ] Consequences section considers trade-offs
- [ ] Pre-implementation notes detail the plan
- [ ] Status set to "Draft"
- [ ] Committed to git

### Post-Implementation:
- [ ] Post-implementation notes added
- [ ] Deviations from plan documented
- [ ] Issues and solutions recorded
- [ ] Additional changes noted
- [ ] Lessons learned captured
- [ ] Status updated to "Completed"
- [ ] Committed to git before merging subtask

---

## 📊 ADR TYPES

### Technical Decisions:
- Technology choices (Puppeteer vs Playwright)
- Architecture patterns (EventEmitter vs Observables)
- Data structures (Map vs Array)
- Algorithm choices

### Design Decisions:
- API design (method names, parameters)
- CLI interface design
- Error handling strategies
- Logging approaches

### Process Decisions:
- Testing strategies
- Development workflows
- Deployment approaches

---

## 🎯 WRITING GOOD ADRs

### DO:
✅ Be specific and concrete  
✅ Explain the "why" not just the "what"  
✅ Document alternatives considered  
✅ Include code examples when helpful  
✅ Update ADR after implementation  
✅ Keep it concise but complete  

### DON'T:
❌ Leave ADRs as perpetual drafts  
❌ Skip the alternatives section  
❌ Forget to update post-implementation  
❌ Make ADRs too long (>2 pages)  
❌ Use jargon without explanation  
❌ Skip ADRs for "small" decisions  

---

## 📈 ADR METRICS

Track ADR effectiveness:

```markdown
## ADR Summary

**Total ADRs:** 20
**Completed:** 15
**Active:** 3
**Draft:** 2
**Superseded:** 0

**Average time Draft → Completed:** 2 days
**Decisions reversed:** 1
**Lessons learned documented:** 18
```

---

## 🔍 EXAMPLE ADR (Abbreviated)

```markdown
# ADR: 1.2 - Basic Puppeteer Integration

**Status:** Completed  
**Date Created:** 2025-10-02  
**Date Completed:** 2025-10-03  
**Subtask:** 1.2 - Basic Puppeteer Integration

## Context

Need to integrate Puppeteer to launch browsers and capture console logs.
Requirements: Headless mode, Chrome/Chromium only, console event capture.

## Decision

Use Puppeteer v21.0 with default configuration plus custom args for stability.
Create BrowserPool class to manage multiple browser instances.

## Alternatives Considered

### Option 1: Playwright
**Pros:** Multi-browser support, modern API
**Cons:** Heavier, unnecessary complexity for localhost-only tool
**Why not:** Over-engineered for our use case

### Option 2: Chrome CDP directly
**Pros:** Lower-level control
**Cons:** Much more code, harder to maintain
**Why not:** Puppeteer provides needed abstraction

## Consequences

**Positive:** Stable, well-documented, active community
**Negative:** Chrome-only (acceptable trade-off)

## Implementation Notes

### Pre-Implementation:
- Planned to use default Puppeteer config
- Expected to need custom viewport

### Post-Implementation:
- Added `--no-sandbox` for Linux compatibility
- Added `--disable-dev-shm-usage` for resource constraints
- Created BrowserPool with instance limit (10)
- Implemented retry logic (not originally planned)

**Deviations:** Added retry logic after discovering browser launch failures in testing.

**Lessons:** Always include fallback/retry for external process launches.

## Verification

- [x] Tests pass (14/14)
- [x] Manual testing on localhost:8080
- [x] Memory usage < 150MB per instance
- [x] Browser launches reliably
```

---

## 🚀 QUICK START

### Creating a new ADR:

1. **Start subtask:**
```bash
git checkout phase-1/subtask-1.2
```

2. **Create ADR:**
```bash
# Create: .claude/adr/phase-1/subtask-1.2-basic-puppeteer-integration.md
# Use the template above
# Fill in: Context, Decision, Alternatives, Consequences, Pre-implementation notes
```

3. **Commit ADR:**
```bash
git add .claude/adr/phase-1/subtask-1.2-basic-puppeteer-integration.md
git commit -m "docs(subtask-1.2): create pre-implementation ADR for Puppeteer integration"
```

4. **Do the work...**

5. **Update ADR:**
```bash
# Update: Post-implementation section
# Document: What actually happened, deviations, lessons
```

6. **Commit updated ADR:**
```bash
git add .claude/adr/phase-1/subtask-1.2-basic-puppeteer-integration.md
git commit -m "docs(subtask-1.2): update ADR with implementation results and lessons learned"
```

---

**Created:** October 2, 2025  
**Purpose:** Document all architectural decisions with rationale  
**Location:** `.claude/workflows/conventions/adr-conventions.md`

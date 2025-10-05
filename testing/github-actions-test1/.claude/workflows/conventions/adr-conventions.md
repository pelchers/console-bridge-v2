# ADR (Architecture Decision Record) Conventions

---

## 📋 WHAT IS AN ADR?

Documents architectural decisions with:
- **What** decision was made
- **Why** it was made  
- **What alternatives** were considered
- **What consequences** resulted

## 📁 FILE STRUCTURE

```
.claude/adr/
├── phase-1/
│   ├── subtask-1.1-project-initialization.md
│   └── subtask-1.2-basic-puppeteer-integration.md
└── phase-N/
    └── subtask-N.M-descriptive-name.md
```

## 📝 ADR TEMPLATE SECTIONS

1. **Context** - Background and problem statement
2. **Decision** - What we're doing and why
3. **Alternatives Considered** - Other options evaluated
4. **Consequences** - Positive, negative, neutral impacts
5. **Implementation Notes** - Pre/post implementation details
6. **Verification** - How to verify it worked
7. **Notes** - Additional context

## 🔄 ADR LIFECYCLE

**Pre-Implementation:** Create ADR with planned approach (Status: Draft)
**During Implementation:** Update as needed (Status: Active)
**Post-Implementation:** Document actual results (Status: Completed)

## ✅ CHECKLIST

- [ ] ADR created before coding
- [ ] Alternatives section has 2+ options
- [ ] Pre-implementation plan documented
- [ ] Post-implementation updates added
- [ ] Status updated to Completed
- [ ] Committed to git

---

For full conventions see original console-bridge project.

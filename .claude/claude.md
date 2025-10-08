# Claude Code - Root Configuration

**Purpose:** Centralized configuration for all projects in C:/Claude/
**Last Updated:** 2025-10-07

---

## 📂 Project Structure

```
C:/Claude/
├── .claude/                     # Root-level config (this file)
│   ├── workflows/conventions/   # Conventions & best practices
│   └── mcp.json                 # User-level MCP servers
├── console-bridge-v2/           # Individual projects
└── [other-projects]/
```

---

## 🔧 Key Resources

**Conventions:**
- **MCP Usage:** `.claude/workflows/conventions/mcp-conventions.md`
- **ADR Process:** `.claude/workflows/conventions/adr-conventions.md`
- **Git/Branching:** `.claude/workflows/conventions/branching-and-commits.md`
- **Testing:** `.claude/workflows/conventions/testing-conventions.md`

**MCP Servers:** See `.claude/mcp.json` for installed servers

---

## 📖 Quick Reference

**Documentation Priority:** Context7 → WebSearch
**Browser Testing:** Puppeteer (basic) | Browser MCP (Chrome+extensions) | Playwright (cross-browser)
**Desktop Automation:** Desktop Automation MCP (keyboard/mouse/fallback)

See `workflows/conventions/mcp-conventions.md` for complete decision matrix.

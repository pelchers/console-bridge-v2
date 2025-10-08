# MCP Configuration Troubleshooting Guide

**Last Updated:** 2025-10-07
**Issue:** MCPs not loading after adding to configuration
**Root Cause:** Wrong configuration file location

---

## 🐛 The Problem

**Symptoms:**
- Added MCP servers to config file
- Restarted Claude Code
- MCPs still not showing up in "Manage MCP servers" menu
- `claude mcp list` shows "Failed to connect" or doesn't list the MCP

**What was happening:**
We added MCPs to `~/.claude/mcp.json` but they weren't loading because Claude Code doesn't read that file!

---

## 🔍 Root Cause Analysis

### Wrong Configuration Location ❌

**What we did (WRONG):**
```
~/.claude/mcp.json  ← Claude Code does NOT read this file!
```

**Example of wrong config:**
```json
// File: C:\Users\pelyc\.claude\mcp.json (WRONG!)
{
  "mcpServers": {
    "desktop-automation": { ... },
    "playwright": { ... }
  }
}
```

### Correct Configuration Location ✅

**Where Claude Code actually looks:**
```
~/.claude.json  ← Root config file with per-project settings
```

**Example of correct config:**
```json
// File: C:\Users\pelyc\.claude.json (CORRECT!)
{
  "numStartups": 42,
  "installMethod": "installer",
  // ... other settings ...
  "mcpServers": {  ← This is the right place!
    "browsermcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["@browsermcp/mcp@latest"],
      "env": {}
    },
    "desktop-automation": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-desktop-automation"],
      "env": {}
    }
  }
}
```

---

## ✅ The Fix

### Step 1: Locate the Correct File

**User-level config:**
```
Windows: C:\Users\<username>\.claude.json
macOS:   ~/.claude.json
Linux:   ~/.claude.json
```

**Project-level config:**
```
<project-root>/.mcp.json
```

### Step 2: Add MCPs to the Right Place

**For user-level (available in all projects):**

Edit `~/.claude.json` and add to the root-level `mcpServers` object:

```json
{
  "mcpServers": {
    "desktop-automation": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-desktop-automation"],
      "env": {}
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {}
    }
  }
}
```

**For project-level (shared with team via git):**

Create `<project-root>/.mcp.json`:

```json
{
  "mcpServers": {
    "desktop-automation": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-desktop-automation"],
      "env": {}
    }
  }
}
```

### Step 3: Verify the Fix

**Check with CLI:**
```bash
claude mcp list
```

**Expected output:**
```
Checking MCP server health...

desktop-automation: npx -y mcp-desktop-automation - ✓ Connected
playwright: npx -y @playwright/mcp@latest - ✓ Connected
browsermcp: npx @browsermcp/mcp@latest - ✓ Connected
```

**Check in Claude Code UI:**
- Click MCP icon in status bar
- See "Manage MCP servers" menu
- All configured MCPs should show as connected

---

## 📂 Configuration File Hierarchy

Claude Code reads MCP configurations from multiple locations:

### 1. User-Level Config (Global)
**File:** `~/.claude.json`
**Scope:** Available in ALL projects
**Format:** Root-level `mcpServers` object
**Example:**
```json
{
  "mcpServers": {
    "browsermcp": { ... }
  }
}
```

### 2. Project-Level Config (Shared)
**File:** `<project-root>/.mcp.json`
**Scope:** This project only (shared via git)
**Format:** Entire file is `mcpServers` object
**Example:**
```json
{
  "mcpServers": {
    "desktop-automation": { ... }
  }
}
```

### 3. Local Project Config (Private)
**File:** `~/.claude.json` with per-project settings
**Scope:** Private to you in specific project
**Format:** Inside project-specific object
**Example:**
```json
{
  "projects": {
    "C:\\Claude": {
      "mcpServers": {
        "local-only-mcp": { ... }
      }
    }
  }
}
```

---

## 🚨 Common Mistakes

### Mistake 1: Wrong File Name
❌ `~/.claude/mcp.json` (inside .claude folder)
✅ `~/.claude.json` (root home directory)

### Mistake 2: Wrong File Format
❌ Using `.claude/settings.json` format
✅ Using `.claude.json` with `mcpServers` object

### Mistake 3: Missing `type` Field
❌ `{ "command": "npx", "args": [...] }`
✅ `{ "type": "stdio", "command": "npx", "args": [...] }`

### Mistake 4: Forgetting to Restart
❌ Edit config → expect immediate changes
✅ Edit config → restart Claude Code → verify

---

## 🔧 Quick Fix Script

**For user-level MCP addition (PowerShell/Windows):**

```powershell
# Read current config
$config = Get-Content ~/.claude.json | ConvertFrom-Json

# Add new MCP
$config.mcpServers | Add-Member -NotePropertyName "desktop-automation" -NotePropertyValue @{
    type = "stdio"
    command = "npx"
    args = @("-y", "mcp-desktop-automation")
    env = @{}
}

# Save config
$config | ConvertTo-Json -Depth 10 | Set-Content ~/.claude.json

# Restart Claude Code for changes to take effect
Write-Host "MCP added! Restart Claude Code to load it."
```

**For user-level MCP addition (Bash/Linux/macOS):**

```bash
# Create backup
cp ~/.claude.json ~/.claude.json.bak

# Use Python to add MCP
python3 <<EOF
import json
with open('$HOME/.claude.json', 'r') as f:
    config = json.load(f)

config['mcpServers']['desktop-automation'] = {
    'type': 'stdio',
    'command': 'npx',
    'args': ['-y', 'mcp-desktop-automation'],
    'env': {}
}

with open('$HOME/.claude.json', 'w') as f:
    json.dump(config, f, indent=2)

print("MCP added! Restart Claude Code.")
EOF
```

---

## ✅ Verification Checklist

After fixing configuration:

- [ ] Edited correct file (`~/.claude.json` NOT `~/.claude/mcp.json`)
- [ ] Added `type: "stdio"` to each MCP config
- [ ] Verified JSON syntax is valid
- [ ] Restarted Claude Code completely (quit and relaunch)
- [ ] Ran `claude mcp list` to verify connection
- [ ] Checked "Manage MCP servers" menu in Claude Code
- [ ] Tested MCP functionality (e.g., `get_screen_size`)

---

## 📖 Real-World Example: Our Fix

### What We Had (WRONG):

```
C:\Users\pelyc\.claude\mcp.json  ← Wrong location!
{
  "mcpServers": {
    "desktop-automation": { ... },
    "playwright": { ... },
    "chrome-devtools": { ... },
    "context7": { ... }
  }
}
```

**Result:** Only `browsermcp` worked (it was in the correct file)

### What We Fixed (CORRECT):

```
C:\Users\pelyc\.claude.json  ← Correct location!
{
  // ... other settings ...
  "mcpServers": {
    "browsermcp": { "type": "stdio", ... },
    "desktop-automation": { "type": "stdio", ... },
    "playwright": { "type": "stdio", ... },
    "chrome-devtools": { "type": "stdio", ... },
    "context7": { "type": "stdio", ... }
  }
}
```

**Result:** All 4 MCPs connected successfully! ✅

---

## 🎯 Key Takeaways

1. **User-level config:** `~/.claude.json` (root `mcpServers` object)
2. **Project-level config:** `<project>/.mcp.json` (entire file is `mcpServers`)
3. **Always include:** `"type": "stdio"` in each MCP config
4. **Always restart:** Claude Code after config changes
5. **Always verify:** With `claude mcp list` command

---

## 📚 Related Documentation

- **Main MCP Guide:** `../README.md`
- **Browser MCP Guide:** `./browser-mcp-guide.md`
- **MCP Conventions:** `../workflows/conventions/mcp-conventions.md`
- **Official Claude Code MCP Docs:** https://docs.claude.com/en/docs/claude-code/mcp

---

**Created:** 2025-10-07
**Issue Resolved:** MCP configuration location confusion
**Lesson Learned:** Check official docs for correct config file paths!
**Status:** ✅ Resolved - All MCPs working

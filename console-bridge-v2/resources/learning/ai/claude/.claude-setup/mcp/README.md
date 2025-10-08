# MCP (Model Context Protocol) Setup Guide

**Last Updated:** 2025-10-07
**Claude Code Version:** Latest

---

## 📚 What is MCP?

**Model Context Protocol (MCP)** is an open protocol that enables AI assistants like Claude to connect with external tools, data sources, and services. Think of it as giving Claude "superpowers" to interact with your system, browser, databases, APIs, and more.

### Key Benefits

- 🔧 **Tool Integration** - Connect Claude to browsers, filesystems, APIs, databases
- 🚀 **Automation** - Automate repetitive tasks (testing, data collection, workflows)
- 🔒 **Local Control** - MCP servers run locally on your machine for privacy/speed
- 🎯 **Context-Aware** - Claude gets real-time access to tools and data

---

## 🛠️ MCP Server Categories

### 1. Browser Automation
- **Browser MCP** - Control your existing browser (click, type, read console logs)
- **Chrome DevTools MCP** - Deep Chrome DevTools integration (performance, network)
- **Playwright MCP** - Cross-browser automation (Chromium, Firefox, WebKit)
- **Browser-Use MCP** - Autonomous agent for browser tasks

### 2. Desktop Automation
- **MCPControl (Windows)** - Windows automation (mouse, keyboard, windows)
- **AppleScript MCP (macOS)** - macOS system automation

### 3. Development Tools
- **Puppeteer MCP** - Browser scraping and testing
- **Git MCP** - Git repository operations
- **Database MCP** - Database connections (PostgreSQL, MySQL, SQLite)

### 4. Data & APIs
- **Fetch MCP** - HTTP requests and API calls
- **Google Drive MCP** - Access Google Drive files
- **Slack MCP** - Slack integration

---

## 📖 Installation Methods

### Method 1: CLI Wizard (Recommended)

```bash
# Global installation (available in all projects)
claude mcp add --scope user <server-name> <command> [args...]

# Project-specific installation
claude mcp add --scope project <server-name> <command> [args...]
```

**Example:**
```bash
claude mcp add --scope user browsermcp npx @browsermcp/mcp@latest
```

### Method 2: Manual Configuration

Edit `~/.claude/settings.json` (global) or `./.claude/settings.json` (project):

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name@latest"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

**After editing:** Restart Claude Code to load the configuration.

---

## 🔍 Verification

After installation, verify MCP servers are loaded:

1. Restart Claude Code
2. Look for the MCP tools icon (🔌) in the status bar
3. Test by asking Claude: "What MCP tools do you have access to?"

---

## 📂 Configuration File Locations

### Global Configuration
- **Primary:** `~/.claude/settings.json` (recommended)
- **Windows:** `%USERPROFILE%\.claude\settings.json`
- **macOS/Linux:** `~/.claude/settings.json`

### Project Configuration
- `./.claude/settings.json` (in your project root)

### Claude Desktop (Different from Claude Code)
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

---

## 🚀 Quick Start Examples

### Browser MCP (Most Common)

**Installation:**
```bash
claude mcp add --scope user browsermcp npx @browsermcp/mcp@latest
```

**Install Chrome Extension:**
- Visit: https://chromewebstore.google.com/detail/browser-mcp-automate-your/bjfgambnhccakkhmkepdoekmckoijdlc

**Usage:**
```
"Use browser MCP to navigate to https://example.com"
"Click the button with text 'Submit'"
"Get console logs from the page"
```

### Chrome DevTools MCP

**Installation:**
```bash
claude mcp add --scope user chrome-devtools npx -y chrome-devtools-mcp@latest
```

**Usage:**
```
"Use Chrome DevTools to trace performance"
"Analyze network requests to /api/data"
```

---

## 📚 Detailed Guides

For comprehensive setup guides for specific MCP servers, see:

- **[Browser MCP Guide](./mcps/browser-mcp-guide.md)** - Complete guide for browser automation
- **[Chrome DevTools MCP Guide](./mcps/chrome-devtools-mcp-guide.md)** - DevTools integration
- **[Playwright MCP Guide](./mcps/playwright-mcp-guide.md)** - Cross-browser testing

---

## 🐛 Troubleshooting

### MCP Server Not Loading

**Check logs:**
```bash
# View Claude Code logs
tail -f ~/.claude/logs/mcp.log
```

**Common fixes:**
1. Restart Claude Code
2. Verify Node.js version (v20.19+)
3. Check command path (use full paths if needed)
4. Ensure environment variables are set

### Permission Errors

**Windows:** Run terminal as Administrator
**macOS/Linux:** Check file permissions with `chmod +x`

### "Command not found"

Use `npx` to ensure packages are available:
```bash
npx -y package-name@latest
```

---

## 📖 Official Resources

- **MCP Specification:** https://modelcontextprotocol.io/
- **Claude MCP Docs:** https://docs.claude.com/en/docs/claude-code/mcp
- **MCP Server Directory:** https://mcpservers.org/
- **Claude Desktop Extensions:** https://www.anthropic.com/engineering/desktop-extensions

---

## 🎯 Best Practices

1. **Start with `--scope user`** for MCP servers you'll use across projects
2. **Use `--scope project`** for project-specific tools
3. **Keep packages updated** with `@latest` in configuration
4. **Document dependencies** - Note which MCP servers your project needs
5. **Test after installation** - Always verify tools work before relying on them

---

## 📝 Notes

- MCP servers run as **separate processes** - they're lightweight and fast
- **Privacy:** Data stays local unless explicitly sent to external services
- **Extensions:** Some MCP servers (like Browser MCP) require browser extensions
- **Permissions:** MCP servers inherit Claude Code's file/system permissions

---

**Created:** 2025-10-07
**Research by:** Claude Code (Sonnet 4.5)
**Purpose:** Centralized MCP setup and troubleshooting reference

# Claude Desktop Configuration Guide
## How to Make Claude Always Use Your File System (C:\Claude)

---

## 🎯 THE PROBLEM

When you ask Claude to create files, Claude has two options:

1. **Filesystem MCP** → Writes to `C:\Claude\` (YOUR PC - permanent ✅)
2. **Internal bash tools** → Writes to `/home/claude/` (Claude's temp space - disappears ❌)

By default, Claude often uses internal tools because they're faster/easier for Claude, but this means **you can't access the files!**

---

## ✅ THE SOLUTION

### Option 1: Tell Claude Explicitly (Every Time)
At the start of any conversation where you want files created:

```
"Use Filesystem tools to write everything to C:\Claude\[project-name]\"
```

Or simply:
```
"Write all files using Filesystem MCP to my C:\Claude folder"
```

### Option 2: Add Custom Instructions (If Available)

**Check if your Claude Desktop has Custom Instructions:**
1. Open Claude Desktop
2. Look for Settings → Preferences or Custom Instructions
3. If available, add this:

```
FILE SYSTEM CONVENTIONS:
- Always use Filesystem MCP tools to write files to C:\Claude\
- Never use internal bash/create_file tools for user-facing files
- Only use /home/claude/ when explicitly asked to use bash/Linux
- Default directory for all projects: C:\Claude\
- Ask for confirmation before using internal tools
```

**Note:** As of October 2025, this feature may not be available in all Claude Desktop versions.

### Option 3: MCP Server Configuration (Advanced)

You can edit the MCP configuration file to prioritize Filesystem tools.

**Location:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

**What to do:**
1. Open the file in a text editor
2. Look for the MCPs section
3. Ensure Filesystem MCP is enabled
4. (Advanced) You could potentially set priority/defaults here

**Example structure:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "...",
      "args": [...],
      "env": {
        "DEFAULT_DIRECTORY": "C:\\Claude"
      }
    }
  }
}
```

⚠️ **Warning:** Modifying this file incorrectly can break Claude Desktop. Make a backup first!

---

## 📋 QUICK REFERENCE COMMANDS

### ✅ Correct Commands (Files go to your PC):

```
"Use Filesystem to create these files in C:\Claude\myproject\"
```

```
"Write this file using Filesystem MCP"
```

```
"Create a project in C:\Claude using Filesystem tools"
```

### ❌ What Happens Without Specifying:

```
"Create files for this project"
→ Claude might use internal tools
→ Files go to /home/claude/ 
→ You can't access them easily
```

---

## 🔧 HOW TO CHECK WHAT CLAUDE IS USING

**When Claude writes files, look for:**

✅ **Using Filesystem MCP:**
```
Filesystem:write_file
Filesystem:create_directory
```
→ Files ARE on your PC at C:\Claude\

❌ **Using Internal Tools:**
```
bash_tool
create_file
view
str_replace
```
→ Files are in Claude's temp space (NOT accessible)

---

## 📁 FILE LOCATION CHEAT SHEET

| Tool Used | Where Files Go | Can You Access? | Persists? |
|-----------|---------------|-----------------|-----------|
| Filesystem MCP | C:\Claude\ | ✅ Yes - Windows Explorer | ✅ Yes |
| bash_tool | /home/claude/ | ❌ No - unless moved to outputs | ❌ No |
| create_file | /home/claude/ | ❌ No - unless moved to outputs | ❌ No |
| view | /home/claude/ | ❌ No - read only | N/A |

---

## 💡 PRO TIPS

### Tip 1: Start Every Project Conversation With:
```
"Create [project name] in C:\Claude\[project-name]\ using Filesystem tools"
```

### Tip 2: Keep the Reference File Handy
The file `C:\Claude\mcp-functions-reference.md` contains a complete tool reference. You can say:
```
"Read the mcp-functions-reference.md and follow those conventions"
```

### Tip 3: Create Project Templates
Create a folder structure in C:\Claude\ ahead of time:
```
C:\Claude\
  ├── projects\
  ├── guides\
  ├── temp\
  └── archive\
```

Then specify:
```
"Create the new project in C:\Claude\projects\ using Filesystem"
```

### Tip 4: If Claude Uses Wrong Tools
If Claude starts using bash_tool or create_file, just interrupt:
```
"Stop - use Filesystem MCP instead to write to C:\Claude\"
```

Claude can usually switch mid-conversation.

---

## 🆘 TROUBLESHOOTING

### Problem: "I asked for files but can't find them"

**Solution:**
1. Ask Claude: "What tool did you use to create files?"
2. If Claude says bash_tool or create_file:
   - Files are in /home/claude/
   - Ask: "Copy those files to C:\Claude\ using Filesystem"
3. If Claude says Filesystem:
   - Check C:\Claude\ in Windows Explorer
   - Files should be there

### Problem: "Claude keeps using bash_tool"

**Solution:**
- Be explicit: "Use Filesystem MCP, not bash tools"
- Remind at start of conversation
- Consider creating Custom Instructions (if available)

### Problem: "Files were there before but disappeared"

**Possible causes:**
1. They were in /home/claude/ (temporary)
2. New conversation/session reset Claude's temp space
3. Files need to be in C:\Claude\ to persist

**Solution:**
- Always specify Filesystem tools for persistent files
- Keep important files in C:\Claude\

---

## 🎓 UNDERSTANDING THE SYSTEM

### What IS Saved:
- ✅ Conversation history
- ✅ Files in C:\Claude\ (created with Filesystem MCP)
- ✅ Your Custom Instructions (if feature exists)

### What is NOT Saved:
- ❌ Files in /home/claude/ (Claude's temp workspace)
- ❌ Bash command history
- ❌ Internal tool state

### Why This Matters:
If you resume a conversation and Claude says "I created files at /home/claude/project/", those files might be gone! Always use Filesystem MCP for files you want to keep.

---

## 📊 DECISION FLOWCHART

```
Do you want files on your PC?
│
├─ YES → Tell Claude: "Use Filesystem tools to write to C:\Claude\"
│         Result: Files accessible in Windows Explorer ✅
│
└─ NO → Claude can use any tools
          Result: Temp files in /home/claude/ ❌
```

---

## 🔮 FUTURE IMPROVEMENTS

**Feature Requests for Anthropic:**

1. **Settings Toggle:**
   ```
   ☑️ Always use Filesystem MCP for file operations
   ☑️ Default save location: C:\Claude\
   ```

2. **Tool Confirmation:**
   ```
   ⚠️ Warning: About to use internal tools. Files will be temporary.
   [ Use Filesystem Instead ] [ Continue Anyway ]
   ```

3. **Auto-Detection:**
   When user says "create files", Claude automatically asks:
   ```
   "Should I use Filesystem MCP (saves to C:\Claude) 
    or internal tools (temporary)?"
   ```

---

## 📝 SUMMARY CHECKLIST

Before starting any file-creation project:

- [ ] Specify: "Use Filesystem tools"
- [ ] Specify location: "Write to C:\Claude\[project-name]\"
- [ ] Verify Claude is using Filesystem MCP (look for tool names)
- [ ] Check C:\Claude\ in Windows Explorer to confirm files exist
- [ ] If files are missing, ask Claude what tools were used

---

## 📚 ADDITIONAL RESOURCES

- **MCP Functions Reference:** `C:\Claude\mcp-functions-reference.md`
- **Claude Desktop Docs:** [https://docs.anthropic.com/claude/desktop](https://docs.anthropic.com/claude/desktop)
- **MCP Protocol Docs:** [https://modelcontextprotocol.io](https://modelcontextprotocol.io)

---

**Created:** October 2, 2025  
**Purpose:** Ensure files are always accessible on user's PC  
**Location:** C:\Claude\guides\claude-desktop\file-system-configuration.md  
**Last Updated:** October 2, 2025

---

## 💬 EXAMPLE CONVERSATION STARTERS

Copy/paste these to start your conversations:

### For New Projects:
```
Create a new [type] project called [name] in C:\Claude\projects\[name]\ 
using Filesystem tools. Create the complete folder structure and all files.
```

### For Documentation:
```
Write comprehensive documentation for [topic] and save it to 
C:\Claude\guides\[topic]\ using Filesystem MCP.
```

### For Code Files:
```
Create the following files in C:\Claude\code\[project]\ using Filesystem:
[list files]
```

### General Reminder:
```
For this conversation, always use Filesystem MCP to write any files 
to C:\Claude\ so I can access them.
```

---

🎉 **You now have a permanent reference for making Claude write to your file system!**

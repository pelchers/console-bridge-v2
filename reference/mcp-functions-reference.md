# MCP Functions & Tools Reference Guide
## Quick Reference for Telling Claude Which Tools to Use

---

## 🔧 FILESYSTEM TOOLS (MCP - Use for C:\Claude access)

### ✅ ALWAYS USE THESE for C:\Claude folder:

**Filesystem:write_file** - Write/create files in C:\Claude
```
Use: "use Filesystem to write this to C:\Claude\..."
```

**Filesystem:read_file** - Read files from C:\Claude
```
Use: "read this file from C:\Claude using Filesystem"
```

**Filesystem:read_multiple_files** - Read multiple files at once
```
Use: "read these files using Filesystem"
```

**Filesystem:create_directory** - Create directories in C:\Claude
```
Use: "create directories in C:\Claude using Filesystem"
```

**Filesystem:list_directory** - List directory contents
```
Use: "list the C:\Claude directory using Filesystem"
```

**Filesystem:directory_tree** - Get recursive tree view (JSON)
```
Use: "show me the tree structure using Filesystem"
```

**Filesystem:edit_file** - Make line-based edits
```
Use: "edit this file using Filesystem tools"
```

**Filesystem:move_file** - Move/rename files
```
Use: "move this file using Filesystem"
```

**Filesystem:search_files** - Search for files by pattern
```
Use: "search for files in C:\Claude using Filesystem"
```

**Filesystem:get_file_info** - Get file metadata
```
Use: "get file info using Filesystem"
```

**Filesystem:list_allowed_directories** - See what directories are accessible
```
Use: "what directories can you access with Filesystem?"
```

---

## 🌐 WEB TOOLS (MCP - Use for web searches & fetching)

**web_search** - Search the web using Brave
```
Use: "search the web for..."
```

**web_fetch** - Fetch content from a specific URL
```
Use: "fetch this URL..."
```

---

## 📄 PDF TOOLS (MCP - Use for PDF operations)

**list_pdfs** - List PDF files in a directory
**read_pdf_fields** - Read form fields from PDF
**fill_pdf** - Fill PDF forms with data
**bulk_fill_from_csv** - Fill multiple PDFs from CSV
**save_profile** - Save reusable form data profiles
**load_profile** - Load saved profiles
**list_profiles** - List all saved profiles
**fill_with_profile** - Fill PDF using saved profile
**extract_to_csv** - Extract PDF form data to CSV
**validate_pdf** - Validate if all required fields filled
**read_pdf_content** - Read and analyze full PDF content
**get_pdf_resource_uri** - Get resource URI for PDF

```
Use: "use PDF tools to fill this form..."
```

---

## 🌉 B12 WEBSITE GENERATOR (MCP)

**generate_website** - Generate website from business description
```
Use: "generate a website using B12..."
```

---

## 📚 CONTEXT7 DOCUMENTATION (MCP - Use for library docs)

**resolve-library-id** - Find library ID for documentation
**get-library-docs** - Fetch library documentation
```
Use: "get documentation for this library using Context7..."
```

---

## 💬 CONVERSATION TOOLS (MCP - Use for past chats)

**conversation_search** - Search through past conversations
```
Use: "search my past conversations for..."
```

**recent_chats** - Retrieve recent chat conversations
```
Use: "show my recent chats..."
```

---

## 🖥️ CLAUDE'S INTERNAL COMPUTER TOOLS (NOT MCP)

### ⚠️ DO NOT USE THESE for C:\Claude - they work in Linux container!

**Important:** This is Claude's temporary working directory in a Docker container.
- **Location:** `/home/claude/` - This is NOT cloud storage, NOT your PC
- **Lifecycle:** Files here are TEMPORARY - they may not persist between sessions
- **Conversation History:** IS saved (you can resume chats and see prior messages)
- **Filesystem:** NOT saved (files in /home/claude/ may disappear)
- **Access:** You can only access files by moving them to `/mnt/user-data/outputs/` for download
- **Purpose:** Temporary workspace for Claude to run commands, process files, etc.
- **Think of it as:** Claude's RAM/scratch space - conversation is saved, but files are not guaranteed to persist

**bash_tool** - Run bash commands (Linux environment only)
```
Location: /home/claude/ (NOT your PC!)
Use ONLY when: Explicitly asked to use bash/Linux
```

**view** - View files/directories (Linux environment only)
```
Location: /home/claude/ (NOT your PC!)
```

**str_replace** - String replacement in files (Linux environment)
```
Location: /home/claude/ (NOT your PC!)
```

**create_file** - Create files (Linux environment)
```
Location: /home/claude/ (NOT your PC!)
```

---

## 🎯 QUICK DECISION GUIDE

### When user says: "Write files to my folder"
✅ USE: **Filesystem:write_file** to C:\Claude

### When user says: "Create files in my Claude folder"
✅ USE: **Filesystem:write_file** and **Filesystem:create_directory** to C:\Claude

### When user says: "Use bash" or "run this command"
✅ USE: **bash_tool** (they want Linux commands)

### When user says: "Search the web"
✅ USE: **web_search**

### When user says: "Fill this PDF form"
✅ USE: **PDF Tools MCP** (read_pdf_fields, fill_pdf, etc.)

### When user says: "Search my past conversations"
✅ USE: **conversation_search**

### When user says: "What can you access?"
✅ USE: **Filesystem:list_allowed_directories**

---

## 🔍 WHERE FILES GO:

### Filesystem Tools (MCP):
- **Writes to:** C:\Claude\ (YOUR PC)
- **You can access:** Immediately in Windows Explorer

### Claude's Internal Tools (bash, view, etc.):
- **Writes to:** /home/claude/ (Linux container)
- **You can access:** Only via /mnt/user-data/outputs/ for download

---

## 📝 EXAMPLES OF CORRECT USAGE:

### ✅ CORRECT - User can access files:
```
User: "Create a file in my Claude folder"
Claude uses: Filesystem:write_file
Result: File appears in C:\Claude\
```

### ❌ WRONG - User cannot access files:
```
User: "Create a file in my Claude folder"
Claude uses: bash_tool with /home/claude/
Result: File is in Linux container, not user's PC
```

### ✅ CORRECT - Explicit Linux request:
```
User: "Use bash to process this"
Claude uses: bash_tool
Result: Work done in Linux environment as requested
```

---

## 🎓 REMEMBER:

1. **Default for C:\Claude = Use Filesystem MCP**
2. **Only use bash/view/create_file when explicitly asked**
3. **When in doubt, ask user: "Should I use Filesystem tools (directly to C:\Claude) or Linux tools?"**

---

## 📋 FULL TOOL INVENTORY:

### MCP Tools (External Services):
- Filesystem (11 tools) ✅ USE FOR C:\Claude
- Web Search (2 tools)
- PDF Tools (12 tools)
- B12 Website Generator (1 tool)
- Context7 Documentation (2 tools)
- Conversation Tools (2 tools)

### Claude's Internal Tools (Linux Container):
- bash_tool ⚠️ Linux only
- view ⚠️ Linux only
- str_replace ⚠️ Linux only
- create_file ⚠️ Linux only

**Total: 33 tools available**

---

Created: October 2, 2025
Purpose: Help user tell Claude which tools to use
Location: C:\Claude\mcp-functions-reference.md

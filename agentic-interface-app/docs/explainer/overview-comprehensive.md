# AI Agentic Desktop Tool - Comprehensive Overview

**Last Updated:** October 5, 2025  
**Version:** 1.0.0  
**Document Type:** Complete Functional & Technical Explanation

---

## Executive Overview

The AI Agentic Desktop Tool is a revolutionary local-first application that enables users to orchestrate multiple AI-powered agents through an intuitive visual interface. Think of it as a "command center" for AI automation where you can chain together different AI agents to accomplish complex tasks involving web browsing, desktop control, coding, data analysis, and content creation—all while maintaining complete privacy and control over your data.

### The Core Concept

Imagine you want to research competitors, compile data into a spreadsheet, generate a presentation, and send it via email. Instead of manually doing each step, you describe what you want in plain English. Our app automatically selects the right AI agents (Web Research Agent → Data Analysis Agent → Content Creation Agent → Email Agent), choreographs them into a workflow, executes everything while recording the process, and gives you a complete video replay and documentation of what happened.

### Why This Matters

**For Users:**
- **Privacy-First:** Your data never leaves your machine (local-first architecture)
- **Cost-Effective:** You bring your own Claude API key—no per-use fees from us
- **Full Transparency:** Every action is recorded and can be replayed
- **Extensible:** Create custom agents for your specific needs
- **Visual:** See exactly what the AI is doing in real-time

**For Us (Business):**
- **Sustainable Revenue:** Subscription-based licensing (not usage-based)
- **Zero API Costs:** Users provide their own Claude API keys
- **Protected IP:** Proprietary license prevents unauthorized redistribution
- **Scalable:** Local-first means minimal server infrastructure

---

## Technology Stack Overview

### Desktop Application Stack

```
┌─────────────────────────────────────────────────────┐
│                 DESKTOP APPLICATION                  │
├─────────────────────────────────────────────────────┤
│  Framework:        Electron 28+                     │
│  Frontend:         React 18+ with TypeScript        │
│  Build Tool:       Vite 5                           │
│  State Management: Zustand                          │
│  UI Framework:     shadcn/ui + Tailwind CSS         │
│  Workflow Visual:  React Flow                       │
│  Database:         SQLite with FTS5                 │
│  Automation:       Puppeteer (Web)                  │
│                    Claude Computer Use (Desktop)    │
│  AI Engine:        Claude SDK (@anthropic-ai/sdk)   │
│  Auth:             BetterAuth (Self-hosted)         │
│  Video Recording:  MediaRecorder API (WebM/VP9)     │
└─────────────────────────────────────────────────────┘
```

**Why These Choices:**

**Electron** over Tauri:
- ✅ Mature ecosystem with extensive documentation
- ✅ Native Chromium integration (perfect for Puppeteer)
- ✅ Proven track record (VS Code, Slack, Discord use it)
- ✅ Better debugging tools and dev experience
- ❌ Larger bundle size (acceptable tradeoff for features)

**React Flow** for workflow visualization:
- ✅ Industry-standard for node-based UIs
- ✅ Highly customizable nodes and edges
- ✅ Built-in zoom, pan, and minimap
- ✅ Excellent TypeScript support

**Zustand** for state management:
- ✅ Only 3KB (vs Redux 20KB+)
- ✅ Minimal boilerplate compared to Redux
- ✅ Built-in TypeScript support
- ✅ Persistent state with middleware
- ✅ No context provider wrapping needed

**SQLite with FTS5**:
- ✅ Zero-configuration embedded database
- ✅ Full-text search built-in (FTS5 extension)
- ✅ ACID compliance for data integrity
- ✅ Perfect for local-first applications
- ✅ Can handle millions of records efficiently

**Puppeteer** for browser automation:
- ✅ Most mature browser automation library
- ✅ Maintained by Chrome team
- ✅ Integrates perfectly with Electron's Chromium
- ✅ Extensive API for all browser actions

**Claude Computer Use** for desktop automation:
- ✅ Official Anthropic desktop control API
- ✅ Can control mouse, keyboard, and screen
- ✅ Analyzes screenshots to make decisions
- ✅ Safe execution with permission controls

---

### Mobile Application Stack (Future Phase)

```
┌─────────────────────────────────────────────────────┐
│                 MOBILE APPLICATION                   │
├─────────────────────────────────────────────────────┤
│  Framework:        React Native                     │
│  Navigation:       React Navigation 6               │
│  State Management: Zustand (same as desktop)        │
│  UI Framework:     React Native Paper               │
│  Database:         WatermelonDB (SQLite wrapper)    │
│  Auth:             BetterAuth Client                │
│  Video Player:     react-native-video               │
│  API Client:       Axios with retry logic           │
└─────────────────────────────────────────────────────┘
```

**Mobile App Capabilities:**
- 📱 View workflow history
- 📱 Watch recorded workflow videos
- 📱 Read markdown documentation
- 📱 Trigger simple workflows remotely
- 📱 Receive push notifications when workflows complete
- 📱 Basic chat interface (delegates to desktop for execution)

**Mobile App Limitations:**
- ❌ Cannot create complex workflows (UI limitation)
- ❌ Cannot run browser/desktop automation (platform limitation)
- ❌ Cannot create custom agents (better on desktop)
- ✅ Companion app, not replacement for desktop

---

### Web Subscription Platform Stack

```
┌─────────────────────────────────────────────────────┐
│              WEB SUBSCRIPTION PLATFORM              │
├─────────────────────────────────────────────────────┤
│  Framework:        Next.js 15+ (App Router)         │
│  Database:         Supabase (PostgreSQL)            │
│  Authentication:   Clerk                            │
│  Payments:         Stripe                           │
│  UI Framework:     shadcn/ui + Tailwind CSS         │
│  Deployment:       Vercel                           │
│  Analytics:        Vercel Analytics                 │
│  Error Tracking:   Sentry                           │
└─────────────────────────────────────────────────────┘
```

**Based on:** JavaScript Mastery video tutorial (proven SaaS stack)

**Why This Stack:**
- ✅ Next.js 15 with App Router (latest React patterns)
- ✅ Supabase for instant PostgreSQL + real-time + auth
- ✅ Clerk for managed authentication (OAuth, magic links)
- ✅ Stripe for bulletproof payment processing
- ✅ Vercel for zero-config deployments
- ✅ All components work together seamlessly

---

## Visual Architecture Diagrams

### Desktop Application - Main Interface Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  File    Edit    View    Run    Help          [User Menu] [Settings] │  ← TOP MENUBAR
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┬─────────────────────────────────┬──────────────┐  │
│  │              │                                  │              │  │
│  │   WORKFLOW   │       CENTER CANVAS              │    AGENT     │  │
│  │   HISTORY    │                                  │  WORKFLOW    │  │
│  │   (LEFT      │   Default: ACTIONS VIEWER        │   BUILDER    │  │
│  │   SIDEBAR)   │   ┌─────────────────────────┐   │  (RIGHT      │  │
│  │              │   │                         │   │   MINI       │  │
│  │  🔍 Search   │   │   Live Browser/Desktop  │   │   SIDEBAR)   │  │
│  │  ═══════════ │   │   Automation Display    │   │              │  │
│  │              │   │                         │   │  ┌────────┐  │  │
│  │  📁 Workflow │   │   [Puppeteer Window]    │   │  │ Agent1 │  │  │
│  │     Card 1   │   │    or                   │   │  └───┬────┘  │  │
│  │  ─────────── │   │   [Desktop Recording]   │   │      │       │  │
│  │  🗓️ Oct 5    │   │                         │   │  ┌───▼────┐  │  │
│  │  ✅ Success  │   │                         │   │  │ Agent2 │  │  │
│  │  🤖 3 agents │   └─────────────────────────┘   │  └───┬────┘  │  │
│  │              │                                  │      │       │  │
│  │  📁 Workflow │   OR: WORKFLOW DETAIL VIEW       │  ┌───▼────┐  │  │
│  │     Card 2   │   ┌─────────────────────────┐   │  │ Agent3 │  │  │
│  │  ─────────── │   │ 📹 Video Player         │   │  └────────┘  │  │
│  │  🗓️ Oct 4    │   ├─────────────────────────┤   │              │  │
│  │  ❌ Failed   │   │ 📄 Markdown Docs        │   │   [Clear]    │  │
│  │  🤖 2 agents │   ├─────────────────────────┤   │   [Execute]  │  │
│  │              │   │ 📊 Metadata Form        │   │              │  │
│  │  📁 Workflow │   └─────────────────────────┘   │              │  │
│  │     Card 3   │          [Minimize ↙]            │              │  │
│  │              │                                  │              │  │
│  │      ...     │                                  │              │  │
│  │              │                                  │              │  │
│  └──────────────┴─────────────────────────────────┴──────────────┘  │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  AGENT CHOREOGRAPHY PANEL (Visual Flow)                      │   │  ← ABOVE CHAT
│  │  Agent1 ──→ Agent2 ──→ Agent3  [Click to configure nodes]    │   │
│  └──────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│  💬 Chat Input: "Research AI competitors and create comparison..."  │  ← CHAT INPUT
│  [📎 Attach] [🎯 Auto-select Agents ▼]              [Send ➤]         │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Panel Breakdown

#### 1️⃣ **Top Menubar** (Always Visible)

```
╔════════════════════════════════════════════════════════════════╗
║  File         Edit         View         Run         Help      ║
║  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌─────────┐ ║
║  │ New    │  │ Undo   │  │ Zoom In│  │ Start  │  │ Docs    │ ║
║  │ Open   │  │ Redo   │  │Zoom Out│  │ Pause  │  │Tutorial │ ║
║  │ Save   │  │ Cut    │  │ Fit    │  │ Stop   │  │Shortcut │ ║
║  │ Close  │  │ Copy   │  │Sidebar │  │ Debug  │  │ Issue   │ ║
║  │ Export │  │ Paste  │  │ Theme  │  │Settings│  │ About   │ ║
║  │ Exit   │  │ Find   │  └────────┘  └────────┘  └─────────┘ ║
║  └────────┘  └────────┘                                       ║
╚════════════════════════════════════════════════════════════════╝
```

**Functionality:**
- **File:** Workflow management (new, open, save, export)
- **Edit:** Text operations, undo/redo
- **View:** UI controls (zoom, panels, themes)
- **Run:** Workflow execution controls
- **Help:** Documentation and support

---

#### 2️⃣ **Left Sidebar - Workflow History**

```
╔══════════════════════════════════════╗
║  WORKFLOW HISTORY                    ║
╟──────────────────────────────────────╢
║  🔍 [Search workflows...]            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║  🎛️  Filters: [All ▼] [Date ▼]      ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║                                      ║
║  ┌────────────────────────────────┐ ║
║  │ 📹 [Thumbnail]                 │ ║
║  │ Competitor Research            │ ║
║  │ ─────────────────────────      │ ║
║  │ 🗓️ Oct 5, 2025 - 2:30 PM       │ ║
║  │ ⏱️ Duration: 5m 23s             │ ║
║  │ ✅ Success                      │ ║
║  │ 🤖 Agents: Web • Data • Content │ ║
║  │ 📁 Files Created: 3             │ ║
║  └────────────────────────────────┘ ║  ← Workflow Card
║                                      ║
║  ┌────────────────────────────────┐ ║
║  │ 📹 [Thumbnail]                 │ ║
║  │ Email Automation               │ ║
║  │ ─────────────────────────      │ ║
║  │ 🗓️ Oct 5, 2025 - 11:15 AM      │ ║
║  │ ⏱️ Duration: 2m 45s             │ ║
║  │ ⚠️ Partial Success              │ ║
║  │ 🤖 Agents: Web • Email          │ ║
║  │ 📁 Files Created: 1             │ ║
║  └────────────────────────────────┘ ║
║                                      ║
║  ┌────────────────────────────────┐ ║
║  │ 📹 [Thumbnail]                 │ ║
║  │ Code Review Task               │ ║
║  │ ─────────────────────────      │ ║
║  │ 🗓️ Oct 4, 2025 - 4:00 PM       │ ║
║  │ ⏱️ Duration: 8m 12s             │ ║
║  │ ❌ Failed                       │ ║
║  │ 🤖 Agents: Code • File          │ ║
║  │ 📁 Files Created: 0             │ ║
║  └────────────────────────────────┘ ║
║                                      ║
║         [Load More ▼]                ║
╚══════════════════════════════════════╝
```

**Functionality:**
- **Search Bar:** Full-text search across all workflows (FTS5-powered)
- **Filters:** Filter by date, status, agents used, tags
- **Workflow Cards:** Click to expand in center canvas
- **Infinite Scroll:** Lazy-load workflows as you scroll
- **Visual Indicators:** Status icons, duration, agent icons
- **Quick Actions:** Right-click for delete, export, re-run

**Data Displayed:**
- Workflow name (user-defined or auto-generated)
- Timestamp (date and time)
- Duration of execution
- Status (Success ✅ / Partial ⚠️ / Failed ❌)
- Agents used (with icons)
- Number of files created
- Video thumbnail (first frame)

---

#### 3️⃣ **Center Canvas - Actions Viewer (Default)**

```
╔════════════════════════════════════════════════════════════╗
║                    ACTIONS VIEWER                          ║
╟────────────────────────────────────────────────────────────╢
║  Current Workflow: "Competitor Research"                   ║
║  Status: 🟢 Running  |  Agent: Web Research  |  Step 2/5   ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │                                                    │   ║
║  │          🌐 BROWSER AUTOMATION VIEW                │   ║
║  │  ┌────────────────────────────────────────────┐   │   ║
║  │  │ https://competitor1.com                    │   │   ║
║  │  ├────────────────────────────────────────────┤   │   ║
║  │  │                                            │   │   ║
║  │  │  [Live Puppeteer Browser Window]           │   │   ║
║  │  │                                            │   │   ║
║  │  │  👆 Agent is currently:                    │   │   ║
║  │  │     • Navigating to pricing page           │   │   ║
║  │  │     • Extracting data from table           │   │   ║
║  │  │     • Taking screenshot                    │   │   ║
║  │  │                                            │   │   ║
║  │  │  [Website content visible in real-time]    │   │   ║
║  │  │                                            │   │   ║
║  │  └────────────────────────────────────────────┘   │   ║
║  │                                                    │   ║
║  │  OR (when desktop automation):                    │   ║
║  │                                                    │   ║
║  │  ┌────────────────────────────────────────────┐   │   ║
║  │  │     🖥️ DESKTOP SCREEN RECORDING            │   │   ║
║  │  │                                            │   │   ║
║  │  │  [Live screen capture of desktop]          │   │   ║
║  │  │                                            │   │   ║
║  │  │  Agent controlling:                        │   │   ║
║  │  │     • Mouse movements visible              │   │   ║
║  │  │     • Keyboard inputs shown                │   │   ║
║  │  │     • Window switching recorded            │   │   ║
║  │  │                                            │   │   ║
║  │  └────────────────────────────────────────────┘   │   ║
║  │                                                    │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  📊 Progress: ████████░░░░░░░░░░ 40%                      ║
║  ⏱️ Elapsed: 2m 15s  |  🔊 Recording: ON                  ║
╚════════════════════════════════════════════════════════════╝
```

**Functionality:**
- **Real-time Display:** See exactly what agents are doing
- **Browser View:** Embedded Puppeteer browser (for web automation)
- **Desktop View:** Screen recording (for desktop automation)
- **Progress Tracking:** Visual progress bar and time elapsed
- **Recording Indicator:** Shows when video is being recorded
- **Agent Status:** Current agent, step number, and action description

---

#### 3️⃣ **Center Canvas - Workflow Detail View (On Click)**

```
╔════════════════════════════════════════════════════════════╗
║  Workflow: "Competitor Research"          [✕ Minimize]    ║
╟────────────────────────────────────────────────────────────╢
║  📹 Video  |  📄 Markdown  |  📊 Metadata                  ║  ← Tabs
║  ═══════════════════════════════════════════════════════  ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  📹 VIDEO PLAYER                                   │   ║
║  │  ┌────────────────────────────────────────────┐   │   ║
║  │  │                                            │   │   ║
║  │  │        [Video Playback Area]               │   │   ║
║  │  │                                            │   │   ║
║  │  │        ▶️ Recording of workflow             │   │   ║
║  │  │        execution with timeline             │   │   ║
║  │  │                                            │   │   ║
║  │  └────────────────────────────────────────────┘   │   ║
║  │                                                    │   ║
║  │  ⏮️ ⏯️ ⏭️  0:00 ━━━━━○━━━━━━━━━ 5:23  🔊 ⚙️        │   ║
║  │                                                    │   ║
║  │  📍 Timeline Markers:                              │   ║
║  │  0:15 - Web Research Agent started                │   ║
║  │  1:30 - Data extraction completed                 │   ║
║  │  2:45 - Data Analysis Agent started               │   ║
║  │  4:00 - Content Creation Agent started            │   ║
║  │  5:23 - Workflow completed ✅                      │   ║
║  │                                                    │   ║
║  │  [Download Video] [Share] [Delete]                │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  OR when "Markdown" tab selected:                         ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  📄 MARKDOWN DOCUMENTATION                         │   ║
║  │                                                    │   ║
║  │  # Workflow: Competitor Research                  │   ║
║  │                                                    │   ║
║  │  ## Initial Request                               │   ║
║  │  Research top 5 AI tool competitors and create... │   ║
║  │                                                    │   ║
║  │  ## Workflow Information                          │   ║
║  │  - Date: October 5, 2025 - 2:30 PM                │   ║
║  │  - Duration: 5m 23s                               │   ║
║  │  - Status: Success ✅                              │   ║
║  │  - Agents: Web Research, Data, Content            │   ║
║  │                                                    │   ║
║  │  ## Execution Steps                               │   ║
║  │                                                    │   ║
║  │  ### Step 1: Web Research Agent                   │   ║
║  │  **Input:** "Find top 5 AI competitors"           │   ║
║  │  **Output:** [Extracted data...]                  │   ║
║  │                                                    │   ║
║  │  ### Step 2: Data Analysis Agent                  │   ║
║  │  ...                                              │   ║
║  │                                                    │   ║
║  │  [Copy Markdown] [Export PDF] [Print]             │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  OR when "Metadata" tab selected:                         ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  📊 WORKFLOW METADATA                              │   ║
║  │                                                    │   ║
║  │  Workflow ID: wf_abc123xyz                        │   ║
║  │  Name: Competitor Research                         │   ║
║  │  Created: Oct 5, 2025 - 2:30 PM                   │   ║
║  │  Duration: 5m 23s                                  │   ║
║  │  Status: Success                                   │   ║
║  │                                                    │   ║
║  │  Agents Used:                                      │   ║
║  │  ✓ Web Research Agent (v1.2)                      │   ║
║  │  ✓ Data Analysis Agent (v1.0)                     │   ║
║  │  ✓ Content Creation Agent (v1.1)                  │   ║
║  │                                                    │   ║
║  │  Files Created:                                    │   ║
║  │  • competitors.csv (2.3 KB)                        │   ║
║  │  • analysis.xlsx (15.7 KB)                         │   ║
║  │  • presentation.pptx (245 KB)                      │   ║
║  │                                                    │   ║
║  │  Tags: [research] [competitors] [analysis]        │   ║
║  │  Notes: [Click to add notes...]                   │   ║
║  │                                                    │   ║
║  │  [Edit] [Re-run Workflow] [Delete]                │   ║
║  └────────────────────────────────────────────────────┘   ║
╚════════════════════════════════════════════════════════════╝
```

**Functionality:**
- **Three Tabs:** Video, Markdown, Metadata
- **Video Tab:** Playback with timeline markers for each agent action
- **Markdown Tab:** Full documentation of workflow execution
- **Metadata Tab:** Form-based workflow information
- **Actions:** Download, share, delete, re-run
- **Minimize Button:** Returns to Actions Viewer

---

#### 4️⃣ **Right Mini-Sidebar - Agent Workflow Builder**

```
╔══════════════════════════════╗
║   AGENT WORKFLOW BUILDER     ║
╟──────────────────────────────╢
║                              ║
║  Available Agents:           ║
║  ┌────────────────────────┐  ║
║  │ 🌐 Web Research        │  ║  ← Drag to canvas
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ 💻 Code Generation     │  ║
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ 📁 File Management     │  ║
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ 📊 Data Analysis       │  ║
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ ✍️ Content Creation    │  ║
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ ✨ Custom Agent...     │  ║  ← Create new
║  └────────────────────────┘  ║
║                              ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                              ║
║  Current Workflow:           ║
║  ┌────────────────────────┐  ║
║  │     ┌──────────┐       │  ║
║  │  ┌──┤ Web      │       │  ║
║  │  │  └──────────┘       │  ║
║  │  │       │             │  ║
║  │  │  ┌────▼─────┐       │  ║
║  │  │  │ Data     │       │  ║  ← Visual flow
║  │  │  └──────────┘       │  ║
║  │  │       │             │  ║
║  │  │  ┌────▼─────┐       │  ║
║  │  │  │ Content  │       │  ║
║  │  │  └──────────┘       │  ║
║  │  │                     │  ║
║  │  └─[Start]─────[End]   │  ║
║  └────────────────────────┘  ║
║                              ║
║  [Clear]  [Save Template]   ║
║  [Execute Workflow ➤]        ║
╚══════════════════════════════╝
```

**Functionality:**
- **Agent Library:** List of all available agents
- **Drag-and-Drop:** Drag agents to create workflow
- **Visual Connections:** Connect agents with arrows
- **Node Configuration:** Click agent node to configure
- **Save Templates:** Save workflows for reuse
- **Execute:** Run the choreographed workflow

**Click on Agent Node:**
```
╔═══════════════════════════════════╗
║  Configure: Web Research Agent    ║
╟───────────────────────────────────╢
║                                   ║
║  Agent Name: Web Research         ║
║  ───────────────────────────      ║
║                                   ║
║  Input Parameters:                ║
║  • Search Query: [___________]    ║
║  • Max Results: [5___]            ║
║  • Deep Scrape: [✓]               ║
║                                   ║
║  Output Format:                   ║
║  ○ JSON                           ║
║  ● CSV                            ║
║  ○ Markdown                       ║
║                                   ║
║  [Cancel]  [Save Configuration]   ║
╚═══════════════════════════════════╝
```

---

#### 5️⃣ **Agent Choreography Panel (Above Chat)**

```
╔══════════════════════════════════════════════════════════════════╗
║  AGENT WORKFLOW (Auto-Generated or Manual)                       ║
╟──────────────────────────────────────────────────────────────────╢
║                                                                  ║
║  🌐 Web Research ──→ 📊 Data Analysis ──→ ✍️ Content Creation   ║
║      Agent              Agent                  Agent             ║
║                                                                  ║
║  [Edit Workflow] [Save as Template]                              ║
╚══════════════════════════════════════════════════════════════════╝
```

**Functionality:**
- **Visual Flow:** Shows agent sequence
- **Auto-Generated:** AI determines agent chain from user request
- **Manual Override:** User can edit the flow
- **Save Templates:** Reuse common workflows

---

#### 6️⃣ **Bottom Chat Interface**

```
╔══════════════════════════════════════════════════════════════════╗
║  💬 CHAT INPUT                                                   ║
╟──────────────────────────────────────────────────────────────────╢
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ Research the top 5 AI competitors, extract pricing info,   │ ║
║  │ create a comparison spreadsheet, and generate a summary    │ ║
║  │ presentation...                                            │ ║  ← Multi-line input
║  └────────────────────────────────────────────────────────────┘ ║
║                                                                  ║
║  [📎 Attach Files]  [🎯 Auto-select Agents ▼]  [🎨 Templates]   ║
║                                           [Cancel] [Send ➤]     ║
╚══════════════════════════════════════════════════════════════════╝
```

**Functionality:**
- **Multi-line Input:** Enter complex requests
- **File Attachments:** Attach files for processing
- **Auto-select Agents:** AI determines needed agents
- **Manual Selection:** Override with specific agents
- **Templates:** Load pre-made workflows
- **Send:** Execute the workflow

---

### Mobile Application Interface (Future)

#### Mobile App - Home Screen

```
┌────────────────────────────────┐
│  ☰  AI Agentic Tool      [👤] │  ← Header
├────────────────────────────────┤
│                                │
│  🔍 [Search workflows...]      │
│                                │
│  Recent Workflows              │
│  ┌──────────────────────────┐ │
│  │ 📹                       │ │
│  │ Competitor Research      │ │
│  │ ────────────────         │ │
│  │ 🗓️ Oct 5 - 2:30 PM       │ │
│  │ ✅ Success               │ │
│  │ 🤖 3 agents              │ │
│  │ [View] [Play Video]      │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 📹                       │ │
│  │ Email Automation         │ │
│  │ ────────────────         │ │
│  │ 🗓️ Oct 5 - 11:15 AM      │ │
│  │ ⚠️ Partial               │ │
│  │ 🤖 2 agents              │ │
│  │ [View] [Play Video]      │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 📹                       │ │
│  │ Code Review              │ │
│  │ ────────────────         │ │
│  │ 🗓️ Oct 4 - 4:00 PM       │ │
│  │ ❌ Failed                │ │
│  │ 🤖 2 agents              │ │
│  │ [View] [Retry]           │ │
│  └──────────────────────────┘ │
│                                │
│      [Load More ▼]             │
│                                │
├────────────────────────────────┤
│  [🏠] [📊] [💬] [⚙️]           │  ← Bottom Nav
└────────────────────────────────┘
```

#### Mobile App - Workflow Detail

```
┌────────────────────────────────┐
│  ← Competitor Research    [⋮]  │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │    📹 VIDEO PLAYER       │ │
│  │                          │ │
│  │    ▶️  0:00 / 5:23        │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  📄 Documentation  📊 Info     │  ← Tabs
│  ══════════════════════════    │
│                                │
│  ## Initial Request            │
│  Research top 5 AI tool        │
│  competitors and create...     │
│                                │
│  ## Workflow Info              │
│  • Date: Oct 5, 2025           │
│  • Duration: 5m 23s            │
│  • Status: Success ✅          │
│  • Agents: Web, Data, Content  │
│                                │
│  ## Steps                      │
│  1. Web Research Agent         │
│     Input: "Find top 5..."     │
│     Output: [Data extracted]   │
│                                │
│  2. Data Analysis Agent        │
│     ...                        │
│                                │
│  [Download] [Share] [Delete]   │
│                                │
└────────────────────────────────┘
```

#### Mobile App - Quick Actions

```
┌────────────────────────────────┐
│  💬 Quick Chat                 │
├────────────────────────────────┤
│                                │
│  What would you like to do?    │
│                                │
│  ┌──────────────────────────┐ │
│  │ Trigger a workflow on    │ │
│  │ desktop (if connected)   │ │
│  │ ________________________ │ │
│  │                          │ │
│  │ [Send to Desktop ➤]      │ │
│  └──────────────────────────┘ │
│                                │
│  Quick Templates:              │
│  • Research Competitors        │
│  • Generate Report             │
│  • Data Analysis               │
│  • Email Summary               │
│                                │
│  [View All Templates]          │
│                                │
└────────────────────────────────┘
```

**Mobile Capabilities:**
- ✅ View workflow history
- ✅ Watch recorded videos
- ✅ Read markdown documentation
- ✅ Trigger simple workflows on desktop (if connected)
- ✅ Push notifications when workflows complete
- ✅ Search and filter history
- ❌ Cannot create complex workflows (use desktop)
- ❌ Cannot run automation locally (companion only)

---

### Web Subscription Platform (Next.js)

#### Landing Page

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] AI Agentic Tool      [Features] [Pricing] [Login] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│              Orchestrate AI Agents Visually                │
│           Automate Complex Workflows with Ease             │
│                                                            │
│              [Get Started Free]  [Watch Demo]              │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │           [Product Screenshot/Video]                 │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ✨ Key Features:                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ 🌐 Web   │  │ 📊 Data  │  │ 📹 Record│               │
│  │Automation│  │ Analysis │  │Everything│               │
│  └──────────┘  └──────────┘  └──────────┘               │
│                                                            │
│  How It Works:                                             │
│  1️⃣ Describe what you want                                │
│  2️⃣ AI selects the right agents                           │
│  3️⃣ Watch it execute in real-time                         │
│  4️⃣ Get video replay + documentation                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### Pricing Page

```
┌────────────────────────────────────────────────────────────┐
│  Choose Your Plan                                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │   FREE     │  │    PRO     │  │ ENTERPRISE │          │
│  │            │  │            │  │            │          │
│  │   $0/mo    │  │  $29/mo    │  │  $99/mo    │          │
│  │            │  │            │  │            │          │
│  │ • 50 workflows│ • Unlimited│  │ Everything │          │
│  │ • 3 agents │  │   workflows│  │  in Pro +  │          │
│  │ • 7-day    │  │ • All      │  │ • Team     │          │
│  │   history  │  │   agents   │  │   collab   │          │
│  │ • Community│  │ • Unlimited│  │ • SSO      │          │
│  │   support  │  │   history  │  │ • Priority │          │
│  │            │  │ • Custom   │  │   support  │          │
│  │            │  │   agents   │  │ • Custom   │          │
│  │            │  │ • Video    │  │   SLA      │          │
│  │            │  │   recording│  │            │          │
│  │            │  │ • Priority │  │            │          │
│  │            │  │   support  │  │            │          │
│  │            │  │            │  │            │          │
│  │ [Start]    │  │ [Subscribe]│  │[Contact Us]│          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                            │
│  💳 Powered by Stripe - Secure Payment Processing          │
│  🔒 Cancel anytime - No hidden fees                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### User Dashboard

```
┌────────────────────────────────────────────────────────────┐
│  👤 John Doe                        [Settings] [Logout]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Current Plan: Pro ($29/mo)                                │
│  License Status: ✅ Active                                 │
│  Next Billing: November 5, 2025                            │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  Desktop App Activation:                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ License Key: XXXX-XXXX-XXXX-XXXX                     │ │
│  │ Devices: 2/5 active                                  │ │
│  │                                                      │ │
│  │ Active Devices:                                      │ │
│  │ • 💻 MacBook Pro (Last seen: 2 hours ago)            │ │
│  │ • 💻 Windows PC (Last seen: Oct 4)                   │ │
│  │                                                      │ │
│  │ [Manage Devices] [Download App]                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Usage Stats (This Month):                                 │
│  • Workflows Executed: 247                                 │
│  • Average Duration: 3m 42s                                │
│  • Success Rate: 94%                                       │
│                                                            │
│  [Billing History] [Update Payment Method] [Cancel Plan]   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Functional Requirements - Complete Breakdown

### 1. User Authentication & License Management

**Authentication Flow:**
1. User visits web platform (Next.js app)
2. Signs up with email/password or OAuth (Google, GitHub) via Clerk
3. Selects subscription plan (Free, Pro, Enterprise)
4. Completes Stripe checkout
5. Receives license key via email
6. Downloads desktop app
7. Enters license key in desktop app
8. App validates license with web platform API
9. License cached locally for 30-day offline grace period

**Requirements:**
- ✅ Multi-provider authentication (Clerk handles Google, GitHub, email/password)
- ✅ Secure license generation (JWT tokens with expiration)
- ✅ Device fingerprinting (hardware-based unique ID)
- ✅ License validation API (online check + offline grace period)
- ✅ Multi-device support (configurable limit per plan)
- ✅ License revocation (admin can deactivate)

**User Experience:**
- First launch: License activation screen
- Subsequent launches: Silent validation (cached)
- Offline mode: Grace period notification after 30 days
- Expired license: Paywall with "Renew Subscription" button

---

### 2. Workflow Creation & Execution

**Workflow Creation Methods:**

**Method 1: Chat-Based (Auto Agent Selection)**
1. User types request in chat: "Research competitors and create comparison"
2. AI analyzes request and determines needed agents:
   - Web Research Agent (to find competitors)
   - Data Analysis Agent (to compare features)
   - Content Creation Agent (to generate document)
3. Agent choreography panel shows visual flow
4. User clicks "Execute" or modifies workflow
5. Workflow runs with real-time visualization

**Method 2: Visual Builder (Manual Agent Selection)**
1. User drags agents from right sidebar onto canvas
2. Connects agents with arrows (defines data flow)
3. Configures each agent (click node → configure)
4. Names workflow
5. Clicks "Execute"

**Method 3: Templates**
1. User selects pre-made workflow template
2. Fills in parameters (e.g., "competitor names")
3. Executes immediately

**Requirements:**
- ✅ Natural language workflow creation
- ✅ Visual drag-and-drop workflow builder (React Flow)
- ✅ Agent auto-selection based on AI analysis
- ✅ Manual agent override capability
- ✅ Workflow templates library
- ✅ Save custom workflows as templates
- ✅ Workflow validation (check for errors before execution)

**Execution Engine:**
- Runs agents sequentially or in parallel (user-configurable)
- Passes output from one agent to next
- Handles errors gracefully (retry, skip, fail gracefully)
- Records entire process as video
- Generates markdown documentation
- Saves metadata (timestamps, durations, errors)

---

### 3. Agent System

**Built-in Agents (5 Default):**

**🌐 Web Research Agent**
- **Purpose:** Automate web browsing and data extraction
- **Powered By:** Puppeteer + Claude SDK
- **Capabilities:**
  - Navigate to any website
  - Fill forms and click buttons
  - Extract structured data from pages
  - Take screenshots and PDFs
  - Handle authentication and cookies
  - Wait for dynamic content loading
- **Inputs:** Search query, target URLs, extraction rules
- **Outputs:** JSON, CSV, or Markdown with extracted data

**💻 Code Generation Agent**
- **Purpose:** Generate code in any language
- **Powered By:** Claude SDK
- **Capabilities:**
  - Write functions, classes, modules
  - Generate entire project structures
  - Include tests and documentation
  - Refactor existing code
  - Fix bugs based on error messages
- **Inputs:** Code requirements, language, framework
- **Outputs:** Code files with proper syntax and formatting

**📁 File Management Agent**
- **Purpose:** Create, read, update, delete files
- **Powered By:** Node.js fs module + Claude SDK
- **Capabilities:**
  - Create files and directories
  - Read file contents
  - Search file systems
  - Organize files (rename, move, copy)
  - Safe file operations (backups, permissions)
- **Inputs:** File operations requested by user
- **Outputs:** Confirmation of operations + file paths

**📊 Data Analysis Agent**
- **Purpose:** Process and analyze data
- **Powered By:** Python pandas (subprocess) + Claude SDK
- **Capabilities:**
  - Parse CSV, JSON, Excel files
  - Statistical analysis (mean, median, correlations)
  - Generate charts and visualizations
  - Data cleaning and transformation
  - Export to multiple formats
- **Inputs:** Data files + analysis requirements
- **Outputs:** Analysis reports, charts, cleaned data

**✍️ Content Creation Agent**
- **Purpose:** Write documents, articles, emails
- **Powered By:** Claude SDK
- **Capabilities:**
  - Generate marketing copy
  - Write technical documentation
  - Create presentations (PPTX)
  - Draft emails
  - Summarize long documents
  - Translate content
- **Inputs:** Content requirements, tone, format
- **Outputs:** Formatted documents (MD, HTML, DOCX, PPTX)

**Custom Agent Creation:**

**Manual Method:**
1. Click "Create Custom Agent" in right sidebar
2. Fill in configuration form:
   - Agent name and description
   - System prompt (instructions for Claude)
   - Tools (define custom functions)
   - Input parameters
   - Output format
3. Test agent in playground
4. Save agent to library

**AI-Assisted Method:**
1. Click "Create Custom Agent"
2. Describe agent in natural language:
   "I need an agent that monitors my email, extracts invoices, and saves them to a folder"
3. AI generates agent configuration
4. Review and tweak configuration
5. Save agent

**Requirements:**
- ✅ 5 production-ready built-in agents
- ✅ Agent configuration schema (JSON-based)
- ✅ Custom agent builder UI (form-based)
- ✅ AI-assisted agent generation
- ✅ Agent testing playground
- ✅ Agent import/export (share with others)
- ✅ Agent versioning (track changes)

---

### 4. Automation Engines

**Browser Automation (Puppeteer):**

**What It Does:**
- Controls a real Chrome browser programmatically
- Can do anything a human can do in a browser:
  - Navigate to URLs
  - Click buttons and links
  - Fill out forms
  - Scroll pages
  - Take screenshots
  - Download files
  - Interact with JavaScript-heavy sites

**How It Works:**
```typescript
// Example: Extract pricing from competitor website
const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://competitor.com/pricing');
await page.screenshot({ path: 'pricing-page.png' });
const pricingData = await page.$$eval('.price-card', cards => 
  cards.map(card => ({
    plan: card.querySelector('h3').textContent,
    price: card.querySelector('.price').textContent
  }))
);
await browser.close();
```

**Desktop Automation (Claude Computer Use):**

**What It Does:**
- Controls the entire computer (not just browser)
- Can:
  - Move mouse and type on keyboard
  - Open and interact with any application
  - Read screen content via screenshots
  - Perform multi-step desktop tasks
  - Manage windows and files

**How It Works:**
```typescript
// Claude analyzes screen and decides actions
const result = await claudeClient.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  messages: [{
    role: 'user',
    content: 'Open Excel and create a new spreadsheet with headers'
  }],
  tools: [{
    type: 'computer_20241022',
    name: 'computer',
    display_width_px: 1920,
    display_height_px: 1080
  }]
});
// Claude returns computer actions (mouse clicks, keyboard inputs)
// App executes actions on real desktop
```

**Requirements:**
- ✅ Puppeteer integration for web automation
- ✅ Claude Computer Use API for desktop automation
- ✅ Real-time visualization of automation (user sees what's happening)
- ✅ Safety controls (sandboxing, permission prompts)
- ✅ Headless mode option (background automation)
- ✅ Error handling and recovery
- ✅ Action recording for replay

---

### 5. Workflow History & Documentation

**Workflow Storage:**

Every workflow execution creates:

**1. Video Recording (.webm)**
- Screen capture of entire workflow execution
- Timeline markers for each agent action
- Compressed with VP9 codec (balance quality/size)
- Thumbnail generated (first frame)
- Stored locally: `C:\Users\...\AppData\Local\AgenticInterface\workflows\{id}\video.webm`

**2. Markdown Documentation (.md)**
- Structured log of entire workflow:
  - Initial user request
  - Workflow metadata (date, duration, status)
  - Step-by-step breakdown of each agent
  - Input/output for each step
  - Files created
  - Errors encountered
  - Summary of results
- Syntax-highlighted code blocks
- Stored locally: `...\workflows\{id}\documentation.md`

**3. Metadata (JSON)**
- Workflow ID, name, timestamps
- Agent IDs and versions used
- Configuration parameters
- File paths (video, markdown, created files)
- Tags and user notes
- Stored locally: `...\workflows\{id}\metadata.json`

**Requirements:**
- ✅ Automatic video recording of all workflows
- ✅ Timeline markers synced with agent actions
- ✅ Markdown generation with templating system
- ✅ JSON metadata storage
- ✅ Full-text search (FTS5) across all workflows
- ✅ Filter by date, status, agents used, tags
- ✅ Infinite scroll lazy-loading (performance)
- ✅ Export workflows (ZIP with video + docs)
- ✅ Re-run historical workflows

**Search & Filter:**
```sql
-- Full-text search query
SELECT * FROM workflows 
WHERE id IN (
  SELECT rowid FROM workflows_fts 
  WHERE workflows_fts MATCH 'competitor AND pricing'
)
ORDER BY created_at DESC;
```

---

### 6. Video Recording & Playback

**Recording Process:**

**Start Recording (on workflow execution):**
1. User starts workflow
2. App requests screen capture permission (if first time)
3. MediaRecorder starts capturing entire screen
4. Records at 30 FPS, 2.5 Mbps bitrate (good quality, reasonable size)
5. Adds timeline marker when each agent starts/stops
6. Saves to temporary buffer

**Stop Recording (on workflow completion):**
1. Workflow finishes
2. MediaRecorder stops
3. Video blob converted to WebM file
4. File compressed and saved to disk
5. Thumbnail generated from first frame
6. Timeline markers saved in metadata

**Playback Features:**
- ▶️ Play/Pause
- ⏮️ ⏭️ Skip to previous/next agent marker
- 🎚️ Seek bar with timeline markers
- 🔊 Volume control
- ⚙️ Playback speed (0.5x, 1x, 1.5x, 2x)
- 📥 Download video file
- 🔗 Share workflow (export ZIP)

**Requirements:**
- ✅ Screen recording with MediaRecorder API
- ✅ WebM/VP9 encoding (best browser support)
- ✅ Timeline marker system
- ✅ Video compression (balance size/quality)
- ✅ Thumbnail generation
- ✅ Custom video player with controls
- ✅ Seek to specific agent actions
- ✅ Playback speed control
- ✅ Download and share functionality

---

### 7. State Management (Zustand)

**Why Zustand:**
- **Tiny:** Only 3KB (vs Redux 20KB)
- **Simple:** No boilerplate, no providers
- **Fast:** Direct state updates, minimal re-renders
- **TypeScript:** First-class TypeScript support
- **Persistent:** Built-in localStorage persistence

**Store Structure:**

**workflowStore:**
```typescript
interface WorkflowStore {
  workflows: Workflow[];
  activeWorkflow: string | null;
  isRecording: boolean;
  
  // Actions
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setActiveWorkflow: (id: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
}
```

**agentStore:**
```typescript
interface AgentStore {
  builtInAgents: Agent[];
  customAgents: Agent[];
  selectedAgents: string[];
  
  // Actions
  loadBuiltInAgents: () => void;
  addCustomAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  selectAgent: (id: string) => void;
  clearSelection: () => void;
}
```

**uiStore:**
```typescript
interface UIStore {
  sidebarOpen: boolean;
  canvasView: 'actions' | 'workflow-detail';
  activeModal: 'agent-builder' | 'settings' | null;
  theme: 'light' | 'dark';
  
  // Actions
  toggleSidebar: () => void;
  setCanvasView: (view: string) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

**authStore:**
```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  licenseStatus: 'active' | 'expired' | 'invalid';
  subscription: 'free' | 'pro' | 'enterprise';
  
  // Actions
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  validateLicense: () => Promise<boolean>;
  updateSubscription: (plan: string) => void;
}
```

**Requirements:**
- ✅ Zustand for all global state
- ✅ TypeScript types for all stores
- ✅ Persistent state (localStorage sync)
- ✅ Dev tools integration
- ✅ Middleware for logging
- ✅ Optimistic updates

---

### 8. Database Schema (SQLite)

```sql
-- Workflows table
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  duration INTEGER, -- milliseconds
  status TEXT CHECK(status IN ('success', 'partial', 'failed')),
  initial_message TEXT,
  video_path TEXT,
  markdown_path TEXT,
  metadata_path TEXT,
  thumbnail_path TEXT,
  tags TEXT -- JSON array
);

-- Agents table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('built-in', 'custom')),
  version TEXT,
  config TEXT NOT NULL, -- JSON
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Workflow steps table
CREATE TABLE workflow_steps (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  input TEXT,
  output TEXT,
  timestamp INTEGER NOT NULL,
  duration INTEGER,
  status TEXT CHECK(status IN ('success', 'failed', 'skipped')),
  error TEXT,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Files created table
CREATE TABLE workflow_files (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- User settings table
CREATE TABLE user_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL -- JSON
);

-- API keys table (encrypted)
CREATE TABLE api_keys (
  service TEXT PRIMARY KEY, -- 'claude', 'openai', etc.
  encrypted_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Full-text search index
CREATE VIRTUAL TABLE workflows_fts USING fts5(
  workflow_name,
  initial_message,
  tags,
  content='workflows',
  content_rowid='rowid'
);

-- Indexes for performance
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
```

**Requirements:**
- ✅ SQLite with FTS5 extension
- ✅ ACID compliance (transactions)
- ✅ Foreign key constraints
- ✅ Indexed queries for performance
- ✅ Full-text search on workflows
- ✅ Encrypted API key storage
- ✅ Migration system for schema updates

---

### 9. Security & Privacy

**API Key Security:**
- User's Claude API key stored using Electron `safeStorage`
- Encrypted with AES-256
- Never transmitted to our servers
- Used only for local Claude API calls

**License Protection:**
```typescript
// Multi-layer validation
1. JWT signature verification
2. Expiration check
3. Device fingerprint match
4. Online validation (when online)
5. Offline grace period (30 days max)
6. Integrity checks (detect tampering)
```

**Data Privacy:**
- All workflow data stays local (never uploaded)
- Optional cloud sync (user must opt-in)
- GDPR compliant (minimal data collection)
- No telemetry without explicit consent
- Open-source portions auditable

**Requirements:**
- ✅ Electron safeStorage for API keys
- ✅ JWT-based license tokens
- ✅ Device fingerprinting (hardware-based)
- ✅ 30-day offline grace period
- ✅ Code obfuscation (production builds)
- ✅ Integrity checks (prevent tampering)
- ✅ Local-first architecture
- ✅ GDPR compliance
- ✅ Opt-in telemetry

---

### 10. Subscription & Billing (Stripe)

**Subscription Flow:**
1. User selects plan on pricing page
2. Redirected to Stripe Checkout
3. Enters payment details (handled by Stripe)
4. Payment processed
5. Webhook triggered to our Next.js API
6. License generated and emailed to user
7. User account activated in Supabase

**Webhook Handling:**
```typescript
// /api/webhooks/stripe
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, sig, secret);
  
  switch (event.type) {
    case 'checkout.session.completed':
      // Create license, send email
      break;
    case 'customer.subscription.updated':
      // Update subscription status
      break;
    case 'customer.subscription.deleted':
      // Revoke license
      break;
  }
}
```

**Requirements:**
- ✅ Stripe integration (Checkout + Customer Portal)
- ✅ Webhook processing (subscription events)
- ✅ License generation on payment
- ✅ Email notifications (payment confirmation)
- ✅ Subscription management (upgrade, downgrade, cancel)
- ✅ Invoice generation
- ✅ Payment recovery (failed payments)
- ✅ Proration handling (plan changes)

---

## Summary: How Everything Works Together

### Complete User Journey

**1. User Signs Up (Web Platform)**
- Visits https://agentic-tool.com
- Creates account with Clerk (OAuth or email/password)
- Selects "Pro" plan ($29/mo)
- Completes Stripe checkout
- Receives license key via email
- Downloads desktop app for Windows/Mac/Linux

**2. First Launch (Desktop App)**
- Opens desktop app
- Sees license activation screen
- Enters license key
- App validates with web platform API
- License cached locally (30-day offline grace)
- Prompted to enter Claude API key (user's own key)
- API key encrypted and stored locally

**3. Creating First Workflow**
- Types in chat: "Research my top 5 competitors and create a comparison spreadsheet"
- AI analyzes request and suggests agents:
  - Web Research Agent
  - Data Analysis Agent
- Agent choreography panel shows visual flow
- User clicks "Execute"

**4. Workflow Execution**
- Video recording starts (screen capture)
- Web Research Agent launches:
  - Puppeteer browser window opens in center canvas
  - User sees agent navigating to competitor websites
  - Agent extracts pricing, features, customer counts
  - Returns structured JSON data
- Data Analysis Agent runs:
  - Processes extracted data
  - Creates comparison spreadsheet (Excel)
  - Saves to desktop
- Video recording stops
- Markdown documentation generated automatically

**5. Reviewing Results**
- Workflow card appears in left sidebar
- User clicks workflow card
- Center canvas expands to show:
  - Video tab: Playback with timeline markers
  - Markdown tab: Complete documentation
  - Metadata tab: Workflow info and files created
- User downloads Excel file
- User shares workflow with teammate (exports ZIP)

**6. Creating Custom Agent**
- User wants an email monitoring agent
- Clicks "Create Custom Agent"
- Describes in natural language: "Monitor my Gmail for invoices and save PDFs to a folder"
- AI generates agent configuration:
  - System prompt
  - Gmail API integration
  - PDF extraction logic
- User tests agent in playground
- Saves to agent library
- Adds to workflow templates

**7. Mobile Companion Usage (Future)**
- User opens mobile app on phone
- Sees workflow history synced
- Watches video of "Competitor Research" workflow
- Reads markdown documentation
- Triggers new workflow on desktop (if connected)
- Receives push notification when workflow completes

---

## Why These Technology Choices Win

### Desktop: Electron + React + Zustand
- ✅ **Proven:** Powers VS Code, Slack, Discord, Figma
- ✅ **Developer Experience:** Fast iteration, hot reload, React DevTools
- ✅ **Integration:** Native Chromium perfect for Puppeteer
- ✅ **Ecosystem:** Massive npm library ecosystem

### Database: SQLite + FTS5
- ✅ **Zero Config:** No server setup, embedded in app
- ✅ **Fast:** Millions of records with sub-millisecond queries
- ✅ **Search:** Built-in full-text search (no external dependencies)
- ✅ **Reliable:** ACID compliant, battle-tested

### AI: Claude SDK
- ✅ **Best-in-Class:** Claude 4 is top-tier for reasoning
- ✅ **Long Context:** 200K tokens (entire codebases)
- ✅ **Computer Use:** Official desktop automation API
- ✅ **Cost-Effective:** User brings own key (we pay nothing)

### Web: Next.js + Supabase + Clerk + Stripe
- ✅ **Modern:** Latest React patterns (App Router)
- ✅ **Fast:** Edge functions, automatic optimization
- ✅ **Batteries Included:** Auth, database, payments all integrated
- ✅ **Scalable:** Vercel auto-scales, Supabase connection pooling

---

## Competitive Advantages

**1. Privacy-First Architecture**
- Competitors: Store workflows in cloud (privacy concerns)
- Us: 100% local-first (your data never leaves your machine)

**2. User-Owned API Keys**
- Competitors: Charge per workflow execution (expensive)
- Us: Flat subscription fee (unlimited workflows, your own API key)

**3. Complete Transparency**
- Competitors: Black box (no visibility into what AI did)
- Us: Video replay + markdown docs (full transparency)

**4. Visual Workflow Builder**
- Competitors: Chat-only interfaces (limited control)
- Us: n8n-style visual builder (precise choreography)

**5. Extensibility**
- Competitors: Fixed set of features
- Us: Custom agent creation (manual or AI-assisted)

---

*Last Updated: October 5, 2025*  
*Version: 1.0.0*  
*This document provides a complete functional and technical overview of the AI Agentic Desktop Tool*
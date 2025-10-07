# AI Agentic Desktop Tool - Project Overview

## Original Request Messages (Grammar Corrected)

### Initial Request

I want to build an AI agentic desktop tool (with another mobile app rollout, but for now we'll constrain the ideation to the desktop (PC) tool). It will be an agentic tool with a super clean visual interface with triggers buttons, visualization center container (tab on and off), sidebar for agent selection or basic chat (auto calls agents), agent-to-agent stringing above the chat entry field for choreographed workflows (non-automatic) visually and interactively similar to n8n. This is in a mini sidebar to the right of our app above the chat interface (all modals are click to expand to center view, but center view defaults are the actions viewer (Puppeteer for web directed actions or the corollary to Puppeteer for whatever the corollary is for desktop use).

We will have several default built-in agents all made using the Claude SDK and Claude Agent SDK. Then we will have an agent builder modal for if the user wants to write their own agents (OR EVEN HAVE OUR OWN APP'S AI BUILD THEM FOR THEM BASED ON TEXT REQUEST!).

Also, the left-hand menu is for history by default. We organize things into (workflows) which corresponds to one whole action via all agents called for a user's chat request. We also have a video recording associated with all individually named and dated workflows. This way they can replay the computer use and/or browser use of the agents for each workflow.

We will also have an MD file of the initial chat message, all files created, and then the steps taken by the AI (plus maybe a subsection of that). When you click each workflow card in the left sidebar, it opens the video file, the markdown file, and the workflow info (form-based, linked to MD file or JSON file) that (on click of the workflow card from the sidebar) expands it to the center view. Then you can click the minimize icon top right of that center section to revert to the main canvas (aka the video display view) for the center and the workflow from the left sidebar is unhighlighted from the click.

### Clarifying Considerations (Second Message)

Good, clarifying considerations. We will also include a top menubar with multiple top bars for File, Edit, View, Run, and Help with dropdown selections where needed for those options.

We will also want OAuth or BetterAuth (probably BetterAuth) plus a web platform built using the stack of this video (REFERENCE THE VIDEO IN THE FILE BECAUSE WE'LL BASE THE WEB SUBSCRIPTION COMPANION APP OFF OF IT): https://www.youtube.com/watch?v=TWQv_tr5ABI&list=PLmomPuPESkrldq8QRMbXk4-qJv6RHy_-8&index=22

**Video Reference**: JavaScript Mastery - Build a SaaS with Next.js, Supabase & Stripe  
**GitHub Repo**: https://github.com/adrianhajdin/saas-app

This is just for the web subscription platform that links subscription to our local app. We will allow for access to the app via subscription that ungates it but require an API key to Claude be entered by each user for their use of the app from therein. Our license will be fully restrictive: no duplication or modification or redistribution of our custom code.

---

## Application Requirements & Goals

### 1. Core Application Architecture

**Platform**
- Primary target: Desktop (Windows PC)
- Future consideration: Mobile app rollout
- Framework: **Electron** (chosen for native Chromium integration with Puppeteer)

**Application Type**
- AI agentic desktop tool
- Local-first architecture with cloud subscription validation
- User brings their own Claude API key for agent execution

### 2. User Interface Layout

**Main Window Structure**
- **Top Menubar**: File, Edit, View, Run, Help with dropdown menus
- **Left Sidebar**: Workflow history panel (default view)
- **Center Canvas**: Main workspace (default: actions viewer showing Puppeteer/desktop automation)
- **Right Mini-Sidebar**: Agent workflow builder (positioned above chat interface)
- **Bottom Chat Interface**: User input with agent-to-agent choreography panel above it

**Visual Design Philosophy**
- Super clean, modern interface
- Toggle-able panels for focused work
- Modal expansion to center view on-demand
- n8n-inspired workflow visualization

### 3. Agent System

**Built-in Agents**
- Multiple default agents powered by Claude SDK and Claude Agent SDK
- Each agent specialized for specific tasks
- Agent selection via sidebar or automatic invocation from chat

**Agent Builder**
- Modal interface for creating custom agents
- Two creation modes:
  1. Manual: User writes agent code/configuration
  2. AI-Assisted: App's AI generates agents from text descriptions

**Agent Orchestration**
- Visual agent-to-agent workflow builder (mini sidebar above chat)
- Drag-and-drop workflow construction similar to n8n
- Non-automatic choreographed workflows
- Real-time execution visualization

### 4. Workflow Management System

**Workflow Definition**
- One workflow = complete action involving all called agents for a user request
- Each workflow individually named and timestamped
- Workflow cards displayed in left sidebar history panel

**Workflow Components**
- Video recording of execution (browser + desktop automation)
- Markdown file containing:
  - Initial chat message/request
  - List of files created
  - Step-by-step AI actions
  - Subsections for detailed breakdowns
- JSON/form-based metadata file
- Workflow graph/visual representation

**Workflow Interaction**
- Click workflow card → expands to center view showing:
  - Video player for recorded execution
  - Markdown document viewer
  - Workflow info panel (form-based interface)
- Minimize button (top-right) → returns to main canvas (actions viewer)
- Active workflow highlighted in sidebar

### 5. Automation & Recording

**Browser Automation**
- Tool: **Puppeteer** (v24+ with Chrome 140 support)
- Headless and headed modes
- Full Chrome DevTools Protocol access
- Integration: puppeteer-in-electron package

**Desktop Automation**
- Tool: **Claude Computer Use API** (primary)
- Fallback: Nut.js / Robot Framework for native desktop UI control
- Video recording via Electron desktopCapturer API
- H.264 encoding with FFmpeg (fluent-ffmpeg wrapper)

**Recording Specifications**
- Resolution: 1280x800 or 1920x1080
- Format: MP4 with H.264 codec
- Frame rate: 30 FPS
- Quality: CRF 23 (balanced quality/size)
- Storage: ~10MB per minute at 1080p

### 6. Authentication & Licensing

**User Authentication**
- Framework: **BetterAuth** (TypeScript-first, self-hosted)
- OAuth support with PKCE for desktop apps
- Session management: 30-day expiration for desktop
- Secure token storage: Electron safeStorage API (OS-level encryption)

**Subscription Management**
- Web platform validates subscription status
- Desktop app checks license every 5 minutes + on startup
- 30-day offline grace period
- License enforcement:
  - Fully restrictive (no duplication, modification, or redistribution)
  - Device fingerprinting for activation limits
  - Remote deactivation capability

**API Key Management**
- Users provide their own Claude API keys
- Stored securely using Electron safeStorage (macOS Keychain, Windows DPAPI, Linux Secret Service)
- Never transmitted to our servers
- Required for agent execution

### 7. Web Subscription Platform

**Technology Stack** (Based on JavaScript Mastery video/repo)
- **Framework**: Next.js 15+ with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk (can be swapped with BetterAuth)
- **Payments**: Stripe (subscriptions, checkout, customer portal)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Type Safety**: TypeScript + Zod validation
- **Monitoring**: Sentry for error tracking

**Integration Points**
- Webhook endpoint for Stripe subscription events
- License validation API for desktop app polling
- User dashboard for subscription management
- API key input/storage interface

**Deployment**
- Vercel for Next.js hosting
- Serverless functions for license validation
- Edge functions for real-time checks

### 8. Local Storage & Data Management

**Database**
- Engine: **SQLite** via better-sqlite3
- Location: `app.getPath('userData')/database.sqlite`
- Features:
  - FTS5 full-text search for workflow history
  - ACID-compliant transactions
  - Zero-configuration setup

**File Organization**
```
/workflows
  /{workflow-id}
    /metadata
      - workflow.json (workflow definition, nodes, edges)
      - info.md (markdown execution log)
    /media
      - recording.mp4 (video capture)
    /files
      - {generated files from workflow}
```

**State Management**
- Library: **Zustand** (3KB, hook-based)
- Store structure:
  - Workflow graph state (nodes, edges)
  - UI state (panel visibility, active views)
  - Agent configurations
  - Player controls
- Persistence: localStorage with Zustand middleware

### 9. Workflow Visualization

**Visual Workflow Builder**
- Library: **React Flow** (30.8k stars, 1.86M weekly installs)
- Features:
  - Drag-and-drop node editor
  - Built-in pan, zoom, connection logic
  - MiniMap, Controls, Background components
  - Custom node types as React components
  - TypeScript support with excellent type inference

**Multi-Panel Layout**
- Library: **react-resizable-panels** (Brian Vaughn, React core team)
- Features:
  - Percentage-based sizing with constraints
  - Persistent layouts via localStorage
  - Keyboard, mouse, touch-based resizing
  - Nested panel support

**Modal Management**
- Library: **nice-modal-react** (eBay, 2KB)
- Features:
  - Imperative show/hide APIs
  - Promise-based sequential workflows
  - Global registry pattern
  - Zustand integration for performance

### 10. Video Playback

**Library Options**
- Primary: **react-player** (simple requirements, unified API)
- Advanced: **Video.js** (adaptive streaming, DRM, custom UI)

**Features**
- Local file playback (MP4/H.264)
- Progress tracking synced with workflow logs
- Playback speed controls
- Frame-by-frame navigation
- Download prevention (optional)

### 11. Development Tools & Dependencies

**Core Dependencies**
```json
{
  "electron": "^38.2.1",
  "react": "^18.3.1",
  "react-flow-renderer": "^11.x",
  "puppeteer": "^24.22.3",
  "puppeteer-in-electron": "^3.x",
  "@anthropic-ai/sdk": "latest",
  "better-sqlite3": "^11.x",
  "zustand": "^5.x",
  "react-resizable-panels": "^2.x",
  "nice-modal-react": "^1.x",
  "react-player": "^2.x",
  "fluent-ffmpeg": "^2.x"
}
```

**Build Tools**
- **electron-builder**: Cross-platform packaging
- **electron-updater**: Auto-updates from GitHub Releases
- TypeScript for type safety
- ESLint + Prettier for code quality

### 12. Technical Implementation Details

**Electron Architecture**
- Main process: Node.js backend for file I/O, database, Puppeteer control
- Renderer process: React UI with IPC communication
- Preload scripts: Secure context bridge for API exposure

**Claude Integration**
- SDK: Official @anthropic-ai/sdk (TypeScript/Python hybrid)
- Models: Claude Sonnet 4.5 (1M token context window)
- Pricing: $3/million input tokens, $15/million output tokens
- Computer Use API: Beta feature for desktop automation
- Rate limits: Tier-based (starts at 5 req/min, scales with spend)

**Security Considerations**
- API keys encrypted with OS-level secure storage
- No sensitive data transmitted to our servers
- Code signing for installers (prevents tampering warnings)
- Automatic security updates via electron-updater
- Content Security Policy (CSP) in renderer process

### 13. Feature Priorities & Development Phases

**Phase 1: Core Infrastructure**
- Electron app shell with menubar
- Basic UI layout (3-panel design)
- SQLite database setup
- Authentication flow (BetterAuth + Clerk web)

**Phase 2: Agent System**
- Claude SDK integration
- Default agent implementations
- Agent builder modal (manual creation)
- Basic chat interface

**Phase 3: Workflow Management**
- Workflow creation and storage
- History panel with workflow cards
- Markdown log generation
- JSON metadata storage

**Phase 4: Automation & Recording**
- Puppeteer integration for browser automation
- Claude Computer Use API for desktop control
- Screen recording via desktopCapturer
- FFmpeg video encoding

**Phase 5: Visualization**
- React Flow workflow builder
- Agent-to-agent orchestration UI
- Workflow graph visualization
- Video playback integration

**Phase 6: Subscription Platform**
- Next.js web app deployment
- Stripe integration for payments
- License validation API
- Desktop app subscription checks

**Phase 7: Polish & Release**
- AI-assisted agent builder
- Advanced workflow features
- Performance optimization
- Code signing and distribution

---

## Technical Stack Summary

### Desktop Application
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Electron 38+ | Native Chromium for Puppeteer integration |
| UI Library | React 18+ | Component reusability, ecosystem |
| Language | TypeScript | Type safety for large codebase |
| State Management | Zustand | Lightweight, minimal boilerplate |
| Database | SQLite (better-sqlite3) | Local-first, zero-config, FTS5 search |
| Browser Automation | Puppeteer 24+ | Chrome DevTools Protocol, headless mode |
| Desktop Automation | Claude Computer Use API | AI-powered native UI control |
| Screen Recording | Electron desktopCapturer + FFmpeg | Native API, H.264 encoding |
| Workflow Visualization | React Flow | Industry standard, 1.86M weekly installs |
| Video Playback | react-player | Simple, unified API for local files |
| Authentication | BetterAuth | Self-hosted, TypeScript-first |
| API Key Storage | Electron safeStorage | OS-level encryption (Keychain/DPAPI) |

### Web Subscription Platform
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Next.js 15+ | SSR, API routes, App Router |
| Database | Supabase (PostgreSQL) | Real-time, auth, storage, BaaS |
| Authentication | Clerk / BetterAuth | Managed auth with subscription support |
| Payments | Stripe | Industry standard for SaaS subscriptions |
| UI Components | shadcn/ui + Tailwind | Modern, customizable, accessible |
| Validation | Zod | TypeScript-first schema validation |
| Hosting | Vercel | Serverless, edge functions, zero-config |
| Monitoring | Sentry | Error tracking, performance insights |

### AI & Agent Infrastructure
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| LLM | Claude Sonnet 4.5 | 1M token context, best coding capabilities |
| SDK | @anthropic-ai/sdk | Official TypeScript/Python support |
| Agent Framework | Claude Agent SDK | Production-ready, prompt caching, tools |
| Computer Control | Computer Use API | Beta feature for desktop automation |
| Cost Optimization | Prompt caching | 90% cost reduction for repeated prompts |

---

## Reference Links

- **Web Platform Tutorial**: https://www.youtube.com/watch?v=TWQv_tr5ABI&list=PLmomPuPESkrldq8QRMbXk4-qJv6RHy_-8&index=22
- **Web Platform Repo**: https://github.com/adrianhajdin/saas-app
- **Anthropic Claude Docs**: https://docs.anthropic.com
- **Claude Computer Use**: https://docs.anthropic.com/en/docs/agents-and-tools/computer-use
- **Electron Documentation**: https://www.electronjs.org/docs
- **Puppeteer Docs**: https://pptr.dev
- **React Flow Docs**: https://reactflow.dev
- **BetterAuth Docs**: https://www.better-auth.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://docs.stripe.com

---

*This document represents the complete technical blueprint for the AI Agentic Desktop Tool. All decisions are based on current best practices as of 2025, with focus on production-ready technologies that balance developer experience, performance, and maintainability.*
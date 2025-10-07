# Product Requirements Document (PRD)
## AI Agentic Desktop Tool

### Product Overview
An AI-powered desktop application that enables users to orchestrate and visualize autonomous agent workflows. The tool combines Claude's advanced AI capabilities with browser and desktop automation, providing a visual interface for building, executing, and replaying complex multi-agent tasks with complete workflow history and video recordings.

### Target Users
- **Primary**: Power users and professionals automating repetitive tasks
- **Secondary**: Developers building custom agent workflows
- **Tertiary**: Teams managing complex automation pipelines

### Problem Statement
Users need to automate complex multi-step workflows involving both web browsers and desktop applications, but existing tools lack:
1. Visual workflow orchestration (like n8n for agents)
2. Complete execution history with video replay
3. Flexible agent customization (manual or AI-assisted)
4. Local-first architecture with user-owned AI resources

### Solution
A desktop application (Electron-based) that:
1. Provides visual agent-to-agent workflow builder
2. Executes automated tasks using Claude AI + Puppeteer + Computer Use API
3. Records all executions with video, logs, and metadata
4. Stores workflows locally with full-text search
5. Requires user's own Claude API key (zero ongoing costs)
6. Validates subscriptions via web platform

### Core Features

#### 1. Visual Workflow Builder
- **Description**: n8n-style drag-and-drop interface for agent orchestration
- **User Story**: As a user, I want to visually connect agents to create complex workflows
- **Acceptance Criteria**:
  - Drag-and-drop node editor (React Flow)
  - Real-time connection validation
  - Agent-to-agent data passing
  - Save/load workflow graphs
  - Mini-sidebar above chat interface

#### 2. Built-in Agent Library
- **Description**: Pre-configured agents for common tasks
- **User Story**: As a user, I want ready-to-use agents without setup
- **Acceptance Criteria**:
  - Multiple default agents powered by Claude SDK
  - Agent selection from sidebar
  - Auto-invoke agents from chat
  - Agent documentation/tooltips
  - Categorized by function (web, desktop, data, etc.)

#### 3. Custom Agent Builder
- **Description**: Create agents manually or with AI assistance
- **User Story**: As a power user, I want to create specialized agents for my workflows
- **Acceptance Criteria**:
  - Modal interface with two modes:
    - Manual: Write agent code/config
    - AI-Assisted: Describe agent, AI generates it
  - Agent testing interface
  - Save/share agent definitions
  - Version control for agents

#### 4. Workflow History with Video Replay
- **Description**: Complete audit trail of all executions
- **User Story**: As a user, I want to review past workflows and see exactly what happened
- **Acceptance Criteria**:
  - Video recording of browser + desktop automation
  - Markdown log of all steps taken
  - JSON metadata (timestamp, agents used, files created)
  - Workflow cards in left sidebar
  - Click to expand to center view
  - Video player with progress tracking
  - Full-text search across all workflows (SQLite FTS5)

#### 5. Browser Automation (Puppeteer)
- **Description**: Control web browsers programmatically
- **User Story**: As a user, I want agents to interact with websites automatically
- **Acceptance Criteria**:
  - Headless and headed modes
  - Chrome DevTools Protocol access
  - puppeteer-in-electron integration
  - Actions viewer showing live automation
  - Screenshot capture
  - Multiple tabs/windows support

#### 6. Desktop Automation (Claude Computer Use)
- **Description**: Control desktop UI with AI-powered actions
- **User Story**: As a user, I want agents to interact with desktop applications
- **Acceptance Criteria**:
  - Claude Computer Use API integration
  - Natural language control
  - Cross-platform support (Windows primary)
  - Fallback to Nut.js for programmatic control
  - Screen capture for AI vision
  - Mouse + keyboard automation

#### 7. Secure API Key Management
- **Description**: Users provide own Claude API keys with OS-level encryption
- **User Story**: As a user, I want my API keys stored securely
- **Acceptance Criteria**:
  - Electron safeStorage integration
  - OS-level encryption (Keychain/DPAPI/libsecret)
  - Never transmitted to external servers
  - Required for app usage
  - Easy key rotation

#### 8. Subscription Management
- **Description**: License validation via web platform
- **User Story**: As a paying user, I want seamless subscription management
- **Acceptance Criteria**:
  - Desktop app checks license every 5 minutes
  - 30-day offline grace period
  - Web platform for subscription dashboard
  - Stripe integration for payments
  - Device fingerprinting for activation limits
  - Remote license deactivation

### Technical Requirements

#### Desktop Application Stack
- **Framework**: Electron 38+
- **UI**: React 18+ with TypeScript
- **State**: Zustand
- **Database**: SQLite (better-sqlite3) with FTS5
- **Workflow UI**: React Flow
- **Panels**: react-resizable-panels
- **Modals**: nice-modal-react
- **Video**: react-player + FFmpeg encoding

#### Automation Stack
- **Browser**: Puppeteer 24+
- **Desktop**: Claude Computer Use API + Nut.js fallback
- **Recording**: Electron desktopCapturer + fluent-ffmpeg
- **AI**: Claude Sonnet 4.5 via @anthropic-ai/sdk

#### Web Subscription Platform Stack
- **Framework**: Next.js 15+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk (or BetterAuth alternative)
- **Payments**: Stripe
- **UI**: shadcn/ui + Tailwind CSS
- **Hosting**: Vercel

### User Interface Layout

#### Main Window
- **Top Menubar**: File, Edit, View, Run, Help
- **Left Sidebar**: Workflow history (default)
- **Center Canvas**: Actions viewer (Puppeteer/Computer Use live feed)
- **Right Mini-Sidebar**: Agent workflow builder (above chat)
- **Bottom**: Chat interface with agent orchestration panel

#### Workflow Detail View
- **Video Player**: Recording playback
- **Markdown Viewer**: Step-by-step execution log
- **Info Panel**: Metadata form (agents, duration, files created)
- **Minimize Button**: Return to main canvas

### Success Metrics
1. **Workflow Completion Rate**: >90% of workflows execute successfully
2. **User Retention**: 70% monthly active after first workflow
3. **API Cost**: <$50/month per power user (user-owned keys)
4. **Search Performance**: <100ms for FTS5 queries on 1000+ workflows
5. **Subscription Conversion**: 15% free trial → paid within 30 days
6. **Video Recording**: 100% capture rate at <10MB/minute

### Compliance & Security
- **License**: Fully proprietary (no duplication/modification/redistribution)
- **Code Signing**: Windows Authenticode + macOS Developer certificates
- **Data Storage**: Local-first (user's machine only)
- **API Keys**: OS-level encryption, never transmitted
- **GDPR**: Minimal data collection (subscription email only)
- **Updates**: Auto-update via electron-updater + GitHub Releases

### Roadmap

#### Phase 1: Core Infrastructure (Months 1-2)
- Electron shell with menubar
- 3-panel layout
- SQLite database
- BetterAuth + Clerk web integration

#### Phase 2: Agent System (Months 3-4)
- Claude SDK integration
- Default agent implementations
- Manual agent builder
- Basic chat interface

#### Phase 3: Workflow Management (Month 5)
- Workflow storage
- History panel
- Markdown log generation
- JSON metadata

#### Phase 4: Automation & Recording (Months 6-7)
- Puppeteer integration
- Claude Computer Use API
- Screen recording
- FFmpeg encoding

#### Phase 5: Visualization (Month 8)
- React Flow workflow builder
- Agent orchestration UI
- Workflow graph visualization
- Video playback

#### Phase 6: Subscription Platform (Month 9)
- Next.js deployment
- Stripe integration
- License validation API
- Desktop subscription checks

#### Phase 7: Polish & Release (Month 10)
- AI-assisted agent builder
- Performance optimization
- Beta testing
- Code signing + distribution

### Competitive Differentiation
- **vs Zapier/Make**: Desktop automation + video replay
- **vs n8n**: AI-powered agents + local-first
- **vs Selenium IDE**: Visual orchestration + Claude intelligence
- **vs AutoHotkey**: Cross-platform + AI control + cloud sync

---

*PRD Version 1.0 - AI Agentic Desktop Tool*
# System Architecture Overview

## Document Information
- **Project:** AI Agentic Desktop Tool
- **Version:** 1.0.0
- **Last Updated:** October 5, 2025
- **Status:** Planning Phase

---

## Executive Summary

The AI Agentic Desktop Tool is a sophisticated local-first desktop application that enables users to orchestrate multiple AI agents powered by Claude for complex workflows involving browser and desktop automation. The application features a visual workflow builder, comprehensive execution history with video replay, and a subscription-based licensing system.

### Key Architectural Principles
1. **Local-First Design**: All core functionality runs locally; cloud only for subscription validation
2. **User-Owned Resources**: Users provide their own Claude API keys (zero API costs for us)
3. **Privacy-Focused**: All data stays on user's machine; optional cloud sync
4. **Proprietary & Secure**: Fully restrictive license with anti-piracy measures
5. **Extensible**: Users can create custom agents manually or AI-assisted

---

## System Context

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S LOCAL MACHINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │           Electron Desktop Application                    │ │
│  │  ┌─────────────┬──────────────┬───────────────────────┐  │ │
│  │  │  UI Layer   │ Agent System │  Automation Engine    │  │ │
│  │  │  (React)    │ (Claude SDK) │  (Puppeteer/CompUse) │  │ │
│  │  └─────────────┴──────────────┴───────────────────────┘  │ │
│  │  ┌───────────────────────────────────────────────────┐    │ │
│  │  │         Workflow Orchestration Engine             │    │ │
│  │  └───────────────────────────────────────────────────┘    │ │
│  │  ┌───────────────────────────────────────────────────┐    │ │
│  │  │  Local Storage (SQLite + Video Files + Markdown)  │    │ │
│  │  └───────────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│                            ↕ HTTPS                              │
└─────────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD SERVICES (Minimal)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ License Validator│  │  BetterAuth  │  │ Anthropic API   │  │
│  │  (Next.js API)   │  │  (Self-host) │  │ (User's Key)    │  │
│  └──────────────────┘  └──────────────┘  └─────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Web Subscription Platform (Next.js/Supabase)      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Desktop Application (Electron)

**Technology Stack:**
- **Framework**: Electron 28+
- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite 5
- **State Management**: Zustand
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Workflow Visualization**: React Flow

**Responsibilities:**
- Provide native desktop experience
- Manage local data storage and file system operations
- Execute browser and desktop automation
- Render workflow visualizations
- Handle video recording and playback
- Orchestrate agent execution

**Key Features:**
- Top menubar (File, Edit, View, Run, Help)
- Three-panel layout (Left: History, Center: Canvas, Right: Agent Builder)
- Modal system for agent creation and configuration
- Resizable panels with persistent state

---

### 2. Agent System

**Agent Types:**

#### Built-in Agents (Powered by Claude SDK)
1. **Web Research Agent**
   - Uses Puppeteer for browser automation
   - Can navigate websites, extract data, fill forms
   - Returns structured information

2. **Code Generation Agent**
   - Creates code in multiple languages
   - Can generate entire project structures
   - Includes linting and testing capabilities

3. **File Management Agent**
   - CRUD operations on files and directories
   - File search and organization
   - Safe file handling with permissions

4. **Data Analysis Agent**
   - Processes CSV, JSON, Excel files
   - Generates visualizations and insights
   - Statistical analysis capabilities

5. **Content Creation Agent**
   - Writes documents, articles, emails
   - Multi-format support (Markdown, HTML, etc.)
   - Template-based generation

#### Custom Agents
- User can create via **Agent Builder Modal**
- **Manual Creation**: Define system prompts, tools, parameters
- **AI-Assisted Creation**: Describe agent in natural language, AI generates config

**Agent Architecture:**
```typescript
interface Agent {
  id: string;
  name: string;
  type: 'built-in' | 'custom';
  systemPrompt: string;
  capabilities: string[];
  tools: ToolDefinition[];
  parameters: AgentParameter[];
  config: Record<string, any>;
}
```

---

### 3. Workflow Orchestration Engine

**Core Functionality:**
- Execute agents in sequence or parallel
- Manage agent-to-agent data flow
- Handle errors and retries
- Pause/resume workflow execution
- Log all steps for replay and analysis

**Workflow Structure:**
```typescript
interface Workflow {
  id: string;
  name: string;
  createdAt: Date;
  initialMessage: string;
  agents: AgentStep[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  videoPath: string;
  markdownPath: string;
  metadataPath: string;
}

interface AgentStep {
  agentId: string;
  order: number;
  input: any;
  output: any;
  timestamp: Date;
  duration: number;
}
```

**Orchestration Flow:**
```
User Input → Parse Request → Select Agents → Create Workflow
              ↓
         Execute Agent 1 → Log Step → Record Video
              ↓
         Execute Agent 2 → Log Step → Record Video
              ↓
         Execute Agent N → Log Step → Record Video
              ↓
     Generate Markdown → Save Metadata → Complete Workflow
```

---

### 4. Automation Engines

#### Browser Automation (Puppeteer)
- **Purpose**: Web-based tasks (scraping, form filling, navigation)
- **Technology**: Puppeteer (runs on Chromium bundled with Electron)
- **Capabilities**:
  - Page navigation and interaction
  - Screenshot and PDF generation
  - Network request interception
  - Cookie and storage management

#### Desktop Automation (Claude Computer Use)
- **Purpose**: Desktop application control and OS-level tasks
- **Technology**: Claude Computer Use API
- **Capabilities**:
  - Mouse and keyboard control
  - Window management
  - Screen capture and analysis
  - File system operations

**Automation Architecture:**
```typescript
interface AutomationEngine {
  type: 'browser' | 'desktop';
  execute(action: AutomationAction): Promise<AutomationResult>;
  screenshot(): Promise<Buffer>;
  record(): VideoRecorder;
}
```

---

### 5. Storage Layer

**Local Database (SQLite with FTS5)**
```sql
-- Core tables
workflows (id, name, created_at, video_path, markdown_path, metadata_path)
agents (id, name, type, config, created_at)
workflow_steps (id, workflow_id, agent_id, step_order, input, output, timestamp)
user_settings (key, value)
api_keys (service, encrypted_key)

-- Full-text search
workflows_fts (using fts5 for fast search)
```

**File System Storage:**
```
C:\Users\{username}\AppData\Local\AgenticInterface\
├── database\
│   └── workflows.db (SQLite database)
├── workflows\
│   ├── {workflow-id}\
│   │   ├── video.webm (screen recording)
│   │   ├── documentation.md (step-by-step log)
│   │   └── metadata.json (workflow info)
│   └── ...
├── agents\
│   ├── built-in\
│   └── custom\
│       └── {agent-id}.json
└── cache\
    └── ... (temporary files)
```

**Video Storage:**
- Format: WebM with VP9 codec
- Compression: Medium quality (balance file size and clarity)
- Indexed with timeline markers for each agent action
- Thumbnail generated on completion

**Markdown Documentation:**
```markdown
# Workflow: {Name}

## Initial Request
{User's original message}

## Workflow Information
- Date: {timestamp}
- Duration: {time}
- Status: {success/failed}
- Agents Used: {list}

## Execution Steps

### Step 1: {Agent Name}
**Input:**
...

**Output:**
...

**Files Created:**
- file1.txt
- file2.js

### Step 2: {Agent Name}
...

## Summary
{AI-generated summary}
```

---

### 6. State Management (Zustand)

**Store Architecture:**
```typescript
// Global state slices
- workflowStore: Workflow history and active workflow
- agentStore: Available agents and selection
- uiStore: Sidebar state, modals, canvas view
- authStore: User authentication and session
- settingsStore: User preferences and configuration
```

**Key Features:**
- Persistent state (sync with localStorage)
- Middleware for logging and debugging
- TypeScript-first design
- Minimal boilerplate (3KB library)

---

### 7. User Interface Components

#### Top Menubar
```
File      Edit        View         Run            Help
├─ New   ├─ Undo     ├─ Zoom In   ├─ Start       ├─ Documentation
├─ Open  ├─ Redo     ├─ Zoom Out  ├─ Pause       ├─ Tutorials
├─ Save  ├─ Cut      ├─ Fit       ├─ Stop        ├─ Keyboard Shortcuts
├─ Close ├─ Copy     ├─ Sidebar   ├─ Debug Mode  ├─ Report Issue
└─ Exit  └─ Paste    └─ Theme     └─ Settings    └─ About
```

#### Left Sidebar (Workflow History)
- **Search Bar**: FTS5-powered full-text search
- **Filter Panel**: By date, status, agents used
- **Workflow Cards**: Grid or list view
  - Thumbnail (video first frame)
  - Name and date
  - Status indicator
  - Agent icons
- **Infinite Scroll**: Load more on scroll
- **Click Action**: Expand to center canvas

#### Center Canvas (Main Workspace)
**Default View: Actions Viewer**
- Real-time display of browser/desktop automation
- Puppeteer browser window embedded
- Desktop automation screen capture

**Workflow Detail View** (on click):
- **Video Player**: With timeline controls and markers
- **Markdown Viewer**: Syntax-highlighted documentation
- **Metadata Panel**: Form-based workflow information
- **Minimize Button**: Return to actions viewer

#### Right Mini-Sidebar (Agent Choreography)
- **Agent Selection**: List of available agents
- **Visual Flow Builder**: n8n-style node connections
- **Agent Configuration**: Click node to configure
- **Positioned Above Chat**: Integrated workflow design

#### Bottom Chat Interface
- **Text Input**: User request entry
- **Agent String Display**: Shows choreographed workflow above input
- **Submit Button**: Execute workflow
- **Auto Agent Selection**: AI determines needed agents if not specified

---

## Integration Architecture

### 1. Claude SDK Integration

**API Communication:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: userProvidedKey, // User's own API key
});

// Streaming messages
const stream = await client.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 8192,
  messages: conversationHistory,
});
```

**Features:**
- Token usage tracking
- Rate limit handling
- Error recovery with exponential backoff
- Cost estimation per workflow
- Conversation history management

---

### 2. Authentication (BetterAuth)

**Self-Hosted Setup:**
```typescript
// BetterAuth configuration
import { createAuthClient } from '@better-auth/client';

const auth = createAuthClient({
  baseURL: process.env.AUTH_URL,
  providers: ['google', 'github', 'credentials'],
  storage: 'electron-safe-storage',
});
```

**Authentication Flow:**
1. User launches desktop app
2. If not authenticated → Show login modal
3. OAuth (Google/GitHub) or email/password
4. Receive JWT token
5. Store securely in Electron safeStorage
6. Validate subscription status
7. If valid → Unlock app; If invalid → Show paywall

---

### 3. Subscription Platform (Web)

**Technology Stack** (from reference video):
- **Framework**: Next.js 15+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Payments**: Stripe
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Vercel

**Subscription Plans:**
```typescript
const PLANS = {
  free: {
    name: 'Free Trial',
    price: 0,
    features: [
      '50 workflows/month',
      '3 built-in agents',
      '7-day history',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    features: [
      'Unlimited workflows',
      'All built-in agents',
      'Unlimited history',
      'Custom agents',
      'Video recordings',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'SSO',
      'Priority support',
    ],
  },
};
```

**License Validation:**
- Desktop app checks subscription status via API
- 30-day offline grace period
- Device fingerprinting for anti-piracy
- Hardware-locked licenses
- Subscription status cached locally

---

### 4. Video Recording System

**Implementation:**
```typescript
class VideoRecorder {
  private mediaRecorder: MediaRecorder;
  
  async startRecording() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' },
    });
    
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000, // 2.5 Mbps
    });
    
    this.mediaRecorder.start();
  }
  
  async stopRecording(): Promise<Blob> {
    // Returns video blob for saving
  }
  
  addMarker(timestamp: number, agentName: string) {
    // Mark agent actions in timeline
  }
}
```

**Features:**
- Screen recording with WebM/VP9
- Timeline markers for each agent action
- Automatic thumbnail generation
- Video compression for storage efficiency
- Playback with seek controls

---

## Security Architecture

### 1. API Key Management

**Storage:**
- User's Claude API key encrypted using Electron's safeStorage
- Never transmitted to our servers
- Stored locally with AES-256 encryption

**Usage:**
```typescript
// Secure API key storage
import { safeStorage } from 'electron';

const encryptedKey = safeStorage.encryptString(apiKey);
localStorage.setItem('encrypted_api_key', encryptedKey.toString('base64'));

// Retrieval
const encrypted = Buffer.from(localStorage.getItem('encrypted_api_key'), 'base64');
const apiKey = safeStorage.decryptString(encrypted);
```

---

### 2. License Protection

**Anti-Piracy Measures:**
1. **Code Obfuscation**: JavaScript obfuscation for production builds
2. **License Validation**: Online check + 30-day offline grace period
3. **Device Fingerprinting**: Hardware-based unique identifier
4. **Integrity Checks**: Detect tampering with core files
5. **Proprietary License**: Legal protection (no modification/redistribution)

**Validation Flow:**
```
App Launch → Check License → Online? 
   ├─ Yes → Validate with server → Cache result → Allow/Deny
   └─ No → Check last validation → <30 days? → Allow : Deny
```

---

### 3. Data Privacy

**Privacy Guarantees:**
- All workflows stored locally (never sent to our servers)
- Video recordings stay on user's machine
- Optional cloud sync (user-controlled)
- GDPR compliant (minimal data collection)
- No telemetry without explicit opt-in

---

## Deployment Architecture

### Desktop Application

**Build Process:**
```
Development → Build → Package → Code Sign → Distribute
    ↓           ↓         ↓           ↓          ↓
  Electron    Vite    electron-   Certificate  Installers
              build    builder                (Win/Mac/Linux)
```

**Distribution:**
- **Windows**: NSIS installer (.exe)
- **macOS**: DMG + App Store (future)
- **Linux**: AppImage + Snap

**Auto-Update:**
- Electron auto-updater
- Delta updates (only changed files)
- Background download with user prompt
- Rollback on failure

---

### Web Platform

**Deployment:**
```
Next.js App → Vercel → CDN Distribution
    ↓
Supabase → PostgreSQL Database → Real-time subscriptions
    ↓
Stripe → Webhook → Payment processing
```

**Infrastructure:**
- **Hosting**: Vercel (zero-config deployments)
- **Database**: Supabase (managed PostgreSQL)
- **CDN**: Vercel Edge Network
- **Auth**: Clerk (managed authentication)
- **Payments**: Stripe (PCI-compliant)

---

## Scalability Considerations

### Desktop App Performance

**Optimization Strategies:**
1. **Lazy Loading**: Load agents and workflows on-demand
2. **Virtual Lists**: Render only visible workflow cards
3. **Worker Threads**: Run heavy computations off main thread
4. **Database Indexing**: FTS5 for instant search
5. **Video Compression**: Reduce storage footprint

**Resource Limits:**
- Max workflow history: Unlimited (user's disk space)
- Concurrent agent executions: 3 (configurable)
- Video retention: User-configurable (default: 90 days)

---

### Web Platform Scaling

**Horizontal Scaling:**
- Vercel auto-scales based on traffic
- Supabase connection pooling
- Stripe webhooks handle high volume

**Database Optimization:**
- Indexed queries on user_id, subscription_status
- Row-level security (RLS) in Supabase
- Periodic cleanup of expired sessions

---

## Monitoring & Observability

### Desktop App

**Error Tracking:**
- Sentry integration for crash reports
- User-opt-in telemetry
- Local logging (rotated log files)

**Performance Metrics:**
- App startup time
- Agent execution duration
- Video recording overhead
- Database query performance

---

### Web Platform

**Monitoring Stack:**
- Vercel Analytics (traffic, performance)
- Supabase Metrics (database health)
- Stripe Dashboard (payment analytics)
- Sentry (error tracking)

**Key Metrics:**
- Subscription conversion rate
- Churn rate
- API response times
- License validation success rate

---

## Development Workflow

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/agentic-interface-app

# Install dependencies
npm install

# Run desktop app in dev mode
npm run dev

# Run web platform locally
cd web-platform
npm run dev
```

**Development Tools:**
- **Code Editor**: VS Code with TypeScript/ESLint
- **Debugging**: Electron DevTools + React DevTools
- **Testing**: Jest + React Testing Library + Playwright
- **Version Control**: Git with conventional commits

---

### CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    - Lint code (ESLint, Prettier)
    - Run unit tests (Jest)
    - Run integration tests
    - Type check (TypeScript)
  
  build:
    - Build Electron app
    - Create installers (Win/Mac/Linux)
    - Code sign applications
  
  deploy:
    - Deploy web platform to Vercel
    - Upload installers to release server
    - Notify team on Slack
```

---

## Testing Strategy

### Desktop App Testing

**Unit Tests:**
- Agent execution logic
- Workflow orchestration
- State management (Zustand stores)
- Database operations

**Integration Tests:**
- Agent-to-agent communication
- Puppeteer automation flows
- Video recording functionality
- License validation

**E2E Tests:**
- Complete workflow execution
- UI interactions (Playwright)
- Cross-platform compatibility

**Test Coverage Target:** 80%+

---

### Web Platform Testing

**Unit Tests:**
- API route handlers
- Authentication flows
- Stripe webhook processing

**E2E Tests:**
- User registration and login
- Subscription purchase flow
- License activation

---

## Future Enhancements

### Phase 2 (Mobile App)
- React Native mobile companion
- View workflow history on mobile
- Trigger workflows remotely
- Push notifications for completion

### Phase 3 (Team Features)
- Shared agent marketplace
- Team collaboration workspaces
- Workflow templates library
- Role-based access control

### Phase 4 (Enterprise)
- Self-hosted deployment option
- SSO/SAML authentication
- Advanced audit logs
- Custom branding/white-labeling

---

## Conclusion

The AI Agentic Desktop Tool represents a sophisticated yet maintainable architecture that prioritizes user privacy, performance, and extensibility. By leveraging proven technologies (Electron, React, SQLite, Claude SDK) and a local-first approach, the application delivers powerful AI agent orchestration capabilities while keeping user data secure and costs low through user-owned API keys.

The modular architecture allows for incremental feature additions and easy maintenance, while the subscription-based licensing model via a separate web platform ensures sustainable revenue without compromising the core local-first philosophy.

---

## References

- **Anthropic Claude SDK**: https://docs.anthropic.com/
- **Electron Documentation**: https://www.electronjs.org/docs
- **Puppeteer**: https://pptr.dev/
- **React Flow**: https://reactflow.dev/
- **Zustand**: https://github.com/pmndrs/zustand
- **BetterAuth**: https://www.better-auth.com/
- **Web Platform Stack Video**: https://www.youtube.com/watch?v=TWQv_tr5ABI

---

*Last Updated: October 5, 2025*  
*Version: 1.0.0*  
*Status: Architecture Finalized - Ready for Implementation*
# Technical Requirements Document (TRD)
## AI Agentic Desktop Tool

### Document Information
- **Project Name**: AI Agentic Desktop Tool
- **Version**: 1.0
- **Last Updated**: 2025-01-XX
- **Status**: Requirements Phase

---

## 1. System Architecture Overview

### 1.1 Application Type
- **Platform**: Cross-platform desktop application (Windows primary, macOS/Linux secondary)
- **Framework**: Electron 38.2.1
- **Architecture Pattern**: Multi-process (Main + Renderer)
- **Deployment**: Standalone installer with auto-updates

### 1.2 Core Components
```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main Process                │
│  (Node.js runtime - File I/O, Database, Automation)    │
├─────────────────────────────────────────────────────────┤
│  - SQLite Database (workflow storage, FTS5 search)     │
│  - Puppeteer Controller (browser automation)           │
│  - Computer Use API Client (desktop automation)        │
│  - FFmpeg Video Encoder (screen recording)             │
│  - License Validator (subscription checks)             │
│  - IPC Bridge (communication with renderer)            │
└─────────────────────────────────────────────────────────┘
                           ↕ IPC
┌─────────────────────────────────────────────────────────┐
│                  Electron Renderer Process              │
│         (Chromium - React UI, User Interface)           │
├─────────────────────────────────────────────────────────┤
│  - React 18 Application                                │
│  - React Flow (workflow visualization)                 │
│  - Zustand State Management                            │
│  - Video Player (react-player)                         │
│  - Monaco Editor (agent code editing)                  │
│  - Tailwind CSS + shadcn/ui                           │
└─────────────────────────────────────────────────────────┘
```

### 1.3 External Services Integration
```
Desktop App (Local)                    Web Platform (Cloud)
┌────────────────┐                    ┌────────────────────┐
│  User Machine  │◄──HTTP Polling────►│  Vercel/Next.js    │
│                │   (Every 5 min)     │                    │
│  - API Keys    │                    │  - Subscription DB  │
│  - Workflows   │                    │  - Stripe Webhooks  │
│  - Videos      │                    │  - License API      │
└────────────────┘                    └────────────────────┘
        │                                       │
        │                                       │
        ▼                                       ▼
 ┌──────────────┐                      ┌──────────────┐
 │ Anthropic API│                      │  Supabase DB │
 │ (User's key) │                      │ (PostgreSQL) │
 └──────────────┘                      └──────────────┘
```

---

## 2. Technology Stack Specifications

### 2.1 Desktop Application Core

#### Electron Configuration
```json
{
  "electron": "38.2.1",
  "requirements": {
    "node": ">=20.0.0",
    "chromium": "130.x",
    "v8": "13.0.x"
  },
  "build": {
    "appId": "com.agentic-interface.app",
    "productName": "Agentic Interface",
    "win": {
      "target": ["nsis", "portable"],
      "certificateSubjectName": "Company Name",
      "sign": true
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.productivity",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist"
    }
  }
}
```

#### Frontend Stack
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| UI Library | React | 18.3.1 | Component-based UI |
| Language | TypeScript | 5.6+ | Type safety |
| State Management | Zustand | 5.0+ | Global state |
| Workflow Visualization | React Flow | 11.11+ | Visual workflow builder |
| UI Components | shadcn/ui | Latest | Pre-built components |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS |
| Forms | React Hook Form | 7.53+ | Form validation |
| Schema Validation | Zod | 3.23+ | Runtime type checking |
| Code Editor | Monaco Editor | 0.52+ | Agent code editing |
| Video Player | react-player | 2.16+ | Workflow video playback |
| Layout Panels | react-resizable-panels | 2.1+ | Resizable UI panels |
| Modals | nice-modal-react | 1.2+ | Modal state management |

### 2.2 Backend/Automation Stack

#### Database
```typescript
// SQLite Configuration
{
  engine: "better-sqlite3",
  version: "11.5+",
  location: "app.getPath('userData')/database.sqlite",
  features: [
    "FTS5 full-text search",
    "JSON1 extension",
    "R*Tree spatial index (future maps)"
  ],
  migrations: "Knex.js for schema versioning"
}
```

#### Automation Tools
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Browser Automation | Puppeteer | 24.22+ | Web scraping/interaction |
| Electron Integration | puppeteer-in-electron | 3.0+ | BrowserWindow control |
| Desktop Automation | Claude Computer Use API | Beta | AI-powered UI control |
| Fallback Automation | Nut.js | 4.2+ | Programmatic desktop control |
| Screen Recording | Electron desktopCapturer | Native | Video capture |
| Video Encoding | fluent-ffmpeg | 2.1+ | H.264 encoding |
| FFmpeg Binary | @ffmpeg-installer/ffmpeg | 1.1+ | Codec support |

#### AI Integration
```typescript
// Claude SDK Configuration
{
  sdk: "@anthropic-ai/sdk",
  version: "0.47+",
  model: "claude-sonnet-4-20250514",
  features: {
    "contextWindow": "1M tokens (beta)",
    "computerUse": "computer-use-2025-01-24",
    "promptCaching": "90% cost reduction",
    "streaming": "Real-time responses"
  },
  rateLimit: {
    tier1: "5 req/min (free)",
    tier2: "40 req/min ($40+/mo)",
    tier3: "80 req/min ($200+/mo)",
    tier4: "400 req/min ($1000+/mo)"
  }
}
```

### 2.3 Web Subscription Platform Stack

#### Next.js Application
```json
{
  "framework": "Next.js 15.1+",
  "runtime": "Node.js 20+",
  "features": [
    "App Router (React Server Components)",
    "API Routes (serverless functions)",
    "Edge Runtime (license validation)",
    "Server Actions (form submissions)"
  ],
  "deployment": {
    "platform": "Vercel",
    "regions": ["us-east-1", "eu-west-1"],
    "cdn": "Vercel Edge Network"
  }
}
```

#### Backend Services
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | Supabase (PostgreSQL 15) | User data, subscriptions |
| Authentication | Clerk / BetterAuth | User accounts, OAuth |
| Payments | Stripe | Subscription billing |
| Email | Resend | Transactional emails |
| Monitoring | Sentry | Error tracking |
| Analytics | Vercel Analytics | Usage metrics |

---

## 3. Data Models & Storage

### 3.1 SQLite Schema

```sql
-- Workflows Table
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('running', 'completed', 'failed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  duration_ms INTEGER,
  video_path TEXT,
  markdown_path TEXT,
  metadata_path TEXT,
  tags TEXT, -- JSON array
  UNIQUE(id)
);

-- Agents Table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('built-in', 'custom')),
  category TEXT, -- web, desktop, data, api, etc.
  description TEXT,
  config TEXT, -- JSON configuration
  code TEXT, -- Agent code/prompt
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  UNIQUE(id)
);

-- Workflow Steps Table
CREATE TABLE workflow_steps (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  action TEXT NOT NULL,
  input_data TEXT, -- JSON
  output_data TEXT, -- JSON
  status TEXT CHECK(status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  started_at DATETIME,
  completed_at DATETIME,
  duration_ms INTEGER,
  screenshot_path TEXT,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Files Created Table
CREATE TABLE workflow_files (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Full-Text Search Index
CREATE VIRTUAL TABLE workflows_fts USING fts5(
  workflow_id UNINDEXED,
  name,
  description,
  tags,
  markdown_content,
  content='workflows',
  content_rowid='rowid'
);

-- Triggers for FTS sync
CREATE TRIGGER workflows_fts_insert AFTER INSERT ON workflows BEGIN
  INSERT INTO workflows_fts(workflow_id, name, description, tags)
  VALUES (new.id, new.name, new.description, new.tags);
END;

CREATE TRIGGER workflows_fts_update AFTER UPDATE ON workflows BEGIN
  UPDATE workflows_fts SET 
    name = new.name,
    description = new.description,
    tags = new.tags
  WHERE workflow_id = old.id;
END;

CREATE TRIGGER workflows_fts_delete AFTER DELETE ON workflows BEGIN
  DELETE FROM workflows_fts WHERE workflow_id = old.id;
END;

-- Indexes for performance
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_created ON workflows(created_at DESC);
CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_files_workflow ON workflow_files(workflow_id);
```

### 3.2 File System Organization

```
C:\Users\{username}\AppData\Roaming\agentic-interface\
│
├── database.sqlite                    # Main SQLite database
├── database.sqlite-wal                # Write-Ahead Log
├── database.sqlite-shm                # Shared memory file
│
├── workflows\                         # Workflow storage
│   ├── {workflow-id-1}\
│   │   ├── metadata.json              # Workflow metadata
│   │   ├── execution-log.md           # Markdown log
│   │   ├── recording.mp4              # Video recording
│   │   ├── graph.json                 # React Flow graph definition
│   │   ├── screenshots\               # Step screenshots
│   │   │   ├── step-001.png
│   │   │   └── step-002.png
│   │   └── files\                     # Generated files
│   │       ├── report.pdf
│   │       └── data.csv
│   └── {workflow-id-2}\
│       └── ...
│
├── agents\                            # Custom agent definitions
│   ├── {agent-id-1}.json
│   └── {agent-id-2}.json
│
├── config\                            # Application config
│   ├── settings.json                  # User preferences
│   ├── license.enc                    # Encrypted license key
│   └── api-keys.enc                   # Encrypted API keys
│
└── logs\                              # Application logs
    ├── main-process.log
    ├── renderer-process.log
    └── error.log
```

### 3.3 Supabase Schema (Web Platform)

```sql
-- Users Table (managed by Clerk/BetterAuth)
-- Supabase Auth integration

-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT CHECK(status IN ('active', 'cancelled', 'past_due', 'trialing')),
  plan TEXT CHECK(plan IN ('individual', 'professional', 'enterprise')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Devices Table (activation tracking)
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  platform TEXT, -- windows, macos, linux
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(device_fingerprint)
);

-- License Validations Table (audit log)
CREATE TABLE license_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  validation_result TEXT CHECK(validation_result IN ('success', 'invalid', 'expired', 'device_limit')),
  ip_address INET,
  user_agent TEXT,
  validated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own devices"
  ON devices FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 4. API Specifications

### 4.1 Desktop App IPC APIs

```typescript
// Main Process → Renderer Process
interface MainToRendererAPI {
  // Workflow Management
  'workflow:created': (workflow: Workflow) => void;
  'workflow:updated': (workflowId: string, updates: Partial<Workflow>) => void;
  'workflow:completed': (workflowId: string, result: WorkflowResult) => void;
  
  // Agent Execution
  'agent:started': (agentId: string, stepNumber: number) => void;
  'agent:progress': (agentId: string, progress: AgentProgress) => void;
  'agent:completed': (agentId: string, result: AgentResult) => void;
  
  // Recording
  'recording:started': (workflowId: string) => void;
  'recording:stopped': (workflowId: string, videoPath: string) => void;
  
  // License
  'license:validated': (isValid: boolean, expiresAt: Date) => void;
  'license:expired': () => void;
}

// Renderer Process → Main Process
interface RendererToMainAPI {
  // Workflow Operations
  createWorkflow(name: string, agents: Agent[]): Promise<Workflow>;
  executeWorkflow(workflowId: string): Promise<void>;
  cancelWorkflow(workflowId: string): Promise<void>;
  getWorkflows(filters?: WorkflowFilters): Promise<Workflow[]>;
  searchWorkflows(query: string): Promise<Workflow[]>;
  
  // Agent Operations
  getAgents(): Promise<Agent[]>;
  createAgent(agent: AgentConfig): Promise<Agent>;
  updateAgent(agentId: string, updates: Partial<Agent>): Promise<void>;
  deleteAgent(agentId: string): Promise<void>;
  
  // File Operations
  openWorkflowVideo(workflowId: string): Promise<string>;
  openWorkflowMarkdown(workflowId: string): Promise<string>;
  exportWorkflow(workflowId: string, format: 'json' | 'zip'): Promise<string>;
  
  // License Operations
  validateLicense(): Promise<LicenseStatus>;
  setApiKey(key: string): Promise<void>;
  getApiKey(): Promise<string | null>;
}
```

### 4.2 Web Platform REST APIs

#### License Validation Endpoint
```typescript
// POST /api/license/validate
interface ValidateLicenseRequest {
  licenseKey: string;
  deviceFingerprint: string;
  appVersion: string;
}

interface ValidateLicenseResponse {
  valid: boolean;
  subscription: {
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    plan: 'individual' | 'professional' | 'enterprise';
    currentPeriodEnd: string; // ISO 8601
  };
  devices: {
    current: number;
    limit: number;
  };
  features: {
    maxWorkflows: number;
    videoRecording: boolean;
    customAgents: boolean;
    teamSharing: boolean;
  };
}
```

#### Stripe Webhook Handler
```typescript
// POST /api/webhooks/stripe
interface StripeWebhookHandler {
  events: {
    'customer.subscription.created': (subscription: Stripe.Subscription) => void;
    'customer.subscription.updated': (subscription: Stripe.Subscription) => void;
    'customer.subscription.deleted': (subscription: Stripe.Subscription) => void;
    'invoice.payment_succeeded': (invoice: Stripe.Invoice) => void;
    'invoice.payment_failed': (invoice: Stripe.Invoice) => void;
  };
  
  // Sync to Supabase
  syncSubscription(stripeSubscription: Stripe.Subscription): Promise<void>;
  syncCustomer(stripeCustomer: Stripe.Customer): Promise<void>;
}
```

---

## 5. Performance Requirements

### 5.1 Application Performance

| Metric | Requirement | Measurement |
|--------|------------|-------------|
| App Launch Time | <2 seconds | Cold start to visible UI |
| Workflow Load Time | <500ms | SQLite query + render |
| FTS5 Search | <100ms | Query + results display |
| Video Playback Start | <1 second | H.264 with faststart flag |
| Agent Execution Latency | <3 seconds | Claude API call initiation |
| Screen Recording FPS | 30 FPS | Consistent frame rate |
| Memory Usage (Idle) | <300 MB | Main + renderer processes |
| Memory Usage (Recording) | <800 MB | With active automation |
| Disk I/O | <50 MB/s | Video encoding writes |

### 5.2 Scalability Limits

| Resource | Limit | Rationale |
|----------|-------|-----------|
| Max Workflows Stored | 10,000 | SQLite performance threshold |
| Max Agents | 500 | UI list rendering limit |
| Max Workflow Steps | 1,000 | Single workflow complexity |
| Max Video Length | 60 minutes | File size management |
| Max Video File Size | 600 MB | At 10 MB/min encoding |
| Max Concurrent Agents | 5 | Resource management |
| FTS5 Index Size | 500 MB | Search performance |

### 5.3 Network Requirements

| Operation | Frequency | Bandwidth | Timeout |
|-----------|-----------|-----------|---------|
| License Validation | Every 5 minutes | <10 KB | 10s |
| Claude API Call | Per agent action | 1-50 KB | 60s |
| Screenshot Upload (Computer Use) | Per action | 100-500 KB | 30s |
| Subscription Webhook | Event-driven | <5 KB | 5s |

---

## 6. Security Requirements

### 6.1 Data Encryption

#### API Key Storage
```typescript
// Electron safeStorage
import { safeStorage } from 'electron';

// Encrypt API key
const encryptApiKey = (key: string): string => {
  const encrypted = safeStorage.encryptString(key);
  return encrypted.toString('base64');
};

// Decrypt API key
const decryptApiKey = (encryptedKey: string): string => {
  const buffer = Buffer.from(encryptedKey, 'base64');
  return safeStorage.decryptString(buffer);
};

// Platform-specific encryption
// - macOS: Keychain (AES-256)
// - Windows: DPAPI (AES-256)
// - Linux: libsecret (AES-256)
```

#### License Key Validation
```typescript
interface LicenseValidation {
  // JWT signed by server
  token: string;
  signature: string;
  
  // Encrypted with public key
  payload: {
    userId: string;
    subscription: SubscriptionDetails;
    expiresAt: number; // Unix timestamp
    deviceLimit: number;
  };
  
  // Verification
  verify(publicKey: string): boolean;
}
```

### 6.2 Code Signing

#### Windows (Authenticode)
```json
{
  "certificate": {
    "type": "EV Code Signing",
    "provider": "DigiCert/Sectigo",
    "cost": "$299-499/year",
    "requirements": [
      "Company verification",
      "Hardware token (USB)"
    ]
  },
  "signing": {
    "tool": "electron-builder",
    "timestampServer": "http://timestamp.digicert.com",
    "algorithm": "SHA-256"
  }
}
```

#### macOS (Apple Developer)
```json
{
  "certificate": {
    "type": "Developer ID Application",
    "provider": "Apple",
    "cost": "$99/year",
    "requirements": [
      "Apple Developer Program membership",
      "Team ID verification"
    ]
  },
  "notarization": {
    "required": true,
    "tool": "electron-notarize",
    "process": "Upload to Apple → Scan → Staple"
  },
  "hardening": {
    "hardenedRuntime": true,
    "entitlements": [
      "com.apple.security.automation.apple-events",
      "com.apple.security.cs.allow-unsigned-executable-memory"
    ]
  }
}
```

### 6.3 Content Security Policy

```typescript
// Renderer Process CSP
const CSP = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"], // Monaco Editor requires
  styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires
  imgSrc: ["'self'", "data:", "https:"],
  mediaSrc: ["'self'", "file:"],
  connectSrc: [
    "'self'",
    "https://api.anthropic.com",
    "https://*.vercel.app", // Web platform
    "https://*.supabase.co"
  ],
  fontSrc: ["'self'", "data:"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
  upgradeInsecureRequests: []
};
```

---

## 7. Testing Requirements

### 7.1 Unit Testing

```typescript
// Test Coverage Requirements
{
  "statements": 80,
  "branches": 75,
  "functions": 80,
  "lines": 80,
  
  "frameworks": {
    "unit": "Vitest",
    "integration": "Playwright",
    "e2e": "Spectron (Electron testing)"
  },
  
  "criticalPaths": [
    "Workflow execution engine",
    "Agent orchestration logic",
    "License validation",
    "API key encryption/decryption",
    "Video recording pipeline",
    "FTS5 search queries"
  ]
}
```

### 7.2 Integration Testing

| Test Suite | Focus | Tools |
|------------|-------|-------|
| Puppeteer Integration | Browser automation flows | Playwright + Puppeteer |
| Computer Use API | Desktop automation | Mock API responses |
| Video Recording | Screen capture + encoding | FFmpeg validation |
| Database Operations | SQLite CRUD + FTS5 | better-sqlite3 tests |
| IPC Communication | Main ↔ Renderer | Spectron |

### 7.3 Performance Testing

```typescript
// Load Testing Scenarios
const performanceTests = {
  workflowLoad: {
    scenario: "Load 1000 workflows from database",
    target: "<500ms",
    tool: "Vitest benchmark"
  },
  fts5Search: {
    scenario: "Search 10,000 workflows",
    target: "<100ms",
    tool: "SQLite EXPLAIN QUERY PLAN"
  },
  videoEncoding: {
    scenario: "Encode 10-minute 1080p recording",
    target: "<30 seconds",
    tool: "FFmpeg benchmarks"
  },
  memoryLeaks: {
    scenario: "Run 100 workflows sequentially",
    target: "Memory stable within 10% variance",
    tool: "Chrome DevTools Profiler"
  }
};
```

---

## 8. Deployment & Distribution

### 8.1 Build Pipeline

```yaml
# GitHub Actions Workflow
name: Build & Release
on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:win
      - uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: dist/*.exe
  
  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:mac
      - uses: actions/upload-artifact@v4
        with:
          name: mac-installer
          path: dist/*.dmg
  
  release:
    needs: [build-windows, build-mac]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
      - uses: softprops/action-gh-release@v1
        with:
          files: |
            **/*.exe
            **/*.dmg
          draft: false
          prerelease: false
```

### 8.2 Auto-Update Configuration

```typescript
// electron-updater setup
import { autoUpdater } from 'electron-updater';

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-org',
  repo: 'agentic-interface-app',
  private: false // Set to true if private repo
});

autoUpdater.autoDownload = false; // Prompt user first
autoUpdater.autoInstallOnAppQuit = true;

// Check for updates every 4 hours
setInterval(() => {
  autoUpdater.checkForUpdates();
}, 4 * 60 * 60 * 1000);
```

---

## 9. Monitoring & Observability

### 9.1 Error Tracking

```typescript
// Sentry Integration
import * as Sentry from '@sentry/electron';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: app.getVersion(),
  
  beforeSend(event, hint) {
    // Strip sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    
    // Don't send API keys
    if (event.extra?.apiKey) {
      delete event.extra.apiKey;
    }
    
    return event;
  },
  
  integrations: [
    new Sentry.Integrations.Electron({
      mainProcess: true,
      rendererProcess: true
    })
  ]
});
```

### 9.2 Analytics

```typescript
// PostHog (Privacy-friendly analytics)
interface AnalyticsEvents {
  'workflow_created': { agentCount: number; type: string };
  'workflow_executed': { duration: number; status: string };
  'agent_created': { type: 'manual' | 'ai-assisted' };
  'video_played': { workflowId: string };
  'search_performed': { query: string; resultsCount: number };
  'license_validated': { status: string };
}

// Track without PII
posthog.capture('workflow_created', {
  agentCount: 5,
  type: 'browser-automation',
  // NO user data, API keys, or sensitive info
});
```

---

## 10. Compliance & Legal

### 10.1 Data Privacy (GDPR)

```typescript
// Minimal data collection
interface CollectedData {
  // Desktop App (local only)
  workflows: "Stored locally, never transmitted",
  apiKeys: "Encrypted locally, never transmitted",
  videos: "Stored locally, never transmitted",
  
  // Web Platform (cloud)
  email: "Required for account",
  subscriptionStatus: "Required for licensing",
  deviceFingerprints: "For activation limits",
  
  // Analytics (anonymized)
  usageMetrics: "Aggregated, no PII"
}
```

### 10.2 Terms of Service (Key Points)

- **Acceptable Use**: No malicious automation, no violation of third-party ToS
- **License Restrictions**: No duplication, modification, redistribution
- **Liability**: Software provided "as-is", no warranty for automation results
- **API Usage**: User responsible for Claude API costs and compliance

---

## 11. Technical Debt & Future Considerations

### 11.1 Known Limitations

| Limitation | Impact | Mitigation Plan |
|------------|--------|-----------------|
| Single-user only | No team collaboration | Phase 2: Team workspaces |
| Windows-primary | Limited macOS/Linux testing | Expand cross-platform support |
| No cloud sync | Workflows locked to device | Phase 3: Optional cloud backup |
| Video files large | Storage constraints | Implement video compression settings |

### 11.2 Future Enhancements

1. **Agent Marketplace** (Q4 2025)
   - Community-contributed agents
   - Rating and review system
   - Paid premium agents

2. **Team Collaboration** (Q1 2026)
   - Shared workspace
   - Real-time collaboration
   - Workflow templates library

3. **Mobile Companion App** (Q2 2026)
   - Workflow monitoring
   - Remote execution triggers
   - Notification system

4. **Advanced Analytics** (Q3 2026)
   - Workflow performance insights
   - Cost tracking (Claude API usage)
   - ROI calculator

---

## 12. Appendices

### 12.1 Glossary

- **Agent**: Autonomous unit that performs specific tasks using Claude AI
- **Workflow**: Sequence of agent executions to accomplish a goal
- **Computer Use API**: Anthropic's API for AI-driven desktop UI control
- **FTS5**: SQLite Full-Text Search extension version 5
- **IPC**: Inter-Process Communication (Electron main ↔ renderer)
- **Puppeteer**: Node library for browser automation via Chrome DevTools Protocol

### 12.2 Reference Documentation

- Electron Docs: https://www.electronjs.org/docs
- Anthropic Claude API: https://docs.anthropic.com
- React Flow: https://reactflow.dev/api-reference
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
- Puppeteer: https://pptr.dev
- Next.js: https://nextjs.org/docs

---

*TRD v1.0 - Technical foundation for AI Agentic Desktop Tool*
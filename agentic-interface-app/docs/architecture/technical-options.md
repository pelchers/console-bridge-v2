# Technical Options & Decision Rationale

## Overview

This document provides the research context behind every technical decision made for the AI Agentic Desktop Tool. Each section presents the options considered, their trade-offs, and the final recommendation with justification.

---

## 1. Desktop Framework: Electron vs Tauri

### Options Considered

#### Option A: Electron
**Pros:**
- Bundled Chromium provides consistent rendering across all platforms
- Native Puppeteer integration via puppeteer-in-electron
- Massive ecosystem (118.5k GitHub stars)
- Powers VS Code, Slack, Discord, Figma
- Excellent documentation and community support
- electron-builder for easy cross-platform packaging
- electron-updater for automatic updates

**Cons:**
- Large bundle size: 80-120 MB installers
- Memory usage: 200-300 MB at idle
- Startup time: 1-2 seconds
- Ships full Chromium engine with every app

#### Option B: Tauri
**Pros:**
- Tiny bundle size: 3-10 MB installers
- Low memory: 30-40 MB at idle
- Fast startup: <500ms
- Rust backend provides excellent security
- System webview (no bundled browser)
- Growing community (97.1k GitHub stars)

**Cons:**
- **CRITICAL**: System webview incompatible with Puppeteer
- WebKit on macOS/Linux, WebView2 on Windows (inconsistent)
- Would require bundling Chrome separately (negates size advantage)
- Smaller ecosystem, fewer production examples
- Complex IPC for browser automation

### Decision: **Electron**

**Rationale:**
The application's core functionality depends on seamless browser automation through Puppeteer. Electron's bundled Chromium shares the same rendering engine as Puppeteer, enabling native integration via the Chrome DevTools Protocol. Tauri's system webview approach would require:

1. Bundling Chrome as a sidecar binary (+100MB)
2. Managing separate processes for webview and Chrome
3. Complex IPC between Tauri and external Chrome instance
4. Maintaining Chrome version compatibility manually

This negates Tauri's primary advantages (small size, low memory) while adding significant complexity. For an automation-focused application, **Electron's 80-120 MB bundle represents necessary overhead**, not bloat.

**Production validation**: Thousands of commercial applications ship with Electron versus hundreds with Tauri, providing extensive resources for troubleshooting browser automation workflows.

---

## 2. Browser Automation: Puppeteer vs Playwright

### Options Considered

#### Option A: Puppeteer
**Pros:**
- Native Electron integration via puppeteer-in-electron
- Chrome DevTools Protocol (CDP) access
- 88k+ GitHub stars
- Automatic Chrome/Chromium download
- Excellent for Chrome-specific workflows
- Smaller API surface = easier to learn

**Cons:**
- Chrome/Chromium only (no Firefox/WebKit)
- Less cross-browser testing features
- Slower updates compared to Playwright

#### Option B: Playwright
**Pros:**
- Cross-browser: Chromium, Firefox, WebKit
- Better auto-waiting (reduces flaky tests)
- Superior screenshot compression
- Native video recording
- 13M weekly npm downloads
- Microsoft-backed active development
- Better debugging tools

**Cons:**
- Requires separate packages for each browser
- Larger installation size
- More complex API
- Less direct Electron integration

### Decision: **Puppeteer (Primary)** with Playwright as optional

**Rationale:**
Since we're already committed to Electron (Chromium-based), cross-browser support isn't a priority. Puppeteer's native Electron integration through puppeteer-in-electron provides:

- Seamless BrowserWindow control
- Shared DevTools Protocol
- Smaller dependency footprint
- Proven production patterns for Electron apps

**Recommendation**: Start with Puppeteer for MVP. If users request Firefox/WebKit automation, Playwright can be added as an optional module since both tools can coexist in the same project.

---

## 3. Desktop Automation: Claude Computer Use vs Traditional Tools

### Options Considered

#### Option A: Claude Computer Use API (Primary)
**Pros:**
- AI-powered understanding of UI elements
- Natural language control ("click the submit button")
- Cross-platform (Windows, macOS, Linux)
- Integrated with Claude Agent SDK
- Automatic adaptation to UI changes
- Screenshots + actions in single API

**Cons:**
- Beta feature (released 2025)
- Costs vision pricing for screenshots
- Requires 1280x800 or lower resolution
- 735 tokens overhead per request
- Requires explicit user consent

#### Option B: Nut.js (Fallback)
**Pros:**
- Node.js native desktop control library
- Cross-platform (Windows, macOS, Linux)
- Mouse, keyboard, window management
- Image-based UI element finding
- Screen capture capabilities
- Active development

**Cons:**
- Steeper learning curve than browser automation
- Image recognition can be unreliable
- Requires manual coordinate calculation
- Less intelligent than AI-powered control

#### Option C: Robot Framework + AutoIt (Windows-specific)
**Pros:**
- Mature, battle-tested automation
- Excellent Windows GUI automation
- Keyword-driven testing approach
- Large plugin ecosystem

**Cons:**
- Python-based (adds runtime dependency)
- Windows-only for AutoIt
- More complex setup
- Overkill for simple desktop tasks

### Decision: **Claude Computer Use API (Primary)** with Nut.js as fallback

**Rationale:**
Claude Computer Use API represents a paradigm shift in desktop automation:

1. **Natural Language Control**: Users describe actions, AI figures out how
2. **Adaptive**: Automatically adjusts to UI changes without brittle selectors
3. **Integrated**: Works seamlessly with Claude Agent SDK
4. **Future-Proof**: As the API matures, accuracy will improve

For tasks where Computer Use API isn't ideal (low-latency, high-frequency actions), Nut.js provides traditional programmatic control. This hybrid approach maximizes capability while maintaining reliability.

**Cost consideration**: Computer Use adds ~$0.003 per screenshot (1280x800 at vision pricing). For typical workflows with 10-20 screenshots, this is $0.03-0.06 per execution—acceptable for a premium tool.

---

## 4. Screen Recording: Electron desktopCapturer vs Third-Party Libraries

### Options Considered

#### Option A: Electron desktopCapturer API (Native)
**Pros:**
- Built into Electron (no external dependencies)
- Cross-platform support
- Enumerate screens and windows with previews
- MediaStream integration for recording
- Access to all visible content
- Respects OS permissions

**Cons:**
- Requires FFmpeg for encoding
- Need to implement recording logic
- Manual stream handling

#### Option B: electron-screen-recorder (npm package)
**Pros:**
- Simplified API
- Handles encoding automatically
- Less boilerplate code

**Cons:**
- Additional dependency
- Less control over encoding settings
- May not support all platforms
- Maintenance risk if abandoned

#### Option C: recordrtc (Web-based recording)
**Pros:**
- Works in browser context
- No native dependencies
- Easy to implement

**Cons:**
- Limited format support
- Performance issues with long recordings
- Browser API limitations

### Decision: **Electron desktopCapturer + FFmpeg (fluent-ffmpeg)**

**Rationale:**
Native Electron APIs provide the most reliable, performant solution with maximum control over recording quality and format. The implementation pattern:

1. `desktopCapturer.getSources()` - Enumerate windows/screens
2. `getUserMedia()` - Capture MediaStream
3. `MediaRecorder` - Record chunks
4. `fluent-ffmpeg` - Encode to H.264 MP4

**Encoding settings** for optimal balance:
```javascript
ffmpeg()
  .input(rawStream)
  .videoCodec('libx264')
  .outputOptions([
    '-preset medium',
    '-crf 23',
    '-movflags +faststart'
  ])
  .format('mp4')
```

This produces ~10MB/minute at 1080p 30fps with universal device compatibility.

---

## 5. Local Storage: SQLite vs IndexedDB vs LevelDB

### Options Considered

#### Option A: SQLite (better-sqlite3)
**Pros:**
- Relational database with SQL queries
- FTS5 full-text search built-in
- ACID-compliant transactions
- Zero configuration
- Single file storage
- Excellent performance in Electron main process
- 10+ million downloads/week

**Cons:**
- Requires native compilation
- Larger dependency than key-value stores

#### Option B: IndexedDB
**Pros:**
- Native browser API (no dependencies)
- Asynchronous operations
- Good for renderer process
- Large storage limits

**Cons:**
- No full-text search
- More complex API than SQL
- Limited query capabilities
- Difficult to debug

#### Option C: LevelDB (level package)
**Pros:**
- Fast key-value store
- Lightweight
- Good for simple data
- Used by Chrome internally

**Cons:**
- No relations or complex queries
- No full-text search
- Requires building indexes manually
- Not designed for structured data

### Decision: **SQLite via better-sqlite3**

**Rationale:**
Workflow management requires:
- **Relational data**: Workflows → Agents → Files → Steps
- **Full-text search**: Find workflows by content, tags, descriptions
- **Complex queries**: Filter by date, agent, status, duration
- **Transactions**: Ensure data consistency during workflow saves

SQLite with FTS5 provides all of this in a battle-tested package with zero configuration. The database file sits at `app.getPath('userData')/database.sqlite` and automatically handles:

- Porter stemming for search
- Boolean operators (AND, OR, NOT)
- Relevance ranking
- Phrase matching

**Performance note**: SQLite in Electron's main process outperforms IndexedDB in renderer process, especially for write-heavy workflows.

---

## 6. State Management: Zustand vs Redux Toolkit vs Jotai

### Options Considered

#### Option A: Zustand
**Pros:**
- Tiny bundle: 3KB
- Hook-based API (no boilerplate)
- Works outside React components
- Middleware for persistence, devtools
- Slice pattern for organization
- Can use outside React (Electron main process)

**Cons:**
- Less opinionated (requires structure decisions)
- Fewer built-in features than Redux

#### Option B: Redux Toolkit
**Pros:**
- Industry standard
- Excellent DevTools
- Time-travel debugging
- Strict conventions prevent mistakes
- Large ecosystem

**Cons:**
- 8KB bundle size
- More boilerplate than Zustand
- Steeper learning curve
- Overhead for simple state

#### Option C: Jotai
**Pros:**
- Atomic state model
- Fine-grained reactivity
- Excellent for derived state
- TypeScript-first

**Cons:**
- Different mental model (atoms vs stores)
- Less intuitive for beginners
- Newer (less production examples)

### Decision: **Zustand**

**Rationale:**
For a desktop application managing workflow graphs with dozens of nodes and connections, Zustand provides the optimal balance:

1. **Minimal boilerplate**: Define stores in minutes, not hours
2. **Performance**: Granular selectors prevent unnecessary re-renders
3. **Flexibility**: Access state from Electron main process for file operations
4. **Size**: 3KB vs 8KB for Redux (matters less in Electron, but still good)

**Store structure example:**
```typescript
// Workflow graph store
const useWorkflowStore = create((set) => ({
  nodes: [],
  edges: [],
  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node] 
  })),
  // ...
}))

// UI state store
const useUIStore = create((set) => ({
  leftSidebarVisible: true,
  rightSidebarVisible: true,
  centerView: 'actions',
  // ...
}))
```

**Why not Redux?** The strict conventions add cognitive overhead without providing value for this use case. Zustand's simpler API accelerates development without sacrificing capability.

**Why not Jotai?** The atomic model excels for complex derived state (form validation, interdependent calculations) but adds unnecessary abstraction for straightforward workflow state management.

---

## 7. Workflow Visualization: React Flow vs Custom Canvas

### Options Considered

#### Option A: React Flow
**Pros:**
- 30.8k GitHub stars
- 1.86M weekly npm installs
- Used by Stripe, Typeform in production
- Drag-and-drop node editor built-in
- Pan, zoom, connection logic handled
- Nodes are React components
- Excellent TypeScript support
- MiniMap, Controls, Background components
- Commercial Pro templates available

**Cons:**
- Learning curve for customization
- Pro features require paid license

#### Option B: Custom Canvas Implementation
**Pros:**
- Full control over every pixel
- No external dependencies
- Exact match to design vision
- No licensing costs

**Cons:**
- **Weeks to months of development time**
- Must implement: pan, zoom, connections, collision detection
- Accessibility requires custom implementation
- Touch support requires custom implementation
- Mobile support requires custom implementation
- High bug surface area

#### Option C: D3.js Force Layout
**Pros:**
- Powerful visualization library
- Physics-based automatic layouts
- Flexible and customizable

**Cons:**
- Steep learning curve
- Not designed for interactive node editors
- Requires significant custom code for CRUD operations
- Overkill for workflow builder

### Decision: **React Flow**

**Rationale:**
React Flow has become the de facto standard for visual programming interfaces in 2025. The 1.86 million weekly installs and adoption by major SaaS companies validates production readiness.

**Key advantages for this project:**
1. **n8n-style workflows**: React Flow's node system matches the desired UX
2. **React components as nodes**: Each agent type can be a custom component
3. **Built-in interactions**: Pan/zoom/connect work out of the box
4. **Time-to-market**: Weeks saved vs custom implementation

**Cost consideration**: Basic features are MIT-licensed (free). Pro features ($500/year for commercial use) include:
- Advanced layouts (tree, hierarchy)
- Minimap enhancements
- Better performance for 1000+ nodes

For MVP, free tier is sufficient. Pro license makes sense once product generates revenue.

**Comparison to n8n**: n8n actually uses a custom Vue canvas implementation, but React Flow provides equivalent functionality with better React ecosystem integration.

---

## 8. Authentication: BetterAuth vs Clerk vs Auth.js

### Options Considered

#### Option A: BetterAuth
**Pros:**
- TypeScript-first design
- Self-hosted (full control)
- MIT license (free)
- Now maintains Auth.js
- Database-backed sessions
- Plugin architecture
- Framework-agnostic
- Works with Electron

**Cons:**
- Requires database setup
- Manual OAuth provider configuration
- No built-in UI components
- More setup than managed solutions

#### Option B: Clerk (Used in reference video)
**Pros:**
- Fastest implementation (<5 minutes)
- Beautiful pre-built UI components
- Subscription management built-in
- Admin dashboard
- Webhooks for events
- Excellent documentation

**Cons:**
- **$550/month for 10k Business users**
- Vendor lock-in concerns
- Data stored on Clerk's servers
- Less flexible for custom flows

#### Option C: Auth.js (formerly NextAuth.js)
**Pros:**
- Proven reliability (millions of sites)
- Stateless JWT support
- Many OAuth providers built-in
- Good Next.js integration

**Cons:**
- More configuration than BetterAuth
- No built-in subscription management
- Some legacy patterns from Next.js pages router

### Decision: **BetterAuth (Desktop)** + **Clerk (Web Platform - matching video)**

**Rationale:**

**For Desktop App:**
BetterAuth provides the flexibility needed for desktop authentication:
- **Self-hosted**: No monthly per-user fees as user base grows
- **Full control**: Customize OAuth flows for desktop redirect URIs
- **Security**: Sessions stored in local database with OS-level encryption
- **Cost**: $0/month vs $550+/month for Clerk Business

**For Web Platform:**
Match the reference video's stack (Clerk) because:
- Already implemented in tutorial code
- Faster initial deployment
- Built-in subscription UI
- Can migrate to BetterAuth later if costs become prohibitive

**Migration path**: Once user base justifies it, migrate web platform from Clerk to BetterAuth using their shared session management standards.

**OAuth PKCE for Desktop:**
Desktop apps require PKCE (Proof Key for Code Exchange) since client secrets can't be kept secret:

```typescript
// Generate code verifier
const verifier = generateRandomString(128)
// Generate code challenge
const challenge = await sha256(verifier)
// OAuth flow with challenge
const authUrl = `${provider}/auth?code_challenge=${challenge}&...`
```

Electron handles the custom protocol (`myapp://auth/callback`) via `app.setAsDefaultProtocolClient()`.

---

## 9. Web Platform Stack Alignment

### Reference Video Stack Analysis

**From JavaScript Mastery Tutorial** (Adrian Hajdin):
- **Framework**: Next.js 15+ with App Router
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Clerk
- **Payments**: Stripe (subscriptions, customer portal)
- **UI**: shadcn/ui + Tailwind CSS
- **Validation**: Zod
- **Monitoring**: Sentry
- **Deployment**: Vercel

### Why This Stack Works

**Next.js 15 + App Router**
- Server components reduce client-side JavaScript
- API routes for serverless functions
- Edge runtime for fast license validation
- Built-in SEO optimization

**Supabase**
- Real-time subscriptions (webhook → DB → desktop app)
- Row-Level Security for user data isolation
- Generous free tier (50,000 monthly active users)
- PostgREST auto-generated APIs

**Stripe Integration Pattern**
1. **Webhooks** trigger on subscription events
2. **API route** (`/api/webhooks/stripe`) validates signature
3. **Supabase** stores subscription status
4. **Desktop app** polls subscription endpoint every 5 minutes

**shadcn/ui**
- Copy/paste components (not npm dependency)
- Full customization (unlike component libraries)
- Tailwind-based (consistent styling)
- Accessible by default (Radix UI primitives)

### Decision: **Match Video Stack for Web Platform**

**Rationale:**
1. **Proven pattern**: Tutorial already implements subscription logic
2. **Time-saving**: Don't reinvent the wheel
3. **Documentation**: Video provides step-by-step guidance
4. **Upgrade path**: Can swap Clerk → BetterAuth later without changing architecture

**Subscription Flow:**
```
User subscribes (Stripe) 
→ Webhook fired 
→ Next.js API route validates 
→ Supabase DB updated 
→ Desktop app polls /api/license/validate 
→ Local cache updated 
→ Features ungated
```

**Offline grace period**: 30 days (matching Microsoft 365 pattern)

---

## 10. Video Playback: react-player vs Video.js

### Options Considered

#### Option A: react-player
**Pros:**
- Simple API
- Supports multiple platforms (YouTube, Vimeo, local files)
- 9.1k GitHub stars
- Unified interface across sources
- Lightweight
- Good for basic playback needs

**Cons:**
- Limited custom UI controls
- Basic feature set
- Less suitable for advanced needs

#### Option B: Video.js
**Pros:**
- Industry standard (30k+ stars)
- Highly customizable UI
- Plugin ecosystem
- Adaptive streaming support
- DRM support
- Advanced features: quality selector, speed controls
- Excellent accessibility

**Cons:**
- Larger bundle size
- More complex setup
- Overkill for simple playback

#### Option C: HTML5 <video> + Custom Controls
**Pros:**
- Zero dependencies
- Full control
- Smallest bundle

**Cons:**
- Must implement all controls manually
- Accessibility requires work
- Cross-browser compatibility issues

### Decision: **react-player (Primary)** with Video.js option

**Rationale:**

For MVP, react-player provides everything needed:
- Local MP4 playback
- Progress tracking (sync with workflow logs)
- Simple API: `<ReactPlayer url="file.mp4" onProgress={handleProgress} />`
- Minimal bundle impact

**When to upgrade to Video.js:**
- Users request frame-by-frame navigation
- Need custom UI to match app design
- Want advanced features (playback speed, quality selection)
- Require accessibility beyond basic HTML5 video

**Encoding strategy** ensures compatibility:
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset medium \
  -crf 23 \
  -movflags +faststart \
  output.mp4
```

The `-movflags +faststart` moves metadata to file start, enabling immediate playback without buffering entire file.

---

## 11. Multi-Panel Layout: react-resizable-panels vs react-split-pane

### Options Considered

#### Option A: react-resizable-panels (Brian Vaughn - React core team)
**Pros:**
- Zero dependencies
- Created by React core team member
- Keyboard, mouse, touch support
- Persistent layouts via `autoSaveId`
- Percentage-based sizing
- Nested panels supported
- Excellent TypeScript support
- Active maintenance

**Cons:**
- Newer library (less battle-tested than alternatives)

#### Option B: react-split-pane
**Pros:**
- Mature library (7+ years)
- Simple API
- Widely used

**Cons:**
- Less active maintenance
- No built-in persistence
- More complex styling
- Pixel-based sizing (less responsive)

#### Option C: Custom Implementation with CSS Grid
**Pros:**
- No dependencies
- Full control
- Modern CSS approach

**Cons:**
- Must implement resize logic
- Touch support requires work
- Persistence requires custom code
- High development time

### Decision: **react-resizable-panels**

**Rationale:**
Brian Vaughn (creator of React DevTools and Profiler) built this library with production-grade quality. The automatic persistence and percentage-based sizing provide the IDE-like experience desired:

```typescript
<PanelGroup direction="horizontal" autoSaveId="main-layout">
  <Panel defaultSize={20} minSize={15} maxSize={30}>
    {/* Left sidebar: Workflow history */}
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={60}>
    {/* Center: Actions viewer */}
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={20} minSize={15} maxSize={30}>
    {/* Right sidebar: Agent builder */}
  </Panel>
</PanelGroup>
```

The `autoSaveId` persists panel sizes to localStorage, so users' layouts survive app restarts.

**Nested panels example** (for workflow detail view):
```typescript
<PanelGroup direction="vertical">
  <Panel defaultSize={60}>
    {/* Video player */}
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={40}>
    <PanelGroup direction="horizontal">
      <Panel>
        {/* Markdown viewer */}
      </Panel>
      <PanelResizeHandle />
      <Panel>
        {/* Workflow info form */}
      </Panel>
    </PanelGroup>
  </Panel>
</PanelGroup>
```

---

## 12. Modal Management: nice-modal-react vs Headless UI

### Options Considered

#### Option A: nice-modal-react (eBay)
**Pros:**
- Imperative API (no JSX clutter)
- Promise-based (await modal results)
- Global registry pattern
- 2KB bundle size
- Zustand integration
- Sequential modal workflows

**Cons:**
- Less popular than alternatives
- Requires understanding of registry pattern

#### Option B: Headless UI (Tailwind Labs)
**Pros:**
- Official Tailwind companion
- Excellent accessibility
- Unstyled (full control)
- Large community
- React + Vue support

**Cons:**
- Declarative only (modals in JSX tree)
- No global state management
- Requires custom show/hide logic
- More boilerplate

#### Option C: Radix UI Dialog
**Pros:**
- Part of shadcn/ui ecosystem
- Excellent accessibility
- Unstyled primitives
- Compound component pattern

**Cons:**
- Similar cons to Headless UI
- Declarative only
- Must manage state per modal

### Decision: **nice-modal-react**

**Rationale:**
The agent builder workflow requires sequential modals:

1. User clicks "Create Agent"
2. Modal: "Choose creation method" (Manual/AI-Assisted)
3. If AI-Assisted → Modal: "Describe your agent"
4. Modal: "Review generated agent"
5. Modal: "Name and save agent"

nice-modal-react handles this elegantly:

```typescript
// Imperative API
const result = await NiceModal.show(ChooseMethodModal)
if (result === 'ai-assisted') {
  const description = await NiceModal.show(DescribeAgentModal)
  const agent = await generateAgent(description)
  const reviewed = await NiceModal.show(ReviewAgentModal, { agent })
  if (reviewed) {
    await NiceModal.show(SaveAgentModal, { agent })
  }
}
```

Compare to declarative approach (Headless UI):
```typescript
// Requires managing 4 separate boolean states + data passing
const [showChoose, setShowChoose] = useState(false)
const [showDescribe, setShowDescribe] = useState(false)
const [showReview, setShowReview] = useState(false)
const [showSave, setShowSave] = useState(false)
// ...messy state management
```

**Zustand integration** prevents re-renders:
```typescript
import NiceModal from '@ebay/nice-modal-react'
import { create } from 'zustand'

// Modals don't trigger parent re-renders
NiceModal.register('agent-builder', AgentBuilderModal)
```

---

## 13. File Encoding for Workflow Exports

### Options Considered

#### Option A: Base64 Encoding (For Media Files)
**Pros:**
- Self-contained JSON
- No external file dependencies
- Easy to share single file

**Cons:**
- 33% size increase
- Large files = slow JSON parsing
- Not suitable for long videos

#### Option B: External File References + ZIP
**Pros:**
- Efficient for large media
- Standard archive format
- Cross-platform support
- Can include directory structure

**Cons:**
- Requires archiving library (JSZip)
- Multiple files to manage
- Users must extract before viewing

#### Option C: Hybrid Approach
**Pros:**
- Small files: Base64 in JSON
- Large files: External with references
- Best of both worlds

**Cons:**
- More complex implementation
- Conditional logic needed

### Decision: **Hybrid Approach**

**Rationale:**
Optimize for different use cases:

**For workflows <5 minutes** (video <50MB):
```json
{
  "workflow": {
    "id": "wf-123",
    "video": "data:video/mp4;base64,AAAIGZ0...",
    "markdown": "# Workflow Log\n...",
    "metadata": {...}
  }
}
```

**For workflows >5 minutes** (video >50MB):
```json
{
  "workflow": {
    "id": "wf-123",
    "videoRef": "./media/recording.mp4",
    "markdown": "# Workflow Log\n...",
    "metadata": {...}
  },
  "_archive": true
}
```

Then create ZIP:
```
workflow-wf-123.zip
├── workflow.json
└── media/
    └── recording.mp4
```

**Implementation using JSZip:**
```typescript
import JSZip from 'jszip'

const zip = new JSZip()
zip.file('workflow.json', JSON.stringify(workflow))
zip.file('media/recording.mp4', videoBlob)

const blob = await zip.generateAsync({ type: 'blob' })
// Save or share ZIP file
```

---

## 14. Licensing & Distribution

### Software Licensing Options

#### Option A: Proprietary Closed-Source
**Characteristics:**
- Full copyright protection
- No source code distribution
- License keys control access
- Can prevent reverse engineering

**Implementation:**
- Code obfuscation
- License key validation
- Online activation
- EULA with restrictions

#### Option B: Open Source (GPL/MIT/Apache)
**Characteristics:**
- Source code public
- Free to modify and redistribute
- Community contributions
- Can't restrict usage

**Not suitable** for this project per requirements: "fully restrictive: no duplication or modification or redistribution"

### Decision: **Proprietary Closed-Source with License Key System**

**Rationale:**
Per requirements, the license must be "fully restrictive." This requires:

1. **No source code access**: Distribute compiled/packaged app only
2. **License key validation**: Online + offline grace period
3. **EULA enforcement**: Legal terms prevent redistribution
4. **Code signing**: Prevent tampering

**License Enforcement Implementation:**

```typescript
// License validation flow
class LicenseManager {
  async validate(): Promise<boolean> {
    // 1. Check local cache (encrypted)
    const cached = await this.getCachedLicense()
    if (cached && !this.isExpired(cached)) {
      return true
    }

    // 2. Online validation (if internet available)
    try {
      const valid = await this.validateOnline()
      await this.cacheLicense(valid)
      return valid
    } catch (err) {
      // 3. Offline grace period (30 days)
      return this.checkGracePeriod(cached)
    }
  }

  private async validateOnline(): Promise<boolean> {
    const response = await fetch('https://api.yourapp.com/license/validate', {
      method: 'POST',
      body: JSON.stringify({
        key: this.licenseKey,
        machineId: await this.getMachineFingerprint()
      })
    })
    return response.ok
  }
}
```

**Device fingerprinting** prevents unlimited activations:
```typescript
import { machineIdSync } from 'node-machine-id'

const fingerprint = machineIdSync()
// Unique per machine, persists across reboots
```

**Code signing** prevents tampering:
- Windows: Authenticode certificate ($99-400/year)
- macOS: Apple Developer certificate ($99/year)
- Electron-builder handles signing automatically

---

## 15. Cost Analysis: User-Owned API Keys vs Hosted

### Options Considered

#### Option A: User Provides Own Claude API Key
**Pros:**
- Zero ongoing API costs for us
- Users pay for what they use
- Scales infinitely without cost increase
- No rate limit management
- Users get full API benefits (prompt caching, etc.)

**Cons:**
- Friction in onboarding (users must get API key)
- Users need Anthropic account
- Support burden for API issues
- Can't pre-optimize prompts at scale

#### Option B: We Host Claude API (Proxy)
**Pros:**
- Smoother onboarding
- Can add markup to cover costs
- Control over rate limits
- Central monitoring

**Cons:**
- **Massive ongoing costs**
- Must manage rate limits across users
- Liability for API abuse
- Requires sophisticated usage tracking
- Scaling costs unpredictable

### Decision: **User Provides Own Claude API Key**

**Rationale:**

**Cost comparison** (assuming 10,000 active users):

**User-Owned Keys:**
- Our cost: $0/month
- User cost: ~$10-50/month per user (varies by usage)
- Total market cost: $100k-500k/month (distributed)

**Hosted API:**
- Our cost: $100k-500k/month
- Must charge users $15-75/month to break even
- Additional infrastructure costs
- Risk of abuse amplifies costs

**Benefits of user-owned keys:**
1. **Transparent pricing**: Users see exactly what they pay Anthropic
2. **No markup**: We don't need to add margin to API costs
3. **Unlimited usage**: No artificial rate limits from us
4. **Prompt caching**: Users get 90% cost reduction automatically
5. **Tier progression**: Users automatically upgrade tiers as they scale

**Onboarding flow:**
```
1. User signs up (email + payment)
2. Subscription activated
3. Prompt: "Enter your Claude API key" with link to Anthropic
4. Key stored encrypted (Electron safeStorage)
5. App unlocked
```

**Secure storage** using Electron:
```typescript
import { safeStorage } from 'electron'

// Store API key
const encrypted = safeStorage.encryptString(apiKey)
await store.set('claudeApiKey', encrypted.toString('base64'))

// Retrieve API key
const encryptedBuffer = Buffer.from(storedKey, 'base64')
const apiKey = safeStorage.decryptString(encryptedBuffer)
```

This uses:
- **macOS**: Keychain
- **Windows**: DPAPI (Data Protection API)
- **Linux**: libsecret

---

## 16. Deployment & Updates

### Update Mechanisms

#### Option A: electron-updater (Recommended)
**Pros:**
- Built for Electron
- GitHub Releases integration
- Differential updates (only changed files)
- Code signing verification
- Auto-restart option
- Cross-platform

**Cons:**
- Requires GitHub Releases or S3
- Initial setup complexity

#### Option B: Squirrel.Windows / Squirrel.Mac
**Pros:**
- Native platform updates
- Battle-tested

**Cons:**
- Separate implementation per platform
- More complex than electron-updater

#### Option C: Manual Updates
**Pros:**
- Simple implementation
- Full control

**Cons:**
- Poor UX
- Users forget to update
- Security vulnerabilities persist

### Decision: **electron-updater with GitHub Releases**

**Rationale:**
electron-updater provides production-grade auto-updates with minimal setup:

```typescript
import { autoUpdater } from 'electron-updater'

// Check for updates on launch
autoUpdater.checkForUpdatesAndNotify()

// Configure
autoUpdater.autoDownload = false // Prompt user first
autoUpdater.autoInstallOnAppQuit = true

// Events
autoUpdater.on('update-available', (info) => {
  // Show notification to user
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `Version ${info.version} is available. Download now?`,
    buttons: ['Yes', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate()
    }
  })
})
```

**Release process:**
1. Tag version: `git tag v1.2.3`
2. Push: `git push --tags`
3. GitHub Actions builds installers
4. electron-builder uploads to GitHub Releases
5. electron-updater checks for new versions
6. Users notified automatically

**Code signing** ensures updates aren't tampered with:
- Windows: Must have Authenticode certificate
- macOS: Must have Apple Developer certificate
- Linux: No signing required (but recommended)

---

## Summary of Key Decisions

| Category | Decision | Primary Rationale |
|----------|----------|-------------------|
| **Desktop Framework** | Electron | Native Chromium for Puppeteer integration |
| **Browser Automation** | Puppeteer | Seamless Electron integration |
| **Desktop Automation** | Claude Computer Use API | AI-powered, adaptive UI control |
| **Screen Recording** | desktopCapturer + FFmpeg | Native API, maximum control |
| **Local Database** | SQLite (better-sqlite3) | FTS5 search, SQL queries, zero-config |
| **State Management** | Zustand | Minimal boilerplate, 3KB bundle |
| **Workflow Visualization** | React Flow | Industry standard, 1.86M installs/week |
| **Multi-Panel Layout** | react-resizable-panels | React core team, persistent layouts |
| **Modal Management** | nice-modal-react | Imperative API, sequential workflows |
| **Video Playback** | react-player | Simple API, sufficient for MVP |
| **Authentication (Desktop)** | BetterAuth | Self-hosted, no per-user fees |
| **Authentication (Web)** | Clerk | Matches reference video stack |
| **Web Framework** | Next.js 15+ | Matches reference video stack |
| **Web Database** | Supabase | Matches reference video stack |
| **Payments** | Stripe | Industry standard for SaaS |
| **API Key Strategy** | User-Owned | Zero ongoing API costs |
| **Licensing** | Proprietary + Key Validation | Per requirements (fully restrictive) |
| **Updates** | electron-updater | GitHub Releases, code signing |

---

## References & Resources

### Official Documentation
- **Electron**: https://www.electronjs.org/docs
- **Puppeteer**: https://pptr.dev
- **React Flow**: https://reactflow.dev
- **Anthropic Claude**: https://docs.anthropic.com
- **BetterAuth**: https://www.better-auth.com/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://docs.stripe.com
- **Next.js**: https://nextjs.org/docs

### Reference Implementation
- **Video Tutorial**: https://www.youtube.com/watch?v=TWQv_tr5ABI
- **GitHub Repo**: https://github.com/adrianhajdin/saas-app

### Comparison Articles
- Electron vs Tauri: https://www.gethopp.app/blog/tauri-vs-electron
- Puppeteer vs Playwright: https://blog.apify.com/playwright-vs-puppeteer/
- Zustand vs Redux: https://betterstack.com/community/guides/scaling-nodejs/zustand-vs-redux-toolkit-vs-jotai/

---

*This document captures the research and reasoning behind every technical decision. Use it as reference when making implementation choices or explaining architecture to stakeholders.*
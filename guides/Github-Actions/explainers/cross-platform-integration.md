# Cross-Platform Integration Guide

Comprehensive guide to using GitHub Actions across multiple platforms and interfaces seamlessly.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Platform Comparison](#platform-comparison)
3. [Integration Architecture](#integration-architecture)
4. [Platform-Specific Features](#platform-specific-features)
5. [Unified Workflows](#unified-workflows)
6. [Authentication Across Platforms](#authentication-across-platforms)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)

---

## Overview

### The Cross-Platform Ecosystem

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                  .github/workflows/*.yml                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Workflows stored centrally
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ GitHub Web   │    │ GitHub Mobile│    │  GitHub CLI  │
│              │    │              │    │              │
│ • Full UI    │    │ • Touch UI   │    │ • Commands   │
│ • Workflow   │    │ • Quick      │    │ • Scripts    │
│   editor     │    │   triggers   │    │ • Automation │
│ • Logs       │    │ • Status     │    │ • Monitoring │
│ • Artifacts  │    │ • Logs       │    │ • Downloads  │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│Claude Desktop│    │ Claude Code  │    │Claude Mobile │
│              │    │              │    │              │
│ • Guidance   │    │ • CLI        │    │ • Guidance   │
│ • Workflow   │    │   assistance │    │ • Quick help │
│   creation   │    │ • Command    │    │ • On-the-go  │
│ • Debugging  │    │   generation │    │   support    │
│ • Learning   │    │ • Automation │    │ • Voice input│
└──────────────┘    └──────────────┘    └──────────────┘
                            │
                            │
                            ▼
                ┌──────────────────────┐
                │   GitHub Actions     │
                │   Runner System      │
                └──────────────────────┘
```

### Platform Roles

**Primary Platforms (Direct Execution):**
- **GitHub Web** - Full-featured interface
- **GitHub Mobile** - On-the-go workflow management
- **GitHub CLI** - Command-line automation

**Assistant Platforms (Guidance & Automation):**
- **Claude Desktop** - AI-assisted workflow development
- **Claude Code** - CLI-integrated development
- **Claude Mobile** - Mobile AI assistance

---

## Platform Comparison

### Capabilities Matrix

| Capability | GitHub Web | GitHub Mobile | GitHub CLI | Claude Desktop | Claude Code | Claude Mobile |
|-----------|------------|---------------|------------|----------------|-------------|---------------|
| **Trigger workflows** | ✅ Full | ✅ Full | ✅ Full | ⚠️ Via guidance | ✅ Via commands | ⚠️ Via guidance |
| **View logs** | ✅ Full | ✅ Full | ✅ Full | ❌ | ✅ | ❌ |
| **Download artifacts** | ✅ Direct | ⚠️ Via browser | ✅ Direct | ❌ | ✅ Via CLI | ❌ |
| **Edit workflows** | ✅ Full editor | ❌ | ⚠️ Text editor | ✅ Generate code | ✅ Generate code | ✅ Generate code |
| **Monitor runs** | ✅ Real-time | ✅ Real-time | ✅ Real-time | ⚠️ Via web | ✅ Via CLI | ⚠️ Via web |
| **Debug failures** | ✅ Full logs | ✅ Full logs | ✅ Full logs | ✅ AI analysis | ✅ AI analysis | ✅ AI analysis |
| **Create workflows** | ✅ Via editor | ❌ | ⚠️ Via editor | ✅ AI-assisted | ✅ AI-assisted | ✅ AI-assisted |
| **Learning** | ⚠️ Via docs | ⚠️ Via docs | ⚠️ Via docs | ✅ Interactive | ✅ Interactive | ✅ Interactive |

Legend:
- ✅ Native support
- ⚠️ Partial/indirect support
- ❌ Not available

### Platform Strengths

**GitHub Web:**
- Complete workflow editor with syntax highlighting
- Full log viewer with search
- Artifact download with one click
- Comprehensive settings
- Visual workflow graph (for complex workflows)
- Ideal for: Initial setup, complex editing, detailed debugging

**GitHub Mobile:**
- Quick access anywhere
- Push notifications
- Touch-optimized UI
- Ideal for: Monitoring, quick triggers, on-call responses

**GitHub CLI:**
- Scriptable automation
- Fast command execution
- Batch operations
- Integration with shell scripts
- Ideal for: Automation, CI/CD pipelines, power users

**Claude Desktop:**
- Interactive learning
- Workflow generation
- Error explanation
- Best practices guidance
- Ideal for: Learning, complex workflow creation, debugging

**Claude Code:**
- Terminal-integrated assistance
- Command generation
- Script automation
- Ideal for: CLI workflows, developers who live in terminal

**Claude Mobile:**
- On-the-go AI assistance
- Voice input support
- Quick answers
- Ideal for: Quick help, mobile development, learning

---

## Integration Architecture

### Data Flow

```
User Action (Any Platform)
    │
    ▼
GitHub API / Web Interface
    │
    ▼
GitHub Actions Service
    │
    ▼
Workflow Execution
    │
    ▼
Results Storage
    │
    ├──────────┬──────────┬──────────┐
    ▼          ▼          ▼          ▼
  Logs    Artifacts   Status    Notifications
    │          │          │          │
    └──────────┴──────────┴──────────┘
              │
    Available on All Platforms
```

### API Layer

**All platforms ultimately use GitHub API:**

```javascript
// Web UI abstracts to buttons/forms
// Mobile app abstracts to touch interface
// CLI abstracts to commands
// Claude abstracts to natural language

// But all use GitHub API:
POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches
GET  /repos/{owner}/{repo}/actions/runs
GET  /repos/{owner}/{repo}/actions/runs/{run_id}
GET  /repos/{owner}/{repo}/actions/runs/{run_id}/logs
GET  /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts
```

### Authentication Flow

```
Platform → Authentication Method → GitHub API

GitHub Web → Browser cookies → API
GitHub Mobile → OAuth token → API
GitHub CLI → OAuth token (gh auth) → API
Claude Desktop → User→GitHub Web → API
Claude Code → GitHub CLI → API
Claude Mobile → User→GitHub Mobile → API
```

---

## Platform-Specific Features

### GitHub Web Exclusive

**Workflow Editor:**
- Syntax highlighting
- Auto-completion
- Error detection
- Inline documentation

**Visual Tools:**
- Dependency graph
- Matrix visualization
- Job relationships

**Settings:**
- Secrets management UI
- Environment configuration
- Runner group management

### GitHub Mobile Exclusive

**Push Notifications:**
```yaml
# Configure in GitHub Mobile app
Settings → Notifications → Workflow runs
- On failure
- On success
- On completion
```

**Quick Actions:**
- Long-press app icon for shortcuts
- Widget support (iOS)
- Quick access to recent repos

### GitHub CLI Exclusive

**Batch Operations:**
```bash
# List all failed runs
gh run list --status failure

# Rerun all failed runs
gh run list --status failure --json databaseId --jq '.[].databaseId' | \
  xargs -I {} gh run rerun {}

# Download all artifacts from last 5 runs
for id in $(gh run list --limit 5 --json databaseId --jq '.[].databaseId'); do
  gh run download $id --dir "artifacts/run-$id"
done
```

**Watch Mode:**
```bash
# Real-time monitoring
gh run watch

# Auto-refresh status
watch -n 5 'gh run list --limit 5'
```

### Claude Platforms Exclusive

**Natural Language:**
```
Instead of:
gh workflow run deploy.yml -f environment=production -f version=v2.0.0

Ask Claude:
"Deploy version 2.0.0 to production"

Claude generates the command for you.
```

**Contextual Understanding:**
```
"My workflow failed with 'npm: command not found'. How do I fix it?"

Claude:
1. Identifies the problem
2. Explains what it means
3. Provides the fix
4. Shows updated workflow
```

**Learning:**
```
Progressive questions:
1. "What is a workflow?"
2. "Show me an example"
3. "How do I trigger it?"
4. "What if it fails?"

Claude adapts explanations to your level.
```

---

## Unified Workflows

### Design for All Platforms

**Principle: Make workflows accessible from anywhere**

**1. Always Include Manual Trigger:**
```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:  # ← Essential for all platforms
    inputs:
      # Clear, descriptive inputs
      environment:
        description: 'Target environment'
        type: choice
        options: [dev, staging, prod]
```

**Why:** Enables testing from any platform

**2. Descriptive Names:**
```yaml
name: Deploy to Production  # ✅ Clear

# Not:
name: deploy  # ❌ Too vague
```

**Why:** Easy to find in mobile UI, clear in notifications

**3. Clear Input Descriptions:**
```yaml
inputs:
  version:
    description: 'Version to deploy (e.g., v1.2.3 or "latest")'
    required: true
    default: 'latest'
```

**Why:** Self-documenting on all platforms

**4. Comprehensive Summaries:**
```yaml
steps:
  - name: Create summary
    run: |
      echo "## Deployment Summary" >> $GITHUB_STEP_SUMMARY
      echo "" >> $GITHUB_STEP_SUMMARY
      echo "- **Environment**: ${{ inputs.environment }}" >> $GITHUB_STEP_SUMMARY
      echo "- **Version**: ${{ inputs.version }}" >> $GITHUB_STEP_SUMMARY
      echo "- **Status**: Successful" >> $GITHUB_STEP_SUMMARY
```

**Why:** Readable summary on mobile, visible on web

### Multi-Platform Testing Pattern

**Test workflow from all platforms:**

```yaml
name: Platform Integration Test

on:
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform used to trigger'
        type: choice
        options:
          - github-web
          - github-mobile
          - github-cli
          - claude-desktop
          - claude-code
          - claude-mobile

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Report platform
        run: |
          echo "Triggered from: ${{ inputs.platform }}"
          echo "Trigger method: ${{ github.event_name }}"
          echo "Actor: ${{ github.actor }}"
          echo "Timestamp: $(date)"
      
      - name: Platform-specific check
        run: |
          case "${{ inputs.platform }}" in
            github-web)
              echo "✅ Web interface working"
              ;;
            github-mobile)
              echo "✅ Mobile app working"
              ;;
            github-cli)
              echo "✅ CLI working"
              ;;
            claude-*)
              echo "✅ Claude integration working"
              ;;
          esac
```

---

## Authentication Across Platforms

### Authentication Matrix

| Platform | Method | Scope | Duration |
|----------|--------|-------|----------|
| GitHub Web | Browser cookies | Repository | Session |
| GitHub Mobile | OAuth token | Read/Write | Refresh |
| GitHub CLI | OAuth token | Configurable | Refresh |
| Claude Desktop | User → GitHub Web | N/A | Via user |
| Claude Code | GitHub CLI | Via gh | Via gh |
| Claude Mobile | User → GitHub | N/A | Via user |

### Shared Authentication

**GitHub CLI as bridge:**

```bash
# Authenticate once
gh auth login

# CLI tools can now use it
gh workflow run deploy.yml

# Claude Code can leverage it
claude "trigger deploy workflow"
# (uses gh under the hood)
```

**Benefits:**
- Single sign-on experience
- Consistent permissions
- Token management handled by gh

### Security Considerations

**Per-platform security:**

1. **Web/Mobile:** 
   - Uses personal credentials
   - Full account access
   - Enable 2FA

2. **CLI:**
   - Token stored locally
   - Configurable scopes
   - Regenerate if compromised

3. **Claude:**
   - No direct GitHub access
   - Uses user's authentication
   - Acts as interface only

---

## Best Practices

### 1. Design for Mobile First

**Mobile-friendly workflows:**
```yaml
# ✅ Good for mobile
inputs:
  action:
    description: 'Action'
    type: choice  # Dropdown on mobile
    options: [deploy, rollback, test]

# ❌ Bad for mobile
inputs:
  options:
    description: 'Complex JSON configuration'
    type: string  # Hard to type on mobile
```

### 2. Provide CLI Commands

**Document CLI usage:**
```yaml
name: Deploy Application

# Usage:
# Web: Actions tab → Run workflow
# Mobile: Actions → Deploy Application → Run
# CLI: gh workflow run deploy.yml -f env=production

on:
  workflow_dispatch:
    inputs:
      env:
        description: 'Environment (production, staging, dev)'
        required: true
        type: choice
        options: [production, staging, dev]
```

### 3. Use Step Summaries

**Visible on all platforms:**
```yaml
- name: Deployment result
  run: |
    cat >> $GITHUB_STEP_SUMMARY << EOF
    ## Deployment Complete
    
    - Environment: ${{ inputs.env }}
    - Version: ${{ inputs.version }}
    - URL: https://${{ inputs.env }}.example.com
    
    ### Next Steps
    1. Verify deployment
    2. Run smoke tests
    3. Monitor logs
    EOF
```

### 4. Enable Notifications

**Configure for mobile alerts:**
- Repository → Settings → Notifications
- Enable workflow run notifications
- Test with a sample workflow

### 5. Consistent Naming

**Use same terminology everywhere:**
```yaml
# Workflow file name
deploy-production.yml

# Workflow name
name: Deploy to Production

# Job name
jobs:
  deploy-production:

# CLI command
gh workflow run deploy-production.yml
```

### 6. Platform-Agnostic Inputs

**Works well on all platforms:**
```yaml
inputs:
  # ✅ Choice: Easy on mobile
  environment:
    type: choice
    options: [dev, staging, prod]
  
  # ✅ Boolean: Checkbox on mobile
  dry_run:
    type: boolean
    default: false
  
  # ✅ Short string: Easy to type
  version:
    type: string
    default: 'latest'
  
  # ⚠️ Long string: Harder on mobile
  description:
    type: string
```

### 7. Quick Feedback

**Fast acknowledgment:**
```yaml
steps:
  - name: Starting
    run: |
      echo "🚀 Workflow started"
      echo "Platform: Mobile-friendly output"
```

---

## Common Patterns

### Pattern 1: Emergency Fix Flow

**From any platform → quick deployment**

```yaml
name: Emergency Fix

on:
  workflow_dispatch:
    inputs:
      description:
        description: 'What is being fixed?'
        required: true
      severity:
        description: 'Severity level'
        type: choice
        options: [critical, high, medium]

jobs:
  emergency-deploy:
    runs-on: ubuntu-latest
    environment: production  # Requires approval
    steps:
      - name: Alert team
        run: |
          echo "🚨 EMERGENCY FIX DEPLOYMENT"
          echo "Issue: ${{ inputs.description }}"
          echo "Severity: ${{ inputs.severity }}"
      
      - name: Deploy
        run: |
          # Quick deployment logic
          echo "Deploying emergency fix..."
```

**Usage:**
- **Mobile:** Quick trigger while on-call
- **Web:** Full details and monitoring
- **CLI:** Automated if needed
- **Claude:** Help with fix details

### Pattern 2: Multi-Stage Approval

**Web for approval, mobile for monitoring**

```yaml
name: Production Deployment

on:
  workflow_dispatch:
    inputs:
      version:
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]
  
  deploy-staging:
    needs: build
    environment: staging
    steps: [...]
  
  deploy-production:
    needs: deploy-staging
    environment: production  # Requires approval
    steps: [...]
```

**Flow:**
1. Trigger from mobile
2. Get approval notification
3. Approve on web (needs careful review)
4. Monitor completion on mobile

### Pattern 3: Automated Monitoring

**CLI watches, notifies mobile**

```bash
#!/bin/bash
# watch-deployments.sh

while true; do
  # Check for failures
  failures=$(gh run list --status failure --limit 1 --json conclusion)
  
  if [ -n "$failures" ]; then
    # Send mobile notification (via service)
    echo "Deployment failed! Check mobile app."
  fi
  
  sleep 60
done
```

### Pattern 4: Claude-Assisted Development

**Create on desktop, test on mobile**

1. **Claude Desktop:** "Create a deployment workflow with manual approval"
2. **Claude:** Generates complete workflow
3. **You:** Save to `.github/workflows/deploy.yml`
4. **You:** Commit and push
5. **Mobile:** Test trigger the workflow
6. **Mobile:** Monitor execution
7. **Desktop (if issues):** Ask Claude for fixes

---

## Integration Checklist

### For New Workflows

- [ ] Includes `workflow_dispatch` trigger
- [ ] Clear, descriptive name
- [ ] Well-documented inputs
- [ ] Choice inputs for mobile UX
- [ ] Step summaries for results
- [ ] CLI usage documented
- [ ] Tested on web
- [ ] Tested on mobile
- [ ] Tested via CLI
- [ ] Claude can explain it

### For Existing Workflows

- [ ] Add manual trigger if missing
- [ ] Improve input descriptions
- [ ] Add step summaries
- [ ] Document CLI commands
- [ ] Test cross-platform
- [ ] Update documentation

---

## 📚 Resources

- **GitHub CLI:** https://cli.github.com/
- **GitHub Mobile:** https://mobile.github.com/
- **GitHub API:** https://docs.github.com/rest/actions
- **Claude Documentation:** https://docs.claude.com/

---

**Last Updated:** October 3, 2025  
**Version:** 1.0

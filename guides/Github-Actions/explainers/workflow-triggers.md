# Workflow Triggers - Complete Reference

Comprehensive guide to all GitHub Actions trigger types, their behavior, and use cases.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Webhook Events](#webhook-events)
3. [Schedule Triggers](#schedule-triggers)
4. [Manual Triggers](#manual-triggers)
5. [Workflow Triggers](#workflow-triggers)
6. [Combining Triggers](#combining-triggers)
7. [Activity Types](#activity-types)
8. [Filters](#filters)
9. [Trigger Behavior](#trigger-behavior)
10. [Best Practices](#best-practices)

---

## Overview

### Trigger Types

GitHub Actions workflows can be triggered by:

1. **Webhook Events** - Repository activity (push, PR, issues, etc.)
2. **Schedule** - Time-based (cron)
3. **Manual** - User-initiated (workflow_dispatch, repository_dispatch)
4. **Workflow** - Other workflow completions (workflow_run, workflow_call)

### Basic Syntax

```yaml
name: My Workflow

on:
  # Single event
  push:
  
  # Multiple events
  [push, pull_request]
  
  # Event with configuration
  push:
    branches: [main]
    paths: ['src/**']
  
  # Schedule
  schedule:
    - cron: '0 0 * * *'
  
  # Manual
  workflow_dispatch:
```

---

## Webhook Events

### Push Event

**Triggers when commits are pushed**

**Basic:**
```yaml
on: push
```

**With branch filters:**
```yaml
on:
  push:
    branches:
      - main
      - 'releases/**'  # Glob pattern
    branches-ignore:
      - 'feature/**'
```

**With path filters:**
```yaml
on:
  push:
    paths:
      - 'src/**'
      - '**.js'
    paths-ignore:
      - 'docs/**'
      - '**.md'
```

**Combined:**
```yaml
on:
  push:
    branches: [main]
    paths: ['src/**', 'tests/**']
```

**Use cases:**
- Continuous Integration
- Automated testing
- Build automation
- Deployment to staging

### Pull Request Event

**Triggers on PR activity**

**Basic:**
```yaml
on: pull_request
```

**With activity types:**
```yaml
on:
  pull_request:
    types:
      - opened
      - synchronize  # New commits pushed
      - reopened
```

**All activity types:**
- `opened` - PR created
- `edited` - Title/body edited
- `closed` - PR closed (merged or not)
- `reopened` - Closed PR reopened
- `synchronize` - New commits pushed
- `assigned` - Assignee added
- `unassigned` - Assignee removed
- `labeled` - Label added
- `unlabeled` - Label removed
- `review_requested` - Review requested
- `review_request_removed` - Review request removed
- `ready_for_review` - Draft converted to ready
- `converted_to_draft` - Converted to draft
- `locked` - Conversation locked
- `unlocked` - Conversation unlocked

**With filters:**
```yaml
on:
  pull_request:
    branches: [main]
    paths: ['src/**']
    types: [opened, synchronize]
```

**Use cases:**
- Run tests on PR
- Code quality checks
- Preview deployments
- Automated comments

### Pull Request Target Event

**Special PR event with base branch context**

```yaml
on: pull_request_target
```

**Key differences from `pull_request`:**
- Runs in context of base branch (not PR branch)
- Has access to secrets
- Can comment on PR from forks
- **DANGEROUS** if you checkout PR code

**Safe usage:**
```yaml
on: pull_request_target

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      # ✅ SAFE - No PR code checked out
      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'Thanks for the PR!'
            })
```

**Dangerous usage:**
```yaml
on: pull_request_target

jobs:
  test:
    steps:
      # ❌ DANGEROUS - Untrusted PR code with secrets access
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - run: npm test  # Could steal secrets!
```

**Use cases:**
- Comment on PRs from forks
- Label PRs
- Request reviews
- Update PR status

### Issues Event

**Triggers on issue activity**

```yaml
on:
  issues:
    types: [opened, edited, closed, reopened, labeled]
```

**Use cases:**
- Auto-label issues
- Notify team
- Create related issues
- Sync to external systems

### Issue Comment Event

**Triggers on issue/PR comments**

```yaml
on:
  issue_comment:
    types: [created, edited, deleted]
```

**Check if PR comment:**
```yaml
jobs:
  respond:
    if: github.event.issue.pull_request
    steps:
      - name: Respond to PR comment
        run: echo "This is a PR comment"
```

**Use cases:**
- ChatOps (trigger actions via comments)
- Automated responses
- Command parsing (`/deploy`, `/test`)

### Release Event

**Triggers on release activity**

```yaml
on:
  release:
    types: [published, created, edited, deleted, prereleased, released]
```

**Common pattern:**
```yaml
on:
  release:
    types: [published]

jobs:
  deploy:
    steps:
      - name: Deploy release
        run: |
          echo "Deploying ${{ github.event.release.tag_name }}"
```

**Use cases:**
- Deploy on release
- Build release assets
- Notify users
- Update documentation

### Workflow Run Event

**Triggers when another workflow completes**

```yaml
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]
```

**Check conclusion:**
```yaml
jobs:
  deploy:
    if: github.event.workflow_run.conclusion == 'success'
    steps: [...]
```

**Use cases:**
- Chain workflows
- Deploy after CI passes
- Aggregate test results
- Cross-workflow dependencies

### More Webhook Events

**Repository:**
- `create` - Branch/tag created
- `delete` - Branch/tag deleted
- `fork` - Repository forked
- `gollum` - Wiki page updated
- `public` - Repository made public
- `watch` - Repository starred

**Pull Request Reviews:**
- `pull_request_review` - Review submitted
- `pull_request_review_comment` - Review comment added

**Deployments:**
- `deployment` - Deployment created
- `deployment_status` - Deployment status updated

**Project Management:**
- `project` - Project created/updated
- `project_card` - Project card moved
- `project_column` - Project column created/updated

**Complete list:** https://docs.github.com/actions/reference/events-that-trigger-workflows

---

## Schedule Triggers

### Cron Syntax

**Format:** `minute hour day month day-of-week`

```yaml
on:
  schedule:
    - cron: '30 5 * * 1-5'  # 5:30 AM Mon-Fri
```

**Field values:**
- **Minute:** 0-59
- **Hour:** 0-23 (UTC)
- **Day:** 1-31
- **Month:** 1-12 or JAN-DEC
- **Day of week:** 0-6 or SUN-SAT (0 = Sunday)

**Special characters:**
- `*` - Any value
- `,` - Value list (1,3,5)
- `-` - Range (1-5)
- `/` - Step (*/15 = every 15)

### Common Schedules

```yaml
# Every hour
'0 * * * *'

# Every 3 hours
'0 */3 * * *'

# Every 6 hours
'0 */6 * * *'

# Daily at midnight UTC
'0 0 * * *'

# Daily at 9 AM UTC
'0 9 * * *'

# Weekdays at 9 AM
'0 9 * * 1-5'

# First day of month
'0 0 1 * *'

# Every Monday at 1 PM
'0 13 * * 1'

# Every 15 minutes
'*/15 * * * *'

# Every 30 minutes
'*/30 * * * *'

# Multiple times per day
on:
  schedule:
    - cron: '0 9 * * *'   # 9 AM
    - cron: '0 17 * * *'  # 5 PM
```

### Schedule Behavior

**Important notes:**

1. **UTC timezone:** All times are UTC
2. **Minimum interval:** 5 minutes
3. **Not guaranteed:** May be delayed during high load
4. **Inactive repos:** Disabled after 60 days of no activity
5. **Default branch:** Only runs on default branch

**Convert to your timezone:**
```
Your local time: 9 AM PST (UTC-8)
Cron time: 17 (9 + 8 = 17)
Cron: '0 17 * * *'
```

### Timezone Considerations

**Set timezone in workflow:**
```yaml
env:
  TZ: America/New_York

jobs:
  scheduled:
    steps:
      - name: Show time
        run: |
          echo "Current time: $(date)"
          # Displays in America/New_York timezone
```

**Or in steps:**
```yaml
- name: Run at specific timezone
  env:
    TZ: Europe/London
  run: |
    echo "London time: $(date)"
```

---

## Manual Triggers

### Workflow Dispatch

**Allows manual workflow triggering with inputs**

**Basic:**
```yaml
on:
  workflow_dispatch:
```

**With inputs:**
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      
      version:
        description: 'Version to deploy'
        required: true
        type: string
        default: 'latest'
      
      dry_run:
        description: 'Perform dry run'
        required: false
        type: boolean
        default: false
```

**Input types:**
- `string` - Text input
- `choice` - Dropdown selection
- `boolean` - Checkbox
- `environment` - Environment selection

**Access inputs:**
```yaml
steps:
  - name: Deploy
    run: |
      echo "Environment: ${{ github.event.inputs.environment }}"
      echo "Version: ${{ github.event.inputs.version }}"
      echo "Dry run: ${{ github.event.inputs.dry_run }}"
```

**Trigger via:**
- GitHub Web UI
- GitHub Mobile
- GitHub CLI: `gh workflow run workflow.yml -f environment=production`
- API

### Repository Dispatch

**Trigger via API with custom event types**

```yaml
on:
  repository_dispatch:
    types: [deploy, test, custom-event]
```

**Trigger via API:**
```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/repos/owner/repo/dispatches \
  -d '{"event_type":"deploy","client_payload":{"environment":"production"}}'
```

**Access payload:**
```yaml
steps:
  - name: Use payload
    run: |
      echo "Event: ${{ github.event.action }}"
      echo "Environment: ${{ github.event.client_payload.environment }}"
```

**Use cases:**
- External system triggers
- Webhook integrations
- Custom CI/CD pipelines
- Cross-repository workflows

---

## Workflow Triggers

### Workflow Call

**Reusable workflows**

**Callable workflow:**
```yaml
# .github/workflows/reusable.yml
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      token:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ${{ inputs.environment }}
        run: echo "Deploying..."
```

**Calling workflow:**
```yaml
# .github/workflows/main.yml
jobs:
  call-reusable:
    uses: ./.github/workflows/reusable.yml
    with:
      environment: production
    secrets:
      token: ${{ secrets.DEPLOY_TOKEN }}
```

**Use cases:**
- Shared CI/CD logic
- Organization-wide workflows
- Reduce duplication

### Workflow Run

**Trigger on other workflow completion**

```yaml
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]
```

**Check result:**
```yaml
jobs:
  on-success:
    if: github.event.workflow_run.conclusion == 'success'
    steps: [...]
  
  on-failure:
    if: github.event.workflow_run.conclusion == 'failure'
    steps: [...]
```

**Use cases:**
- Sequential workflows
- Deploy after tests pass
- Notification workflows
- Cleanup after builds

---

## Combining Triggers

### Multiple Events

**Array syntax:**
```yaml
on: [push, pull_request, workflow_dispatch]
```

**Object syntax:**
```yaml
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]
  workflow_dispatch:
```

### Common Combinations

**CI workflow:**
```yaml
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:  # For manual testing
```

**Deployment workflow:**
```yaml
on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]
```

**Maintenance workflow:**
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:       # Manual trigger for testing
```

---

## Activity Types

### Default vs Specific

**Default activity types** (if none specified):

```yaml
# pull_request defaults to:
on:
  pull_request:
    types: [opened, synchronize, reopened]

# issues defaults to:
on:
  issues:
    types: [opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled, locked, unlocked, milestoned, demilestoned]
```

**Specify to limit:**
```yaml
on:
  pull_request:
    types: [opened, synchronize]  # Only these two
```

### Activity Type Reference

**Pull Request:**
- `opened`, `edited`, `closed`, `reopened`
- `synchronize` - New commits
- `assigned`, `unassigned`
- `labeled`, `unlabeled`
- `review_requested`, `review_request_removed`
- `ready_for_review`, `converted_to_draft`
- `locked`, `unlocked`
- `auto_merge_enabled`, `auto_merge_disabled`

**Issues:**
- `opened`, `edited`, `deleted`, `closed`, `reopened`
- `assigned`, `unassigned`
- `labeled`, `unlabeled`
- `locked`, `unlocked`
- `transferred`, `milestoned`, `demilestoned`
- `pinned`, `unpinned`

**Release:**
- `published` - Release published (not draft)
- `created` - Draft or published release created
- `edited` - Release edited
- `deleted` - Release deleted
- `prereleased` - Prerelease published
- `released` - Release or prerelease published
- `unpublished` - Release unpublished

---

## Filters

### Branch Filters

**Include branches:**
```yaml
on:
  push:
    branches:
      - main
      - 'releases/**'
      - 'feature/*'
```

**Exclude branches:**
```yaml
on:
  push:
    branches-ignore:
      - 'docs/**'
      - 'temp-*'
```

**Note:** Can't use both `branches` and `branches-ignore` for same event

### Tag Filters

```yaml
on:
  push:
    tags:
      - 'v*'           # v1, v2, v3
      - 'v*.*.*'       # v1.0.0, v2.1.3
```

### Path Filters

**Include paths:**
```yaml
on:
  push:
    paths:
      - 'src/**'
      - '**.js'
      - 'config/*.json'
```

**Exclude paths:**
```yaml
on:
  push:
    paths-ignore:
      - 'docs/**'
      - '**.md'
      - '.github/**'
```

**Note:** Workflow still runs if any non-ignored file changes

### Pattern Matching

**Wildcards:**
- `*` - Matches zero or more characters (except `/`)
- `**` - Matches zero or more characters (including `/`)
- `?` - Matches zero or one character
- `+` - Matches one or more characters
- `[]` - Matches characters in brackets
- `!` - Negates pattern (at start)

**Examples:**
```yaml
branches:
  - 'releases/**'        # releases/v1, releases/v2/beta
  - 'feature-?'          # feature-a, feature-1
  - 'hotfix-+'           # hotfix-1, hotfix-123
  - 'v[0-9].[0-9].[0-9]' # v1.0.0, v2.3.4
```

---

## Trigger Behavior

### Event Payload

**Each trigger provides event data:**

```yaml
steps:
  - name: Show event data
    run: |
      echo "Event: ${{ github.event_name }}"
      echo "Action: ${{ github.event.action }}"
      echo "Ref: ${{ github.ref }}"
      echo "SHA: ${{ github.sha }}"
```

**Event-specific data:**
```yaml
# Push event
echo "${{ github.event.head_commit.message }}"

# Pull request event
echo "${{ github.event.pull_request.title }}"
echo "${{ github.event.pull_request.number }}"

# Issue event
echo "${{ github.event.issue.title }}"

# Release event
echo "${{ github.event.release.tag_name }}"
```

### Skip CI

**Skip workflow runs:**

**Commit message patterns:**
```
[skip ci]
[ci skip]
[no ci]
[skip actions]
[actions skip]
```

**Examples:**
```bash
git commit -m "docs: update README [skip ci]"
git commit -m "[ci skip] chore: update dependencies"
```

**Applies to push and pull_request events**

### Concurrency

**Prevent duplicate runs:**

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Per-branch:**
```yaml
concurrency:
  group: deploy-${{ github.ref_name }}
  cancel-in-progress: false  # Let current deploy finish
```

**Global:**
```yaml
concurrency: deploy-production  # Only one at a time globally
```

---

## Best Practices

### 1. Be Specific

**❌ Too broad:**
```yaml
on: [push, pull_request, issues, ...]
```

**✅ Specific:**
```yaml
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]
```

### 2. Use Path Filters

**Save resources:**
```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - '**.md'
```

### 3. Separate Workflows

**Different purposes, different workflows:**
- CI: Tests on every PR
- CD: Deployment on release
- Maintenance: Scheduled tasks

### 4. Manual Trigger Fallback

**Always include for testing:**
```yaml
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:  # ← Allows manual testing
```

### 5. Document Complex Triggers

**Add comments:**
```yaml
on:
  # Run CI on pushes to main and PRs
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]
  
  # Allow manual deployment
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]
```

---

## Quick Reference

### Common Patterns

**Continuous Integration:**
```yaml
on:
  push:
    branches: [main]
  pull_request:
```

**Continuous Deployment:**
```yaml
on:
  release:
    types: [published]
  workflow_dispatch:
```

**Scheduled Task:**
```yaml
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:
```

**Manual Only:**
```yaml
on:
  workflow_dispatch:
    inputs:
      # ... inputs
```

**Cross-Workflow:**
```yaml
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
```

---

## 📚 Resources

- **Events Reference:** https://docs.github.com/actions/reference/events-that-trigger-workflows
- **Workflow Syntax:** https://docs.github.com/actions/reference/workflow-syntax-for-github-actions#on
- **Cron Scheduler:** https://crontab.guru/

---

**Last Updated:** October 3, 2025  
**Version:** 1.0

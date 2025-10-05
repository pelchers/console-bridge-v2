# GitHub Actions Architecture - Technical Deep Dive

A comprehensive technical explanation of how GitHub Actions works, its components, execution model, and infrastructure.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [Execution Model](#execution-model)
4. [Runner Architecture](#runner-architecture)
5. [Workflow Lifecycle](#workflow-lifecycle)
6. [Context and Variables](#context-and-variables)
7. [Action Types](#action-types)
8. [Caching and Artifacts](#caching-and-artifacts)
9. [Security Model](#security-model)
10. [Performance Considerations](#performance-considerations)

---

## Overview

### What is GitHub Actions?

GitHub Actions is a **CI/CD platform** integrated directly into GitHub that allows you to automate workflows triggered by repository events, schedules, or manual dispatches.

**Key Characteristics:**
- **Event-driven:** Responds to GitHub events (push, PR, release, etc.)
- **YAML-based:** Workflows defined in declarative YAML files
- **Container-based:** Jobs run in isolated Docker containers
- **Cloud or self-hosted:** Use GitHub's runners or host your own
- **Marketplace:** Reusable actions from community

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Repository                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  .github/workflows/                                    │  │
│  │    ├── workflow1.yml                                   │  │
│  │    ├── workflow2.yml                                   │  │
│  │    └── workflow3.yml                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Event Trigger
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 GitHub Actions Service                       │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  Workflow Parser   │  │  Job Scheduler     │            │
│  └────────────────────┘  └────────────────────┘            │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  Context Builder   │  │  Secret Manager    │            │
│  └────────────────────┘  └────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Job Assignment
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Runner Infrastructure                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Runner 1    │  │  Runner 2    │  │  Runner N    │      │
│  │  (ubuntu)    │  │  (windows)   │  │  (macos)     │      │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │      │
│  │ │   Job    │ │  │ │   Job    │ │  │ │   Job    │ │      │
│  │ │Container │ │  │ │Container │ │  │ │Container │ │      │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Results
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub UI / API                           │
│   - Logs                                                     │
│   - Artifacts                                                │
│   - Status Checks                                            │
│   - Notifications                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Workflows

**Definition:** Automated processes defined in YAML files

**Location:** `.github/workflows/*.yml`

**Structure:**
```yaml
name: Workflow Name          # Display name
on: [events]                 # Triggers
env: {}                      # Global environment variables
jobs:                        # Collection of jobs
  job-id:                    # Unique job identifier
    runs-on: runner          # Runner type
    steps: []                # Ordered steps to execute
```

**Key Properties:**
- One workflow file = one workflow
- Can have multiple triggers
- Contains one or more jobs
- Runs on specified events

### 2. Events (Triggers)

**Categories:**

**Webhook Events:**
- `push`: Code pushed to repository
- `pull_request`: PR opened, updated, closed
- `release`: Release published
- `issues`: Issue opened, closed, etc.
- 40+ webhook event types

**Scheduled Events:**
- `schedule`: Cron-based timing
- Runs on GitHub's infrastructure
- Max frequency: every 5 minutes

**Manual Events:**
- `workflow_dispatch`: Manual trigger with inputs
- `repository_dispatch`: Trigger via API

**Workflow Events:**
- `workflow_call`: Reusable workflows
- `workflow_run`: Trigger on other workflow completion

### 3. Jobs

**Definition:** Set of steps executed on the same runner

**Properties:**
- Run in parallel by default
- Can depend on other jobs (`needs`)
- Isolated from other jobs
- Each gets fresh runner/container

**Structure:**
```yaml
jobs:
  job-id:
    name: Display Name
    runs-on: ubuntu-latest    # Runner
    needs: [other-job]        # Dependencies
    if: condition             # Conditional execution
    strategy:                 # Matrix/concurrency
      matrix:
        node: [18, 20]
    env: {}                   # Job-specific env vars
    steps: []                 # Steps to execute
```

**Execution:**
- Jobs run in parallel unless `needs` specified
- Sharing data requires artifacts
- Each job is independent execution

### 4. Steps

**Definition:** Individual tasks within a job

**Types:**
- **Run commands:** `run: echo "hello"`
- **Use actions:** `uses: actions/checkout@v4`

**Structure:**
```yaml
steps:
  - name: Step Name
    id: step-id              # Reference in later steps
    if: condition            # Conditional execution
    uses: action@version     # OR
    run: |                   # Shell commands
      echo "commands"
    env: {}                  # Step-specific env vars
    continue-on-error: bool  # Continue if fails
    timeout-minutes: 30      # Step timeout
```

**Execution Order:**
- Sequential within a job
- Each step runs in same environment
- Can share files within job
- Environment persists across steps

### 5. Actions

**Definition:** Reusable units of code

**Types:**

**JavaScript Actions:**
```yaml
uses: actions/setup-node@v4
with:
  node-version: '20'
```

**Docker Actions:**
```yaml
uses: docker://alpine:3.18
with:
  args: echo "Hello"
```

**Composite Actions:**
```yaml
uses: ./.github/actions/my-composite
```

**Sources:**
- GitHub Marketplace
- Public repositories
- Private repositories (same org)
- Local (same repository)

### 6. Runners

**Definition:** Servers that execute workflows

**Types:**

**GitHub-hosted:**
- Ubuntu (latest, 22.04, 20.04)
- Windows (latest, 2022, 2019)
- macOS (latest, 13, 12, 11)
- Pre-installed software
- 2 CPU cores, 7 GB RAM, 14 GB SSD

**Self-hosted:**
- Your own infrastructure
- Custom software
- Any OS supported
- Configurable resources
- Behind firewalls

---

## Execution Model

### Workflow Execution Flow

```
1. Event Occurs
   │
   ├─→ GitHub detects event (push, PR, schedule, etc.)
   │
   ▼
2. Workflow Selection
   │
   ├─→ Parse .github/workflows/*.yml files
   ├─→ Match event triggers
   ├─→ Check conditions (branches, paths, etc.)
   │
   ▼
3. Workflow Queuing
   │
   ├─→ Create workflow run
   ├─→ Assign run number
   ├─→ Queue jobs
   │
   ▼
4. Runner Assignment
   │
   ├─→ Match runner requirements
   ├─→ Allocate available runner
   ├─→ Wait if none available
   │
   ▼
5. Job Execution
   │
   ├─→ Setup runner environment
   ├─→ Checkout code (if needed)
   ├─→ Execute steps sequentially
   ├─→ Collect logs
   │
   ▼
6. Artifact/Cache Management
   │
   ├─→ Upload artifacts
   ├─→ Store cache
   ├─→ Clean up
   │
   ▼
7. Results & Notifications
   │
   ├─→ Update UI status
   ├─→ Send notifications
   ├─→ Trigger dependent workflows
   │
   ▼
8. Cleanup
   │
   └─→ Destroy runner environment
```

### Concurrency Model

**Parallel Execution:**
```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    steps: [...]
  
  job2:  # Runs parallel to job1
    runs-on: ubuntu-latest
    steps: [...]
```

**Sequential with Dependencies:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]
  
  test:
    needs: build  # Waits for build to complete
    runs-on: ubuntu-latest
    steps: [...]
  
  deploy:
    needs: [build, test]  # Waits for both
    runs-on: ubuntu-latest
    steps: [...]
```

**Matrix Strategy:**
```yaml
jobs:
  test:
    strategy:
      matrix:
        node: [18, 20, 22]
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
```

Creates 6 parallel jobs (3 Node versions × 2 OS).

### Concurrency Control

**Prevent duplicate runs:**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Ensures:**
- Only one workflow per branch runs at a time
- New runs cancel old ones
- Useful for deployments

---

## Runner Architecture

### GitHub-Hosted Runner Lifecycle

```
1. Provisioned
   │
   ├─→ VM/container spun up
   ├─→ OS image loaded
   ├─→ Pre-installed software available
   │
   ▼
2. Job Assignment
   │
   ├─→ Receives job from queue
   ├─→ Downloads workflow info
   ├─→ Prepares environment
   │
   ▼
3. Setup
   │
   ├─→ Set environment variables
   ├─→ Inject secrets (masked in logs)
   ├─→ Setup workspace
   │
   ▼
4. Execution
   │
   ├─→ Run each step sequentially
   ├─→ Stream logs to GitHub
   ├─→ Handle errors
   │
   ▼
5. Teardown
   │
   ├─→ Upload artifacts
   ├─→ Update cache
   ├─→ Cleanup files
   │
   ▼
6. Destroyed
   │
   └─→ VM/container destroyed
```

**Environment:**
- Fresh for each job
- No state persists
- Clean slate every time

### Self-Hosted Runner Architecture

```
┌─────────────────────────────────────────┐
│       Self-Hosted Runner                 │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Runner Application                │ │
│  │  - Polls GitHub for jobs           │ │
│  │  - Downloads job definition        │ │
│  │  - Executes jobs                   │ │
│  │  - Reports status                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Work Directory                    │ │
│  │  - Source code                     │ │
│  │  - Build outputs                   │ │
│  │  - Temporary files                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Tool Cache                        │ │
│  │  - Cached dependencies             │ │
│  │  - Downloaded tools                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Properties:**
- Persistent between jobs
- Can cache between runs
- Behind your firewall
- Your maintenance responsibility

---

## Workflow Lifecycle

### States

```
Queued → In Progress → Completed
                    ↘
                     Cancelled
```

**Detailed States:**

1. **Queued:**
   - Waiting for runner
   - In concurrency queue
   - Pending approval (environments)

2. **In Progress:**
   - Running on runner
   - Executing steps
   - Can be cancelled

3. **Completed:**
   - **Success:** All steps passed
   - **Failure:** At least one step failed
   - **Cancelled:** Manually cancelled or timeout
   - **Skipped:** Conditions not met

### Workflow Run Object

Every run has:
```javascript
{
  id: 12345678,
  name: "CI",
  head_branch: "main",
  head_sha: "abc123",
  run_number: 42,
  event: "push",
  status: "completed",
  conclusion: "success",
  created_at: "2025-10-03T10:00:00Z",
  updated_at: "2025-10-03T10:05:00Z",
  jobs: [...],
  artifacts: [...],
  logs_url: "..."
}
```

---

## Context and Variables

### Context Objects

**Available in workflows:**

```yaml
steps:
  - name: Context example
    run: |
      echo "Repository: ${{ github.repository }}"
      echo "Actor: ${{ github.actor }}"
      echo "Event: ${{ github.event_name }}"
      echo "SHA: ${{ github.sha }}"
      echo "Ref: ${{ github.ref }}"
      echo "Workflow: ${{ github.workflow }}"
      echo "Job: ${{ github.job }}"
      echo "Run ID: ${{ github.run_id }}"
      echo "Run Number: ${{ github.run_number }}"
```

**Full context list:**
- `github`: Repository and workflow info
- `env`: Environment variables
- `job`: Current job info
- `steps`: Previous steps' outputs
- `runner`: Runner information
- `secrets`: Repository secrets
- `strategy`: Matrix strategy info
- `matrix`: Current matrix combination
- `needs`: Outputs from dependent jobs
- `inputs`: workflow_dispatch inputs

### Environment Variables

**Precedence (highest to lowest):**
1. Step-level `env`
2. Job-level `env`
3. Workflow-level `env`
4. Runner default environment

```yaml
env:
  GLOBAL_VAR: "workflow"

jobs:
  example:
    env:
      JOB_VAR: "job"
    steps:
      - name: Step with env
        env:
          STEP_VAR: "step"
        run: |
          echo $GLOBAL_VAR  # "workflow"
          echo $JOB_VAR     # "job"
          echo $STEP_VAR    # "step"
```

---

## Action Types

### 1. JavaScript Actions

**Most common, runs directly on runner**

**Structure:**
```
action-name/
├── action.yml       # Metadata
├── index.js         # Entry point
├── package.json     # Dependencies
└── node_modules/    # (gitignored, use ncc to bundle)
```

**action.yml:**
```yaml
name: 'My Action'
description: 'Does something'
inputs:
  my-input:
    description: 'Input description'
    required: true
runs:
  using: 'node20'
  main: 'index.js'
```

**Advantages:**
- Fast (no container overhead)
- Access to GitHub API toolkit
- Can modify runner state

### 2. Docker Actions

**Runs in container**

**action.yml:**
```yaml
name: 'Docker Action'
description: 'Runs in container'
inputs:
  my-input:
    description: 'Input'
runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
    - ${{ inputs.my-input }}
```

**Advantages:**
- Consistent environment
- Any language/runtime
- Isolated dependencies

**Disadvantages:**
- Slower (container build/pull)
- Not available on Windows/macOS runners

### 3. Composite Actions

**Combines multiple steps**

**action.yml:**
```yaml
name: 'Composite Action'
description: 'Multiple steps'
inputs:
  node-version:
    required: true
runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
    - run: npm install
      shell: bash
    - run: npm test
      shell: bash
```

**Advantages:**
- Reuse workflow logic
- No container overhead
- Can use other actions

---

## Caching and Artifacts

### Caching

**Purpose:** Speed up workflows by reusing dependencies

**Mechanism:**
```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**How it works:**
1. Check if cache key exists
2. If yes: restore files
3. If no: continue without cache
4. After job: save cache with key

**Storage:**
- Per repository
- 10 GB limit (LRU eviction)
- 7 days of inactivity = deletion

### Artifacts

**Purpose:** Share files between jobs or download later

**Upload:**
```yaml
- name: Upload artifact
  uses: actions/upload-artifact@v4
  with:
    name: my-artifact
    path: |
      dist/
      logs/
    retention-days: 7
```

**Download (same workflow):**
```yaml
- name: Download artifact
  uses: actions/download-artifact@v4
  with:
    name: my-artifact
    path: ./downloaded
```

**Storage:**
- Per repository
- Size varies by plan
- Retention: 1-90 days

---

## Security Model

### Isolation

**Job Isolation:**
- Each job runs in separate environment
- No shared state between jobs
- Must explicitly share via artifacts

**Workflow Isolation:**
- Workflows can't directly access each other
- Can trigger via `workflow_run`
- Separate permission scopes

### Secrets

**Storage:**
- Encrypted at rest
- Decrypted only during workflow
- Never visible in logs (automatic masking)

**Access:**
```yaml
steps:
  - name: Use secret
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: echo "Key is masked in logs"
```

### Permissions

**GITHUB_TOKEN:**
- Automatically created for each workflow
- Scoped to repository
- Limited permissions

**Configure:**
```yaml
permissions:
  contents: read
  issues: write
  pull-requests: write
```

---

## Performance Considerations

### Optimization Strategies

**1. Use Caching:**
- Cache dependencies
- Cache build outputs
- Use restore-keys for partial matches

**2. Parallelize Jobs:**
- Independent jobs run parallel
- Use matrix for multiple configurations
- Split tests into parallel jobs

**3. Minimize Checkout:**
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1  # Shallow clone
```

**4. Use Artifacts Wisely:**
- Only upload what's needed
- Compress before uploading
- Set appropriate retention

**5. Self-Hosted Runners:**
- Faster for repeated workflows
- Persistent cache
- More resources

### Monitoring

**Track:**
- Workflow duration trends
- Runner queue times
- Artifact storage usage
- Cache hit rates

---

## 📚 Additional Resources

- **GitHub Actions Docs:** https://docs.github.com/actions
- **Workflow Syntax:** https://docs.github.com/actions/reference/workflow-syntax
- **Actions Toolkit:** https://github.com/actions/toolkit

---

**Last Updated:** October 3, 2025  
**Version:** 1.0

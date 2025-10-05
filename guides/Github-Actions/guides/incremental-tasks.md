# Incremental Tasks Guide

Complete guide to using GitHub Actions for incremental development tasks, quick fixes, and on-demand automation.

---

## 📋 Overview

Incremental task workflows enable:
- **On-demand execution** - Run only when you need it
- **Quick fixes** - Test and deploy fixes rapidly
- **Flexible parameters** - Customize each run
- **Development iteration** - Test changes quickly
- **Manual control** - You decide when to run

---

## 🎯 What Are Incremental Tasks?

### Characteristics

**Incremental tasks are:**
- ✅ Triggered manually (workflow_dispatch)
- ✅ Parameterized for flexibility
- ✅ Quick to execute (usually < 10 minutes)
- ✅ Focused on specific goals
- ✅ Repeatable with different inputs

**Examples:**
- Running tests on specific files
- Building a specific component
- Deploying a single service
- Formatting selected code
- Running lints on changed files
- Quick smoke tests
- One-off data migrations

---

## 🚀 Creating Incremental Task Workflows

### Basic Structure

```yaml
name: Incremental Task

on:
  workflow_dispatch:  # Manual trigger only
    inputs:
      task_type:
        description: 'Type of task'
        required: true
        type: choice
        options:
          - test
          - build
          - lint
          - format
      
      target:
        description: 'What to process (files, directories, components)'
        required: false
        default: '.'
      
      verbose:
        description: 'Verbose output'
        type: boolean
        default: false

jobs:
  execute-task:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Execute task
        run: |
          echo "Task: ${{ github.event.inputs.task_type }}"
          echo "Target: ${{ github.event.inputs.target }}"
          # Task logic here
```

### Input Types

**1. Choice (Dropdown):**
```yaml
task_type:
  description: 'Select task type'
  required: true
  type: choice
  options:
    - test
    - build
    - deploy
    - lint
```

**2. String (Text Input):**
```yaml
target_files:
  description: 'Files to process'
  required: false
  default: 'src/'
  type: string
```

**3. Boolean (Checkbox):**
```yaml
dry_run:
  description: 'Dry run (no actual changes)'
  required: false
  type: boolean
  default: false
```

**4. Environment (Dropdown):**
```yaml
environment:
  description: 'Deployment environment'
  required: true
  type: environment
```

---

## 💡 Real-World Examples

### Example 1: Targeted Test Runner

**Purpose:** Run tests on specific files or directories

```yaml
name: Run Tests

on:
  workflow_dispatch:
    inputs:
      test_path:
        description: 'Path to test (file or directory)'
        required: true
        default: 'test/'
      
      test_pattern:
        description: 'Test pattern (e.g., "**/user.test.js")'
        required: false
        default: '**/*.test.js'
      
      coverage:
        description: 'Generate coverage report'
        type: boolean
        default: false

jobs:
  run-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: |
          if [ "${{ github.event.inputs.coverage }}" == "true" ]; then
            npm test -- "${{ github.event.inputs.test_path }}" --coverage
          else
            npm test -- "${{ github.event.inputs.test_path }}"
          fi
      
      - name: Upload coverage
        if: github.event.inputs.coverage == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
```

**Usage:**
```
Test specific file: test/unit/user.test.js
Test directory: test/integration/
Pattern: test/**/api/*.test.js
With coverage: ✓
```

### Example 2: Selective Build

**Purpose:** Build only specific components

```yaml
name: Build Component

on:
  workflow_dispatch:
    inputs:
      component:
        description: 'Component to build'
        required: true
        type: choice
        options:
          - frontend
          - backend
          - api
          - worker
          - all
      
      environment:
        description: 'Build environment'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      
      optimize:
        description: 'Enable optimizations'
        type: boolean
        default: true

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build component
        env:
          NODE_ENV: ${{ github.event.inputs.environment }}
          OPTIMIZE: ${{ github.event.inputs.optimize }}
        run: |
          if [ "${{ github.event.inputs.component }}" == "all" ]; then
            npm run build
          else
            npm run build:${{ github.event.inputs.component }}
          fi
      
      - name: Upload build
        uses: actions/upload-artifact@v4
        with:
          name: ${{ github.event.inputs.component }}-${{ github.event.inputs.environment }}
          path: dist/
```

### Example 3: Quick Fix Deployment

**Purpose:** Deploy a specific fix to production

```yaml
name: Deploy Fix

on:
  workflow_dispatch:
    inputs:
      fix_description:
        description: 'Description of the fix'
        required: true
      
      target_service:
        description: 'Service to deploy'
        required: true
        type: choice
        options:
          - api
          - web
          - worker
          - database
      
      rollback_on_error:
        description: 'Automatic rollback on error'
        type: boolean
        default: true
      
      notify_team:
        description: 'Notify team on completion'
        type: boolean
        default: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate deployment
        run: |
          echo "Deploying fix: ${{ github.event.inputs.fix_description }}"
          echo "Target: ${{ github.event.inputs.target_service }}"
          echo "Rollback enabled: ${{ github.event.inputs.rollback_on_error }}"
      
      - name: Run pre-deployment checks
        run: |
          echo "Running health checks..."
          # Add your health check logic
      
      - name: Deploy
        run: |
          echo "Deploying to ${{ github.event.inputs.target_service }}..."
          # Add your deployment logic
      
      - name: Verify deployment
        id: verify
        run: |
          echo "Verifying deployment..."
          # Add verification logic
          # Set output: echo "success=true" >> $GITHUB_OUTPUT
      
      - name: Rollback on failure
        if: failure() && github.event.inputs.rollback_on_error == 'true'
        run: |
          echo "Rolling back deployment..."
          # Add rollback logic
      
      - name: Notify team
        if: always() && github.event.inputs.notify_team == 'true'
        run: |
          echo "Notifying team..."
          echo "Fix: ${{ github.event.inputs.fix_description }}"
          echo "Status: ${{ job.status }}"
          # Add notification logic
```

### Example 4: Code Formatter

**Purpose:** Format specific files or directories

```yaml
name: Format Code

on:
  workflow_dispatch:
    inputs:
      paths:
        description: 'Paths to format (comma-separated)'
        required: true
        default: 'src/'
      
      check_only:
        description: 'Check only (no modifications)'
        type: boolean
        default: false
      
      create_pr:
        description: 'Create PR with changes'
        type: boolean
        default: false

jobs:
  format:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Prettier
        run: npm install -g prettier
      
      - name: Format code
        run: |
          IFS=',' read -ra PATHS <<< "${{ github.event.inputs.paths }}"
          
          for path in "${PATHS[@]}"; do
            if [ "${{ github.event.inputs.check_only }}" == "true" ]; then
              prettier --check "$path"
            else
              prettier --write "$path"
            fi
          done
      
      - name: Check for changes
        id: changes
        run: |
          if [[ -n $(git status --porcelain) ]]; then
            echo "has_changes=true" >> $GITHUB_OUTPUT
          else
            echo "has_changes=false" >> $GITHUB_OUTPUT
          fi
      
      - name: Create Pull Request
        if: steps.changes.outputs.has_changes == 'true' && github.event.inputs.create_pr == 'true'
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: format code with Prettier'
          branch: automated/format-code
          title: 'Format code with Prettier'
          body: |
            Automated code formatting
            
            Paths formatted: ${{ github.event.inputs.paths }}
            Triggered by: ${{ github.actor }}
```

### Example 5: Database Migration

**Purpose:** Run specific database migration

```yaml
name: Run Migration

on:
  workflow_dispatch:
    inputs:
      migration_name:
        description: 'Migration name (leave empty for latest)'
        required: false
      
      direction:
        description: 'Migration direction'
        required: true
        type: choice
        options:
          - up
          - down
      
      environment:
        description: 'Target environment'
        required: true
        type: environment
      
      dry_run:
        description: 'Dry run (show SQL without executing)'
        type: boolean
        default: false

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup database tools
        run: |
          # Install migration tools
          echo "Setting up migration tools..."
      
      - name: Run migration
        env:
          DB_CONNECTION: ${{ secrets.DB_CONNECTION }}
        run: |
          if [ "${{ github.event.inputs.dry_run }}" == "true" ]; then
            echo "DRY RUN: Showing SQL..."
            # Show migration SQL
          else
            echo "Running migration: ${{ github.event.inputs.migration_name }}"
            # Execute migration
          fi
      
      - name: Verify migration
        if: github.event.inputs.dry_run == 'false'
        run: |
          echo "Verifying migration..."
          # Check migration status
      
      - name: Create backup
        if: github.event.inputs.direction == 'down' && github.event.inputs.dry_run == 'false'
        run: |
          echo "Creating backup before rollback..."
          # Backup database
```

---

## 🔧 Best Practices

### 1. Clear Input Descriptions

**Good:**
```yaml
inputs:
  test_path:
    description: 'Path to test file or directory (e.g., test/unit/user.test.js)'
    required: true
```

**Bad:**
```yaml
inputs:
  path:
    description: 'Path'
    required: true
```

### 2. Sensible Defaults

```yaml
inputs:
  branch:
    description: 'Branch to deploy from'
    required: false
    default: 'main'  # ← Provide default
  
  verbose:
    description: 'Verbose output'
    type: boolean
    default: false  # ← Safe default
```

### 3. Validation

```yaml
steps:
  - name: Validate inputs
    run: |
      if [ -z "${{ github.event.inputs.target }}" ]; then
        echo "Error: Target is required"
        exit 1
      fi
      
      if [ ! -d "${{ github.event.inputs.target }}" ]; then
        echo "Error: Target directory does not exist"
        exit 1
      fi
```

### 4. Dry Run Option

```yaml
inputs:
  dry_run:
    description: 'Preview changes without executing'
    type: boolean
    default: true  # Safe default

steps:
  - name: Execute or preview
    run: |
      if [ "${{ github.event.inputs.dry_run }}" == "true" ]; then
        echo "DRY RUN: Would execute..."
        # Show what would happen
      else
        echo "Executing..."
        # Actually execute
      fi
```

### 5. Progress Feedback

```yaml
steps:
  - name: Task step 1
    run: |
      echo "::group::Step 1: Preparation"
      # Step 1 logic
      echo "::endgroup::"
  
  - name: Task step 2
    run: |
      echo "::group::Step 2: Execution"
      # Step 2 logic
      echo "::endgroup::"
  
  - name: Task step 3
    run: |
      echo "::group::Step 3: Verification"
      # Step 3 logic
      echo "::endgroup::"
```

### 6. Artifact Management

```yaml
- name: Upload results
  if: always()  # Upload even if task fails
  uses: actions/upload-artifact@v4
  with:
    name: task-results-${{ github.run_number }}
    path: |
      results/
      logs/
    retention-days: 7  # Don't keep forever
```

### 7. Contextual Summaries

```yaml
- name: Create summary
  if: always()
  run: |
    echo "## Task Summary" >> $GITHUB_STEP_SUMMARY
    echo "" >> $GITHUB_STEP_SUMMARY
    echo "- **Task**: ${{ github.event.inputs.task_type }}" >> $GITHUB_STEP_SUMMARY
    echo "- **Target**: ${{ github.event.inputs.target }}" >> $GITHUB_STEP_SUMMARY
    echo "- **Status**: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY
    echo "- **Duration**: ${SECONDS}s" >> $GITHUB_STEP_SUMMARY
```

---

## 📱 Triggering from Different Platforms

### From GitHub Web

1. Repository → Actions
2. Select workflow
3. Click "Run workflow"
4. Fill in form
5. Click "Run workflow" button

### From GitHub Mobile

1. Open GitHub app
2. Navigate to repository
3. Tap Actions
4. Select workflow
5. Tap "Run workflow"
6. Fill in parameters
7. Tap "Run workflow"

### From GitHub CLI

```bash
# Basic run
gh workflow run incremental-task.yml

# With parameters
gh workflow run incremental-task.yml \
  -f task_type=test \
  -f target="src/components/" \
  -f verbose=true

# Select branch
gh workflow run incremental-task.yml \
  --ref develop \
  -f task_type=build
```

### From API

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/incremental-task.yml/dispatches \
  -d '{
    "ref": "main",
    "inputs": {
      "task_type": "test",
      "target": "src/",
      "verbose": "true"
    }
  }'
```

---

## 🎯 Common Patterns

### Pattern 1: Multi-Stage Task

**Execute tasks in stages with confirmation:**

```yaml
name: Multi-Stage Task

on:
  workflow_dispatch:
    inputs:
      stage:
        description: 'Which stage to run'
        required: true
        type: choice
        options:
          - prepare
          - execute
          - verify
          - all

jobs:
  stage-1-prepare:
    if: github.event.inputs.stage == 'prepare' || github.event.inputs.stage == 'all'
    runs-on: ubuntu-latest
    steps:
      - name: Preparation
        run: echo "Preparing..."
  
  stage-2-execute:
    if: github.event.inputs.stage == 'execute' || github.event.inputs.stage == 'all'
    needs: stage-1-prepare
    runs-on: ubuntu-latest
    steps:
      - name: Execution
        run: echo "Executing..."
  
  stage-3-verify:
    if: github.event.inputs.stage == 'verify' || github.event.inputs.stage == 'all'
    needs: stage-2-execute
    runs-on: ubuntu-latest
    steps:
      - name: Verification
        run: echo "Verifying..."
```

### Pattern 2: Conditional Steps

**Run different steps based on input:**

```yaml
jobs:
  conditional-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Task A
        if: github.event.inputs.task_type == 'A'
        run: echo "Running Task A"
      
      - name: Task B
        if: github.event.inputs.task_type == 'B'
        run: echo "Running Task B"
      
      - name: Common cleanup
        if: always()
        run: echo "Cleanup"
```

### Pattern 3: Matrix for Multiple Targets

**Run same task on multiple targets:**

```yaml
jobs:
  multi-target:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target: [api, web, worker]
    
    steps:
      - name: Process ${{ matrix.target }}
        run: |
          echo "Processing ${{ matrix.target }}"
          # Task logic for each target
```

---

## 🐛 Troubleshooting

### Input Not Appearing

**Issue:** Input field doesn't show in GitHub UI

**Solutions:**
1. Check YAML syntax
2. Ensure proper indentation
3. Verify `workflow_dispatch` trigger exists
4. Push changes to GitHub
5. Refresh Actions page

### Wrong Input Type

**Issue:** Input shows as text instead of dropdown

**Fix:**
```yaml
# Wrong
task_type:
  description: 'Task type'
  required: true

# Correct
task_type:
  description: 'Task type'
  required: true
  type: choice  # ← Must specify type
  options:      # ← Must provide options
    - test
    - build
```

### Boolean Not Working

**Issue:** Boolean input treated as string

**Fix:**
```yaml
# Compare as string
if: github.event.inputs.verbose == 'true'

# NOT:
if: github.event.inputs.verbose == true
```

---

## ✅ Quick Reference

### Basic Structure

```yaml
name: Task Name

on:
  workflow_dispatch:
    inputs:
      input_name:
        description: 'Description'
        required: true
        type: choice/string/boolean
        default: 'value'

jobs:
  task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "${{ github.event.inputs.input_name }}"
```

### Input Access

```yaml
# In run commands
run: echo "${{ github.event.inputs.my_input }}"

# In conditionals
if: github.event.inputs.my_input == 'value'

# In environment variables
env:
  INPUT_VALUE: ${{ github.event.inputs.my_input }}
```

---

## 🎯 Next Steps

1. ✅ Create your first incremental task workflow
2. ✅ Test with different parameter combinations
3. ✅ Add dry-run option for safety
4. ✅ Create useful task combinations
5. ✅ Document common use cases
6. ✅ Train team on usage

---

**Last Updated:** October 3, 2025  
**Guide Version:** 1.0  
**For:** github-actions-test1 repository

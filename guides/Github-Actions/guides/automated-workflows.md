# Automated Workflows Guide

Complete guide to setting up and managing GitHub Actions workflows that run automatically without manual intervention.

---

## 📋 Overview

Automated workflows run on schedules or events, enabling:
- **Continuous testing** - Run tests automatically on every change
- **Scheduled maintenance** - Regular cleanup, backups, monitoring
- **Event-driven automation** - React to repository events
- **Unattended operation** - Run for hours/days without supervision
- **Consistent execution** - Never forget routine tasks

---

## 🎯 Types of Automated Workflows

### 1. Schedule-Based (Cron)

**Runs at specific times automatically**

```yaml
on:
  schedule:
    - cron: '0 */3 * * *'  # Every 3 hours
```

**Use cases:**
- Health checks
- Data backups
- Report generation
- Dependency updates
- Cache cleanup
- Monitoring tasks

### 2. Event-Driven

**Runs when specific events occur**

```yaml
on:
  push:
    branches: [main]
  pull_request:
  release:
    types: [published]
```

**Use cases:**
- Continuous Integration (CI)
- Automated testing
- Code quality checks
- Deployment pipelines
- Notifications

### 3. Hybrid (Schedule + Events + Manual)

**Combines multiple triggers**

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  push:
    branches: [main]
  workflow_dispatch:  # Also allow manual
```

---

## 🚀 Setting Up Automated Workflows

### Step 1: Create Workflow File

**Location:** `.github/workflows/automated-example.yml`

**Basic structure:**
```yaml
name: Automated Example

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  
  workflow_dispatch:  # Allow manual trigger for testing

jobs:
  automated-job:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run automated task
        run: |
          echo "Running automated task at $(date)"
          # Your automation logic here
```

### Step 2: Understand Cron Syntax

**Format:** `minute hour day month day-of-week`

**Common schedules:**

```yaml
# Every hour at minute 0
'0 * * * *'

# Every 3 hours
'0 */3 * * *'

# Every 6 hours
'0 */6 * * *'

# Every 12 hours (noon and midnight)
'0 */12 * * *'

# Every day at midnight
'0 0 * * *'

# Every day at 9 AM
'0 9 * * *'

# Every Monday at 9 AM
'0 9 * * 1'

# Every weekday at 6 PM
'0 18 * * 1-5'

# Every 30 minutes
'*/30 * * * *'

# Every 15 minutes
'*/15 * * * *'
```

**🛠️ Tools:**
- **crontab.guru** - Interactive cron scheduler
- **GitHub Actions** - Test with workflow_dispatch first

### Step 3: Configure Workflow

**Add necessary setup steps:**

```yaml
steps:
  # Checkout code (if needed)
  - name: Checkout repository
    uses: actions/checkout@v4
  
  # Setup runtime (if needed)
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'
  
  # Install dependencies (if needed)
  - name: Install dependencies
    run: npm install
  
  # Your automated task
  - name: Run task
    run: npm run automated-task
```

### Step 4: Add Error Handling

```yaml
steps:
  - name: Run task with error handling
    run: |
      set -e  # Exit on error
      
      echo "Starting automated task..."
      
      if ./scripts/automated-task.sh; then
        echo "✅ Task completed successfully"
      else
        echo "❌ Task failed"
        exit 1
      fi
    continue-on-error: false  # Stop workflow on failure
```

### Step 5: Configure Notifications

**On failure (example with GitHub API):**

```yaml
- name: Notify on failure
  if: failure()
  run: |
    echo "Automated workflow failed!"
    echo "Run: ${{ github.run_id }}"
    echo "Workflow: ${{ github.workflow }}"
    # Add your notification logic here
```

---

## 📊 Real-World Examples

### Example 1: Hourly Health Check

**Purpose:** Check if services are running every hour

```yaml
name: Hourly Health Check

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    
    steps:
      - name: Check API health
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health)
          
          if [ $response -eq 200 ]; then
            echo "✅ API is healthy"
          else
            echo "❌ API returned HTTP $response"
            exit 1
          fi
      
      - name: Check database connection
        run: |
          # Add database health check
          echo "Checking database..."
      
      - name: Create health report
        if: always()
        run: |
          mkdir -p reports
          echo "Health Check Report - $(date)" > reports/health.txt
          echo "API Status: ${{ job.status }}" >> reports/health.txt
      
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: health-report-${{ github.run_number }}
          path: reports/
```

### Example 2: Nightly Build and Test

**Purpose:** Build and test every night

```yaml
name: Nightly Build

on:
  schedule:
    - cron: '0 0 * * *'  # Midnight daily
  workflow_dispatch:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Run build
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: nightly-build-${{ github.run_number }}
          path: dist/
          retention-days: 7
      
      - name: Notify on failure
        if: failure()
        run: |
          echo "🚨 Nightly build failed!"
          echo "Check logs at: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

### Example 3: Dependency Update Check

**Purpose:** Check for outdated dependencies weekly

```yaml
name: Weekly Dependency Check

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM
  workflow_dispatch:

jobs:
  check-deps:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Check for outdated dependencies
        run: |
          echo "Checking for outdated dependencies..."
          npm outdated > outdated.txt || true
          
          if [ -s outdated.txt ]; then
            echo "📦 Outdated dependencies found:"
            cat outdated.txt
          else
            echo "✅ All dependencies are up to date"
          fi
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: dependency-report-${{ github.run_number }}
          path: outdated.txt
```

### Example 4: Database Backup

**Purpose:** Backup database every 6 hours

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: Create backup
        run: |
          timestamp=$(date +%Y%m%d_%H%M%S)
          backup_name="backup_${timestamp}.sql"
          
          echo "Creating backup: $backup_name"
          # Your backup command here
          # Example: pg_dump or mysqldump
      
      - name: Compress backup
        run: |
          echo "Compressing backup..."
          # gzip backup file
      
      - name: Upload backup
        uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.run_number }}
          path: backup_*.sql.gz
          retention-days: 30
```

### Example 5: Log Rotation

**Purpose:** Cleanup old logs daily

```yaml
name: Daily Log Cleanup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Cleanup old logs
        run: |
          echo "Cleaning up logs older than 30 days..."
          find logs/ -type f -mtime +30 -delete
          
          echo "Compressing logs older than 7 days..."
          find logs/ -type f -mtime +7 -mtime -30 -exec gzip {} \;
          
          echo "Cleanup complete"
      
      - name: Generate cleanup report
        run: |
          echo "Log Cleanup Report - $(date)" > cleanup-report.txt
          echo "Remaining log files:" >> cleanup-report.txt
          ls -lh logs/ >> cleanup-report.txt
      
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: cleanup-report-${{ github.run_number }}
          path: cleanup-report.txt
```

---

## 🔧 Best Practices

### 1. Always Include Manual Trigger

**Why:** Test before letting it run automatically

```yaml
on:
  schedule:
    - cron: '0 */3 * * *'
  workflow_dispatch:  # ← Always include this!
```

**Benefits:**
- Test workflow before schedule activates
- Trigger on-demand when needed
- Debug without waiting for schedule

### 2. Set Appropriate Timeouts

```yaml
jobs:
  automated-job:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # Prevent hanging workflows
```

**Guidelines:**
- Quick checks: 5-10 minutes
- Builds/tests: 30-60 minutes
- Heavy processing: Up to 360 minutes (max)

### 3. Use Concurrency Control

**Prevent overlapping runs:**

```yaml
concurrency:
  group: automated-workflow
  cancel-in-progress: false  # Let current run finish
```

**Or cancel old runs:**

```yaml
concurrency:
  group: automated-workflow
  cancel-in-progress: true  # Cancel if new run starts
```

### 4. Implement Retry Logic

```yaml
- name: Task with retries
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: ./scripts/flaky-task.sh
```

### 5. Monitor and Alert

**Create summary:**

```yaml
- name: Create summary
  if: always()
  run: |
    echo "## Workflow Summary" >> $GITHUB_STEP_SUMMARY
    echo "- Status: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY
    echo "- Duration: $(date -u -d @$SECONDS +%T)" >> $GITHUB_STEP_SUMMARY
```

### 6. Manage Artifacts Retention

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: results
    path: output/
    retention-days: 7  # Don't keep forever!
```

**Retention guidelines:**
- Test results: 7 days
- Build artifacts: 14 days
- Backups: 30+ days
- Reports: 30 days

### 7. Use Caching

**Speed up workflows:**

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 8. Environment Variables

```yaml
env:
  NODE_ENV: production
  TZ: America/New_York  # Set timezone

jobs:
  automated-job:
    runs-on: ubuntu-latest
    env:
      API_URL: https://api.example.com
```

---

## 📊 Monitoring Automated Workflows

### Viewing Run History

**GitHub Web:**
1. Repository → Actions tab
2. Select workflow from left
3. View all runs with status

**GitHub CLI:**
```bash
# List recent runs
gh run list --workflow automated-test.yml --limit 20

# View specific run
gh run view <run-id>
```

### Checking for Failures

**GitHub Web:**
- Failed runs show red X
- Click to view error logs
- Check which step failed

**Email Notifications:**
1. GitHub Settings → Notifications
2. Enable "Actions"
3. Choose notification preferences

### Tracking Metrics

**Create dashboard:**
- Note patterns in failures
- Track run durations
- Monitor success rates
- Identify performance issues

---

## 🐛 Troubleshooting

### Workflow Not Running on Schedule

**Common causes:**

1. **Repository inactive:**
   - GitHub disables workflows if no activity for 60 days
   - Fix: Make a commit or manually run workflow

2. **Workflow disabled:**
   - Check Actions tab for disabled state
   - Re-enable in Actions settings

3. **Cron syntax error:**
   - Verify at crontab.guru
   - Test with workflow_dispatch first

4. **GitHub Actions quota:**
   - Check if you've exceeded limits
   - Review billing/usage

### Workflow Failing Intermittently

**Debugging steps:**

1. **Add logging:**
```yaml
- name: Debug information
  run: |
    echo "Runner: ${{ runner.os }}"
    echo "Time: $(date)"
    env | sort
```

2. **Check external dependencies:**
   - API rate limits
   - Network issues
   - Service availability

3. **Add retries:**
   - Use retry action
   - Implement custom retry logic

### Resource Constraints

**If workflows timeout or fail:**

1. **Optimize workflow:**
   - Use caching
   - Run jobs in parallel
   - Skip unnecessary steps

2. **Split into multiple workflows:**
   - Separate heavy tasks
   - Use workflow dependencies

---

## ✅ Testing Automated Workflows

### Before Scheduling

**Test workflow manually first:**

1. Add workflow_dispatch trigger
2. Run manually several times
3. Verify all steps work
4. Check artifacts created properly
5. Confirm notifications work

### During Initial Period

**Monitor closely:**

1. Watch first few scheduled runs
2. Check for consistent success
3. Verify timing is correct
4. Confirm artifacts handled properly

### Ongoing Maintenance

**Regular checks:**

1. Review run history weekly
2. Investigate failures promptly
3. Update dependencies
4. Optimize as needed

---

## 🎯 Quick Reference

### Common Cron Schedules

```yaml
# Every hour
'0 * * * *'

# Every 3 hours
'0 */3 * * *'

# Daily at midnight
'0 0 * * *'

# Every weekday at 9 AM
'0 9 * * 1-5'

# Weekly on Monday
'0 0 * * 1'
```

### Essential Workflow Structure

```yaml
name: My Automated Workflow

on:
  schedule:
    - cron: '0 * * * *'
  workflow_dispatch:

jobs:
  automated-job:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - uses: actions/checkout@v4
      - name: Run task
        run: echo "Automated task"
```

---

## 🎯 Next Steps

1. ✅ Create your first automated workflow
2. ✅ Test manually with workflow_dispatch
3. ✅ Enable schedule
4. ✅ Monitor first few runs
5. ✅ Set up notifications
6. ✅ Optimize and iterate

---

**Last Updated:** October 3, 2025  
**Guide Version:** 1.0  
**For:** github-actions-test1 repository

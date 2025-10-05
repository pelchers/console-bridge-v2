# Troubleshooting Guide - GitHub Actions

Comprehensive troubleshooting guide for GitHub Actions across all platforms and common issues.

---

## 📋 Table of Contents

1. [Workflow Issues](#workflow-issues)
2. [Trigger Problems](#trigger-problems)
3. [Job Failures](#job-failures)
4. [Permission Errors](#permission-errors)
5. [Platform-Specific Issues](#platform-specific-issues)
6. [Performance Problems](#performance-problems)
7. [Secret & Security Issues](#secret--security-issues)
8. [Diagnostic Commands](#diagnostic-commands)
9. [Getting Help](#getting-help)

---

## Workflow Issues

### Workflow Not Appearing in Actions Tab

**Symptoms:**
- Workflow file exists but doesn't show in UI
- Can't trigger manually
- No runs appear

**Causes & Solutions:**

**1. YAML Syntax Error:**
```bash
# Check syntax
yamllint .github/workflows/your-workflow.yml

# Or use online validator
# Copy workflow content to http://www.yamllint.com/
```

**Fix:**
- Common issues: Incorrect indentation, missing colons, wrong quotes
- Use 2-space indentation consistently
- Validate before committing

**2. Wrong File Location:**
```
❌ .github/workflow/deploy.yml
✅ .github/workflows/deploy.yml (note the 's')
```

**3. Not Pushed to GitHub:**
```bash
# Verify file is on GitHub
git status
git add .github/workflows/
git commit -m "Add workflow"
git push origin main
```

**4. Branch Issues:**
- Workflows only visible on branches they exist on
- Check you're viewing the correct branch

**5. Actions Disabled:**
```
Repository → Settings → Actions → General
Ensure "Allow all actions and reusable workflows" is selected
```

### Workflow File Changes Not Taking Effect

**Symptoms:**
- Modified workflow but old version runs
- New inputs don't appear
- Old steps still executing

**Causes & Solutions:**

**1. Not Committed/Pushed:**
```bash
git status  # Check if file is staged
git add .github/workflows/your-workflow.yml
git commit -m "Update workflow"
git push
```

**2. Wrong Branch:**
- Workflows run from the branch they're triggered on
- If you edited on `main` but running on `develop`, uses `develop` version

**3. Cached Runner (Self-Hosted):**
- Self-hosted runners may cache workflow files
- Restart runner: `./svc.sh stop && ./svc.sh start`

**4. GitHub Sync Delay:**
- Wait 10-15 seconds after push
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

---

## Trigger Problems

### Schedule Not Running

**Symptoms:**
- Cron schedule configured but workflow doesn't run
- Last run was days/weeks ago

**Causes & Solutions:**

**1. Repository Inactive:**
- GitHub disables scheduled workflows after 60 days of no repository activity

**Fix:**
```bash
# Make any commit to wake it up
git commit --allow-empty -m "Wake up scheduled workflows"
git push
```

**2. Cron Syntax Error:**
```yaml
# ❌ Wrong (61 minutes invalid)
schedule:
  - cron: '61 * * * *'

# ✅ Correct
schedule:
  - cron: '0 * * * *'  # Every hour
```

**Verify at:** https://crontab.guru/

**3. Default Branch Only:**
- Scheduled workflows only run on default branch
- Check Settings → General → Default branch

**4. Too Frequent:**
- Minimum interval: 5 minutes
- GitHub may throttle if too frequent

**5. High Load:**
- Scheduled workflows may be delayed during peak times
- Not guaranteed exact timing

### Manual Trigger Not Available

**Symptoms:**
- "Run workflow" button missing
- Can't trigger via CLI
- workflow_dispatch not working

**Causes & Solutions:**

**1. Missing workflow_dispatch:**
```yaml
# ❌ No manual trigger
on:
  push:

# ✅ With manual trigger
on:
  push:
  workflow_dispatch:
```

**2. Wrong Branch:**
- Can only trigger on branches where workflow exists
- Switch to correct branch in UI

**3. Permissions:**
- Need write access to repository
- Collaborators need appropriate permissions

**4. Recently Pushed:**
- Wait 10-15 seconds after pushing
- Refresh page

### workflow_dispatch Inputs Not Showing

**Symptoms:**
- Run workflow button appears but no input form
- Inputs defined but not visible

**Causes & Solutions:**

**1. Syntax Error:**
```yaml
# ❌ Wrong indentation
on:
  workflow_dispatch:
  inputs:
    my_input:
      description: 'Input'

# ✅ Correct indentation
on:
  workflow_dispatch:
    inputs:
      my_input:
        description: 'Input'
```

**2. Type Not Specified:**
```yaml
# ⚠️ May not render correctly
inputs:
  my_choice:
    description: 'Choose option'
    options: [a, b, c]

# ✅ Specify type
inputs:
  my_choice:
    description: 'Choose option'
    type: choice
    options: [a, b, c]
```

**3. Browser Cache:**
- Hard refresh (Ctrl+Shift+R)
- Try incognito mode
- Try different browser

---

## Job Failures

### "Process completed with exit code 1"

**Meaning:** A command in your workflow failed

**Debugging Steps:**

**1. Find the failing step:**
- Click on failed job in UI
- Expand steps to find red X
- Read error message carefully

**2. Check logs:**
```yaml
# Add debug logging
- name: Failing step
  run: |
    set -x  # Enable debug mode
    echo "Starting..."
    # Your command here
```

**3. Common causes:**
- Command not found: Install missing dependency
- File not found: Check paths
- Permission denied: Check file permissions
- Test failed: Fix the test

**4. Reproduce locally:**
```bash
# Run commands from workflow locally
npm test
# Fix issues
# Then push
```

### "Could not find action"

**Symptoms:**
```
Error: Could not find action at 'actions/checkout@v99'
```

**Causes & Solutions:**

**1. Version Doesn't Exist:**
```yaml
# ❌ Version doesn't exist
uses: actions/checkout@v99

# ✅ Use existing version
uses: actions/checkout@v4
```

**2. Typo in Action Name:**
```yaml
# ❌ Typo
uses: actions/check-out@v4

# ✅ Correct
uses: actions/checkout@v4
```

**3. Private Action Without Access:**
```yaml
# Using private action without permission
uses: private-org/private-action@v1
```

**Fix:** Grant repository access to private action

**4. Action Deleted/Moved:**
- Action repository may have been deleted
- Find alternative or fork it

### npm/node/python Command Not Found

**Symptoms:**
```
sh: npm: command not found
```

**Cause:** Runtime not installed on runner

**Solution:**
```yaml
steps:
  # Add setup step BEFORE using command
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'
  
  # Now npm is available
  - name: Install dependencies
    run: npm install
```

**For other languages:**
```yaml
# Python
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'

# Java
- uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '17'

# Go
- uses: actions/setup-go@v5
  with:
    go-version: '1.21'
```

### Timeout Errors

**Symptoms:**
```
The job running on runner has exceeded the maximum execution time of 360 minutes.
```

**Solutions:**

**1. Increase timeout:**
```yaml
jobs:
  long-job:
    timeout-minutes: 480  # 8 hours (max)
    steps: [...]
```

**2. Optimize workflow:**
- Use caching
- Run jobs in parallel
- Skip unnecessary steps

**3. Split into multiple jobs:**
```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps: [...]
  
  job2:
    needs: job1
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps: [...]
```

---

## Permission Errors

### "Resource not accessible by integration"

**Symptoms:**
```
Error: Resource not accessible by integration
HttpError: Resource not accessible by integration
```

**Cause:** GITHUB_TOKEN lacks required permissions

**Solution:**
```yaml
# Add permissions at workflow level
permissions:
  contents: write    # Read/write code
  issues: write      # Write to issues
  pull-requests: write  # Write to PRs

jobs:
  my-job:
    runs-on: ubuntu-latest
    steps: [...]
```

**Or at job level:**
```yaml
jobs:
  my-job:
    permissions:
      contents: write
      issues: write
    steps: [...]
```

### "Secret not found"

**Symptoms:**
```
Error: Secret MY_SECRET not found
```

**Solutions:**

**1. Secret doesn't exist:**
- Repository → Settings → Secrets and variables → Actions
- Click "New repository secret"
- Add secret with exact name

**2. Wrong scope:**
- Environment secrets: Only available with `environment:` specified
- Organization secrets: Check allowed repositories

**3. Name mismatch:**
```yaml
# ❌ Wrong case
env:
  KEY: ${{ secrets.my_secret }}

# ✅ Exact name (case-sensitive)
env:
  KEY: ${{ secrets.MY_SECRET }}
```

**4. Access from fork:**
- Forks don't have access to secrets
- Use pull_request_target carefully

### "Permission denied" (File System)

**Symptoms:**
```
Permission denied: /some/path
```

**Solutions:**

**1. File permissions:**
```yaml
- name: Fix permissions
  run: |
    chmod +x script.sh
    ./script.sh
```

**2. Directory permissions:**
```yaml
- name: Create writable directory
  run: |
    mkdir -p build
    chmod 755 build
```

**3. Using sudo (self-hosted only):**
```yaml
# ⚠️ Only on self-hosted runners
- run: sudo apt-get update
```

---

## Platform-Specific Issues

### GitHub Web

**Issue: Workflow editor not saving**

**Solutions:**
- Check browser console (F12) for errors
- Disable browser extensions
- Try different browser
- Use "..." menu → "Delete this file" and recreate

**Issue: Logs not loading**

**Solutions:**
- Hard refresh (Ctrl+Shift+R)
- Check network tab for failed requests
- Try private/incognito window
- Check GitHub status page

### GitHub Mobile

**Issue: Actions tab not showing**

**Solutions:**
- Update GitHub mobile app
- Force close and reopen
- Check repository permissions
- Verify Actions are enabled for repo

**Issue: Can't trigger workflow**

**Solutions:**
- Ensure you have write access
- Workflow must have `workflow_dispatch` trigger
- Switch to correct branch
- Update mobile app

**Issue: Logs showing as blank**

**Solutions:**
- Switch to landscape mode
- Pull down to refresh
- Close app and reopen
- Try viewing on web

### GitHub CLI

**Issue: "gh: command not found"**

**Solutions:**
```bash
# Install gh
# macOS:
brew install gh

# Windows:
choco install gh

# Linux:
# See https://github.com/cli/cli#installation

# Verify:
gh --version
```

**Issue: "Not authenticated"**

**Solutions:**
```bash
# Authenticate
gh auth login

# Follow prompts

# Verify
gh auth status
```

**Issue: "Workflow not found"**

**Solutions:**
```bash
# List workflows to see exact names
gh workflow list

# Use exact file name
gh workflow run exact-name.yml
```

### Claude Platforms

**Issue: Claude doesn't understand my request**

**Solutions:**
- Be more specific
- Provide context about your repository
- Include error messages in your question
- Break complex questions into steps

**Issue: Claude provides outdated info**

**Solutions:**
- Mention you want current information
- Verify with official GitHub docs
- Ask Claude to note if uncertain

---

## Performance Problems

### Slow Workflow Execution

**Symptoms:**
- Jobs take much longer than expected
- Steps are slow

**Solutions:**

**1. Use caching:**
```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

**2. Parallelize jobs:**
```yaml
jobs:
  test-1:
    runs-on: ubuntu-latest
    steps: [...]
  
  test-2:  # Runs parallel to test-1
    runs-on: ubuntu-latest
    steps: [...]
```

**3. Optimize checkout:**
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1  # Shallow clone
```

**4. Use appropriate runner:**
```yaml
# If you need more resources
runs-on: ubuntu-latest-8-cores  # More powerful (paid plans)
```

### Runner Queue Delays

**Symptoms:**
- Job shows "Queued" for extended time
- Workflow starts minutes after trigger

**Causes:**
- High demand for GitHub-hosted runners
- Self-hosted runner offline
- Concurrency limits reached

**Solutions:**

**1. For GitHub-hosted runners:**
- Wait (usually resolves in minutes)
- Use self-hosted runner for critical workflows
- Spread out scheduled workflows

**2. For self-hosted runners:**
```bash
# Check runner status
./run.sh --check

# Restart if needed
./svc.sh stop
./svc.sh start
```

**3. Check concurrency limits:**
```yaml
# Review and adjust
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## Secret & Security Issues

### Secret Appears in Logs

**Symptoms:**
- Secret value visible in logs
- `***` masking not working

**Causes:**

**1. Echoed directly:**
```yaml
# ❌ EXPOSED
- run: echo ${{ secrets.MY_SECRET }}
```

**Solution:**
```yaml
# ✅ SAFE - Use env var
- env:
    MY_SECRET: ${{ secrets.MY_SECRET }}
  run: echo "Secret is set (value hidden)"
```

**2. Transformed secret:**
```yaml
# ❌ May not be masked
- run: echo ${{ secrets.MY_SECRET }} | base64
```

**Solution:**
- Don't transform or echo secrets
- Use them in env variables only

### "Could not verify secret"

**Symptoms:**
- Secret validation fails
- API returns authentication error

**Solutions:**

**1. Secret has expired:**
- Rotate the secret
- Update in GitHub Settings

**2. Secret format wrong:**
- Check secret format (no extra spaces, newlines)
- Regenerate secret from source

**3. Wrong secret used:**
- Verify you're using correct secret name
- Check if secret should be environment-specific

---

## Diagnostic Commands

### Workflow Debugging

**Add debug output:**
```yaml
- name: Debug info
  run: |
    echo "::group::Environment"
    echo "Runner OS: ${{ runner.os }}"
    echo "Runner arch: ${{ runner.arch }}"
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    echo "Actor: ${{ github.actor }}"
    echo "::endgroup::"
    
    echo "::group::Paths"
    echo "Current directory: $(pwd)"
    echo "Home directory: $HOME"
    echo "Workspace: $GITHUB_WORKSPACE"
    echo "::endgroup::"
    
    echo "::group::Environment Variables"
    env | sort
    echo "::endgroup::"
```

### Check File System

```yaml
- name: Check files
  run: |
    echo "Current directory contents:"
    ls -la
    
    echo "Repository structure:"
    find . -type f -not -path '*/\.*' | head -20
    
    echo "Check specific file:"
    if [ -f "package.json" ]; then
      echo "package.json exists"
      cat package.json
    else
      echo "package.json not found"
    fi
```

### Network Debugging

```yaml
- name: Network check
  run: |
    echo "DNS resolution:"
    nslookup api.example.com
    
    echo "Connectivity:"
    ping -c 3 api.example.com || true
    
    echo "HTTP test:"
    curl -v https://api.example.com/health
```

### GitHub CLI Diagnostics

```bash
# Check authentication
gh auth status

# List workflows
gh workflow list

# View workflow details
gh workflow view workflow-name.yml

# Check recent runs
gh run list --limit 10

# View specific run
gh run view RUN_ID

# Download logs
gh run view RUN_ID --log > logs.txt

# Check API rate limit
gh api rate_limit
```

---

## Getting Help

### Information to Provide

When asking for help, include:

1. **Workflow file** (or relevant section)
2. **Error message** (exact text)
3. **Logs** (from failing step)
4. **What you've tried** already
5. **Expected vs actual** behavior

**Example:**

```
Problem: Workflow fails with "npm: command not found"

Workflow:
```yaml
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install  # Fails here
```

Error: "sh: 1: npm: command not found"

Tried:
- Checked package.json exists
- Works locally

Expected: npm installs dependencies
Actual: npm not found error
```

### Where to Get Help

**1. Official Documentation:**
- https://docs.github.com/actions
- Most comprehensive and up-to-date

**2. GitHub Community:**
- https://github.community/
- Other users with similar issues

**3. Stack Overflow:**
- Tag: `github-actions`
- Search before posting

**4. Claude AI:**
- Ask specific questions
- Provide context and error messages
- Get explanations and solutions

**5. Repository Issues:**
- For action-specific problems
- Check action's repository issues

### Self-Help Checklist

Before asking for help:

- [ ] Read error message carefully
- [ ] Check workflow syntax
- [ ] Verify file exists and is committed
- [ ] Check permissions
- [ ] Try on different branch
- [ ] Clear browser cache
- [ ] Check GitHub status page
- [ ] Search for similar issues
- [ ] Try reproducing locally
- [ ] Review recent changes

---

## Quick Reference

### Common Error Patterns

| Error Message | Likely Cause | Quick Fix |
|--------------|--------------|-----------|
| "command not found" | Missing runtime | Add setup action |
| "exit code 1" | Command failed | Check logs for actual error |
| "Resource not accessible" | Missing permissions | Add permissions to workflow |
| "Could not find action" | Wrong action reference | Check action name/version |
| "Secret not found" | Secret doesn't exist | Add secret in Settings |
| "Permission denied" | File permissions | chmod +x file |
| "Timeout" | Job too slow | Optimize or increase timeout |
| "Workflow not found" | File not on branch | Ensure pushed to correct branch |

### Debug Mode

**Enable step debug logging:**

1. Repository → Settings → Secrets
2. Add secret: `ACTIONS_STEP_DEBUG` = `true`
3. Re-run workflow
4. View detailed logs

**Enable runner debug logging:**

1. Add secret: `ACTIONS_RUNNER_DEBUG` = `true`
2. Re-run workflow
3. View very detailed logs

---

## 📚 Resources

- **GitHub Actions Documentation:** https://docs.github.com/actions
- **GitHub Status:** https://www.githubstatus.com/
- **Community Forum:** https://github.community/
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/github-actions

---

**Last Updated:** October 3, 2025  
**Version:** 1.0  
**For:** github-actions-test1 repository

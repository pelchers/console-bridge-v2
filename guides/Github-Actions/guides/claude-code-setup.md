# Claude Code CLI - GitHub Actions Setup Guide

A comprehensive guide for using GitHub Actions workflows from the Claude Code command-line interface.

---

## 📋 Overview

Claude Code is a powerful CLI tool that combines Claude AI assistance with command-line development workflows. This guide shows you how to:
- Trigger GitHub Actions workflows from the terminal
- Monitor workflow execution in real-time
- Download and review workflow artifacts
- Create and modify workflows with Claude's assistance
- Automate complex development tasks

---

## 🔧 Prerequisites

### Required:
- ✅ Claude Code CLI installed
- ✅ GitHub CLI (`gh`) installed and authenticated
- ✅ GitHub account with repository access
- ✅ Repository with GitHub Actions workflows
- ✅ Terminal/command prompt access

### Recommended:
- Git installed and configured
- Basic command-line knowledge
- Understanding of GitHub Actions basics

---

## 🚀 Setup Steps

### Step 1: Install GitHub CLI

**Windows (PowerShell as Administrator):**
```powershell
# Using Chocolatey
choco install gh

# Or using winget
winget install --id GitHub.cli
```

**macOS:**
```bash
# Using Homebrew
brew install gh
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora/RHEL
sudo dnf install gh

# Arch
sudo pacman -S github-cli
```

**Verify Installation:**
```bash
gh --version
# Should output: gh version X.X.X
```

### Step 2: Authenticate GitHub CLI

```bash
# Start authentication
gh auth login

# Follow prompts:
# 1. Choose: GitHub.com
# 2. Choose: HTTPS or SSH
# 3. Choose: Login with a web browser (recommended)
# 4. Copy one-time code
# 5. Press Enter to open browser
# 6. Paste code and authorize

# Verify authentication
gh auth status
# Should show: ✓ Logged in to github.com as YOUR_USERNAME
```

### Step 3: Install Claude Code CLI

**Installation:**
```bash
# Follow instructions at https://docs.claude.com/claude-code
# Installation method varies by platform

# Verify installation
claude --version
```

### Step 4: Configure Repository Access

```bash
# Navigate to your repository
cd path/to/github-actions-test1

# Or clone it
gh repo clone YOUR_USERNAME/github-actions-test1
cd github-actions-test1

# Verify you're in the correct repo
gh repo view
```

---

## 💻 Using Claude Code with GitHub Actions

### Method 1: Direct GitHub CLI Commands

#### List Available Workflows
```bash
gh workflow list

# Expected output:
# Manual Task Workflow  manual-task.yml   active  123456
# Automated Test Workflow  automated-test.yml  active  123457
# Validation Workflow  validate.yml  active  123458
```

#### Trigger a Workflow (Simple)
```bash
# Basic manual trigger (no parameters)
gh workflow run automated-test.yml

# Success message:
# ✓ Created workflow_dispatch event for automated-test.yml at main
```

#### Trigger with Parameters
```bash
# Manual task workflow with parameters
gh workflow run manual-task.yml \
  -f task_type=test \
  -f task_description="Testing from Claude Code" \
  -f verbose=true

# Validation workflow with level
gh workflow run validate.yml \
  -f validation_level=comprehensive
```

#### Monitor Workflow Execution
```bash
# Watch the latest workflow run
gh run watch

# Output updates in real-time:
# ✓ main · Manual Task Workflow #42 · 1m23s
#   ✓ Manual Task Workflow
#     ✓ Checkout repository
#     ✓ Display task information
#     ✓ Setup Node.js
#     ⣾ Execute task - Test
```

#### View Workflow Results
```bash
# List recent runs
gh run list --limit 10

# View specific run
gh run view <run-id>

# View with logs
gh run view <run-id> --log

# View logs for specific job
gh run view <run-id> --log --job <job-id>
```

#### Download Artifacts
```bash
# Download all artifacts from latest run
gh run download

# Download from specific run
gh run download <run-id>

# Download to specific directory
gh run download <run-id> --dir ./my-artifacts

# List artifacts without downloading
gh run view <run-id> | grep -A 10 "Artifacts"
```

### Method 2: Using Claude Code for Assistance

#### Ask Claude Code to Trigger Workflows

**Example 1: Simple Trigger**
```bash
claude "Trigger the manual-task workflow with task type 'test'"
```

**Claude Code will:**
- Understand your intent
- Generate the appropriate command
- Execute it for you (if configured)
- Show you the results

**Example 2: Complex Trigger**
```bash
claude "Run the manual task workflow with:
  - task type: build
  - description: 'Building production release'
  - files to process: src/
  - verbose mode enabled"
```

**Claude Code generates:**
```bash
gh workflow run manual-task.yml \
  -f task_type=build \
  -f task_description="Building production release" \
  -f files_to_process="src/" \
  -f verbose=true
```

#### Ask Claude Code to Monitor Workflows

```bash
claude "Show me the status of my latest workflow run"

# Or more specific:
claude "Monitor my manual-task workflow that just started"
```

**Claude Code will:**
- Run `gh run list` to find the latest run
- Run `gh run watch` to monitor it
- Interpret results for you
- Alert you when it completes

#### Ask Claude Code to Analyze Results

```bash
claude "My workflow failed. Can you check the logs and tell me what went wrong?"
```

**Claude Code will:**
- Fetch the latest run logs
- Analyze the error
- Explain what happened
- Suggest fixes
- Optionally apply fixes if you confirm

---

## 🎯 Common Workflows

### Workflow 1: Quick Test Run

**Goal:** Run tests quickly from command line

```bash
# Using GitHub CLI
gh workflow run manual-task.yml \
  -f task_type=test \
  -f task_description="Quick test from CLI"

# Watch it run
gh run watch

# Or ask Claude Code
claude "Run a quick test using the manual task workflow"
```

### Workflow 2: Monitor Automated Runs

**Goal:** Check on scheduled workflow executions

```bash
# List recent automated runs
gh run list --workflow=automated-test.yml --limit 5

# View details of latest
gh run view --workflow=automated-test.yml

# Or ask Claude Code
claude "Show me the last 5 automated test runs and their status"
```

### Workflow 3: Build and Validate

**Goal:** Trigger build, wait, then validate

**Script:**
```bash
#!/bin/bash

# Trigger build
echo "Starting build..."
gh workflow run manual-task.yml \
  -f task_type=build \
  -f task_description="CLI triggered build"

# Wait a moment for workflow to start
sleep 5

# Watch build
echo "Monitoring build..."
gh run watch

# Trigger validation
echo "Starting validation..."
gh workflow run validate.yml \
  -f validation_level=comprehensive

# Watch validation
gh run watch

echo "Build and validation complete!"
```

**Or ask Claude Code:**
```bash
claude "Create a script that builds the project and then runs validation"
```

### Workflow 4: Bulk Artifact Download

**Goal:** Download artifacts from multiple recent runs

```bash
# Get last 5 run IDs
run_ids=$(gh run list --limit 5 --json databaseId --jq '.[].databaseId')

# Download each
for run_id in $run_ids; do
  echo "Downloading artifacts from run $run_id"
  gh run download $run_id --dir "artifacts/run-$run_id"
done

# Or ask Claude Code
claude "Download artifacts from the last 5 workflow runs"
```

---

## 🔨 Advanced Usage

### Creating Workflows with Claude Code

**Ask Claude Code:**
```bash
claude "Create a new GitHub Actions workflow that:
  - Runs on push to main
  - Installs Node.js 20
  - Runs npm install
  - Runs tests with npm test
  - Uploads test results as artifacts
Save it as .github/workflows/ci.yml"
```

**Claude Code will:**
1. Generate complete YAML file
2. Create the file in correct location
3. Explain what each section does
4. Ask if you want to commit it

### Modifying Existing Workflows

**Ask Claude Code:**
```bash
claude "Update the manual-task workflow to add a new task type called 'deploy' 
that runs a deployment script"
```

**Claude Code will:**
1. Read the existing workflow file
2. Add the new task type option
3. Add the deployment step
4. Show you the diff
5. Ask if you want to save changes

### Debugging Failed Workflows

**When a workflow fails:**

```bash
# Get the failing run ID
gh run list --workflow=manual-task.yml --limit 1

# Ask Claude Code to diagnose
claude "Analyze the failure in run <run-id> and suggest a fix"
```

**Claude Code will:**
- Fetch the full logs
- Identify the failing step
- Explain the error
- Suggest specific fixes
- Optionally create a fix PR

### Creating Custom Commands

**Create aliases for common tasks:**

**~/.bashrc or ~/.zshrc:**
```bash
# Trigger test
alias gh-test='gh workflow run manual-task.yml -f task_type=test'

# Trigger build
alias gh-build='gh workflow run manual-task.yml -f task_type=build'

# Watch latest
alias gh-watch='gh run watch'

# View latest logs
alias gh-logs='gh run view --log'

# Ask Claude Code
alias gh-claude='claude'
```

**Usage:**
```bash
gh-test
gh-watch
gh-claude "What tests ran?"
```

---

## 🐛 Troubleshooting

### Issue: "gh: command not found"

**Solution:**
```bash
# Verify installation
which gh

# If not found, reinstall:
# See Step 1 of Setup Steps above

# Verify PATH includes gh
echo $PATH | grep gh
```

### Issue: "gh auth status shows not logged in"

**Solution:**
```bash
# Re-authenticate
gh auth login

# Check status
gh auth status

# If still issues, logout and login again
gh auth logout
gh auth login
```

### Issue: "workflow not found"

**Solution:**
```bash
# Verify you're in correct repository
gh repo view

# List workflows to see exact names
gh workflow list

# Verify workflow file exists locally
ls -la .github/workflows/

# If files exist but not listed, push to GitHub
git push origin main
```

### Issue: "Failed to create workflow_dispatch event"

**Ask Claude Code:**
```bash
claude "I'm getting 'failed to create workflow_dispatch event'. Help diagnose."
```

**Common causes Claude Code will check:**
- Workflow doesn't have `workflow_dispatch` trigger
- You don't have write access to repository
- GitHub API is down
- Workflow file has syntax errors

### Issue: "Artifacts not downloading"

**Solution:**
```bash
# Check if artifacts exist
gh run view <run-id>

# Look for "Artifacts:" section
# If none shown, workflow may not create artifacts

# Try explicit artifact download
gh api \
  repos/:owner/:repo/actions/runs/<run-id>/artifacts \
  --jq '.artifacts[].name'

# Ask Claude Code for help
claude "Why can't I download artifacts from run <run-id>?"
```

---

## 📊 Best Practices

### 1. Use Meaningful Descriptions

**Good:**
```bash
gh workflow run manual-task.yml \
  -f task_type=test \
  -f task_description="Testing payment integration with updated API v2"
```

**Bad:**
```bash
gh workflow run manual-task.yml \
  -f task_type=test \
  -f task_description="test"
```

### 2. Monitor Long-Running Workflows

```bash
# Don't just fire-and-forget
gh workflow run my-long-workflow.yml

# Do: Watch it
gh workflow run my-long-workflow.yml && gh run watch
```

### 3. Automate with Scripts

**Create reusable scripts:**
```bash
# test-and-deploy.sh
#!/bin/bash

set -e  # Exit on error

echo "Running tests..."
gh workflow run manual-task.yml -f task_type=test
sleep 10
gh run watch

echo "Tests passed! Deploying..."
gh workflow run manual-task.yml -f task_type=deploy
gh run watch

echo "Deployment complete!"
```

### 4. Use Claude Code for Complex Tasks

**Instead of:**
```bash
# Manually constructing complex commands
gh workflow run ... # (long complex command)
```

**Do:**
```bash
claude "I need to run tests on all the files in src/components 
with verbose output and create a detailed report"
```

### 5. Keep Logs Organized

```bash
# Save logs for later review
gh run view <run-id> --log > logs/run-<run-id>.log

# Or ask Claude Code
claude "Save the logs from the last 5 runs to the logs/ directory"
```

---

## 🎓 Learning Resources

### GitHub CLI Documentation
- **GitHub CLI Manual:** https://cli.github.com/manual/
- **gh workflow commands:** `gh workflow --help`
- **gh run commands:** `gh run --help`

### Learning with Claude Code

**Ask Claude Code questions like:**
```bash
claude "Explain what workflow_dispatch means in GitHub Actions"
claude "Show me examples of using workflow inputs"
claude "What's the difference between gh run view and gh run watch?"
claude "How do I use GitHub Actions secrets from the CLI?"
```

### Practice Commands

```bash
# Get help on any command
gh workflow --help
gh run --help

# Ask Claude Code to create a tutorial
claude "Create a tutorial script that teaches me GitHub Actions CLI basics"
```

---

## ✅ Quick Reference Card

### Essential Commands

```bash
# List workflows
gh workflow list

# Trigger workflow
gh workflow run <workflow-file>

# Trigger with parameters
gh workflow run <workflow-file> -f key=value

# List runs
gh run list

# Watch latest run
gh run watch

# View run details
gh run view <run-id>

# View logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>

# Ask Claude Code
claude "your question or task"
```

### Useful Aliases

```bash
alias gwl='gh workflow list'
alias gwr='gh workflow run'
alias grl='gh run list'
alias grw='gh run watch'
alias grv='gh run view'
alias grd='gh run download'
```

---

## 🎯 Next Steps

1. ✅ Set up GitHub CLI authentication
2. ✅ Practice triggering workflows manually
3. ✅ Create custom scripts for common tasks
4. ✅ Set up helpful aliases
5. ✅ Integrate Claude Code into your workflow
6. ✅ Automate repetitive tasks

---

**Last Updated:** October 3, 2025  
**Guide Version:** 1.0  
**For:** github-actions-test1 repository

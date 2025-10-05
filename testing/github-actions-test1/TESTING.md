# Testing Guide for GitHub Actions

Complete guide for testing GitHub Actions workflows across all platforms.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Testing via GitHub Web](#testing-via-github-web)
3. [Testing via GitHub Mobile](#testing-via-github-mobile)
4. [Testing via Claude Desktop App](#testing-via-claude-desktop-app)
5. [Testing via Claude Code CLI](#testing-via-claude-code-cli)
6. [Testing via Claude Mobile App](#testing-via-claude-mobile-app)
7. [Automated Testing (Unattended)](#automated-testing-unattended)
8. [Verification Steps](#verification-steps)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required:
- ✅ GitHub account
- ✅ This repository pushed to GitHub
- ✅ GitHub Actions enabled (automatic for most repos)

### Optional:
- GitHub CLI (`gh`) for command-line access
- Claude Desktop app
- Claude mobile app
- GitHub mobile app

---

## Testing via GitHub Web

### Method 1: Manual Workflow Trigger

1. **Navigate to your repository** on github.com
2. **Click the "Actions" tab** at the top
3. **Select a workflow** from the left sidebar:
   - "Automated Test Workflow"
   - "Manual Task Workflow"
   - "Validation Workflow"
4. **Click "Run workflow"** button (top right)
5. **Fill in parameters** (if required):
   - For Manual Task: Choose task type, enter description
   - For Automated Test: Optionally enter custom message
   - For Validation: Choose validation level
6. **Click "Run workflow"** to start
7. **Monitor progress** - page auto-refreshes
8. **View results** once complete (green checkmark)

### Method 2: View Scheduled Runs

1. Go to **Actions tab**
2. Select **"Automated Test Workflow"**
3. See list of past runs (runs every 3 hours)
4. Click any run to see details

### Method 3: Download Artifacts

1. Open a **completed workflow run**
2. Scroll to **"Artifacts"** section (bottom)
3. Click artifact name to **download**
4. Extract and view results

---

## Testing via GitHub Mobile

### Setup:
1. **Install GitHub Mobile app** (iOS/Android)
2. **Sign in** to your GitHub account
3. **Navigate to** your repository

### Running Workflows:

1. **Tap "Actions"** tab (bottom navigation)
2. **Select workflow** from list
3. **Tap "Run workflow"** button
4. **Fill in parameters** using mobile form
5. **Tap "Run workflow"** to execute
6. **Monitor progress** with pull-to-refresh
7. **Tap on run** to see detailed logs

### Tips for Mobile:
- Use landscape mode for better log viewing
- Enable notifications for workflow completion
- Download artifacts via mobile browser (GitHub notifications)

---

## Testing via Claude Desktop App

### Prerequisites:
- Claude Desktop app installed
- GitHub integration configured (if available)

### Method 1: Via Claude's Computer Use

**Ask Claude to:**
```
"Trigger the manual-task workflow in my github-actions-test1 repository 
with task_type=test and description='Testing from Claude Desktop'"
```

**Claude can:**
- Help you navigate to the repository
- Guide you through triggering workflows
- Help interpret workflow results
- Assist with troubleshooting

### Method 2: Direct Integration (if available)

1. Open Claude Desktop
2. Navigate to GitHub Actions integration
3. Select repository
4. Choose workflow to run
5. Provide parameters
6. Execute and monitor

### What Claude Can Help With:
- Writing custom workflow files
- Debugging workflow errors
- Interpreting action logs
- Optimizing workflow performance
- Creating new automation tasks

---

## Testing via Claude Code CLI

### Prerequisites:
- Claude Code CLI installed
- GitHub CLI (`gh`) installed and authenticated
- Terminal/command prompt access

### Setup GitHub CLI:
```bash
# Install GitHub CLI (if not installed)
# Windows (via Chocolatey):
choco install gh

# macOS (via Homebrew):
brew install gh

# Authenticate
gh auth login
```

### Running Workflows:

#### Automated Test Workflow
```bash
# Basic run
gh workflow run automated-test.yml

# With custom message
gh workflow run automated-test.yml \
  -f test_message="Testing from Claude Code CLI"
```

#### Manual Task Workflow
```bash
# Run test task
gh workflow run manual-task.yml \
  -f task_type=test \
  -f task_description="CLI triggered test" \
  -f verbose=true

# Run build task
gh workflow run manual-task.yml \
  -f task_type=build \
  -f task_description="Building from CLI"

# Run custom task
gh workflow run manual-task.yml \
  -f task_type=custom \
  -f task_description="Custom CLI task" \
  -f files_to_process="src/"
```

#### Validation Workflow
```bash
# Quick validation
gh workflow run validate.yml -f validation_level=quick

# Standard validation
gh workflow run validate.yml -f validation_level=standard

# Comprehensive validation
gh workflow run validate.yml -f validation_level=comprehensive
```

### Monitoring Workflows:

```bash
# List recent runs
gh run list --limit 10

# Watch a specific run
gh run watch

# View run details
gh run view <run-id>

# View logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>
```

### Claude Code Integration:

**Ask Claude Code:**
```bash
# Example: Ask Claude to trigger a workflow
claude "Trigger the manual task workflow with task type 'test' 
       and description 'Automated by Claude Code'"
```

---

## Testing via Claude Mobile App

### Prerequisites:
- Claude mobile app installed
- GitHub account accessible
- Internet connection

### Method 1: Ask Claude for Help

**Example requests:**
```
"Help me trigger a GitHub Actions workflow in my test repository"

"Show me how to run the manual-task workflow with task type 'test'"

"Check the status of my latest GitHub Actions run"
```

### Method 2: GitHub Mobile Browser

1. **Ask Claude** to generate the GitHub Actions URL
2. **Copy URL** provided by Claude
3. **Open in mobile browser**
4. **Trigger workflow** via GitHub mobile web

### What Claude Mobile Can Do:
- Guide you to the workflow
- Help construct parameter values
- Interpret workflow results
- Troubleshoot errors
- Generate workflow URLs

---

## Automated Testing (Unattended)

### The Automated Test Workflow

**Schedule:** Runs every 3 hours automatically

**How to verify it's working:**

1. **Initial Setup:**
   - Push repository to GitHub
   - Wait for first scheduled run (up to 3 hours)

2. **Check Schedule:**
   ```
   Cron: 0 */3 * * *
   Meaning: Every 3 hours at minute 0
   Times: 12:00 AM, 3:00 AM, 6:00 AM, 9:00 AM, 12:00 PM, 3:00 PM, 6:00 PM, 9:00 PM
   ```

3. **Monitoring:**
   - Check Actions tab periodically
   - Enable email notifications (Settings → Notifications)
   - Use RSS feed for workflow runs

4. **Long-term Testing:**
   - Leave repository for 24 hours
   - Should see 8 automatic runs
   - Check for consistency and errors

### Enabling Notifications:

**GitHub Settings:**
1. Go to github.com/settings/notifications
2. Enable "Actions" notifications
3. Choose: Email, Web, or Mobile
4. Select notification frequency

**Repository Settings:**
1. Repository → Settings → Notifications
2. Configure per-repository notifications

---

## Verification Steps

### ✅ Workflow Execution Checklist

For each workflow run, verify:

- [ ] Workflow triggered successfully
- [ ] All steps executed without errors
- [ ] Correct parameters were used
- [ ] Artifacts were created (if applicable)
- [ ] Execution time was reasonable
- [ ] Logs are clear and informative

### ✅ Platform-Specific Verification

**GitHub Web:**
- [ ] Can navigate to Actions tab
- [ ] Can select and run workflows
- [ ] Can view real-time logs
- [ ] Can download artifacts
- [ ] All three workflows accessible

**GitHub Mobile:**
- [ ] Actions tab visible and accessible
- [ ] Can trigger workflows with parameters
- [ ] Can view running workflows
- [ ] Notifications work (if enabled)
- [ ] Log viewing is functional

**Claude Desktop:**
- [ ] Can discuss workflows with Claude
- [ ] Claude can help trigger workflows
- [ ] Can interpret results with Claude's help
- [ ] Integration features work (if available)

**Claude Code CLI:**
- [ ] `gh workflow run` commands work
- [ ] Can pass parameters correctly
- [ ] Can monitor with `gh run watch`
- [ ] Can download artifacts via CLI
- [ ] Claude Code can assist with commands

**Claude Mobile:**
- [ ] Can ask Claude for workflow help
- [ ] Claude provides correct guidance
- [ ] Can access GitHub via mobile browser
- [ ] Workflow URLs work from mobile

### ✅ Automated Testing Verification

- [ ] Scheduled runs appear in Actions tab
- [ ] Runs occur at expected intervals (every 3 hours)
- [ ] No failures in scheduled runs
- [ ] Artifacts created for each run
- [ ] System handles 24+ hours of unattended operation

---

## Troubleshooting

### Common Issues:

#### "Workflow not found"
**Solution:**
- Ensure `.github/workflows/` directory exists
- Check workflow file names match documentation
- Verify files are committed and pushed to GitHub

#### "Workflow disabled"
**Solution:**
- Go to Actions tab
- Click "I understand my workflows, go ahead and enable them"
- Or: Settings → Actions → General → Enable actions

#### "Required inputs not provided"
**Solution:**
- Check which inputs are marked `required: true`
- Provide all required parameters when triggering
- Use default values for optional parameters

#### "Permission denied"
**Solution:**
- Check repository permissions (must have write access)
- Verify GitHub token permissions (if using API)
- Ensure Actions are enabled for the repository

#### "Workflow running but no output"
**Solution:**
- Refresh the page
- Check browser console for errors
- Try different browser or incognito mode
- Check GitHub status page for outages

#### "Cannot download artifacts"
**Solution:**
- Artifacts expire after retention period (7-30 days)
- Check if workflow completed successfully
- Verify artifacts section shows files
- Try downloading via CLI: `gh run download <run-id>`

### Platform-Specific Issues:

**GitHub Mobile:**
- Update app to latest version
- Clear app cache
- Reinstall app if persistent issues

**Claude Desktop/Code:**
- Verify GitHub CLI is installed and authenticated
- Check internet connection
- Restart Claude application

### Getting Help:

1. **Check workflow logs** - Most errors have clear messages
2. **Review this guide** - Follow steps carefully
3. **GitHub Actions documentation** - https://docs.github.com/actions
4. **Ask Claude** - Claude can help interpret errors and suggest fixes

---

## 📊 Expected Results

### Successful Workflow Run

You should see:
- ✅ Green checkmark next to workflow run
- ✅ All steps completed
- ✅ Artifacts available for download
- ✅ Clear success message in logs
- ✅ Run duration: typically 30-60 seconds

### Successful Automated Testing

After 24 hours:
- ✅ 8 scheduled runs completed
- ✅ No failures
- ✅ Consistent execution times
- ✅ Artifacts for each run
- ✅ System stable and reliable

---

## 🎯 Next Steps

After successful testing:

1. ✅ Verify all workflows work
2. ✅ Test from multiple platforms
3. ✅ Confirm automated runs work
4. ✅ Review artifacts and logs
5. ✅ Customize workflows for your needs
6. ✅ Add more automation tasks
7. ✅ Integrate with your development workflow

---

## 📚 Additional Resources

- **GitHub Actions Docs:** https://docs.github.com/actions
- **Workflow Syntax:** https://docs.github.com/actions/reference/workflow-syntax-for-github-actions
- **GitHub CLI Docs:** https://cli.github.com/manual/
- **Platform Guides:** See `C:\Claude\guides\Github-Actions\` for detailed guides

---

**Last Updated:** October 3, 2025  
**Version:** 1.0

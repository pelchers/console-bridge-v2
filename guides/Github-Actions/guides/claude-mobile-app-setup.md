# Claude Mobile App - GitHub Actions Setup Guide

A comprehensive guide for using GitHub Actions workflows with the Claude mobile app on iOS and Android.

---

## 📋 Overview

The Claude mobile app can help you:
- Get guidance on triggering GitHub Actions workflows
- Understand workflow errors and logs
- Generate commands for GitHub CLI
- Create and modify workflow files
- Troubleshoot workflow issues
- Learn GitHub Actions concepts

---

## 🔧 Prerequisites

### Required:
- ✅ Claude mobile app installed (iOS/Android)
- ✅ Claude account (Pro or Free)
- ✅ GitHub account
- ✅ Repository with GitHub Actions workflows
- ✅ Internet connection

### Recommended:
- GitHub Mobile app installed (for direct execution)
- Basic understanding of your repository
- Clear goals for what you want to automate

---

## 🚀 Setup Steps

### Step 1: Install Claude Mobile

**iOS (iPhone/iPad):**
1. Open **App Store**
2. Search for **"Claude"** or **"Claude AI"**
3. Tap **"Get"** or cloud icon
4. Install the app
5. Open **Claude** app

**Android:**
1. Open **Google Play Store**
2. Search for **"Claude"** or **"Claude AI"**
3. Tap **"Install"**
4. Open **Claude** app

### Step 2: Sign In to Claude

1. **Open Claude app**
2. **Sign in** with your Anthropic account:
   - Email and password
   - Or SSO if configured
3. **Accept terms** if prompted
4. **Verify access** - should see chat interface

### Step 3: Familiarize Claude with Your Setup

**Start a conversation:**

```
"I have a GitHub repository called 'github-actions-test1' with three 
GitHub Actions workflows. I want to learn how to trigger and monitor 
them from my phone. Can you help?"
```

**Claude will ask clarifying questions and provide guidance.**

---

## 💬 Using Claude Mobile with GitHub Actions

### Method 1: Ask for Step-by-Step Guidance

#### Example 1: Triggering a Workflow

**You ask:**
```
"How do I trigger the manual-task workflow in my GitHub repository 
from my phone?"
```

**Claude responds:**
```
I can help you trigger that workflow! Here are the steps using 
GitHub Mobile app:

1. Open the GitHub Mobile app
2. Navigate to your repository
3. Tap the "Actions" tab
4. Select "Manual Task Workflow"
5. Tap "Run workflow" button (top right)
6. Fill in the parameters:
   - task_type: Choose from dropdown (test, build, lint, etc.)
   - task_description: Enter what you're doing
   - files_to_process: Optional
   - verbose: Toggle on for detailed output
7. Tap "Run workflow" to start

The workflow will begin running and you can monitor it in real-time.

Would you like help with any specific parameters or monitoring the results?
```

#### Example 2: Understanding Workflow Errors

**You ask:**
```
"My workflow failed with error 'npm: command not found'. What does 
this mean and how do I fix it?"
```

**Claude responds:**
```
This error means the workflow tried to run an npm command, but npm 
(Node Package Manager) isn't installed or available in the workflow 
environment.

To fix this, you need to add a step to install Node.js before running 
npm commands. Add this to your workflow file:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
```

Place this step before any steps that use npm commands.

Would you like me to show you the complete updated workflow file?
```

### Method 2: Generate Commands and URLs

#### Generate GitHub Mobile URLs

**You ask:**
```
"Can you give me a direct link to the Actions page for my repository?"
```

**Claude provides:**
```
Sure! Here's the direct link:

https://github.com/YOUR_USERNAME/github-actions-test1/actions

If you open this in your mobile browser or tap it in GitHub Mobile, 
it will take you directly to the Actions tab.

For the Manual Task Workflow specifically:
https://github.com/YOUR_USERNAME/github-actions-test1/actions/workflows/manual-task.yml

Would you like links for the other workflows too?
```

#### Generate CLI Commands

**You ask:**
```
"Give me the command to trigger a test run using GitHub CLI"
```

**Claude provides:**
```bash
gh workflow run manual-task.yml \
  -f task_type=test \
  -f task_description="Test run from mobile" \
  -f verbose=true
```

**Claude explains:**
```
Copy this command and run it in a terminal with GitHub CLI installed.

Breaking it down:
- `gh workflow run` triggers a workflow
- `manual-task.yml` is the workflow file
- `-f` sets parameter values
- `task_type=test` runs the test task
- `task_description` adds context
- `verbose=true` enables detailed output

To monitor it: `gh run watch`
```

### Method 3: Create and Modify Workflows

#### Create New Workflow

**You ask:**
```
"Create a GitHub Actions workflow that runs every hour and checks 
if my website is up"
```

**Claude creates:**
```yaml
name: Website Health Check

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:

jobs:
  check-website:
    runs-on: ubuntu-latest
    
    steps:
      - name: Check website
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://your-website.com)
          
          if [ $response -eq 200 ]; then
            echo "✅ Website is up (HTTP $response)"
          else
            echo "❌ Website is down (HTTP $response)"
            exit 1
          fi
      
      - name: Notify on failure
        if: failure()
        run: |
          echo "Website health check failed!"
          # Add notification logic here
```

**Claude explains:**
```
Save this as .github/workflows/health-check.yml

Key features:
- Runs every hour (cron schedule)
- Can be triggered manually
- Checks your website's HTTP status
- Exits with error if site is down
- Can add notifications

Want me to add Slack/Discord/email notifications?
```

#### Modify Existing Workflow

**You ask:**
```
"Add a step to my manual-task workflow that sends a notification 
when it completes"
```

**Claude provides updated file:**
```yaml
# ... existing steps ...

      - name: Send completion notification
        if: always()  # Run even if previous steps fail
        run: |
          echo "📧 Workflow completed!"
          echo "Status: ${{ job.status }}"
          echo "Task: ${{ github.event.inputs.task_type }}"
          # Add your notification service here
          # Examples: curl to Slack webhook, email service, etc.
```

**Claude explains how to integrate with notification services.**

### Method 4: Troubleshooting and Debugging

#### Analyze Workflow Logs

**You ask:**
```
"I'm looking at my workflow logs and see 'Error: ENOENT: no such 
file or directory'. What does this mean?"
```

**Claude explains:**
```
ENOENT means "Error NO ENTry" - the workflow is trying to access a 
file or directory that doesn't exist.

Common causes:
1. File path is wrong
2. File wasn't created by a previous step
3. You're in the wrong directory
4. File wasn't committed to git

To debug:
1. Check which step is failing
2. Add a step before it that lists files: `ls -la`
3. Verify the path you're trying to access
4. Make sure previous steps completed successfully

What step is failing? I can help you fix it specifically.
```

#### Workflow Performance

**You ask:**
```
"My workflow takes 15 minutes. How can I make it faster?"
```

**Claude provides:**
```
Here are strategies to speed up your workflow:

1. **Cache dependencies:**
```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

2. **Run jobs in parallel:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    # ... test steps
  
  lint:
    runs-on: ubuntu-latest
    # ... lint steps (runs same time as test)
```

3. **Optimize scripts:**
- Only install needed dependencies
- Skip unnecessary checks
- Use lightweight Docker images

4. **Matrix strategy for tests:**
```yaml
strategy:
  matrix:
    node: [18, 20]
```

Which approach would you like to implement first?
```

---

## 🎯 Common Use Cases

### Use Case 1: Learning GitHub Actions

**Start a conversation:**
```
"I'm new to GitHub Actions. Can you teach me the basics?"
```

**Claude will:**
- Explain what GitHub Actions is
- Show you basic workflow structure
- Walk through a simple example
- Answer follow-up questions
- Provide practice exercises

**Progressive learning:**
```
→ "What are workflow triggers?"
→ "Show me how to use workflow_dispatch"
→ "How do I add workflow inputs?"
→ "What are artifacts and how do I use them?"
```

### Use Case 2: Quick Reference

**You ask:**
```
"What's the cron syntax to run every 3 hours?"
```

**Claude answers:**
```
'0 */3 * * *'

Breaking it down:
- 0: At minute 0
- */3: Every 3 hours
- * * *: Every day, every month, every day of week

So it runs at: 12:00 AM, 3:00 AM, 6:00 AM, 9:00 AM, 12:00 PM, 
3:00 PM, 6:00 PM, 9:00 PM

Other common schedules:
- Every hour: '0 * * * *'
- Every day at midnight: '0 0 * * *'
- Every Monday at 9 AM: '0 9 * * 1'
```

### Use Case 3: Emergency Fixes

**Scenario: Workflow is failing in production**

**You (on phone):**
```
"My deployment workflow is failing with 'Permission denied' when 
trying to deploy. I need to fix this ASAP!"
```

**Claude responds:**
```
Let's diagnose this quickly:

Most common causes:
1. **SSH key issues** - Key not added or wrong permissions
2. **GitHub token** - Token expired or insufficient permissions
3. **File permissions** - Deploy user doesn't have write access

Quick fixes:

For SSH keys:
1. Check GitHub secrets has valid SSH_PRIVATE_KEY
2. Ensure key is authorized on server
3. Check key permissions in workflow

For GitHub token:
1. Verify GITHUB_TOKEN has required scopes
2. Check token expiration
3. Regenerate if needed

For file permissions:
```bash
# Add to workflow
- name: Fix permissions
  run: chmod +x deploy.sh
```

What specific error message do you see? I can give you an exact fix.
```

### Use Case 4: Planning Workflows

**You ask:**
```
"I want to automate my entire deployment process. What workflows 
should I create?"
```

**Claude suggests:**
```
Here's a complete automation strategy:

**Workflow 1: CI (Continuous Integration)**
- Trigger: On every push/PR
- Actions: Run tests, lint, type-check
- Purpose: Catch issues early

**Workflow 2: Build**
- Trigger: On push to main
- Actions: Build application, run tests, create artifacts
- Purpose: Create deployable builds

**Workflow 3: Deploy to Staging**
- Trigger: On successful build
- Actions: Deploy to staging environment, run smoke tests
- Purpose: Test in production-like environment

**Workflow 4: Deploy to Production**
- Trigger: Manual approval
- Actions: Deploy to production, run health checks
- Purpose: Controlled production deployments

**Workflow 5: Scheduled Tasks**
- Trigger: Cron schedule
- Actions: Database backups, cleanup, monitoring
- Purpose: Maintenance and monitoring

Want me to create any of these workflows for you?
```

---

## 📱 Mobile-Specific Tips

### Effective Communication with Claude

**Be specific:**
```
Good: "I need to trigger the manual-task workflow with task type 
'test' and monitor the results"

Bad: "Help with workflows"
```

**Provide context:**
```
Good: "My repository is 'github-actions-test1', it has three workflows, 
and I'm trying to trigger the manual one from my phone"

Bad: "Workflow won't run"
```

**Share error messages:**
```
Good: "The workflow failed at step 3 with error: 'npm ERR! code ENOENT'. 
Here's the full log: [paste log]"

Bad: "It didn't work"
```

### Save Important Conversations

**iOS:**
- Take screenshots of Claude's solutions
- Use "Copy" to save code snippets
- Save to Notes app for reference

**Android:**
- Take screenshots
- Use "Share" to save to Keep or OneNote
- Copy code to clipboard

### Combine with GitHub Mobile

**Workflow:**
1. Ask Claude for guidance
2. Switch to GitHub Mobile app
3. Execute Claude's instructions
4. If issues, switch back to Claude
5. Share results with Claude

**Example:**
```
[In Claude] "How do I trigger the test workflow?"
[Claude provides steps]
[Switch to GitHub Mobile]
[Follow steps]
[If error, screenshot and return to Claude]
[Share screenshot with Claude for diagnosis]
```

### Voice Input

**Use your device's voice input:**
- Faster than typing on small screen
- Hands-free while multitasking
- Natural conversation style
- Especially helpful for long descriptions

**Example voice commands:**
```
"Hey Claude, how do I check the status of my latest GitHub Actions run?"
"Explain what this error means: [read error message]"
"Create a workflow that runs tests every hour"
```

---

## 🐛 Troubleshooting

### Claude Not Understanding

**If Claude seems confused:**

1. **Be more specific:**
```
Instead of: "Fix my workflow"
Try: "My manual-task workflow is failing at the 'Setup Node.js' 
step with error 'version not found'"
```

2. **Provide more context:**
```
"I'm using the github-actions-test1 repository. It has a workflow 
called manual-task.yml. When I trigger it with task_type=test, 
it fails. Here's the error: [error message]"
```

3. **Break down complex questions:**
```
Instead of: "How do I set up a complete CI/CD pipeline?"

Try:
→ "What is CI/CD?"
→ "What workflows do I need?"
→ "Help me create the first workflow"
→ "Now help me with the deployment workflow"
```

### Getting Outdated Information

**Claude's knowledge cutoff is January 2025.**

**If you need current info:**
```
"What's the latest version of actions/checkout? If you're not sure, 
just tell me and I'll check GitHub directly"
```

**Claude will:**
- Give best answer based on training
- Acknowledge if uncertain
- Provide ways to verify
- Suggest checking official docs

### Can't Execute Directly

**Remember:** Claude mobile can't directly trigger workflows

**Claude provides:**
- Instructions for GitHub Mobile
- Commands for GitHub CLI
- Direct URLs to click
- Step-by-step guidance

**You execute via:**
- GitHub Mobile app
- Mobile browser
- GitHub CLI (if on desktop later)

---

## ✅ Best Practices

### 1. Start Conversations with Context

**Good opening:**
```
"I'm working on my 'github-actions-test1' repository which has 
automated test, manual task, and validation workflows. I want to 
trigger the manual task workflow from my phone to run tests. 
Can you guide me?"
```

### 2. Keep Technical Details Handy

**Before asking Claude, know:**
- Repository name
- Workflow names
- Branch you're working on
- Any error messages
- What you're trying to accomplish

### 3. Iterate and Refine

**Progressive questioning:**
```
→ "How do I create a workflow?"
→ "Add a step to install dependencies"
→ "Now add testing"
→ "What about deploying?"
→ "Optimize for speed"
```

### 4. Save Solutions

- Screenshot important answers
- Copy code snippets to notes
- Create a personal reference doc
- Build your knowledge base

### 5. Use Follow-ups

**Don't start new conversations unnecessarily:**
```
Same conversation:
→ "Create a test workflow"
→ "Now add linting to it"
→ "Make it run on pull requests too"

Claude maintains context = better answers
```

---

## 🎯 Quick Reference

### Common Questions

**Triggering:**
```
"How do I trigger [workflow name]?"
"Give me the GitHub CLI command to run [workflow]"
"What's the URL to trigger this workflow?"
```

**Monitoring:**
```
"How do I check if my workflow succeeded?"
"Where can I see workflow logs?"
"How do I know when the workflow finishes?"
```

**Debugging:**
```
"This error: [error] - what does it mean?"
"My workflow is failing at step X, why?"
"How do I fix: [error message]"
```

**Creating:**
```
"Create a workflow that does X"
"Add a step to my workflow that does Y"
"How do I use Z in a workflow?"
```

**Learning:**
```
"What is [concept]?"
"Explain [feature] in simple terms"
"Show me an example of [pattern]"
```

---

## 🎯 Next Steps

1. ✅ Install Claude mobile app
2. ✅ Start a conversation about your workflows
3. ✅ Ask Claude to guide you through triggering your first workflow
4. ✅ Use Claude + GitHub Mobile together
5. ✅ Save useful solutions for reference
6. ✅ Explore advanced use cases

---

**Last Updated:** October 3, 2025  
**Guide Version:** 1.0  
**For:** github-actions-test1 repository  
**Tested With:** Claude mobile app on iOS and Android

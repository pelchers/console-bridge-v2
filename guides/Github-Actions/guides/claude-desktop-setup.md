# Claude Desktop App - GitHub Actions Setup Guide

A comprehensive guide for setting up and using GitHub Actions workflows from the Claude Desktop application.

---

## 📋 Overview

The Claude Desktop app can help you:
- Navigate to GitHub Actions workflows
- Trigger workflows with appropriate parameters
- Interpret workflow results and logs
- Debug workflow errors
- Create and modify workflow files

---

## 🔧 Prerequisites

### Required:
- ✅ Claude Desktop app installed
- ✅ GitHub account with repository access
- ✅ Repository with GitHub Actions workflows
- ✅ Internet connection

### Recommended:
- GitHub CLI (`gh`) installed for advanced features
- Basic understanding of GitHub Actions

---

## 🚀 Setup Steps

### Step 1: Install Claude Desktop

1. **Download Claude Desktop** from https://claude.ai/download
2. **Install** the application
3. **Sign in** with your Anthropic/Claude account
4. **Verify installation** - app should open successfully

### Step 2: Prepare Your GitHub Repository

1. **Ensure workflows exist** in `.github/workflows/` directory
2. **Push to GitHub** if working locally:
   ```bash
   git add .github/workflows/
   git commit -m "Add GitHub Actions workflows"
   git push origin main
   ```
3. **Verify on GitHub** - visit your repo's Actions tab

### Step 3: Using Claude Desktop with GitHub Actions

#### Method 1: Ask Claude for Guidance

**Example conversations:**

```
"Help me trigger the manual-task workflow in my github-actions-test1 
repository on GitHub. The workflow requires a task_type parameter."
```

**Claude will:**
- Guide you through the process
- Explain what parameters you need
- Provide step-by-step instructions
- Help you navigate to the correct page

#### Method 2: Ask Claude to Generate Commands

```
"Generate the GitHub CLI command to trigger my manual-task workflow 
with task_type='test' and description='Testing from desktop'"
```

**Claude will provide:**
```bash
gh workflow run manual-task.yml \
  -f task_type=test \
  -f task_description="Testing from desktop"
```

#### Method 3: Workflow File Creation/Editing

```
"Help me create a new GitHub Actions workflow that runs tests 
every hour and can be triggered manually"
```

**Claude will:**
- Write the complete YAML file
- Explain each section
- Provide best practices
- Help you customize parameters

---

## 💡 Common Use Cases

### Use Case 1: Triggering a Workflow

**Ask Claude:**
```
"I need to run the manual-task workflow in my repo. 
What are the steps to do this from GitHub's web interface?"
```

**Claude's Response:**
1. Navigate to github.com/YOUR_USERNAME/REPO_NAME
2. Click the "Actions" tab
3. Select "Manual Task Workflow" from the left sidebar
4. Click "Run workflow" button (top right)
5. Fill in parameters:
   - task_type: Choose from dropdown
   - task_description: Enter description
   - files_to_process: Optional file paths
   - verbose: Check for detailed output
6. Click "Run workflow" to start

### Use Case 2: Understanding Workflow Results

**Ask Claude:**
```
"My workflow failed with error 'Exit code 1'. Can you help me 
understand what went wrong? Here's the log: [paste log]"
```

**Claude will:**
- Analyze the error message
- Identify the failing step
- Explain what caused the failure
- Suggest fixes
- Provide corrected workflow code if needed

### Use Case 3: Creating Custom Workflows

**Ask Claude:**
```
"Create a GitHub Actions workflow that:
- Runs on every push to main branch
- Installs Node.js dependencies
- Runs tests
- Uploads coverage report as artifact"
```

**Claude will provide:**
- Complete YAML workflow file
- Explanation of each step
- Best practices applied
- Customization options

### Use Case 4: Optimizing Existing Workflows

**Ask Claude:**
```
"My workflow takes 10 minutes to run. Can you help optimize it?
Here's the current workflow: [paste workflow]"
```

**Claude will:**
- Analyze the workflow structure
- Identify bottlenecks
- Suggest optimizations (caching, parallelization, etc.)
- Provide improved workflow code

---

## 🎯 Step-by-Step: Triggering Your First Workflow

### Scenario: Running the Manual Task Workflow

**Step 1: Ask Claude to Help**

Open Claude Desktop and type:
```
"I want to trigger the manual-task workflow in my github-actions-test1 
repository. Can you guide me through the GitHub web interface?"
```

**Step 2: Follow Claude's Instructions**

Claude will provide step-by-step guidance. Typical response:

1. Open your browser and go to: `https://github.com/YOUR_USERNAME/github-actions-test1`
2. Click the "Actions" tab at the top of the page
3. In the left sidebar, you'll see a list of workflows. Click on "Manual Task Workflow"
4. On the right side, click the "Run workflow" button
5. A form will appear. Fill in:
   - **Branch:** main (or your branch)
   - **task_type:** Select "test" from dropdown
   - **task_description:** "First test run from Claude Desktop"
   - **files_to_process:** Leave default or enter "."
   - **verbose:** Check the box for detailed output
6. Click the green "Run workflow" button
7. The page will refresh and show your workflow starting

**Step 3: Monitor the Workflow**

Ask Claude:
```
"How do I monitor the workflow while it's running?"
```

Claude will explain:
- The workflow appears in the list with a yellow circle (running)
- Click on it to see real-time logs
- Each step expands to show detailed output
- Wait for green checkmark (success) or red X (failure)

**Step 4: Download Results**

Ask Claude:
```
"The workflow completed successfully. How do I download the artifacts?"
```

Claude will guide you:
1. Scroll to the bottom of the workflow run page
2. Find the "Artifacts" section
3. Click on the artifact name to download
4. Extract the ZIP file to view results

---

## 🔨 Advanced Features

### Using Computer Use (if enabled)

If Claude Desktop has computer use capabilities enabled:

**Ask Claude:**
```
"Can you open my browser to the GitHub Actions page for my repository?"
```

**Claude may be able to:**
- Open URLs in your default browser
- Navigate to specific pages
- (Note: Capabilities vary by Claude Desktop version)

### Integration with GitHub CLI

**Setup:**
1. Install GitHub CLI: https://cli.github.com/
2. Authenticate: `gh auth login`
3. Test: `gh workflow list`

**Ask Claude:**
```
"Show me how to trigger my workflow using GitHub CLI from terminal"
```

**Claude provides:**
```bash
# List workflows
gh workflow list

# Run workflow
gh workflow run manual-task.yml \
  -f task_type=test \
  -f task_description="CLI test"

# Watch progress
gh run watch

# View results
gh run view
```

### Workflow File Management

**Ask Claude:**
```
"Can you help me edit my workflow file to add a new step that 
sends a notification when the workflow completes?"
```

**Claude will:**
- Show you the current workflow structure
- Add the notification step
- Explain how it works
- Provide the complete updated file

---

## 🐛 Troubleshooting

### Issue: "I can't find the Actions tab"

**Ask Claude:**
```
"I don't see an Actions tab in my GitHub repository. What should I check?"
```

**Claude's troubleshooting steps:**
1. Verify you're signed in to GitHub
2. Check if you have the correct repository open
3. Ensure GitHub Actions are enabled:
   - Go to repository Settings
   - Click "Actions" in left sidebar
   - Check "Actions permissions"
4. If disabled, enable and refresh

### Issue: "Workflow won't run"

**Ask Claude:**
```
"I clicked 'Run workflow' but nothing happens. Help!"
```

**Claude will help diagnose:**
- Check browser console for errors (F12)
- Verify repository permissions (need write access)
- Check if workflow file has syntax errors
- Ensure all required inputs are provided
- Try different browser or incognito mode

### Issue: "Don't understand the error message"

**Ask Claude:**
```
"My workflow failed with this error: [paste error]
Can you explain what it means and how to fix it?"
```

**Claude will:**
- Explain the error in plain English
- Identify the root cause
- Provide specific fix
- Show corrected code

---

## 📊 Best Practices

### 1. Start Simple
- Test with manual workflows first
- Use basic parameters
- Verify each step works before adding complexity

### 2. Use Claude for Documentation
- Ask Claude to explain unfamiliar concepts
- Get help understanding workflow syntax
- Request examples of specific features

### 3. Iterate with Claude
- Share errors for quick fixes
- Ask for optimization suggestions
- Get help with complex workflows

### 4. Keep Claude Context
- In a single conversation, build up your workflow
- Claude remembers previous messages
- Reference earlier discussions

### 5. Leverage Claude's Knowledge
- Ask about best practices
- Get security recommendations
- Learn GitHub Actions features

---

## 🎓 Learning Resources

### Ask Claude for Help Learning

**Beginner Questions:**
```
"What is GitHub Actions and why would I use it?"
"Explain the basic structure of a GitHub Actions workflow file"
"What are the common triggers for workflows?"
```

**Intermediate Questions:**
```
"How do I use artifacts in GitHub Actions?"
"What's the difference between jobs and steps?"
"How do I use secrets in workflows?"
```

**Advanced Questions:**
```
"How can I create a matrix build with GitHub Actions?"
"What are reusable workflows and how do I create one?"
"How do I optimize workflow performance?"
```

### External Resources

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Workflow Syntax:** https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
- **GitHub Community:** https://github.community/

---

## ✅ Quick Reference

### Triggering Workflows
1. Ask Claude: "How do I trigger [workflow name]?"
2. Follow Claude's step-by-step guidance
3. Monitor in Actions tab
4. Download artifacts if needed

### Getting Help
1. Describe your issue to Claude clearly
2. Include error messages or logs if available
3. Mention what you've already tried
4. Ask specific questions

### Creating Workflows
1. Describe what you want to automate
2. Claude provides complete YAML file
3. Save to `.github/workflows/filename.yml`
4. Commit and push to GitHub
5. Test the workflow

---

## 🎯 Next Steps

After mastering Claude Desktop with GitHub Actions:

1. ✅ Try all three sample workflows
2. ✅ Create your own custom workflow with Claude's help
3. ✅ Explore advanced features (caching, artifacts, matrices)
4. ✅ Integrate workflows into your development process
5. ✅ Share knowledge with your team

---

**Last Updated:** October 3, 2025  
**Guide Version:** 1.0  
**For:** github-actions-test1 repository

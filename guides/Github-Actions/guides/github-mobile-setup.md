# GitHub Mobile - GitHub Actions Setup Guide

A comprehensive guide for using GitHub Actions workflows from the GitHub Mobile app on iOS and Android.

---

## 📋 Overview

GitHub Mobile allows you to:
- Trigger workflows with custom parameters
- Monitor workflow execution in real-time
- View workflow logs on your device
- Receive notifications for workflow completion
- Download workflow artifacts (via browser)
- Manage your repositories on-the-go

---

## 🔧 Prerequisites

### Required:
- ✅ iOS device (iOS 13+) or Android device (Android 7+)
- ✅ GitHub Mobile app installed
- ✅ GitHub account
- ✅ Repository with GitHub Actions workflows
- ✅ Internet connection (WiFi or cellular)

### Recommended:
- Repository write access for triggering workflows
- Notifications enabled for workflow updates
- Sufficient storage for app and artifacts

---

## 🚀 Setup Steps

### Step 1: Install GitHub Mobile

**iOS (iPhone/iPad):**
1. Open **App Store**
2. Search for **"GitHub"**
3. Tap **"Get"** or cloud icon
4. Install the app
5. Open **GitHub** app

**Android:**
1. Open **Google Play Store**
2. Search for **"GitHub"**
3. Tap **"Install"**
4. Open **GitHub** app

**Verify:**
- App icon appears on home screen
- App opens successfully

### Step 2: Sign In

1. **Open GitHub Mobile app**
2. Tap **"Sign in"** button
3. **Choose sign-in method:**
   - Sign in with browser (recommended)
   - Enter credentials directly
4. **Authorize the app** if prompted
5. **Verify signed in:**
   - Should see your profile picture
   - Home feed shows repository activity

### Step 3: Navigate to Your Repository

1. **Tap the search icon** (magnifying glass)
2. **Search** for your repository:
   - Type: `your-username/github-actions-test1`
   - Or: `github-actions-test1` if your repo
3. **Tap your repository** from results
4. Repository page opens

**Alternative:**
- Tap **"Repositories"** from home
- Find repository in list
- Tap to open

### Step 4: Access GitHub Actions

1. **In your repository**, tap **"Actions" tab**
   - Located in horizontal menu below repo name
   - May need to scroll tabs to find it
2. **View workflow list:**
   - Shows all workflows from `.github/workflows/`
   - Each workflow shows recent runs
3. **Tap a workflow** to see details

---

## 📱 Using GitHub Actions on Mobile

### Triggering a Workflow

**Step-by-Step:**

1. **Open your repository**
2. **Tap "Actions" tab**
3. **Select workflow** to run:
   - Tap "Manual Task Workflow"
   - Or "Automated Test Workflow"
   - Or "Validation Workflow"
4. **Tap "Run workflow" button**
   - Located at top right
   - Green button with play icon
5. **Fill in parameters** (if required):

   **For Manual Task Workflow:**
   - **Branch:** main (or your branch)
   - **task_type:** Tap to select from:
     - test
     - build
     - lint
     - format
     - custom
   - **task_description:** Enter description
     - Example: "Mobile test run"
   - **files_to_process:** Optional file paths
   - **verbose:** Toggle on/off

   **For Validation Workflow:**
   - **validation_level:** Select:
     - quick
     - standard  
     - comprehensive

6. **Tap "Run workflow"** (green button)
7. **Workflow starts:**
   - Returns to workflow list
   - New run appears at top
   - Yellow dot indicates running

### Monitoring Workflow Execution

**Real-time Monitoring:**

1. **From workflow list**, tap the **running workflow**
   - Shows yellow dot and "In progress"
2. **View run details:**
   - Run number and time
   - Commit it's running on
   - Triggered by (you)
3. **View job progress:**
   - Tap the job name
   - See each step executing
   - Green checkmarks for completed steps
   - Spinning icon for current step
4. **Refresh** by pulling down
5. **Wait for completion:**
   - Green checkmark = success
   - Red X = failure

**View Logs:**

1. **Tap the workflow run**
2. **Tap the job name**
3. **Tap individual steps** to expand logs
4. **Scroll through output**
5. **Pinch to zoom** if text too small

### Viewing Workflow History

1. **Go to Actions tab**
2. **Select workflow** from left
3. **View recent runs:**
   - Shows last 30 runs
   - Status indicators (✓, ✗, ⟳)
   - Run duration
   - Triggered by
4. **Filter runs:**
   - Tap filter icon (if available)
   - Filter by status, branch, etc.
5. **Tap any run** to view details

### Downloading Artifacts

**Note:** Direct artifact download not supported in app (as of 2025)

**Workaround:**

1. **View the workflow run** in app
2. **Tap share icon** (top right)
3. **Select "Open in Safari"** (iOS) or **"Open in browser"** (Android)
4. **On GitHub web** (in mobile browser):
   - Scroll to "Artifacts" section
   - Tap artifact to download
   - Downloads to device
5. **Open from Downloads** folder

**Better method:**
- Note the run ID from mobile
- Switch to desktop later
- Download from desktop browser

---

## 💡 Mobile-Specific Tips

### Landscape Mode

**For better log viewing:**
- Rotate device to landscape
- More horizontal space
- Easier to read long lines
- Better for reviewing logs

### Notifications

**Enable workflow notifications:**

1. **In GitHub Mobile:**
   - Tap profile picture (bottom right)
   - Tap "Settings"
   - Tap "Notifications"
   - Enable "Workflow runs"
2. **Choose notification types:**
   - Only failures
   - All completions
   - Only @ mentions
3. **Enable push notifications** in device settings

**Benefits:**
- Know when long workflows complete
- Alerted to failures immediately
- Don't need to keep checking app

### Quick Actions

**iOS Widgets (if available):**
- Long press GitHub app icon
- See quick actions
- May include recent repositories
- Tap to jump directly

**Android Shortcuts:**
- Long press app icon
- Add shortcuts to home screen
- Quick access to Actions

### Cellular Data Considerations

**To save data:**
- Use WiFi for viewing detailed logs
- Logs can be several MB
- Triggering workflows uses minimal data
- Downloading artifacts uses significant data

**Low data mode:**
- View summary only
- Expand logs selectively
- Download artifacts on WiFi only

---

## 🎯 Common Use Cases

### Use Case 1: Quick Test Run (On-the-Go)

**Scenario:** Need to run tests while away from computer

**Steps:**
1. Open GitHub Mobile
2. Navigate to repository → Actions
3. Tap "Manual Task Workflow"
4. Tap "Run workflow"
5. Select task_type: "test"
6. Enter description: "Quick mobile test"
7. Tap "Run workflow"
8. Monitor progress in app
9. View results when complete

**Time:** 2-3 minutes

### Use Case 2: Check Automated Run Status

**Scenario:** Scheduled workflow ran, check if it succeeded

**Steps:**
1. Open GitHub Mobile
2. Check notifications (if enabled)
3. Or navigate to: Repository → Actions
4. Tap "Automated Test Workflow"
5. View recent runs
6. Tap latest run
7. Verify green checkmark

**Time:** 30 seconds

### Use Case 3: Trigger Build Before Arriving

**Scenario:** Start build while commuting, ready when you arrive

**Steps:**
1. On commute, open GitHub Mobile
2. Navigate to Actions
3. Trigger "Manual Task Workflow"
4. Select task_type: "build"
5. Description: "Pre-arrival build"
6. Tap "Run workflow"
7. Enable notifications
8. Continue commute
9. Notification when complete
10. Build ready when you arrive at desk

### Use Case 4: Emergency Fix Validation

**Scenario:** Just pushed critical fix, need to verify immediately

**Steps:**
1. After git push, open GitHub Mobile
2. Navigate to Actions tab
3. Watch "Validation Workflow" start automatically
4. Monitor progress in real-time
5. View logs if errors occur
6. Confirm success before closing laptop

---

## 🐛 Troubleshooting

### Issue: "Can't find Actions tab"

**Solutions:**
1. **Verify Actions are enabled:**
   - Tap repository Settings (desktop)
   - Check Actions permissions
2. **Update GitHub Mobile app:**
   - Check App Store/Play Store for updates
   - Install latest version
3. **Check repository permissions:**
   - Ensure you have at least read access
   - Private repos need proper access
4. **Reinstall app** if persistent

### Issue: "Run workflow button disabled"

**Causes:**
- No `workflow_dispatch` trigger in workflow
- Insufficient permissions (need write access)
- Workflow file has syntax errors
- Branch protection rules blocking

**Check:**
1. Review workflow file on desktop
2. Verify permissions in repository settings
3. Try different branch
4. Contact repository admin

### Issue: "Logs not loading"

**Solutions:**
1. **Check internet connection:**
   - Try WiFi if on cellular
   - Verify connection stable
2. **Close and reopen run:**
   - Go back to workflow list
   - Tap run again
3. **Pull to refresh**
4. **Clear app cache:**
   - iOS: Offload app and reinstall
   - Android: Clear cache in settings
5. **Wait and retry:**
   - Server may be slow
   - Try again in 1-2 minutes

### Issue: "Workflow won't start"

**Debugging:**
1. **Check status.github.com:**
   - GitHub may have issues
   - Check Actions status specifically
2. **Verify on desktop:**
   - Try triggering from web browser
   - Isolates mobile vs GitHub issue
3. **Check repository:**
   - Ensure workflow file exists
   - Verify pushed to GitHub
4. **Review error message:**
   - Screenshot error
   - Share with team if needed

### Issue: "Notifications not working"

**Fix:**
1. **In GitHub Mobile app:**
   - Profile → Settings → Notifications
   - Enable all relevant notifications
2. **In device settings:**
   - Settings → Notifications → GitHub
   - Enable "Allow Notifications"
   - Enable "Sounds" and "Badges"
3. **Check Do Not Disturb:**
   - Ensure DND not blocking
4. **Re-login if needed:**
   - Sign out and sign back in
   - Reauthorize app

---

## 📊 Best Practices for Mobile

### 1. Enable Notifications
- Don't rely on checking manually
- Get alerted to failures immediately
- Know when long workflows complete

### 2. Use Descriptive Names
```
Good: "Mobile test - payment API v2"
Bad: "test"
```
- Helps identify runs later
- Clear context in notifications
- Easier to find in history

### 3. Monitor Critical Workflows
- Don't just trigger and forget
- Check first few steps succeed
- Verify expected behavior
- React quickly to failures

### 4. Plan Around Network
- Trigger over WiFi when possible
- View logs on WiFi to save data
- Download artifacts on WiFi only
- Cache notification data

### 5. Use Mobile for Monitoring, Desktop for Debugging
- Mobile: Quick checks, triggers, monitoring
- Desktop: Deep log analysis, file editing, complex changes
- Best of both worlds

### 6. Keep App Updated
- Regular updates improve performance
- New features added frequently
- Bug fixes and stability
- Better Actions integration

---

## ✅ Quick Reference

### Triggering Workflow
1. Repository → Actions tab
2. Select workflow
3. Tap "Run workflow"
4. Fill parameters
5. Tap "Run workflow" button

### Monitoring Progress
1. Actions tab → Workflow
2. Tap running workflow (yellow dot)
3. View job progress
4. Pull to refresh
5. Tap steps for logs

### Checking History
1. Actions tab
2. Select workflow
3. View run list
4. Tap any run for details

### Enabling Notifications
1. Profile → Settings
2. Notifications
3. Enable "Workflow runs"
4. Also enable in device settings

---

## 🎯 Next Steps

1. ✅ Install and set up GitHub Mobile
2. ✅ Trigger your first workflow
3. ✅ Enable notifications
4. ✅ Practice monitoring workflows
5. ✅ Explore all three sample workflows
6. ✅ Integrate into daily workflow

---

**Last Updated:** October 3, 2025  
**Guide Version:** 1.0  
**Tested On:** iOS 17, Android 13  
**For:** github-actions-test1 repository

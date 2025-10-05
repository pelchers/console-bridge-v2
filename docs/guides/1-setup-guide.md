# Setup Guide - Console Bridge

**Quick setup guide to get Console Bridge ready for use**

This guide walks you through installing Console Bridge and setting up the unified terminal workflow.

---

## Prerequisites

- **Node.js** v16 or higher
- **npm** (comes with Node.js)
- A localhost web development project (Next.js, React, Vue, etc.)

---

## Step 1: Install Console Bridge Globally

Open your terminal and run:

```bash
npm install -g console-bridge
```

**Why global?** This makes the `console-bridge` command available anywhere on your system.

---

## Step 2: Verify Installation

Check that Console Bridge is installed:

```bash
console-bridge --version
```

You should see:
```
1.0.0
```

Try the help command:
```bash
console-bridge --help
```

You should see the CLI options and commands.

---

## Step 3: Set Up Unified Terminal (Optional but Recommended)

If you want to use the unified terminal feature (browser console logs in the same terminal as your dev server), follow these steps:

### 3a. Navigate to Your Project

```bash
cd path/to/your-project
```

### 3b. Install Concurrently

```bash
npm install --save-dev concurrently
```

**What is concurrently?** A tool that runs multiple commands at the same time in one terminal.

### 3c. Add Script to package.json

Open `package.json` and add this to your `"scripts"` section:

```json
{
  "scripts": {
    "dev": "your-existing-dev-command",
    "dev:debug": "concurrently \"npm run dev\" \"console-bridge start localhost:YOUR_PORT --merge-output\""
  }
}
```

**Replace:**
- `YOUR_PORT` with your actual dev server port (e.g., 3000, 5173, 8080)

**Examples:**

**Next.js (port 3000):**
```json
"dev:debug": "concurrently \"npm run dev\" \"console-bridge start localhost:3000 --merge-output\""
```

**Vite (port 5173):**
```json
"dev:debug": "concurrently \"npm run dev\" \"console-bridge start localhost:5173 --merge-output\""
```

**Create React App (port 3000):**
```json
"dev:debug": "concurrently \"npm start\" \"console-bridge start localhost:3000 --merge-output\""
```

---

## Step 4: Verify Everything Works

### Quick Test

Run this to test the unified terminal:

```bash
npm run dev:debug
```

**You should see:**
1. Your dev server starting (e.g., "Next.js ready on localhost:3000")
2. Console Bridge starting ("Console Bridge v1.0.0")
3. A success message ("Successfully attached to process...")
4. "Monitoring 1 URL. Press Ctrl+C to stop."

**Stop it:**
Press `Ctrl+C` to stop both processes.

---

## Common Setup Issues

### Issue 1: "console-bridge: command not found"

**Cause:** Console Bridge not installed globally or not in PATH

**Fix:**
```bash
# Reinstall globally
npm install -g console-bridge

# Verify PATH (Windows)
where console-bridge

# Verify PATH (macOS/Linux)
which console-bridge
```

---

### Issue 2: "concurrently: command not found"

**Cause:** concurrently not installed in your project

**Fix:**
```bash
# Make sure you're in your project directory
cd path/to/your-project

# Install concurrently
npm install --save-dev concurrently

# Verify it's in package.json
cat package.json | grep concurrently  # macOS/Linux
type package.json | findstr concurrently  # Windows
```

---

### Issue 3: "No process found listening on port"

**Cause:** Dev server hasn't started yet when Console Bridge tries to attach

**Fix:** This is normal! The `--merge-output` flag has graceful fallback. You'll still see all logs, just in separate output streams. To improve timing:

1. Restart with `npm run dev:debug`
2. Or just accept the fallback - it works fine!

---

### Issue 4: Port number doesn't match

**Cause:** Your dev server runs on a different port than you specified

**Fix:**

1. Check what port your dev server uses:
   ```bash
   npm run dev
   # Look for: "ready on localhost:XXXX"
   ```

2. Update the port in your `dev:debug` script to match

---

### Issue 5: Permission errors (macOS/Linux)

**Cause:** Need elevated permissions for global install

**Fix:**
```bash
# Option 1: Use sudo
sudo npm install -g console-bridge

# Option 2: Fix npm permissions (recommended)
# See: https://docs.npmjs.com/resolving-eacces-permissions-errors
```

---

### Issue 6: "lsof not found" (macOS/Linux only)

**Cause:** `lsof` command not installed (required for process discovery on Unix)

**Fix:**

**macOS:**
```bash
brew install lsof
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install lsof
```

**Fedora/RHEL:**
```bash
sudo yum install lsof
```

---

## Platform-Specific Notes

### Windows
- ✅ Works out of the box
- Uses `netstat` and `tasklist` (built into Windows)

### macOS
- ✅ Works with `lsof` installed
- Install with: `brew install lsof`

### Linux
- ✅ Works with `lsof` installed
- Install with: `sudo apt-get install lsof` (Ubuntu/Debian)

---

## Next Steps

✅ **Setup complete!** Now read the [Usage Guide](./2-usage-guide.md) to learn the 4 ways to run Console Bridge.

---

## Quick Reference

**Global install:**
```bash
npm install -g console-bridge
```

**Project setup (for unified terminal):**
```bash
npm install --save-dev concurrently
```

**Add to package.json:**
```json
"dev:debug": "concurrently \"npm run dev\" \"console-bridge start localhost:PORT --merge-output\""
```

**Run:**
```bash
npm run dev:debug
```

---

**Need help?** See [Troubleshooting Guide](./troubleshooting.md)

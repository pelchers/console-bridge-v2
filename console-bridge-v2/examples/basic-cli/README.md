# Basic CLI Usage Examples

This directory contains examples of using Console Bridge from the command line.

## Prerequisites

Install Console Bridge globally:

```bash
npm install -g console-bridge
```

Or run from the project root:

```bash
npm link
```

## Examples

### 1. Monitor Single Application

```bash
console-bridge start localhost:3000
```

Monitors a single development server and displays all console logs in your terminal.

### 2. Monitor Multiple Applications

```bash
console-bridge start localhost:3000 localhost:8080 localhost:5000
```

Monitors multiple applications simultaneously. Each gets its own browser instance and color-coded output.

### 3. Filter by Log Level

```bash
# Only errors
console-bridge start localhost:3000 --levels error

# Errors and warnings
console-bridge start localhost:3000 --levels error,warn

# All except debug
console-bridge start localhost:3000 --levels log,info,warn,error
```

### 4. Custom Formatting Options

```bash
# No timestamps
console-bridge start localhost:3000 --no-timestamp

# No source URLs
console-bridge start localhost:3000 --no-source

# Show file locations
console-bridge start localhost:3000 --location

# ISO timestamp format
console-bridge start localhost:3000 --timestamp-format iso

# Minimal output
console-bridge start localhost:3000 --no-timestamp --no-source
```

### 5. Save Logs to File

```bash
# Basic file export
console-bridge start localhost:3000 --output logs.txt

# With filtering
console-bridge start localhost:3000 --levels error --output errors.txt

# Multiple sources to one file
console-bridge start localhost:3000 localhost:8080 --output combined.log
```

### 6. Visible Browser (Debugging)

```bash
console-bridge start localhost:3000 --no-headless
```

Shows the browser window instead of running headless. Useful for debugging.

### 7. Resource Management

```bash
# Limit browser instances
console-bridge start localhost:3000 localhost:8080 --max-instances 3
```

## Common Use Cases

### Debugging a React App

```bash
console-bridge start localhost:3000 --location
```

Shows file locations to identify where logs originate.

### Monitoring Microservices

```bash
console-bridge start \
  localhost:3000 \
  localhost:4000 \
  localhost:5000 \
  localhost:8080 \
  --output services.log
```

### Error Tracking Only

```bash
console-bridge start localhost:3000 \
  --levels error \
  --location \
  --output errors.log
```

### CI/CD Integration

```bash
# Start your dev server in background
npm run dev &
DEV_PID=$!

# Monitor for errors with timeout
timeout 30s console-bridge start localhost:3000 --levels error --no-timestamp

# Clean up
kill $DEV_PID
```

## Tips

1. **Press Ctrl+C to stop** - Console Bridge will gracefully shut down all browsers
2. **Use --output to save logs** - ANSI colors are automatically stripped from files
3. **Combine with grep** - `console-bridge start localhost:3000 | grep "error"`
4. **Watch multiple ports** - Perfect for full-stack development

## Need Help?

See the full [User Guide](../../docs/USAGE.md) for more details.

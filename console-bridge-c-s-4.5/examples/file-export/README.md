# File Export Examples

These examples demonstrate saving console logs to files programmatically.

## Examples

### 1. basic-export.js

Simple example of writing logs to a single file.

```bash
node basic-export.js
```

**Features:**
- Writes all logs to `output/console-logs.txt`
- ANSI codes stripped for readable plain text
- Append mode (doesn't overwrite existing logs)

### 2. multi-file-export.js

Writes different log levels to separate files.

```bash
node multi-file-export.js
```

**Features:**
- Saves all logs to `output/all-logs.txt`
- Saves errors to `output/errors.txt`
- Saves warnings to `output/warnings.txt`
- Saves info to `output/info.txt`

## CLI Alternative

You can also use the CLI's `--output` option:

```bash
console-bridge start localhost:3000 --output logs.txt
```

This is simpler and automatically handles:
- ANSI code stripping
- File stream management
- Graceful shutdown

## Stripping ANSI Codes

ANSI codes are escape sequences for terminal colors. They look like `\x1b[31m` in files and make logs hard to read.

### Method 1: Regex (Simple)

```javascript
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}
```

### Method 2: strip-ansi Package (Recommended)

```javascript
const stripAnsi = require('strip-ansi');

const plainText = stripAnsi(coloredText);
```

## File Stream Best Practices

### 1. Always Close Streams

```javascript
const stream = fs.createWriteStream('log.txt', { flags: 'a' });

// ... use stream ...

// Always close on shutdown
process.on('SIGINT', () => {
  stream.end(() => {
    console.log('File closed');
    process.exit(0);
  });
});
```

### 2. Use Append Mode

```javascript
// Append mode (flags: 'a') - adds to end of file
const stream = fs.createWriteStream('log.txt', { flags: 'a' });

// Write mode (flags: 'w') - overwrites file (usually not desired)
const stream = fs.createWriteStream('log.txt', { flags: 'w' });
```

### 3. Handle Errors

```javascript
const stream = fs.createWriteStream('log.txt', { flags: 'a' });

stream.on('error', (error) => {
  console.error('File write error:', error.message);
});
```

### 4. Use Absolute Paths

```javascript
const path = require('path');

// ✅ Good - absolute path
const logFile = path.join(__dirname, 'output', 'logs.txt');

// ❌ Bad - relative path (depends on where script is run from)
const logFile = './logs.txt';
```

## Advanced Patterns

### Pattern 1: Rotating Log Files

```javascript
const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
let currentFile = 'log-1.txt';
let fileIndex = 1;

function getWriteStream() {
  const filePath = path.join(__dirname, 'output', currentFile);

  // Check file size
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      fileIndex++;
      currentFile = `log-${fileIndex}.txt`;
    }
  }

  return fs.createWriteStream(filePath, { flags: 'a' });
}

let stream = getWriteStream();

// Check and rotate periodically
setInterval(() => {
  const oldStream = stream;
  stream = getWriteStream();
  if (oldStream !== stream) {
    oldStream.end();
  }
}, 60000); // Check every minute
```

### Pattern 2: Timestamped Files

```javascript
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const logFile = `log-${timestamp}.txt`;

// Example: log-2025-10-02T12-34-56.txt
```

### Pattern 3: Filtering Before Writing

```javascript
const bridge = new BridgeManager({
  output: (log) => {
    console.log(log);

    // Only write errors and warnings to file
    if (log.includes('error:') || log.includes('warn:')) {
      const plainText = stripAnsi(log);
      errorStream.write(plainText + '\n');
    }
  },
});
```

### Pattern 4: JSON Log Files

```javascript
const { BridgeManager } = require('console-bridge');
const fs = require('fs');

const logStream = fs.createWriteStream('logs.json', { flags: 'a' });

const bridge = new BridgeManager({
  output: (log) => {
    console.log(log);

    // Parse and write as JSON
    const logObject = {
      timestamp: new Date().toISOString(),
      message: stripAnsi(log),
    };

    logStream.write(JSON.stringify(logObject) + '\n');
  },
});
```

### Pattern 5: Buffer and Batch Writes

```javascript
let buffer = [];
const BATCH_SIZE = 100;

const bridge = new BridgeManager({
  output: (log) => {
    console.log(log);

    buffer.push(stripAnsi(log));

    // Flush when buffer is full
    if (buffer.length >= BATCH_SIZE) {
      fileStream.write(buffer.join('\n') + '\n');
      buffer = [];
    }
  },
});

// Flush remaining logs on shutdown
process.on('SIGINT', () => {
  if (buffer.length > 0) {
    fileStream.write(buffer.join('\n') + '\n');
  }
  fileStream.end();
});
```

## Analyzing Log Files

### Using grep

```bash
# Find all errors
grep "error:" output/all-logs.txt

# Count warnings
grep -c "warn:" output/all-logs.txt

# Show context around errors
grep -A 2 -B 2 "error:" output/all-logs.txt
```

### Using awk

```bash
# Extract only timestamps and messages
awk '{print $1, $2, $4, $5}' output/all-logs.txt

# Count logs per source
awk -F'[][]' '{print $4}' output/all-logs.txt | sort | uniq -c
```

### Using jq (for JSON logs)

```bash
# Pretty print
cat logs.json | jq '.'

# Filter by error level
cat logs.json | jq 'select(.level == "error")'

# Count by level
cat logs.json | jq -r '.level' | sort | uniq -c
```

## Tips

1. **Always strip ANSI codes** - Makes files readable
2. **Use append mode** - Don't overwrite previous logs
3. **Close streams on shutdown** - Prevents data loss
4. **Use absolute paths** - Avoid path confusion
5. **Consider log rotation** - Prevent files from growing too large
6. **Handle errors** - Add error listeners to streams

## Further Reading

- [User Guide](../../docs/USAGE.md) - CLI `--output` option
- [API Documentation](../../docs/API.md) - Programmatic API
- [Programmatic Examples](../programmatic/) - More API examples

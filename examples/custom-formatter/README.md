# Custom Formatter Examples

These examples demonstrate creating custom log formatters by extending the `LogFormatter` class.

## Examples

### 1. emoji-formatter.js

Adds emojis to log levels for visual appeal.

```bash
node emoji-formatter.js
```

**Output:**
```
📝 log: Application started
ℹ️ info: User logged in
⚠️ warning: Slow query detected
❌ error: Connection failed
🐛 debug: Variable value: 42
```

**Features:**
- Emoji icons for each log level
- Custom error formatting with separator line
- Colorized output

### 2. json-formatter.js

Formats logs as JSON for structured logging.

```bash
node json-formatter.js
```

**Output:**
```json
{"timestamp":"2025-10-02T12:34:56.789Z","level":"log","source":"http://localhost:3000","message":"Hello world","args":["Hello world"]}
{"timestamp":"2025-10-02T12:34:57.123Z","level":"error","source":"http://localhost:3000","message":"Error occurred","args":["Error occurred"],"location":{"file":"app.js","line":42,"column":10}}
```

**Features:**
- One JSON object per line
- Structured data for log aggregation
- Easy to parse with tools like `jq`

**Usage with jq:**
```bash
node json-formatter.js | jq 'select(.level == "error")'
```

## Creating Custom Formatters

### Basic Pattern

```javascript
const { LogFormatter } = require('console-bridge');

class MyFormatter extends LogFormatter {
  // Override format() for complete control
  format(logData) {
    // logData contains: type, args, source, timestamp, location
    return `[${logData.type.toUpperCase()}] ${logData.args.join(' ')}`;
  }
}
```

### Override Specific Methods

```javascript
class MyFormatter extends LogFormatter {
  // Override just the timestamp format
  formatTimestamp(timestamp) {
    return `[${new Date(timestamp).toLocaleString()}]`;
  }

  // Override just the level format
  formatLevel(level) {
    return level.toUpperCase() + ':';
  }

  // Use parent's format() method
  format(logData) {
    return super.format(logData);
  }
}
```

## Available Methods to Override

| Method | Purpose | Input | Output |
|--------|---------|-------|--------|
| `format(logData)` | Main formatting function | Log data object | Formatted string |
| `formatTimestamp(timestamp)` | Format timestamp | Unix timestamp | Formatted timestamp |
| `formatSource(source)` | Format source URL | URL string | Formatted source |
| `formatLevel(level)` | Format log level | Level string | Formatted level |
| `formatMessage(args)` | Format message arguments | Array of args | Formatted message |
| `formatArg(arg)` | Format single argument | Single arg | Formatted arg |
| `formatLocation(location)` | Format file location | Location object | Formatted location |

## Log Data Structure

The `logData` object passed to `format()` contains:

```javascript
{
  type: 'error',                    // Log level
  args: ['Error message', { ... }], // Original arguments
  source: 'http://localhost:3000',  // Source URL
  timestamp: 1696345678901,         // Unix timestamp
  location: {                       // Optional
    url: 'app.js',
    lineNumber: 42,
    columnNumber: 10
  }
}
```

## Use Cases

### 1. Integration with External Logging Services

```javascript
class DatadogFormatter extends LogFormatter {
  format(logData) {
    return JSON.stringify({
      service: 'my-app',
      ddsource: 'browser',
      level: logData.type,
      message: logData.args.join(' '),
      timestamp: logData.timestamp,
      tags: [`source:${logData.source}`],
    });
  }
}
```

### 2. Custom Color Schemes

```javascript
const chalk = require('chalk');

class DarkModeFormatter extends LogFormatter {
  formatLevel(level) {
    const colors = {
      log: chalk.gray,
      info: chalk.cyan,
      warn: chalk.yellow,
      error: chalk.red.bold,
      debug: chalk.magenta,
    };
    return colors[level](level + ':');
  }
}
```

### 3. Minimalist Formatter

```javascript
class MinimalFormatter extends LogFormatter {
  format(logData) {
    // Just message, no timestamp or source
    return logData.args.join(' ');
  }
}
```

### 4. Verbose Formatter

```javascript
class VerboseFormatter extends LogFormatter {
  format(logData) {
    const lines = [
      '='.repeat(80),
      `Time: ${new Date(logData.timestamp).toISOString()}`,
      `Source: ${logData.source}`,
      `Level: ${logData.type}`,
      `Message: ${logData.args.join(' ')}`,
    ];

    if (logData.location) {
      lines.push(`Location: ${logData.location.url}:${logData.location.lineNumber}`);
    }

    lines.push('='.repeat(80));
    return lines.join('\n');
  }
}
```

## Using Custom Formatters

### With BridgeManager

```javascript
const { BridgeManager } = require('console-bridge');

const bridge = new BridgeManager();
bridge.formatter = new MyCustomFormatter({
  showTimestamp: true,
  // ... other options
});

await bridge.start('localhost:3000');
```

### Standalone

```javascript
const formatter = new MyCustomFormatter();

const logData = {
  type: 'error',
  args: ['Something went wrong'],
  source: 'http://localhost:3000',
  timestamp: Date.now(),
};

const formatted = formatter.format(logData);
console.log(formatted);
```

## Tips

1. **Preserve parent options** - Call `super(options)` in constructor
2. **Handle edge cases** - Check for null/undefined in args
3. **Performance** - Avoid heavy processing in formatters (called frequently)
4. **Testing** - Test formatters with various log types and arguments
5. **Colors** - Use chalk for terminal colors, strip for file output

## Further Reading

- [API Documentation](../../docs/API.md) - LogFormatter API reference
- [Programmatic Examples](../programmatic/) - More API usage examples

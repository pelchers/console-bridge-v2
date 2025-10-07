# Console Bridge 🌉

Stream browser console output from your localhost applications directly to your terminal. Perfect for developers who want to monitor multiple applications simultaneously without switching between browser tabs.

![npm version](https://img.shields.io/npm/v/console-bridge.svg)
![license](https://img.shields.io/npm/l/console-bridge.svg)
![downloads](https://img.shields.io/npm/dm/console-bridge.svg)

## Features ✨

- 📡 **Real-time streaming** - See console output instantly in your terminal
- 🎯 **Multi-app support** - Monitor multiple localhost applications simultaneously
- 🎨 **Color-coded output** - Easy identification of log types (error, warn, info, etc.)
- 🏷️ **Source labels** - Each log shows which localhost port it came from
- 🔄 **Auto-reconnection** - Maintains connection even through page refreshes
- 📦 **Zero dependencies** - Minimal footprint on your applications
- 🛡️ **Secure by default** - Only accepts connections from localhost

## Installation 📦

```bash
# Global installation (recommended)
npm install -g console-bridge

# Local installation
npm install --save-dev console-bridge
```

## Quick Start 🚀

### 1. Start the bridge server

```bash
console-bridge start
```

### 2. Add to your HTML

Add this script tag to your localhost application:

```html
<script src="http://localhost:9999/bridge.js"></script>
```

### 3. Watch the magic happen! ✨

All console output from your browser will now appear in your terminal:

```
[2024-01-20 15:23:45] [localhost:3000] LOG: Application initialized
[2024-01-20 15:23:46] [localhost:3000] INFO: User logged in
[2024-01-20 15:23:47] [localhost:8080] ERROR: API request failed
[2024-01-20 15:23:48] [localhost:3000] WARN: Deprecated function called
```

## Usage 💻

### CLI Commands

```bash
# Start the bridge server
console-bridge start

# Start on a different port
console-bridge start -p 8888

# Start in verbose mode
console-bridge start -v

# Check status
console-bridge status

# List active connections
console-bridge list

# Stop the server
console-bridge stop

# Show help
console-bridge --help
```

### Integration Methods

#### Script Tag (Recommended)
```html
<!-- Add to your HTML -->
<script src="http://localhost:9999/bridge.js"></script>
```

#### Dynamic Loading
```javascript
// Load programmatically
const script = document.createElement('script');
script.src = 'http://localhost:9999/bridge.js';
document.head.appendChild(script);
```

#### Conditional Loading
```javascript
// Only load in development
if (window.location.hostname === 'localhost') {
  const script = document.createElement('script');
  script.src = 'http://localhost:9999/bridge.js';
  document.head.appendChild(script);
}
```

## Configuration ⚙️

Create a `console-bridge.json` file in your project root:

```json
{
  "port": 9999,
  "host": "localhost",
  "formatting": {
    "timestamp": true,
    "colors": true,
    "source": true
  },
  "reconnectInterval": 5000,
  "maxConnections": 100
}
```

Or use environment variables:

```bash
CONSOLE_BRIDGE_PORT=8888 console-bridge start
```

## Examples 📚

### React Application

```jsx
// In your index.html or App component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const script = document.createElement('script');
    script.src = 'http://localhost:9999/bridge.js';
    document.body.appendChild(script);
  }
}, []);
```

### Vue.js Application

```javascript
// In main.js or App.vue
if (process.env.NODE_ENV === 'development') {
  const script = document.createElement('script');
  script.src = 'http://localhost:9999/bridge.js';
  document.head.appendChild(script);
}
```

### Multiple Applications

Start your applications on different ports and they'll all connect automatically:

```bash
# Terminal 1
npm run dev # Runs on :3000

# Terminal 2  
npm run api # Runs on :8080

# Terminal 3
console-bridge start # All logs appear here
```

## Advanced Usage 🔧

### Custom Formatting

```javascript
// In your app, before console-bridge loads
window.CONSOLE_BRIDGE_CONFIG = {
  format: (log) => {
    // Custom formatting logic
    return `[${log.type}] ${log.message}`;
  }
};
```

### Filtering Logs

```bash
# Only show errors and warnings
console-bridge start --filter "error|warn"

# Exclude debug logs
console-bridge start --exclude "debug"
```

### Export Logs

```bash
# Save logs to file
console-bridge start --output logs.txt

# Pipe to other tools
console-bridge start | grep ERROR
```

## Troubleshooting 🔍

### Connection refused
- Ensure the bridge server is running: `console-bridge status`
- Check if the port is available: `lsof -i :9999`
- Verify firewall settings

### No logs appearing
- Check browser console for errors
- Ensure script is loaded: `window.__CONSOLE_BRIDGE_CONNECTED`
- Verify you're on localhost

### Performance issues
- Reduce log frequency in your app
- Increase `reconnectInterval` in config
- Use filtering to reduce output

## Security 🛡️

Console Bridge is designed with security in mind:

- **Localhost only** - Refuses connections from external sources
- **No code execution** - Only forwards console output
- **Message validation** - Sanitizes all data
- **Size limits** - Prevents memory exhaustion

## Development 🛠️

```bash
# Clone the repository
git clone https://github.com/yourusername/console-bridge.git
cd console-bridge

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build client script
npm run build:client
```

## Contributing 🤝

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap 🗺️

- [ ] Browser extension version
- [ ] Log persistence and search
- [ ] Web UI dashboard
- [ ] Remote debugging support
- [ ] Custom log handlers
- [ ] Integration with popular frameworks

## License 📄

MIT © [Your Name]

## Acknowledgments 🙏

- Inspired by the need for better multi-app debugging
- Built with [ws](https://github.com/websockets/ws), [chalk](https://github.com/chalk/chalk), and [commander](https://github.com/tj/commander.js)
- Thanks to all contributors and users

---

**Happy debugging!** 🐛✨

If you find this tool useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📖 Improving documentation

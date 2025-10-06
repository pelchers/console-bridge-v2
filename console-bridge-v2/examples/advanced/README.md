# Advanced Examples

Complex usage patterns and real-world scenarios.

## Examples

### multi-instance-filters.js

Monitors multiple services with different log level filters for each.

```bash
node multi-instance-filters.js
```

**Features:**
- Monitors 3 different services simultaneously
- Each service has its own log level filter
- Writes to service-specific log files
- Writes all logs to master log file
- Shows statistics every 30 seconds
- Custom service prefixes in output

**Services configured:**
1. Frontend (localhost:3000) - Errors and warnings only
2. API Server (localhost:8080) - Errors only
3. Admin Panel (localhost:5000) - All log levels

**Output files:**
- `output/master.log` - All logs from all services
- `output/frontend.log` - Only frontend logs
- `output/api-server.log` - Only API server logs
- `output/admin-panel.log` - Only admin panel logs

## Real-World Scenarios

### Scenario 1: Full-Stack Development

Monitor frontend and multiple backend services:

```javascript
const { BridgeManager } = require('console-bridge');

const services = [
  { url: 'localhost:3000', name: 'React App' },
  { url: 'localhost:4000', name: 'GraphQL API' },
  { url: 'localhost:5000', name: 'Auth Service' },
  { url: 'localhost:6000', name: 'Payment Service' },
];

const bridges = await Promise.all(
  services.map(async (service) => {
    const bridge = new BridgeManager({
      output: (log) => console.log(`[${service.name}]`, log),
    });
    await bridge.start(service.url);
    return bridge;
  })
);
```

### Scenario 2: CI/CD Integration

Monitor application for errors during E2E tests:

```javascript
const { BridgeManager } = require('console-bridge');

const errors = [];

const bridge = new BridgeManager({
  levels: ['error'],
  output: (log) => {
    errors.push(log);
    console.error(log);
  },
});

// Start application
await bridge.start('localhost:3000');

// Run E2E tests
await runTests();

// Check for errors
await bridge.stop();

if (errors.length > 0) {
  console.error(`Tests passed but ${errors.length} console errors detected!`);
  process.exit(1);
}
```

### Scenario 3: Production-Like Monitoring

Monitor multiple environments with different configurations:

```javascript
const environments = [
  {
    name: 'Staging',
    url: 'localhost:3000',
    levels: ['warn', 'error'],
    alertOnError: true,
  },
  {
    name: 'Dev',
    url: 'localhost:4000',
    levels: ['log', 'info', 'warn', 'error'],
    alertOnError: false,
  },
];

for (const env of environments) {
  const bridge = new BridgeManager({
    levels: env.levels,
    output: (log) => {
      console.log(`[${env.name}]`, log);

      if (env.alertOnError && log.includes('error:')) {
        sendSlackAlert(`Error in ${env.name}: ${log}`);
      }
    },
  });

  await bridge.start(env.url);
}
```

### Scenario 4: Load Testing

Monitor application under load:

```javascript
const { BridgeManager } = require('console-bridge');

let errorCount = 0;
let warningCount = 0;
const startTime = Date.now();

const bridge = new BridgeManager({
  levels: ['warn', 'error'],
  output: (log) => {
    if (log.includes('error:')) errorCount++;
    if (log.includes('warn:')) warningCount++;

    console.log(log);
  },
});

await bridge.start('localhost:3000');

// Run load test
await runLoadTest({ duration: 300, rps: 1000 });

await bridge.stop();

const duration = (Date.now() - startTime) / 1000;
console.log(`\nLoad test completed in ${duration}s`);
console.log(`Errors: ${errorCount}`);
console.log(`Warnings: ${warningCount}`);
console.log(`Error rate: ${(errorCount / duration).toFixed(2)} errors/sec`);
```

### Scenario 5: Microservices Dashboard

Real-time dashboard for microservices:

```javascript
const express = require('express');
const { BridgeManager } = require('console-bridge');

const app = express();
const logs = [];
const MAX_LOGS = 1000;

const bridge = new BridgeManager({
  output: (log) => {
    logs.push({
      timestamp: Date.now(),
      message: log,
    });

    // Keep only recent logs
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }

    // Broadcast to WebSocket clients
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ type: 'log', data: log }));
    });
  },
});

// API endpoints
app.get('/logs', (req, res) => {
  res.json(logs);
});

app.get('/stats', (req, res) => {
  const errors = logs.filter((l) => l.message.includes('error:')).length;
  const warnings = logs.filter((l) => l.message.includes('warn:')).length;

  res.json({
    total: logs.length,
    errors,
    warnings,
    activeUrls: bridge.getActiveUrls(),
  });
});

app.listen(9000);
await bridge.start(['localhost:3000', 'localhost:4000', 'localhost:5000']);
```

## Performance Optimization

### Optimize for High-Volume Logs

```javascript
const { BridgeManager } = require('console-bridge');

// Use buffering for high-volume logs
let buffer = [];
const FLUSH_INTERVAL = 1000; // 1 second

const bridge = new BridgeManager({
  output: (log) => {
    buffer.push(log);
  },
});

// Flush buffer periodically
setInterval(() => {
  if (buffer.length > 0) {
    console.log(`Flushing ${buffer.length} logs...`);
    buffer.forEach((log) => console.log(log));
    buffer = [];
  }
}, FLUSH_INTERVAL);

await bridge.start('localhost:3000');
```

### Limit Resource Usage

```javascript
const bridge = new BridgeManager({
  maxInstances: 5,           // Limit browser instances
  headless: true,            // Use less resources
  levels: ['error', 'warn'], // Only capture critical logs
});
```

## Tips for Advanced Usage

1. **Separate concerns** - Use different BridgeManager instances for different services
2. **Filter early** - Use `levels` option to reduce processing overhead
3. **Buffer writes** - For high-volume logs, buffer before writing to disk
4. **Monitor resources** - Keep an eye on memory/CPU usage with many instances
5. **Use timeouts** - Set reasonable timeouts for navigation
6. **Handle failures gracefully** - One service failing shouldn't stop others
7. **Log rotation** - Implement log rotation for long-running monitors

## Troubleshooting Advanced Setups

### High Memory Usage

```javascript
// Reduce instances
const bridge = new BridgeManager({ maxInstances: 3 });

// Or use separate processes
const { fork } = require('child_process');
const worker = fork('monitor-worker.js');
```

### Slow Performance

```javascript
// Filter more aggressively
const bridge = new BridgeManager({
  levels: ['error'], // Only errors
  formatterOptions: {
    showTimestamp: false, // Faster formatting
    showLocation: false,
  },
});

// Or use sampling
let sampleCount = 0;
const SAMPLE_RATE = 10; // Log every 10th message

const bridge = new BridgeManager({
  output: (log) => {
    if (++sampleCount % SAMPLE_RATE === 0) {
      console.log(log);
    }
  },
});
```

## Further Reading

- [API Documentation](../../docs/API.md) - Full API reference
- [Programmatic Examples](../programmatic/) - Basic API usage
- [User Guide](../../docs/USAGE.md) - CLI usage

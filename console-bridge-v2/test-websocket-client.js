/**
 * Test WebSocket Client for Extension Mode
 *
 * Simulates Chrome extension sending protocol v1.0.0 messages to CLI.
 */

const WebSocket = require('ws');

// Connect to CLI WebSocket server
const ws = new WebSocket('ws://localhost:9223');

ws.on('open', () => {
  console.log('✓ Connected to CLI WebSocket server\n');

  // 1. Send connection_status
  console.log('1️⃣  Sending connection_status message...');
  const connectionStatus = {
    version: '1.0.0',
    type: 'connection_status',
    timestamp: new Date().toISOString(),
    source: {
      tabId: 99999,
      url: 'http://localhost:8080/test.html',
      title: 'Test Client'
    },
    payload: {
      status: 'connected',
      clientInfo: {
        extensionVersion: '2.0.0',
        browser: 'Chrome',
        browserVersion: '120.0.0'
      }
    }
  };
  ws.send(JSON.stringify(connectionStatus));

  // Wait a bit, then send console events
  setTimeout(() => {
    // 2. Send console.log() event
    console.log('2️⃣  Sending console.log event...');
    const consoleLog = {
      version: '1.0.0',
      type: 'console_event',
      timestamp: new Date().toISOString(),
      source: {
        tabId: 99999,
        url: 'http://localhost:8080/test.html',
        title: 'Test Client'
      },
      payload: {
        method: 'log',
        args: [
          { type: 'string', value: 'Hello from test client!' },
          { type: 'number', value: 42 },
          { type: 'boolean', value: true }
        ],
        location: {
          url: 'http://localhost:8080/app.js',
          line: 10,
          column: 5
        }
      }
    };
    ws.send(JSON.stringify(consoleLog));
  }, 500);

  setTimeout(() => {
    // 3. Send console.warn() event
    console.log('3️⃣  Sending console.warn event...');
    const consoleWarn = {
      version: '1.0.0',
      type: 'console_event',
      timestamp: new Date().toISOString(),
      source: {
        tabId: 99999,
        url: 'http://localhost:8080/test.html',
        title: 'Test Client'
      },
      payload: {
        method: 'warn',
        args: [
          { type: 'string', value: 'This is a warning!' }
        ],
        location: {
          url: 'http://localhost:8080/app.js',
          line: 15,
          column: 10
        }
      }
    };
    ws.send(JSON.stringify(consoleWarn));
  }, 1000);

  setTimeout(() => {
    // 4. Send console.error() event
    console.log('4️⃣  Sending console.error event...');
    const consoleError = {
      version: '1.0.0',
      type: 'console_event',
      timestamp: new Date().toISOString(),
      source: {
        tabId: 99999,
        url: 'http://localhost:8080/test.html',
        title: 'Test Client'
      },
      payload: {
        method: 'error',
        args: [
          { type: 'string', value: 'Error occurred:' },
          { type: 'object', value: { code: 500, message: 'Internal error' } }
        ],
        location: {
          url: 'http://localhost:8080/app.js',
          line: 20,
          column: 15
        }
      }
    };
    ws.send(JSON.stringify(consoleError));
  }, 1500);

  setTimeout(() => {
    // 5. Send ping
    console.log('5️⃣  Sending ping...');
    const ping = {
      version: '1.0.0',
      type: 'ping',
      timestamp: new Date().toISOString(),
      source: {
        tabId: 99999,
        url: 'http://localhost:8080/test.html',
        title: 'Test Client'
      },
      payload: {}
    };
    ws.send(JSON.stringify(ping));
  }, 2000);

  // Close after 3 seconds
  setTimeout(() => {
    console.log('\n✅ All test messages sent. Closing connection...');
    ws.close();
    process.exit(0);
  }, 3000);
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log(`📨 Received from server: ${message.type}`);
  if (message.type === 'pong') {
    console.log('   ✓ Pong received (keep-alive working!)');
  } else if (message.type === 'welcome') {
    console.log(`   ✓ Welcome: ${message.payload.message}`);
  }
});

ws.on('close', () => {
  console.log('❌ Connection closed');
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  process.exit(1);
});

/**
 * Mock WebSocket Server for Testing Protocol v1.0.0
 *
 * This server listens on ws://localhost:9223 and logs all incoming messages
 * to verify the extension is sending protocol v1.0.0 compliant messages.
 */

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 9223 });

console.log('🌉 Mock WebSocket Server');
console.log('Listening on ws://localhost:9223');
console.log('Waiting for extension connection...\n');

wss.on('connection', (ws) => {
  console.log('✅ Extension connected!');
  console.log('─'.repeat(80));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      console.log('\n📨 Received Message:');
      console.log('Type:', message.type);
      console.log('Version:', message.version);
      console.log('Timestamp:', message.timestamp);

      if (message.source) {
        console.log('Source:');
        console.log('  - Tab ID:', message.source.tabId);
        console.log('  - URL:', message.source.url);
        console.log('  - Title:', message.source.title);
      }

      if (message.payload) {
        console.log('Payload:', JSON.stringify(message.payload, null, 2));
      }

      console.log('─'.repeat(80));

      // Send pong in response to ping
      if (message.type === 'ping') {
        const pong = {
          version: '1.0.0',
          type: 'pong',
          timestamp: new Date().toISOString(),
          payload: {}
        };
        ws.send(JSON.stringify(pong));
        console.log('↩️  Sent pong response');
      }

      // Send welcome on connection_status
      if (message.type === 'connection_status' && message.payload?.status === 'connected') {
        const welcome = {
          version: '1.0.0',
          type: 'welcome',
          timestamp: new Date().toISOString(),
          payload: {
            message: 'Mock WebSocket server ready',
            serverVersion: '1.0.0-mock'
          }
        };
        ws.send(JSON.stringify(welcome));
        console.log('↩️  Sent welcome message');
      }

    } catch (error) {
      console.error('❌ Failed to parse message:', error);
      console.log('Raw data:', data.toString());
    }
  });

  ws.on('close', () => {
    console.log('\n❌ Extension disconnected');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

wss.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down mock server...');
  wss.close();
  process.exit(0);
});

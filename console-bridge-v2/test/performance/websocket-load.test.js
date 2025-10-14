/**
 * Performance Tests for WebSocket Server (Extension Mode)
 *
 * Tests WebSocket server performance under various load conditions:
 * - High-frequency message handling
 * - Multiple concurrent connections
 * - Message queuing behavior
 * - Reconnection scenarios
 */

const WebSocket = require('ws');
const WebSocketServer = require('../../src/core/WebSocketServer');
const LogFormatter = require('../../src/formatters/LogFormatter');

describe('WebSocket Performance Tests', () => {
  let server;
  let port = 9224; // Different port to avoid conflicts

  beforeEach(() => {
    server = new WebSocketServer({
      port,
      formatter: new LogFormatter(),
      output: () => {}, // Suppress output during tests
    });
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('High-Frequency Message Handling', () => {
    test('handles 1000 messages rapidly without errors', async () => {
      await server.start();

      const client = new WebSocket(`ws://localhost:${port}`);
      const errors = [];

      client.on('error', (err) => errors.push(err));

      await new Promise((resolve) => client.once('open', resolve));

      // Send 1000 messages rapidly
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        client.send(JSON.stringify({
          version: '1.0.0',
          type: 'console_event',
          timestamp: new Date().toISOString(),
          source: {
            tabId: 1,
            url: 'http://localhost:3000',
            title: 'Test Page'
          },
          payload: {
            method: 'log',
            args: [{ type: 'string', value: `Message ${i}` }],
            location: { lineNumber: 1, columnNumber: 1 }
          }
        }));
      }

      // Wait for all messages to be processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      const duration = Date.now() - startTime;

      expect(errors).toHaveLength(0);
      expect(duration).toBeLessThan(2000); // Should process in < 2 seconds
      expect(client.readyState).toBe(WebSocket.OPEN);

      client.close();
    });

    test('handles large payload messages (100KB each)', async () => {
      await server.start();

      const client = new WebSocket(`ws://localhost:${port}`);
      const errors = [];

      client.on('error', (err) => errors.push(err));

      await new Promise((resolve) => client.once('open', resolve));

      // Send 10 large messages
      const largeData = 'x'.repeat(100000); // 100KB string
      for (let i = 0; i < 10; i++) {
        client.send(JSON.stringify({
          version: '1.0.0',
          type: 'console_event',
          timestamp: new Date().toISOString(),
          source: {
            tabId: 1,
            url: 'http://localhost:3000',
            title: 'Test Page'
          },
          payload: {
            method: 'log',
            args: [{ type: 'string', value: largeData }],
            location: { lineNumber: 1, columnNumber: 1 }
          }
        }));
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(errors).toHaveLength(0);
      expect(client.readyState).toBe(WebSocket.OPEN);

      client.close();
    });
  });

  describe('Multiple Concurrent Connections', () => {
    test('handles 10 simultaneous client connections', async () => {
      await server.start();

      const clients = [];
      const errors = [];

      // Connect 10 clients
      for (let i = 0; i < 10; i++) {
        const client = new WebSocket(`ws://localhost:${port}`);
        client.on('error', (err) => errors.push(err));
        clients.push(client);
      }

      // Wait for all connections
      await Promise.all(
        clients.map((client) => new Promise((resolve) => client.once('open', resolve)))
      );

      expect(errors).toHaveLength(0);
      expect(server.getClientCount()).toBe(10);

      // Each client sends 100 messages
      for (const client of clients) {
        for (let i = 0; i < 100; i++) {
          client.send(JSON.stringify({
            version: '1.0.0',
            type: 'console_event',
            timestamp: new Date().toISOString(),
            source: {
              tabId: i,
              url: 'http://localhost:3000',
              title: 'Test Page'
            },
            payload: {
              method: 'log',
              args: [{ type: 'string', value: `Message ${i}` }],
              location: { lineNumber: 1, columnNumber: 1 }
            }
          }));
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(errors).toHaveLength(0);

      // Close all clients
      clients.forEach((client) => client.close());
    });

    test('maintains stability when clients connect and disconnect rapidly', async () => {
      await server.start();

      for (let i = 0; i < 20; i++) {
        const client = new WebSocket(`ws://localhost:${port}`);
        await new Promise((resolve) => client.once('open', resolve));

        // Send a few messages
        for (let j = 0; j < 10; j++) {
          client.send(JSON.stringify({
            version: '1.0.0',
            type: 'console_event',
            timestamp: new Date().toISOString(),
            source: {
              tabId: i,
              url: 'http://localhost:3000',
              title: 'Test Page'
            },
            payload: {
              method: 'log',
              args: [{ type: 'string', value: `Message ${j}` }],
              location: { lineNumber: 1, columnNumber: 1 }
            }
          }));
        }

        // Immediately close
        client.close();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Server should still be stable
      expect(server.getClientCount()).toBe(0);
    });
  });

  describe('Message Queue Behavior', () => {
    test('handles rapid disconnect and reconnect without errors', async () => {
      await server.start();

      const client1 = new WebSocket(`ws://localhost:${port}`);
      await new Promise((resolve) => client1.once('open', resolve));

      // Send messages
      for (let i = 0; i < 100; i++) {
        client1.send(JSON.stringify({
          version: '1.0.0',
          type: 'console_event',
          timestamp: new Date().toISOString(),
          source: {
            tabId: 1,
            url: 'http://localhost:3000',
            title: 'Test Page'
          },
          payload: {
            method: 'log',
            args: [{ type: 'string', value: `Message ${i}` }],
            location: { lineNumber: 1, columnNumber: 1 }
          }
        }));
      }

      // Disconnect
      client1.close();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Reconnect immediately
      const client2 = new WebSocket(`ws://localhost:${port}`);
      await new Promise((resolve) => client2.once('open', resolve));

      // Send more messages
      for (let i = 100; i < 200; i++) {
        client2.send(JSON.stringify({
          version: '1.0.0',
          type: 'console_event',
          timestamp: new Date().toISOString(),
          source: {
            tabId: 2,
            url: 'http://localhost:3000',
            title: 'Test Page'
          },
          payload: {
            method: 'log',
            args: [{ type: 'string', value: `Message ${i}` }],
            location: { lineNumber: 1, columnNumber: 1 }
          }
        }));
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(client2.readyState).toBe(WebSocket.OPEN);
      client2.close();
    });

    test('handles multiple disconnects and reconnects', async () => {
      await server.start();

      for (let cycle = 0; cycle < 5; cycle++) {
        const client = new WebSocket(`ws://localhost:${port}`);
        await new Promise((resolve) => client.once('open', resolve));

        // Send messages
        for (let i = 0; i < 50; i++) {
          client.send(JSON.stringify({
            version: '1.0.0',
            type: 'console_event',
            timestamp: new Date().toISOString(),
            source: {
              tabId: cycle,
              url: 'http://localhost:3000',
              title: 'Test Page'
            },
            payload: {
              method: 'log',
              args: [{ type: 'string', value: `Cycle ${cycle} Message ${i}` }],
              location: { lineNumber: 1, columnNumber: 1 }
            }
          }));
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
        client.close();
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Server should be stable
      expect(server.getClientCount()).toBe(0);
    });
  });

  describe('Ping/Pong Keep-Alive', () => {
    test('responds to ping messages', async () => {
      await server.start();

      const client = new WebSocket(`ws://localhost:${port}`);
      await new Promise((resolve) => client.once('open', resolve));

      let pongReceived = false;
      client.on('pong', () => {
        pongReceived = true;
      });

      // Send ping
      client.ping();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(pongReceived).toBe(true);
      client.close();
    });

    test('maintains connection during idle periods', async () => {
      await server.start();

      const client = new WebSocket(`ws://localhost:${port}`);
      await new Promise((resolve) => client.once('open', resolve));

      // Wait 5 seconds without sending anything
      await new Promise((resolve) => setTimeout(resolve, 5000));

      expect(client.readyState).toBe(WebSocket.OPEN);
      client.close();
    }, 10000); // 10 second timeout for this test
  });

  describe('Error Handling', () => {
    test('handles malformed JSON without crashing', async () => {
      await server.start();

      const client = new WebSocket(`ws://localhost:${port}`);
      await new Promise((resolve) => client.once('open', resolve));

      const errors = [];
      client.on('error', (err) => errors.push(err));

      // Send malformed JSON
      client.send('{ invalid json }');
      client.send('not json at all');
      client.send('');

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Server should still be running
      expect(server.getClientCount()).toBe(1);
      client.close();
    });

    test('handles invalid message types gracefully', async () => {
      await server.start();

      const client = new WebSocket(`ws://localhost:${port}`);
      await new Promise((resolve) => client.once('open', resolve));

      // Send invalid message types
      client.send(JSON.stringify({ type: 'invalid' }));
      client.send(JSON.stringify({ type: null }));
      client.send(JSON.stringify({ }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(client.readyState).toBe(WebSocket.OPEN);
      client.close();
    });
  });

  describe('Memory and Resource Management', () => {
    test('properly cleans up closed connections', async () => {
      await server.start();

      // Create and close 100 connections
      for (let i = 0; i < 100; i++) {
        const client = new WebSocket(`ws://localhost:${port}`);
        await new Promise((resolve) => client.once('open', resolve));
        client.close();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // All connections should be cleaned up
      expect(server.getClientCount()).toBe(0);
    });

    test('handles server stop with active connections gracefully', async () => {
      await server.start();

      const clients = [];
      for (let i = 0; i < 5; i++) {
        const client = new WebSocket(`ws://localhost:${port}`);
        await new Promise((resolve) => client.once('open', resolve));
        clients.push(client);
      }

      // Stop server with active connections
      await server.stop();

      // Verify all connections were closed
      await new Promise((resolve) => setTimeout(resolve, 100));
      clients.forEach((client) => {
        expect(client.readyState).toBe(WebSocket.CLOSED);
      });
    });
  });
});

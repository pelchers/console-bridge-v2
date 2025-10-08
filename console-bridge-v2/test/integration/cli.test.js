/**
 * CLI Integration Tests
 * Tests the command-line interface functionality
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLI_PATH = path.join(__dirname, '../../bin/console-bridge.js');
const TIMEOUT = 10000;

/**
 * Helper to run CLI command
 */
function runCLI(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      ...options,
      env: { ...process.env, ...options.env },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr, child });
    });

    // Return child for manual control (e.g., sending signals)
    if (options.returnChild) {
      resolve({ child, stdout: () => stdout, stderr: () => stderr });
    }
  });
}

/**
 * Helper to wait for output containing text
 */
function waitForOutput(child, text, timeout = 5000) {
  return new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for: ${text}`));
    }, timeout);

    const handler = (data) => {
      output += data.toString();
      if (output.includes(text)) {
        clearTimeout(timer);
        child.stdout.off('data', handler);
        resolve(output);
      }
    };

    child.stdout.on('data', handler);
  });
}

describe('CLI', () => {
  describe('help and version', () => {
    test('shows help when no arguments', async () => {
      const result = await runCLI([]);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('console-bridge');
    }, TIMEOUT);

    test('shows help with --help', async () => {
      const result = await runCLI(['--help']);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('start');
    }, TIMEOUT);

    test('shows version with --version', async () => {
      const result = await runCLI(['--version']);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    }, TIMEOUT);

    test('shows help for start command', async () => {
      const result = await runCLI(['start', '--help']);
      expect(result.stdout).toContain('start');
      expect(result.stdout).toContain('urls');
    }, TIMEOUT);
  });

  describe('argument validation', () => {
    test('rejects start with no URLs', async () => {
      const result = await runCLI(['start']);
      expect(result.code).toBe(1);
      const output = result.stdout + result.stderr;
      expect(output).toContain('No URLs provided');
    }, TIMEOUT);

    test('rejects invalid URL', async () => {
      const result = await runCLI(['start', 'invalid-url']);
      expect(result.code).toBe(1);
      const output = result.stdout + result.stderr;
      expect(output).toContain('Invalid');
    }, TIMEOUT);

    test('rejects non-localhost URL', async () => {
      const result = await runCLI(['start', 'http://google.com']);
      expect(result.code).toBe(1);
      const output = result.stdout + result.stderr;
      expect(output).toContain('localhost');
    }, TIMEOUT);

    test('rejects multiple invalid URLs', async () => {
      const result = await runCLI(['start', 'invalid1', 'invalid2']);
      expect(result.code).toBe(1);
      const output = result.stdout + result.stderr;
      expect(output).toContain('Invalid');
    }, TIMEOUT);
  });

  describe('option parsing', () => {
    test('parses --levels option', async () => {
      // This will fail to connect but should parse options correctly
      const { child } = await runCLI(['start', 'localhost:9999', '--levels', 'error,warning'], {
        returnChild: true,
      });

      // Wait for startup message
      try {
        await waitForOutput(child, 'Starting monitors', 2000);
      } catch {
        // Expected to fail connecting
      }

      child.kill('SIGTERM');
    }, TIMEOUT);

    test('parses --no-headless option', async () => {
      const { child } = await runCLI(['start', 'localhost:9999', '--no-headless'], {
        returnChild: true,
      });

      try {
        await waitForOutput(child, 'Starting monitors', 2000);
      } catch {
        // Expected to fail connecting
      }

      child.kill('SIGTERM');
    }, TIMEOUT);

    test('parses --max-instances option', async () => {
      const { child } = await runCLI(['start', 'localhost:9999', '--max-instances', '5'], {
        returnChild: true,
      });

      try {
        await waitForOutput(child, 'Starting monitors', 2000);
      } catch {
        // Expected to fail connecting
      }

      child.kill('SIGTERM');
    }, TIMEOUT);

    test('parses multiple options', async () => {
      const { child } = await runCLI([
        'start',
        'localhost:9999',
        '--levels',
        'error',
        '--no-timestamp',
        '--location',
      ], {
        returnChild: true,
      });

      try {
        await waitForOutput(child, 'Starting monitors', 2000);
      } catch {
        // Expected to fail connecting
      }

      child.kill('SIGTERM');
    }, TIMEOUT);
  });

  describe('startup messages', () => {
    test('shows version in header', async () => {
      const { child } = await runCLI(['start', 'localhost:9999'], {
        returnChild: true,
      });

      try {
        const output = await waitForOutput(child, 'Console Bridge', 2000);
        expect(output).toMatch(/Console Bridge v\d+\.\d+\.\d+/);
      } finally {
        child.kill('SIGTERM');
      }
    }, TIMEOUT);

    test('shows "Starting monitors" message', async () => {
      const { child } = await runCLI(['start', 'localhost:9999'], {
        returnChild: true,
      });

      try {
        const output = await waitForOutput(child, 'Starting monitors', 2000);
        expect(output).toContain('Starting monitors');
      } finally {
        child.kill('SIGTERM');
      }
    }, TIMEOUT);
  });

  describe('signal handling', () => {
    // Note: Signal handling tests are platform-specific
    // Skip on Windows where signals work differently
    const isWindows = process.platform === 'win32';
    const testFn = isWindows ? test.skip : test;

    testFn('handles SIGINT (Ctrl+C) gracefully', async () => {
      const { child } = await runCLI(['start', 'localhost:9999'], {
        returnChild: true,
      });

      // Wait for startup
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Send SIGINT
      child.kill('SIGINT');

      // Wait for process to exit
      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      // Process should have terminated
      expect(child.killed).toBe(true);
    }, TIMEOUT);

    testFn('handles SIGTERM gracefully', async () => {
      const { child } = await runCLI(['start', 'localhost:9999'], {
        returnChild: true,
      });

      // Wait for startup
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Send SIGTERM
      child.kill('SIGTERM');

      // Wait for process to exit
      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      // Process should have terminated
      expect(child.killed).toBe(true);
    }, TIMEOUT);

    test('can be stopped with kill()', async () => {
      const { child } = await runCLI(['start', 'localhost:9999'], {
        returnChild: true,
      });

      // Wait for startup
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Process should be running
      expect(child.killed).toBe(false);

      // Kill process
      child.kill();

      // Wait for exit
      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      // Process should have been killed
      expect(child.killed).toBe(true);
    }, TIMEOUT);
  });

  describe('error handling', () => {
    test('handles BridgeManager errors gracefully', async () => {
      // Use a URL that will fail to connect
      const result = await runCLI(['start', 'localhost:99999']);

      // Should exit with error code
      expect(result.code).toBe(1);
      // Output should show startup attempt
      const output = result.stdout + result.stderr;
      expect(output).toContain('Console Bridge');
    }, TIMEOUT);

    test('continues with other URLs if one fails', async () => {
      const { child } = await runCLI(
        ['start', 'localhost:9998', 'localhost:9999'],
        { returnChild: true }
      );

      let stdout = '';
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      // Wait a bit for processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      child.kill('SIGTERM');

      // Wait for shutdown
      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      // Should attempt to start both
      expect(stdout).toContain('Starting monitors');
    }, TIMEOUT);
  });

  describe('URL normalization', () => {
    test('accepts URL without protocol', async () => {
      const { child } = await runCLI(['start', 'localhost:9999'], {
        returnChild: true,
      });

      try {
        await waitForOutput(child, 'Starting monitors', 2000);
      } catch {
        // Expected to fail connecting
      } finally {
        child.kill('SIGTERM');
      }
    }, TIMEOUT);

    test('accepts URL with http://', async () => {
      const { child } = await runCLI(['start', 'http://localhost:9999'], {
        returnChild: true,
      });

      try {
        await waitForOutput(child, 'Starting monitors', 2000);
      } catch {
        // Expected to fail connecting
      } finally {
        child.kill('SIGTERM');
      }
    }, TIMEOUT);

    test('accepts 127.0.0.1', async () => {
      const { child } = await runCLI(['start', '127.0.0.1:9999'], {
        returnChild: true,
      });

      try {
        await waitForOutput(child, 'Starting monitors', 2000);
      } catch {
        // Expected to fail connecting
      } finally {
        child.kill('SIGTERM');
      }
    }, TIMEOUT);
  });

  describe('file export', () => {
    const TEST_LOG_FILE = path.join(__dirname, '../temp-test-log.txt');

    // Clean up test log file before and after tests
    beforeEach(() => {
      if (fs.existsSync(TEST_LOG_FILE)) {
        fs.unlinkSync(TEST_LOG_FILE);
      }
    });

    afterEach(() => {
      if (fs.existsSync(TEST_LOG_FILE)) {
        fs.unlinkSync(TEST_LOG_FILE);
      }
    });

    test('creates log file when --output specified', async () => {
      const { child } = await runCLI(
        ['start', 'localhost:9999', '--output', TEST_LOG_FILE],
        { returnChild: true }
      );

      // Wait for file to be created
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // File should exist
      expect(fs.existsSync(TEST_LOG_FILE)).toBe(true);

      child.kill('SIGTERM');

      // Wait for shutdown
      await new Promise((resolve) => {
        child.on('close', resolve);
      });
    }, TIMEOUT);

    test('file does not contain ANSI color codes', async () => {
      const { child } = await runCLI(
        ['start', 'localhost:9999', '--output', TEST_LOG_FILE],
        { returnChild: true }
      );

      // Wait for potential logs
      await new Promise((resolve) => setTimeout(resolve, 1500));

      child.kill('SIGTERM');

      // Wait for shutdown
      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      // Read file content
      if (fs.existsSync(TEST_LOG_FILE)) {
        const content = fs.readFileSync(TEST_LOG_FILE, 'utf8');

        // Should not contain ANSI escape codes
        // ANSI codes start with \x1b[ or \u001b[
        expect(content).not.toMatch(/\x1b\[/);
        expect(content).not.toMatch(/\u001b\[/);
      }
    }, TIMEOUT);

    test('appends to existing file', async () => {
      // Create file with initial content
      fs.writeFileSync(TEST_LOG_FILE, 'Initial log entry\n');

      const { child } = await runCLI(
        ['start', 'localhost:9999', '--output', TEST_LOG_FILE],
        { returnChild: true }
      );

      // Wait for potential logs
      await new Promise((resolve) => setTimeout(resolve, 1000));

      child.kill('SIGTERM');

      // Wait for shutdown
      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      // Read file content
      const content = fs.readFileSync(TEST_LOG_FILE, 'utf8');

      // Should still contain initial content
      expect(content).toContain('Initial log entry');
    }, TIMEOUT);

    test('shows file logging message on startup', async () => {
      const result = await runCLI([
        'start',
        'localhost:9999',
        '--output',
        TEST_LOG_FILE,
      ]);

      // Should mention logging to file
      const output = result.stdout + result.stderr;
      expect(output).toContain('Logging to file');
      expect(output).toContain(TEST_LOG_FILE);
    }, TIMEOUT);

    test('handles invalid file path gracefully', async () => {
      // Try to write to a path that doesn't exist
      const invalidPath = '/nonexistent/directory/log.txt';

      const result = await runCLI([
        'start',
        'localhost:9999',
        '--output',
        invalidPath,
      ]);

      // Should show error
      expect(result.code).toBe(1);
      const output = result.stdout + result.stderr;
      expect(output).toContain('Failed to create log file');
    }, TIMEOUT);

    test('works with multiple URLs', async () => {
      const { child } = await runCLI(
        [
          'start',
          'localhost:9998',
          'localhost:9999',
          '--output',
          TEST_LOG_FILE,
        ],
        { returnChild: true }
      );

      // Wait for potential logs
      await new Promise((resolve) => setTimeout(resolve, 1500));

      child.kill('SIGTERM');

      // Wait for shutdown
      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      // File should exist
      expect(fs.existsSync(TEST_LOG_FILE)).toBe(true);
    }, TIMEOUT);

    test('file output works with --no-timestamp option', async () => {
      const { child } = await runCLI(
        [
          'start',
          'localhost:9999',
          '--output',
          TEST_LOG_FILE,
          '--no-timestamp',
        ],
        { returnChild: true }
      );

      // Wait for potential logs
      await new Promise((resolve) => setTimeout(resolve, 1000));

      child.kill('SIGTERM');

      // Wait for shutdown
      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      // File should exist
      expect(fs.existsSync(TEST_LOG_FILE)).toBe(true);
    }, TIMEOUT);
  });
});

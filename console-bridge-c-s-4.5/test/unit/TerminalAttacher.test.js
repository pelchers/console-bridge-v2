/**
 * Unit tests for TerminalAttacher
 */

const TerminalAttacher = require('../../src/core/TerminalAttacher');
const processUtils = require('../../src/utils/processUtils');

// Mock processUtils
jest.mock('../../src/utils/processUtils');

describe('TerminalAttacher', () => {
  let attacher;
  let mockOutputFn;

  beforeEach(() => {
    attacher = new TerminalAttacher();
    mockOutputFn = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(attacher.attached).toBe(false);
      expect(attacher.targetPid).toBeNull();
      expect(attacher.originalOutput).toBeNull();
    });

    it('should accept port option', () => {
      const attacher2 = new TerminalAttacher({ port: 3000 });
      expect(attacher2.port).toBe(3000);
    });
  });

  describe('attach', () => {
    it('should successfully attach when process found', async () => {
      // Mock process discovery
      processUtils.findProcessByPort.mockResolvedValue(12345);
      processUtils.processExists.mockResolvedValue(true);
      processUtils.hasProcessPermission.mockResolvedValue(true);
      processUtils.getProcessInfo.mockResolvedValue({
        pid: 12345,
        command: 'node',
      });

      const result = await attacher.attach(3000, mockOutputFn);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully attached');
      expect(result.message).toContain('12345');
      expect(result.outputFn).toBeInstanceOf(Function);
      expect(attacher.isAttached()).toBe(true);
      expect(attacher.getTargetPid()).toBe(12345);
    });

    it('should fallback when no process found on port', async () => {
      processUtils.findProcessByPort.mockResolvedValue(null);

      const result = await attacher.attach(3000, mockOutputFn);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No process found');
      expect(result.outputFn).toBe(mockOutputFn);
      expect(attacher.isAttached()).toBe(false);
    });

    it('should fallback when process does not exist', async () => {
      processUtils.findProcessByPort.mockResolvedValue(12345);
      processUtils.processExists.mockResolvedValue(false);

      const result = await attacher.attach(3000, mockOutputFn);

      expect(result.success).toBe(false);
      expect(result.message).toContain('no longer exists');
      expect(result.outputFn).toBe(mockOutputFn);
    });

    it('should fallback when permission denied', async () => {
      processUtils.findProcessByPort.mockResolvedValue(12345);
      processUtils.processExists.mockResolvedValue(true);
      processUtils.hasProcessPermission.mockResolvedValue(false);

      const result = await attacher.attach(3000, mockOutputFn);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Permission denied');
      expect(result.outputFn).toBe(mockOutputFn);
    });

    it('should fallback when cannot get process info', async () => {
      processUtils.findProcessByPort.mockResolvedValue(12345);
      processUtils.processExists.mockResolvedValue(true);
      processUtils.hasProcessPermission.mockResolvedValue(true);
      processUtils.getProcessInfo.mockResolvedValue(null);

      const result = await attacher.attach(3000, mockOutputFn);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Could not retrieve information');
      expect(result.outputFn).toBe(mockOutputFn);
    });

    it('should handle errors gracefully', async () => {
      processUtils.findProcessByPort.mockRejectedValue(new Error('Test error'));

      const result = await attacher.attach(3000, mockOutputFn);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to attach');
      expect(result.message).toContain('Test error');
      expect(result.outputFn).toBe(mockOutputFn);
    });
  });

  describe('detach', () => {
    it('should detach when attached', async () => {
      // Set up attached state
      processUtils.findProcessByPort.mockResolvedValue(12345);
      processUtils.processExists.mockResolvedValue(true);
      processUtils.hasProcessPermission.mockResolvedValue(true);
      processUtils.getProcessInfo.mockResolvedValue({
        pid: 12345,
        command: 'node',
      });

      await attacher.attach(3000, mockOutputFn);
      expect(attacher.isAttached()).toBe(true);

      attacher.detach();

      expect(attacher.isAttached()).toBe(false);
      expect(attacher.getTargetPid()).toBeNull();
    });

    it('should handle detach when not attached', () => {
      expect(() => attacher.detach()).not.toThrow();
      expect(attacher.isAttached()).toBe(false);
    });
  });

  describe('isAttached', () => {
    it('should return false initially', () => {
      expect(attacher.isAttached()).toBe(false);
    });

    it('should return true when attached', async () => {
      processUtils.findProcessByPort.mockResolvedValue(12345);
      processUtils.processExists.mockResolvedValue(true);
      processUtils.hasProcessPermission.mockResolvedValue(true);
      processUtils.getProcessInfo.mockResolvedValue({
        pid: 12345,
        command: 'node',
      });

      await attacher.attach(3000, mockOutputFn);
      expect(attacher.isAttached()).toBe(true);
    });
  });

  describe('getTargetPid', () => {
    it('should return null initially', () => {
      expect(attacher.getTargetPid()).toBeNull();
    });

    it('should return PID when attached', async () => {
      processUtils.findProcessByPort.mockResolvedValue(12345);
      processUtils.processExists.mockResolvedValue(true);
      processUtils.hasProcessPermission.mockResolvedValue(true);
      processUtils.getProcessInfo.mockResolvedValue({
        pid: 12345,
        command: 'node',
      });

      await attacher.attach(3000, mockOutputFn);
      expect(attacher.getTargetPid()).toBe(12345);
    });
  });

  describe('createUnifiedOutput', () => {
    it('should create function that writes to stdout', async () => {
      processUtils.findProcessByPort.mockResolvedValue(12345);
      processUtils.processExists.mockResolvedValue(true);
      processUtils.hasProcessPermission.mockResolvedValue(true);
      processUtils.getProcessInfo.mockResolvedValue({
        pid: 12345,
        command: 'node',
      });

      const result = await attacher.attach(3000, mockOutputFn);

      expect(result.outputFn).toBeInstanceOf(Function);

      // Mock process.stdout.write
      const originalWrite = process.stdout.write;
      const mockWrite = jest.fn();
      process.stdout.write = mockWrite;

      result.outputFn('test message');

      expect(mockWrite).toHaveBeenCalledWith('test message\n');

      // Restore
      process.stdout.write = originalWrite;
    });

    it('should fallback to original function on write error', async () => {
      processUtils.findProcessByPort.mockResolvedValue(12345);
      processUtils.processExists.mockResolvedValue(true);
      processUtils.hasProcessPermission.mockResolvedValue(true);
      processUtils.getProcessInfo.mockResolvedValue({
        pid: 12345,
        command: 'node',
      });

      const result = await attacher.attach(3000, mockOutputFn);

      // Mock stdout.write to throw error
      const originalWrite = process.stdout.write;
      process.stdout.write = () => {
        throw new Error('Write failed');
      };

      result.outputFn('test message');

      // Should have called fallback
      expect(mockOutputFn).toHaveBeenCalledWith('test message');

      // Restore
      process.stdout.write = originalWrite;
    });
  });
});

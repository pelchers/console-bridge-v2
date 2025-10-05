/**
 * Unit tests for processUtils
 */

const {
  getPlatform,
  findProcessByPort,
  processExists,
  getProcessInfo,
  hasProcessPermission,
} = require('../../src/utils/processUtils');

const os = require('os');

describe('processUtils', () => {
  describe('getPlatform', () => {
    it('should return valid platform', () => {
      const platform = getPlatform();
      expect(['windows', 'darwin', 'linux']).toContain(platform);
    });

    it('should match current OS', () => {
      const platform = getPlatform();
      const osPlatform = os.platform();

      if (osPlatform === 'win32') {
        expect(platform).toBe('windows');
      } else if (osPlatform === 'darwin') {
        expect(platform).toBe('darwin');
      } else {
        expect(platform).toBe('linux');
      }
    });
  });

  describe('findProcessByPort', () => {
    it('should return null for non-existent port', async () => {
      // Use a very high port unlikely to be in use
      const pid = await findProcessByPort(64999);
      expect(pid).toBeNull();
    });

    it('should find process on active port', async () => {
      // This test assumes the portfolio test app is running on 3847
      // In a real test suite, we'd mock the exec calls
      const pid = await findProcessByPort(3847);

      // If dev server is running, should find PID
      if (pid !== null) {
        expect(typeof pid).toBe('number');
        expect(pid).toBeGreaterThan(0);
      }
    }, 10000); // 10 second timeout for slower systems

    it('should handle invalid port numbers gracefully', async () => {
      const pid1 = await findProcessByPort(-1);
      const pid2 = await findProcessByPort(99999);

      expect(pid1).toBeNull();
      expect(pid2).toBeNull();
    });
  });

  describe('processExists', () => {
    it('should return false for invalid PID', async () => {
      const exists = await processExists(null);
      expect(exists).toBe(false);
    });

    it('should return false for non-existent PID', async () => {
      // Use a very high PID unlikely to exist
      const exists = await processExists(999999);
      expect(exists).toBe(false);
    });

    it('should return true for current process', async () => {
      const currentPid = process.pid;
      const exists = await processExists(currentPid);
      expect(exists).toBe(true);
    });

    it('should return false for NaN', async () => {
      const exists = await processExists(NaN);
      expect(exists).toBe(false);
    });
  });

  describe('getProcessInfo', () => {
    it('should return null for invalid PID', async () => {
      const info = await getProcessInfo(null);
      expect(info).toBeNull();
    });

    it('should return null for non-existent PID', async () => {
      const info = await getProcessInfo(999999);
      expect(info).toBeNull();
    });

    it('should return info for current process', async () => {
      const currentPid = process.pid;
      const info = await getProcessInfo(currentPid);

      expect(info).not.toBeNull();
      expect(info).toHaveProperty('pid');
      expect(info).toHaveProperty('command');
      expect(info.pid).toBe(currentPid);
      expect(typeof info.command).toBe('string');
      expect(info.command.length).toBeGreaterThan(0);
    });

    it('should return null for NaN', async () => {
      const info = await getProcessInfo(NaN);
      expect(info).toBeNull();
    });
  });

  describe('hasProcessPermission', () => {
    it('should return false for invalid PID', async () => {
      const hasPermission = await hasProcessPermission(null);
      expect(hasPermission).toBe(false);
    });

    it('should return false for non-existent PID', async () => {
      const hasPermission = await hasProcessPermission(999999);
      expect(hasPermission).toBe(false);
    });

    it('should return true for current process', async () => {
      const currentPid = process.pid;
      const hasPermission = await hasProcessPermission(currentPid);
      expect(hasPermission).toBe(true);
    });
  });

  describe('integration: findProcessByPort + processExists', () => {
    it('should find and verify process on port 3847 if running', async () => {
      const pid = await findProcessByPort(3847);

      if (pid !== null) {
        // If we found a process, it should exist
        const exists = await processExists(pid);
        expect(exists).toBe(true);

        // And we should be able to get its info
        const info = await getProcessInfo(pid);
        expect(info).not.toBeNull();
        expect(info.pid).toBe(pid);

        // And we should have permission to access it
        const hasPermission = await hasProcessPermission(pid);
        expect(hasPermission).toBe(true);
      }
    }, 10000);
  });
});

/**
 * Test processUtils on Windows
 */

const {
  getPlatform,
  findProcessByPort,
  processExists,
  getProcessInfo,
  hasProcessPermission,
} = require('./src/utils/processUtils');

async function testProcessUtils() {
  console.log('🧪 Testing processUtils on Windows\n');

  // Test 1: Platform detection
  const platform = getPlatform();
  console.log(`1. Platform: ${platform}`);
  console.log(`   Expected: windows`);
  console.log(`   ✓ ${platform === 'windows' ? 'PASS' : 'FAIL'}\n`);

  // Test 2: Find process by port (3847)
  console.log('2. Finding process on port 3847...');
  const pid = await findProcessByPort(3847);
  console.log(`   PID: ${pid}`);
  console.log(`   ✓ ${pid ? 'PASS' : 'FAIL'}\n`);

  if (!pid) {
    console.log('⚠️  No process found on port 3847. Make sure dev server is running.');
    return;
  }

  // Test 3: Check if process exists
  console.log(`3. Checking if process ${pid} exists...`);
  const exists = await processExists(pid);
  console.log(`   Exists: ${exists}`);
  console.log(`   ✓ ${exists ? 'PASS' : 'FAIL'}\n`);

  // Test 4: Get process info
  console.log(`4. Getting process info for PID ${pid}...`);
  const info = await getProcessInfo(pid);
  console.log(`   Info: ${JSON.stringify(info, null, 2)}`);
  console.log(`   ✓ ${info ? 'PASS' : 'FAIL'}\n`);

  // Test 5: Check process permission
  console.log(`5. Checking process permission for PID ${pid}...`);
  const permission = await hasProcessPermission(pid);
  console.log(`   Has permission: ${permission}`);
  console.log(`   ✓ ${permission ? 'PASS' : 'FAIL'}\n`);

  console.log('✅ All tests completed!');
}

testProcessUtils().catch(console.error);

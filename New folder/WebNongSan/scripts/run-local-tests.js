const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function resolvePhpBinary() {
  if (process.env.PHP_BINARY && fs.existsSync(process.env.PHP_BINARY)) {
    return process.env.PHP_BINARY;
  }

  const candidates = [];

  if (process.platform === 'win32') {
    candidates.push(
      'php',
      'C:\\xampp\\php\\php.exe',
      'C:\\php\\php.exe',
      'C:\\Program Files\\PHP\\php.exe',
      'C:\\Program Files (x86)\\PHP\\php.exe'
    );
  } else {
    candidates.push('php');
  }

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['-v'], { encoding: 'utf8' });
    if (result.status === 0) {
      return candidate;
    }
  }

  throw new Error(
    'Unable to find a usable PHP executable. Set PHP_BINARY or install PHP so the local tests can run.'
  );
}

function runCommand(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    throw new Error(label);
  }
}

try {
  const phpBinary = resolvePhpBinary();
  const rootDir = path.resolve(__dirname, '..');

  runCommand(phpBinary, ['-l', path.join(rootDir, 'utils', 'order_helpers.php')], 'Lint helper failed');
  runCommand(phpBinary, ['-l', path.join(rootDir, 'tests', 'order_helpers_test.php')], 'Lint test failed');
  runCommand(phpBinary, ['-l', path.join(rootDir, 'nongsan-api', 'api_orders.php')], 'Lint nongsan-api/api_orders.php failed');
  runCommand(phpBinary, ['-l', path.join(rootDir, 'api', 'api_orders.php')], 'Lint api/api_orders.php failed');
  runCommand(phpBinary, [path.join(rootDir, 'tests', 'order_helpers_test.php')], 'PHP local tests failed');

  console.log('Local PHP tests passed.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
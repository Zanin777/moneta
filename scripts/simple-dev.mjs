import { spawn } from 'node:child_process';

const children = [
  spawn(process.execPath, ['--experimental-strip-types', 'backend/index.ts'], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--config', 'vite.simple.config.ts', ...process.argv.slice(2)], { stdio: 'inherit' }),
];
let stopping = false;

function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const child of children) {
  child.on('error', stop);
  child.on('exit', stop);
}

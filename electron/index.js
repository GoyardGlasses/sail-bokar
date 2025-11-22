#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Start the backend first
const backendPath = path.join(__dirname, '..', 'backend');
console.log('[Launcher] Starting backend from:', backendPath);

const backendProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--port=8000', '--host=127.0.0.1'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

// Wait a bit for backend to start, then start Electron
setTimeout(() => {
  console.log('[Launcher] Starting Electron...');
  const electronPath = require.resolve('electron/cli');
  const electronProcess = spawn('node', [electronPath, '.'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  electronProcess.on('exit', (code) => {
    console.log('[Launcher] Electron exited with code:', code);
    backendProcess.kill();
    process.exit(code);
  });
}, 2000);

process.on('SIGINT', () => {
  backendProcess.kill();
  process.exit(0);
});

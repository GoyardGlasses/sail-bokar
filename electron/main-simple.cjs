const electron = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
let backendProcess;

const BACKEND_PORT = 8000;

// Start backend
function startBackend() {
  const backendPath = path.join(__dirname, '..', 'backend');
  console.log('[Main] Starting backend from:', backendPath);
  
  backendProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', `--port=${BACKEND_PORT}`, '--host=127.0.0.1'], {
    cwd: backendPath,
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });

  backendProcess.stdout?.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr?.on('data', (data) => {
    console.error(`[Backend Error] ${data.toString().trim()}`);
  });
}

// Create window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, 'renderer', 'index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App events
app.on('ready', () => {
  console.log('[Main] App ready');
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    console.log('[Main] Killing backend process');
    backendProcess.kill();
  }
});

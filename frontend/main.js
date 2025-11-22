const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess;
const BACKEND_URL = 'http://127.0.0.1:8000';
const FRONTEND_URL = 'http://localhost:5173';
const MAX_RETRIES = 30;
const RETRY_DELAY = 1000;

/**
 * Check if a URL is accessible
 */
function checkUrlAccessible(url, retries = 0) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    }).on('error', () => {
      if (retries < MAX_RETRIES) {
        setTimeout(() => {
          resolve(checkUrlAccessible(url, retries + 1));
        }, RETRY_DELAY);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(FRONTEND_URL);
  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('did-fail-load', () => {
    console.log('Failed to load, retrying...');
    setTimeout(() => {
      mainWindow.reload();
    }, 2000);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Start the backend server
 */
function startBackend() {
  const backendPath = path.join(__dirname, '../backend');
  console.log('Starting backend from:', backendPath);

  backendProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true,
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });

  backendProcess.on('exit', (code) => {
    console.log('Backend process exited with code:', code);
  });
}

/**
 * Wait for frontend to be ready
 */
async function waitForFrontend() {
  console.log('Waiting for frontend to be ready...');
  const isReady = await checkUrlAccessible(FRONTEND_URL);
  if (isReady) {
    console.log('Frontend is ready!');
  } else {
    console.log('Frontend did not respond, but proceeding anyway...');
  }
}

/**
 * Initialize the application
 */
app.on('ready', async () => {
  console.log('Electron app is ready');
  startBackend();
  await waitForFrontend();
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
  if (backendProcess) {
    console.log('Killing backend process...');
    backendProcess.kill();
  }
});

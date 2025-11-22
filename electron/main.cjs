const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const axios = require('axios')

// In CommonJS, __filename and __dirname are available globally

let mainWindow
let backendProcess
let backendReady = false

const isDev = process.env.NODE_ENV === 'development'
const BACKEND_PORT = 8000
const BACKEND_HEALTH_TIMEOUT = 30000 // 30 seconds
const BACKEND_HEALTH_CHECK_INTERVAL = 500 // 500ms

/**
 * Get backend directory path
 */
function getBackendPath() {
  // Try development location first
  let backendPath = path.join(__dirname, '..', 'backend')
  if (fs.existsSync(backendPath)) {
    return backendPath
  }

  // Try packaged location
  backendPath = path.join(process.resourcesPath, 'backend')
  if (fs.existsSync(backendPath)) {
    return backendPath
  }

  return null
}

/**
 * Check if backend is healthy
 */
async function checkBackendHealth() {
  try {
    const response = await axios.get(`http://localhost:${BACKEND_PORT}/meta/health`, {
      timeout: 5000,
    })
    return response.status === 200
  } catch {
    return false
  }
}

/**
 * Wait for backend to be ready
 */
async function waitForBackendReady() {
  const startTime = Date.now()
  while (Date.now() - startTime < BACKEND_HEALTH_TIMEOUT) {
    if (await checkBackendHealth()) {
      backendReady = true
      console.log('[Main] Backend is ready')
      return true
    }
    await new Promise((resolve) => setTimeout(resolve, BACKEND_HEALTH_CHECK_INTERVAL))
  }
  return false
}

/**
 * Start FastAPI backend process
 */
async function startBackend() {
  const backendPath = getBackendPath()

  if (!backendPath) {
    console.error('[Main] Backend directory not found')
    console.log('[Main] Continuing in development mode without backend...')
    return true // Allow app to continue in dev mode
  }

  console.log(`[Main] Starting backend from: ${backendPath}`)

  try {
    // Start backend using Python and uvicorn
    backendProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', `--port=${BACKEND_PORT}`, '--host=127.0.0.1'], {
      cwd: backendPath,
      detached: false,
      stdio: 'pipe',
      shell: process.platform === 'win32', // Use shell on Windows
    })

    backendProcess.stdout?.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`)
    })

    backendProcess.stderr?.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`)
    })

    backendProcess.on('error', (error) => {
      console.error('[Main] Failed to start backend:', error.message)
      backendReady = false
    })

    backendProcess.on('exit', (code) => {
      console.log(`[Main] Backend exited with code ${code}`)
      backendReady = false
    })

    // Wait for backend to be ready
    const isReady = await waitForBackendReady()
    if (!isReady) {
      console.error('[Main] Backend failed to start within timeout')
      console.log('[Main] Continuing in development mode...')
      return true // Allow app to continue even if backend fails
    }

    return true
  } catch (error) {
    console.error('[Main] Error starting backend:', error)
    console.log('[Main] Continuing in development mode...')
    return true // Allow app to continue
  }
}

/**
 * Create main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, 'renderer', 'index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * Prevent multiple instances
 */
if (app) {
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

app.on('ready', async () => {
  const backendStarted = await startBackend()
  if (backendStarted || isDev) {
    createWindow()
  } else {
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    console.log('[Main] Killing backend process')
    backendProcess.kill()
  }
})

// IPC Handlers
ipcMain.handle('get-backend-status', async () => {
  const isHealthy = await checkBackendHealth()
  return {
    running: backendProcess && !backendProcess.killed,
    healthy: isHealthy,
  }
})

ipcMain.handle('restart-backend', async () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill()
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  const success = await startBackend()
  return { success }
})

ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    isDev,
  }
})

ipcMain.handle('open-logs', async () => {
  const logsPath = path.join(app.getPath('userData'), 'logs')
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath, { recursive: true })
  }
  // Open logs folder in system file explorer
  require('electron').shell.openPath(logsPath)
})

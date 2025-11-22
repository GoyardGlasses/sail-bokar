import { contextBridge, ipcRenderer } from 'electron'

/**
 * Secure API bridge between renderer and main process
 * Only expose safe, necessary APIs
 */
contextBridge.exposeInMainWorld('api', {
  // Backend management
  getBackendStatus: () => ipcRenderer.invoke('get-backend-status'),
  restartBackend: () => ipcRenderer.invoke('restart-backend'),

  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Logs
  openLogs: () => ipcRenderer.invoke('open-logs'),
})

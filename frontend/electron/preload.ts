import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Printer
  printReceipt: (content: string) => ipcRenderer.invoke('print-receipt', content),
  printLabel: () => ipcRenderer.invoke('print-label'),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,

  // Update mechanism
  onUpdateAvailable: (callback: (info: any) => void) =>
    ipcRenderer.on('update-available', (_event, info) => callback(info)),
  onDownloadProgress: (callback: (percent: number) => void) =>
    ipcRenderer.on('download-progress', (_event, percent) => callback(percent)),
  onUpdateDownloaded: (callback: (info: any) => void) =>
    ipcRenderer.on('update-downloaded', (_event, info) => callback(info)),
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
});
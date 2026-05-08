import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
    // Printer
    printReceipt: (content) => ipcRenderer.invoke('print-receipt', content),
    printLabel: () => ipcRenderer.invoke('print-label'),
    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    platform: process.platform,
    // Update mechanism
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_event, info) => callback(info)),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_event, percent) => callback(percent)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (_event, info) => callback(info)),
    checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
});

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, '../../public/icon.ico'),
  });

  // IPC: Print receipt handler
  ipcMain.handle('print-receipt', async (_event, content: string) => {
    // Untuk sekarang, hanya log. Akan diimplementasi penuh di Phase 4 (POS)
    console.log('Print receipt:', content);
    return { success: true };
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
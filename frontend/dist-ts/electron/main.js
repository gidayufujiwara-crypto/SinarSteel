import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { setupAutoUpdater } from './updater';
const isDev = process.env.NODE_ENV === 'development';
// Jalankan backend sebagai child process
function startBackend() {
    const backendPath = isDev
        ? path.join(__dirname, '..', '..', 'resources', 'backend', 'backend.exe')
        : path.join(process.resourcesPath, 'backend', 'backend.exe');
    console.log('Starting backend from:', backendPath);
    const backend = spawn(backendPath, [], {
        stdio: 'pipe',
        windowsHide: true,
    });
    backend.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });
    backend.stderr.on('data', (data) => {
        console.error(`Backend error: ${data}`);
    });
    backend.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
    return backend;
}
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
    ipcMain.handle('print-receipt', async (_event, content) => {
        console.log('Print receipt:', content);
        return { success: true };
    });
    // IPC: Print label handler
    ipcMain.handle('print-label', async () => {
        console.log('Print label dipanggil');
        return { success: true };
    });
    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path.join(__dirname, '../../dist/index.html'));
    }
    return win;
}
app.whenReady().then(() => {
    startBackend(); // ← jalankan backend
    const win = createWindow();
    setupAutoUpdater(win); // ← setup update otomatis
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
app.on('before-quit', () => {
    // backend akan mati sendiri karena parent process exit
});

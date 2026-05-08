import { autoUpdater } from 'electron-updater';
import { ipcMain } from 'electron';
export function setupAutoUpdater(mainWindow) {
    // Nonaktifkan logger bawaan, gunakan console
    autoUpdater.logger = null;
    // Cek update setiap kali aplikasi dibuka
    autoUpdater.checkForUpdates().catch(err => {
        console.log('Gagal mengecek update:', err);
    });
    autoUpdater.on('update-available', (info) => {
        mainWindow.webContents.send('update-available', info);
    });
    autoUpdater.on('download-progress', (progress) => {
        mainWindow.webContents.send('download-progress', progress.percent);
    });
    autoUpdater.on('update-downloaded', (info) => {
        mainWindow.webContents.send('update-downloaded', info);
    });
    ipcMain.handle('check-for-update', async () => {
        return await autoUpdater.checkForUpdates();
    });
    ipcMain.handle('install-update', () => {
        autoUpdater.quitAndInstall();
    });
}

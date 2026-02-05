import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { registerHandlers } from './ipc/handlers';
import { ensureDataDir } from './storage/fileManager';
import { getSettings } from './storage/settingsManager';

/**
 * Main application window management and initialization
 */

/**
 * Creates and configures the main browser window
 */
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // Security best practices: disable node integration in renderer
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#1a1b1e',
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#1a1b1e',
            symbolColor: '#ffffff'
        }
    });

    // In development mode, load from Vite dev server
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        // In production, load the built index.html
        win.loadFile(path.join(__dirname, '../../dist/index.html'));
    }
}

app.whenReady().then(async () => {
    // Initialize settings first, then storage
    await getSettings(); // This ensures settings file exists
    await ensureDataDir(); // This will use the configured path from settings
    registerHandlers();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

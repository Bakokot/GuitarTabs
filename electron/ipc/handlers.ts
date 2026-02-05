import { ipcMain, dialog, app } from 'electron';
import { getSongs, getSong, saveSong, deleteSong, migrateData } from '../storage/fileManager';
import { getSettings, updateSettings, getStoragePathAsync } from '../storage/settingsManager';
import { Song, AppSettings } from '../../src/types';
import * as path from 'path';

/**
 * Registers all Inter-Process Communication (IPC) handlers
 * This enables the React renderer process to communicate with the Node.js main process
 */
export function registerHandlers() {
    // Song management handlers
    ipcMain.handle('get-songs', async () => {
        return await getSongs();
    });

    ipcMain.handle('get-song', async (_, id: string) => {
        return await getSong(id);
    });

    ipcMain.handle('save-song', async (_, song: Song) => {
        return await saveSong(song);
    });

    ipcMain.handle('delete-song', async (_, id: string) => {
        return await deleteSong(id);
    });

    // Settings management handlers
    ipcMain.handle('get-settings', async () => {
        return await getSettings();
    });

    ipcMain.handle('update-settings', async (_, settings: AppSettings) => {
        return await updateSettings(settings);
    });

    /**
     * Opens a system dialog to let the user pick a directory for song storage
     */
    ipcMain.handle('select-storage-path', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory'],
            title: 'Select Storage Location for Songs',
            buttonLabel: 'Select Folder'
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        return result.filePaths[0];
    });

    /**
     * Handles moving files from one location to another when storage path is changed
     */
    ipcMain.handle('migrate-data', async (_, oldPath: string, newPath: string) => {
        return await migrateData(oldPath, newPath);
    });

    /**
     * Returns the default app data path
     */
    ipcMain.handle('get-default-storage-path', async () => {
        return path.join(app.getPath('userData'), 'data');
    });
}


import { contextBridge, ipcRenderer } from 'electron';
import { Song, ElectronAPI, AppSettings } from '../src/types';

const api: ElectronAPI = {
    getSongs: () => ipcRenderer.invoke('get-songs'),
    getSong: (id: string) => ipcRenderer.invoke('get-song', id),
    saveSong: (song: Song) => ipcRenderer.invoke('save-song', song),
    deleteSong: (id: string) => ipcRenderer.invoke('delete-song', id),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (settings: AppSettings) => ipcRenderer.invoke('update-settings', settings),
    selectStoragePath: () => ipcRenderer.invoke('select-storage-path'),
    migrateData: (oldPath: string, newPath: string) => ipcRenderer.invoke('migrate-data', oldPath, newPath),
    getDefaultStoragePath: () => ipcRenderer.invoke('get-default-storage-path'),
};

contextBridge.exposeInMainWorld('api', api);

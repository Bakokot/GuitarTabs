"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const api = {
    getSongs: () => electron_1.ipcRenderer.invoke('get-songs'),
    getSong: (id) => electron_1.ipcRenderer.invoke('get-song', id),
    saveSong: (song) => electron_1.ipcRenderer.invoke('save-song', song),
    deleteSong: (id) => electron_1.ipcRenderer.invoke('delete-song', id),
    getSettings: () => electron_1.ipcRenderer.invoke('get-settings'),
    updateSettings: (settings) => electron_1.ipcRenderer.invoke('update-settings', settings),
    selectStoragePath: () => electron_1.ipcRenderer.invoke('select-storage-path'),
    migrateData: (oldPath, newPath) => electron_1.ipcRenderer.invoke('migrate-data', oldPath, newPath),
    getDefaultStoragePath: () => electron_1.ipcRenderer.invoke('get-default-storage-path'),
};
electron_1.contextBridge.exposeInMainWorld('api', api);
//# sourceMappingURL=preload.js.map
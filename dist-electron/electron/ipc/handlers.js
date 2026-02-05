"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandlers = registerHandlers;
const electron_1 = require("electron");
const fileManager_1 = require("../storage/fileManager");
const settingsManager_1 = require("../storage/settingsManager");
const path = __importStar(require("path"));
/**
 * Registers all Inter-Process Communication (IPC) handlers
 * This enables the React renderer process to communicate with the Node.js main process
 */
function registerHandlers() {
    // Song management handlers
    electron_1.ipcMain.handle('get-songs', async () => {
        return await (0, fileManager_1.getSongs)();
    });
    electron_1.ipcMain.handle('get-song', async (_, id) => {
        return await (0, fileManager_1.getSong)(id);
    });
    electron_1.ipcMain.handle('save-song', async (_, song) => {
        return await (0, fileManager_1.saveSong)(song);
    });
    electron_1.ipcMain.handle('delete-song', async (_, id) => {
        return await (0, fileManager_1.deleteSong)(id);
    });
    // Settings management handlers
    electron_1.ipcMain.handle('get-settings', async () => {
        return await (0, settingsManager_1.getSettings)();
    });
    electron_1.ipcMain.handle('update-settings', async (_, settings) => {
        return await (0, settingsManager_1.updateSettings)(settings);
    });
    /**
     * Opens a system dialog to let the user pick a directory for song storage
     */
    electron_1.ipcMain.handle('select-storage-path', async () => {
        const result = await electron_1.dialog.showOpenDialog({
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
    electron_1.ipcMain.handle('migrate-data', async (_, oldPath, newPath) => {
        return await (0, fileManager_1.migrateData)(oldPath, newPath);
    });
    /**
     * Returns the default app data path
     */
    electron_1.ipcMain.handle('get-default-storage-path', async () => {
        return path.join(electron_1.app.getPath('userData'), 'data');
    });
}
//# sourceMappingURL=handlers.js.map
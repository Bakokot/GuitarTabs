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
const electron_1 = require("electron");
const path = __importStar(require("path"));
const handlers_1 = require("./ipc/handlers");
const fileManager_1 = require("./storage/fileManager");
const settingsManager_1 = require("./storage/settingsManager");
/**
 * Main application window management and initialization
 */
/**
 * Creates and configures the main browser window
 */
function createWindow() {
    const win = new electron_1.BrowserWindow({
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
    }
    else {
        // In production, load the built index.html
        win.loadFile(path.join(__dirname, '../../dist/index.html'));
    }
}
electron_1.app.whenReady().then(async () => {
    // Initialize settings first, then storage
    await (0, settingsManager_1.getSettings)(); // This ensures settings file exists
    await (0, fileManager_1.ensureDataDir)(); // This will use the configured path from settings
    (0, handlers_1.registerHandlers)();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map
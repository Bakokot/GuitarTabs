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
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
exports.getStoragePath = getStoragePath;
exports.getStoragePathAsync = getStoragePathAsync;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const SETTINGS_FILE = path.join(electron_1.app.getPath('userData'), 'settings.json');
const DEFAULT_SETTINGS = {
    storagePath: null, // null means use default userData/data
};
// Ensure settings file exists
async function ensureSettingsFile() {
    try {
        await fs.access(SETTINGS_FILE);
    }
    catch {
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    }
}
async function getSettings() {
    await ensureSettingsFile();
    try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading settings:', error);
        return DEFAULT_SETTINGS;
    }
}
async function updateSettings(settings) {
    await ensureSettingsFile();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}
function getStoragePath() {
    // This will be called synchronously, so we need to handle it differently
    // We'll read settings synchronously or return default
    const defaultPath = path.join(electron_1.app.getPath('userData'), 'data');
    try {
        const data = require('fs').readFileSync(SETTINGS_FILE, 'utf-8');
        const settings = JSON.parse(data);
        return settings.storagePath || defaultPath;
    }
    catch {
        return defaultPath;
    }
}
async function getStoragePathAsync() {
    const settings = await getSettings();
    return settings.storagePath || path.join(electron_1.app.getPath('userData'), 'data');
}
//# sourceMappingURL=settingsManager.js.map
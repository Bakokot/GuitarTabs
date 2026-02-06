import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AppSettings } from '../../src/types';

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
    storagePath: null,
    disableSaveWarning: false,
};

// Ensure settings file exists
async function ensureSettingsFile() {
    try {
        await fs.access(SETTINGS_FILE);
    } catch {
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    }
}

export async function getSettings(): Promise<AppSettings> {
    await ensureSettingsFile();
    try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
        const settings = JSON.parse(data);
        return { ...DEFAULT_SETTINGS, ...settings };
    } catch (error) {
        console.error('Error reading settings:', error);
        return DEFAULT_SETTINGS;
    }
}

export async function updateSettings(settings: AppSettings): Promise<void> {
    await ensureSettingsFile();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export function getStoragePath(): string {
    // This will be called synchronously, so we need to handle it differently
    // We'll read settings synchronously or return default
    const defaultPath = path.join(app.getPath('userData'), 'data');

    try {
        const data = require('fs').readFileSync(SETTINGS_FILE, 'utf-8');
        const settings: AppSettings = JSON.parse(data);
        return settings.storagePath || defaultPath;
    } catch {
        return defaultPath;
    }
}

export async function getStoragePathAsync(): Promise<string> {
    const settings = await getSettings();
    return settings.storagePath || path.join(app.getPath('userData'), 'data');
}

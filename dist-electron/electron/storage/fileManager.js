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
exports.ensureDataDir = ensureDataDir;
exports.getSongs = getSongs;
exports.getSong = getSong;
exports.saveSong = saveSong;
exports.deleteSong = deleteSong;
exports.migrateData = migrateData;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const settingsManager_1 = require("./settingsManager");
let DATA_DIR;
let INDEX_FILE;
// Initialize storage paths
async function initializePaths() {
    DATA_DIR = await (0, settingsManager_1.getStoragePathAsync)();
    INDEX_FILE = path.join(DATA_DIR, 'index.json');
}
// Ensure data directory exists
async function ensureDataDir() {
    await initializePaths();
    try {
        await fs.access(DATA_DIR);
    }
    catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
    try {
        await fs.access(INDEX_FILE);
    }
    catch {
        await fs.writeFile(INDEX_FILE, JSON.stringify([], null, 2));
    }
}
async function getSongs() {
    await ensureDataDir();
    const data = await fs.readFile(INDEX_FILE, 'utf-8');
    const songs = JSON.parse(data);
    return songs.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist || ''
    }));
}
async function getSong(id) {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, `${id}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error(`Error reading song ${id}:`, error);
        return null;
    }
}
async function saveSong(song) {
    await ensureDataDir();
    // 1. Save detailed song file
    const filePath = path.join(DATA_DIR, `${song.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(song, null, 2));
    // 2. Update index
    const songs = await getSongs();
    const index = songs.findIndex(s => s.id === song.id);
    const metadata = { id: song.id, title: song.title, artist: song.artist };
    if (index >= 0) {
        songs[index] = metadata;
    }
    else {
        songs.push(metadata);
    }
    await fs.writeFile(INDEX_FILE, JSON.stringify(songs, null, 2));
}
async function deleteSong(id) {
    await ensureDataDir();
    // 1. Remove file
    const filePath = path.join(DATA_DIR, `${id}.json`);
    try {
        await fs.unlink(filePath);
    }
    catch (err) {
        console.warn(`Failed to delete file for song ${id}`, err);
    }
    // 2. Update index
    const songs = await getSongs();
    const newSongs = songs.filter(s => s.id !== id);
    await fs.writeFile(INDEX_FILE, JSON.stringify(newSongs, null, 2));
}
// Migrate data from old path to new path (move operation)
async function migrateData(oldPath, newPath) {
    try {
        // Check if old path exists
        await fs.access(oldPath);
        // Ensure new path exists
        await fs.mkdir(newPath, { recursive: true });
        // Read all files from old directory
        const files = await fs.readdir(oldPath);
        // Move each file
        for (const file of files) {
            const oldFilePath = path.join(oldPath, file);
            const newFilePath = path.join(newPath, file);
            // Move file (rename works across same filesystem, otherwise copy+delete)
            try {
                await fs.rename(oldFilePath, newFilePath);
            }
            catch (error) {
                // If rename fails (different filesystem), copy and delete
                await fs.copyFile(oldFilePath, newFilePath);
                await fs.unlink(oldFilePath);
            }
        }
        // Remove old directory if empty
        try {
            await fs.rmdir(oldPath);
        }
        catch {
            // Directory might not be empty or might not exist, ignore
        }
        console.log(`Successfully migrated data from ${oldPath} to ${newPath}`);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            // Old path doesn't exist, nothing to migrate
            console.log('No existing data to migrate');
        }
        else {
            console.error('Error migrating data:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=fileManager.js.map
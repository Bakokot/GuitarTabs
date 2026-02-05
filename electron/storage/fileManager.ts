import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Song, SongMetadata } from '../../src/types';
import { getStoragePathAsync } from './settingsManager';

let DATA_DIR: string;
let INDEX_FILE: string;

// Initialize storage paths
async function initializePaths() {
    DATA_DIR = await getStoragePathAsync();
    INDEX_FILE = path.join(DATA_DIR, 'index.json');
}

// Ensure data directory exists
export async function ensureDataDir() {
    await initializePaths();

    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }

    try {
        await fs.access(INDEX_FILE);
    } catch {
        await fs.writeFile(INDEX_FILE, JSON.stringify([], null, 2));
    }
}

export async function getSongs(): Promise<SongMetadata[]> {
    await ensureDataDir();
    const data = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(data);
}

export async function getSong(id: string): Promise<Song | null> {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, `${id}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading song ${id}:`, error);
        return null;
    }
}

export async function saveSong(song: Song): Promise<void> {
    await ensureDataDir();

    // 1. Save detailed song file
    const filePath = path.join(DATA_DIR, `${song.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(song, null, 2));

    // 2. Update index
    const songs = await getSongs();
    const index = songs.findIndex(s => s.id === song.id);
    const metadata: SongMetadata = { id: song.id, title: song.title };

    if (index >= 0) {
        songs[index] = metadata;
    } else {
        songs.push(metadata);
    }

    await fs.writeFile(INDEX_FILE, JSON.stringify(songs, null, 2));
}

export async function deleteSong(id: string): Promise<void> {
    await ensureDataDir();

    // 1. Remove file
    const filePath = path.join(DATA_DIR, `${id}.json`);
    try {
        await fs.unlink(filePath);
    } catch (err) {
        console.warn(`Failed to delete file for song ${id}`, err);
    }

    // 2. Update index
    const songs = await getSongs();
    const newSongs = songs.filter(s => s.id !== id);
    await fs.writeFile(INDEX_FILE, JSON.stringify(newSongs, null, 2));
}

// Migrate data from old path to new path (move operation)
export async function migrateData(oldPath: string, newPath: string): Promise<void> {
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
            } catch (error) {
                // If rename fails (different filesystem), copy and delete
                await fs.copyFile(oldFilePath, newFilePath);
                await fs.unlink(oldFilePath);
            }
        }

        // Remove old directory if empty
        try {
            await fs.rmdir(oldPath);
        } catch {
            // Directory might not be empty or might not exist, ignore
        }

        console.log(`Successfully migrated data from ${oldPath} to ${newPath}`);
    } catch (error) {
        if ((error as any).code === 'ENOENT') {
            // Old path doesn't exist, nothing to migrate
            console.log('No existing data to migrate');
        } else {
            console.error('Error migrating data:', error);
            throw error;
        }
    }
}


/**
 * Represents a single note in a tablature block
 */
export interface TabNote {
    // Key is string number (1-6), value is fret number as string
    strings: { [stringNumber: number]: string };
}

/**
 * Represents a chord positioned within lyrics
 */
export interface ChordPosition {
    chord: string;      // e.g., "Am", "G7"
    position: number;   // Character index in the lyrics string
}

/**
 * A block of content within a song section (Tab, Chords, or Lyrics)
 */
export interface Block {
    id: string;
    type: 'tab' | 'chords' | 'lyrics' | 'chords-lyrics';
    content: string;                   // Text content (used for chords, lyrics, and chords-lyrics)
    tabData?: TabNote[];               // Structured data for interactive tab blocks
    chordPositions?: ChordPosition[];  // Positions for 'chords-lyrics' type
}

export interface Section {
    id: string;
    name: string;
    blocks: Block[];
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    key: string;
    tempo: number;
    capo: number;
    tuning: string;
    favorite: boolean;
    sections: Section[];
}

export interface SongMetadata {
    id: string;
    title: string;
}

export interface AppSettings {
    storagePath: string | null; // null = use default
}

export interface ElectronAPI {
    getSongs: () => Promise<SongMetadata[]>;
    getSong: (id: string) => Promise<Song | null>;
    saveSong: (song: Song) => Promise<void>;
    deleteSong: (id: string) => Promise<void>;
    getSettings: () => Promise<AppSettings>;
    updateSettings: (settings: AppSettings) => Promise<void>;
    selectStoragePath: () => Promise<string | null>;
    migrateData: (oldPath: string, newPath: string) => Promise<void>;
    getDefaultStoragePath: () => Promise<string>;
}

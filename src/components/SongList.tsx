import React, { useEffect, useState } from 'react';
import { SongMetadata } from '../types';

interface SongListProps {
    onEdit: (id: string) => void;
    onNew: () => void;
    onSettings: () => void;
}

export const SongList: React.FC<SongListProps> = ({ onEdit, onNew, onSettings }) => {
    const [songs, setSongs] = useState<SongMetadata[]>([]);

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        const data = await window.api.getSongs();
        setSongs(data);
    };

    const deleteSong = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Delete this song?')) {
            await window.api.deleteSong(id);
            loadSongs();
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Songs</h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                        onClick={onSettings}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#e0e0e0',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            borderRadius: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#4a9eff';
                            e.currentTarget.style.background = 'rgba(74, 158, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#e0e0e0';
                            e.currentTarget.style.background = 'none';
                        }}
                        title="Settings"
                    >
                        ⚙️
                    </button>
                    <button onClick={onNew} style={{ backgroundColor: 'var(--accent)' }}>
                        + New Song
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {songs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No songs yet. Create one!</p>
                ) : (
                    songs.map((song) => (
                        <div
                            key={song.id}
                            onClick={() => onEdit(song.id)}
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'transform 0.1s',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <h3 style={{ margin: 0 }}>{song.title}</h3>
                            <button
                                onClick={(e) => deleteSong(e, song.id)}
                                style={{ backgroundColor: '#fa5252', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

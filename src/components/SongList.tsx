import React, { useEffect, useState } from 'react';
import { SongMetadata } from '../types';

interface SongListProps {
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onNew: () => void;
    onSettings: () => void;
}

export const SongList: React.FC<SongListProps> = ({ onView, onEdit, onNew, onSettings }) => {
    const [songs, setSongs] = useState<SongMetadata[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        const data = await window.api.getSongs();
        setSongs(data);
    };

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const deleteSong = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Delete this song?')) {
            await window.api.deleteSong(id);
            loadSongs();
        }
    };

    const handleEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onEdit(id);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ margin: 0 }}>My Songs</h1>
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

            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search by song title or artist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 158, 255, 0.2)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                />
                <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.2rem',
                    opacity: 0.5,
                    pointerEvents: 'none'
                }}>
                    🔍
                </span>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '0.8rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredSongs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎸</div>
                        <p>{searchQuery ? `No songs found matching "${searchQuery}"` : "No songs yet. Create one!"}</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{ background: 'none', color: 'var(--accent)', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.5rem' }}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    filteredSongs.map((song) => (
                        <div
                            key={song.id}
                            onClick={() => onView(song.id)}
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                padding: '1.25rem 1.5rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s ease',
                                border: '1px solid var(--border)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                                e.currentTarget.style.borderColor = 'var(--accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{song.title}</h3>
                                {song.artist && (
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                                        {song.artist}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={(e) => handleEdit(e, song.id)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: 'var(--accent)',
                                        border: '1px solid transparent',
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.85rem',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(74, 158, 255, 0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(74, 158, 255, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => deleteSong(e, song.id)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: '#ff6b6b',
                                        border: '1px solid transparent',
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.85rem',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

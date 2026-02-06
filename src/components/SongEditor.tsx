import React, { useEffect, useState } from 'react';
import { Song, Section, Block } from '../types';
import { BlockEditor } from './BlockEditor';

interface SongEditorProps {
    songId: string | null;
    onBack: (id: string) => void;
    onCancel: () => void;
}

const emptySong = (): Song => ({
    id: crypto.randomUUID(),
    title: '',
    artist: '',
    key: '',
    tempo: 120,
    capo: 0,
    tuning: 'Standard',
    favorite: false,
    sections: []
});

export const SongEditor: React.FC<SongEditorProps> = ({ songId, onBack, onCancel }) => {
    const [song, setSong] = useState<Song>(emptySong());
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [showExitModal, setShowExitModal] = useState(false);

    useEffect(() => {
        loadSettings();
        if (songId) {
            loadSong(songId);
        }
    }, [songId]);

    const loadSettings = async () => {
        const s = await window.api.getSettings();
        setSettings(s);
    };

    const loadSong = async (id: string) => {
        setLoading(true);
        try {
            const data = await window.api.getSong(id);
            if (data) {
                setSong(data);
                setIsDirty(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!song.title.trim()) {
            alert('Title is required');
            return;
        }
        await window.api.saveSong(song);
        setIsDirty(false);
        onBack(song.id);
    };

    const handleLeave = (action: () => void) => {
        if (isDirty && settings && !settings.disableSaveWarning) {
            setShowExitModal(true);
        } else {
            action();
        }
    };

    const updateSong = (updates: Partial<Song>) => {
        setSong(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
    };

    const addSection = () => {
        const newSection: Section = {
            id: crypto.randomUUID(),
            name: 'New Section',
            blocks: []
        };
        updateSong({ sections: [...song.sections, newSection] });
    };

    const removeSection = (sectionId: string) => {
        if (confirm('Remove this section?')) {
            updateSong({ sections: song.sections.filter(s => s.id !== sectionId) });
        }
    };

    const updateSection = (sectionId: string, updates: Partial<Section>) => {
        updateSong({
            sections: song.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
        });
    };

    const addBlock = (sectionId: string, type: Block['type'] = 'tab') => {
        const newBlock: Block = {
            id: crypto.randomUUID(),
            type,
            content: '',
            tabData: type === 'tab' ? [] : undefined,
            chordPositions: type === 'chords-lyrics' ? [] : undefined
        };
        const sectionIndex = song.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) return;

        const newSections = [...song.sections];
        newSections[sectionIndex].blocks.push(newBlock);
        updateSong({ sections: newSections });
    };

    const updateBlock = (sectionId: string, blockIndex: number, updatedBlock: Block) => {
        const newSections = [...song.sections];
        const sectionIndex = newSections.findIndex(s => s.id === sectionId);
        newSections[sectionIndex].blocks[blockIndex] = updatedBlock;
        updateSong({ sections: newSections });
    };

    const removeBlock = (sectionId: string, blockIndex: number) => {
        const newSections = [...song.sections];
        const sectionIndex = newSections.findIndex(s => s.id === sectionId);
        newSections[sectionIndex].blocks.splice(blockIndex, 1);
        updateSong({ sections: newSections });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
            {showExitModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '2.5rem',
                        borderRadius: '20px',
                        maxWidth: '450px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                        border: '1px solid var(--border)',
                    }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💾</div>
                        <h2 style={{ marginBottom: '1rem', marginTop: 0, fontSize: '1.75rem' }}>Unsaved Changes</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                            You have modified <strong>{song.title || 'this song'}</strong>. What would you like to do?
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={handleSave}
                                style={{
                                    backgroundColor: 'var(--accent)',
                                    color: 'white',
                                    padding: '1rem',
                                    fontSize: '1.05rem',
                                    fontWeight: '600',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Save & View Song
                            </button>
                            <button
                                onClick={onCancel}
                                style={{
                                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                    color: '#ff6b6b',
                                    border: '1px solid rgba(255, 107, 107, 0.2)',
                                    padding: '1rem',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
                                    e.currentTarget.style.borderColor = '#ff6b6b';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.2)';
                                }}
                            >
                                Discard & Back to Menu
                            </button>
                            <button
                                onClick={() => setShowExitModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    padding: '0.5rem',
                                    fontSize: '0.95rem',
                                    marginTop: '0.5rem',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    opacity: 0.7
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                            >
                                Keep Editing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => handleLeave(() => onBack(song.id))} style={{ background: 'none', border: '1px solid var(--border)' }}>&larr; Back</button>
                    <button onClick={() => handleLeave(onCancel)} style={{ background: 'none', border: 'none', color: '#888' }}>Cancel</button>
                </div>
                <button onClick={handleSave} style={{ backgroundColor: 'var(--accent)' }}>Save Song</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <label>Title</label>
                    <input
                        value={song.title}
                        onChange={e => updateSong({ title: e.target.value })}
                        style={{ width: '100%' }}
                        placeholder="Song Title"
                    />
                </div>
                <div>
                    <label>Artist</label>
                    <input
                        value={song.artist}
                        onChange={e => updateSong({ artist: e.target.value })}
                        style={{ width: '100%' }}
                        placeholder="Artist"
                    />
                </div>
                <div>
                    <label>Key</label>
                    <input
                        value={song.key}
                        onChange={e => updateSong({ key: e.target.value })}
                        style={{ width: '100%' }}
                        placeholder="e.g. C Major"
                    />
                </div>
                <div>
                    <label>Tempo (BPM)</label>
                    <input
                        type="number"
                        value={song.tempo}
                        onChange={e => updateSong({ tempo: parseInt(e.target.value) || 0 })}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '2rem' }}>Sections</h2>

            {song.sections.map((section) => (
                <div key={section.id} style={{
                    marginBottom: '2rem',
                    border: '1px solid var(--border)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                        <input
                            value={section.name}
                            onChange={(e) => updateSection(section.id, { name: e.target.value })}
                            style={{ fontSize: '1.2rem', fontWeight: 'bold', background: 'transparent', border: 'none', borderBottom: '1px solid var(--text-secondary)' }}
                        />
                        <button onClick={() => removeSection(section.id)} style={{ background: '#fa5252', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Delete Section</button>
                    </div>

                    <div>
                        {section.blocks.map((block, idx) => (
                            <BlockEditor
                                key={block.id}
                                block={block}
                                onChange={(b) => updateBlock(section.id, idx, b)}
                                onDelete={() => removeBlock(section.id, idx)}
                            />
                        ))}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => addBlock(section.id, 'tab')} style={{ flex: 1, border: '1px dashed var(--text-secondary)', background: 'transparent' }}>+ Add Tab</button>
                            <button onClick={() => addBlock(section.id, 'chords-lyrics')} style={{ flex: 1, border: '1px dashed var(--text-secondary)', background: 'transparent' }}>+ Add Chords & Lyrics</button>
                        </div>
                    </div>
                </div>
            ))}

            <button onClick={addSection} style={{ width: '100%', padding: '1rem', marginTop: '1rem', backgroundColor: 'var(--bg-tertiary)' }}>
                + Add Section
            </button>
        </div>
    );
};

import React, { useState, useRef } from 'react';
import { Block, ChordPosition } from '../types';

interface ChordsLyricsEditorProps {
    block: Block;
    onChange: (updatedBlock: Block) => void;
    onDelete: () => void;
}

/**
 * Interactive editor for associating chords with lyrics.
 * Users can type lyrics and click specific character positions to add chords.
 * Displays a side-by-side view with a live preview.
 */
export function ChordsLyricsEditor({ block, onChange, onDelete }: ChordsLyricsEditorProps) {
    const [newChord, setNewChord] = useState('');
    const [selectedPosition, setSelectedPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const chordPositions = block.chordPositions || [];
    const lyrics = block.content || '';

    const handleLyricsChange = (newLyrics: string) => {
        onChange({ ...block, content: newLyrics });
    };

    const handleTextareaClickOrSelect = () => {
        if (textareaRef.current) {
            setSelectedPosition(textareaRef.current.selectionStart);
        }
    };

    const addChord = () => {
        if (!newChord.trim()) return;

        const newChordPosition: ChordPosition = {
            chord: newChord.trim(),
            position: selectedPosition
        };

        const updatedPositions = [...chordPositions, newChordPosition].sort((a, b) => a.position - b.position);
        onChange({ ...block, chordPositions: updatedPositions });
        setNewChord('');
    };

    const deleteChord = (index: number) => {
        const updatedPositions = chordPositions.filter((_, i) => i !== index);
        onChange({ ...block, chordPositions: updatedPositions });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addChord();
        }
    };

    // Render lyrics with chords positioned above
    const renderLyricsWithChords = () => {
        if (!lyrics) return null;

        const lines = lyrics.split('\n');
        let currentPos = 0;

        return lines.map((line, lineIndex) => {
            const lineStart = currentPos;
            const lineEnd = lineStart + line.length;
            currentPos += line.length + 1; // +1 for newline

            // Find chords for this line
            const lineChordsPositions = chordPositions.filter(
                cp => cp.position >= lineStart && cp.position <= lineEnd
            );

            if (lineChordsPositions.length === 0) {
                return (
                    <div key={lineIndex} style={{ minHeight: '2.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ height: '1.2rem' }}></div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{line || ' '}</div>
                    </div>
                );
            }

            // Build chord line - more sophisticated overlapping handling
            let chordRow = Array(line.length + 20).fill(' '); // Buffer for chords longer than line
            let maxChordIdx = 0;

            lineChordsPositions.forEach(cp => {
                const relPos = Math.max(0, cp.position - lineStart);
                for (let i = 0; i < cp.chord.length; i++) {
                    chordRow[relPos + i] = cp.chord[i];
                    maxChordIdx = Math.max(maxChordIdx, relPos + i);
                }
            });

            const chordLineStr = chordRow.slice(0, Math.max(line.length, maxChordIdx + 1)).join('');

            return (
                <div key={lineIndex} style={{ minHeight: '2.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.2rem' }}>
                    <div style={{ color: '#4a9eff', fontWeight: 'bold', whiteSpace: 'pre', overflow: 'visible' }}>
                        {chordLineStr}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{line || ' '}</div>
                </div>
            );
        });
    };

    return (
        <div style={{
            marginBottom: '1rem',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
            position: 'relative',
            border: '1px solid var(--border)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#4a9eff',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                    }}>
                        CHORDS & LYRICS
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                        Tip: Click in lyrics to set chord position
                    </span>
                </div>
                <button
                    onClick={onDelete}
                    style={{ padding: '0.25rem 0.75rem', background: '#fa5252', fontSize: '0.8rem', borderRadius: '4px' }}
                >
                    Delete Block
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Left side: Editor */}
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#b0b0b0' }}>
                            Lyrics
                        </h4>
                        <textarea
                            ref={textareaRef}
                            value={lyrics}
                            onChange={(e) => handleLyricsChange(e.target.value)}
                            onKeyUp={handleTextareaClickOrSelect}
                            onClick={handleTextareaClickOrSelect}
                            placeholder="Enter lyrics here..."
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                padding: '0.75rem',
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                fontFamily: 'monospace',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#b0b0b0' }}>
                            Add Chord at Position {selectedPosition}
                        </h4>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    value={newChord}
                                    onChange={(e) => setNewChord(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Chord (e.g., Am)"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        backgroundColor: 'var(--bg-primary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <button
                                onClick={addChord}
                                disabled={!newChord.trim()}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    background: newChord.trim() ? '#4a9eff' : 'rgba(255, 255, 255, 0.1)',
                                    color: newChord.trim() ? 'white' : '#666',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: newChord.trim() ? 'pointer' : 'not-allowed',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {chordPositions.length > 0 && (
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#b0b0b0' }}>
                                Chords
                            </h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxHeight: '100px', overflowY: 'auto' }}>
                                {chordPositions.map((cp, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '0.2rem 0.5rem',
                                            background: 'rgba(74, 158, 255, 0.1)',
                                            border: '1px solid rgba(74, 158, 255, 0.2)',
                                            borderRadius: '3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        <span style={{ fontWeight: 'bold', color: '#4a9eff' }}>{cp.chord}</span>
                                        <span style={{ color: '#666' }}>@{cp.position}</span>
                                        <button
                                            onClick={() => deleteChord(index)}
                                            style={{ background: 'transparent', border: 'none', color: '#fa5252', cursor: 'pointer', padding: '0', fontSize: '0.8rem' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side: Preview */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#b0b0b0' }}>
                        Preview
                    </h4>
                    <div style={{
                        flex: 1,
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        lineHeight: '1.2',
                        color: '#e0e0e0',
                        overflowX: 'auto',
                        minHeight: '200px'
                    }}>
                        {lyrics ? renderLyricsWithChords() : (
                            <div style={{ color: '#666', fontStyle: 'italic' }}>
                                Enter lyrics and add chords to see preview
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

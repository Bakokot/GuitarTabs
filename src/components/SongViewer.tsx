import React, { useEffect, useState } from 'react';
import { Song, Block } from '../types';

interface SongViewerProps {
    songId: string;
    onBack: () => void;
    onEdit: (id: string) => void;
}

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

export const SongViewer: React.FC<SongViewerProps> = ({ songId, onBack, onEdit }) => {
    const [song, setSong] = useState<Song | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSong();
    }, [songId]);

    const loadSong = async () => {
        setLoading(true);
        try {
            const data = await window.api.getSong(songId);
            setSong(data);
        } finally {
            setLoading(false);
        }
    };

    const renderChordsLyrics = (block: Block) => {
        const lyrics = block.content || '';
        const chordPositions = block.chordPositions || [];

        if (!lyrics) return null;

        const lines = lyrics.split('\n');
        let currentPos = 0;

        return lines.map((line, lineIndex) => {
            const lineStart = currentPos;
            const lineEnd = lineStart + line.length;
            currentPos += line.length + 1;

            const lineChords = chordPositions.filter(
                cp => cp.position >= lineStart && cp.position <= lineEnd
            );

            if (lineChords.length === 0) {
                return (
                    <div key={lineIndex} style={{ minHeight: '1.2rem', marginBottom: '0.4rem' }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{line || ' '}</div>
                    </div>
                );
            }

            let chordRow = Array(line.length + 20).fill(' ');
            let maxChordIdx = 0;

            lineChords.forEach(cp => {
                const relPos = Math.max(0, cp.position - lineStart);
                for (let i = 0; i < cp.chord.length; i++) {
                    chordRow[relPos + i] = cp.chord[i];
                    maxChordIdx = Math.max(maxChordIdx, relPos + i);
                }
            });

            const chordLineStr = chordRow.slice(0, Math.max(line.length, maxChordIdx + 1)).join('');

            return (
                <div key={lineIndex} style={{ marginBottom: '0.6rem' }}>
                    <div style={{ color: 'var(--accent)', fontWeight: 'bold', whiteSpace: 'pre', fontSize: '1rem', lineHeight: '1' }}>
                        {chordLineStr}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem' }}>{line || ' '}</div>
                </div>
            );
        });
    };

    const renderTab = (block: Block) => {
        const tabData = block.tabData || [];
        if (tabData.length === 0) return null;

        const columnWidths: number[] = tabData.map(note => {
            let maxWidth = 1;
            Object.values(note.strings).forEach(fret => {
                maxWidth = Math.max(maxWidth, fret.length);
            });
            return maxWidth;
        });

        const lines: string[] = STRING_NAMES.map(name => `${name}|--`);

        tabData.forEach((note, noteIndex) => {
            const columnWidth = columnWidths[noteIndex];
            const totalWidth = 1 + columnWidth;

            STRING_NAMES.forEach((_, stringIndex) => {
                const stringNum = stringIndex + 1;
                const fret = note.strings[stringNum];

                if (fret !== undefined) {
                    const padding = totalWidth - fret.length;
                    const leftPad = Math.floor(padding / 2);
                    const rightPad = padding - leftPad;
                    lines[stringIndex] += '-'.repeat(leftPad) + fret + '-'.repeat(rightPad);
                } else {
                    lines[stringIndex] += '-'.repeat(totalWidth);
                }
            });

            if (noteIndex < tabData.length - 1) {
                STRING_NAMES.forEach((_, stringIndex) => {
                    lines[stringIndex] += '-';
                });
            }
        });

        lines.forEach((_, index) => {
            lines[index] += '--|';
        });

        return (
            <pre style={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                margin: 0,
                color: '#e0e0e0',
                lineHeight: '1.4',
                overflowX: 'auto',
                padding: '1rem',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px'
            }}>
                {lines.join('\n')}
            </pre>
        );
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    if (!song) return <div style={{ padding: '2rem', textAlign: 'center' }}>Song not found</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <button onClick={onBack} style={{ marginBottom: '1rem', background: 'none', border: '1px solid var(--border)', padding: '0.4rem 0.8rem' }}>
                        &larr; Back to List
                    </button>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem' }}>{song.title}</h1>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {song.artist}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {song.key && <div>Key: <strong>{song.key}</strong></div>}
                        {song.tempo > 0 && <div>Tempo: <strong>{song.tempo} BPM</strong></div>}
                        {song.capo > 0 && <div>Capo: <strong>{song.capo}</strong></div>}
                    </div>
                    <button
                        onClick={() => onEdit(song.id)}
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    >
                        Edit Song
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '3rem' }}>
                {song.sections.map((section) => (
                    <div key={section.id}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            color: 'var(--accent)',
                            borderBottom: '2px solid var(--bg-secondary)',
                            paddingBottom: '0.5rem',
                            marginBottom: '1.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {section.name}
                        </h2>
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {section.blocks.map((block) => (
                                <div key={block.id}>
                                    {block.type === 'lyrics' && (
                                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                            {block.content}
                                        </div>
                                    )}
                                    {block.type === 'chords' && (
                                        <div style={{
                                            fontFamily: 'monospace',
                                            fontSize: '1.2rem',
                                            color: 'var(--accent)',
                                            fontWeight: 'bold',
                                            whiteSpace: 'pre-wrap',
                                            backgroundColor: 'rgba(74, 158, 255, 0.05)',
                                            padding: '1rem',
                                            borderRadius: '4px'
                                        }}>
                                            {block.content}
                                        </div>
                                    )}
                                    {block.type === 'chords-lyrics' && (
                                        <div style={{ fontFamily: 'monospace' }}>
                                            {renderChordsLyrics(block)}
                                        </div>
                                    )}
                                    {block.type === 'tab' && renderTab(block)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

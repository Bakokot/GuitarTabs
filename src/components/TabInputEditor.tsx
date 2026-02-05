import { useState } from 'react';
import { Block } from '../types';

interface TabInputEditorProps {
    block: Block;
    onChange: (updatedBlock: Block) => void;
    onDelete: () => void;
}

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

/**
 * Interactive editor for guitar tablature.
 * Allows users to input fret numbers per string and generates an aligned ASCII preview.
 */
export function TabInputEditor({ block, onChange, onDelete }: TabInputEditorProps) {
    const [currentNote, setCurrentNote] = useState<{ [key: number]: string }>({});

    const tabData = block.tabData || [];

    const handleStringInput = (stringNum: number, value: string) => {
        // Only allow numbers 0-24 or empty
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 24)) {
            setCurrentNote(prev => {
                const updated = { ...prev };
                if (value === '') {
                    delete updated[stringNum];
                } else {
                    updated[stringNum] = value;
                }
                return updated;
            });
        }
    };

    const addNote = () => {
        if (Object.keys(currentNote).length === 0) return;

        const newTabData = [...tabData, { strings: { ...currentNote } }];
        onChange({ ...block, tabData: newTabData });
        setCurrentNote({});
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addNote();
        }
    };

    const deleteNote = (index: number) => {
        const newTabData = tabData.filter((_, i) => i !== index);
        onChange({ ...block, tabData: newTabData });
    };

    const clearAll = () => {
        if (confirm('Clear all notes?')) {
            onChange({ ...block, tabData: [] });
        }
    };

    /**
     * Generates a string array representing the ASCII tab.
     * Handles dynamic column widths for proper alignment of multi-digit fret numbers.
     */
    const generateAsciiTab = (): string[] => {
        if (tabData.length === 0) {
            return STRING_NAMES.map(name => `${name}|---|`);
        }

        // Calculate max width for each note column (minimum 1 for single digits)
        const columnWidths: number[] = tabData.map(note => {
            let maxWidth = 1;
            Object.values(note.strings).forEach(fret => {
                maxWidth = Math.max(maxWidth, fret.length);
            });
            return maxWidth;
        });

        // Initialize lines with string names and starting dashes
        const lines: string[] = STRING_NAMES.map(name => `${name}|--`);

        // Build each note column
        tabData.forEach((note, noteIndex) => {
            const columnWidth = columnWidths[noteIndex];
            // Total width for this column: 1 dashes + fret number(s)
            const totalWidth = 1 + columnWidth;

            STRING_NAMES.forEach((_, stringIndex) => {
                const stringNum = stringIndex + 1;
                const fret = note.strings[stringNum];

                if (fret !== undefined) {
                    // Center the fret number with dashes
                    const padding = totalWidth - fret.length;
                    const leftPad = Math.floor(padding / 2);
                    const rightPad = padding - leftPad;
                    lines[stringIndex] += '-'.repeat(leftPad) + fret + '-'.repeat(rightPad);
                } else {
                    // Empty string: all dashes
                    lines[stringIndex] += '-'.repeat(totalWidth);
                }
            });

            // Add separator between notes (single dash)
            if (noteIndex < tabData.length - 1) {
                STRING_NAMES.forEach((_, stringIndex) => {
                    lines[stringIndex] += '-';
                });
            }
        });

        // Close the tab with dashes and pipe
        lines.forEach((_, index) => {
            lines[index] += '--|';
        });

        return lines;
    };

    const asciiTab = generateAsciiTab();

    return (
        <div style={{
            marginBottom: '1rem',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#4a9eff',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                    }}>
                        TABLATURE
                    </span>
                    {tabData.length > 0 && (
                        <button
                            onClick={clearAll}
                            style={{
                                padding: '0.25rem 0.75rem',
                                background: '#fa5252',
                                fontSize: '0.8rem',
                                borderRadius: '4px'
                            }}
                        >
                            Clear All
                        </button>
                    )}
                </div>
                <button
                    onClick={onDelete}
                    style={{ padding: '0.25rem 0.75rem', background: '#fa5252', fontSize: '0.8rem' }}
                >
                    Delete Block
                </button>
            </div>

            {/* String Input Section */}
            <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
            }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#b0b0b0' }}>
                    Enter Fret Numbers (0-24)
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {STRING_NAMES.map((stringName, index) => {
                        const stringNum = index + 1;
                        return (
                            <div key={stringNum} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{
                                    width: '20px',
                                    fontFamily: 'monospace',
                                    fontWeight: 'bold',
                                    color: '#4a9eff'
                                }}>
                                    {stringName}
                                </span>
                                <div style={{
                                    flex: 1,
                                    height: '2px',
                                    background: 'rgba(255, 255, 255, 0.2)'
                                }} />
                                <input
                                    type="text"
                                    value={currentNote[stringNum] || ''}
                                    onChange={(e) => handleStringInput(stringNum, e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="-"
                                    style={{
                                        width: '60px',
                                        padding: '0.4rem',
                                        textAlign: 'center',
                                        fontFamily: 'monospace',
                                        fontSize: '1rem',
                                        background: 'var(--bg-primary)',
                                        border: currentNote[stringNum] ? '2px solid #4a9eff' : '1px solid var(--border)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
                <button
                    onClick={addNote}
                    disabled={Object.keys(currentNote).length === 0}
                    style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '0.75rem',
                        background: Object.keys(currentNote).length > 0 ? '#4a9eff' : 'rgba(255, 255, 255, 0.1)',
                        color: Object.keys(currentNote).length > 0 ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: Object.keys(currentNote).length > 0 ? 'pointer' : 'not-allowed',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    + Add Note {Object.keys(currentNote).length > 0 && `(${Object.keys(currentNote).length} string${Object.keys(currentNote).length > 1 ? 's' : ''})`}
                </button>
            </div>

            {/* ASCII Tab Display */}
            <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#b0b0b0' }}>Tab Preview</h4>
                    {tabData.length > 0 && (
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                            {tabData.length} note{tabData.length > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <pre style={{
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    margin: 0,
                    color: '#e0e0e0',
                    lineHeight: '1.6',
                    overflowX: 'auto'
                }}>
                    {asciiTab.join('\n')}
                </pre>
            </div>

            {/* Note List */}
            {tabData.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#b0b0b0' }}>Notes</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {tabData.map((note, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '0.4rem 0.75rem',
                                    background: 'rgba(74, 158, 255, 0.2)',
                                    border: '1px solid rgba(74, 158, 255, 0.4)',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <span style={{ fontFamily: 'monospace' }}>
                                    {Object.entries(note.strings)
                                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                        .map(([str, fret]) => `${STRING_NAMES[parseInt(str) - 1]}:${fret}`)
                                        .join(' ')}
                                </span>
                                <button
                                    onClick={() => deleteNote(index)}
                                    style={{
                                        background: 'rgba(250, 82, 82, 0.3)',
                                        border: 'none',
                                        color: '#fa5252',
                                        cursor: 'pointer',
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: '3px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

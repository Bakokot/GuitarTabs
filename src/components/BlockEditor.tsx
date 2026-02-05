import React, { useRef, useEffect } from 'react';
import { Block } from '../types';
import { TabInputEditor } from './TabInputEditor';
import { ChordsLyricsEditor } from './ChordsLyricsEditor';

interface BlockEditorProps {
    block: Block;
    onChange: (updatedBlock: Block) => void;
    onDelete: () => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onChange, onDelete }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [block.content]);

    // Use TabInputEditor for tab blocks
    if (block.type === 'tab') {
        return <TabInputEditor block={block} onChange={onChange} onDelete={onDelete} />;
    }

    // Use ChordsLyricsEditor for chords-lyrics blocks
    if (block.type === 'chords-lyrics') {
        return <ChordsLyricsEditor block={block} onChange={onChange} onDelete={onDelete} />;
    }

    // Use textarea for chords and lyrics
    return (
        <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '4px',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <select
                    value={block.type}
                    onChange={(e) => onChange({ ...block, type: e.target.value as any })}
                    style={{ width: '150px' }}
                >
                    <option value="tab">Tablature</option>
                    <option value="chords">Chords (Simple)</option>
                    <option value="lyrics">Lyrics</option>
                    <option value="chords-lyrics">Chords & Lyrics</option>
                </select>
                <button
                    onClick={onDelete}
                    style={{ padding: '0.2rem 0.5rem', background: '#fa5252', fontSize: '0.8rem' }}
                >
                    X
                </button>
            </div>

            <textarea
                ref={textareaRef}
                value={block.content}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                className={block.type !== 'lyrics' ? 'monospace' : ''}
                placeholder={block.type === 'chords' ? 'Am  G  C' : 'Lyrics...'}
                style={{
                    width: '100%',
                    minHeight: '60px',
                    resize: 'none',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    lineHeight: '1.5'
                }}
            />
        </div>
    );
};

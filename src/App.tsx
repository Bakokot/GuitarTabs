import { useState } from 'react';
import { SongList } from './components/SongList';
import { SongEditor } from './components/SongEditor';
import { Settings } from './components/Settings';

type View = 'list' | 'editor' | 'settings';

function App() {
    const [view, setView] = useState<View>('list');
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleEdit = (id: string) => {
        setEditingId(id);
        setView('editor');
    };

    const handleNew = () => {
        setEditingId(null);
        setView('editor');
    };

    const handleBack = () => {
        setView('list');
        setEditingId(null);
    };

    const handleSettings = () => {
        setView('settings');
    };

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '32px',
                background: 'rgba(0,0,0,0.2)',
                zIndex: 1000,
                appRegion: 'drag'
            } as any} />

            <div style={{ marginTop: '32px' }}>
                {view === 'list' ? (
                    <SongList onEdit={handleEdit} onNew={handleNew} onSettings={handleSettings} />
                ) : view === 'editor' ? (
                    <SongEditor songId={editingId} onBack={handleBack} />
                ) : (
                    <Settings onBack={handleBack} />
                )}
            </div>
        </>
    );
}

export default App;

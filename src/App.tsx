import { useState } from 'react';
import { SongList } from './components/SongList';
import { SongEditor } from './components/SongEditor';
import { SongViewer } from './components/SongViewer';
import { Settings } from './components/Settings';

type View = 'list' | 'editor' | 'viewer' | 'settings';

function App() {
    const [view, setView] = useState<View>('list');
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleView = (id: string) => {
        setActiveId(id);
        setView('viewer');
    };

    const handleEdit = (id: string | null) => {
        setActiveId(id);
        setView('editor');
    };

    const handleNew = () => {
        setActiveId(null);
        setView('editor');
    };

    const handleBack = () => {
        setView('list');
        setActiveId(null);
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
                    <SongList onView={handleView} onEdit={handleEdit} onNew={handleNew} onSettings={handleSettings} />
                ) : view === 'editor' ? (
                    <SongEditor songId={activeId} onBack={(id) => handleView(id)} onCancel={handleBack} />
                ) : view === 'viewer' ? (
                    <SongViewer songId={activeId!} onBack={handleBack} onEdit={handleEdit} />
                ) : (
                    <Settings onBack={handleBack} />
                )}
            </div>
        </>
    );
}

export default App;

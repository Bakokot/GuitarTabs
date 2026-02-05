import { useState, useEffect } from 'react';
import { AppSettings } from '../types';

interface SettingsProps {
    onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [defaultPath, setDefaultPath] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const [loadedSettings, defPath] = await Promise.all([
                window.api.getSettings(),
                window.api.getDefaultStoragePath()
            ]);
            setSettings(loadedSettings);
            setDefaultPath(defPath);
            setCurrentPath(loadedSettings.storagePath || 'Default location');
        } catch (error) {
            console.error('Error loading settings:', error);
            setMessage({ text: 'Failed to load settings', type: 'error' });
        }
    };

    const handleChangePath = async () => {
        try {
            const newPath = await window.api.selectStoragePath();
            if (!newPath) return; // User cancelled

            setIsLoading(true);
            setMessage(null);

            // Get old path for migration
            const oldPath = settings?.storagePath || defaultPath;

            // Update settings
            const newSettings: AppSettings = { storagePath: newPath };
            await window.api.updateSettings(newSettings);

            // Migrate data
            try {
                await window.api.migrateData(oldPath, newPath);
                setMessage({ text: 'Storage path updated and data migrated successfully!', type: 'success' });
            } catch (error) {
                console.error('Migration error:', error);
                setMessage({ text: 'Path updated, but data migration failed. Please check permissions.', type: 'error' });
            }

            // Reload settings
            await loadSettings();
        } catch (error) {
            console.error('Error changing path:', error);
            setMessage({ text: 'Failed to change storage path', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetToDefault = async () => {
        try {
            setIsLoading(true);
            setMessage(null);

            const oldPath = settings?.storagePath;

            // Update settings to default
            const newSettings: AppSettings = { storagePath: null };
            await window.api.updateSettings(newSettings);

            // Migrate data if there was a custom path
            if (oldPath) {
                try {
                    await window.api.migrateData(oldPath, defaultPath);
                    setMessage({ text: 'Reset to default location and migrated data successfully!', type: 'success' });
                } catch (error) {
                    console.error('Migration error:', error);
                    setMessage({ text: 'Reset to default, but data migration failed.', type: 'error' });
                }
            } else {
                setMessage({ text: 'Already using default location', type: 'success' });
            }

            // Reload settings
            await loadSettings();
        } catch (error) {
            console.error('Error resetting path:', error);
            setMessage({ text: 'Failed to reset to default', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!settings) {
        return <div style={{ padding: '2rem', color: '#e0e0e0' }}>Loading settings...</div>;
    }

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            color: '#e0e0e0'
        }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#4a9eff',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        padding: '0.5rem'
                    }}
                >
                    ← Back
                </button>
                <h1 style={{ margin: 0, fontSize: '2rem' }}>Settings</h1>
            </div>

            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '8px',
                    background: message.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                    border: `1px solid ${message.type === 'success' ? '#4caf50' : '#f44336'}`,
                    color: message.type === 'success' ? '#81c784' : '#ef5350'
                }}>
                    {message.text}
                </div>
            )}

            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                <h2 style={{ marginTop: 0, fontSize: '1.25rem', marginBottom: '1rem' }}>Storage Location</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b0b0b0', fontSize: '0.9rem' }}>
                        Current Path:
                    </label>
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        wordBreak: 'break-all'
                    }}>
                        {currentPath}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleChangePath}
                        disabled={isLoading}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#4a9eff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500',
                            opacity: isLoading ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {isLoading ? 'Processing...' : 'Change Path'}
                    </button>

                    <button
                        onClick={handleResetToDefault}
                        disabled={isLoading || !settings.storagePath}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#e0e0e0',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            cursor: (isLoading || !settings.storagePath) ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500',
                            opacity: (isLoading || !settings.storagePath) ? 0.4 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        Reset to Default
                    </button>
                </div>

                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#ffc107'
                }}>
                    <strong>Note:</strong> Changing the storage path will move all existing songs to the new location.
                </div>
            </div>
        </div>
    );
}

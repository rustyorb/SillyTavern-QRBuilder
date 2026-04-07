import { useState, useEffect } from 'react';
import { fetchModels } from '../lib/ai.js';

export default function SettingsModal({ apiKey, model, onSave, onClose }) {
    const [localKey, setLocalKey]     = useState(apiKey || '');
    const [localModel, setLocalModel] = useState(model || '');
    const [models, setModels]         = useState([]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [search, setSearch]         = useState('');

    const fetchModelList = async () => {
        if (!localKey) { setError('Enter API key first.'); return; }
        setLoading(true);
        setError('');
        try {
            const list = await fetchModels(localKey);
            setModels(list);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch if key exists and no models loaded
    useEffect(() => {
        if (localKey && models.length === 0) fetchModelList();
    }, []);

    const filtered = models.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="qrb-modal-backdrop" onClick={onClose}>
            <div className="qrb-modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 className="qrb-modal-title">⚙ Settings</h3>
                    <button className="qrb-btn close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="qrb-modal-field">
                    <label>OpenRouter API Key</label>
                    <input
                        type="password"
                        value={localKey}
                        onChange={e => setLocalKey(e.target.value)}
                        placeholder="sk-or-..."
                        spellCheck={false}
                    />
                    <span className="qrb-modal-hint">
                        Get your key at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: '#a5b4fc' }}>openrouter.ai/keys</a>
                    </span>
                </div>

                <div className="qrb-modal-field">
                    <label>Model</label>
                    {localModel && (
                        <div style={{ padding: '6px 10px', background: 'rgba(99,102,241,0.1)', borderRadius: 6, fontSize: 12, color: '#a5b4fc', marginBottom: 8 }}>
                            Selected: {localModel}
                        </div>
                    )}
                    <button
                        className="qrb-btn"
                        onClick={fetchModelList}
                        disabled={loading || !localKey}
                        style={{ marginBottom: 8, width: '100%' }}
                    >
                        {loading ? 'Fetching…' : models.length > 0 ? '↻ Refresh Models' : 'Fetch Models'}
                    </button>
                    {error && <div style={{ color: '#fca5a5', fontSize: 12, marginBottom: 8 }}>⚠ {error}</div>}
                    {models.length > 0 && (
                        <>
                            <input
                                className="qrb-model-search"
                                type="text"
                                placeholder="Search models…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <div className="qrb-model-list">
                                {filtered.slice(0, 50).map(m => (
                                    <button
                                        key={m.id}
                                        className={`qrb-model-item${localModel === m.id ? ' selected' : ''}`}
                                        onClick={() => setLocalModel(m.id)}
                                    >
                                        {m.name}
                                        <span style={{ color: '#555', fontSize: 10, marginLeft: 6 }}> — {m.id}</span>
                                    </button>
                                ))}
                                {filtered.length === 0 && <div style={{ color: '#555', fontSize: 12, padding: 8 }}>No models match</div>}
                            </div>
                        </>
                    )}
                </div>

                <div className="qrb-modal-actions">
                    <button className="qrb-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="qrb-btn primary"
                        onClick={() => onSave(localKey, localModel)}
                        disabled={!localKey}
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

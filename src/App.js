import { useState, useCallback } from 'react';
import { TEMPLATES } from './data/templates.js';
import { uid, buildScript } from './lib/parser.js';
import CommandPalette from './components/CommandPalette.js';
import Builder from './components/Builder.js';
import AIChat from './components/AIChat.js';
import OutputPanel from './components/OutputPanel.js';

export default function App({ generateQuietPrompt, onClose }) {
    const [blocks, setBlocks]             = useState([]);
    const [label, setLabel]               = useState('');
    const [rawScript, setRawScript]       = useState('');
    const [activeTab, setActiveTab]       = useState('ai');
    const [activeCategory, setActiveCategory] = useState('Generation');
    const [showTemplates, setShowTemplates]   = useState(false);

    const displayScript = rawScript || (blocks.length > 0 ? buildScript(blocks) : '');

    const addBlock = useCallback((cmd, category) => {
        setBlocks(prev => [...prev, { ...cmd, id: uid(), values: {}, category }]);
        setRawScript('');
        if (activeTab === 'ai') setActiveTab('builder');
    }, [activeTab]);

    const updateBlock = useCallback((index, block) => {
        setBlocks(prev => { const n = [...prev]; n[index] = block; return n; });
        setRawScript('');
    }, []);

    const removeBlock = useCallback((index) => {
        setBlocks(prev => prev.filter((_, i) => i !== index));
        setRawScript('');
    }, []);

    const moveBlock = useCallback((index, dir) => {
        setBlocks(prev => {
            const n = [...prev];
            const t = index + dir;
            if (t < 0 || t >= n.length) return n;
            [n[index], n[t]] = [n[t], n[index]];
            return n;
        });
        setRawScript('');
    }, []);

    const handleApplyScript = useCallback((parsedBlocks, rawText) => {
        if (parsedBlocks.length > 0) { setBlocks(parsedBlocks); setRawScript(''); }
        else setRawScript(rawText);
        setActiveTab('builder');
    }, []);

    const handleApplyLabel = useCallback(lbl => setLabel(lbl), []);

    const loadTemplate = useCallback(t => {
        setBlocks(t.blocks.map(b => ({ ...b, id: uid() })));
        setRawScript('');
        setShowTemplates(false);
        setActiveTab('builder');
    }, []);

    const clearAll = useCallback(() => {
        setBlocks([]); setLabel(''); setRawScript('');
    }, []);

    return (
        <div className="qrb-app">
            <header className="qrb-header">
                <div className="qrb-logo">QRB</div>
                <div>
                    <div className="qrb-title">STscript QR Builder</div>
                    <div className="qrb-subtitle">Using your connected model · No extra config needed</div>
                </div>
                <div className="qrb-header-actions">
                    <button className="qrb-btn" onClick={() => setShowTemplates(t => !t)}>
                        📋 Templates
                    </button>
                    <button className="qrb-btn danger" onClick={clearAll}
                        disabled={!blocks.length && !rawScript && !label}>
                        ✕ Clear
                    </button>
                    <button className="qrb-btn close-btn" onClick={onClose} title="Close QR Builder">✕</button>
                </div>
            </header>

            {showTemplates && (
                <div className="qrb-templates-bar">
                    {TEMPLATES.map(t => (
                        <button key={t.name} className="qrb-template-btn" onClick={() => loadTemplate(t)}>
                            <span className="qrb-template-icon">{t.icon}</span>
                            <div>
                                <div className="qrb-template-name">{t.name}</div>
                                <div className="qrb-template-desc">{t.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <main className="qrb-main">
                <aside className="qrb-panel-left">
                    <CommandPalette
                        onAddBlock={addBlock}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                </aside>

                <section className="qrb-panel-center">
                    <div className="qrb-tabs">
                        <button
                            className={`qrb-tab${activeTab === 'ai' ? ' active' : ''}`}
                            onClick={() => setActiveTab('ai')}
                        >⚡ AI</button>
                        <button
                            className={`qrb-tab${activeTab === 'builder' ? ' active' : ''}`}
                            onClick={() => setActiveTab('builder')}
                        >
                            🔧 Builder
                            {blocks.length > 0 && <span className="qrb-tab-badge">{blocks.length}</span>}
                        </button>
                    </div>
                    {activeTab === 'ai' ? (
                        <AIChat
                            generateQuietPrompt={generateQuietPrompt}
                            onApplyScript={handleApplyScript}
                            onApplyLabel={handleApplyLabel}
                        />
                    ) : (
                        <Builder
                            blocks={blocks}
                            onUpdateBlock={updateBlock}
                            onRemoveBlock={removeBlock}
                            onMoveBlock={moveBlock}
                        />
                    )}
                </section>

                <aside className="qrb-panel-right">
                    <OutputPanel
                        blocks={blocks}
                        label={label}
                        setLabel={setLabel}
                        script={displayScript}
                    />
                </aside>
            </main>
        </div>
    );
}

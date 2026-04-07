import { buildScript } from '../lib/parser.js';
import { useState } from 'react';

const TRIGGER_MAP = {
    '':                          { label: 'None (manual click)', prop: null },
    'executeOnStartup':          { label: 'On Chat Load', prop: 'executeOnStartup' },
    'executeOnUser':             { label: 'After User Message', prop: 'executeOnUser' },
    'executeOnAi':               { label: 'After AI Message', prop: 'executeOnAi' },
    'executeOnChatChange':       { label: 'On Chat Change', prop: 'executeOnChatChange' },
    'executeBeforeGeneration':   { label: 'Before Generation', prop: 'executeBeforeGeneration' },
    'executeOnNewChat':          { label: 'On New Chat', prop: 'executeOnNewChat' },
};

export default function OutputPanel({ blocks, label, setLabel, script }) {
    const [trigger, setTrigger]     = useState('');
    const [targetSet, setTargetSet] = useState('');
    const [copied, setCopied]       = useState(false);
    const [saved, setSaved]         = useState(false);
    const [saveError, setSaveError] = useState('');

    const displayScript = script || (blocks.length > 0 ? buildScript(blocks) : '');
    const charCount = displayScript.length;
    const pipeCount = (displayScript.match(/\|/g) || []).length;

    // Get available QR sets from the ST QR extension (exposed as global)
    const getQRSets = () => {
        try {
            // quickReplyApi is exposed as a global by the QR extension
            if (window.quickReplyApi) {
                return window.quickReplyApi.listSets?.() ?? [];
            }
            // Fallback: QuickReplySet.list if accessible
            return [];
        } catch { return []; }
    };

    const qrSets = getQRSets();

    const handleCopy = () => {
        if (!displayScript) return;
        navigator.clipboard.writeText(displayScript).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    const handleSaveToQR = () => {
        setSaveError('');
        if (!displayScript) { setSaveError('No script to save.'); return; }
        if (!label.trim()) { setSaveError('Enter a label first.'); return; }

        try {
            const api = window.quickReplyApi;
            if (!api) {
                setSaveError('Quick Reply extension not loaded. Enable it in Extensions first.');
                return;
            }

            // Get or use specifically selected set
            let qrSet;
            if (targetSet) {
                qrSet = api.getSetByName?.(targetSet);
            } else {
                // Use first available set, or error
                const sets = api.listSets?.() ?? [];
                if (sets.length === 0) {
                    setSaveError('No QR sets found. Create one in Quick Replies first.');
                    return;
                }
                qrSet = api.getSetByName?.(sets[0]);
            }

            if (!qrSet) {
                setSaveError('Could not find target QR set.');
                return;
            }

            // Build trigger flags from selected trigger
            const triggerFlags = {};
            const triggerProp = TRIGGER_MAP[trigger]?.prop;
            if (triggerProp) triggerFlags[triggerProp] = true;

            // Add the QR directly — this saves automatically
            qrSet.addQuickReply({
                label: label.trim(),
                message: displayScript,
                ...triggerFlags,
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            setSaveError(`Failed: ${err.message}`);
        }
    };

    return (
        <div className="qrb-output">
            <div className="qrb-output-header">Output</div>

            <div className="qrb-output-label-row">
                <label>Label</label>
                <input
                    type="text"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="📋 My Script"
                />
            </div>

            <div className="qrb-script-preview">
                {displayScript ? (
                    <pre>{displayScript}</pre>
                ) : (
                    <div className="qrb-script-empty">
                        Script will appear here as you build or generate with AI
                    </div>
                )}
            </div>

            <div className="qrb-trigger-row">
                <label>Auto-Execute Trigger</label>
                <select value={trigger} onChange={e => setTrigger(e.target.value)}>
                    {Object.entries(TRIGGER_MAP).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>
            </div>

            {qrSets.length > 0 && (
                <div className="qrb-trigger-row">
                    <label>Target QR Set</label>
                    <select value={targetSet} onChange={e => setTargetSet(e.target.value)}>
                        <option value="">First available set</option>
                        {qrSets.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="qrb-stats">
                <div className="qrb-stat">
                    <div className="qrb-stat-val">{blocks.length}</div>
                    <div className="qrb-stat-key">Blocks</div>
                </div>
                <div className="qrb-stat">
                    <div className="qrb-stat-val">{pipeCount}</div>
                    <div className="qrb-stat-key">Pipes</div>
                </div>
                <div className="qrb-stat">
                    <div className="qrb-stat-val">{charCount}</div>
                    <div className="qrb-stat-key">Chars</div>
                </div>
            </div>

            {/* Primary action: Save directly to QR set */}
            <button
                className={`qrb-save-btn${saved ? ' success' : ''}`}
                onClick={handleSaveToQR}
                disabled={!displayScript || !label.trim()}
                title={!label.trim() ? 'Enter a label first' : 'Save directly to your Quick Reply set'}
            >
                {saved ? '✓ Saved to Quick Replies!' : '⚡ Save to Quick Replies'}
            </button>

            {/* Fallback: copy to clipboard */}
            <button
                className="qrb-copy-btn"
                onClick={handleCopy}
                disabled={!displayScript}
            >
                {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>

            {saveError && (
                <div className="qrb-save-error">⚠ {saveError}</div>
            )}
        </div>
    );
}

import { buildScript } from '../lib/parser.js';
import { useState } from 'react';

const TRIGGERS = [
    { value: '', label: 'None (manual click)' },
    { value: 'chat_load', label: 'On Chat Load' },
    { value: 'user_message_rendered', label: 'After User Message' },
    { value: 'character_message_rendered', label: 'After AI Message' },
    { value: 'generation_ended', label: 'After Generation' },
];

export default function OutputPanel({ blocks, label, setLabel, script }) {
    const [trigger, setTrigger] = useState('');
    const [copied, setCopied] = useState(false);

    const displayScript = script || (blocks.length > 0 ? buildScript(blocks) : '');

    const handleCopy = () => {
        if (!displayScript) return;
        navigator.clipboard.writeText(displayScript).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    const charCount = displayScript.length;
    const pipeCount = (displayScript.match(/\|/g) || []).length;

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
                    {TRIGGERS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

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

            <button
                className="qrb-copy-btn"
                onClick={handleCopy}
                disabled={!displayScript}
            >
                {copied ? '✓ Copied!' : '📋 Copy Script'}
            </button>
        </div>
    );
}

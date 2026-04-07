import { CAT_COLORS } from '../data/commands.js';
import { buildCommand } from '../lib/parser.js';

export default function Builder({ blocks, onUpdateBlock, onRemoveBlock, onMoveBlock }) {
    if (blocks.length === 0) {
        return (
            <div className="qrb-builder">
                <div className="qrb-empty-builder">
                    <div className="qrb-empty-builder-icon">🔧</div>
                    <div>No blocks yet.</div>
                    <div style={{ fontSize: 12, color: '#555' }}>Add commands from the left panel, or generate with AI.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="qrb-builder">
            <div className="qrb-blocks">
                {blocks.map((block, i) => (
                    <BlockCard
                        key={block.id}
                        block={block}
                        index={i}
                        isFirst={i === 0}
                        isLast={i === blocks.length - 1}
                        onUpdate={(updated) => onUpdateBlock(i, updated)}
                        onRemove={() => onRemoveBlock(i)}
                        onMoveUp={() => onMoveBlock(i, -1)}
                        onMoveDown={() => onMoveBlock(i, 1)}
                    />
                ))}
            </div>
        </div>
    );
}

function BlockCard({ block, index, isFirst, isLast, onUpdate, onRemove, onMoveUp, onMoveDown }) {
    const color = CAT_COLORS[block.category] || { border: '#6366f1' };

    const setVal = (key, val) => {
        onUpdate({ ...block, values: { ...block.values, [key]: val } });
    };

    const preview = buildCommand(block);

    return (
        <div className="qrb-block" style={{ borderLeftColor: color.border }}>
            <div className="qrb-block-header">
                <span className="qrb-block-cmd">{block.cmd}</span>
                <span className="qrb-block-desc">{block.desc}</span>
                <div className="qrb-block-controls">
                    <button className="qrb-block-btn" onClick={onMoveUp} disabled={isFirst} title="Move up">▲</button>
                    <button className="qrb-block-btn" onClick={onMoveDown} disabled={isLast} title="Move down">▼</button>
                    <button className="qrb-block-btn remove" onClick={onRemove} title="Remove">✕</button>
                </div>
            </div>

            {/* Arg fields */}
            {(block.args || []).length > 0 && (
                <div className="qrb-block-fields">
                    {(block.args || []).map(arg => (
                        <FieldInput
                            key={arg.key}
                            arg={arg}
                            value={block.values?.[arg.key]}
                            onChange={val => setVal(arg.key, val)}
                        />
                    ))}
                </div>
            )}

            {/* Option fields */}
            {(block.opts || []).length > 0 && (
                <div className="qrb-block-fields" style={{ marginTop: 8 }}>
                    {(block.opts || []).map(opt => (
                        <FieldInput
                            key={opt.key}
                            arg={opt}
                            value={block.values?.[opt.key]}
                            onChange={val => setVal(opt.key, val)}
                        />
                    ))}
                </div>
            )}

            {/* Preview */}
            {preview && (
                <div style={{
                    marginTop: 10,
                    padding: '6px 10px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 5,
                    fontSize: 11,
                    color: '#a5d6f7',
                    fontFamily: 'IBM Plex Mono, monospace',
                    wordBreak: 'break-all',
                }}>
                    {preview}
                </div>
            )}
        </div>
    );
}

function FieldInput({ arg, value, onChange }) {
    if (arg.type === 'toggle') {
        return (
            <label className="qrb-field-toggle">
                <input
                    type="checkbox"
                    checked={!!value}
                    onChange={e => onChange(e.target.checked)}
                />
                {arg.label}
            </label>
        );
    }
    if (arg.type === 'select') {
        return (
            <div className="qrb-field">
                {arg.label && <span className="qrb-field-label">{arg.label}</span>}
                <select value={value || arg.options?.[0] || ''} onChange={e => onChange(e.target.value)}>
                    {(arg.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        );
    }
    if (arg.type === 'closure') {
        return (
            <div className="qrb-field">
                <span className="qrb-field-label">{arg.key}</span>
                <textarea
                    value={value || ''}
                    placeholder={arg.placeholder}
                    onChange={e => onChange(e.target.value)}
                    rows={3}
                />
            </div>
        );
    }
    return (
        <div className="qrb-field">
            <span className="qrb-field-label">{arg.label || arg.key}</span>
            <input
                type="text"
                value={value || ''}
                placeholder={arg.placeholder}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}

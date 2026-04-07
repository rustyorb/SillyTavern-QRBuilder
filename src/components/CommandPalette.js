import { COMMANDS, CAT_COLORS, CATEGORIES } from '../data/commands.js';

export default function CommandPalette({ onAddBlock, activeCategory, setActiveCategory }) {
    return (
        <div className="qrb-panel-left">
            <div className="qrb-palette-header">Commands</div>
            {CATEGORIES.map(cat => {
                const color = CAT_COLORS[cat];
                const cmds = COMMANDS[cat];
                const isOpen = activeCategory === cat;
                return (
                    <div key={cat} className="qrb-category">
                        <button
                            className={`qrb-cat-btn${isOpen ? ' active' : ''}`}
                            style={{ borderLeftColor: isOpen ? color.border : 'transparent' }}
                            onClick={() => setActiveCategory(isOpen ? null : cat)}
                        >
                            {cat}
                            <span className="chevron">▶</span>
                        </button>
                        {isOpen && (
                            <div className="qrb-cmd-list">
                                {cmds.map(cmd => (
                                    <button
                                        key={cmd.cmd}
                                        className="qrb-cmd-btn"
                                        style={{ borderLeftColor: color.border }}
                                        onClick={() => onAddBlock(cmd, cat)}
                                        title={cmd.desc}
                                    >
                                        <span className="qrb-cmd-name">{cmd.cmd}</span>
                                        <span className="qrb-cmd-desc">{cmd.desc}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

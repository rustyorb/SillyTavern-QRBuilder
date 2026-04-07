import { useState, useRef, useEffect, useCallback } from 'react';
import { generateWithST, extractCodeBlocks, extractLabel } from '../lib/ai.js';
import { parseScript } from '../lib/parser.js';

const SUGGESTIONS = [
    'Make a button that summarizes the last 50 messages',
    'Create a dice roll system with modifiers',
    'Track turns and trigger a plot twist every 5',
    'Button to save the scene and delete the last message',
    'Ask the user what happens next and generate prose',
    'Generate a narrator description of the environment',
];

export default function AIChat({ generateQuietPrompt, onApplyScript, onApplyLabel }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput]       = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError]       = useState(null);
    const messagesEndRef          = useRef(null);
    const textareaRef             = useRef(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = useCallback(async (text) => {
        const content = text || input.trim();
        if (!content || generating) return;

        setError(null);
        setInput('');

        const userMsg = { role: 'user', content };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setGenerating(true);

        // Add assistant placeholder
        setMessages([...newMessages, { role: 'assistant', content: '' }]);

        try {
            let assistantContent = '';

            await generateWithST(
                newMessages,
                generateQuietPrompt,
                (chunk) => {
                    assistantContent += chunk;
                    setMessages(prev => {
                        const u = [...prev];
                        u[u.length - 1] = { role: 'assistant', content: assistantContent };
                        return u;
                    });
                }
            );

            // Auto-apply script + label from response
            const codeBlocks = extractCodeBlocks(assistantContent);
            const aiLabel    = extractLabel(assistantContent);
            if (codeBlocks.length > 0) {
                const parsed = parseScript(codeBlocks[0]);
                onApplyScript(parsed.length > 0 ? parsed : [], codeBlocks[0]);
            }
            if (aiLabel) onApplyLabel(aiLabel);

        } catch (err) {
            setError(err.message);
            setMessages(prev => prev.slice(0, -1)); // remove empty assistant placeholder
        } finally {
            setGenerating(false);
        }
    }, [input, messages, generating, generateQuietPrompt, onApplyScript, onApplyLabel]);

    const handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleApplyFromMessage = msgContent => {
        const codeBlocks = extractCodeBlocks(msgContent);
        const lbl = extractLabel(msgContent);
        if (codeBlocks.length > 0) {
            const parsed = parseScript(codeBlocks[0]);
            onApplyScript(parsed.length > 0 ? parsed : [], codeBlocks[0]);
        }
        if (lbl) onApplyLabel(lbl);
    };

    const isReady = !!generateQuietPrompt;

    return (
        <div className="qrb-ai-chat">
            {messages.length === 0 && !generating ? (
                <div className="qrb-welcome">
                    <div className="qrb-welcome-icon">⚡</div>
                    <div className="qrb-welcome-title">AI Script Generator</div>
                    <div className="qrb-welcome-sub">
                        Describe what you want your Quick Reply to do.<br/>
                        Uses your currently connected model — no extra setup.
                    </div>
                    {!isReady && (
                        <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 8 }}>
                            ⚠ AI generation unavailable — SillyTavern's generation API could not be loaded.
                            Check that ST is running and a model is connected.
                        </div>
                    )}
                    <div className="qrb-chips">
                        {SUGGESTIONS.map((s, i) => (
                            <button key={i} className="qrb-chip"
                                onClick={() => handleSend(s)}
                                disabled={!isReady}
                            >{s}</button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="qrb-messages">
                    {messages.map((msg, i) => (
                        <MessageBubble
                            key={i}
                            message={msg}
                            generating={generating && i === messages.length - 1}
                            onApply={() => handleApplyFromMessage(msg.content)}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {error && <div className="qrb-error">⚠ {error}</div>}

            <div className="qrb-input-bar">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={generating ? 'Generating…' : 'Describe what you want the button to do…'}
                    rows={1}
                    disabled={generating}
                />
                <button className="qrb-send-btn"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || generating || !isReady}
                >
                    {generating ? '…' : '▲'}
                </button>
            </div>
        </div>
    );
}

function MessageBubble({ message, generating, onApply }) {
    const { role, content } = message;
    const isAssistant = role === 'assistant';
    return (
        <div className={`qrb-message ${role}`}>
            <div className="qrb-msg-avatar">{isAssistant ? '⚡' : '●'}</div>
            <div className="qrb-msg-body">
                {isAssistant
                    ? <AssistantContent content={content} generating={generating} onApply={onApply} />
                    : <p style={{ margin: 0 }}>{content}</p>
                }
            </div>
        </div>
    );
}

function AssistantContent({ content, generating, onApply }) {
    if (!content && generating) {
        return <span className="qrb-thinking"><span /><span /><span /></span>;
    }
    const parts = splitContent(content);
    return (
        <div>
            {parts.map((part, i) => {
                if (part.type === 'code') {
                    return (
                        <div key={i} className="qrb-code-block">
                            <pre>{part.content}</pre>
                            {!generating && (
                                <div className="qrb-code-actions">
                                    <button className="qrb-btn" style={{ fontSize: 11, padding: '4px 10px' }}
                                        onClick={() => navigator.clipboard.writeText(part.content)}
                                    >Copy</button>
                                    <button className="qrb-btn success" style={{ fontSize: 11, padding: '4px 10px' }}
                                        onClick={onApply}
                                    >Apply →</button>
                                </div>
                            )}
                        </div>
                    );
                }
                return <div key={i} style={{ marginBottom: 6 }}
                    dangerouslySetInnerHTML={{ __html: formatText(part.content) }} />;
            })}
        </div>
    );
}

function splitContent(text) {
    if (!text) return [];
    const parts = [];
    const re = /```[\w]*\s*\n?([\s\S]*?)```/g;
    let last = 0, m;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push({ type: 'text', content: text.slice(last, m.index) });
        parts.push({ type: 'code', content: m[1].trim() });
        last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });
    return parts;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatText(text) {
    // Escape first so AI response can't inject raw HTML, then apply markdown transforms
    return escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:3px;font-family:IBM Plex Mono,monospace;font-size:0.9em;">$1</code>')
        .replace(/\n/g, '<br/>')
        .replace(/^- (.+)/gm, '• $1');
}

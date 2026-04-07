import { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat, extractCodeBlocks, extractLabel } from '../lib/ai.js';
import { parseScript } from '../lib/parser.js';

const SUGGESTIONS = [
    'Make a button that summarizes the last 50 messages',
    'Create a dice roll system with modifiers',
    'Track turns and trigger a plot twist every 5',
    'Button to save the scene and delete the last message',
    'Ask the user what happens next and generate prose',
    'Generate a narrator description of the environment',
];

export default function AIChat({ apiKey, model, onApplyScript, onApplyLabel }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput]       = useState('');
    const [streaming, setStreaming] = useState(false);
    const [error, setError]       = useState(null);
    const messagesEndRef = useRef(null);
    const textareaRef    = useRef(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = useCallback(async (text) => {
        const content = text || input.trim();
        if (!content || streaming) return;
        if (!apiKey) { setError('Set your OpenRouter API key in Settings.'); return; }
        if (!model)  { setError('Select a model in Settings.'); return; }

        setError(null);
        setInput('');
        const userMsg = { role: 'user', content };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setStreaming(true);

        try {
            let assistantContent = '';
            const chatHistory = newMessages.map(m => ({ role: m.role, content: m.content }));
            setMessages([...newMessages, { role: 'assistant', content: '' }]);

            for await (const chunk of streamChat(chatHistory, apiKey, model)) {
                assistantContent += chunk;
                setMessages(prev => {
                    const u = [...prev];
                    u[u.length - 1] = { role: 'assistant', content: assistantContent };
                    return u;
                });
            }

            // Auto-apply
            const codeBlocks = extractCodeBlocks(assistantContent);
            const aiLabel    = extractLabel(assistantContent);
            if (codeBlocks.length > 0) {
                const parsed = parseScript(codeBlocks[0]);
                onApplyScript(parsed.length > 0 ? parsed : [], codeBlocks[0]);
            }
            if (aiLabel) onApplyLabel(aiLabel);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
                setMessages(prev => prev.filter(m => m.content !== ''));
            }
        } finally {
            setStreaming(false);
        }
    }, [input, messages, streaming, apiKey, model, onApplyScript, onApplyLabel]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleApplyFromMessage = (messageContent) => {
        const codeBlocks = extractCodeBlocks(messageContent);
        const lbl = extractLabel(messageContent);
        if (codeBlocks.length > 0) {
            const parsed = parseScript(codeBlocks[0]);
            onApplyScript(parsed.length > 0 ? parsed : [], codeBlocks[0]);
        }
        if (lbl) onApplyLabel(lbl);
    };

    return (
        <div className="qrb-ai-chat">
            {messages.length === 0 && !streaming ? (
                <div className="qrb-welcome">
                    <div className="qrb-welcome-icon">⚡</div>
                    <div className="qrb-welcome-title">AI Script Generator</div>
                    <div className="qrb-welcome-sub">
                        Describe what you want your Quick Reply button to do. The AI will generate a complete, paste-ready STscript.
                    </div>
                    <div className="qrb-chips">
                        {SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                className="qrb-chip"
                                onClick={() => handleSend(s)}
                                disabled={!apiKey || !model}
                            >{s}</button>
                        ))}
                    </div>
                    {(!apiKey || !model) && (
                        <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 8 }}>
                            ⚠ Configure API key and model in Settings to get started
                        </div>
                    )}
                </div>
            ) : (
                <div className="qrb-messages">
                    {messages.map((msg, i) => (
                        <MessageBubble
                            key={i}
                            message={msg}
                            streaming={streaming && i === messages.length - 1}
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
                    placeholder={streaming ? 'Generating…' : 'Describe what you want the button to do…'}
                    rows={1}
                    disabled={streaming}
                />
                <button
                    className="qrb-send-btn"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || streaming || !apiKey}
                >
                    {streaming ? '…' : '▲'}
                </button>
            </div>
        </div>
    );
}

function MessageBubble({ message, streaming, onApply }) {
    const { role, content } = message;
    const isAssistant = role === 'assistant';
    return (
        <div className={`qrb-message ${role}`}>
            <div className="qrb-msg-avatar">{isAssistant ? '⚡' : '●'}</div>
            <div className="qrb-msg-body">
                {isAssistant ? (
                    <AssistantContent content={content} streaming={streaming} onApply={onApply} />
                ) : (
                    <p style={{ margin: 0 }}>{content}</p>
                )}
            </div>
        </div>
    );
}

function AssistantContent({ content, streaming, onApply }) {
    if (!content && streaming) {
        return (
            <span className="qrb-thinking">
                <span /><span /><span />
            </span>
        );
    }
    const parts = splitContent(content);
    return (
        <div>
            {parts.map((part, i) => {
                if (part.type === 'code') {
                    return (
                        <div key={i} className="qrb-code-block">
                            <pre>{part.content}</pre>
                            {!streaming && (
                                <div className="qrb-code-actions">
                                    <button
                                        className="qrb-btn"
                                        style={{ fontSize: 11, padding: '4px 10px' }}
                                        onClick={() => navigator.clipboard.writeText(part.content)}
                                    >Copy</button>
                                    <button
                                        className="qrb-btn success"
                                        style={{ fontSize: 11, padding: '4px 10px' }}
                                        onClick={onApply}
                                    >Apply →</button>
                                </div>
                            )}
                        </div>
                    );
                }
                return (
                    <div
                        key={i}
                        style={{ marginBottom: 6 }}
                        dangerouslySetInnerHTML={{ __html: formatText(part.content) }}
                    />
                );
            })}
        </div>
    );
}

function splitContent(text) {
    if (!text) return [];
    const parts = [];
    const re = /```[\w]*\s*\n?([\s\S]*?)```/g;
    let lastIndex = 0, match;
    while ((match = re.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        parts.push({ type: 'code', content: match[1].trim() });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push({ type: 'text', content: text.slice(lastIndex) });
    return parts;
}

function formatText(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:3px;font-family:IBM Plex Mono,monospace;font-size:0.9em;">$1</code>')
        .replace(/\n/g, '<br/>')
        .replace(/^- (.+)/gm, '• $1');
}

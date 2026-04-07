// STscript reference embedded directly (no Vite ?raw import needed)
const STSCRIPT_REFERENCE = `
## Command Structure
Commands start with /, chain with |, use {{pipe}} for output passing. Named args: key=value

## Generation Commands
- /gen [prompt] — Full character context generation. Lock input: lock=on
- /genraw [prompt] — Raw generation, no context at all
- /continue — Extends last AI message
- /impersonate [prompt] — Generate as user
- /sysgen [prompt] — Neutral narrator generation
- /ask [prompt] — Generate then pause for input

## Input/Output Commands
- /input (prompt) — Display input box, write user input to pipe. Args: large=on, wide=on, rows=N
- /popup (text) — Show blocking popup. Args: large=on, wide=on, okButton=string
- /setinput (text) — Replace user input bar contents
- /echo (text) — Display toast notification. severity=info|success|warning|error
- /buttons labels=["a","b"] (text) — Show popup with custom choice buttons
- /sys [text] — Neutral narrator message (not from any character)
- /sendas name=X [text] — Send message as any character
- /send [text] — Send as user persona
- /comment [text] — Hidden note (not in context)

## Chat Manipulation
- /del (number) — Delete last N messages
- /cut (id or range) — Delete by ID or range (e.g. 1-5)
- /hide (id/range) — Hide messages from AI context
- /unhide (id/range) — Restore hidden messages
- /messages (range) — Get messages from chat. names=on/off
- /addswipe [text] — Add alternative to last message
- /trimtokens limit=X direction=start|end (text) — Trim to token limit
- /trimstart (text) — Trim to first complete sentence
- /trimend (text) — Trim to last complete sentence

## Variables
Local (chat): /setvar key=X (value) | /getvar (name) | /flushvar (name) | {{getvar::name}}
Global (global): /setglobalvar key=X (value) | /getglobalvar (name) | {{getglobalvar::name}}
Scoped (script): /let name (value) | /var name | {{var::name}}
Math: /addvar key=X (value) | /incvar (name) | /decvar (name) | /mulvar | /divvar
Array/Object index: index=number (0-based) or index=string (key name)

## Control Flow
Conditional:
  /if left=X rule=eq right=Y {: /echo Match :} else={: /echo No :}
Rules: eq, neq, gt, gte, lt, lte, not, in

Loop:
  /times 5 {: /echo {{timesIndex}} :}
  
While:
  /let i 0 | /while left={{var::i}} rule=lt right=5 {: /addvar key=i 1 :}

- /delay (ms) — Wait milliseconds
- /abort — Stop execution
- /return (value) — Return value from closure
- /break — Break out of loop

## Math Operations
/add X Y | /sub X Y | /mul X Y | /div X Y | /mod X Y | /pow X Y | /rand min max | /round X | /len (text)

## Indexing Reference
- {{lastMessageId}} — Message ID (1-based)
- /messages, /cut, /hide, /unhide — 1-based message IDs
- Array index= — Zero-based
- {{timesIndex}} — Zero-based loop counter

## Common Patterns
Simple action: /sendas name={{char}} [text]
AI generation: /genraw lock=on [prompt] | /sys {{pipe}}
Transform input: /genraw lock=on [Transform: {{input}}] | /setinput {{pipe}}
Store variable: /setvar key=name {{input}} | /echo severity=success Saved: {{pipe}}
Save & delete last: /setvar key=SceneInfo {{lastMessage}} | /del 1
Chat summary: /messages 0-{{lastMessageId}} | /trimtokens limit=3000 direction=end | /genraw lock=on [Summarize: {{pipe}}]
Delete and regen: /del 1 | /continue
Init stats: /setvar key=health 100 | /setvar key=mana 50 | /echo severity=success Stats initialized
Random from list: /setglobalvar key=items ["a","b","c"] | /pick {{getglobalvar::items}}
Turn counter: /addvar key=turns 1 | /if left={{getvar::turns}} rule=gte right=5 {: /flushvar turns | /genraw lock=on [event prompt] | /sys {{pipe}} :}

## Quality Rules
- Commands start with /
- Chain with |
- {{pipe}} for output passing
- Closures use {: ... :} syntax
- Named arguments: key=value
- Macros use double colon :: format
- Generation commands include lock=on for user wait
- Recursive functions need clear exit conditions
- Use correct indexing (1-based for messages, 0-based for arrays)
`;

const SYSTEM_PROMPT = `You are an expert STscript Quick Reply developer for SillyTavern.

Your job is to create complete, working STscript Quick Reply scripts based on user descriptions.

${STSCRIPT_REFERENCE}

## Response Format

When creating a script, respond with:
1. A suggested **Label:** with an emoji (e.g. "📋 Summary")
2. The complete script in a code block tagged \`\`\`stscript
3. A brief explanation (1-2 sentences max)
4. If auto-execute is needed, specify the trigger

When explaining or debugging a script, be concise and direct.

IMPORTANT RULES:
- Always provide complete, paste-ready code
- Never use placeholders like [your text here]
- Default to {{char}} for character references
- Use lock=on for generation commands that should block input
- Chain commands with | and use {{pipe}} to pass data
- Keep explanations brief — the code speaks for itself
- ONLY use commands documented in the reference above`;

/**
 * Fetch available models from OpenRouter
 */
export async function fetchModels(apiKey) {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch models: ${res.status}`);
    const data = await res.json();
    return data.data
        .filter(m => m.id && m.name)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(m => ({ id: m.id, name: m.name, contextLength: m.context_length }));
}

/**
 * Stream chat completion from OpenRouter — async generator
 */
export async function* streamChat(messages, apiKey, model) {
    const body = {
        model,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
        ],
        stream: true,
    };

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin || 'http://localhost:8000',
            'X-Title': 'STscript QR Builder',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API error ${res.status}: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') return;
            try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) yield content;
            } catch { /* skip malformed */ }
        }
    }
}

/**
 * Extract ```stscript code blocks from AI response
 */
export function extractCodeBlocks(text) {
    const blocks = [];
    const regex = /```[\w]*\s*\n?([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        blocks.push(match[1].trim());
    }
    // Fallback: lines starting with /
    if (blocks.length === 0) {
        const lines = text.split('\n').filter(l => l.trim().startsWith('/'));
        if (lines.length > 0) blocks.push(lines.join('\n'));
    }
    return blocks;
}

/**
 * Extract suggested label from AI response
 */
export function extractLabel(text) {
    const match = text.match(/\*?\*?Label:?\*?\*?\s*(.+)/i);
    if (match) return match[1].trim().replace(/^[`"']|[`"']$/g, '');
    return '';
}

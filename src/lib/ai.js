/**
 * AI generation module — uses ST's already-configured connection
 * via generateQuietPrompt (imported from /script.js at runtime).
 *
 * No API key or model configuration needed — whatever the user has
 * connected in SillyTavern is what gets used.
 */

// STscript reference, embedded inline (webpack can't do ?raw imports)
const STSCRIPT_REFERENCE = `
## Command Structure
Commands start with /, chain with |, use {{pipe}} for output passing. Named args: key=value

## Generation Commands
- /gen [prompt] — Full character context generation. lock=on blocks input during gen
- /genraw [prompt] — Raw generation, no character context at all
- /continue — Extends last AI message
- /impersonate [prompt] — Generate as user voice
- /sysgen [prompt] — Neutral narrator generation
- /ask [prompt] — Generate then pause for input

## Input/Output Commands
- /input (prompt) — Display input box, pipe user's response. Args: large=on, wide=on, rows=N
- /popup (text) — Blocking popup. Args: large=on, wide=on, okButton=string
- /setinput (text) — Replace user input bar contents
- /echo (text) — Toast notification. severity=info|success|warning|error
- /buttons labels=["a","b"] (text) — Popup with choice buttons
- /sys [text] — Neutral narrator message
- /sendas name=X [text] — Message as any character
- /send [text] — Send as user persona
- /comment [text] — Hidden note, not in context

## Chat Manipulation
- /del (number) — Delete last N messages
- /cut (id or range) — Delete by ID or range e.g. 1-5
- /hide (id/range) — Hide from AI context
- /unhide (id/range) — Restore hidden messages
- /messages (range) — Get messages. names=on/off
- /trimtokens limit=X direction=start|end (text) — Trim to token limit
- /trimstart (text) — Trim to first complete sentence
- /trimend (text) — Trim to last complete sentence

## Variables
Local (chat):   /setvar key=X (value) | /getvar (name) | /flushvar (name) | {{getvar::name}}
Global:         /setglobalvar key=X (value) | /getglobalvar (name) | {{getglobalvar::name}}
Scoped:         /let name (value) | /var name | {{var::name}}
Math ops:       /addvar key=X (v) | /incvar (name) | /decvar (name) | /mulvar | /divvar

## Control Flow
Conditional:   /if left=X rule=eq right=Y {: /echo Match :} else={: /echo No :}
Rules:         eq, neq, gt, gte, lt, lte, not, in
Loop:          /times 5 {: /echo {{timesIndex}} :}
While:         /let i 0 | /while left={{var::i}} rule=lt right=5 {: /addvar key=i 1 :}
Break:         /break inside loop
Delay:         /delay (ms)
Abort:         /abort
Return:        /return (value)

## Math
/add X Y | /sub X Y | /mul X Y | /div X Y | /mod X Y | /pow X Y | /rand min max | /round X

## Indexing
- {{lastMessageId}} — 1-based message ID
- /messages, /cut, /hide, /unhide — 1-based message IDs
- Array index= — 0-based
- {{timesIndex}} — 0-based loop counter

## Common Patterns
AI generation:     /genraw lock=on [prompt] | /sys {{pipe}}
Transform input:   /genraw lock=on [transform: {{input}}] | /setinput {{pipe}}
Store variable:    /setvar key=name {{input}} | /echo severity=success Saved: {{pipe}}
Save & delete:     /setvar key=scene {{lastMessage}} | /del 1
Chat summary:      /messages 0-{{lastMessageId}} | /trimtokens limit=3000 direction=end | /genraw lock=on [Summarize: {{pipe}}]
Delete & regen:    /del 1 | /continue
Init stats:        /setvar key=hp 100 | /setvar key=mp 50 | /echo severity=success Stats initialized
Turn counter:      /addvar key=turns 1 | /if left={{getvar::turns}} rule=gte right=5 {: /flushvar turns | /genraw lock=on [event] | /sys {{pipe}} :}
Dice roll:         /rand 1 20 | /echo severity=info 🎲 Rolled: {{pipe}}/20

## Quality Rules
- Commands start with /
- Chain with |, pass output with {{pipe}}
- Closures: {: ... :}
- Named args: key=value
- lock=on for blocking generation
- 1-based for messages, 0-based for arrays
- Use ONLY commands documented above — no invented commands
`;

const SYSTEM_PROMPT = `You are an expert STscript Quick Reply developer for SillyTavern.
Your job: create complete, working STscript Quick Reply scripts from user descriptions.

${STSCRIPT_REFERENCE}

## Response Format
Always structure responses as:
1. **Label:** [emoji + button text] e.g. "📋 Summary"
2. Script in a \`\`\`stscript code block
3. Brief explanation (1-2 sentences max)
4. Auto-execute trigger only if relevant

## Rules
- Complete, paste-ready code. No placeholders.
- Default to {{char}} for character references
- Use lock=on for generation commands
- Chain with | and pass with {{pipe}}
- Only use commands from the reference above
- **CRITICAL syntax rules**:
  - ALL positional text/arguments containing spaces MUST be wrapped in parentheses \`(...)\`. For example: \`/popup (This is my popup text)\`, \`/setvar key=name (hello world)\`, \`/sys (Character wakes up)\`.
  - ALL prompts for generation commands (\`/gen\`, \`/genraw\`, \`/sysgen\`, \`/impersonate\`) MUST be wrapped in square brackets \`[...]\`. For example: \`/genraw lock=on [Write a response]\`, \`/gen [Add detail]\`.`;

/**
 * Build the full prompt for generateQuietPrompt from a conversation history.
 * generateQuietPrompt is a single-turn function, so we format the full
 * conversation history into the prompt string.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {string}
 */
function buildPrompt(messages) {
    const history = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
    return `${SYSTEM_PROMPT}\n\n---\n\n${history}\n\nAssistant:`;
}

/**
 * Generate a response using ST's currently configured model.
 * Uses generateQuietPrompt which was imported at runtime via importFromUrl.
 *
 * @param {Array<{role: string, content: string}>} messages  Conversation history
 * @param {Function} generateQuietPrompt  ST's generateQuietPrompt function
 * @param {Function} onToken  Called with each simulated token chunk for streaming UI
 * @returns {Promise<string>}
 */
export async function generateWithST(messages, generateQuietPrompt, onToken) {
    if (!generateQuietPrompt) {
        throw new Error('ST generation function not available. Is SillyTavern connected to a model?');
    }

    const prompt = buildPrompt(messages);

    // Call generateQuietPrompt robustly to support both the modern object signature
    // and older positional string signatures without warning or throwing.
    let result;
    try {
        result = await generateQuietPrompt({ quietPrompt: prompt });
    } catch (e) {
        console.warn('[QRBuilder] Failed object-based generateQuietPrompt, falling back to positional string', e);
        try {
            result = await generateQuietPrompt(prompt);
        } catch (err2) {
            console.error('[QRBuilder] Critical failure in both generateQuietPrompt signatures', err2);
            throw err2;
        }
    }

    if (!result) throw new Error('No response from model. Check your ST connection.');

    // Simulate token streaming for the chat UI
    if (onToken) {
        const words = result.split(' ');
        for (const word of words) {
            onToken(word + ' ');
            await new Promise(r => setTimeout(r, 8)); // ~125 words/sec visual speed
        }
    }

    return result;
}

/**
 * Extract ```stscript (or any) code blocks from AI response text
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

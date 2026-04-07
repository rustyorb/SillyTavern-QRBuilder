// Commands data — copied from standalone app
export const COMMANDS = {
  Generation: [
    { cmd: '/gen', label: 'Gen', desc: 'Full context generation', args: [{ key: 'prompt', type: 'text', placeholder: 'Generation prompt...', required: true }], opts: [{ key: 'lock', type: 'toggle', label: 'Lock input' }] },
    { cmd: '/genraw', label: 'GenRaw', desc: 'Raw generation, no context', args: [{ key: 'prompt', type: 'text', placeholder: 'Raw prompt...', required: true }], opts: [{ key: 'lock', type: 'toggle', label: 'Lock input' }] },
    { cmd: '/continue', label: 'Continue', desc: 'Extend last AI message', args: [], opts: [] },
    { cmd: '/impersonate', label: 'Impersonate', desc: 'Generate as user', args: [{ key: 'prompt', type: 'text', placeholder: 'Impersonation prompt...' }], opts: [] },
    { cmd: '/sysgen', label: 'SysGen', desc: 'Neutral narrator gen', args: [{ key: 'prompt', type: 'text', placeholder: 'Narrator prompt...', required: true }], opts: [] },
  ],
  'Input/Output': [
    { cmd: '/sendas', label: 'SendAs', desc: 'Message as character', args: [{ key: 'name', type: 'named', placeholder: 'Character name' }, { key: 'text', type: 'text', placeholder: 'Message text...' }], opts: [] },
    { cmd: '/sys', label: 'System', desc: 'Narrator message', args: [{ key: 'text', type: 'text', placeholder: 'System message...' }], opts: [] },
    { cmd: '/echo', label: 'Echo', desc: 'Toast notification', args: [{ key: 'text', type: 'text', placeholder: 'Notification text...' }], opts: [{ key: 'severity', type: 'select', label: 'Severity', options: ['info', 'success', 'warning', 'error'] }] },
    { cmd: '/input', label: 'Input', desc: 'Show input box', args: [{ key: 'prompt', type: 'text', placeholder: 'Input prompt...' }], opts: [{ key: 'rows', type: 'number', label: 'Rows' }, { key: 'large', type: 'toggle', label: 'Large' }, { key: 'wide', type: 'toggle', label: 'Wide' }] },
    { cmd: '/popup', label: 'Popup', desc: 'Show blocking popup', args: [{ key: 'text', type: 'text', placeholder: 'Popup content...' }], opts: [{ key: 'large', type: 'toggle', label: 'Large' }, { key: 'wide', type: 'toggle', label: 'Wide' }, { key: 'okButton', type: 'named', placeholder: 'Button text' }] },
    { cmd: '/buttons', label: 'Buttons', desc: 'Choice popup', args: [{ key: 'labels', type: 'named', placeholder: '["A","B","C"]' }, { key: 'text', type: 'text', placeholder: 'Prompt text...' }], opts: [] },
    { cmd: '/setinput', label: 'SetInput', desc: 'Replace input bar text', args: [{ key: 'text', type: 'text', placeholder: 'New input text...' }], opts: [] },
  ],
  Variables: [
    { cmd: '/setvar', label: 'SetVar', desc: 'Set local variable', args: [{ key: 'key', type: 'named', placeholder: 'Variable name' }, { key: 'value', type: 'text', placeholder: 'Value (or {{pipe}})' }], opts: [{ key: 'index', type: 'named', placeholder: 'Index/key' }] },
    { cmd: '/getvar', label: 'GetVar', desc: 'Get local variable', args: [{ key: 'name', type: 'text', placeholder: 'Variable name' }], opts: [{ key: 'index', type: 'named', placeholder: 'Index/key' }] },
    { cmd: '/setglobalvar', label: 'SetGlobal', desc: 'Set global variable', args: [{ key: 'key', type: 'named', placeholder: 'Variable name' }, { key: 'value', type: 'text', placeholder: 'Value' }], opts: [] },
    { cmd: '/getglobalvar', label: 'GetGlobal', desc: 'Get global variable', args: [{ key: 'name', type: 'text', placeholder: 'Variable name' }], opts: [] },
    { cmd: '/let', label: 'Let', desc: 'Scoped variable', args: [{ key: 'name', type: 'text', placeholder: 'Variable name' }, { key: 'value', type: 'text', placeholder: 'Value' }], opts: [] },
    { cmd: '/addvar', label: 'AddVar', desc: 'Increment variable', args: [{ key: 'key', type: 'named', placeholder: 'Variable name' }, { key: 'value', type: 'text', placeholder: 'Amount' }], opts: [] },
    { cmd: '/incvar', label: 'IncVar', desc: 'Increment by 1', args: [{ key: 'name', type: 'text', placeholder: 'Variable name' }], opts: [] },
    { cmd: '/flushvar', label: 'FlushVar', desc: 'Delete local variable', args: [{ key: 'name', type: 'text', placeholder: 'Variable name' }], opts: [] },
  ],
  Chat: [
    { cmd: '/del', label: 'Delete', desc: 'Delete last N messages', args: [{ key: 'count', type: 'text', placeholder: 'Number of messages' }], opts: [] },
    { cmd: '/cut', label: 'Cut', desc: 'Delete by ID/range', args: [{ key: 'range', type: 'text', placeholder: 'ID or range (e.g. 1-5)' }], opts: [] },
    { cmd: '/hide', label: 'Hide', desc: 'Hide from AI context', args: [{ key: 'range', type: 'text', placeholder: 'ID or range' }], opts: [] },
    { cmd: '/unhide', label: 'Unhide', desc: 'Restore to context', args: [{ key: 'range', type: 'text', placeholder: 'ID or range' }], opts: [] },
    { cmd: '/messages', label: 'Messages', desc: 'Get chat messages', args: [{ key: 'range', type: 'text', placeholder: 'e.g. 0-{{lastMessageId}}' }], opts: [{ key: 'names', type: 'select', label: 'Names', options: ['on', 'off'] }] },
    { cmd: '/comment', label: 'Comment', desc: 'Hidden note', args: [{ key: 'text', type: 'text', placeholder: 'Note text...' }], opts: [] },
    { cmd: '/send', label: 'Send', desc: 'Send as user', args: [{ key: 'text', type: 'text', placeholder: 'Message...' }], opts: [] },
  ],
  Flow: [
    { cmd: '/if', label: 'If', desc: 'Conditional', args: [{ key: 'left', type: 'named', placeholder: 'Left value' }, { key: 'rule', type: 'select', options: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not'] }, { key: 'right', type: 'named', placeholder: 'Right value' }, { key: 'then', type: 'closure', placeholder: 'Then block...' }, { key: 'else', type: 'closure', placeholder: 'Else block (optional)' }], opts: [] },
    { cmd: '/times', label: 'Times', desc: 'Loop N times', args: [{ key: 'count', type: 'text', placeholder: 'Iterations' }, { key: 'body', type: 'closure', placeholder: 'Loop body...' }], opts: [] },
    { cmd: '/while', label: 'While', desc: 'While loop', args: [{ key: 'left', type: 'named', placeholder: 'Left value' }, { key: 'rule', type: 'select', options: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not'] }, { key: 'right', type: 'named', placeholder: 'Right value' }, { key: 'body', type: 'closure', placeholder: 'Loop body...' }], opts: [] },
    { cmd: '/delay', label: 'Delay', desc: 'Wait milliseconds', args: [{ key: 'ms', type: 'text', placeholder: 'Milliseconds' }], opts: [] },
    { cmd: '/abort', label: 'Abort', desc: 'Stop execution', args: [], opts: [] },
    { cmd: '/return', label: 'Return', desc: 'Return value from closure', args: [{ key: 'value', type: 'text', placeholder: 'Return value' }], opts: [] },
  ],
  Text: [
    { cmd: '/trimtokens', label: 'TrimTokens', desc: 'Trim to token limit', args: [{ key: 'limit', type: 'named', placeholder: 'Token limit' }, { key: 'direction', type: 'select', options: ['end', 'start'] }, { key: 'text', type: 'text', placeholder: 'Text (or {{pipe}})' }], opts: [] },
    { cmd: '/trimstart', label: 'TrimStart', desc: 'Trim to first sentence', args: [{ key: 'text', type: 'text', placeholder: 'Text (or {{pipe}})' }], opts: [] },
    { cmd: '/trimend', label: 'TrimEnd', desc: 'Trim to last sentence', args: [{ key: 'text', type: 'text', placeholder: 'Text (or {{pipe}})' }], opts: [] },
  ],
  Math: [
    { cmd: '/add', label: 'Add', desc: 'Addition', args: [{ key: 'a', type: 'text', placeholder: 'X' }, { key: 'b', type: 'text', placeholder: 'Y' }], opts: [] },
    { cmd: '/sub', label: 'Sub', desc: 'Subtraction', args: [{ key: 'a', type: 'text', placeholder: 'X' }, { key: 'b', type: 'text', placeholder: 'Y' }], opts: [] },
    { cmd: '/mul', label: 'Mul', desc: 'Multiplication', args: [{ key: 'a', type: 'text', placeholder: 'X' }, { key: 'b', type: 'text', placeholder: 'Y' }], opts: [] },
    { cmd: '/rand', label: 'Rand', desc: 'Random number', args: [{ key: 'min', type: 'text', placeholder: 'Min' }, { key: 'max', type: 'text', placeholder: 'Max' }], opts: [] },
  ],
};

export const CAT_COLORS = {
  Generation:     { border: '#e94560', accent: '#e94560' },
  'Input/Output': { border: '#0f9b8e', accent: '#0f9b8e' },
  Variables:      { border: '#f5a623', accent: '#f5a623' },
  Chat:           { border: '#7b68ee', accent: '#7b68ee' },
  Flow:           { border: '#ff6b6b', accent: '#ff6b6b' },
  Text:           { border: '#4ecdc4', accent: '#4ecdc4' },
  Math:           { border: '#ffe66d', accent: '#ffe66d' },
};

export const CATEGORIES = Object.keys(COMMANDS);

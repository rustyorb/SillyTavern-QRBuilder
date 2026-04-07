import { uid } from '../lib/parser.js';

export const TEMPLATES = [
  {
    name: 'Chat Summary',
    icon: '📝',
    desc: 'Summarize last 50 messages',
    blocks: [
      { cmd: '/messages', label: 'Messages', desc: 'Get chat messages', args: [{ key: 'range', type: 'text', placeholder: 'e.g. 0-{{lastMessageId}}' }], opts: [], values: { range: '0-{{lastMessageId}}' }, category: 'Chat', id: uid() },
      { cmd: '/trimtokens', label: 'TrimTokens', desc: 'Trim to token limit', args: [{ key: 'limit', type: 'named', placeholder: 'Token limit' }, { key: 'direction', type: 'select', options: ['end', 'start'] }, { key: 'text', type: 'text', placeholder: 'Text (or {{pipe}})' }], opts: [], values: { limit: '3000', direction: 'end', text: '{{pipe}}' }, category: 'Text', id: uid() },
      { cmd: '/genraw', label: 'GenRaw', desc: 'Raw generation, no context', args: [{ key: 'prompt', type: 'text', placeholder: 'Raw prompt...', required: true }], opts: [{ key: 'lock', type: 'toggle', label: 'Lock input' }], values: { lock: true, prompt: 'Provide a concise summary of this conversation:\n{{pipe}}' }, category: 'Generation', id: uid() },
      { cmd: '/sys', label: 'System', desc: 'Narrator message', args: [{ key: 'text', type: 'text', placeholder: 'System message...' }], opts: [], values: { text: '📝 Summary: {{pipe}}' }, category: 'Input/Output', id: uid() },
    ],
  },
  {
    name: 'Plot Twist',
    icon: '🌀',
    desc: 'Trigger a random story event',
    blocks: [
      { cmd: '/genraw', label: 'GenRaw', desc: 'Raw generation, no context', args: [{ key: 'prompt', type: 'text', placeholder: 'Raw prompt...', required: true }], opts: [{ key: 'lock', type: 'toggle', label: 'Lock input' }], values: { lock: true, prompt: 'Generate a shocking plot twist for {{char}} that changes everything. Be dramatic and creative. One paragraph.' }, category: 'Generation', id: uid() },
      { cmd: '/sys', label: 'System', desc: 'Narrator message', args: [{ key: 'text', type: 'text', placeholder: 'System message...' }], opts: [], values: { text: '🌀 Plot Twist: {{pipe}}' }, category: 'Input/Output', id: uid() },
    ],
  },
  {
    name: 'Save & Delete',
    icon: '💾',
    desc: 'Save last message, delete it',
    blocks: [
      { cmd: '/setvar', label: 'SetVar', desc: 'Set local variable', args: [{ key: 'key', type: 'named', placeholder: 'Variable name' }, { key: 'value', type: 'text', placeholder: 'Value (or {{pipe}})' }], opts: [], values: { key: 'SavedScene', value: '{{lastMessage}}' }, category: 'Variables', id: uid() },
      { cmd: '/del', label: 'Delete', desc: 'Delete last N messages', args: [{ key: 'count', type: 'text', placeholder: 'Number of messages' }], opts: [], values: { count: '1' }, category: 'Chat', id: uid() },
      { cmd: '/echo', label: 'Echo', desc: 'Toast notification', args: [{ key: 'text', type: 'text', placeholder: 'Notification text...' }], opts: [{ key: 'severity', type: 'select', label: 'Severity', options: ['info', 'success', 'warning', 'error'] }], values: { severity: 'success', text: 'Scene saved! Use {{getvar::SavedScene}} to recall.' }, category: 'Input/Output', id: uid() },
    ],
  },
  {
    name: 'Turn Counter',
    icon: '🔢',
    desc: 'Track turns, trigger at 5',
    blocks: [
      { cmd: '/addvar', label: 'AddVar', desc: 'Increment variable', args: [{ key: 'key', type: 'named', placeholder: 'Variable name' }, { key: 'value', type: 'text', placeholder: 'Amount' }], opts: [], values: { key: 'turns', value: '1' }, category: 'Variables', id: uid() },
      { cmd: '/if', label: 'If', desc: 'Conditional', args: [{ key: 'left', type: 'named', placeholder: 'Left value' }, { key: 'rule', type: 'select', options: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not'] }, { key: 'right', type: 'named', placeholder: 'Right value' }, { key: 'then', type: 'closure', placeholder: 'Then block...' }], opts: [], values: { left: '{{getvar::turns}}', rule: 'gte', right: '5', then: '/flushvar turns | /genraw lock=on Trigger a dramatic story event! | /sys 🎲 {{pipe}}' }, category: 'Flow', id: uid() },
    ],
  },
  {
    name: 'Dice Roll',
    icon: '🎲',
    desc: 'Roll d20, display result',
    blocks: [
      { cmd: '/rand', label: 'Rand', desc: 'Random number', args: [{ key: 'min', type: 'text', placeholder: 'Min' }, { key: 'max', type: 'text', placeholder: 'Max' }], opts: [], values: { min: '1', max: '20' }, category: 'Math', id: uid() },
      { cmd: '/echo', label: 'Echo', desc: 'Toast notification', args: [{ key: 'text', type: 'text', placeholder: 'Notification text...' }], opts: [{ key: 'severity', type: 'select', label: 'Severity', options: ['info', 'success', 'warning', 'error'] }], values: { severity: 'info', text: '🎲 Rolled: {{pipe}} / 20' }, category: 'Input/Output', id: uid() },
    ],
  },
  {
    name: 'User Prompt',
    icon: '💬',
    desc: 'Ask user, generate response',
    blocks: [
      { cmd: '/input', label: 'Input', desc: 'Show input box', args: [{ key: 'prompt', type: 'text', placeholder: 'Input prompt...' }], opts: [], values: { prompt: 'What happens next?' }, category: 'Input/Output', id: uid() },
      { cmd: '/gen', label: 'Gen', desc: 'Full context generation', args: [{ key: 'prompt', type: 'text', placeholder: 'Generation prompt...', required: true }], opts: [{ key: 'lock', type: 'toggle', label: 'Lock input' }], values: { lock: true, prompt: '{{pipe}}' }, category: 'Generation', id: uid() },
    ],
  },
];

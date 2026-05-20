import { COMMANDS } from '../data/commands.js';

let _id = 0;
export const uid = () => `blk_${++_id}_${Date.now()}`;

function wrapArg(val) {
  if (!val) return '';
  val = String(val).trim();
  if (val.startsWith('(') && val.endsWith(')')) return val;
  if (!/\s/.test(val)) return val;
  return `(${val})`;
}

function wrapPrompt(val) {
  if (!val) return '';
  val = String(val).trim();
  if (val.startsWith('[') && val.endsWith(']')) return val;
  return `[${val}]`;
}

/**
 * Build a raw STscript string from an array of block objects
 */
export function buildScript(blocks) {
  return blocks.map(b => buildCommand(b).trim()).join(' | ');
}

/**
 * Build a single command string from a block object
 */
export function buildCommand(block) {
  const v = block.values || {};

  switch (block.cmd) {
    case '/gen':
    case '/genraw':
    case '/sysgen':
    case '/impersonate': {
      const lockStr = v.lock ? ' lock=on' : '';
      return `${block.cmd}${lockStr} ${wrapPrompt(v.prompt)}`;
    }
    case '/continue':
    case '/abort':
      return block.cmd;
    case '/return':
      return `/return ${wrapArg(v.value)}`;
    case '/sendas': {
      const n = v.name || '{{char}}';
      return `/sendas name=${n} ${wrapArg(v.text)}`;
    }
    case '/sys':
    case '/comment':
    case '/send':
      return `${block.cmd} ${wrapArg(v.text || '{{pipe}}')}`;
    case '/echo': {
      const sev = v.severity && v.severity !== 'info' ? ` severity=${v.severity}` : '';
      return `/echo${sev} ${wrapArg(v.text || '{{pipe}}')}`;
    }
    case '/input': {
      let opts = '';
      if (v.rows && v.rows !== '1') opts += ` rows=${v.rows}`;
      if (v.large) opts += ' large=on';
      if (v.wide) opts += ' wide=on';
      return `/input${opts} ${wrapArg(v.prompt)}`;
    }
    case '/popup': {
      let opts = '';
      if (v.large) opts += ' large=on';
      if (v.wide) opts += ' wide=on';
      if (v.okButton) opts += ` okButton="${v.okButton}"`;
      return `/popup${opts} ${wrapArg(v.text)}`;
    }
    case '/buttons':
      return `/buttons labels=${v.labels || '["A","B"]'} ${wrapArg(v.text)}`;
    case '/setinput':
      return `/setinput ${wrapArg(v.text || '{{pipe}}')}`;
    case '/setvar': {
      const idx = v.index ? ` index=${v.index}` : '';
      return `/setvar key=${v.key || 'name'}${idx} ${wrapArg(v.value || '{{pipe}}')}`;
    }
    case '/getvar': {
      const idx = v.index ? ` index=${v.index}` : '';
      return `/getvar${idx} ${wrapArg(v.name)}`;
    }
    case '/setglobalvar':
      return `/setglobalvar key=${v.key || 'name'} ${wrapArg(v.value)}`;
    case '/getglobalvar':
      return `/getglobalvar ${wrapArg(v.name)}`;
    case '/let':
      return `/let ${wrapArg(v.name || 'x')} ${wrapArg(v.value || '0')}`;
    case '/addvar':
      return `/addvar key=${v.key || 'name'} ${wrapArg(v.value || '1')}`;
    case '/incvar':
      return `/incvar ${wrapArg(v.name)}`;
    case '/flushvar':
      return `/flushvar ${wrapArg(v.name)}`;
    case '/del':
      return `/del ${v.count || '1'}`;
    case '/cut':
    case '/hide':
    case '/unhide':
      return `${block.cmd} ${v.range || ''}`;
    case '/messages': {
      const n = v.names ? ` names=${v.names}` : '';
      return `/messages${n} ${v.range || '0-{{lastMessageId}}'}`;
    }
    case '/if': {
      const l = wrapArg(v.left || '{{pipe}}');
      const r = wrapArg(v.right || '');
      const rule = v.rule || 'eq';
      const then = v.then || '';
      const el = v.else ? ` else={: ${v.else} :}` : '';
      return `/if left=${l} rule=${rule} right=${r}\n    {: ${then} :}${el}`;
    }
    case '/times':
      return `/times ${v.count || '5'} {: ${v.body || ''} :}`;
    case '/while': {
      const l = wrapArg(v.left || '{{pipe}}');
      const r = wrapArg(v.right || '');
      const rule = v.rule || 'lt';
      return `/while left=${l} rule=${rule} right=${r}\n    {: ${v.body || ''} :}`;
    }
    case '/delay':
      return `/delay ${v.ms || '1000'}`;
    case '/trimtokens': {
      const dir = v.direction ? ` direction=${v.direction}` : '';
      return `/trimtokens limit=${v.limit || '3000'}${dir} ${wrapArg(v.text || '{{pipe}}')}`;
    }
    case '/trimstart':
    case '/trimend':
      return `${block.cmd} ${wrapArg(v.text || '{{pipe}}')}`;
    case '/add':
    case '/sub':
    case '/mul':
      return `${block.cmd} ${v.a || '0'} ${v.b || '0'}`;
    case '/rand':
      return `/rand ${v.min || '1'} ${v.max || '100'}`;
    default:
      return block.cmd;
  }
}

/**
 * Parse a raw STscript string into visual block objects.
 * Handles pipe chaining and basic closure awareness.
 */
export function parseScript(scriptText) {
  if (!scriptText || !scriptText.trim()) return [];

  const segments = splitPipes(scriptText.trim());
  const blocks = [];

  for (const seg of segments) {
    const block = parseSegment(seg.trim());
    if (block) {
      blocks.push({ ...block, id: uid() });
    }
  }

  return blocks;
}

/**
 * Split on | but respect closure boundaries {: :}
 */
function splitPipes(text) {
  const segments = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '{' && next === ':') {
      depth++;
      current += '{:';
      i++;
    } else if (ch === ':' && next === '}') {
      depth--;
      current += ':}';
      i++;
    } else if (ch === '|' && depth === 0) {
      segments.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim()) segments.push(current.trim());
  return segments;
}

/**
 * Parse a single command segment into a block object
 */
function parseSegment(segment) {
  const cmdMatch = segment.match(/^(\/\w+)/);
  if (!cmdMatch) return null;

  const cmd = cmdMatch[1];
  const rest = segment.slice(cmd.length).trim();

  // Find the command definition
  let cmdDef = null;
  let category = null;

  for (const [cat, cmds] of Object.entries(COMMANDS)) {
    const found = cmds.find(c => c.cmd === cmd);
    if (found) {
      cmdDef = found;
      category = cat;
      break;
    }
  }

  if (!cmdDef) {
    // Unknown command — create a generic block
    return {
      cmd,
      label: cmd.slice(1),
      desc: 'Unknown command',
      args: [{ key: 'text', type: 'text', placeholder: 'Arguments...' }],
      opts: [],
      values: { text: rest },
      category: 'System',
    };
  }

  // Parse named args and positional content from `rest`
  const values = parseArgs(rest, cmdDef);

  return {
    ...cmdDef,
    values,
    category,
  };
}

/**
 * Extract named arguments and positional text from a command's argument string
 */
function parseArgs(argString, cmdDef) {
  const values = {};

  if (!argString) return values;

  let remaining = argString;

  // Extract toggle-like options: lock=on, large=on, wide=on
  const togglePattern = /\b(lock|large|wide)=on\b/g;
  let toggleMatch;
  while ((toggleMatch = togglePattern.exec(remaining)) !== null) {
    values[toggleMatch[1]] = true;
  }
  remaining = remaining.replace(togglePattern, '').trim();

  // Extract named args: key=value (handles quoted values)
  const namedPattern = /\b(\w+)=(?:"([^"]*?)"|(\S+))/g;
  let namedMatch;
  while ((namedMatch = namedPattern.exec(remaining)) !== null) {
    const key = namedMatch[1];
    const val = namedMatch[2] !== undefined ? namedMatch[2] : namedMatch[3];

    // Skip toggle values already captured
    if (val === 'on' && (key === 'lock' || key === 'large' || key === 'wide')) continue;

    values[key] = val;
  }
  remaining = remaining.replace(namedPattern, '').trim();

  // Extract severity separately (for /echo)
  const sevMatch = remaining.match(/\bseverity=(\w+)/);
  if (sevMatch) {
    values.severity = sevMatch[1];
    remaining = remaining.replace(sevMatch[0], '').trim();
  }

  // Extract closures: {: ... :}
  const closureMatch = remaining.match(/\{:\s*([\s\S]*?)\s*:\}/);
  if (closureMatch) {
    // Determine which closure field this is (then, body, etc.)
    const closureArgs = cmdDef.args.filter(a => a.type === 'closure');
    if (closureArgs.length > 0) {
      values[closureArgs[0].key] = closureMatch[1].trim();
    }

    // Check for else closure
    const afterClosure = remaining.slice(remaining.indexOf(closureMatch[0]) + closureMatch[0].length).trim();
    const elseMatch = afterClosure.match(/else=\{:\s*([\s\S]*?)\s*:\}/);
    if (elseMatch) {
      values['else'] = elseMatch[1].trim();
      remaining = remaining.replace(elseMatch[0], '');
    }

    remaining = remaining.replace(closureMatch[0], '').trim();
  }

  // Whatever's left is the positional argument
  remaining = remaining.trim();
  if (remaining) {
    // Find the first text-type arg in the definition
    const textArg = cmdDef.args.find(a => a.type === 'text' && !values[a.key]);
    if (textArg) {
      let cleanVal = remaining;
      if (cleanVal.startsWith('(') && cleanVal.endsWith(')')) {
        cleanVal = cleanVal.slice(1, -1).trim();
      } else if (cleanVal.startsWith('[') && cleanVal.endsWith(']')) {
        cleanVal = cleanVal.slice(1, -1).trim();
      }
      values[textArg.key] = cleanVal;
    }
  }

  return values;
}

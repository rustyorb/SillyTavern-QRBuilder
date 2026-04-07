# SillyTavern-QRBuilder

```
 ██████╗ ██████╗     ██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗██████╗
██╔═══██╗██╔══██╗    ██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝██╔══██╗
██║   ██║██████╔╝    ██████╔╝██║   ██║██║██║     ██║  ██║█████╗  ██████╔╝
██║▄▄ ██║██╔══██╗    ██╔══██╗██║   ██║██║██║     ██║  ██║██╔══╝  ██╔══██╗
╚██████╔╝██║  ██║    ██████╔╝╚██████╔╝██║███████╗██████╔╝███████╗██║  ██║
 ╚══▀▀═╝ ╚═╝  ╚═╝    ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝

  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
  █ AI-powered STscript Quick Reply builder for SillyTavern █
  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

> *Describe it. Generate it. Paste it. Done.*

---

## What

A native SillyTavern extension that gives you a full-screen, three-panel workspace for building STscript Quick Reply scripts — either by describing what you want in plain English (AI generates it), or by clicking commands together visually.

No separate tab. No copy-paste between windows. It lives inside ST, opens with a click, closes when you're done.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│  QRB  STscript QR Builder    📋 Templates  ✕ Clear  ⚙ Settings  ✕ │
├──────────┬──────────────────────────────┬────────────────────────────┤
│          │   ⚡ AI  │  🔧 Builder        │  Output                    │
│ Commands │          ▼                    │                            │
│          │  ┌─────────────────────────┐ │  Label: [📋 Summary      ] │
│ Generation│  │ describe what you want  │ │                            │
│  /gen    │  │ the button to do...     │ │  /messages 0-{{lastMsgId}} │
│  /genraw │  │                         │ │  | /trimtokens limit=3000  │
│  /continue│  │  [AI streams response]  │ │  | /genraw lock=on [...]   │
│  ...     │  │                         │ │  | /sys {{pipe}}            │
│          │  │  ```stscript            │ │                            │
│ Input/IO │  │  /messages 0-{{last..}} │ │  Trigger: [None         ▾] │
│  /sendas │  │  | /genraw lock=on...   │ │                            │
│  /sys    │  │  ```                    │ │  Blocks  Pipes  Chars      │
│  /echo   │  │  [Copy] [Apply →]       │ │    4       3      187      │
│  ...     │  └─────────────────────────┘ │                            │
│          │                              │  [📋 Copy Script]          │
│ Variables│  [  Describe button task...▲]│                            │
│ Chat     │                              │                            │
│ Flow     │                              │                            │
│ Text     │                              │                            │
│ Math     │                              │                            │
└──────────┴──────────────────────────────┴────────────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| **AI Generation** | Describe in plain English → streaming STscript output |
| **Visual Builder** | Click-to-add command blocks, inline field editing |
| **Script Parser** | Paste any raw STscript → auto-converts to blocks |
| **Templates** | 6 pre-built scripts (Summary, Plot Twist, Save & Delete, Turn Counter, Dice Roll, User Prompt) |
| **OpenRouter** | Model-agnostic — use any LLM OpenRouter supports |
| **Persistent Settings** | API key + model stored in ST's extension_settings |
| **Full-Screen Panel** | Opens over ST with backdrop, closes cleanly |
| **ST Native** | No separate tab or server required |

---

## Installation

### Option A: Clone into third-party

```bash
cd SillyTavern/public/scripts/extensions/third-party
git clone https://github.com/rustyorb/SillyTavern-QRBuilder
cd SillyTavern-QRBuilder
npm install
npm run build
```

### Option B: ST Extension Manager

Install URL: `https://github.com/rustyorb/SillyTavern-QRBuilder`

---

## Usage

1. Click the **`</>`** icon in ST's left navigation panel
2. Or open **Extensions → QR Builder → Open QR Builder**
3. Hit **⚙ Setup** → enter your [OpenRouter API key](https://openrouter.ai/keys) → select a model
4. **AI tab**: describe what you want → AI generates → click **Apply →**
5. **Builder tab**: fine-tune blocks, reorder, edit fields
6. Set a **Label**, choose a **Trigger**, click **📋 Copy Script**
7. Paste into SillyTavern's Quick Reply extension

---

## STscript Reference Quick Card

```
# Chaining
/cmd1 | /cmd2 | /cmd3        — pipe output between commands
{{pipe}}                      — access previous command's output

# Generation
/gen lock=on [prompt]         — full context gen (blocks input)
/genraw lock=on [prompt]      — raw gen, no character context
/continue                     — extend last AI message

# I/O
/echo severity=success [text] — toast notification
/input [prompt]               — ask user, pipe their answer
/popup large=on [text]        — blocking popup
/sendas name={{char}} [text]  — speak as character

# Variables
/setvar key=name [value]      — store local variable
/getvar name                  — retrieve to pipe
{{getvar::name}}              — inline macro

# Flow
/if left={{pipe}} rule=eq right=5 {: /echo Match :}
/times 5 {: /echo {{timesIndex}} :}
/delay 1000                   — wait 1 second

# Chat
/messages 0-{{lastMessageId}} — get all messages
/del 1                        — delete last message
/sys [text]                   — narrator message
```

---

## Config

Settings are stored in SillyTavern's `extension_settings.QRBuilder`:

```json
{
  "enabled": true,
  "apiKey": "sk-or-...",
  "model": "anthropic/claude-3-haiku"
}
```

---

## Development

```bash
# Watch mode (auto-rebuild on save)
npm run dev

# Production build
npm run build
```

Built on the official [SillyTavern React Extension Template](https://github.com/SillyTavern/Extension-ReactTemplate).  
Stack: React 18 + Webpack + Babel → single `dist/index.js` bundle.

---

## Author

**RüstyÖrb** — [@rustyorb](https://github.com/rustyorb)

---

*Built because the QR editor in ST deserved better.*

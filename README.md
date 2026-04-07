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

A native SillyTavern extension — a full-screen, three-panel workspace for building STscript Quick Reply scripts.

Describe what you want in plain English and the AI writes it. Or click commands together visually. Uses **whatever model you already have connected in SillyTavern** — no API keys, no second configuration, no separate accounts.

You're already set up. Just open it and go.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│  QRB  STscript QR Builder         📋 Templates   ✕ Clear        ✕  │
├──────────┬──────────────────────────────┬────────────────────────────┤
│          │   ⚡ AI  │  🔧 Builder        │  Output                    │
│ Commands │          ▼                    │                            │
│          │  ┌─────────────────────────┐ │  Label: [📝 Summary      ] │
│ Generation│ │ using connected model   │ │                            │
│  /gen    │  │ (no config needed)      │ │  /messages 0-{{lastMsgId}} │
│  /genraw │  │                         │ │  | /trimtokens limit=3000  │
│  /continue│ │  describe what you want │ │  | /genraw lock=on [...]   │
│  ...     │  │  the button to do...    │ │  | /sys {{pipe}}            │
│          │  │                         │ │                            │
│ Input/IO │  │  [streams response]     │ │  Trigger: [None         ▾] │
│  /sendas │  │                         │ │                            │
│  /sys    │  │  ```stscript            │ │  Blocks  Pipes  Chars      │
│  /echo   │  │  /messages 0-{{last..}} │ │    4       3      187      │
│  ...     │  │  | /genraw lock=on...   │ │                            │
│          │  │  ```                    │ │  [📋 Copy Script]          │
│ Variables│  │  [Copy] [Apply →]       │ │                            │
│ Chat     │  └─────────────────────────┘ │                            │
│ Flow     │  [  Describe it...        ▲] │                            │
│ Text     │                              │                            │
│ Math     │                              │                            │
└──────────┴──────────────────────────────┴────────────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Zero config** | Uses your already-connected ST model. Open and go. |
| **AI Generation** | Describe in plain English → STscript output |
| **Visual Builder** | Click-to-add command blocks, inline field editing |
| **Script Parser** | Paste any raw STscript → auto-converts to blocks |
| **Templates** | 6 pre-built scripts ready to customize |
| **Full-Screen Panel** | Opens over ST, closes cleanly — no new tabs |
| **ST Native** | Uses `generateQuietPrompt` from ST's official extension API |

---

## Installation

### Option A: ST Extension Manager (recommended)

In SillyTavern → Extensions → Install Extension:
```
https://github.com/rustyorb/SillyTavern-QRBuilder
```

### Option B: Clone and build

```bash
cd SillyTavern/public/scripts/extensions/third-party
git clone https://github.com/rustyorb/SillyTavern-QRBuilder
cd SillyTavern-QRBuilder
npm install
npm run build
```

---

## Usage

1. Click the **`</>`** icon in ST's left navigation bar  
   *(or Extensions → QR Builder → Open QR Builder)*
2. **That's it** — the AI uses whatever model you already have connected
3. Describe what you want → AI generates → **Apply →** to load blocks
4. Fine-tune in the **Builder** tab
5. Set a **Label**, optionally pick a **Trigger**, hit **📋 Copy Script**
6. Paste into SillyTavern's Quick Reply extension

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

## Templates Included

| Template | What it does |
|----------|-------------|
| 📝 Chat Summary | Grab all messages → trim → AI summarizes → narrator post |
| 🌀 Plot Twist | Generate a dramatic story event for {{char}} |
| 💾 Save & Delete | Save last message to a variable, delete it |
| 🔢 Turn Counter | Track turns, trigger an event every 5 |
| 🎲 Dice Roll | Roll d20, echo the result as a toast |
| 💬 User Prompt | Ask user what happens next → generate response |

---

## How AI Generation Works

This extension uses [`generateQuietPrompt`](https://docs.sillytavern.app/for-contributors/writing-extensions/) from SillyTavern's official extension API. It calls your currently connected model silently in the background — the same connection you use for everything else in ST.

```
Your ST connection (OpenAI / Claude / local / any)
         ↓
generateQuietPrompt(prompt)    ← official ST extension API
         ↓
STscript Quick Reply script
```

**No OpenRouter account. No API keys. No separate model selection.** If ST is talking to a model, so is QR Builder.

---

## Development

```bash
# Watch mode — auto-rebuild on save
npm run dev

# Production build
npm run build
```

Built on the official [SillyTavern Extension-ReactTemplate](https://github.com/SillyTavern/Extension-ReactTemplate).  
Stack: React 18 + Webpack 5 (ES module output) + Babel → `dist/index.js`.  
ST API reference: [docs.sillytavern.app/for-contributors/writing-extensions](https://docs.sillytavern.app/for-contributors/writing-extensions/)

---

## Author

**RüstyÖrb** — [@rustyorb](https://github.com/rustyorb)

---

*Built because the QR editor in ST deserved better.*

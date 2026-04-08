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

> 🔮 *Describe it. Generate it. Paste it. Done.*

---

## 🎯 What is this?

A native SillyTavern extension — a **full-screen**, **three-panel** workspace for building STscript Quick Reply scripts effortlessly.

Describe what you want in plain English and the AI writes it. Or click commands together visually. Uses **whatever model you already have connected in SillyTavern** — no API keys, no second configuration, no separate accounts.

You're already set up. Just open it and go! 🚀

---

## 🏗️ How It Works

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

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔌 **Zero config** | Uses your already-connected ST model. Open and go. |
| ⚡ **AI Generation** | Describe in plain English → perfectly formatted STscript comes out. |
| 🧩 **Visual Builder** | Click-to-add command blocks, inline field editing. |
| 📜 **Script Parser** | Paste any raw STscript and it auto-converts into visual blocks. |
| 📚 **Templates** | 6 pre-built scripts ready to customize and deploy. |
| 🖥️ **Full-Screen Panel** | Opens cleanly over ST, closes smoothly — no new tabs required. |
| 🛠️ **ST Native** | Hooks into the system natively via ST's official extension API. |

---

## 📦 Installation

> [!TIP]
> The extension comes pre-built. It requires no terminal commands or NPM installs on your end.

### The Easy Way (ST Extension Manager)
In SillyTavern → Extensions → Install Extension, paste this URL:
```
https://github.com/rustyorb/SillyTavern-QRBuilder
```

---

## 🕹️ Usage

1. Click the **`</>`** icon in ST's left navigation bar  
   *(or navigate to Extensions → QR Builder → Open QR Builder)*
2. 🤖 **AI tab** — describe what you want the button to do, press ↑. The AI generates the script and it auto-applies to the builder!
3. 🔧 Optionally fine-tune your blocks in the **Builder** tab.
4. 📤 In the **Output** panel on the right:
   - Set a **Label** (button text)
   - Pick an **Auto-Execute Trigger** if you want it to fire automatically
   - Select the **Target QR Set** from the dropdown
   - Hit **⚡ Save to Quick Replies**

That's it. The script is injected directly into your QR set — no copy, no paste, no switching panels.

---

## 📖 STscript Reference Quick Card

```stscript
# 🔗 Chaining
/cmd1 | /cmd2 | /cmd3        — pipe output between commands
{{pipe}}                      — access previous command's output

# 🧠 Generation
/gen lock=on [prompt]         — full context gen (blocks input)
/genraw lock=on [prompt]      — raw gen, no character context
/continue                     — extend last AI message

# 🗣️ I/O
/echo severity=success [text] — toast notification
/input [prompt]               — ask user, pipe their answer
/popup large=on [text]        — blocking popup
/sendas name={{char}} [text]  — speak as character

# 🗃️ Variables
/setvar key=name [value]      — store local variable
{{getvar::name}}              — inline macro

# 🛤️ Flow
/if left={{pipe}} rule=eq right=5 {: /echo Match :}
/times 5 {: /echo {{timesIndex}} :}
/delay 1000                   — wait 1 second

# 💬 Chat
/messages 0-{{lastMessageId}} — get all messages
/del 1                        — delete last message
/sys [text]                   — narrator message
```

---

## 🏷️ Templates Included

| Template | What it does |
|----------|-------------|
| 📝 **Chat Summary** | Grab all messages → trim → AI summarizes → narrator post |
| 🌀 **Plot Twist** | Generate a dramatic story event for {{char}} |
| 💾 **Save & Delete** | Save last message to a variable, delete it |
| 🔢 **Turn Counter** | Track turns, trigger an event every 5 |
| 🎲 **Dice Roll** | Roll d20, echo the result as a toast |
| 💬 **User Prompt** | Ask user what happens next → generate response |

---

## 🧠 How AI Generation Works

> [!NOTE]
> **No OpenRouter accounts. No API keys. No separate model selections.**

This extension interfaces via `generateQuietPrompt` from SillyTavern's official extension API. It calls your currently connected model silently in the background — the exact same active connection you use for everything else in ST.

```
Your ST connection (OpenAI / Claude / local / any)
         ↓
generateQuietPrompt(prompt)    ← official ST internal API
         ↓
STscript Quick Reply script
```

If your ST is talking to a model, QR Builder is talking to a model. Simple.

---

## 💻 Development

Want to fork or modify the builder?

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

## 👨‍💻 Author

**RüstyÖrb** — [@rustyorb](https://github.com/rustyorb)

---

*Built because the QR editor in ST deserved better.* ✨

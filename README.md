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

A native [SillyTavern](https://github.com/SillyTavern/SillyTavern) extension that gives you a **full-screen, three-panel** workspace for building STscript Quick Reply scripts — describe what you want in plain English and the AI writes it, or click commands together visually. It uses **whatever model you already have connected in SillyTavern**, so there's no separate API key or account to set up.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔌 **Zero config** | Uses your already-connected ST model via `generateQuietPrompt`. Open and go. |
| ⚡ **AI Generation** | Describe in plain English → a formatted STscript comes out, streamed live. |
| 🧩 **Visual Builder** | Click-to-add command blocks with inline field editing, drag-free reordering. |
| 📜 **Script Parser** | Paste any raw STscript and it auto-converts into visual blocks. |
| 📚 **Templates** | 6 pre-built scripts ready to customize and deploy. |
| 🖥️ **Full-Screen Panel** | Opens cleanly over ST, closes smoothly — no new tabs required. |
| ⚡ **Direct QR Save** | Saves the finished script straight into a Quick Reply set via the QR extension's API. |
| 🛠️ **ST Native** | Hooks into SillyTavern via its official extension API (`importFromUrl`, `SillyTavern.getContext()`). |

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

## 🧱 Tech Stack

| Layer | Choice |
|-------|--------|
| UI | React 18 (`react`, `react-dom`) |
| Bundler | Webpack 5, ES module output (`experiments.outputModule`) so ST can `import()` it directly |
| Transpilation | Babel (`@babel/preset-env`, `@babel/preset-react` with the automatic JSX runtime) |
| Styling | Plain CSS, extracted via `mini-css-extract-plugin` into `dist/style.css` |
| Minification | `terser-webpack-plugin` |
| Host platform | [SillyTavern](https://github.com/SillyTavern/SillyTavern) extension API (`SillyTavern.getContext()`, `importFromUrl`) |

Scaffolded from the official [SillyTavern Extension-ReactTemplate](https://github.com/SillyTavern/Extension-ReactTemplate).

---

## 📦 Installation

> [!TIP]
> The extension ships pre-built (`dist/` is committed). No terminal commands or npm installs are required to use it.

### The Easy Way (ST Extension Manager)
In SillyTavern → Extensions → Install Extension, paste this URL:
```
https://github.com/rustyorb/SillyTavern-QRBuilder
```

### Manual Install
Clone this repo into your SillyTavern `public/scripts/extensions/third-party/` directory, then reload SillyTavern.

> [!NOTE]
> Saving scripts directly into a Quick Reply set requires the built-in **Quick Reply** extension to be enabled in ST — QR Builder calls its `window.quickReplyApi` to write the script. You can still copy the generated script manually if that extension is disabled.

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

### STscript Reference Quick Card

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

The AI tab embeds this same reference in its system prompt (`src/lib/ai.js`) so generated scripts stay within the supported command set.

### Templates Included

| Template | What it does |
|----------|-------------|
| 📝 **Chat Summary** | Grab all messages → trim → AI summarizes → narrator post |
| 🌀 **Plot Twist** | Generate a dramatic story event for {{char}} |
| 💾 **Save & Delete** | Save last message to a variable, delete it |
| 🔢 **Turn Counter** | Track turns, trigger an event every 5 |
| 🎲 **Dice Roll** | Roll d20, echo the result as a toast |
| 💬 **User Prompt** | Ask user what happens next → generate response |

### How AI Generation Works

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

If your ST is talking to a model, QR Builder is talking to a model. Simple. If `generateQuietPrompt` can't be imported (e.g. an ST internal API change), the AI tab is disabled with an explanatory message instead of failing silently.

---

## ⚙️ Configuration

There is no separate settings file or API key to configure. On first load the extension writes a small block to SillyTavern's own `extensionSettings` under the `QRBuilder` key (currently just an `enabled` flag), managed automatically via `saveSettingsDebounced()`. A **QR Builder** entry also appears in ST's Extensions settings drawer with a button to open the panel.

---

## 📁 Project Structure

```
.
├── manifest.json           # ST extension manifest (entry points, metadata)
├── webpack.config.js       # Webpack 5 config — ES module output for ST's import()
├── src/
│   ├── index.js             # Extension entry point: mounts the React panel, wires up ST hooks
│   ├── App.js                # Root React component — tab/panel layout and state
│   ├── style.css             # Panel styling
│   ├── components/
│   │   ├── AIChat.js          # AI tab — prompt input, streaming response, apply-to-builder
│   │   ├── Builder.js         # Visual block editor
│   │   ├── CommandPalette.js  # Left-hand command list, grouped by category
│   │   └── OutputPanel.js     # Right-hand panel — label, trigger, QR set save
│   ├── data/
│   │   ├── commands.js        # STscript command definitions (args, options, categories)
│   │   └── templates.js       # The 6 built-in templates
│   └── lib/
│       ├── ai.js               # Embedded STscript reference + AI prompt construction
│       ├── parser.js           # Converts blocks ↔ raw STscript strings
│       └── stImport.js         # `importFromUrl` helper for pulling ST internals at runtime
└── dist/                    # Pre-built, committed output (index.js + style.css) — what ST actually loads
```

---

## 💻 Development

Want to fork or modify the builder?

```bash
# Install dependencies
npm install

# Watch mode — auto-rebuild on save
npm run dev

# Production build
npm run build
```

Both scripts run Webpack against `src/index.js` and emit `dist/index.js` + `dist/style.css`, which is what `manifest.json` points SillyTavern at. Rebuild and commit `dist/` before publishing a change — the repo ships the compiled output directly rather than requiring consumers to build it.

ST API reference: [docs.sillytavern.app/for-contributors/writing-extensions](https://docs.sillytavern.app/for-contributors/writing-extensions/)

## 🧪 Testing

There is no automated test suite in this repository. Changes are verified manually by loading the built extension in a running SillyTavern instance and exercising the AI tab, Builder tab, templates, and QR save flow.

---

## 👨‍💻 Author

**RüstyÖrb** — [@rustyorb](https://github.com/rustyorb)

---

*Built because the QR editor in ST deserved better.* ✨

/**
 * ST QR Builder — Extension Entry Point
 *
 * Uses the official ST extension API patterns from:
 * https://docs.sillytavern.app/for-contributors/writing-extensions/
 *
 * Key decisions:
 * - All ST imports via importFromUrl (webpackIgnore) per docs
 * - extensionSettings + saveSettingsDebounced from SillyTavern.getContext()
 * - generateQuietPrompt for AI generation — uses ST's already-configured connection
 * - No separate API key or model config required
 */

import { importFromUrl } from './lib/stImport.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './style.css';

const EXTENSION_NAME = 'QRBuilder';

// Grab ST runtime functions via the official webpackIgnore pattern
const generateQuietPrompt = await importFromUrl('/script.js', 'generateQuietPrompt');

// All state/settings come from the ST global — no separate imports needed
function getSTContext() {
    return SillyTavern.getContext();
}

function loadSettings() {
    const { extensionSettings } = getSTContext();
    if (!extensionSettings[EXTENSION_NAME]) {
        extensionSettings[EXTENSION_NAME] = {};
    }
    const defaults = { enabled: true };
    for (const [k, v] of Object.entries(defaults)) {
        if (extensionSettings[EXTENSION_NAME][k] === undefined) {
            extensionSettings[EXTENSION_NAME][k] = v;
        }
    }
}

// React root — mounted once, kept alive across open/close
let reactRoot = null;

function createPanel() {
    if (document.getElementById('qrb-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'qrb-overlay';

    const panel = document.createElement('div');
    panel.id = 'qrb-panel';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    if (!reactRoot) {
        reactRoot = ReactDOM.createRoot(panel);
    }

    reactRoot.render(
        <React.StrictMode>
            <App
                generateQuietPrompt={generateQuietPrompt}
                onClose={closePanel}
            />
        </React.StrictMode>
    );

    overlay.addEventListener('click', closePanel);
    panel.addEventListener('click', e => e.stopPropagation());

    // Block ST pointer events while panel is open (BotBrowser pattern)
    document.body.style.pointerEvents = 'none';
    overlay.style.pointerEvents = 'all';
    panel.style.pointerEvents = 'all';

    console.log('[QRBuilder] Panel opened');
}

function closePanel() {
    const overlay = document.getElementById('qrb-overlay');
    const panel = document.getElementById('qrb-panel');
    if (!overlay || !panel) return;

    overlay.classList.add('qrb-closing');
    panel.classList.add('qrb-closing');

    setTimeout(() => {
        if (reactRoot) { reactRoot.render(null); reactRoot = null; }
        overlay.remove();
        panel.remove();
        document.body.style.pointerEvents = '';
        console.log('[QRBuilder] Panel closed');
    }, 200);
}

function addToolbarButton() {
    if (document.getElementById('qrb-toolbar-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'qrb-toolbar-btn';
    btn.className = 'menu_button fa-solid fa-code';
    btn.title = 'QR Script Builder';
    btn.setAttribute('data-i18n', '[title]QR Script Builder');

    btn.addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('qrb-panel') ? closePanel() : createPanel();
    });

    // Insert after group chats button (same slot as BotBrowser)
    const anchor = document.getElementById('rm_button_group_chats');
    if (anchor) anchor.after(btn);
    else document.getElementById('left-nav-panel')?.appendChild(btn);

    console.log('[QRBuilder] Toolbar button added');
}

// Settings drawer entry (in Extensions panel)
function injectSettingsUI() {
    const html = `
        <div class="qrb-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>QR Builder</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <p style="color:#888;font-size:0.85em;margin:0 0 10px;">
                        AI-powered STscript Quick Reply builder.<br>
                        Uses your currently connected model — no separate API key needed.
                    </p>
                    <button id="qrb-open-btn" class="menu_button" style="width:100%;margin-top:5px;">
                        <i class="fa-solid fa-code"></i> Open QR Builder
                    </button>
                </div>
            </div>
        </div>
    `;
    $('#extensions_settings').append(html);
    $(document).on('click', '#qrb-open-btn', () => {
        document.getElementById('qrb-panel') ? closePanel() : createPanel();
    });
}

// Initialize — using jQuery ready per ST convention
jQuery(async () => {
    console.log('[QRBuilder] Loading...');
    loadSettings();
    injectSettingsUI();
    addToolbarButton();

    // Listen for events via getContext() per docs
    const { eventSource, event_types } = getSTContext();
    eventSource.on(event_types.CHAT_CHANGED, () => {
        console.log('[QRBuilder] Chat changed');
    });

    console.log('[QRBuilder] Ready. Uses connected model via generateQuietPrompt.');
});

/* global SillyTavern */
import { extension_settings } from '/scripts/extensions.js';
import { eventSource, event_types, saveSettingsDebounced } from '/script.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './style.css';

const EXTENSION_NAME = 'QRBuilder';

// Initialize extension settings
function loadSettings() {
    if (!extension_settings[EXTENSION_NAME]) {
        extension_settings[EXTENSION_NAME] = {};
    }
    const defaults = {
        enabled: true,
        apiKey: '',
        model: '',
    };
    for (const [k, v] of Object.entries(defaults)) {
        if (extension_settings[EXTENSION_NAME][k] === undefined) {
            extension_settings[EXTENSION_NAME][k] = v;
        }
    }
}

// React root — mounted once, kept alive
let reactRoot = null;

function createPanel() {
    if (document.getElementById('qrb-overlay')) return;

    // Backdrop
    const overlay = document.createElement('div');
    overlay.id = 'qrb-overlay';
    overlay.style.cssText = 'position:fixed !important;inset:0 !important;z-index:9000 !important;background:rgba(0,0,0,0.75);animation:qrb-fadeIn 0.2s ease forwards;';

    // Panel
    const panel = document.createElement('div');
    panel.id = 'qrb-panel';
    panel.style.cssText = `
        position: fixed !important;
        top: 50vh !important;
        left: 50vw !important;
        transform: translate(-50%, -50%);
        z-index: 9001 !important;
        width: 96vw;
        max-width: 1400px;
        height: 90vh;
        background: #0a0a14;
        border-radius: 12px;
        border: 1px solid rgba(99,102,241,0.3);
        box-shadow: 0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1);
        overflow: hidden;
        animation: qrb-slideUp 0.25s cubic-bezier(0.22,1,0.36,1) forwards;
        display: flex;
        flex-direction: column;
        pointer-events: all !important;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    // Mount React into the panel
    if (!reactRoot) {
        reactRoot = ReactDOM.createRoot(panel);
    }

    const settings = extension_settings[EXTENSION_NAME];
    reactRoot.render(
        <React.StrictMode>
            <App
                initialApiKey={settings.apiKey || ''}
                initialModel={settings.model || ''}
                onClose={closePanel}
                onSettingsSave={(apiKey, model) => {
                    extension_settings[EXTENSION_NAME].apiKey = apiKey;
                    extension_settings[EXTENSION_NAME].model = model;
                    saveSettingsDebounced();
                }}
            />
        </React.StrictMode>
    );

    // Click backdrop to close
    overlay.addEventListener('click', closePanel);
    panel.addEventListener('click', (e) => e.stopPropagation());

    // Block ST pointer events while open
    document.body.style.pointerEvents = 'none';
    overlay.style.pointerEvents = 'all';
    panel.style.pointerEvents = 'all';

    console.log('[QRBuilder] Panel opened');
}

function closePanel() {
    const overlay = document.getElementById('qrb-overlay');
    const panel = document.getElementById('qrb-panel');

    if (!overlay || !panel) return;

    overlay.style.animation = 'qrb-fadeOut 0.18s ease forwards';
    panel.style.animation = 'qrb-slideDown 0.18s ease forwards';

    setTimeout(() => {
        reactRoot && reactRoot.render(null);
        reactRoot = null;
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

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.getElementById('qrb-panel')) {
            closePanel();
        } else {
            createPanel();
        }
    });

    // Insert after character search button (same as BotBrowser pattern)
    const anchor = document.getElementById('rm_button_group_chats');
    if (anchor) {
        anchor.after(btn);
    } else {
        document.getElementById('left-nav-panel')?.appendChild(btn);
    }

    console.log('[QRBuilder] Toolbar button added');
}

// Build the settings panel HTML (shown in Extensions drawer)
function getSettingsHtml() {
    return `
        <div class="qrb-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>QR Builder</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <p style="color:#999;font-size:0.85em;margin:0 0 10px;">AI-powered STscript Quick Reply builder.</p>
                    <button id="qrb-open-btn" class="menu_button" style="width:100%;margin-top:5px;">
                        <i class="fa-solid fa-code"></i> Open QR Builder
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Initialize extension
jQuery(async () => {
    console.log('[QRBuilder] Loading...');
    loadSettings();

    // Inject settings panel
    const settingsHtml = getSettingsHtml();
    $('#extensions_settings').append(settingsHtml);

    // Button in settings panel
    $(document).on('click', '#qrb-open-btn', () => {
        if (document.getElementById('qrb-panel')) {
            closePanel();
        } else {
            createPanel();
        }
    });

    // Toolbar button
    addToolbarButton();

    console.log('[QRBuilder] Loaded!');

    eventSource.on(event_types.CHAT_CHANGED, () => {
        console.log('[QRBuilder] Chat changed');
    });
});

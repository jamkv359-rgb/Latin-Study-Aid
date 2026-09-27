const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: light)').matches;

/* ============================================================
   THEME SYSTEM (light / dark / ancient-rome)
   Single source of truth for every page - the sidebar's theme button
   (built in initSidebar() below) cycles through THEME_CYCLE_ORDER, and
   applyTheme() is what actually flips the body class, persists the
   choice, and fires each theme's "used this theme" achievement flag.
   A page's own <style> block supplies the actual `body.dark{}` /
   `body.ancient-rome{}` variable overrides - this just decides which
   class (if any) is on <body>.
============================================================ */
const THEME_CLASS_LIST = ['dark', 'ancient-rome'];
const THEME_CYCLE_ORDER = ['light', 'dark', 'ancient-rome'];
const THEME_META = {
    light: { icon: '☀️', label: 'Light mode' },
    dark: { icon: '🌙', label: 'Dark mode' },
    'ancient-rome': { icon: '🏛️', label: 'Ancient Rome mode' }
};

function getSavedTheme() {
    const currentTheme = localStorage.getItem('theme');
    if (THEME_CYCLE_ORDER.includes(currentTheme)) return currentTheme;
    return systemPrefersDark ? 'dark' : 'light';
}

/* ============================================================
   THEME SETTINGS (per-theme user customisation, see index.html's
   "Theme Settings" panel)
   Stored once in localStorage.themeSettings as:
     { light: {...}, dark: {...}, 'ancient-rome': {...}, ... }
   Each theme's object may hold any of: bg, card, text, accent, border
   (hex strings), font ('classic' | 'mono' | 'comic', absent = system),
   radiusMult (0-1.5 number), bordersOn (bool), shadowOn (bool). Every
   key is optional; an absent key means "use that theme's own default
   from theme.css". --muted is NOT one of these keys - it has no colour
   picker of its own and is always derived from the effective text/bg
   pair (see applyThemeSettings) once either of those is customised, so
   it stays legible against any custom palette instead of clashing with
   a hand-tuned default built for a different palette.
   applyThemeSettings() re-applies the CURRENT theme's saved settings as
   inline custom properties directly on <body> every time applyTheme()
   runs. This must target <body> and not <html>/documentElement: theme.css
   redefines these same variables again on body.dark/body.ancient-rome,
   and a class selector on an element always wins over an inherited value
   from an ancestor's inline style, however specific - only an inline
   style on that same element (body) can out-rank it. Applying to <html>
   is exactly why editing from dark/ancient-rome mode used to silently
   no-op.
============================================================ */
const THEME_COLOR_VARS = { bg: '--bg', card: '--card', text: '--text', accent: '--accent' };

const FONT_DEFS = {
    classic: { sans: "'Manrope', system-ui, -apple-system, sans-serif", display: "'Playfair Display', Georgia, serif" },
    mono: { sans: "'Consolas', 'Courier New', ui-monospace, monospace", display: "'Consolas', 'Courier New', ui-monospace, monospace" },
    comic: { sans: "'Comic Sans MS', 'Comic Neue', cursive, sans-serif", display: "'Comic Sans MS', 'Comic Neue', cursive, sans-serif" },
    inter: { sans: "'Inter', system-ui, -apple-system, sans-serif", display: "'Inter', system-ui, -apple-system, sans-serif" },
    nunito: { sans: "'Nunito', system-ui, sans-serif", display: "'Nunito', system-ui, sans-serif" },
    quicksand: { sans: "'Quicksand', system-ui, sans-serif", display: "'Quicksand', system-ui, sans-serif" },
    'patrick-hand': { sans: "'Patrick Hand', cursive, sans-serif", display: "'Patrick Hand', cursive, sans-serif" },
    // Used by the Ancient Rome / Terracotta / Imperial Purple presets - a
    // carved-inscription serif (Trajan-column inspired), so anywhere it
    // shows up is a deliberate "Roman/imperial" family tie, not drift.
    cinzel: { sans: "'Cinzel', Georgia, serif", display: "'Cinzel', Georgia, serif" },
    'jetbrains-mono': { sans: "'JetBrains Mono', 'Consolas', ui-monospace, monospace", display: "'JetBrains Mono', 'Consolas', ui-monospace, monospace" },
    chewy: { sans: "'Chewy', cursive, system-ui, sans-serif", display: "'Chewy', cursive, system-ui, sans-serif" }
};

function hexToRgb(hex) {
    hex = (hex || '').trim().replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
}

// Blends hexA toward hexB by weightB (0 = pure hexA, 1 = pure hexB).
function mixHex(hexA, hexB, weightB) {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    if (!a || !b) return hexA || hexB || '#808080';
    const w = Math.max(0, Math.min(1, weightB));
    return rgbToHex(
        a.r + (b.r - a.r) * w,
        a.g + (b.g - a.g) * w,
        a.b + (b.b - a.b) * w
    );
}

function getAllThemeSettings() {
    try {
        return JSON.parse(localStorage.getItem('themeSettings')) || {};
    } catch (e) {
        return {};
    }
}

function getThemeSettings(theme) {
    return getAllThemeSettings()[theme] || {};
}

function saveThemeSetting(theme, key, value) {
    const all = getAllThemeSettings();
    if (!all[theme]) all[theme] = {};
    if (value === null || value === undefined) {
        delete all[theme][key];
    } else {
        all[theme][key] = value;
    }
    localStorage.setItem('themeSettings', JSON.stringify(all));
}

function resetThemeSettings(theme) {
    const all = getAllThemeSettings();
    delete all[theme];
    localStorage.setItem('themeSettings', JSON.stringify(all));
}

function applyThemeSettings(theme) {
    // Applied directly on <body>, not <html>/documentElement - see the
    // THEME SETTINGS comment block above for why that distinction matters.
    const root = document.body.style;
    const settings = getThemeSettings(theme);

    Object.keys(THEME_COLOR_VARS).forEach(key => {
        const cssVar = THEME_COLOR_VARS[key];
        if (settings[key]) root.setProperty(cssVar, settings[key]);
        else root.removeProperty(cssVar);
    });

    // Border colour: an explicit override wins, but bordersOn:false always
    // wins over it (transparent, not width:0 - see the comment below).
    if (settings.bordersOn === false) {
        root.setProperty('--border', 'transparent');
    } else if (settings.border) {
        root.setProperty('--border', settings.border);
    } else {
        root.removeProperty('--border');
    }

    // --muted has no colour picker of its own: once the user customises bg
    // or text, derive a legible muted tone from that pair (blended halfway
    // toward the background) instead of leaving behind whichever built-in
    // theme's hand-tuned --muted happened to be active. Untouched presets
    // fall through to theme.css's own default, unchanged.
    if (settings.bg || settings.text) {
        const computed = getComputedStyle(document.body);
        const effText = computed.getPropertyValue('--text').trim();
        const effBg = computed.getPropertyValue('--bg').trim();
        root.setProperty('--muted', mixHex(effText, effBg, 0.5));
    } else {
        root.removeProperty('--muted');
    }

    const fontDef = FONT_DEFS[settings.font];
    if (fontDef) {
        root.setProperty('--font-sans', fontDef.sans);
        root.setProperty('--font-display', fontDef.display);
    } else {
        root.removeProperty('--font-sans');
        root.removeProperty('--font-display');
    }

    if (typeof settings.radiusMult === 'number') root.setProperty('--radius-mult', settings.radiusMult);
    else root.removeProperty('--radius-mult');

    // Per-corner radius: every border-radius declaration site-wide already
    // reads calc(Npx * var(--radius-mult-tl, var(--radius-mult, 1))) (one
    // expression per corner), so leaving these four unset makes every corner
    // fall back to the single --radius-mult slider above - exactly today's
    // "uniform" behaviour. radiusMode:'perCorner' sets each one explicitly.
    ['TL', 'TR', 'BR', 'BL'].forEach(corner => {
        const cssVar = '--radius-mult-' + corner.toLowerCase();
        const value = settings.radiusMode === 'perCorner' ? settings['radius' + corner] : undefined;
        if (typeof value === 'number') root.setProperty(cssVar, value);
        else root.removeProperty(cssVar);
    });

    if (settings.shadowOn === false) {
        root.setProperty('--shadow', 'none');
        root.setProperty('--shadow-float', 'none');
    } else {
        root.removeProperty('--shadow');
        root.removeProperty('--shadow-float');
    }
}

(function ensureCustomFontsLoaded() {
    if (document.getElementById('theme-custom-fonts')) return;
    const pc1 = document.createElement('link');
    pc1.rel = 'preconnect';
    pc1.href = 'https://fonts.googleapis.com';
    const pc2 = document.createElement('link');
    pc2.rel = 'preconnect';
    pc2.href = 'https://fonts.gstatic.com';
    pc2.crossOrigin = 'anonymous';
    const sheet = document.createElement('link');
    sheet.id = 'theme-custom-fonts';
    sheet.rel = 'stylesheet';
    // Playfair Display + Manrope back "Classic"; Comic Neue is the open-
    // license lookalike for "Comic Sans MS" on platforms that don't ship
    // it. Consolas ("Monospace") is a system font everywhere that matters,
    // so it needs no web-font fallback here.
    sheet.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&family=Comic+Neue:wght@400;700&family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&family=Patrick+Hand&family=Cinzel:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Chewy&display=swap';
    document.head.appendChild(pc1);
    document.head.appendChild(pc2);
    document.head.appendChild(sheet);
})();

function applyTheme(theme) {
    if (!THEME_CYCLE_ORDER.includes(theme)) theme = 'light';

    document.body.classList.remove(...THEME_CLASS_LIST);
    if (THEME_CLASS_LIST.includes(theme)) {
        document.body.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
    if (theme === 'dark') localStorage.setItem('achievementDarkMode', 'true');
    if (theme === 'ancient-rome') localStorage.setItem('achievementAncientRome', 'true');

    applyThemeSettings(theme);

    const btn = document.getElementById('sbarThemeToggle');
    if (btn) {
        const meta = THEME_META[theme];
        btn.textContent = meta.icon;
        btn.title = `${meta.label} - click to switch`;
        btn.setAttribute('aria-label', `Current theme: ${meta.label}. Click to switch theme.`);
    }

    // Legacy per-page checkbox - only still present on old Beta Archive
    // pages that predate the sidebar theme button. Kept in sync rather
    // than removed from interact.js, since removing the markup from
    // every page it appears on is a separate, larger cleanup.
    const legacyToggle = document.getElementById("darkModeToggle");
    if (legacyToggle) legacyToggle.checked = (theme === 'dark');
}

function cycleTheme() {
    const next = THEME_CYCLE_ORDER[(THEME_CYCLE_ORDER.indexOf(getSavedTheme()) + 1) % THEME_CYCLE_ORDER.length];
    applyTheme(next);
}

/* ============================================================
   THEME PRESETS (Theme Settings panel, index.html)
   Every preset - built-in or user-saved - is the same shape: a base
   theme (light/dark/ancient-rome, still driven by THEME_CYCLE_ORDER/
   applyTheme above exactly as before, which is what the sidebar's
   single cycle button keeps using unmodified) plus an overrides object
   in the same shape the settings panel edits (see applyThemeSettings).
   Light/Dark/Ancient Rome carry empty overrides - selecting one just
   resets that base theme's draft to a clean default - but a built-in
   preset is free to carry real overrides too (Sepia, Ocean, etc. are
   just their base theme's structural CSS with a different palette laid
   on top, no new CSS classes needed). A custom preset is a named
   snapshot of {base, overrides} the user saved from the panel; up to
   CUSTOM_PRESET_MAX of them are kept in localStorage.customPresets.
   localStorage.activePresetId tracks which button should read as
   "selected" in the panel's preset list.
============================================================ */
const CUSTOM_PRESET_MAX = 10;
const BUILTIN_PRESETS = [
    // Light and Dark stay pure colour swaps of each other - no font/shape
    // personality - per explicit instruction: every OTHER preset below gets
    // a distinct font and/or shape (radius/border/shadow) to match its
    // mood, not just a different palette, but Light vs Dark stays identical
    // in everything but colour.
    { id: 'light', name: 'Light', base: 'light', deletable: false, overrides: {} },
    { id: 'dark', name: 'Dark', base: 'dark', deletable: false, overrides: {} },
    {
        // Cinzel (carved-inscription serif) + sharp corners for a
        // chiselled-stone feel, layered on the existing gradient/colours.
        id: 'ancient-rome', name: 'Ancient Rome', base: 'ancient-rome', deletable: false,
        overrides: { font: 'cinzel', radiusMult: 0.4 }
    },
    {
        // Old-book warmth: the existing Playfair+Manrope serif pairing and
        // slightly squared corners, like a printed page.
        id: 'sepia', name: 'Sepia', base: 'light', deletable: false,
        overrides: { bg: '#f4ecd8', card: '#fbf3e4', text: '#3b2f1c', accent: '#8b5e34', border: '#d9c8a0', font: 'classic', radiusMult: 0.6 }
    },
    {
        // Roman terracotta pottery: same Cinzel family as Ancient Rome, but
        // its own light clay palette.
        id: 'terracotta', name: 'Terracotta', base: 'light', deletable: false,
        overrides: { bg: '#f8eee7', card: '#fffaf6', text: '#452a22', accent: '#b85c38', border: '#e5c5b5', font: 'cinzel', radiusMult: 0.5 }
    },
    {
        // Polished stone: flat (no shadow), seamless (no border), heavily
        // rounded like a worn marble edge, clean minimal Inter.
        id: 'marble', name: 'Marble', base: 'light', deletable: false,
        overrides: { bg: '#f3f1eb', card: '#ffffff', text: '#292827', accent: '#777b80', border: '#d5d5d0', font: 'inter', radiusMult: 1.4, bordersOn: false, shadowOn: false }
    },
    {
        // Fresh coastal: friendly rounded Nunito.
        id: 'ocean', name: 'Ocean', base: 'light', deletable: false,
        overrides: { bg: '#eaf6fb', card: '#ffffff', text: '#0b2b3c', accent: '#0e8fa3', border: '#bfe3ec', font: 'nunito', radiusMult: 1.1 }
    },
    {
        // Nature sketchbook: handwritten Patrick Hand.
        id: 'forest', name: 'Forest', base: 'light', deletable: false,
        overrides: { bg: '#f0f7ee', card: '#ffffff', text: '#20331f', accent: '#2f7d3c', border: '#cfe6cc', font: 'patrick-hand', radiusMult: 0.9 }
    },
    {
        // Calm minimal spa: soft rounded Quicksand, borderless.
        id: 'sage', name: 'Sage', base: 'light', deletable: false,
        overrides: { bg: '#f2f5ef', card: '#ffffff', text: '#29352b', accent: '#718c70', border: '#d6e0d1', font: 'quicksand', radiusMult: 1.2, bordersOn: false }
    },
    {
        // Playful bubblegum: Comic Sans + maximum roundness, borderless.
        id: 'rose', name: 'Rose', base: 'light', deletable: false,
        overrides: { bg: '#fdf0f4', card: '#ffffff', text: '#4a1f2b', accent: '#d6467e', border: '#f3cddd', font: 'comic', radiusMult: 1.5, bordersOn: false }
    },
    {
        // Sleek deep-navy tech, slightly squared corners.
        id: 'midnight', name: 'Midnight', base: 'dark', deletable: false,
        overrides: { bg: '#050a16', card: '#0c1526', text: '#dbe6fb', accent: '#5eead4', border: '#17233d', radiusMult: 0.7 }
    },
    {
        // Ethereal northern-lights glow: flowing rounded shapes, Inter.
        id: 'aurora', name: 'Aurora', base: 'dark', deletable: false,
        overrides: { bg: '#0b1020', card: '#141b30', text: '#e4ecff', accent: '#8b5cf6', border: '#293052', font: 'inter', radiusMult: 1.3 }
    },
    {
        // Regal and structured: Cinzel again, but for a royal-purple mood
        // rather than Ancient Rome/Terracotta's clay-and-stone one.
        id: 'imperial-purple', name: 'Imperial Purple', base: 'dark', deletable: false,
        overrides: { bg: '#171020', card: '#24172f', text: '#f0e6f7', accent: '#c084fc', border: '#49305b', font: 'cinzel', radiusMult: 0.5 }
    },
    {
        // Neon synthwave: JetBrains Mono, sharp-ish corners.
        id: 'cyberpunk', name: 'Cyberpunk', base: 'dark', deletable: false,
        overrides: { bg: '#100b1c', card: '#1b102b', text: '#f5eaff', accent: '#ff4fd8', border: '#4a1e57', font: 'jetbrains-mono', radiusMult: 0.65 }
    },
    {
        // Classic green-on-black CRT hacker terminal: Consolas, sharpest
        // corners of any preset.
        id: 'terminal', name: 'Terminal', base: 'dark', deletable: false,
        overrides: { bg: '#04120a', card: '#081c10', text: '#8ef0a4', accent: '#39ff14', border: '#123420', font: 'mono', radiusMult: 0.3 }
    }
];

function getCustomPresets() {
    try {
        const list = JSON.parse(localStorage.getItem('customPresets'));
        return Array.isArray(list) ? list : [];
    } catch (e) {
        return [];
    }
}

function saveCustomPresets(list) {
    localStorage.setItem('customPresets', JSON.stringify(list));
}

function getAllPresets() {
    return [...BUILTIN_PRESETS, ...getCustomPresets().map(p => ({ ...p, deletable: true }))];
}

function getPresetById(id) {
    return getAllPresets().find(p => p.id === id) || null;
}

function getActivePresetId() {
    const stored = localStorage.getItem('activePresetId');
    const preset = stored ? getPresetById(stored) : null;
    // A preset whose base no longer matches the live theme (e.g. the
    // sidebar's cycle button was used directly) falls back to that
    // base's own built-in preset, so the panel never shows a preset
    // from a different theme as "active".
    if (preset && preset.base === getSavedTheme()) return preset.id;
    return getSavedTheme();
}

function setActivePresetId(id) {
    localStorage.setItem('activePresetId', id);
}

function selectPreset(id) {
    const preset = getPresetById(id);
    if (!preset) return;

    // Copy the preset's overrides in as the live draft for that base theme
    // (editable further without mutating the saved preset unless the user
    // saves again). Built-ins with empty overrides (Light/Dark/Ancient Rome)
    // this way still correctly reset that base theme back to a clean slate.
    const all = getAllThemeSettings();
    all[preset.base] = { ...(preset.overrides || {}) };
    localStorage.setItem('themeSettings', JSON.stringify(all));

    setActivePresetId(id);
    applyTheme(preset.base);
}

function saveCurrentAsPreset(name) {
    const custom = getCustomPresets();
    if (custom.length >= CUSTOM_PRESET_MAX) {
        return { ok: false, reason: `You can only save up to ${CUSTOM_PRESET_MAX} of your own presets. Delete one first.` };
    }
    const trimmedName = (name || '').trim();
    if (!trimmedName) {
        return { ok: false, reason: 'Give your preset a name first.' };
    }

    const base = getSavedTheme();
    const preset = {
        id: 'custom-' + Date.now(),
        name: trimmedName,
        base,
        overrides: { ...getThemeSettings(base) }
    };
    custom.push(preset);
    saveCustomPresets(custom);
    setActivePresetId(preset.id);
    return { ok: true, preset };
}

function deleteCustomPreset(id) {
    const custom = getCustomPresets().filter(p => p.id !== id);
    saveCustomPresets(custom);
    if (getActivePresetId() === id || localStorage.getItem('activePresetId') === id) {
        // Fall back to the current base theme's built-in preset.
        selectPreset(getSavedTheme());
    }
}
let sessionStart = new Date();
let logins = JSON.parse(localStorage.getItem("savedLogins")) || [];
if (!logins.includes(sessionStart.toLocaleDateString())){
    logins.unshift(sessionStart.toLocaleDateString());
}
let loginTimes = JSON.parse(localStorage.getItem("savedLoginTimes")) || [];
loginTimes.unshift(sessionStart.toLocaleTimeString());
localStorage.setItem('savedLogins', JSON.stringify(logins));
localStorage.setItem('savedLoginTimes', JSON.stringify(loginTimes));



const friendlyInteractions = [
    { maxHour: 1,  text: "Midnight revision? The best memory hack is sleep!" },
    { maxHour: 6,  text: "All-nighter? Good luck! But DON'T crack open an energy drink." },
    { maxHour: 8,  text: "Awake? At this hour? What an early bird!" },
    { maxHour: 11, text: "Good morning! A glorious day for productivity!" },
    { maxHour: 13, text: "Studying now? Get a snack, touch some grass. It's lunch." },
    { maxHour: 18, text: "Good afternoon!" },
    { maxHour: 20, text: "It's dinner; spend some family time!" },
    { maxHour: 23, text: "Late-night study? I guess you're a night owl, like me..." }
];
const cozyInteractions = [
    { maxHour: 1,  text: "The world is asleep, but you're still learning. Keep burning that fire of ambition." },
    { maxHour: 6,  text: "The quietest hours often make the best study sessions." },
    { maxHour: 8,  text: "A calm morning and a fresh mind. Not a bad combination." },
    { maxHour: 11, text: "Good morning! Settle in and make yourself comfortable." },
    { maxHour: 13, text: "Lunch break! Stretch your legs and rest your eyes." },
    { maxHour: 18, text: "The afternoon sun is drifting lower. Perfect study weather." },
    { maxHour: 20, text: "Evening already? Time seems to move quickly when you're busy." },
    { maxHour: 23, text: "The stars are out, the room is quiet, and the books are open." }
];
const wittyInteractions = [
    { maxHour: 1,  text: "If you're studying at midnight, you're either very dedicated or very procrastinated." },
    { maxHour: 6,  text: "Still awake? ...That's one strategy." },
    { maxHour: 8,  text: "Look at you, functioning before most teenagers are even conscious." },
    { maxHour: 11, text: "Morning! Time to pretend we're organised." },
    { maxHour: 13, text: "Lunch. Otherwise known as 'study break with food attached'." },
    { maxHour: 18, text: "Good afternoon! Productivity may vary." },
    { maxHour: 20, text: "Dinner first. Latin can wait an hour." },
    { maxHour: 23, text: "Ah yes, the classic 'I'll just do one more thing' hour." }
];
const scholarInteractions = [
    { maxHour: 1,  text: "Even the ancient scholars eventually went to bed." },
    { maxHour: 6,  text: "Aurora rises, and so does today's learning." },
    { maxHour: 8,  text: "A new day, a new declension to conquer." },
    { maxHour: 11, text: "Salve! Ready for another step toward fluency?" },
    { maxHour: 13, text: "Even Cicero would have stopped for lunch." },
    { maxHour: 18, text: "The day grows older, but knowledge stays young." },
    { maxHour: 20, text: "A peaceful evening for reviewing Ablative Absolutes." },
    { maxHour: 23, text: "Burning the midnight oil? The Romans did that too." }
];
const timeQuotes = [
    { maxHour: 1,  text: "Dark mode. For that midnight grind." },
    { maxHour: 6,  text: "Dark mode. For the all-night study session." },
    { maxHour: 8,  text: "Dark mode. For waking with the gentle sun." },
    { maxHour: 11, text: "Dark mode. Soft light for your morning thoughts." },
    { maxHour: 14, text: "Dark mode. For the mid-day cool down." },
    { maxHour: 18, text: "Dark mode. Beating the afternoon slump." },
    { maxHour: 20, text: "Dark mode. For the golden moment of twilight." },
    { maxHour: 23, text: "Dark mode. For your late-night grind." }
];
const cozyQuotes = [
    { maxHour: 1,  text: "Dark mode. Maxxing late-night vibes for your midnight inspiration." },
    { maxHour: 6,  text: "Dark mode. For the quiet hours when the world is asleep." },
    { maxHour: 8,  text: "Dark mode. For waking up gently with the sun." },
    { maxHour: 11, text: "Dark mode. Soft light for your morning thoughts." },
    { maxHour: 13, text: "Dark mode. A pocket of shade in the middle of the day." },
    { maxHour: 18, text: "Dark mode. Catching the slow, leaning afternoon shadows." },
    { maxHour: 20, text: "Dark mode. Easing into the calm of the evening." },
    { maxHour: 23, text: "Dark mode. Unwinding as the stars come out." }
];
const wittyQuotes = [
    { maxHour: 1,  text: "Dark mode. Powered by caffine and code."},
    { maxHour: 6,  text: "Dark mode. Go to sleep. Seriously." },
    { maxHour: 8,  text: "Dark mode. Because the sun is being way too loud right now." },
    { maxHour: 11, text: "Dark mode. Either that, or touch some grass."},
    { maxHour: 13, text: "Dark mode. It's bright outside, but I dare wouldn't look out." },
    { maxHour: 18, text: "Dark mode. Fueling the afternoon screen-stare." },
    { maxHour: 20, text: "Dark mode. Protecting your eyes from the daily wind-down." },
    { maxHour: 23, text: "Dark mode. Officially entering vampire hours." }
];
const techQuotes = [
    { maxHour: 1,  text: "Dark mode. For deep work and high focus." },
    { maxHour: 6,  text: "Dark mode. Powered by caffeine and code." },
    { maxHour: 8,  text: "Dark mode. For the early birds beating the rush." },
    { maxHour: 11, text: "Dark mode. Clearing the workspace for deep focus." },
    { maxHour: 13, text: "Dark mode. Keeping the momentum through lunch." },
    { maxHour: 18, text: "Dark mode. Powering through the final daily sprints." },
    { maxHour: 20, text: "Dark mode. Shifting gears into nocternal territory." },
    { maxHour: 23, text: "Dark mode. For the late-night sweats studying under the radar." }
];


const terribleQuotes = [
    { latin: "Errare humanum est.", english: "To err is human." },
    { latin: "Labor omnia vincit.", english: "Hard work conquers all things." },
    { latin: "Repetitio mater studiorum est.", english: "Repetition is the mother of learning." },
    { latin: "Discendo discimus.", english: "We learn by learning." },
];
const improvingQuotes = [
    { latin: "Per aspera ad astra.", english: "Through hardships to the stars." },
    { latin: "Non scholae sed vitae discimus.", english: "We learn not for school, but for life." },
    { latin: "Gutta cavat lapidem.", english: "The drop hollows the stone." },
    { latin: "Paulatim sed certe.", english: "Slowly but surely." },
];
const decentQuotes = [
    { latin: "Fortuna fortes adiuvat.", english: "Fortune favours the brave." },
    { latin: "Qui audet adipiscitur.", english: "Who dares, wins." },
    { latin: "Dimidium facti qui coepit habet.", english: "He who has begun has half done." },
    { latin: "Sapientia potentia est.", english: "Knowledge is power." },
];
const goodQuotes = [
    { latin: "Veni, vidi, vici.", english: "I came, I saw, I conquered." },
    { latin: "Audentes fortuna iuvat.", english: "Fortune favours the bold." },
    { latin: "Virtus in actione consistit.", english: "Virtue consists in action." },
    { latin: "Age quod agis.", english: "Do well whatever you do." },
];
const excellentQuotes = [
    { latin: "Ad astra per aspera.", english: "To the stars through hardships." },
    { latin: "Ad astra abyssosque.", english: "To the stars and the depths." },
    { latin: "Nil difficile volenti.", english: "Nothing is difficult for the willing." },
    { latin: "Scientia potentia est.", english: "Knowledge is power." },
    { latin: "Victoria amat praeparationem.", english: "Victory loves preparation." },
];
const perfectQuotes = [
    { latin: "Alea iacta est.", english: "The die is cast." },
    { latin: "Aut viam inveniam aut faciam.", english: "I shall either find a way or make one." },
    { latin: "Nil desperandum.", english: "Never despair." },
    { latin: "Sic itur ad astra.", english: "Thus one journeys to the stars." },
    { latin: "Carpe diem.", english: "Seize the day." },
    { latin: "Veni, vidi, vici.", english: "I came, I saw, I conquered." },
];

// ==========================================
// PART 2: WAITS FOR HTML ELEMENTS TO LOAD
// ==========================================
window.onload = function() {
    //document.querySelector("body").classList.toggle("dark"); 
  let hour = new Date().getHours();
  const interact = document.querySelector('.interact');
  const darkInteract = document.querySelector('.dark-interact');
  let interaction = "Hello!";
  let darkModeInteract = "";
  applyTheme(getSavedTheme());


    const timeQuote = timeQuotes.find(slot => hour < slot.maxHour) || timeQuotes[0];
    const cozyQuote = cozyQuotes.find(slot => hour < slot.maxHour) || timeQuotes[0];
    const wittyQuote = wittyQuotes.find(slot => hour < slot.maxHour) || timeQuotes[0];
    const techQuote = techQuotes.find(slot => hour < slot.maxHour) || timeQuotes[0];
    const friendlyInteraction = friendlyInteractions.find(slot => hour < slot.maxHour) || friendlyInteractions[0];
    const cozyInteraction = cozyInteractions.find(slot => hour < slot.maxHour) || cozyInteractions[0];
    const wittyInteraction = wittyInteractions.find(slot => hour < slot.maxHour) || wittyInteractions[0];
    const scholarInteraction = scholarInteractions.find(slot => hour < slot.maxHour) || scholarInteractions[0];
  switch (document.body.dataset.pageType){
    case "base":
        darkModeInteract = timeQuote.text;
        interaction = friendlyInteraction.text;
        break;
    case "meta":
        darkModeInteract="Dark mode. This feature took <em>way too long</em> to code.";
        interaction="Heh, you found me.";
        break;
    case "archive":
        darkModeInteract="DISCLAIMER: You won't be able to access Dark Mode in these Beta-version pages. But you can here.";
        interaction="Entering code-error potent territory. Why are you even here?";
        break;
    case "vocab":
        darkModeInteract = cozyQuote.text;
        interaction = cozyInteraction.text;
        break;
    case "noun":
        darkModeInteract = wittyQuote.text;
        interaction = wittyInteraction.text;
        break;
    case "verb":
        darkModeInteract = techQuote.text;
        interaction = scholarInteraction.text;
        break;
    case "pronoun":
        darkModeInteract = wittyQuote.text;
        interaction = wittyInteraction.text;
        break;
    
    case "sampleTest":
        darkModeInteract = timeQuote.text;
        interaction = friendlyInteraction.text;
        break;
    
  }
  console.log("Page type is: " + document.body.dataset.pageType);
  console.log("Page is: " + window.location.pathname.split('/').pop());
  let currentPage = window.location.pathname.split('/').pop()
  let pagesLoaded=JSON.parse(localStorage.getItem('savedPagesLoaded')) || [];
  pagesLoaded.push(currentPage);
  localStorage.setItem('savedPagesLoaded', JSON.stringify(pagesLoaded));

  interact.innerHTML = `"${interaction}"`;
  if (darkInteract) darkInteract.innerHTML = `${darkModeInteract}`;
    shrinkTextToOneLine(".interact");
    if (darkInteract) shrinkTextToOneLine(".dark-interact");
    addMacraInputter();

// Legacy per-page checkbox - only still present on old Beta Archive pages
// that predate the sidebar theme button (see applyTheme() above).
const legacyToggle = document.getElementById("darkModeToggle");
if (legacyToggle) {
    legacyToggle.checked = document.body.classList.contains('dark');
    legacyToggle.onchange = e => applyTheme(e.target.checked ? 'dark' : 'light');
}


rerenderUsername();
}

window.addEventListener("beforeunload", () => {

    const seconds =
        Math.floor((Date.now() - sessionStart) / 1000);

    let total =
        Number(localStorage.getItem("studySeconds")) || 0;

    total += seconds;

    localStorage.setItem("studySeconds", total);

});


function getElement(elementOrSelector) {
  if (typeof elementOrSelector === "string") {
    return document.querySelector(elementOrSelector);
  }

  return elementOrSelector;
}

function getExactLineCount(elementOrSelector) {
  const element = getElement(elementOrSelector);

  if (!(element instanceof Element)) {
    return 0;
  }

  const style = window.getComputedStyle(element);

  const clientHeight = element.clientHeight;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;

  const textHeight = clientHeight - paddingTop - paddingBottom;

  let lineHeight = parseFloat(style.lineHeight);

  if (isNaN(lineHeight)) {
    const fontSize = parseFloat(style.fontSize);
    lineHeight = fontSize * 1.2;
  }

  return Math.round(textHeight / lineHeight);
}

function shrinkTextToOneLine(elementOrSelector) {
  const element = getElement(elementOrSelector);

  if (!(element instanceof Element)) {
    return;
  }

  const MIN_FONT_SIZE = 8;

  let currentFontSize =
    parseFloat(window.getComputedStyle(element).fontSize);

  while (
    getExactLineCount(element) > 1 &&
    currentFontSize > MIN_FONT_SIZE
  ) {
    currentFontSize -= 1;
    element.style.fontSize = currentFontSize + "px";

    void element.offsetHeight;
  }
  
}

/*============================================================================
MACRA ADDER
============================================================================*/

function addMacraInputter() {
  if (document.getElementById("macraInputter")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div id="macraInputter" style="position: fixed; top: calc(10vh + 10px); right: 12px; left: auto; z-index: 9999; width: 230px; max-width: calc(100vw - 24px); box-sizing: border-box; border: 2px solid var(--bluepop); border-radius: calc(16px * var(--radius-mult-tl, var(--radius-mult, 1))) calc(16px * var(--radius-mult-tr, var(--radius-mult, 1))) calc(16px * var(--radius-mult-br, var(--radius-mult, 1))) calc(16px * var(--radius-mult-bl, var(--radius-mult, 1))); background-color: var(--card); padding: 8px 14px 12px 14px; display: flex; flex-direction: column; align-items: center;">
      <div class="macra-msg">Click to input macra</div>
      <div style="width: 100%; display: flex; gap: 6px;">
      <div class="macra" type="button" data-macron="ā">ā</div>
      <div class="macra" type="button" data-macron="ē">ē</div>
      <div class="macra" type="button" data-macron="ī">ī</div>
      <div class="macra" type="button" data-macron="ō">ō</div>
      <div class="macra" type="button" data-macron="ū">ū</div>
      </div>

    </div>

    <style>
      /* Fixed px sizing (not vh/cqh) so the keyboard's own scale tracks
         the page's normal text sizes rather than raw viewport dimensions -
         it still stays pinned to the top-right corner via position:fixed. */
      .macra {
        font-size: 15px;
        border-radius: calc(999px * var(--radius-mult-tl, var(--radius-mult, 1))) calc(999px * var(--radius-mult-tr, var(--radius-mult, 1))) calc(999px * var(--radius-mult-br, var(--radius-mult, 1))) calc(999px * var(--radius-mult-bl, var(--radius-mult, 1)));
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--bluepop);
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.15s ease;
        flex: 1;
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .macra:hover {
        background-color: var(--card);
        transition: background-color 0.2s ease;
      }

      .macra-msg {
        width: 100%;
        text-align: center;
        font-size: 12px;
        color: var(--muted);
        margin-bottom: 8px;
      }
    </style>
  `);

  document.body.style.marginBottom = "5vh";

  document.querySelectorAll(".macra").forEach(button => {
    button.addEventListener("mousedown", event => {
      event.preventDefault();

      const macron = button.dataset.macron;
      const activeEl = document.activeElement;

      if (
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")
      ) {
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        const text = activeEl.value;

        activeEl.value =
          text.substring(0, start) +
          macron +
          text.substring(end);

        activeEl.selectionStart =
          activeEl.selectionEnd =
          start + macron.length;

        activeEl.dispatchEvent(
          new Event("input", { bubbles: true })
        );

        button.textContent = "Inputted";
        localStorage.setItem('achievementMacronKeyboard', 'true');
        setTimeout(() => {
          button.innerHTML = macron;
        }, 800);
      } else {
        alert("No textbox selected to input macron!");
      }
    });
  });
}




/*============================================================================
TEST RESULT QUOTES
============================================================================*/

function randomQuote(list){
    return list[Math.floor(Math.random()*list.length)];
}

function calcScore(score, total){

    const percent = score / total;

    let quote = "";

    if (percent < 0.2){
        quote = randomQuote(terribleQuotes);
    }
    else if (percent < 0.5){
        quote = randomQuote(improvingQuotes);
    }
    else if (percent < 0.75){
        quote = randomQuote(decentQuotes);
    }
    else if (percent < 0.9){
        quote = randomQuote(goodQuotes);
    }
    else if (percent < 1){
        quote = randomQuote(excellentQuotes);
    }
    else{
        quote = randomQuote(perfectQuotes);
    }
    console.log(quote);
    return `<em>'${quote.latin}'</em><br><em>'${quote.english}'</em>`;
}

function rerenderUsername(){
    let username = localStorage.getItem("username")|| "";
    if (username ===""){
      document.getElementById("username-greet").innerHTML = ``;
      console.log("No username to load");
    }else{
      document.getElementById("username-greet").innerHTML = `Hi, <strong>${username}</strong>!  `;
      console.log("Username is: "+username);
    }
}

/* =========================
   UNIVERSAL MUSIC PLAYER
========================= */

(function () {
    const MUSIC_STATE_KEY = "latinMusicState";
    const MUSIC_COLLAPSED_KEY = "latinMusicPlayerCollapsed";

    /*
        Assumes:
        /interact.js
        /music/musicData.js
        /music/song-file.mp3
    */
    const interactScript = [...document.scripts].find(script =>
        script.src && script.src.includes("interact.js")
    );

    const siteRoot = interactScript
        ? new URL("./", interactScript.src).href
        : new URL("./", window.location.href).href;

    const musicDataUrl = new URL("music/musicData.js", siteRoot).href;
    const musicFolderUrl = new URL("music/", siteRoot).href;

    let audio = new Audio();
    let tracks = [];
    let state = readMusicState();

    let playerEls = {};
    let lastSaveTime = 0;

    function readMusicState() {
        const saved = localStorage.getItem(MUSIC_STATE_KEY);

        if (!saved) {
            return {
                currentIndex: null,
                currentTime: 0,
                isPlaying: false,
                repeatSong: false,
                loopPlaylist: true,
                volume: 0.7
            };
        }

        try {
            return {
                currentIndex: null,
                currentTime: 0,
                isPlaying: false,
                repeatSong: false,
                loopPlaylist: true,
                volume: 0.7,
                ...JSON.parse(saved)
            };
        } catch {
            return {
                currentIndex: null,
                currentTime: 0,
                isPlaying: false,
                repeatSong: false,
                loopPlaylist: true,
                volume: 0.7
            };
        }
    }

    function saveMusicState(updates = {}) {
        state = {
            ...state,
            ...updates
        };

        localStorage.setItem(MUSIC_STATE_KEY, JSON.stringify(state));
    }

    function loadMusicData() {
        return new Promise((resolve, reject) => {
            if (Array.isArray(window.musicData)) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = musicDataUrl;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function prepareTracks() {
        tracks = [...window.musicData].sort((a, b) =>
            String(a.index).localeCompare(String(b.index))
        );
    }

    function getTrackByIndex(index) {
        return tracks.find(track => String(track.index) === String(index));
    }

    function getCurrentTrack() {
        return getTrackByIndex(state.currentIndex) || tracks[0];
    }

    function getCurrentTrackPosition() {
        return tracks.findIndex(track => String(track.index) === String(state.currentIndex));
    }

    function getTrackSrc(track) {
        return new URL(track.fileName, musicFolderUrl).href;
    }

    function escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatTime(seconds) {
        if (!seconds || Number.isNaN(seconds)) return "0:00";

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${String(secs).padStart(2, "0")}`;
    }

    function applyCollapsedState(player, collapseBtn, isCollapsed) {
        player.classList.toggle("collapsed", isCollapsed);
        collapseBtn.textContent = isCollapsed ? "▴" : "▾";
        collapseBtn.setAttribute("aria-label", isCollapsed ? "Expand player" : "Collapse player");
        collapseBtn.title = isCollapsed ? "Expand player" : "Collapse player";
    }

    /*
        Keeps body's bottom padding matched to the player's real rendered
        height (rather than a hardcoded guess), so content never sits behind
        it whether the player is expanded, collapsed, or wrapped to extra
        lines on a narrow screen.
    */
    function watchPlayerHeight(player) {
        function apply() {
            document.body.style.paddingBottom = (player.offsetHeight + 32) + "px";
        }

        apply();

        if (window.ResizeObserver) {
            new ResizeObserver(apply).observe(player);
        } else {
            window.addEventListener("resize", apply);
        }
    }

    function injectMusicStyles() {
        if (document.getElementById("musicPlayerStyles")) return;

        const style = document.createElement("style");
        style.id = "musicPlayerStyles";

        style.textContent = `
            /*
                Fixed to the bottom-right and capped by --sidebar-space (kept
                in sync by the sidebar module) so it can never overlap the
                sidebar, on both desktop widths and mobile (where the
                sidebar is an overlay drawer and --sidebar-space is 0).
                body's padding-bottom is set dynamically in JS from the
                player's real rendered height instead of a hardcoded value,
                so it stays correct whether the player is expanded/collapsed.
            */
            .music-player {
                position: fixed;
                right: 16px;
                left: auto;
                bottom: 16px;
                transform: none;
                z-index: 10000;
                width: min(50vw, 720px, calc(100vw - var(--sidebar-space, 0px) - 32px));
                background: var(--card, #ffffff);
                color: var(--text, #1f2937);
                border: 1px solid var(--border, #e5e7eb);
                border-radius: calc(18px * var(--radius-mult-tl, var(--radius-mult, 1))) calc(18px * var(--radius-mult-tr, var(--radius-mult, 1))) calc(18px * var(--radius-mult-br, var(--radius-mult, 1))) calc(18px * var(--radius-mult-bl, var(--radius-mult, 1)));
                box-shadow: var(--shadow-float, 0 10px 30px rgba(0,0,0,0.18));
                padding: 12px;
                box-sizing: border-box;
                display: grid;
                grid-template-columns: 1fr auto;
                grid-template-rows: auto auto;
                gap: 4px 12px;
                align-items: center;
                transition: width 0.2s ease;
            }

            .music-player.collapsed {
                width: min(300px, calc(100vw - var(--sidebar-space, 0px) - 32px));
            }

            .music-player.collapsed .music-player-subtitle,
            .music-player.collapsed .music-progress-row,
            .music-player.collapsed #musicRepeatBtn,
            .music-player.collapsed #musicLoopBtn,
            .music-player.collapsed .music-volume-wrap {
                display: none;
            }

            .music-collapse-btn {
                position: absolute;
                top: -10px;
                right: 14px;
                width: 24px;
                height: 24px;
                border-radius: calc(50% * var(--radius-mult-tl, var(--radius-mult, 1))) calc(50% * var(--radius-mult-tr, var(--radius-mult, 1))) calc(50% * var(--radius-mult-br, var(--radius-mult, 1))) calc(50% * var(--radius-mult-bl, var(--radius-mult, 1)));
                border: 1px solid var(--border, #e5e7eb);
                background: var(--card, #ffffff);
                color: var(--muted, #6b7280);
                font-size: 11px;
                line-height: 1;
                cursor: pointer;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: var(--shadow-float, 0 2px 6px rgba(0,0,0,0.15));
            }

            .music-collapse-btn:hover {
                background: var(--bg, #f6f7fb);
            }

            .music-player-main {
                min-width: 0;
            }

            .music-player-title {
                font-weight: 800;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .music-player-subtitle {
                font-size: 12px;
                color: var(--muted, #6b7280);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-top: 2px;
            }

            .music-player-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                justify-content: flex-end;
            }

            .music-player button {
                border: 1px solid var(--border, #e5e7eb);
                background: var(--bg, #f6f7fb);
                color: var(--text, #1f2937);
                border-radius: calc(10px * var(--radius-mult-tl, var(--radius-mult, 1))) calc(10px * var(--radius-mult-tr, var(--radius-mult, 1))) calc(10px * var(--radius-mult-br, var(--radius-mult, 1))) calc(10px * var(--radius-mult-bl, var(--radius-mult, 1)));
                padding: 8px 10px;
                cursor: pointer;
                font-weight: 700;
            }

            .music-player button.active {
                background: var(--accent, #4f46e5);
                color: white;
                border-color: var(--accent, #4f46e5);
            }

            .music-progress-row {
                /* Spans both grid columns of .music-player, so it stretches
                   the full width of the bar underneath the title AND the
                   playback controls, instead of sharing just the left
                   (title) column. */
                grid-column: 1 / -1;
                display: grid;
                grid-template-columns: 42px 1fr 42px;
                gap: 8px;
                align-items: center;
                font-size: 12px;
                color: var(--muted, #6b7280);
            }

            .music-progress,
            .music-volume {
                width: 100%;
            }

            .music-volume-wrap {
                width: 90px;
            }

            .music-library-section {
                margin-bottom: 24px;
            }

            .music-track-card {
                width: 100%;
                text-align: left;
                cursor: pointer;
                border: 1px solid transparent;
            }

            .music-track-card.is-current {
                border-color: var(--accent, #4f46e5);
            }

            .music-track-name {
                font-weight: 800;
            }

            .music-track-meta {
                font-size: 12px;
                color: var(--muted, #6b7280);
                margin-top: 3px;
            }

            .music-track-source {
                font-size: 12px;
                color: var(--accent, #4f46e5);
                text-decoration: none;
            }

            @media (max-width: 700px) {
                .music-player {
                    grid-template-columns: 1fr;
                }

                .music-player-controls {
                    justify-content: flex-start;
                }

                .music-volume-wrap {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function buildMiniPlayer() {
        if (document.getElementById("musicMiniPlayer")) return;

        document.body.classList.add("has-music-player");

        const player = document.createElement("div");
        player.id = "musicMiniPlayer";
        player.className = "music-player";

        player.innerHTML = `
            <button type="button" id="musicCollapseBtn" class="music-collapse-btn" aria-label="Collapse player" title="Collapse player">▾</button>

            <div class="music-player-main">
                <div class="music-player-title" id="musicPlayerTitle">No song selected</div>
                <div class="music-player-subtitle" id="musicPlayerSubtitle">Choose a track from the music library</div>
            </div>

            <div class="music-player-controls">
                <button type="button" id="musicPrevBtn">⏮</button>
                <button type="button" id="musicPlayBtn">▶</button>
                <button type="button" id="musicNextBtn">⏭</button>
                <button type="button" id="musicRepeatBtn" title="Repeat current song">🔂</button>
                <button type="button" id="musicLoopBtn" title="Loop playlist">🔁</button>
                <div class="music-volume-wrap">
                    <input id="musicVolume" class="music-volume" type="range" min="0" max="1" step="0.01">
                </div>
            </div>

            <div class="music-progress-row">
                <span id="musicCurrentTime">0:00</span>
                <input id="musicProgress" class="music-progress" type="range" min="0" max="100" value="0">
                <span id="musicDuration">0:00</span>
            </div>
        `;

        const startCollapsed = localStorage.getItem(MUSIC_COLLAPSED_KEY) === "true";
        applyCollapsedState(player, player.querySelector("#musicCollapseBtn"), startCollapsed);

        document.body.appendChild(player);
        watchPlayerHeight(player);

        playerEls = {
            title: document.getElementById("musicPlayerTitle"),
            subtitle: document.getElementById("musicPlayerSubtitle"),
            currentTime: document.getElementById("musicCurrentTime"),
            duration: document.getElementById("musicDuration"),
            progress: document.getElementById("musicProgress"),
            volume: document.getElementById("musicVolume"),
            prevBtn: document.getElementById("musicPrevBtn"),
            playBtn: document.getElementById("musicPlayBtn"),
            nextBtn: document.getElementById("musicNextBtn"),
            repeatBtn: document.getElementById("musicRepeatBtn"),
            loopBtn: document.getElementById("musicLoopBtn"),
            collapseBtn: document.getElementById("musicCollapseBtn")
        };

        playerEls.volume.value = state.volume;
        audio.volume = state.volume;

        playerEls.collapseBtn.addEventListener("click", () => {
            const nowCollapsed = !player.classList.contains("collapsed");
            localStorage.setItem(MUSIC_COLLAPSED_KEY, nowCollapsed ? "true" : "false");
            applyCollapsedState(player, playerEls.collapseBtn, nowCollapsed);
        });

        playerEls.prevBtn.addEventListener("click", playPreviousTrack);
        playerEls.playBtn.addEventListener("click", togglePlay);
        playerEls.nextBtn.addEventListener("click", playNextTrack);

        playerEls.repeatBtn.addEventListener("click", () => {
            saveMusicState({ repeatSong: !state.repeatSong });
            updatePlayerDisplay();
        });

        playerEls.loopBtn.addEventListener("click", () => {
            saveMusicState({ loopPlaylist: !state.loopPlaylist });
            updatePlayerDisplay();
        });

        playerEls.progress.addEventListener("input", () => {
            if (!audio.duration) return;

            audio.currentTime = (Number(playerEls.progress.value) / 100) * audio.duration;

            saveMusicState({
                currentTime: audio.currentTime
            });
        });

        playerEls.volume.addEventListener("input", () => {
            audio.volume = Number(playerEls.volume.value);

            saveMusicState({
                volume: audio.volume
            });
        });
    }

    function updatePlayerDisplay() {
        const track = getCurrentTrack();

        if (!track) return;

        playerEls.title.textContent = track.name;
        playerEls.subtitle.textContent = `${track.type} • ${track.author}`;

        playerEls.playBtn.textContent = audio.paused ? "▶" : "⏸";

        playerEls.repeatBtn.classList.toggle("active", state.repeatSong);
        playerEls.loopBtn.classList.toggle("active", state.loopPlaylist);

        playerEls.currentTime.textContent = formatTime(audio.currentTime);
        playerEls.duration.textContent = formatTime(audio.duration);

        if (audio.duration) {
            playerEls.progress.value = (audio.currentTime / audio.duration) * 100;
        } else {
            playerEls.progress.value = 0;
        }

        document.querySelectorAll("[data-music-track]").forEach(button => {
            button.classList.toggle(
                "is-current",
                button.dataset.musicTrack === String(state.currentIndex)
            );
        });
    }

    function loadTrack(trackIndex, options = {}) {
        const track = getTrackByIndex(trackIndex) || tracks[0];

        if (!track) return;

        const shouldPlay = options.play || false;
        const startTime = options.startTime || 0;

        saveMusicState({
            currentIndex: track.index,
            currentTime: startTime
        });

        audio.src = getTrackSrc(track);
        audio.load();

        audio.addEventListener(
            "loadedmetadata",
            () => {
                if (startTime > 0 && audio.duration) {
                    audio.currentTime = Math.min(startTime, Math.max(audio.duration - 0.25, 0));
                }

                updatePlayerDisplay();

                if (shouldPlay) {
                    playCurrentTrack();
                }
            },
            { once: true }
        );

        updatePlayerDisplay();
    }

    function playCurrentTrack() {
        const track = getCurrentTrack();

        if (!track) return;

        if (!audio.src) {
            loadTrack(track.index, {
                play: true,
                startTime: state.currentTime || 0
            });

            return;
        }

        audio.play()
            .then(() => {
                saveMusicState({ isPlaying: true });
                updatePlayerDisplay();
            })
            .catch(() => {
                saveMusicState({ isPlaying: false });
                updatePlayerDisplay();
            });
    }

    function pauseCurrentTrack() {
        audio.pause();

        saveMusicState({
            isPlaying: false,
            currentTime: audio.currentTime || 0
        });

        updatePlayerDisplay();
    }

    function togglePlay() {
        if (audio.paused) {
            playCurrentTrack();
        } else {
            pauseCurrentTrack();
        }
    }

    function playTrackByIndex(trackIndex) {
        loadTrack(trackIndex, {
            play: true,
            startTime: 0
        });
    }

    function playNextTrack() {
        if (tracks.length === 0) return;

        let currentPosition = getCurrentTrackPosition();

        if (currentPosition === -1) {
            currentPosition = 0;
        }

        let nextPosition = currentPosition + 1;

        if (nextPosition >= tracks.length) {
            nextPosition = 0;
        }

        loadTrack(tracks[nextPosition].index, {
            play: true,
            startTime: 0
        });
    }

    function playPreviousTrack() {
        if (tracks.length === 0) return;

        let currentPosition = getCurrentTrackPosition();

        if (currentPosition === -1) {
            currentPosition = 0;
        }

        let previousPosition = currentPosition - 1;

        if (previousPosition < 0) {
            previousPosition = tracks.length - 1;
        }

        loadTrack(tracks[previousPosition].index, {
            play: true,
            startTime: 0
        });
    }

    function handleTrackEnded() {
        if (state.repeatSong) {
            loadTrack(state.currentIndex, {
                play: true,
                startTime: 0
            });

            return;
        }

        const currentPosition = getCurrentTrackPosition();
        const isLastTrack = currentPosition === tracks.length - 1;

        if (!isLastTrack) {
            playNextTrack();
            return;
        }

        if (state.loopPlaylist) {
            loadTrack(tracks[0].index, {
                play: true,
                startTime: 0
            });

            return;
        }

        saveMusicState({
            isPlaying: false,
            currentTime: 0
        });

        updatePlayerDisplay();
    }

    function connectAudioEvents() {
        audio.addEventListener("play", () => {
            saveMusicState({ isPlaying: true });
            updatePlayerDisplay();
        });

        audio.addEventListener("pause", () => {
            saveMusicState({
                isPlaying: false,
                currentTime: audio.currentTime || 0
            });

            updatePlayerDisplay();
        });

        audio.addEventListener("timeupdate", () => {
            updatePlayerDisplay();

            const now = Date.now();

            if (now - lastSaveTime > 1000) {
                lastSaveTime = now;

                saveMusicState({
                    currentTime: audio.currentTime || 0,
                    isPlaying: !audio.paused
                });
            }
        });

        audio.addEventListener("ended", handleTrackEnded);

        window.addEventListener("beforeunload", () => {
            saveMusicState({
                currentTime: audio.currentTime || 0,
                isPlaying: !audio.paused
            });
        });
    }

    function buildMusicHomepage() {
        const library = document.getElementById("musicLibrary");

        if (!library) return;

        library.innerHTML = "";

        const groupedTracks = {};

        for (let track of tracks) {
            if (!groupedTracks[track.type]) {
                groupedTracks[track.type] = [];
            }

            groupedTracks[track.type].push(track);
        }

        const sortedTypes = Object.keys(groupedTracks).sort((typeA, typeB) => {
            const aFirstIndex = groupedTracks[typeA][0].index.slice(0, 2);
            const bFirstIndex = groupedTracks[typeB][0].index.slice(0, 2);

            return aFirstIndex.localeCompare(bFirstIndex);
        });

        for (let type of sortedTypes) {
            const section = document.createElement("div");
            section.className = "category-card music-library-section";

            const heading = document.createElement("h2");
            heading.textContent = type;
            section.appendChild(heading);

            const trackList = document.createElement("div");
            trackList.className = "link-group";

            groupedTracks[type]
                .sort((a, b) => String(a.index).localeCompare(String(b.index)))
                .forEach(track => {
                    const button = document.createElement("button");
                    button.type = "button";
                    button.className = "nav-button music-track-card";
                    button.dataset.musicTrack = track.index;

                    button.innerHTML = `
                        <div>
                            <div class="music-track-name">${escapeHTML(track.name)}</div>
                            <div class="music-track-meta">
                                ${escapeHTML(track.author)} • Track ${escapeHTML(track.index)} • <a href="${track.link}" style="margin: 0 0 0px 0px;" class="music-track-source" rel="noopener noreferrer" target="_blank"><u>Source</u></a>
                            </div>
                        </div>
                        <span>Play</span>
                    `;

                    button.addEventListener("click", () => {
                        playTrackByIndex(track.index);
                    });

                    trackList.appendChild(button);

                    /*if (track.link) {
                        const source = document.createElement("a");
                        source.href = track.link;
                        source.target = "_blank";
                        source.rel = "noopener noreferrer";
                        source.className = "music-track-source";
                        source.textContent = "Source / credit";
                        source.style.margin = "0 0 8px 16px";
                        trackList.appendChild(source);
                    }*/
                });

            section.appendChild(trackList);
            library.appendChild(section);
        }

        updatePlayerDisplay();
    }

    async function initMusicSystem() {
        try {
            await loadMusicData();
        } catch {
            console.warn("Music data could not be loaded.");
            return;
        }

        if (!Array.isArray(window.musicData) || window.musicData.length === 0) {
            return;
        }

        prepareTracks();
        injectMusicStyles();
        buildMiniPlayer();
        connectAudioEvents();
        buildMusicHomepage();

        const startingTrack = getCurrentTrack();

        if (!state.currentIndex && startingTrack) {
            saveMusicState({
                currentIndex: startingTrack.index,
                currentTime: 0,
                isPlaying: false
            });
        }

        loadTrack(state.currentIndex, {
            play: state.isPlaying,
            startTime: state.currentTime || 0
        });

        window.MusicPlayer = {
            playTrack: playTrackByIndex,
            play: playCurrentTrack,
            pause: pauseCurrentTrack,
            next: playNextTrack,
            previous: playPreviousTrack,
            getState: () => state
        };
    }

    window.addEventListener("load", initMusicSystem);
})();

/* =========================
   UNIVERSAL SIDEBAR NAVIGATION
========================= */

(function () {
    /*
        Central site map. Adding a new page to the site only requires
        adding one entry here (or a new section) - every page that
        includes interact.js will automatically pick it up.
        `href` is relative to the site root (where interact.js lives).
    */
    const sidebarSections = [
        {
            title: "Home",
            links: [
                { label: "Dashboard", href: "index.html", icon: "🏠" }
            ]
        },
        {
            title: "Vocabulary",
            links: [
                { label: "Vocabulary Tester", href: "vocab/vocabTest.html", icon: "⌨️" },
                { label: "Multiple Choice", href: "vocab/multiChoice.html", icon: "🔤" },
                { label: "Flashcards", href: "flashcards.html", icon: "🗂️" },
                { label: "Hangman", href: "vocab/hangman.html", icon: "🎯" },
                { label: "Word Scramble", href: "vocab/scramble.html", icon: "🔀" },
                { label: "Scrabble", href: "vocab/scrabble.html", icon: "🀄" },
                { label: "Vocabulary Database", href: "vocab/vocabData.html", icon: "📖" }
            ]
        },
        {
            title: "Grammar",
            links: [
                { label: "Noun Endings", href: "nouns/allNounEnds.html", icon: "📐" },
                { label: "Pronouns", href: "pronouns/allPronouns.html", icon: "🔁" },
                { label: "Verb Endings", href: "verbs/allVerbEnds.html", icon: "🧩" },
                { label: "Verb Endings (1D)", href: "verbs/allVerbEndsCustom1D.html", icon: "🧩" },
                { label: "Verb Endings (2D)", href: "verbs/allVerbEndsCustom2D.html", icon: "🧩" },
                { label: "Verb Parser", href: "grammarHome.html", icon: "🔍" }
            ]
        },
        {
            title: "Progress",
            links: [
                { label: "Previous Tests", href: "testData.html", icon: "📊" },
                { label: "Achievements", href: "achievements.html", icon: "🏆" }
            ]
        },
        {
            title: "Other",
            links: [
                { label: "Sample Tests", href: "sampleTests/sampleTest1.html", icon: "📝" },
                { label: "Music Library", href: "music/music.html", icon: "🎵" },
                { label: "Beta Archives", href: "archives/archivesHome.html", icon: "🗃️" },
                { label: "About & Credits", href: "about.html", icon: "ℹ️" }
            ]
        }
    ];

    function getSiteRootUrl() {
        const interactScript = [...document.scripts].find(script =>
            script.src && script.src.includes("interact.js")
        );

        return interactScript
            ? new URL("./", interactScript.src).href
            : new URL("./", window.location.href).href;
    }

    function ensureViewportMeta() {
        if (document.querySelector('meta[name="viewport"]')) return;

        const meta = document.createElement("meta");
        meta.name = "viewport";
        meta.content = "width=device-width, initial-scale=1.0";
        document.head.prepend(meta);
    }

    function injectSidebarStyles() {
        if (document.getElementById("sidebarStyles")) return;

        const style = document.createElement("style");
        style.id = "sidebarStyles";

        style.textContent = `
            #latinSidebarToggle {
                position: fixed;
                top: calc(10vh + 12px);
                left: 12px;
                z-index: 9998;
                width: 42px;
                height: 42px;
                border-radius: calc(12px * var(--radius-mult-tl, var(--radius-mult, 1))) calc(12px * var(--radius-mult-tr, var(--radius-mult, 1))) calc(12px * var(--radius-mult-br, var(--radius-mult, 1))) calc(12px * var(--radius-mult-bl, var(--radius-mult, 1)));
                border: 1px solid var(--border, #e5e7eb);
                background: var(--card, #ffffff);
                color: var(--text, #1f2937);
                font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
                font-size: 18px;
                cursor: pointer;
                box-shadow: var(--shadow, 0 4px 12px rgba(0,0,0,0.08));
                display: none;
                align-items: center;
                justify-content: center;
            }

            #latinSidebarBackdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.45);
                z-index: 9550;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
            }

            #latinSidebarBackdrop.sbar-open {
                opacity: 1;
                pointer-events: auto;
            }

            #latinSidebar {
                position: fixed;
                top: 10vh;
                bottom: 0;
                left: 0;
                width: 250px;
                background: var(--card, #ffffff);
                border-right: 1px solid var(--border, #e5e7eb);
                box-shadow: var(--shadow, 0 4px 12px rgba(0,0,0,0.08));
                z-index: 9600;
                display: flex;
                flex-direction: column;
                font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
                transition: transform 0.25s ease, width 0.2s ease;
                box-sizing: border-box;
            }

            #latinSidebar.sbar-collapsed {
                width: 64px;
            }

            #latinSidebar.sbar-collapsed .sbar-brand,
            #latinSidebar.sbar-collapsed .sbar-course,
            #latinSidebar.sbar-collapsed .sbar-section-title,
            #latinSidebar.sbar-collapsed .sbar-label {
                display: none;
            }

            #latinSidebar.sbar-collapsed .sbar-header {
                justify-content: center;
            }

            #latinSidebar.sbar-collapsed .sbar-link {
                justify-content: center;
                padding: 10px 6px;
            }

            .sbar-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 16px 8px 16px;
                gap: 4px;
            }

            .sbar-brand {
                font-weight: 800;
                font-size: 15px;
                color: var(--text, #1f2937);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .sbar-collapse-btn {
                border: none;
                background: transparent;
                color: var(--muted, #6b7280);
                font-size: 16px;
                line-height: 1;
                cursor: pointer;
                padding: 6px 8px;
                border-radius: calc(6px * var(--radius-mult-tl, var(--radius-mult, 1))) calc(6px * var(--radius-mult-tr, var(--radius-mult, 1))) calc(6px * var(--radius-mult-br, var(--radius-mult, 1))) calc(6px * var(--radius-mult-bl, var(--radius-mult, 1)));
                flex-shrink: 0;
            }

            .sbar-collapse-btn:hover {
                background: var(--bg, #f6f7fb);
            }

            .sbar-close {
                display: none;
                border: none;
                background: transparent;
                color: var(--muted, #6b7280);
                font-size: 18px;
                line-height: 1;
                cursor: pointer;
                padding: 4px 8px;
                flex-shrink: 0;
            }

            .sbar-theme {
                display: flex;
                justify-content: center;
                padding: 0 16px 12px 16px;
            }

            .sbar-theme-btn {
                width: 100%;
                border: 1px solid var(--border, #e5e7eb);
                background: var(--bg, #f6f7fb);
                color: var(--text, #1f2937);
                font-size: 18px;
                line-height: 1;
                cursor: pointer;
                padding: 8px;
                border-radius: calc(10px * var(--radius-mult-tl, var(--radius-mult, 1))) calc(10px * var(--radius-mult-tr, var(--radius-mult, 1))) calc(10px * var(--radius-mult-br, var(--radius-mult, 1))) calc(10px * var(--radius-mult-bl, var(--radius-mult, 1)));
                transition: background 0.2s;
            }

            .sbar-theme-btn:hover {
                background: var(--border, #e5e7eb);
            }

            #latinSidebar.sbar-collapsed .sbar-theme {
                padding: 0 10px 12px 10px;
            }

            .sbar-course {
                margin: 0 16px 12px 16px;
                padding: 10px 12px;
                background: var(--bg, #f6f7fb);
                border: 1px solid var(--border, #e5e7eb);
                border-radius: calc(10px * var(--radius-mult-tl, var(--radius-mult, 1))) calc(10px * var(--radius-mult-tr, var(--radius-mult, 1))) calc(10px * var(--radius-mult-br, var(--radius-mult, 1))) calc(10px * var(--radius-mult-bl, var(--radius-mult, 1)));
            }

            .sbar-course-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.03em;
                color: var(--muted, #6b7280);
            }

            .sbar-course-value {
                font-size: 13px;
                font-weight: 700;
                color: var(--accent, #4f46e5);
                margin-top: 2px;
            }

            .sbar-scroll {
                flex: 1;
                overflow-y: auto;
                padding: 4px 12px 16px 12px;
            }

            .sbar-section {
                margin-bottom: 18px;
            }

            .sbar-section-title {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--muted, #6b7280);
                font-weight: 700;
                margin: 0 8px 6px 8px;
            }

            .sbar-links {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .sbar-link {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 9px 10px;
                border-radius: calc(10px * var(--radius-mult-tl, var(--radius-mult, 1))) calc(10px * var(--radius-mult-tr, var(--radius-mult, 1))) calc(10px * var(--radius-mult-br, var(--radius-mult, 1))) calc(10px * var(--radius-mult-bl, var(--radius-mult, 1)));
                text-decoration: none;
                color: var(--text, #1f2937);
                font-size: 13.5px;
                font-weight: 500;
                border: 1px solid transparent;
                transition: background 0.15s ease, border-color 0.15s ease;
            }

            .sbar-link:hover {
                background: var(--bg, #f6f7fb);
                border-color: var(--border, #e5e7eb);
            }

            .sbar-link.sbar-active {
                background: var(--accent, #4f46e5);
                color: white;
                font-weight: 700;
            }

            .sbar-icon {
                font-size: 15px;
                width: 18px;
                text-align: center;
                flex-shrink: 0;
            }

            body.has-sidebar {
                transition: margin-left 0.2s ease;
            }

            @media (min-width: 901px) {
                body.has-sidebar {
                    margin-left: var(--sidebar-space, 250px) !important;
                }
            }

            @media (max-width: 900px) {
                #latinSidebar {
                    transform: translateX(-100%);
                    width: min(82vw, 280px);
                }

                #latinSidebar.sbar-open {
                    transform: translateX(0);
                }

                #latinSidebar.sbar-collapsed {
                    width: min(82vw, 280px);
                }

                #latinSidebar.sbar-collapsed .sbar-brand,
                #latinSidebar.sbar-collapsed .sbar-course,
                #latinSidebar.sbar-collapsed .sbar-section-title,
                #latinSidebar.sbar-collapsed .sbar-label {
                    display: block;
                }

                #latinSidebar.sbar-collapsed .sbar-link {
                    justify-content: flex-start;
                    padding: 9px 10px;
                }

                #latinSidebarToggle {
                    display: flex;
                }

                .sbar-close {
                    display: inline-block;
                }

                .sbar-collapse-btn {
                    display: none;
                }

                body.has-sidebar {
                    margin-left: 0 !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function getCourseLabel() {
        const course = localStorage.getItem("activeCourse");

        // COURSES (vocab/vocabData.js) isn't loaded on every page that
        // includes the sidebar - fall back to the old two-course labels
        // when it isn't available.
        if (typeof COURSES !== "undefined") {
            return COURSES[course] ? COURSES[course].label : "Not selected yet";
        }

        if (course === "clc") return "Cambridge Latin Course";
        if (course === "dr") return "De Romanis Course";

        return "Not selected yet";
    }

    /*
        Exposed globally so a page with its own course-switching UI (e.g.
        index.html's "Current Latin Course" buttons) can call this right
        after changing localStorage.activeCourse, so the sidebar updates
        immediately instead of only on the next full page load.
    */
    function refreshSidebarCourse() {
        const el = document.getElementById("sbarCourseValue");
        if (el) el.textContent = getCourseLabel();
    }
    window.refreshSidebarCourse = refreshSidebarCourse;

    function buildSidebarLinksHTML(siteRoot, currentPath) {
        return sidebarSections.map(section => {
            const linksHTML = section.links.map(link => {
                const fullUrl = new URL(link.href, siteRoot).href;
                const linkPath = new URL(fullUrl).pathname.replace(/\/+$/, "");
                const isActive = linkPath === currentPath;

                return `<a class="sbar-link${isActive ? " sbar-active" : ""}" href="${fullUrl}" title="${link.label}">` +
                    `<span class="sbar-icon">${link.icon}</span>` +
                    `<span class="sbar-label">${link.label}</span>` +
                    `</a>`;
            }).join("");

            return `
                <div class="sbar-section">
                    <div class="sbar-section-title">${section.title}</div>
                    <div class="sbar-links">${linksHTML}</div>
                </div>
            `;
        }).join("");
    }

    function initSidebar() {
        if (document.getElementById("latinSidebar")) return;

        ensureViewportMeta();
        injectSidebarStyles();

        const siteRoot = getSiteRootUrl();
        let currentPath = window.location.pathname.replace(/\/+$/, "");
        if (currentPath === "" || currentPath.endsWith("/")) {
            currentPath = new URL("index.html", window.location.href).pathname;
        }

        const nav = document.createElement("nav");
        nav.id = "latinSidebar";
        nav.setAttribute("aria-label", "Main navigation");

        nav.innerHTML = `
            <div class="sbar-header">
                <span class="sbar-brand">📜 Latin Study Aid</span>
                <button type="button" id="sbarCollapseToggle" class="sbar-collapse-btn" aria-label="Collapse sidebar" title="Collapse sidebar">«</button>
                <button type="button" id="sbarClose" class="sbar-close" aria-label="Close menu">✕</button>
            </div>
            <div class="sbar-theme">
                <button type="button" id="sbarThemeToggle" class="sbar-theme-btn" aria-label="Switch theme" title="Switch theme">☀️</button>
            </div>
            <div class="sbar-course">
                <div class="sbar-course-label">Course</div>
                <div class="sbar-course-value" id="sbarCourseValue">${getCourseLabel()}</div>
            </div>
            <div class="sbar-scroll">
                ${buildSidebarLinksHTML(siteRoot, currentPath)}
            </div>
        `;

        nav.querySelector("#sbarThemeToggle").addEventListener("click", cycleTheme);

        const backdrop = document.createElement("div");
        backdrop.id = "latinSidebarBackdrop";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.id = "latinSidebarToggle";
        toggle.setAttribute("aria-label", "Open menu");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = "☰";

        document.body.appendChild(toggle);
        document.body.appendChild(backdrop);
        document.body.appendChild(nav);
        document.body.classList.add("has-sidebar");

        applyTheme(getSavedTheme());

        function openSidebar() {
            nav.classList.add("sbar-open");
            backdrop.classList.add("sbar-open");
            toggle.setAttribute("aria-expanded", "true");
        }

        function closeSidebar() {
            nav.classList.remove("sbar-open");
            backdrop.classList.remove("sbar-open");
            toggle.setAttribute("aria-expanded", "false");
        }

        toggle.addEventListener("click", () => {
            if (nav.classList.contains("sbar-open")) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });

        backdrop.addEventListener("click", closeSidebar);
        nav.querySelector("#sbarClose").addEventListener("click", closeSidebar);

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeSidebar();
        });

        /*
            Desktop-only collapse-to-rail. Persisted so it stays collapsed
            across page loads. --sidebar-space is kept in sync so other
            fixed UI (the music player) can size itself to never overlap
            the sidebar, on both desktop widths (expanded/collapsed) and
            mobile (where the sidebar is an overlay drawer, so space is 0).
        */
        const SIDEBAR_WIDTH_EXPANDED = 250;
        const SIDEBAR_WIDTH_COLLAPSED = 64;
        const collapseBtn = nav.querySelector("#sbarCollapseToggle");

        function updateSidebarSpaceVar() {
            const isDesktop = window.matchMedia("(min-width: 901px)").matches;
            const isCollapsed = nav.classList.contains("sbar-collapsed");
            const space = isDesktop
                ? (isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED)
                : 0;

            document.documentElement.style.setProperty("--sidebar-space", space + "px");
        }

        function applyCollapseState() {
            const isCollapsed = nav.classList.contains("sbar-collapsed");
            collapseBtn.innerHTML = isCollapsed ? "»" : "«";
            collapseBtn.setAttribute("aria-label", isCollapsed ? "Expand sidebar" : "Collapse sidebar");
            collapseBtn.title = isCollapsed ? "Expand sidebar" : "Collapse sidebar";
            updateSidebarSpaceVar();
        }

        if (localStorage.getItem("sidebarCollapsed") === "true") {
            nav.classList.add("sbar-collapsed");
        }
        applyCollapseState();

        collapseBtn.addEventListener("click", () => {
            nav.classList.toggle("sbar-collapsed");
            localStorage.setItem(
                "sidebarCollapsed",
                nav.classList.contains("sbar-collapsed") ? "true" : "false"
            );
            applyCollapseState();
        });

        window.addEventListener("resize", updateSidebarSpaceVar);
    }

    window.addEventListener("load", initSidebar);
})();
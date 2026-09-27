// Full-table view for copying into Excel: all entries split across 5 pages,
// with every row of the current page in the DOM (no virtual scrolling).
// Uses buildRows, DATA_URL, LATIN_COLS and FREQUENCY from app.js.
//
// The columns come from a "view". The default is the vocab.xlsx layout;
// a page can set window.TABLE_VIEW first (see raw.js) to show other columns.
// Rows must have latin[], english[], type, freq and search for the filters.

(() => {
  const $ = (id) => document.getElementById(id);
  const FREQ_ORDER = 'ABCDEFIMN';
  const PAGES = 5;
  const state = { rows: [], filtered: [], nEng: 1, page: 0 };

  const vocabView = {
    build: buildRows,
    header: () => headerCells(state.nEng),
    values: (r) => rowValues(r, state.nEng),
    cellClass(i, r, n) {
      if (i < LATIN_COLS) return 'latin';
      if (i === n - 1) return `freq f-${r.freq}`;
      return i >= LATIN_COLS + 3 ? 'english' : '';
    },
  };
  const view = () => window.TABLE_VIEW || vocabView;

  const esc = (s) => (s == null ? '' : String(s))
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function filterRows() {
    const q = $('search').value.trim();
    const where = $('searchIn').value;
    const type = $('type').value;
    const maxFreq = $('freq').value;
    const sort = $('sort').value;
    // Match from the start of a word, so "war" finds "war, warfare" but not "towards".
    const re = new RegExp('(^|[^a-z])' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    let rows = state.rows.filter((r) => {
      if (type && r.type !== type) return false;
      if (maxFreq && FREQ_ORDER.indexOf(r.freq) > FREQ_ORDER.indexOf(maxFreq)) return false;
      if (!q) return true;
      if (where === 'latin') return r.latin.some((l) => re.test(l));
      if (where === 'english') return r.english.some((m) => re.test(m));
      return re.test(r.search);
    });

    if (sort === 'freq') {
      rows = rows.slice().sort((a, b) => FREQ_ORDER.indexOf(a.freq) - FREQ_ORDER.indexOf(b.freq) || a.id - b.id);
    } else if (sort === 'latin') {
      rows = rows.slice().sort((a, b) => (a.latin[0] || '').localeCompare(b.latin[0] || '', 'la', { sensitivity: 'base' }));
    }
    return rows;
  }

  function headerCells(nEng) {
    return [...Array(LATIN_COLS).fill('Latin'), 'Word type', 'Word Subtype', 'Additional Info',
      ...Array(nEng).fill('English'), 'Frequency'];
  }

  // Cell values for one row, in column order (shared by the table, CSV and copy).
  function rowValues(r, nEng) {
    const vals = [];
    for (let i = 0; i < LATIN_COLS; i++) vals.push(r.latin[i] || '');
    vals.push(r.type, r.subtype, r.info);
    for (let i = 0; i < nEng; i++) vals.push(r.english[i] || '');
    vals.push(FREQUENCY[r.freq] || r.freq);
    return vals;
  }

  function rowHtml(r) {
    const vals = view().values(r);
    return '<tr>' + vals.map((v, i) => `<td class="${view().cellClass(i, r, vals.length)}">${esc(v)}</td>`).join('') + '</tr>';
  }

  const pageCount = () => (state.filtered.length > 1000 ? PAGES : 1);
  const pageSize = () => Math.ceil(state.filtered.length / pageCount()) || 1;
  const pageRows = () => state.filtered.slice(state.page * pageSize(), (state.page + 1) * pageSize());

  function renderPage() {
    const rows = pageRows();
    const start = state.page * pageSize();

    $('head').innerHTML = '<tr>' + view().header().map((h) => `<th>${esc(h)}</th>`).join('') + '</tr>';
    $('body').innerHTML = '';
    $('count').textContent = `Loading ${rows.length.toLocaleString()} rows…`;

    // Let the "Loading" message paint before the (slow) single insert of the whole page.
    setTimeout(() => {
      $('body').innerHTML = rows.map(rowHtml).join('');
      $('count').textContent = rows.length
        ? `Rows ${(start + 1).toLocaleString()}–${(start + rows.length).toLocaleString()} of ${state.filtered.length.toLocaleString()}`
        : 'No matches';
    }, 30);

    const tabs = $('pages');
    tabs.innerHTML = '';
    for (let p = 0; p < pageCount(); p++) {
      const b = document.createElement('button');
      b.textContent = `Page ${p + 1}`;
      b.className = p === state.page ? 'active' : '';
      b.addEventListener('click', () => { state.page = p; renderPage(); });
      tabs.appendChild(b);
    }
  }

  function applyFilters() {
    state.filtered = filterRows();
    // Same number of English columns on every page, so pasted pages line up in Excel.
    state.nEng = state.filtered.reduce((n, r) => Math.max(n, r.english.length), 1);
    state.page = 0;
    renderPage();
  }

  // Tab-separated text pastes straight into Excel columns.
  async function copyPage() {
    const clean = (v) => String(v).replace(/[\t\r\n]+/g, ' ');
    const lines = [];
    if (state.page === 0 || $('copyHeader').checked) lines.push(view().header().map(clean).join('\t'));
    for (const r of pageRows()) lines.push(view().values(r).map(clean).join('\t'));
    const text = lines.join('\r\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API can be unavailable (e.g. some file:// pages); fall back to execCommand.
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    $('copyMsg').textContent = `Copied ${pageRows().length.toLocaleString()} rows — paste into Excel`;
    setTimeout(() => { $('copyMsg').textContent = ''; }, 4000);
  }

  function csvEscape(s) {
    s = s == null ? '' : String(s);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function downloadCsv() {
    const lines = [view().header().map(csvEscape).join(',')];
    for (const r of state.filtered) lines.push(view().values(r).map(csvEscape).join(','));
    // BOM so Excel opens it as UTF-8.
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'latin_vocab.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function load(entries) {
    state.rows = view().build(entries);
    for (const t of [...new Set(state.rows.map((r) => r.type))].sort()) {
      const o = document.createElement('option');
      o.value = o.textContent = t;
      $('type').appendChild(o);
    }
    $('loader').hidden = true;
    $('app').hidden = false;
    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', () => {
    let timer;
    $('search').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(applyFilters, 400); });
    for (const id of ['searchIn', 'type', 'freq', 'sort']) $(id).addEventListener('change', applyFilters);
    $('csv').addEventListener('click', downloadCsv);
    $('copy').addEventListener('click', copyPage);
    $('file').addEventListener('change', async (ev) => {
      const f = ev.target.files[0];
      if (f) load(JSON.parse(await f.text()));
    });

    fetch(DATA_URL)
      .then((res) => { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(load)
      .catch(() => {
        // Browsers block fetch() on file:// pages, so fall back to picking the file.
        $('status').textContent = `Couldn't load ${DATA_URL} automatically (this happens when the page is opened directly from disk). Choose the file below, or run a local server.`;
        $('picker').hidden = false;
      });
  });
})();

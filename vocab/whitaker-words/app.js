// Latin vocab table built from Whitaker's WORDS (output/DICTLINE.json).
// Each dictionary entry is turned into a row shaped like vocab.xlsx:
//   Latin x4 | Word type | Word Subtype | Additional Info | English x N

const DATA_URL = 'output/DICTLINE.json';
const PAGE_SIZE = 100;
const LATIN_COLS = 4;

// ---------- Code tables (from the WORDS documentation) ----------

const GENDER = { M: 'masculine', F: 'feminine', N: 'neuter', C: 'common (m/f)', X: '' };

const NOUN_KIND = {
  N: 'proper name', L: 'place name', W: 'place (where)', P: 'person',
  G: 'group', A: 'abstract', T: '', X: '',
};

const VERB_KIND = {
  TRANS: 'transitive', INTRANS: 'intransitive', DAT: '+ dative', ABL: '+ ablative',
  IMPERS: 'impersonal', PERFDEF: 'perfect forms only (present meaning)',
  TO_BEING: 'compound of sum', SEMIDEP: 'semi-deponent', DEP: '', X: '',
};

const PRONOUN_KIND = {
  PERS: 'personal', REFLEX: 'reflexive', DEMONS: 'demonstrative', REL: 'relative',
  INTERR: 'interrogative', INDEF: 'indefinite', ADJECT: 'adjectival', X: '',
};

const CASE = { ACC: 'accusative', ABL: 'ablative', GEN: 'genitive' };
const CASE_SHORT = { ACC: '+ acc', ABL: '+ abl', GEN: '+ gen' };

const NUMERAL_SORT = { CARD: 'cardinal', ORD: 'ordinal', DIST: 'distributive', ADVERB: 'numeral adverb' };

const FREQUENCY = {
  A: 'very frequent', B: 'frequent', C: 'common', D: 'lesser',
  E: 'uncommon', F: 'very rare', I: 'inscription only', M: 'graffiti only', N: 'Pliny only',
};

const AGE = {
  A: 'archaic', B: 'early Latin', C: 'classical', D: 'late Latin',
  E: 'later Latin', F: 'medieval', G: 'scholarly/renaissance', H: 'modern',
};

const AREA = {
  A: 'agriculture', B: 'biology/medicine', D: 'arts', E: 'ecclesiastical/biblical',
  G: 'grammar/rhetoric', L: 'legal', P: 'poetic', S: 'science/philosophy',
  T: 'technical', W: 'military', Y: 'mythology',
};

const ordinal = (n) => ({ 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th' }[n] || `${n}th`);

// ---------- Helpers ----------

const has = (s) => s && s !== 'NO_STEM';
// Stem + ending, or '' if the stem is missing.
const form = (stem, ending = '') => (has(stem) ? stem + ending : '');
const key = (a, b) => `${a}.${b}`;

// ---------- Nouns ----------

const NOUN_NOM = {
  '1.1': 'a', '1.6': 'e', '1.7': 'es', '1.8': 'as',
  '2.1': 'us', '2.2': 'um', '2.3': '', '2.5': 'us', '2.6': 'os', '2.7': '', '2.8': 'on', '2.9': 'us',
  '4.1': 'us', '4.2': 'u', '4.3': 'us', '5.1': 'es',
};
const NOUN_GEN = { 1: 'ae', 2: 'i', 3: 'is', 4: 'us', 5: 'ei' };

function nounRow(e) {
  const [s1, s2] = e.stems;
  const d = +e.declension, v = +e.declension_variant;
  const info = [GENDER[e.gender], NOUN_KIND[e.noun_kind]];
  let latin, subtype;

  if (d === 9) {
    latin = v === 8 ? [form(s1, '.')] : [form(s1)];
    subtype = v === 8 ? 'abbreviation' : 'indeclinable';
  } else {
    let nom = NOUN_NOM[key(d, v)];
    if (d === 2 && v === 4) nom = e.gender === 'N' ? 'um' : 'us';
    if (nom === undefined) nom = ''; // 3rd declension etc.: stem 1 is the full nominative
    let gen = NOUN_GEN[d];
    if (key(d, v) === '1.6') gen = 'es';
    if (key(d, v) === '4.3') gen = 'u';
    latin = [form(s1, nom), form(s2, gen)];
    subtype = `${ordinal(d)} declension`;
    if ([6, 7, 8, 9].includes(v) && d <= 3) info.push('Greek-type');
  }
  return { latin, type: 'noun', subtype, info };
}

// ---------- Verbs ----------

const INF_ACTIVE = {
  1: 'are', 2: 'ere', '3.1': 'ere', '3.2': 're', '3.3': 'ieri', '3.4': 'ire',
  '5.1': 'esse', '6.1': 're', '6.2': 'le', '7.3': 'se',
};
const INF_PASSIVE = { 1: 'ari', 2: 'eri', '3.1': 'i', '3.2': 'ri', '3.3': 'ieri', '3.4': 'iri', '6.1': 'ri' };
const FIRST_ACTIVE = { 1: 'o', 2: 'eo', 3: 'o', 5: 'um', 6: 'o', 7: 'o' };
const FIRST_PASSIVE = { 1: 'or', 2: 'eor', 3: 'or', 6: 'or' };
const IMPERS_3SG = { 1: 'at', 2: 'et', '3.1': 'it', '3.2': 't', '3.4': 't', '6.1': 't' };

const lookup = (table, c, v) => table[key(c, v)] ?? table[c];

function verbSubtype(c, v, s1, s2) {
  if (c === 3 && v === 4) return '4th conj';
  if (c === 3 && v === 1 && has(s1) && has(s2) && s1 === s2 + 'i') return 'Mixed conj';
  if (c === 3 && v === 1) return '3rd conj';
  if (c === 1 || c === 2) return `${ordinal(c)} conj`;
  if (c === 8) return 'archaic forms';
  if (c === 9) return 'indeclinable';
  return 'irregular conj';
}

function verbRow(e) {
  const [s1, s2, s3, s4] = e.stems;
  const c = +e.conjugation, v = +e.conjugation_variant;
  const kind = e.verb_kind;
  const subtype = verbSubtype(c, v, s1, s2);
  const info = [VERB_KIND[kind]];
  let latin;
  let type = 'verb';

  if (c === 9) {
    latin = [form(s1)];
  } else if (kind === 'PERFDEF') {
    latin = [form(s3, 'i'), form(s3, 'isse'), form(s4, 'um')];
  } else if (kind === 'DEP') {
    type = 'deponent verb';
    latin = [
      form(s1, lookup(FIRST_PASSIVE, c, v) ?? 'or'),
      form(s2, lookup(INF_PASSIVE, c, v) ?? 'i'),
      form(s4, 'us sum'),
    ];
  } else if (kind === 'IMPERS' && c !== 5 && c !== 7) {
    const third = lookup(IMPERS_3SG, c, v);
    latin = [
      third !== undefined ? form(s1, third) : form(s1, lookup(FIRST_ACTIVE, c, v) ?? 'o'),
      form(s2, lookup(INF_ACTIVE, c, v) ?? ''),
      form(s3, 'it'),
      form(s4, 'um est'),
    ];
  } else if (c === 5) {
    // sum and its compounds (absum, possum, ...)
    const inf = v === 2 ? form(s1, 'e') : form(s2, 'esse');
    latin = kind === 'IMPERS'
      ? [form(s2, 'est'), form(s2, 'esse'), form(s3, 'it')]
      : [form(s1, 'um'), inf, form(s3, 'i'), form(s4, 'urus')];
  } else if (c === 7) {
    // defective verbs: aio, inquam, edo
    if (v === 2) latin = kind === 'IMPERS' ? [form(s2, 'it')] : [form(s2, 'am')];
    else if (v === 1) latin = kind === 'IMPERS' ? [form(s2, 'it')] : [form(s1, 'o')];
    else latin = [form(s1, 'o'), form(s2, 'se')];
    info.push('defective');
  } else if (c === 8) {
    // archaic alternative forms, e.g. amasso, capso; variant gives the base conjugation
    latin = [form(s1, FIRST_ACTIVE[v] ?? 'o'), form(s2, INF_ACTIVE[v] ?? 'ere'), form(s3, 'o')];
  } else {
    latin = [
      form(s1, lookup(FIRST_ACTIVE, c, v) ?? 'o'),
      form(s2, lookup(INF_ACTIVE, c, v) ?? ''),
      kind === 'SEMIDEP' ? form(s4, 'us sum') : form(s3, 'i'),
      kind === 'SEMIDEP' ? '' : form(s4, 'um'),
    ];
    if (kind === 'SEMIDEP') type = 'deponent verb';
  }
  return { latin, type, subtype, info };
}

// ---------- Adjectives ----------

const GREEK_ADJ = { 1: 'e', 2: 'a', 3: 'es', 6: 'os', 7: 'os', 8: 'on' };

function adjectiveRow(e) {
  const [s1, s2, s3, s4] = e.stems;
  const d = +e.declension, v = +e.declension_variant;
  const info = [];
  let latin, subtype;

  if (d === 0 && e.comparison === 'COMP') {
    latin = [form(s1, 'or'), form(s1, 'or'), form(s1, 'us')];
    subtype = 'comparative';
  } else if (d === 0 && e.comparison === 'SUPER') {
    latin = [form(s1, 'mus'), form(s1, 'ma'), form(s1, 'mum')];
    subtype = 'superlative';
  } else if (d === 9) {
    latin = v === 8 ? [form(s1, '.')] : [form(s1)];
    subtype = v === 8 ? 'abbreviation' : 'indeclinable';
  } else if (d === 1) {
    subtype = '1st & 2nd declension';
    if (v === 2 || v === 4) latin = [form(s1), form(s2, 'a'), form(s2, 'um')];
    else latin = [form(s1, 'us'), form(s2, 'a'), form(s2, v === 5 ? 'ud' : 'um')];
    if (v >= 3) info.push('genitive in -ius');
  } else if (d === 2) {
    latin = [form(s1, GREEK_ADJ[v] ?? '')];
    subtype = '2nd declension';
    info.push('Greek-type');
  } else if (d === 3) {
    subtype = '3rd declension';
    if (v === 2) { latin = [form(s1, 'is'), form(s2, 'e')]; info.push('two terminations'); }
    else if (v === 3) { latin = [form(s1), form(s2, 'is'), form(s2, 'e')]; info.push('three terminations'); }
    else if (v === 6) { latin = [form(s1), form(s2, 'os')]; info.push('Greek-type'); }
    else { latin = [form(s1), form(s2, 'is')]; info.push('one termination (gen. given)'); }
  } else {
    latin = [form(s1)];
    subtype = '';
  }

  if (e.comparison === 'COMP' && d !== 0) subtype = 'comparative';
  if (e.comparison === 'SUPER' && d !== 0) subtype = 'superlative';
  const comp = form(s3, 'or'), sup = form(s4, 'mus');
  // A few adjectives only exist in comparative/superlative (e.g. deterior, deterrimus).
  if (!latin.some(Boolean)) {
    latin = [comp, sup].filter(Boolean);
    subtype = 'comparative/superlative only';
  } else if (d !== 0 && (comp || sup)) {
    info.push([comp && `comp. ${comp}`, sup && `sup. ${sup}`].filter(Boolean).join(', '));
  }
  return { latin, type: 'adjective', subtype, info };
}

// ---------- Adverbs ----------

function adverbRow(e) {
  const [s1, s2, s3] = e.stems;
  const info = [];
  if (has(s2) || has(s3)) info.push([has(s2) && `comp. ${s2}`, has(s3) && `sup. ${s3}`].filter(Boolean).join(', '));
  const subtype = { COMP: 'comparative', SUPER: 'superlative' }[e.comparison] || '';
  // A few adverbs only exist in comparative/superlative (e.g. peius, pessime).
  const latin = has(s1) ? [s1] : [s2, s3].filter(has);
  return { latin, type: 'adverb', subtype, info };
}

// ---------- Pronouns & packons ----------

// Declension 1 (qui/quis family) is split by variant into single forms in WORDS.
const QUI_NOM = { 1: ['i'], 2: ['is', 'id'], 3: ['a'], 4: ['ae'], 6: ['id'], 7: ['od'], 8: ['ae'], 9: ['a'] };

function pronounLatin(e) {
  const [s1, s2] = e.stems;
  const d = +e.declension, v = +e.declension_variant;
  switch (d) {
    case 1:
      if (v === 0) return [form(s1, 'i'), form(s1, 'ae'), form(s1, 'od')];
      return (QUI_NOM[v] || ['']).map((end) => form(s1, end));
    case 3: // hic, haec, hoc
      return [form(s1, 'ic'), form(s1, 'aec'), form(s1, v === 2 ? 'uc' : 'oc')];
    case 4: // is, ea, id / idem, eadem, idem
      return v === 2
        ? [form(s1, 'dem'), form(s2, 'adem'), form(s1, 'dem')]
        : [form(s1, 's'), form(s2, 'a'), form(s1, 'd')];
    case 5: // personal: ego, mei / tu, tui / nos, nostrum / sui
      if (v === 1) return [form(s1), form(s2, 'ei')];
      if (v === 2) return [form(s1), form(s2, 'ui')];
      if (v === 3) return [form(s1, 'os'), form(s2, 'um')];
      return [form(s2, 'ui'), form(s2, 'e')];
    case 6: // ille, illa, illud / ipse, ipsa, ipsum
      return [form(s1, 'e'), form(s1, 'a'), form(s1, v === 2 ? 'um' : 'ud')];
    default:
      return [form(s1)];
  }
}

function pronounRow(e) {
  return { latin: pronounLatin(e), type: 'pronoun', subtype: PRONOUN_KIND[e.pronoun_kind], info: [] };
}

function packonRow(e) {
  // Packons are the qu-/cu- pronouns that need a suffix (-cumque, -libet, ...),
  // which WORDS records at the start of the senses, e.g. "(w/-cumque) ...".
  const suffix = (e.senses.match(/^\(w\/-(\w+)\)/) || [])[1] || '';
  const latin = pronounLatin({ ...e, declension: 1 }).map((f) => (f ? f + suffix : ''));
  return { latin, type: 'pronoun', subtype: PRONOUN_KIND[e.packon_kind], info: suffix ? [`with -${suffix}`] : [] };
}

// ---------- Numerals ----------

function numeralRow(e) {
  const [s1, s2, s3, s4] = e.stems;
  const d = +e.declension, v = +e.declension_variant;
  const sort = e.numeral_sort;
  const info = [];
  if (+e.numeral_value) info.push(`value ${e.numeral_value}`);

  if (sort !== 'X') {
    // A single form of one kind.
    let f;
    if (sort === 'ORD') f = form(s1, 'us');
    else if (sort === 'DIST') f = form(s1, 'i');
    else if (sort === 'ADVERB') f = form(s1, 'ies');
    else f = d === 2 ? form(s1) : pronounLikeCardinal(s1, v);
    return { latin: [f], type: 'numeral', subtype: NUMERAL_SORT[sort], info };
  }

  info.push('cardinal, ordinal, distributive, adverb');
  let card, adv;
  if (d === 1) {
    card = pronounLikeCardinal(s1, v);
    adv = { 1: form(s4), 2: form(s4), 3: form(s4) }[v] ?? form(s4, 'iens');
  } else {
    card = form(s1);
    adv = form(s4, 'ies');
  }
  return { latin: [card, form(s2, 'us'), form(s3, 'i'), adv], type: 'numeral', subtype: 'cardinal', info };
}

function pronounLikeCardinal(stem, v) {
  return form(stem, { 1: 'us', 2: 'o', 3: 'es', 4: 'i' }[v] ?? '');
}

// ---------- Uninflected ----------

function prepositionRow(e) {
  return {
    latin: [form(e.stems[0])], type: 'preposition',
    subtype: `${CASE[e.case]}-governing`, info: [CASE_SHORT[e.case]],
  };
}

const simpleRow = (type) => (e) => ({ latin: [form(e.stems[0])], type, subtype: '', info: [] });

const BUILDERS = {
  N: nounRow, V: verbRow, ADJ: adjectiveRow, ADV: adverbRow, PRON: pronounRow, PACK: packonRow,
  NUM: numeralRow, PREP: prepositionRow,
  CONJ: simpleRow('conjunction'), INTERJ: simpleRow('interjection'),
};

// ---------- Senses → English columns ----------

// Split on ; and , that are not inside () or []. Bracketed [...] notes
// (usually example phrases) are returned separately for Additional Info.
function splitSenses(senses) {
  const meanings = [], notes = [];
  let depth = 0, buf = '';
  const flush = () => {
    const t = buf.trim();
    buf = '';
    if (!t) return;
    if (/^\[.*\]$/.test(t)) notes.push(t.slice(1, -1).trim());
    else meanings.push(t);
  };
  for (const ch of senses) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if ((ch === ';' || ch === ',') && depth === 0) flush();
    else buf += ch;
  }
  flush();
  return { meanings: [...new Set(meanings)], notes };
}

// ---------- Entry → row ----------

// Lines whose senses start with "|" (or "||", ...) continue the previous entry's senses.
function mergeContinuations(entries) {
  const out = [];
  for (const e of entries) {
    const prev = out[out.length - 1];
    if (e.senses.startsWith('|') && prev) prev.senses += '; ' + e.senses.replace(/^\|+/, '');
    else out.push({ ...e });
  }
  return out;
}

function buildRow(e, id) {
  const builder = BUILDERS[e.pos] || simpleRow(e.pos.toLowerCase());
  const r = builder(e);
  const { meanings, notes } = splitSenses(e.senses);

  const usage = [];
  if (AGE[e.age]) usage.push(AGE[e.age]);
  if (AREA[e.area]) usage.push(AREA[e.area]);

  const latin = r.latin.filter(Boolean);
  return {
    id,
    pos: e.pos,
    latin,
    type: r.type,
    subtype: r.subtype || '',
    info: [...r.info, ...usage, ...notes].filter(Boolean).join('; '),
    english: meanings,
    freq: e.frequency,
    search: latin.join(' ') + ' | ' + meanings.join(' | '),
  };
}

function buildRows(entries) {
  return mergeContinuations(entries).map(buildRow);
}

if (typeof module !== 'undefined') module.exports = { buildRows, splitSenses };

// ---------- UI ----------

if (typeof document !== 'undefined') {
  const $ = (id) => document.getElementById(id);
  const state = { rows: [], filtered: [], page: 0 };

  const FREQ_ORDER = 'ABCDEFIMN';

  function applyFilters() {
    const q = $('search').value.trim().toLowerCase();
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

    state.filtered = rows;
    state.page = 0;
    render();
  }

  function englishColumnCount(rows) {
    let n = 1;
    for (const r of rows) n = Math.max(n, r.english.length);
    return n;
  }

  function cell(text, cls) {
    const td = document.createElement('td');
    if (cls) td.className = cls;
    td.textContent = text || '';
    return td;
  }

  function render() {
    const rows = state.filtered;
    const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    state.page = Math.min(state.page, pages - 1);
    const pageRows = rows.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE);
    const nEng = englishColumnCount(pageRows);

    // Header, laid out like vocab.xlsx.
    const head = $('head');
    head.innerHTML = '';
    const tr = document.createElement('tr');
    const headers = [
      ...Array(LATIN_COLS).fill('Latin'), 'Word type', 'Word Subtype', 'Additional Info',
      ...Array(nEng).fill('English'), 'Frequency',
    ];
    headers.forEach((h, i) => {
      const th = document.createElement('th');
      th.textContent = h;
      if (i < LATIN_COLS) th.className = 'latin';
      else if (h === 'English') th.className = 'english';
      tr.appendChild(th);
    });
    head.appendChild(tr);

    const body = $('body');
    const frag = document.createDocumentFragment();
    for (const r of pageRows) {
      const row = document.createElement('tr');
      for (let i = 0; i < LATIN_COLS; i++) row.appendChild(cell(r.latin[i], 'latin'));
      row.appendChild(cell(r.type, 'type'));
      row.appendChild(cell(r.subtype));
      row.appendChild(cell(r.info, 'info'));
      for (let i = 0; i < nEng; i++) row.appendChild(cell(r.english[i], 'english'));
      const f = cell(r.freq, `freq f-${r.freq}`);
      f.title = FREQUENCY[r.freq] || '';
      row.appendChild(f);
      frag.appendChild(row);
    }
    body.innerHTML = '';
    body.appendChild(frag);

    $('count').textContent = `${rows.length.toLocaleString()} of ${state.rows.length.toLocaleString()} entries`;
    $('pageInfo').textContent = `Page ${state.page + 1} of ${pages}`;
    $('prev').disabled = state.page === 0;
    $('next').disabled = state.page >= pages - 1;
  }

  function csvEscape(s) {
    s = s == null ? '' : String(s);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function downloadCsv() {
    const rows = state.filtered;
    const nEng = englishColumnCount(rows);
    const header = [
      ...Array(LATIN_COLS).fill('Latin'), 'Word type', 'Word Subtype', 'Additional Info',
      ...Array(nEng).fill('English'), 'Frequency',
    ];
    const lines = [header.join(',')];
    for (const r of rows) {
      const cols = [];
      for (let i = 0; i < LATIN_COLS; i++) cols.push(r.latin[i]);
      cols.push(r.type, r.subtype, r.info);
      for (let i = 0; i < nEng; i++) cols.push(r.english[i]);
      cols.push(FREQUENCY[r.freq] || r.freq);
      lines.push(cols.map(csvEscape).join(','));
    }
    // BOM so Excel opens it as UTF-8.
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'latin_vocab.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function load(entries) {
    state.rows = buildRows(entries);
    const types = [...new Set(state.rows.map((r) => r.type))].sort();
    for (const t of types) {
      const o = document.createElement('option');
      o.value = o.textContent = t;
      $('type').appendChild(o);
    }
    $('loader').hidden = true;
    $('app').hidden = false;
    applyFilters();
  }

  function init() {
    let timer;
    $('search').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(applyFilters, 200); });
    for (const id of ['searchIn', 'type', 'freq', 'sort']) $(id).addEventListener('change', applyFilters);
    $('prev').addEventListener('click', () => { state.page--; render(); window.scrollTo(0, 0); });
    $('next').addEventListener('click', () => { state.page++; render(); window.scrollTo(0, 0); });
    $('csv').addEventListener('click', downloadCsv);
    $('file').addEventListener('change', async (ev) => {
      const f = ev.target.files[0];
      if (f) load(JSON.parse(await f.text()));
    });

    fetch(DATA_URL)
      .then((res) => { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(load)
      .catch(() => {
        // Browsers block fetch() on file:// pages, so fall back to picking the file.
        $('status').textContent = `Couldn't load ${DATA_URL} automatically (this happens when index.html is opened directly from disk). Choose the file below, or run a local server.`;
        $('picker').hidden = false;
      });
  }

  // Only the paged page (index.html) has a pager; index-all.html reuses buildRows with its own UI.
  document.addEventListener('DOMContentLoaded', () => { if ($('pageInfo')) init(); });
}

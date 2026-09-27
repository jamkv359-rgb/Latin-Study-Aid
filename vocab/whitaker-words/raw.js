// "All fields" view for index-raw.html: one row per DICTLINE.json entry, with
// every attribute shown and the WORDS single-letter codes spelled out.
// Uses BUILDERS (for Word type / Subtype) from app.js; the table itself is all.js.

// Code meanings from Whitaker's WORDS documentation.
const RAW_CODES = {
  pos: {
    N: 'noun', PRON: 'pronoun', PACK: 'packon (qu-/cu- pronoun base)', ADJ: 'adjective', NUM: 'numeral',
    ADV: 'adverb', V: 'verb', PREP: 'preposition', CONJ: 'conjunction', INTERJ: 'interjection',
  },
  age: {
    X: 'In use throughout the ages / unknown',
    A: 'Archaic (very early forms, obsolete by classical times)',
    B: 'Early (pre-classical, used for effect and poetry)',
    C: 'Classical (c. 150 BC – 200 AD)',
    D: 'Late (post-classical, 3rd–5th centuries)',
    E: 'Later (6th–10th centuries, Christian)',
    F: 'Medieval (11th–15th centuries)',
    G: 'Scholar (post-15th century scholarly/scientific)',
    H: 'Modern (coined recently)',
  },
  area: {
    X: 'All or none',
    A: 'Agriculture, flora, fauna, land, equipment, rural',
    B: 'Biological, medical, body parts',
    D: 'Drama, music, theater, art, painting, sculpture',
    E: 'Ecclesiastic, biblical, religious',
    G: 'Grammar, rhetoric, logic, literature, schools',
    L: 'Legal, government, tax, financial, political, titles',
    P: 'Poetic',
    S: 'Science, philosophy, mathematics, units/measures',
    T: 'Technical, architecture, topography, surveying',
    W: 'War, military, naval, ships, armor',
    Y: 'Mythology',
  },
  geography: {
    X: 'All or none',
    A: 'Africa', B: 'Britain', C: 'China', D: 'Scandinavia', E: 'Egypt', F: 'France, Gaul',
    G: 'Germany', H: 'Greece', I: 'Italy, Rome', J: 'India', K: 'Balkans', N: 'Netherlands',
    P: 'Persia', Q: 'Near East', R: 'Russia', S: 'Spain, Iberia', U: 'Eastern Europe',
  },
  frequency: {
    X: 'Unknown or unspecified',
    A: 'Very frequent (full dictionary column or more, 50+ citations)',
    B: 'Frequent (half column, 20+ citations)',
    C: 'Common (more than 5 citations)',
    D: 'Lesser (4–5 citations)',
    E: 'Uncommon (2–3 citations)',
    F: 'Very rare (only 1 citation)',
    I: 'Inscription only',
    M: 'Graffiti only',
    N: 'Pliny only (Natural History)',
  },
  source: {
    X: 'General, unknown, or too common to say',
    B: 'Beeson, A Primer of Medieval Latin (1925)',
    C: "Cassell's Latin Dictionary (1892)",
    D: 'Adams, Latin Sexual Vocabulary (1990)',
    E: 'Stelten, Dictionary of Ecclesiastical Latin (1995)',
    F: 'Deferrari, Dictionary of St. Thomas Aquinas (1960)',
    G: 'Gildersleeve & Lodge, Latin Grammar (1895)',
    H: 'Collatinus Dictionary (Yves Ouvrard)',
    I: 'Leverett, Lexicon of the Latin Language (1845)',
    J: 'Bracton, De Legibus et Consuetudinibus Angliae',
    K: 'Calepinus Novus, modern Latin (Guy Licoppe)',
    L: 'Lewis, Elementary Latin Dictionary (1891)',
    M: 'Latham, Revised Medieval Latin Word-List (1980)',
    N: 'Lynn Nelson, word list',
    O: 'Oxford Latin Dictionary (1982)',
    P: 'Souter, A Glossary of Later Latin to 600 AD (1949)',
    Q: 'Other cited or unspecified dictionaries',
    R: 'Plater & White, A Grammar of the Vulgate (1926)',
    S: 'Lewis & Short, A Latin Dictionary (1879)',
    T: 'Found in a translation (no dictionary reference)',
    U: 'Du Cange',
    V: 'Blatt, Vademecum in opus Saxonis',
    W: "Whitaker's own guess / extrapolation",
    Y: 'Temporary special code',
    Z: 'Sent by a user (no dictionary reference)',
  },
  gender: { X: 'Unknown / all', M: 'Masculine', F: 'Feminine', N: 'Neuter', C: 'Common (masculine and/or feminine)' },
  noun_kind: {
    X: 'Unknown / unspecified', S: 'Singular only', M: 'Plural only', A: 'Abstract idea',
    G: 'Group / collective name', N: 'Proper name', P: 'Person type / trade',
    T: 'Thing (concrete object)', L: 'Locale (country, city)', W: 'Place where',
  },
  pronoun_kind: {
    X: 'Unknown / unspecified', PERS: 'Personal', REL: 'Relative', REFLEX: 'Reflexive',
    DEMONS: 'Demonstrative', INTERR: 'Interrogative', INDEF: 'Indefinite', ADJECT: 'Adjectival',
  },
  verb_kind: {
    X: 'Unknown / unspecified', TO_BE: 'The verb "to be" (esse)', TO_BEING: 'Compound of esse',
    GEN: 'Takes the genitive', DAT: 'Takes the dative', ABL: 'Takes the ablative',
    TRANS: 'Transitive', INTRANS: 'Intransitive', IMPERS: 'Impersonal (no personal subject)',
    DEP: 'Deponent', SEMIDEP: 'Semi-deponent', PERFDEF: 'Perfect definite (perfect forms, present meaning)',
  },
  comparison: { X: 'Unknown / all', POS: 'Positive', COMP: 'Comparative', SUPER: 'Superlative' },
  case: { NOM: 'Nominative', GEN: 'Genitive', DAT: 'Dative', ACC: 'Accusative', ABL: 'Ablative', VOC: 'Vocative', LOC: 'Locative' },
  numeral_sort: { X: 'All kinds / unknown', CARD: 'Cardinal', ORD: 'Ordinal', DIST: 'Distributive', ADVERB: 'Numeral adverb' },
};

// Part-of-speech-specific attributes, in column order. packon_kind uses the pronoun_kind codes.
const RAW_PROPS = [
  ['declension', 'Declension'], ['declension_variant', 'Declension variant'],
  ['conjugation', 'Conjugation'], ['conjugation_variant', 'Conjugation variant'],
  ['gender', 'Gender'], ['noun_kind', 'Noun kind'], ['pronoun_kind', 'Pronoun kind'],
  ['packon_kind', 'Packon kind'], ['verb_kind', 'Verb kind'], ['comparison', 'Comparison'],
  ['case', 'Case'], ['numeral_sort', 'Numeral sort'], ['numeral_value', 'Numeral value'],
];

const RAW_HEADER = [
  'Stem 1', 'Stem 2', 'Stem 3', 'Stem 4', 'Part of speech', 'Word Subtype',
  'Age', 'Geography', 'Area', 'Frequency', 'Source', 'Senses',
  ...RAW_PROPS.map(([, label]) => label),
];

function decode(field, value) {
  if (value === undefined || value === null) return '';
  const table = RAW_CODES[field === 'packon_kind' ? 'pronoun_kind' : field];
  return (table && table[value]) || String(value);
}

function buildRawRow(e, id) {
  const built = (BUILDERS[e.pos] || (() => ({ type: e.pos, subtype: '' })))(e);
  const stems = [0, 1, 2, 3].map((i) => {
    const s = e.stems[i];
    if (s === undefined) return '';        // this word has fewer stems
    return s === 'NO_STEM' ? '—' : s;      // stem slot exists but is empty
  });
  const props = RAW_PROPS.map(([field]) =>
    (field === 'numeral_value' ? (+e[field] ? String(e[field]) : '') : decode(field, e[field])));

  const cells = [
    ...stems, decode('pos', e.pos), built.subtype || '',
    decode('age', e.age), decode('geography', e.geography), decode('area', e.area),
    decode('frequency', e.frequency), decode('source', e.source), e.senses,
    ...props,
  ];
  const realStems = e.stems.filter((s) => s !== 'NO_STEM');
  return {
    id, cells,
    // Fields used by the search/filter controls in all.js.
    latin: realStems, english: [e.senses], type: built.type, freq: e.frequency,
    search: realStems.join(' ') + ' | ' + e.senses,
  };
}

window.TABLE_VIEW = {
  build: (entries) => entries.map(buildRawRow),
  header: () => RAW_HEADER,
  values: (r) => r.cells,
  cellClass: (i, r) => (i < 4 ? 'latin' : i === 9 ? `freq-text f-${r.freq}` : i === 11 ? 'senses' : ''),
};

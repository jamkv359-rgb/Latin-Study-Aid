/*============================================================================
VOCAB DATA
vocabDataLSA (loaded from vocab/vocabDataLSA.js, generated from
vocab/vocabDataLSA.json - see that file's header for how to regenerate it)
is the single source of truth for every word. Words are now only attributed
to the DCC course (`word.course`, e.g. ["DCC - 238"]) plus each word's
topical domain(s) in `domain`. `index` is globally unique across every word.
============================================================================*/

// filterType tells the rest of the site what kind of progress-cap control a
// course needs: "range" (too many units to list individually - DCC's 997
// frequency ranks get a min/max range) or "none" (no chapter concept at all
// - the "All Words" pseudo-course, which unions every word regardless of
// course tags).
const COURSES = {
    dcc: { key: "dcc", label: "DCC Core Vocabulary", short: "DCC",       coursePrefix: "DCC", unitLabel: "Frequency", unitLabelPlural: "Frequency", hasSelector: true,  filterType: "range", maxUnit: 997 },
    all: { key: "all", label: "All Words",           short: "All Words", coursePrefix: null,  hasSelector: false, filterType: "none" }
};

function getActiveCourse() {
    const stored = localStorage.getItem("activeCourse");
    return Object.prototype.hasOwnProperty.call(COURSES, stored) ? stored : "dcc";
}

// A word's `course` array holds entries like "CLC - 14" (course + unit
// number) or "A Level" (course, no unit). Returns the unit number for
// numbered courses, null for un-numbered courses the word belongs to, or
// undefined if the word isn't in that course at all.
function getCourseUnitNumber(word, courseKey) {
    const course = COURSES[courseKey];
    if (!course || !course.coursePrefix || !Array.isArray(word.course)) return undefined;

    const entry = word.course.find(c => c === course.coursePrefix || c.indexOf(course.coursePrefix + " - ") === 0);
    if (entry === undefined) return undefined;

    const parts = entry.split(" - ");
    return parts.length === 2 ? Number(parts[1]) : null;
}

function wordInCourse(word, courseKey) {
    return courseKey === "all" || getCourseUnitNumber(word, courseKey) !== undefined;
}

// Every word belonging to `courseKey`, with `.stage` mutated to that
// course's unit number as a string (matching the old data's convention,
// since checkbox-based stage filters compare against string checkbox
// values) for clc/dr/dcc; left undefined for alevel/gcse/all, which have no
// chapter concept. This keeps the rest of the site reading word.stage
// exactly as it always has. Mutating the shared vocabDataLSA objects in
// place (rather than cloning per course) also keeps the stable object
// identity vocabTest.html/multiChoice.html rely on for "remove this word
// once answered"/"which option did they click" checks - safe since only
// one course's context is ever active on a page at a time.
function getCourseWords(courseKey) {
    if (courseKey === "all") {
        vocabDataLSA.forEach(word => { word.stage = undefined; });
        return vocabDataLSA.slice();
    }

    const words = [];
    vocabDataLSA.forEach(word => {
        const unit = getCourseUnitNumber(word, courseKey);
        if (unit === undefined) return;
        word.stage = unit === null ? undefined : String(unit);
        words.push(word);
    });
    return words;
}

// A word's `domain` entries are "Field: Subcategory" strings (e.g.
// "Abstract Concepts: Time"). The broad field is everything before the
// first colon - used to group the domain filter/sort UI the same way
// word type groups its subtypes.
function getDomainField(domain) {
    const idx = domain.indexOf(":");
    return idx === -1 ? domain : domain.slice(0, idx).trim();
}

/*============================================================================
CHAPTER/STAGE/FREQUENCY PROGRESS SELECTOR
The user picks "what frequency range am I up to" on index.html. This is the
single source of truth other pages read from to cap which vocab words
they'll show - see filterVocabUpToChapter(). DCC uses a min/max range
(getProgressRange() below); "All Words" has no selector at all
(hasSelector: false) - its full word list is always shown, uncapped.

getProgressChapter()/setProgressChapter() below are a leftover single-cap
mechanism from when CLC/De Romanis (filterType "checkbox") were also
selectable courses; no current course uses filterType "checkbox", so they're
unreachable in practice. Left in place only because index.html's
populateChapterSelect() still calls them from its filterType==="checkbox"
branch - dead code, not currently reachable by any course, but harmless.
============================================================================*/

function getMaxChapterForCourse(course) {
    const entry = COURSES[course];
    return (entry && entry.hasSelector) ? entry.maxUnit : 0;
}

function getProgressChapterKey(course) {
    if (course === "clc") return "progressChapterCLC";
    if (course === "dr") return "progressChapterDR";
    return "progressChapter_" + course;
}

function getProgressChapter(course) {
    const activeCourse = course || getActiveCourse();
    const max = getMaxChapterForCourse(activeCourse);
    if (!max) return 0;

    const stored = parseInt(localStorage.getItem(getProgressChapterKey(activeCourse)), 10);
    return (Number.isFinite(stored) && stored >= 1 && stored <= max) ? stored : max;
}

function setProgressChapter(course, chapter) {
    localStorage.setItem(getProgressChapterKey(course), String(chapter));
}

// Range-style courses (DCC) have too many units for a checkbox/dropdown
// list, so instead of a single "up to" cap the user picks a min/max range.
// Defaults to the full range until they've picked one.
function getProgressRange(course) {
    const activeCourse = course || getActiveCourse();
    const max = getMaxChapterForCourse(activeCourse);
    if (!max) return { min: 0, max: 0 };

    const storedMin = parseInt(localStorage.getItem("progressRangeMin_" + activeCourse), 10);
    const storedMax = parseInt(localStorage.getItem("progressRangeMax_" + activeCourse), 10);

    const min = (Number.isFinite(storedMin) && storedMin >= 1 && storedMin <= max) ? storedMin : 1;
    const rawMax = (Number.isFinite(storedMax) && storedMax >= 1 && storedMax <= max) ? storedMax : max;

    return { min: Math.min(min, rawMax), max: Math.max(min, rawMax) };
}

function setProgressRange(course, min, max) {
    localStorage.setItem("progressRangeMin_" + course, String(min));
    localStorage.setItem("progressRangeMax_" + course, String(max));
}

function filterVocabUpToChapter(vocabArray, course) {
    const activeCourse = course || getActiveCourse();
    const courseInfo = COURSES[activeCourse];
    if (!courseInfo || courseInfo.filterType === "none") {
        return vocabArray;
    }

    if (courseInfo.filterType === "range") {
        const range = getProgressRange(activeCourse);
        return vocabArray.filter(word => Number(word.stage) >= range.min && Number(word.stage) <= range.max);
    }

    const chapter = getProgressChapter(activeCourse);
    return vocabArray.filter(word => Number(word.stage) <= chapter);
}

/*============================================================================
VOCAB PROGRESS: {correct, incorrect} PER-WORD TRACKING
One unified store (word.index is globally unique across every course now,
unlike the old per-course scheme), keyed "i" + word.index - so a word's
mastery is shared across every course it appears in. Each entry counts every
attempt rather than just the most recent one, so recommendation/weak-word
features can tell "always gets it right" apart from "keeps getting it
wrong": { correct: 2, incorrect: 1 }.
============================================================================*/

function normalizeWordProgressEntry(entry) {
    if (entry && typeof entry === "object") {
        return {
            correct: Number(entry.correct) || 0,
            incorrect: Number(entry.incorrect) || 0
        };
    }

    // Migrate the legacy boolean format: true meant "last attempt correct".
    if (entry === true) {
        return { correct: 1, incorrect: 0 };
    }

    return { correct: 0, incorrect: 0 };
}

function isWordLearned(entry) {
    return !!entry && entry.correct > 0;
}

function isWeakWord(entry) {
    return !!entry && entry.incorrect > entry.correct;
}

function updateWordCompletion(wordObj, isCorrect) {
    const key = "i" + wordObj.index;

    const entry = normalizeWordProgressEntry(vocabProgress[key]);
    if (isCorrect) {
        entry.correct += 1;
    } else {
        entry.incorrect += 1;
    }

    vocabProgress[key] = entry;
    wordObj.completed = isWordLearned(entry);
    localStorage.setItem("latinVocabProgress", JSON.stringify(vocabProgress));
}

let vocabProgress = {};
let vocabData = [];

function loadVocab() {
    const saved = localStorage.getItem("latinVocabProgress");
    vocabProgress = saved ? JSON.parse(saved) : {};

    vocabData = getCourseWords(getActiveCourse());

    vocabData.forEach(word => {
        const key = "i" + word.index;
        vocabProgress[key] = normalizeWordProgressEntry(vocabProgress[key]);
        word.completed = isWordLearned(vocabProgress[key]);
    });

    // Save it back to local storage just to keep it clean
    localStorage.setItem("latinVocabProgress", JSON.stringify(vocabProgress));
}

loadVocab();

const achievementData =[
    { index: "01000", type: "rawVocab", criteria: "10", name: "Vocab Beginner", difficulty: "1", desc: "Complete 10 vocabulary words in your selected course", },
{ index: "01001", type: "rawVocab", criteria: "50", name: "Building Momentum", difficulty: "1", desc: "Complete 50 vocabulary words in your selected course", },
{ index: "01002", type: "rawVocab", criteria: "100", name: "Word Collector", difficulty: "2", desc: "Complete 100 vocabulary words in your selected course", },
{ index: "01003", type: "rawVocab", criteria: "250", name: "Lexicon Explorer", difficulty: "2", desc: "Complete 250 vocabulary words in your selected course", },
{ index: "01004", type: "rawVocab", criteria: "500", name: "Latin Scholar", difficulty: "3", desc: "Complete 500 vocabulary words in your selected course", },
{ index: "01005", type: "rawVocab", criteria: "750", name: "Walking Dictionary", difficulty: "4", desc: "Complete 750 vocabulary words in your selected course", },
{ index: "01006", type: "rawVocab", criteria: "888", name: "Master of Vocabulary", difficulty: "5", desc: "Complete 888 vocabulary words in your selected course", },
{ index: "02000", type: "rawGrammar", criteria: "10", name: "Verb Ending Beginner", difficulty: "1", desc: "Complete 10 Verb Endings in 1D or 2D Verb Tester", },
{ index: "02001", type: "rawGrammar", criteria: "50", name: "Tense Translator", difficulty: "1", desc: "Complete 50 Verb Endings", },
{ index: "02002", type: "rawGrammar", criteria: "100", name: "Verb Collector", difficulty: "2", desc: "Complete 100 Verb Endings", },
{ index: "02003", type: "rawGrammar", criteria: "250", name: "Conjugation Collector", difficulty: "3", desc: "Complete 250 Verb Endings", },
{ index: "02004", type: "rawGrammar", criteria: "500", name: "Mood Mystic", difficulty: "4", desc: "Complete 500 Verb Endings", },
{ index: "02005", type: "rawGrammar", criteria: "672", name: "Master of Verb Endings", difficulty: "5", desc: "Complete 672 Verb Endings", },
{ index: "03000", type: "levelling", criteria: "5", name: "1st Day of Latin", difficulty: "2", desc: "Reach level 5", },
{ index: "03001", type: "levelling", criteria: "10", name: "1st Week of Latin", difficulty: "3", desc: "Reach level 10", },
{ index: "03002", type: "levelling", criteria: "40", name: "1st Month of Latin", difficulty: "3", desc: "Reach level 40", },
{ index: "03003", type: "levelling", criteria: "160", name: "1st Semester of Latin", difficulty: "4", desc: "Reach level 160", },
{ index: "03004", type: "levelling", criteria: "360", name: "1st Year of Latin", difficulty: "4", desc: "Reach level 360", },
{ index: "03005", type: "levelling", criteria: "720", name: "1st Degree in Latin", difficulty: "4", desc: "Reach level 720", },
{ index: "03006", type: "levelling", criteria: "1000", name: "Solo Levelling", difficulty: "5", desc: "Reach level 1000", },
{ index: "04000", type: "questionsAnswered", criteria: "50", name: "First Steps", difficulty: "1", desc: "Answer 50 questions", },
{ index: "04001", type: "questionsAnswered", criteria: "250", name: "Practised Mind", difficulty: "1", desc: "Answer 250 questions", },
{ index: "04002", type: "questionsAnswered", criteria: "500", name: "Getting Serious", difficulty: "2", desc: "Answer 500 questions", },
{ index: "04003", type: "questionsAnswered", criteria: "1000", name: "Dedicated Student", difficulty: "2", desc: "Answer 1000 questions", },
{ index: "04004", type: "questionsAnswered", criteria: "2500", name: "Roman Apprentice", difficulty: "3", desc: "Answer 2500 questions", },
{ index: "04005", type: "questionsAnswered", criteria: "5000", name: "Centurion of Study", difficulty: "4", desc: "Answer 5000 questions", },
{ index: "04006", type: "questionsAnswered", criteria: "10000", name: "Imperator of Latin", difficulty: "5", desc: "Answer 10000 questions", },
{ index: "05000", type: "testsCompleted", criteria: "1", name: "First Test", difficulty: "1", desc: "Complete your first test", },
{ index: "05001", type: "testsCompleted", criteria: "10", name: "Settling In", difficulty: "1", desc: "Complete 10 tests", },
{ index: "05002", type: "testsCompleted", criteria: "25", name: "Consistent Learner", difficulty: "2", desc: "Complete 25 tests", },
{ index: "05003", type: "testsCompleted", criteria: "50", name: "Habit Builder", difficulty: "2", desc: "Complete 50 tests", },
{ index: "05004", type: "testsCompleted", criteria: "100", name: "Midnight Grinder", difficulty: "3", desc: "Complete 100 tests", },
{ index: "05005", type: "testsCompleted", criteria: "250", name: "Exam Machine", difficulty: "4", desc: "Complete 250 tests", },
{ index: "06000", type: "averageScore", criteria: "60", name: "Delving into D", difficulty: "1", desc: "Reach a lifetime average of 60%", },
{ index: "06001", type: "averageScore", criteria: "75", name: "Averaging C", difficulty: "2", desc: "Reach a lifetime average of 75%", },
{ index: "06002", type: "averageScore", criteria: "85", name: "Beyond the belcurve with B", difficulty: "3", desc: "Reach a lifetime average of 85%", },
{ index: "06003", type: "averageScore", criteria: "95", name: "Aurafarming A", difficulty: "4", desc: "Reach a lifetime average of 95%", },
{ index: "06004", type: "averageScore", criteria: "100", name: "A+ and Beyond", difficulty: "5", desc: "Maintain a perfect average", },
{ index: "07000", type: "perfectTests", criteria: "1", name: "Evanescent Victory", difficulty: "1", desc: "Score 100% on a test", },
{ index: "07001", type: "perfectTests", criteria: "5", name: "Transient Yet Tangible", difficulty: "2", desc: "Score perfectly five times", },
{ index: "07002", type: "perfectTests", criteria: "10", name: "Unfleeting Victory", difficulty: "3", desc: "Score perfectly ten times", },
{ index: "07003", type: "perfectTests", criteria: "25", name: "Unblemished Record", difficulty: "4", desc: "Score perfectly twenty-five times", },
{ index: "07004", type: "perfectTests", criteria: "50", name: "Progeny of Perfection", difficulty: "5", desc: "Achieve fifty perfect tests", },
{ index: "08000", type: "highestScore", criteria: "90", name: "Walk Among the Belcurve", difficulty: "2", desc: "Score at least 90% on a test", },
{ index: "08001", type: "highestScore", criteria: "95", name: "Understand the Belcurve", difficulty: "3", desc: "Score at least 95%", },
{ index: "08002", type: "highestScore", criteria: "100", name: "Rise Above the Belcurve", difficulty: "4", desc: "Score 100%", },
{ index: "09000", type: "hours", criteria: "1", name: "One Hour Later", difficulty: "1", desc: "Study for one hour", },
{ index: "09001", type: "hours", criteria: "5", name: "Time Well Spent", difficulty: "1", desc: "Study for five hours", },
{ index: "09002", type: "hours", criteria: "10", name: "Committed Learner", difficulty: "2", desc: "Study for ten hours", },
{ index: "09003", type: "hours", criteria: "25", name: "Focused Mind", difficulty: "3", desc: "Study for twenty-five hours", },
{ index: "09004", type: "hours", criteria: "50", name: "Marathon Scholar", difficulty: "4", desc: "Study for fifty hours", },
{ index: "09005", type: "hours", criteria: "100", name: "Master of Persistence", difficulty: "5", desc: "Study for one hundred hours", },
{ index: "10000", type: "studyStreak", criteria: "3", name: "On a Roll", difficulty: "1", desc: "Study three days in a row", },
{ index: "10001", type: "studyStreak", criteria: "7", name: "Weekly Warrior", difficulty: "2", desc: "Study seven days in a row", },
{ index: "10002", type: "studyStreak", criteria: "30", name: "Monthly Master", difficulty: "4", desc: "Study for thirty consecutive days", },
{ index: "10003", type: "studyStreak", criteria: "100", name: "Unbreakable Habit", difficulty: "5", desc: "Study one hundred days consecutively", },
{ index: "11000", type: "darkMode", criteria: "1", name: "Into the Darkness", difficulty: "1", desc: "Enable Dark Mode", },
{ index: "11001", type: "ancientRomeMode", criteria: "1", name: "Ave, Roma!", difficulty: "1", desc: "Enable Ancient Rome Mode", },
{ index: "12000", type: "macronKeyboard", criteria: "1", name: "Accent Expert", difficulty: "1", desc: "Use the macron keyboard", },
{ index: "13000", type: "zeroPercent", criteria: "0", name: "At Least You Tried", difficulty: "2", desc: "Finish a test with 0%", },
{ index: "14000", type: "oneQuestion", criteria: "1", name: "Technically Finished", difficulty: "1", desc: "Complete a test with only one question", },
{ index: "15000", type: "retryImmediately", criteria: "5", name: "Persistence Pays", difficulty: "2", desc: "Restart the same test five times", },
{ index: "16000", type: "loadOrDo", criteria: "historyPage", name: "Looking Back", difficulty: "1", desc: "Visit the Test History page", },
{ index: "16001", type: "loadOrDo", criteria: "archivesPage", name: "Historian", difficulty: "1", desc: "Visit the Archives", },
{ index: "16002", type: "loadOrDo", criteria: "databasePage", name: "Researcher", difficulty: "1", desc: "Open the Vocabulary Database", },
{ index: "16003", type: "loadOrDo", criteria: "grammarPage", name: "Grammar Enthusiast", difficulty: "1", desc: "Complete your first grammar exercise", },
{ index: "16004", type: "loadOrDo", criteria: "vocabPage", name: "Word Hunter", difficulty: "1", desc: "Complete your first vocabulary test", },
{ index: "16005", type: "loadOrDo", criteria: "practiceTestPage", name: "Completionist", difficulty: "1", desc: "Complete your first practice test", },
{ index: "17000", type: "time", criteria: "midnight", name: "Nocturnus", difficulty: "3", desc: "Study between 1 and 6am", },
{ index: "17001", type: "time", criteria: "sunrise", name: "Aurora", difficulty: "3", desc: "Study between 6 and 8am", },
{ index: "18000", type: "day", criteria: "christmas", name: "Festive Scholar", difficulty: "4", desc: "Study on Christmas Day", },
{ index: "18001", type: "day", criteria: "leapDay", name: "Rare Opportunity", difficulty: "5", desc: "Study on February 29", },
{ index: "18002", type: "day", criteria: "earlyAccess", name: "Early Access", difficulty: "3", desc: "Login to this website in 2026", },
{ index: "19000", type: "grammarMoods", criteria: "indicative", name: "The Concrete Mood", difficulty: "4", desc: "Learn all verb endings in the indicative mood", },
{ index: "19001", type: "grammarMoods", criteria: "subjunctive", name: "The Hypothetical Mood", difficulty: "4", desc: "Learn all verb endings in the subjunctive mood", },
{ index: "19002", type: "grammarMoods", criteria: "imperative", name: "The Exclamatory Mood", difficulty: "4", desc: "Learn all verb endings in the imperative mood", },
{ index: "19003", type: "grammarMoods", criteria: "infinitive", name: "The Constant Mood", difficulty: "4", desc: "Learn all verb endings in the infinitive mood", },
{ index: "19004", type: "grammarMoods", criteria: "participle", name: "The Verbal Adjectives", difficulty: "4", desc: "Learn all verb endings in the participle mood", },
{ index: "20000", type: "grammarConj", criteria: "1", name: "Word Declining 1", difficulty: "4", desc: "Learn all verb endings in the 1st conjugation", },
{ index: "20001", type: "grammarConj", criteria: "2", name: "Word Declining 2", difficulty: "4", desc: "Learn all verb endings in the 2nd conjugation", },
{ index: "20002", type: "grammarConj", criteria: "3", name: "Word Declining 3", difficulty: "4", desc: "Learn all verb endings in the 3rd conjugation", },
{ index: "20003", type: "grammarConj", criteria: "4", name: "Word Declining 4", difficulty: "4", desc: "Learn all verb endings in the 4th conjugation", },
];
/*
Test XP + Completion XP + Achievements + Study Hours + Login Bonuses + Special Bonuses
*/

/*
Thanks! The following code calculates the xp, can u pls have a look? 
*/
const xp = {
    correctAnswer: 0,
    vocabWord: 0,
    grammarEnd: 0,
    studyHour: 0,
    dailyLogin: 0,
    perfectTest: 0,
    dailyStreak: 0,
    //personalBest: 0,
    achievements: [0, 0, 0, 0, 0]   //Count of achievements per difficulty, 1-5
};
const xpAdders = {
    // ===== Test XP =====
    correctAnswer: 1,
    // ===== Permanent Progress =====
    vocabWordCompleted: 20,
    grammarEndingCompleted: 10,
    // ===== Studying =====
    studyHour: 40,
    dailyLogin: 15,
    dailyStreak: 15,  //calculated as: 40 + 15 for each login day
    // ===== Achievements =====
    achievement: [10, 25, 35, 50, 75]

};
const xpMultipliers = {
    accuracy: [
        {min: 0,   max: 49,  mult: 0.50},
        {min: 50,  max: 69,  mult: 0.75},
        {min: 70,  max: 84,  mult: 1.00},
        {min: 85,  max: 94,  mult: 1.15},
        {min: 95,  max: 99,  mult: 1.30},
        {min: 100, max: 100, mult: 1.50}
    ],
    testLength: [
        {min:1, max:5, mult:0.70},
        {min:6, max:10, mult:0.80},
        {min:11, max:20, mult:0.90},
        {min:21, max:40, mult:1.00},
        {min:41, max:80, mult:1.08},
        {min:81, max:150, mult:1.15},
        {min:151, max:300, mult:1.22},
        {min:301, max:500, mult:1.28},
        {min:501, max:700, mult:1.33},
        {min:701, max:900, mult:1.4},
        {min:901, max:Infinity, mult:1.44}
    ],
    streak: [
        {days:3,mult:1.02},
        {days:7,mult:1.05},
        {days:14,mult:1.08},
        {days:30,mult:1.15},
        {days:100,mult:1.30}
    ]
};
const levels = [];
for (let level = 0; level <= 100; level++) { 
    levels.push({
        level: level,
        requiredXP: 1000 * level, //if at 0xp, at lvl1
    });
}

let achievementProgress = JSON.parse(localStorage.getItem("localAchievementProgress"));     //eg: {i01001: true, i01002: false}, property is i+index of corresponding achievement, value is whether achievement is completed or not
let studySeconds = Number(localStorage.getItem("studySeconds")) || 0;                       //stored value: any integer, most likely very big
let studyHours = (studySeconds / 3600).toFixed(1);                                          //stored value: a float, 
let testHistory = JSON.parse(localStorage.getItem("latinHistory")) ||[];                    
/* [
example: {
                date: new Date().toISOString(),
                testType: "Vocab", //string
                page: document.title, //string
                score, //integer
                total, //integer
                percent: Math.round(score/total*100),
                quote: calcScore(score,total), //integer
                settings: {//strings or arrays of strings}
            }, //same things, for each test
            ]
            */
let darkModeUsed = localStorage.getItem('achievementDarkMode') === 'true';                  ////stored value: 'true' or 'false'
let ancientRomeModeUsed = localStorage.getItem('achievementAncientRome') === 'true';        ////stored value: 'true' or 'false'
let macronKeyboardUsed = localStorage.getItem('achievementMacronKeyboard') === 'true';      ////stored value: 'true' or 'false'
let loadedPages =JSON.parse(localStorage.getItem('savedPagesLoaded'))||[];                  ////example: ['index.html', 'vocabData.html', 'archives.html']
//let grammarProgress = JSON.parse(localStorage.getItem("latinGrammarProgress")) || {};     ////structure is same as achievementProgress, defined in another script
//let vocabProgress = JSON.parse(localStorage.getItem("latinVocabProgress")) || {};         ////structure is same as achievementProgress, defined in another script
let loginsArray = JSON.parse(localStorage.getItem('savedLogins'));                          ////example: ["7/2/2026","7/1/2026","6/30/2026"] (never the same day)
let loginTimesArray = JSON.parse(localStorage.getItem('savedLoginTimes'));                  ////example: ["3:03:40 PM","1:24:12 PM"]  



function calculateXP(isReturn){
    // Not every page loads vocab/vocabData.js and/or verbs/grammarData.js
    // (see check()'s guards above) - calculateXP() still needs to run (it's
    // used for the "levelling" achievement check on every page) without
    // crashing on pages that don't have vocab/grammar data loaded.
    if (typeof loadVocab === "function") loadVocab();
    let xpObj = structuredClone(xp);

    for (let test of testHistory){
        let multiplier1 = 1;
        let multiplier2 = 1;
        for (let domain of xpMultipliers.accuracy){
            if (test.percentage>=domain.min && test.percentage <= domain.max){
                multiplier1 = domain.mult;
            }
        }
        for (let domain of xpMultipliers.testLength){
            if (test.total>=domain.min && test.total <= domain.max){
                multiplier2 = domain.mult;
            }
        }
        xpObj.correctAnswer+= Math.floor(test.score * multiplier1 * multiplier2);
    }

    let vocabCount = 0;
    if (typeof vocabProgress !== "undefined" && typeof isWordLearned !== "undefined" && typeof vocabData !== "undefined") {
        for (let word of vocabData){
            if (isWordLearned(vocabProgress["i" + word.index])){
                xpObj.vocabWord+=xpAdders.vocabWordCompleted;
                vocabCount+=1;
            }
        }
        if (vocabCount === vocabData.length){
            xpObj.vocabWord = 3000;
        }
    }

    let grammarCount =0;
    if (typeof grammarProgress !== "undefined" && typeof isEndingLearned !== "undefined" && typeof grammarData !== "undefined") {
        for (let end in grammarProgress){
            if (isEndingLearned(grammarProgress[end])){
                xpObj.grammarEnd+=xpAdders.grammarEndingCompleted;
                grammarCount+=1;
            }
        }
        if (grammarCount === grammarData.length){
            xpObj.grammarEnd = 3000;
        }
    }

    for (let achievement of achievementData){
        let index = "i"+achievement.index;
        if (achievementProgress[index]){
            xpObj.achievements[parseInt(achievement.difficulty-1)]+=xpAdders.achievement[parseInt(achievement.difficulty-1)];
        }
    }
    xpObj.dailyStreak = 40 + (getLoginStreaks().current * xpAdders.dailyStreak);

    xpObj.studyHour += studyHours * xpAdders.studyHour;
    xpObj.dailyLogin += loginsArray.length * xpAdders.dailyLogin;

    let totalXP = xpObj.correctAnswer + xpObj.vocabWord + xpObj.grammarEnd + xpObj.dailyLogin + xpObj.studyHour + xpObj.dailyStreak + xpObj.achievements[0] + xpObj.achievements[1] + xpObj.achievements[2] + xpObj.achievements[3] + xpObj.achievements[4];

    let currentLevel = Math.floor(totalXP/1000);
    if (isReturn){
        return {totalXP: totalXP, currentLevel: currentLevel};
    }else{
    console.log("totalXP: " + totalXP+", currentLevel:" +currentLevel);
    document.querySelector(".xp-bar-fill").style.width = `${(totalXP % 1000)/10}%`;
    document.getElementById("xp").textContent = `${totalXP}`; 
    document.getElementById("level").textContent = `${currentLevel}`;
    document.getElementById("xp-tests").textContent = `${xpObj.correctAnswer} XP`;
    document.getElementById("xp-vocab").textContent = `${xpObj.vocabWord} XP`;
    document.getElementById("xp-grammar").textContent = `${xpObj.grammarEnd} XP`;
    document.getElementById("xp-hours").textContent = `${xpObj.studyHour} XP`;
    document.getElementById("xp-daily").textContent = `${xpObj.dailyLogin} XP`;
    document.getElementById("xp-streak").textContent = `${xpObj.dailyStreak} XP`;
    document.getElementById("xp-achievements").textContent = `${xpObj.achievements[0] + xpObj.achievements[1] + xpObj.achievements[2] + xpObj.achievements[3] + xpObj.achievements[4]} XP`;
    }
}

function reload(){
    
    studySeconds = Number(localStorage.getItem("studySeconds")) || 0;
    studyHours = (studySeconds / 3600).toFixed(1);
    testHistory = JSON.parse(localStorage.getItem("latinHistory")) ||[];
    darkModeUsed = localStorage.getItem('achievementDarkMode') === 'true';
    ancientRomeModeUsed = localStorage.getItem('achievementAncientRome') === 'true';
    macronKeyboardUsed = localStorage.getItem('achievementMacronKeyboard') === 'true';
    loadedPages =JSON.parse(localStorage.getItem('savedPagesLoaded')) ||[];
    grammarProgress = JSON.parse(localStorage.getItem("latinGrammarProgress")) || {};
    if (typeof loadVocab === "function") loadVocab();
    loginsArray = JSON.parse(localStorage.getItem('savedLogins'));
    loginTimesArray = JSON.parse(localStorage.getItem('savedLoginTimes'));
    buildAchievements();
    achievementProgress = JSON.parse(localStorage.getItem("localAchievementProgress"));
}
function buildAchievements(){
    let achievementProgress = {};

    const savedAchievementProgress = localStorage.getItem("localAchievementProgress");
    if (savedAchievementProgress) {
        achievementProgress = JSON.parse(savedAchievementProgress);
    } else {
        achievementProgress = {}; 
    }

    achievementData.forEach(achievement => {
        const key = "i" + achievement.index;
        
        // If this word isn't tracked yet, set it to false
        if (achievementProgress[key] === undefined) {
            achievementProgress[key] = false;
        }
        
        
    });
    localStorage.setItem("localAchievementProgress", JSON.stringify(achievementProgress));
}
reload();

function check(){
    //rawVocab:
    // Guarded with typeof: not every page loads vocab/vocabData.js and/or
    // verbs/grammarData.js, so these globals aren't always defined - check()
    // still needs to run (it computes achievement progress for everything
    // else) without crashing on the pages that don't have vocab/grammar data.
    let vocabCount=0;
    if (typeof vocabProgress !== "undefined" && typeof isWordLearned !== "undefined" && typeof vocabData !== "undefined") {
        for (let word of vocabData){
            if (isWordLearned(vocabProgress["i" + word.index])){
                vocabCount+=1;
            }
        }
    }
    let grammarCount=0;
    if (typeof grammarProgress !== "undefined" && typeof isEndingLearned !== "undefined") {
        for (let word in grammarProgress){
            if (isEndingLearned(grammarProgress[word])){
                grammarCount+=1;
            }
        }
    }


    //questionsAnswered, testsCompleted, perfectTests, highestScore,
    let totalTestCount = 0;
    let totalScoreCount = 0;
    let totalQuestionCount= 0;
    let perfectScoreCount = 0;
    let highestScore = 0;
    let experience = 0;
    let testTypesDone = [];
    let zeroPercent = false;
    let oneQuestion = false;
    let testsInARow = 0;
    let previousTest = "";
    for (let test of testHistory){
        totalTestCount+=1;
        testTypesDone.push(test.testType);
        totalScoreCount+=test.score;
        totalQuestionCount+=test.total;
        if (test.percent===100){
            perfectScoreCount+=1;
        }else if (test.percent ===0){
            zeroPercent = true;
        }
        if (highestScore < test.percent){
            highestScore = test.percent;
        }
        if (test.page === previousTest){
            testsInARow+=1;
        }else{
            testsInARow = 0;
        }
        if (test.total === 1){
            oneQuestion = true;
        }
        
        previousTest = test.page;
    }
    let averageScore = (totalScoreCount/totalQuestionCount)*100;

    let moodCompleted = {};
    let conjugationCompleted = {};
    if (typeof grammarData !== "undefined" && typeof grammarProgress !== "undefined") {
        moodCompleted = checkVerbSections().moodCompleted;
        conjugationCompleted = checkVerbSections().conjugationCompleted;
    }


    for (let achievement of achievementData){
        let achievementType = achievement.index.slice(0, 2);
        //rawVocab achievements
        if (achievement.type=="rawVocab"){
            if (vocabCount>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //rawGrammar achievements
        if (achievement.type=="rawGrammar"){
            if (grammarCount>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //levelling achievements
        if (achievement.type=="levelling"){
            if (calculateXP(true).currentLevel>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //questionsAnswered achievements
        if (achievement.type=="questionsAnswered"){
            if (totalQuestionCount>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //testsCompleted achievements
        if (achievement.type=="testsCompleted"){
            if (totalTestCount>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //averageScore achievements
        if (achievement.type=="averageScore"){
            if (averageScore>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //perfectTests achievements
        if (achievement.type=="perfectTests"){
            if (perfectScoreCount>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //highestScore achievements
        if (achievement.type=="highestScore"){
            if (highestScore>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //hours achievements
        if (achievement.type=="hours"){
            if (studyHours>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //studyStreak achievements
        if (achievement.type=="studyStreak"){
            if (getLoginStreaks().longest>=parseInt(achievement.criteria)){
                achievementProgress["i"+achievement.index] = true;
            }else{
                achievementProgress["i"+achievement.index] = false;
            }
        }
        //darkMode achievement
        if (achievement.type==="darkMode"){
            if (darkModeUsed=== true){
                achievementProgress["i"+achievement.index] = true;
            }
        }
        //ancientRomeMode achievement
        if (achievement.type==="ancientRomeMode"){
            if (ancientRomeModeUsed=== true){
                achievementProgress["i"+achievement.index] = true;
            }
        }
        //macronKeyboard achievement
        if (achievement.type==="macronKeyboard"){
            if (macronKeyboardUsed=== true){
                achievementProgress["i"+achievement.index] = true;
            }
        }
        //zeroPercent achievement
        if (achievement.type==="zeroPercent"){
            if (zeroPercent){
                achievementProgress["i"+achievement.index] = true;
            }
        }
        //oneQuestion achievement
        if (achievement.type==="oneQuestion"){
            if (oneQuestion){
                achievementProgress["i"+achievement.index] = true;
            }
        }
        //5 tests in a row achievement
        if (achievement.type==="retryImmediately"){
            if (testsInARow >=5){
                achievementProgress["i"+achievement.index] = true;
            }
        }
        //loadOrDo achievements
        if (achievement.type==="loadOrDo"){
            switch (achievement.criteria){
                case "historyPage":
                    if (loadedPages.includes("testData.html")) achievementProgress["i"+achievement.index] = true;
                    break;
                case "archivesPage":
                    if (loadedPages.includes("archivesHome.html")) achievementProgress["i"+achievement.index] = true;
                    break;
                case "databasePage":
                    if (loadedPages.includes("vocabData.html")) achievementProgress["i"+achievement.index] = true;
                    break;
                case "grammarPage":
                    if (testTypesDone.includes("Grammar")) achievementProgress["i"+achievement.index] = true;
                    break;
                case "vocabPage":
                    if (testTypesDone.includes("Vocab")) achievementProgress["i"+achievement.index] = true;
                    break;
                case "practiceTestPage":
                    if (testTypesDone.includes("Practice Test")) achievementProgress["i"+achievement.index] = true;
                    break;
            }

        }
        //Time achievement
        if (achievement.type==="time"){
            for (let timez of loginTimesArray){
                let hourz = (new Date(timez)).getHours();
                switch(achievement.criteria){
                case "midnight": 
                    if (hourz >=1 && hourz <6){
                        achievementProgress["i"+achievement.index] = true;
                    }
                    break;
                case "sunrise":
                    if (hourz >=6 && hourz <8){
                        achievementProgress["i"+achievement.index] = true;
                    }
                    break;
                }
            }
        }
        //day achievement
        if (achievement.type==="day"){
            for (let l of loginsArray){
                let login = new Date(l)
                switch(achievement.criteria){
                    case "christmas": 
                        if (login.getDay() === 25 && login.getMonth() === 11){
                            achievementProgress["i"+achievement.index] = true;
                        }
                        break;
                    case "leapDay":
                        if (login.getDay() === 29 && login.getMonth() === 1){
                            achievementProgress["i"+achievement.index] = true;
                        }
                        break;
                    case "earlyAccess":
                        if (login.getFullYear === 2026){
                            achievementProgress["i"+achievement.index] = true;
                        }
                    break;
                }
            }
        }
        //grammarConjugations achievements
        if (achievement.type==="grammarMoods"){
            if (conjugationCompleted[achievement.criteria]){
                achievementProgress["i"+achievement.index] = true;
            }
        }
        //grammarMoods acheivements
        if (achievement.type==="grammarConj"){
            if (moodCompleted[achievement.criteria]){
                achievementProgress["i"+achievement.index] = true;
            }
        }
        
    }
localStorage.setItem("localAchievementProgress", JSON.stringify(achievementProgress));
}


function checkNounSections(vocabData, vocabProgress){
    let stages = {};
    let types = {};
    for (let word of vocabData){
        if (stages.hasOwnProperty(word.stage)){
            stages[word.stage]+=1;
        }else{
            stages[word.stage]=1;
        }
        if (types.hasOwnProperty(word.type)){
            types[word.type]+=1;
        }else{
            types[word.type]=1;
        }
    }
    let stagez = {};
    let typez = {};
    for (let word in vocabProgress){
        let index = word.slice(1);
        for (let wordz of vocabData){
            if (wordz.index === index){
                if (isWordLearned(vocabProgress[word])){
                    if (stagez.hasOwnProperty(wordz.stage)){
                        stagez[wordz.stage]+=1;
                    }else{
                        stagez[wordz.stage]=1;
                    }
                    if (typez.hasOwnProperty(wordz.type)){
                        typez[wordz.type]+=1;
                    }else{
                        typez[wordz.type]=1;
                    }
                }
            }
        }
    }
    let stageCompleted = {};
    let typeCompleted = {};
    for (let prop in stages){
        stageCompleted[prop] = (stages[prop]===stagez[prop])
    }
    for (let prop in types){
        typeCompleted[prop] = (types[prop]===typez[prop])
    }
    let totalObj = {};
    totalObj.stageCompleted = stageCompleted;
    totalObj.typeCompleted = typeCompleted;
    return totalObj;
}

function checkVerbSections(){
    let moods = {};
    let conjugations = {};

    let completedMoods = {};
    let completedConjugations = {};

    // Count how many real endings exist for each mood and conjugation
    for (let ending of grammarData) {

        // Skip forms that do not actually exist
        if (!ending.word || ending.word === "-") continue;

        if (moods.hasOwnProperty(ending.mood)) {
            moods[ending.mood] += 1;
        } else {
            moods[ending.mood] = 1;
        }

        if (conjugations.hasOwnProperty(ending.conjugation)) {
            conjugations[ending.conjugation] += 1;
        } else {
            conjugations[ending.conjugation] = 1;
        }
    }

    // Count how many completed endings exist for each mood and conjugation
    for (let progressKey in grammarProgress) {
        let index = progressKey.slice(1);

        for (let ending of grammarData) {

            // Skip forms that do not actually exist
            if (!ending.word || ending.word === "-") continue;

            if (String(ending.index) === index && isEndingLearned(grammarProgress[progressKey])) {

                if (completedMoods.hasOwnProperty(ending.mood)) {
                    completedMoods[ending.mood] += 1;
                } else {
                    completedMoods[ending.mood] = 1;
                }

                if (completedConjugations.hasOwnProperty(ending.conjugation)) {
                    completedConjugations[ending.conjugation] += 1;
                } else {
                    completedConjugations[ending.conjugation] = 1;
                }
            }
        }
    }

    let moodCompleted = {};
    let conjugationCompleted = {};

    // Check whether every ending in each mood has been completed
    for (let mood in moods) {
        moodCompleted[mood] = moods[mood] === completedMoods[mood];
    }

    // Check whether every ending in each conjugation has been completed
    for (let conjugation in conjugations) {
        conjugationCompleted[conjugation] =
            conjugations[conjugation] === completedConjugations[conjugation];
    }
    let totalObj = {};
    totalObj.moodCompleted = moodCompleted;
    totalObj.conjugationCompleted = conjugationCompleted;
    return totalObj;
}

function getLoginStreaks() {
    let loginsArray = JSON.parse(localStorage.getItem("savedLogins")) || [];
    if (loginsArray.length === 0) {
        return {
            current: 0,
            longest: 0
        };
    }
    // Convert strings into Date objects
    let loginDates = [];
    for (let login of loginsArray) {
        let parts = login.split("/");

        loginDates.push(
            new Date(parts[2], parts[0] - 1, parts[1])
        );
    }
    // Sort newest -> oldest
    loginDates.sort(function(a, b) {
        return b - a;
    });
    // ---------- Current Streak ----------
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let current = 0;
    // Allow streak if latest login was to or yesterday
    let newestLogin = new Date(loginDates[0]);
    newestLogin.setHours(0, 0, 0, 0);
    let diff =
        (today - newestLogin) /
        (1000 * 60 * 60 * 24);
    if (diff <= 1) {
        current = 1;
        for (let i = 0; i < loginDates.length - 1; i++) {
            let difference =
                (loginDates[i] - loginDates[i + 1]) /
                (1000 * 60 * 60 * 24);
            if (difference === 1) {
                current++;
            } else {
                break;
            }
        }
    }
    // ---------- Longest Streak ----------
    let longest = 1;
    let streak = 1;
    for (let i = 0; i < loginDates.length - 1; i++) {
        let difference =
            (loginDates[i] - loginDates[i + 1]) /
            (1000 * 60 * 60 * 24);
        if (difference === 1) {
            streak++;
            if (streak > longest) {
                longest = streak;
            }
        } else {
            streak = 1;
        }
    }
    return {
        current: current,
        longest: longest

    };
}

buildAchievements();
check();
//calculateXP();

// Save it back to local storage just to keep it clean
/*
'localAchievementProgress', saved to localStorage, is an object that saves whether looking like: 
{
i01001: true, // i + index of achievement that it corresponds to, then boolean value for if it's conpleted or not.
i01002: false, //etc, Keeps going 
}
*/
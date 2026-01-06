const quizzes = [
    {
        id: 'Coding',
        name: 'Coding',
        questions: [
            { question: 'When was the first coding language created?', answers: ['1940s','1950s','1960s','1970s'], correct: 1 },
            { question: 'How many coding languages are there?', answers: ['1,000-5,000','5,000-10,000','10,000-15,000','15,000-20,000'], correct: 1 },
            { question: 'What is the most popular coding language on GitHub in 2025?', answers: ['Python','JavaScript','Java','TypeScript'], correct: 1 },
            { question: 'Which coding language is primarily used for iOS development?', answers: ['Java','Kotlin','Swift','C#'], correct: 2 },
            { question: 'Which coding language is known for its use in data science and machine learning?', answers: ['Python','R','Julia','MATLAB'], correct: 0 },
            { question: 'Which coding language is primarily used for Windows development?', answers: ['Python','Java','C#','Ruby'], correct: 2 },
            { question: 'Which coding language was created by Guido van Rossum?', answers: ['Python','C++','Java','Ruby'], correct: 0 },
            { question: 'What does CSS stand for?', answers: ['Colorful Style Sheets','Computer Style Sheets','Creative Style System','Cascading Style Sheets'], correct: 3 },
            { question: 'Which coding language is primarily used for Android development?', answers: ['Java','Swift','Kotlin','C#'], correct: 0 },
            { question: 'Which coding language was developed by Microsoft?', answers: ['Java','Ruby','Python','C#'], correct: 3 },
            { question: 'What is the main purpose of SQL?', answers: ['Styling web pages','Managing databases','Building mobile apps','Creating animations'], correct: 1 },
            { question: 'What does API stand for?', answers: ['Application Programming Interface','Advanced Programming Interface','Application Performance Index','Advanced Performance Index'], correct: 0 }
        ]
    },
    {
        id: 'HTML',
        name: 'HTML',
        questions: [
            { question: 'When was HTML first used in a Website?', answers: ['1991','1993','1995','1997'], correct: 0 },
            { question: 'What was the first Website, HTML was used in?', answers: ['www.w3.org','www.xerox.com','info.cern.ch','world.std.com'], correct: 2 },
            { question: 'How many tags are there in HTML5?', answers: ['about 50','about 100','about 200','about 300'], correct: 1 },
            { question: 'Who was the Founder of HTML?', answers: ['James Gosling','Brendan Eich','Guido van Rossum','Tim Berners-Lee'], correct: 3 },
            { question: 'What does HTML stand for?', answers: ['Hyper Trainer Marking Language','Hyper Text Marketing Language','Hyper Text Markup Language','Hyper Text Markup Leveler'], correct: 2 }
            { question: 'Which tag is used to define a table row in HTML?', answers: ['<td>', '<table>', '<th>', '<tr>'], correct: 3 },
        ]
    },
    {
        id: 'JavaScript',
        name: 'JavaScript',
        questions: [
            { question: 'When was JavaScript first used in a Website?', answers: ['1991','1993','1995','1997'], correct: 2 },
            { question: 'Who was the Founder of JavaScript?', answers: ['James Gosling','Brendan Eich','Guido van Rossum','Tim Berners-Lee'], correct: 1 },
            { question: 'Which other name had JavaScript back then?', answers: ['JSCode','CodeScript','JavaCode','LiveScript'], correct: 3 },
            { question: 'What does NaN stand for in JavaScript?', answers: ['Not a Number','New a Number','Not an Array','New an Array'], correct: 0 },
            { question: 'Which company developed JavaScript?', answers: ['Netscape','Microsoft','Sun Microsystems','IBM'], correct: 0 },
            { question: 'Which symbol is used for comments in JavaScript?', answers: ['/* */','<!-- -->','//','#'], correct: 2 }
        ]
    }
];

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const selectionEl = document.getElementById('selection');
const quizListEl = document.getElementById('quiz-list');
const quizContainer = document.getElementById('quiz-container');
const quizTitleEl = document.getElementById('quiz-title');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const scoreDisplayEl = document.getElementById('score-display');
const progressEl = document.getElementById('progress');
const questionCountEl = document.getElementById('question-count');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const exitBtn = document.getElementById('exit-btn');

// Auth DOM Elements
const authTitle = document.getElementById('auth-title');
const authUsername = document.getElementById('auth-username');
const authPassword = document.getElementById('auth-password');
const rememberMeCheckbox = document.getElementById('remember-me-checkbox');
const authError = document.getElementById('auth-error');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const userDisplayEl = document.getElementById('user-display');

// Tutorial DOM Elements
const tutorialModal = document.getElementById('tutorial-modal');
const tutorialTitle = document.getElementById('tutorial-title');
const tutorialText = document.getElementById('tutorial-text');
const tutorialNextBtn = document.getElementById('tutorial-next');
const tutorialSkipBtn = document.getElementById('tutorial-skip');
const tutorialDots = document.querySelectorAll('.tutorial-dot');

// Settings DOM Elements
const settingsModal = document.getElementById('settings-modal');
const settingsOldPassword = document.getElementById('settings-old-password');
const settingsNewPassword = document.getElementById('settings-new-password');
const settingsConfirmPassword = document.getElementById('settings-confirm-password');
const settingsError = document.getElementById('settings-error');
const settingsSuccess = document.getElementById('settings-success');
const settingsCloseBtn = document.getElementById('settings-close');
const settingsSaveBtn = document.getElementById('settings-save');

// History DOM Elements
const historyModal = document.getElementById('history-modal');
const historyContent = document.getElementById('history-content');
const historyCloseBtn = document.getElementById('history-close');

// Modal elements
const restartModal = document.getElementById('restart-modal');
const modalCancelBtn = document.getElementById('modal-cancel');
const modalOkBtn = document.getElementById('modal-ok');
const modalOkNoShowBtn = document.getElementById('modal-ok-no-show');
const totalScoreDisplayEl = document.getElementById('total-score-display');

// State
let currentQuizIndex = null;
let questions = [];
let currentQuestion = 0;
let score = 0;
let questionStartTime = 0;
let currentQuizResults = []; // Track results for each question in current quiz

// Persistent State (localStorage)
let totalScore = 0;
let completedQuizzes = {};
let quizHistory = []; // Detailed history of all quiz attempts
let dontShowRestartWarning = localStorage.getItem('dontShowRestartWarning') === 'true';

// Auth State
let currentUser = null;
let isRegisterMode = false;
let users = JSON.parse(localStorage.getItem('quizUsers') || '{}');

// Tutorial State
let tutorialStep = 0;
const tutorialSteps = [
    {
        title: 'Welcome to Quiz App!',
        text: 'This is a fun quiz app where you can test your knowledge on various topics. Let\'s show you how everything works!'
    },
    {
        title: 'How to Play',
        text: 'Select a quiz from the list, click Start, and answer the questions. The faster you answer correctly, the more points you earn!'
    },
    {
        title: 'Point System',
        text: 'Each correct answer gives you up to 1000 points. The faster you answer, the more points you get! You lose 10 points for every 0.1 seconds, but you\'ll always get at least 50 points for a correct answer.'
    },
    {
        title: 'Your Points',
        text: 'Your "Total Points" accumulates all points from completed quizzes. "Quiz Points" shows points for your current quiz. Your progress is saved to your account!'
    },
    {
        title: 'Ready to Start!',
        text: 'You can restart completed quizzes anytime. Click a quiz to begin and have fun! Good luck!'
    }
];

// Check for remembered session
function checkRememberedSession() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        const userData = users[remembered];
        if (userData) {
            loginUser(remembered, userData);
            return true;
        }
    }
    return false;
}

// Login user and load their data
function loginUser(username, userData, isNewUser = false) {
    currentUser = username;
    totalScore = userData.totalScore || 0;
    completedQuizzes = userData.completedQuizzes || {};
    quizHistory = userData.quizHistory || [];
    dontShowRestartWarning = userData.dontShowRestartWarning || false;
    
    userDisplayEl.textContent = `User: ${username}`;
    updateTotalScoreDisplay();
    
    loginScreen.style.display = 'none';
    selectionEl.style.display = 'block';
    renderQuizList();
    
    // Show tutorial only for brand-new accounts. Do not show for returning users.
    if (isNewUser) {
        if (users[username]) {
            users[username].tutorialCompleted = false;
            localStorage.setItem('quizUsers', JSON.stringify(users));
        }
        setTimeout(showTutorial, 300);
    }
}

// Tutorial functions
function showTutorial() {
    tutorialStep = 0;
    updateTutorialContent();
    if (tutorialModal) tutorialModal.style.display = 'flex';
}

function updateTutorialContent() {
    const step = tutorialSteps[tutorialStep];
    if (!step) return;
    if (tutorialTitle) tutorialTitle.textContent = step.title;
    if (tutorialText) tutorialText.textContent = step.text;
    
    // Update progress dots
    tutorialDots.forEach((dot, index) => {
        if (index === tutorialStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // Update button text
    if (tutorialNextBtn) {
        if (tutorialStep === tutorialSteps.length - 1) {
            tutorialNextBtn.textContent = 'Get Started!';
        } else {
            tutorialNextBtn.textContent = 'Next';
        }
    }
}

function nextTutorialStep() {
    if (tutorialStep < tutorialSteps.length - 1) {
        tutorialStep++;
        updateTutorialContent();
    } else {
        closeTutorial();
    }
}

function closeTutorial() {
    if (tutorialModal) tutorialModal.style.display = 'none';
    // Mark tutorial as completed
    if (currentUser && users[currentUser]) {
        users[currentUser].tutorialCompleted = true;
        localStorage.setItem('quizUsers', JSON.stringify(users));
    }
}

// Tutorial event listeners
if (tutorialNextBtn) tutorialNextBtn.addEventListener('click', nextTutorialStep);
if (tutorialSkipBtn) tutorialSkipBtn.addEventListener('click', closeTutorial);

// Save current user data
function saveUserData() {
    if (!currentUser) return;
    const existing = users[currentUser] || {};
    users[currentUser] = {
        password: existing.password || simpleHash(''),
        totalScore: totalScore || 0,
        completedQuizzes: completedQuizzes || {},
        quizHistory: quizHistory || [],
        dontShowRestartWarning: !!dontShowRestartWarning,
        tutorialCompleted: existing.tutorialCompleted || false
    };
    localStorage.setItem('quizUsers', JSON.stringify(users));
}

// Logout
function logout() {
    saveUserData();
    currentUser = null;
    totalScore = 0;
    completedQuizzes = {};
    quizHistory = [];
    localStorage.removeItem('rememberedUser');
    
    if (userDisplayEl) userDisplayEl.textContent = 'Not logged in';
    if (selectionEl) selectionEl.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'block';
    if (authUsername) authUsername.value = '';
    if (authPassword) authPassword.value = '';
    if (authError) authError.textContent = '';
}

// Simple hash function for passwords (not secure, but ok for demo)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Handle login
function handleLogin() {
    const username = authUsername.value.trim();
    const password = authPassword.value;
    
    if (!username || !password) {
        authError.textContent = 'Please enter username and password.';
        return;
    }
    
    const userData = users[username];
    if (!userData) {
        authError.textContent = 'User not found. Please register first.';
        return;
    }
    
    if (userData.password !== simpleHash(password)) {
        authError.textContent = 'Incorrect password.';
        return;
    }
    
    // Remember me
    if (rememberMeCheckbox && rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedUser', username);
    }
    
    loginUser(username, userData);
}

// Handle register
function handleRegister() {
    const username = authUsername.value.trim();
    const password = authPassword.value;
    
    if (!username || !password) {
        authError.textContent = 'Please enter username and password.';
        return;
    }
    
    if (username.length < 3) {
        authError.textContent = 'Username must be at least 3 characters.';
        return;
    }
    
    if (password.length < 4) {
        authError.textContent = 'Password must be at least 4 characters.';
        return;
    }
    
    if (users[username]) {
        authError.textContent = 'Username already exists.';
        return;
    }
    
    // Create new user
    users[username] = {
        password: simpleHash(password),
        totalScore: 0,
        completedQuizzes: {},
        quizHistory: [],
        dontShowRestartWarning: false,
        tutorialCompleted: false
    };
    localStorage.setItem('quizUsers', JSON.stringify(users));
    
    // Remember me
    if (rememberMeCheckbox && rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedUser', username);
    }
    
    loginUser(username, users[username], true); // true = new user
}

// Auth event listeners
if (loginBtn) loginBtn.addEventListener('click', handleLogin);
if (registerBtn) registerBtn.addEventListener('click', handleRegister);
if (logoutBtn) logoutBtn.addEventListener('click', logout);

// Allow Enter key to submit
if (authPassword) {
    authPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (isRegisterMode) handleRegister();
            else handleLogin();
        }
    });
}

// Update total score display
function updateTotalScoreDisplay() {
    if (totalScoreDisplayEl) totalScoreDisplayEl.textContent = `Total Points: ${totalScore}`;
}

// Save state to localStorage
function saveState() {
    saveUserData();
}

// Show restart warning modal
function showRestartModal() {
    if (restartModal) restartModal.style.display = 'flex';
}

// Hide restart warning modal
function hideRestartModal() {
    if (restartModal) restartModal.style.display = 'none';
}

// Handle restart confirmation
function confirmRestart(dontShowAgain = false) {
    if (dontShowAgain) {
        dontShowRestartWarning = true;
        saveState();
    }
    
    const quizId = quizzes[currentQuizIndex].id;
    // Remove previous points from total
    if (completedQuizzes[quizId]) {
        totalScore -= completedQuizzes[quizId];
        delete completedQuizzes[quizId];
        saveState();
        updateTotalScoreDisplay();
        renderQuizList(); // Update badges
    }
    
    hideRestartModal();
    startQuizInternal();
}

// Modal event listeners
if (modalCancelBtn) modalCancelBtn.addEventListener('click', hideRestartModal);
if (modalOkBtn) modalOkBtn.addEventListener('click', () => confirmRestart(false));
if (modalOkNoShowBtn) modalOkNoShowBtn.addEventListener('click', () => confirmRestart(true));

// Render selection screen
function renderQuizList() {
    if (!quizListEl) return;
    quizListEl.innerHTML = '';
    if (!quizzes || quizzes.length === 0) {
        quizListEl.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.6);">No quizzes available.</p>';
        return;
    }

    quizzes.forEach((q, i) => {
        const isCompleted = completedQuizzes[q.id] !== undefined;
        const completedBadge = isCompleted ? `<span class="completed-badge">Completed (${completedQuizzes[q.id]} pts)</span>` : '';
        const buttonText = isCompleted ? 'Restart' : 'Start';

        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.innerHTML = `
            <div class="quiz-card-body">
                <div class="quiz-name">${escapeHtml(q.name || 'Untitled Quiz')}${completedBadge}</div>
                <div class="quiz-meta">${(q.questions||[]).length} questions</div>
            </div>
            <div class="quiz-card-actions">
                <button class="btn start-quiz-btn" data-index="${i}">${buttonText}</button>
            </div>
        `;
        quizListEl.appendChild(card);
    });

    // attach listeners
    const startButtons = quizListEl.querySelectorAll('.start-quiz-btn');
    startButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'), 10);
            openQuiz(idx);
        });
    });
}

function openQuiz(index) {
    currentQuizIndex = index;
    // create a shuffled copy of the questions each time the quiz is opened
    questions = shuffleArray(quizzes[index].questions || []);
    const quizId = quizzes[index].id;
    const isCompleted = completedQuizzes[quizId] !== undefined;
    
    if (quizTitleEl) quizTitleEl.textContent = quizzes[index].name || 'Quiz';
    if (selectionEl) selectionEl.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'block';
    if (startBtn) startBtn.style.display = 'inline-block';
    if (startBtn) startBtn.textContent = isCompleted ? 'Restart' : 'Start';
    score = 0;
    if (scoreDisplayEl) scoreDisplayEl.textContent = 'Points: 0';
    if (progressEl) progressEl.style.width = '0%';
    if (questionCountEl) questionCountEl.textContent = `Question 0 / ${questions.length}`;
    if (questionEl) questionEl.textContent = isCompleted ? 'Click "Restart" to play again!' : 'Click "Start" to begin!';
    if (answersEl) answersEl.innerHTML = '';
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]);
}

// Shuffle helper - returns a new shuffled array
function shuffleArray(arr) {
    const a = (arr || []).slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function startCurrentQuiz() {
    if (!questions || questions.length === 0) {
        if (questionEl) questionEl.textContent = 'No questions in this quiz.';
        if (answersEl) answersEl.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.6)">No questions available.</p>';
        return;
    }
    
    const quizId = quizzes[currentQuizIndex].id;
    const isCompleted = completedQuizzes[quizId] !== undefined;
    
    // Show warning if quiz was completed and user hasn't disabled it
    if (isCompleted && !dontShowRestartWarning) {
        showRestartModal();
        return;
    }
    
    // If completed but warning disabled, remove old points first
    if (isCompleted) {
        totalScore -= completedQuizzes[quizId];
        delete completedQuizzes[quizId];
        saveState();
        updateTotalScoreDisplay();
    }
    
    startQuizInternal();
}

function startQuizInternal() {
    // Shuffle again to ensure a fresh order when starting/restarting
    if (currentQuizIndex !== null) {
        questions = shuffleArray(quizzes[currentQuizIndex].questions || []);
    }
    currentQuestion = 0;
    score = 0;
    currentQuizResults = []; // Reset results for new quiz attempt
    if (scoreDisplayEl) scoreDisplayEl.textContent = 'Points: 0';
    if (startBtn) startBtn.style.display = 'none';
    loadQuestion();
}

function loadQuestion() {
    const q = questions[currentQuestion];
    if (!q) return;
    if (questionEl) questionEl.textContent = q.question;
    if (questionCountEl) questionCountEl.textContent = `Question ${currentQuestion + 1} / ${questions.length}`;
    if (progressEl) progressEl.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

    if (answersEl) answersEl.innerHTML = '';
    q.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.textContent = answer;
        btn.classList.add('answer-btn');
        btn.addEventListener('click', () => selectAnswer(index));
        answersEl.appendChild(btn);
    });

    if (nextBtn) nextBtn.style.display = 'none';
    questionStartTime = Date.now();
}

function selectAnswer(index) {
    const q = questions[currentQuestion];
    if (!q) return;
    const buttons = answersEl.querySelectorAll('.answer-btn');
    const elapsed = Date.now() - questionStartTime;

    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct) {
            btn.classList.add('correct');
        } else if (i === index) {
            btn.classList.add('incorrect');
        }
    });

    let pointsEarned = 0;
    const isCorrect = index === q.correct;
    
    if (isCorrect) {
        // 1000 points base, -10 per 100ms, minimum 50
        const tenths = Math.floor(elapsed / 100);
        pointsEarned = Math.max(50, 1000 - tenths * 10);
        score += pointsEarned;
        if (scoreDisplayEl) scoreDisplayEl.textContent = `Points: ${score}`;
    }
    // Wrong answer = 0 points (no change)
    
    // Track this question's result
    currentQuizResults.push({
        question: q.question,
        userAnswer: q.answers[index] || '',
        correctAnswer: q.answers[q.correct] || '',
        isCorrect: isCorrect,
        timeMs: elapsed,
        points: pointsEarned
    });

    if (currentQuestion < questions.length - 1) {
        if (nextBtn) nextBtn.style.display = 'block';
    } else {
        setTimeout(() => {
            // Save score to completed quizzes and add to total
            const quizId = quizzes[currentQuizIndex].id;
            const quizName = quizzes[currentQuizIndex].name;
            completedQuizzes[quizId] = score;
            totalScore += score;
            
            // Save detailed history
            quizHistory.unshift({
                quizId: quizId,
                quizName: quizName,
                totalPoints: score,
                date: new Date().toISOString(),
                questions: currentQuizResults
            });
            
            // Keep only last 50 quiz attempts to save space
            if (quizHistory.length > 50) {
                quizHistory = quizHistory.slice(0, 50);
            }
            
            saveState();
            updateTotalScoreDisplay();
            renderQuizList(); // Update badges in background
            
            if (questionEl) questionEl.textContent = `Quiz Complete! Final Points: ${score}`;
            if (answersEl) answersEl.innerHTML = '';
            if (startBtn) startBtn.textContent = 'Restart';
            if (startBtn) startBtn.style.display = 'inline-block';
        }, 800);
    }
}

function nextQuestion() {
    currentQuestion++;
    loadQuestion();
}

function goBackToSelection() {
    currentQuizIndex = null;
    questions = [];
    if (quizContainer) quizContainer.style.display = 'none';
    if (selectionEl) selectionEl.style.display = 'block';
}

// Events
if (startBtn) startBtn.addEventListener('click', startCurrentQuiz);
if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
if (exitBtn) exitBtn.addEventListener('click', goBackToSelection);

// Settings Modal Functions
function showSettingsModal() {
    if (!currentUser) return;
    if (settingsOldPassword) settingsOldPassword.value = '';
    if (settingsNewPassword) settingsNewPassword.value = '';
    if (settingsConfirmPassword) settingsConfirmPassword.value = '';
    if (settingsError) settingsError.textContent = '';
    if (settingsSuccess) settingsSuccess.textContent = '';
    if (settingsModal) settingsModal.style.display = 'flex';
}

function hideSettingsModal() {
    if (settingsModal) settingsModal.style.display = 'none';
}

function saveSettings() {
    const oldPassword = settingsOldPassword ? settingsOldPassword.value : '';
    const newPassword = settingsNewPassword ? settingsNewPassword.value : '';
    const confirmPassword = settingsConfirmPassword ? settingsConfirmPassword.value : '';
    
    if (settingsError) settingsError.textContent = '';
    if (settingsSuccess) settingsSuccess.textContent = '';
    
    if (!oldPassword || !newPassword || !confirmPassword) {
        if (settingsError) settingsError.textContent = 'Please fill in all fields.';
        return;
    }
    
    if (!users[currentUser] || users[currentUser].password !== simpleHash(oldPassword)) {
        if (settingsError) settingsError.textContent = 'Current password is incorrect.';
        return;
    }
    
    if (newPassword.length < 4) {
        if (settingsError) settingsError.textContent = 'New password must be at least 4 characters.';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        if (settingsError) settingsError.textContent = 'New passwords do not match.';
        return;
    }
    
    // Update password
    users[currentUser].password = simpleHash(newPassword);
    localStorage.setItem('quizUsers', JSON.stringify(users));
    
    if (settingsSuccess) settingsSuccess.textContent = 'Password changed successfully!';
    if (settingsOldPassword) settingsOldPassword.value = '';
    if (settingsNewPassword) settingsNewPassword.value = '';
    if (settingsConfirmPassword) settingsConfirmPassword.value = '';
}

// Settings event listeners
if (userDisplayEl) userDisplayEl.addEventListener('click', showSettingsModal);
if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', hideSettingsModal);
if (settingsSaveBtn) settingsSaveBtn.addEventListener('click', saveSettings);

// History Modal Functions
function showHistoryModal() {
    if (!currentUser) return;
    renderHistory();
    if (historyModal) historyModal.style.display = 'flex';
}

function hideHistoryModal() {
    if (historyModal) historyModal.style.display = 'none';
}

function renderHistory() {
    if (!historyContent) return;
    if (!quizHistory || quizHistory.length === 0) {
        historyContent.innerHTML = '<p class="history-empty">No quiz history yet. Complete a quiz to see your results!</p>';
        return;
    }
    
    historyContent.innerHTML = quizHistory.map((entry, entryIndex) => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const questionsHtml = (entry.questions || []).map((q, qIndex) => {
            const timeSeconds = (q.timeMs / 1000).toFixed(2);
            const pointsClass = q.isCorrect ? 'correct' : 'incorrect';
            return `
                <div class="history-question">
                    <div class="history-question-text">${qIndex + 1}. ${escapeHtml(q.question)}</div>
                    <div class="history-question-stats">
                        <span class="history-question-time">${timeSeconds}s</span>
                        <span class="history-question-points ${pointsClass}">${q.isCorrect ? '+' + q.points : '0'} pts</span>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="history-quiz">
                <div class="history-quiz-header" onclick="toggleHistoryQuestions(${entryIndex})">
                    <div>
                        <div class="history-quiz-name">${escapeHtml(entry.quizName)}</div>
                        <div class="history-quiz-date">${dateStr}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="history-quiz-points">${entry.totalPoints} pts</span>
                        <span class="history-toggle" id="toggle-${entryIndex}">▼</span>
                    </div>
                </div>
                <div class="history-questions" id="questions-${entryIndex}">
                    ${questionsHtml}
                </div>
            </div>
        `;
    }).join('');
}

function toggleHistoryQuestions(index) {
    const questionsEl = document.getElementById(`questions-${index}`);
    const toggleEl = document.getElementById(`toggle-${index}`);
    if (!questionsEl || !toggleEl) return;
    if (questionsEl.classList.contains('expanded')) {
        questionsEl.classList.remove('expanded');
        toggleEl.classList.remove('expanded');
    } else {
        questionsEl.classList.add('expanded');
        toggleEl.classList.add('expanded');
    }
}

// History event listeners
if (totalScoreDisplayEl) totalScoreDisplayEl.addEventListener('click', showHistoryModal);
if (historyCloseBtn) historyCloseBtn.addEventListener('click', hideHistoryModal);

// Initial render - check for remembered session
if (!checkRememberedSession()) {
    // Show login screen
    if (loginScreen) loginScreen.style.display = 'block';
    if (selectionEl) selectionEl.style.display = 'none';
}
updateTotalScoreDisplay();
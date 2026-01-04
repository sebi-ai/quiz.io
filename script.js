const quizzes = [
    {
    id: 'Coding',
    name: 'Coding',
    questions: [
      { question: 'When was the first coding language created?', answers: ['1940s','1950s','1960s','1970s'], correct: 1 },
      { question: 'How many coding languages are there?', answers: ['1,000-5,000','5,000-10,000','10,000-15,000','15,000-20,000'], correct: 1 },
      { question: 'What is the most popular coding language on GitHub in 2025?', answers: ['Python','JavaScript','Java','TypeScript'], correct: 3 },
      { question: 'Which coding language is primarily used for iOS development?', answers: ['Java','Kotlin','Swift','C#'], correct: 2 },
      { question: 'Which coding language is known for its use in data science and machine learning?', answers: ['Python','R','Julia','MATLAB'], correct: 0 },
      { question: 'Which coding language is primarily used for Windows development?', answers: ['Python','Java','C#','Ruby'], correct: 2 }

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
      { question: 'Which company developed JavaScript?', answers: ['Netscape','Microsoft','Sun Microsystems','IBM'], correct: 0 }

    ]
  },
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

// State
let currentQuizIndex = null;
let questions = [];
let currentQuestion = 0;
let score = 0;
let questionStartTime = 0;

// Persistent State (localStorage)
let totalScore = 0;
let completedQuizzes = {};
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
        title: 'Your Scores',
        text: 'Your "Total Score" accumulates all points from completed quizzes. "Quiz Score" shows points for your current quiz. Your progress is saved to your account!'
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
    dontShowRestartWarning = userData.dontShowRestartWarning || false;
    
    userDisplayEl.textContent = `User: ${username}`;
    updateTotalScoreDisplay();
    
    loginScreen.style.display = 'none';
    selectionEl.style.display = 'block';
    renderQuizList();
    
    // Show tutorial for new users
    if (isNewUser || !userData.tutorialCompleted) {
        setTimeout(() => showTutorial(), 300);
    }
}

// Tutorial functions
function showTutorial() {
    tutorialStep = 0;
    updateTutorialContent();
    tutorialModal.style.display = 'flex';
}

function updateTutorialContent() {
    const step = tutorialSteps[tutorialStep];
    tutorialTitle.textContent = step.title;
    tutorialText.textContent = step.text;
    
    // Update progress dots
    tutorialDots.forEach((dot, index) => {
        if (index === tutorialStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // Update button text
    if (tutorialStep === tutorialSteps.length - 1) {
        tutorialNextBtn.textContent = 'Get Started!';
    } else {
        tutorialNextBtn.textContent = 'Next';
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
    tutorialModal.style.display = 'none';
    // Mark tutorial as completed
    if (currentUser && users[currentUser]) {
        users[currentUser].tutorialCompleted = true;
        localStorage.setItem('quizUsers', JSON.stringify(users));
    }
}

// Tutorial event listeners
tutorialNextBtn.addEventListener('click', nextTutorialStep);
tutorialSkipBtn.addEventListener('click', closeTutorial);

// Save current user data
function saveUserData() {
    if (!currentUser) return;
    users[currentUser] = {
        password: users[currentUser].password,
        totalScore: totalScore,
        completedQuizzes: completedQuizzes,
        dontShowRestartWarning: dontShowRestartWarning,
        tutorialCompleted: users[currentUser].tutorialCompleted || false
    };
    localStorage.setItem('quizUsers', JSON.stringify(users));
}

// Logout
function logout() {
    saveUserData();
    currentUser = null;
    totalScore = 0;
    completedQuizzes = {};
    localStorage.removeItem('rememberedUser');
    
    userDisplayEl.textContent = 'Not logged in';
    selectionEl.style.display = 'none';
    quizContainer.style.display = 'none';
    loginScreen.style.display = 'block';
    authUsername.value = '';
    authPassword.value = '';
    authError.textContent = '';
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
    if (rememberMeCheckbox.checked) {
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
        dontShowRestartWarning: false,
        tutorialCompleted: false
    };
    localStorage.setItem('quizUsers', JSON.stringify(users));
    
    // Remember me
    if (rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedUser', username);
    }
    
    loginUser(username, users[username], true); // true = new user
}

// You can switch between Login and Register using the buttons; no inline switch text.

// Auth event listeners
loginBtn.addEventListener('click', handleLogin);
registerBtn.addEventListener('click', handleRegister);
logoutBtn.addEventListener('click', logout);

// Allow Enter key to submit
authPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (isRegisterMode) handleRegister();
        else handleLogin();
    }
});

// Modal elements
const restartModal = document.getElementById('restart-modal');
const modalCancelBtn = document.getElementById('modal-cancel');
const modalOkBtn = document.getElementById('modal-ok');
const modalOkNoShowBtn = document.getElementById('modal-ok-no-show');
const totalScoreDisplayEl = document.getElementById('total-score-display');

// Update total score display
function updateTotalScoreDisplay() {
    totalScoreDisplayEl.textContent = `Total: ${totalScore}`;
}

// Save state to localStorage
function saveState() {
    saveUserData();
}

// Show restart warning modal
function showRestartModal() {
    restartModal.style.display = 'flex';
}

// Hide restart warning modal
function hideRestartModal() {
    restartModal.style.display = 'none';
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
modalCancelBtn.addEventListener('click', hideRestartModal);
modalOkBtn.addEventListener('click', () => confirmRestart(false));
modalOkNoShowBtn.addEventListener('click', () => confirmRestart(true));

// Render selection screen
function renderQuizList() {
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
    
    quizTitleEl.textContent = quizzes[index].name || 'Quiz';
    selectionEl.style.display = 'none';
    quizContainer.style.display = 'block';
    startBtn.style.display = 'inline-block';
    startBtn.textContent = isCompleted ? 'Restart' : 'Start';
    score = 0;
    scoreDisplayEl.textContent = 'Quiz: 0';
    progressEl.style.width = '0%';
    questionCountEl.textContent = `Question 0 / ${questions.length}`;
    questionEl.textContent = isCompleted ? 'Click "Restart" to play again!' : 'Click "Start" to begin!';
    answersEl.innerHTML = '';
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
        questionEl.textContent = 'No questions in this quiz.';
        answersEl.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.6)">No questions available.</p>';
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
    scoreDisplayEl.textContent = 'Quiz: 0';
    startBtn.style.display = 'none';
    loadQuestion();
}

function loadQuestion() {
    const q = questions[currentQuestion];
    questionEl.textContent = q.question;
    questionCountEl.textContent = `Question ${currentQuestion + 1} / ${questions.length}`;
    progressEl.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

    answersEl.innerHTML = '';
    q.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.textContent = answer;
        btn.classList.add('answer-btn');
        btn.addEventListener('click', () => selectAnswer(index));
        answersEl.appendChild(btn);
    });

    nextBtn.style.display = 'none';
    questionStartTime = Date.now();
}

function selectAnswer(index) {
    const q = questions[currentQuestion];
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

    if (index === q.correct) {
        // 1000 points base, -10 per 100ms, minimum 50
        const tenths = Math.floor(elapsed / 100);
        const points = Math.max(50, 1000 - tenths * 10);
        score += points;
        scoreDisplayEl.textContent = `Quiz: ${score}`;
    }
    // Wrong answer = 0 points (no change)

    if (currentQuestion < questions.length - 1) {
        nextBtn.style.display = 'block';
    } else {
        setTimeout(() => {
            // Save score to completed quizzes and add to total
            const quizId = quizzes[currentQuizIndex].id;
            completedQuizzes[quizId] = score;
            totalScore += score;
            saveState();
            updateTotalScoreDisplay();
            renderQuizList(); // Update badges in background
            
            questionEl.textContent = `Quiz Complete! Final Score: ${score}`;
            answersEl.innerHTML = '';
            startBtn.textContent = 'Restart';
            startBtn.style.display = 'inline-block';
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
    quizContainer.style.display = 'none';
    selectionEl.style.display = 'block';
}

// Events
startBtn.addEventListener('click', startCurrentQuiz);
nextBtn.addEventListener('click', nextQuestion);
exitBtn.addEventListener('click', goBackToSelection);

// Initial render - check for remembered session
if (!checkRememberedSession()) {
    // Show login screen
    loginScreen.style.display = 'block';
    selectionEl.style.display = 'none';
}
updateTotalScoreDisplay();
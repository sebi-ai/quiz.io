const quizzes = [
    {
    id: 'Coding',
    name: 'Coding',
    questions: [
      { question: 'When was the first coding language created?', answers: ['1940s','1950s','1960s','1970s'], correct: 1 },
        { question: 'How many coding languages are there?', answers: ['1,000-5,000','5,000-10,000','10,000-15,000','15,000-20,000'], correct: 1 },
    ]
  },
    {
    id: 'HTML',
    name: 'HTML',
    questions: [
      { question: 'When was HTML first used in a Website?', answers: ['1991','1993','1995','1997'], correct: 0 },
      { question: 'What was the first Website, HTML was used in?', answers: ['www.w3.org','www.xerox.com','info.cern.ch','world.std.com'], correct: 2 },
      { question: 'How many tags are there in HTML5?', answers: ['about 50','about 100','about 200','about 300'], correct: 1 },
      { question: 'How many tags are there in HTML5?', answers: ['about 50','about 100','about 200','about 300'], correct: 1 },
    ]
  },
];

// DOM Elements
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
const backBtn = document.getElementById('back-btn');

// State
let currentQuizIndex = null;
let questions = [];
let currentQuestion = 0;
let score = 0;
let questionStartTime = 0;

// Render selection screen
function renderQuizList() {
    quizListEl.innerHTML = '';
    if (!quizzes || quizzes.length === 0) {
        quizListEl.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.6);">No quizzes available.</p>';
        return;
    }

    quizzes.forEach((q, i) => {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.innerHTML = `
            <div class="quiz-card-body">
                <div class="quiz-name">${escapeHtml(q.name || 'Untitled Quiz')}</div>
                <div class="quiz-meta">${(q.questions||[]).length} questions</div>
            </div>
            <div class="quiz-card-actions">
                <button class="btn start-quiz-btn" data-index="${i}">Start</button>
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
    questions = (quizzes[index].questions || []);
    quizTitleEl.textContent = quizzes[index].name || 'Quiz';
    selectionEl.style.display = 'none';
    quizContainer.style.display = 'block';
    backBtn.style.display = 'inline-block';
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'Start';
    score = 0;
    scoreDisplayEl.textContent = 'Score: 0';
    progressEl.style.width = '0%';
    questionCountEl.textContent = `Question 0 / ${questions.length}`;
    questionEl.textContent = 'Click "Start" to begin!';
    answersEl.innerHTML = '';
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]);
}

function startCurrentQuiz() {
    if (!questions || questions.length === 0) {
        questionEl.textContent = 'No questions in this quiz.';
        answersEl.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.6)">No questions available.</p>';
        return;
    }
    currentQuestion = 0;
    score = 0;
    scoreDisplayEl.textContent = 'Score: 0';
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
        scoreDisplayEl.textContent = `Score: ${score}`;
    }
    // Wrong answer = 0 points (no change)

    if (currentQuestion < questions.length - 1) {
        nextBtn.style.display = 'block';
    } else {
        setTimeout(() => {
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
backBtn.addEventListener('click', goBackToSelection);

// Initial render
renderQuizList();
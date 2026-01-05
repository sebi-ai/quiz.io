const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.json');

// MIME types for static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

// Initialize database if it doesn't exist
function initDatabase() {
    if (!fs.existsSync(DB_PATH)) {
        const initialData = {
            users: {},
            sessions: {}
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    }
}

// Read database
function readDatabase() {
    initDatabase();
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Write database
function writeDatabase(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Generate session token
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Secure password hashing with scrypt (built into Node.js)
function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ':' + derivedKey.toString('hex'));
        });
    });
}

// Verify password against hash
function verifyPassword(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(':');
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
        });
    });
}

// Parse JSON body from request
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

// Send JSON response
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Serve static files
function serveStaticFile(res, filePath) {
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
}

// Verify session helper
function getSessionUser(req) {
    const sessionToken = req.headers['x-session-token'];
    if (!sessionToken) return null;
    
    const db = readDatabase();
    const session = db.sessions[sessionToken];
    
    return session ? session.username : null;
}

// API Route handlers
async function handleRegister(req, res) {
    try {
        const body = await parseBody(req);
        const { username, password } = body;
        
        if (!username || !password) {
            return sendJSON(res, 400, { error: 'Username and password required' });
        }
        
        if (username.length < 3) {
            return sendJSON(res, 400, { error: 'Username must be at least 3 characters' });
        }
        
        if (password.length < 4) {
            return sendJSON(res, 400, { error: 'Password must be at least 4 characters' });
        }
        
        const db = readDatabase();
        
        if (db.users[username]) {
            return sendJSON(res, 400, { error: 'Username already exists' });
        }
        
        // Hash password with scrypt
        const hashedPassword = await hashPassword(password);
        
        // Create user
        db.users[username] = {
            password: hashedPassword,
            totalScore: 0,
            completedQuizzes: {},
            quizHistory: [],
            dontShowRestartWarning: false,
            tutorialCompleted: false,
            createdAt: new Date().toISOString()
        };
        
        // Create session
        const sessionToken = generateSessionToken();
        db.sessions[sessionToken] = {
            username: username,
            createdAt: new Date().toISOString()
        };
        
        writeDatabase(db);
        
        sendJSON(res, 200, {
            success: true,
            sessionToken: sessionToken,
            userData: {
                totalScore: 0,
                completedQuizzes: {},
                quizHistory: [],
                dontShowRestartWarning: false,
                tutorialCompleted: false
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        sendJSON(res, 500, { error: 'Server error' });
    }
}

async function handleLogin(req, res) {
    try {
        const body = await parseBody(req);
        const { username, password } = body;
        
        if (!username || !password) {
            return sendJSON(res, 400, { error: 'Username and password required' });
        }
        
        const db = readDatabase();
        const user = db.users[username];
        
        if (!user) {
            return sendJSON(res, 401, { error: 'User not found' });
        }
        
        // Verify password with scrypt
        const isValidPassword = await verifyPassword(password, user.password);
        
        if (!isValidPassword) {
            return sendJSON(res, 401, { error: 'Incorrect password' });
        }
        
        // Create session
        const sessionToken = generateSessionToken();
        db.sessions[sessionToken] = {
            username: username,
            createdAt: new Date().toISOString()
        };
        
        writeDatabase(db);
        
        sendJSON(res, 200, {
            success: true,
            sessionToken: sessionToken,
            userData: {
                totalScore: user.totalScore || 0,
                completedQuizzes: user.completedQuizzes || {},
                quizHistory: user.quizHistory || [],
                dontShowRestartWarning: user.dontShowRestartWarning || false,
                tutorialCompleted: user.tutorialCompleted || false
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        sendJSON(res, 500, { error: 'Server error' });
    }
}

function handleLogout(req, res) {
    const sessionToken = req.headers['x-session-token'];
    
    if (sessionToken) {
        const db = readDatabase();
        delete db.sessions[sessionToken];
        writeDatabase(db);
    }
    
    sendJSON(res, 200, { success: true });
}

function handleVerifySession(req, res) {
    const username = getSessionUser(req);
    
    if (!username) {
        return sendJSON(res, 401, { error: 'Invalid session' });
    }
    
    const db = readDatabase();
    const user = db.users[username];
    
    if (!user) {
        return sendJSON(res, 401, { error: 'User not found' });
    }
    
    sendJSON(res, 200, {
        success: true,
        username: username,
        userData: {
            totalScore: user.totalScore || 0,
            completedQuizzes: user.completedQuizzes || {},
            quizHistory: user.quizHistory || [],
            dontShowRestartWarning: user.dontShowRestartWarning || false,
            tutorialCompleted: user.tutorialCompleted || false
        }
    });
}

async function handleSaveData(req, res) {
    const username = getSessionUser(req);
    
    if (!username) {
        return sendJSON(res, 401, { error: 'Invalid session' });
    }
    
    try {
        const body = await parseBody(req);
        const { totalScore, completedQuizzes, quizHistory, dontShowRestartWarning, tutorialCompleted } = body;
        
        const db = readDatabase();
        const user = db.users[username];
        
        if (!user) {
            return sendJSON(res, 404, { error: 'User not found' });
        }
        
        // Update user data
        if (totalScore !== undefined) user.totalScore = totalScore;
        if (completedQuizzes !== undefined) user.completedQuizzes = completedQuizzes;
        if (quizHistory !== undefined) user.quizHistory = quizHistory;
        if (dontShowRestartWarning !== undefined) user.dontShowRestartWarning = dontShowRestartWarning;
        if (tutorialCompleted !== undefined) user.tutorialCompleted = tutorialCompleted;
        
        user.updatedAt = new Date().toISOString();
        
        writeDatabase(db);
        
        sendJSON(res, 200, { success: true });
    } catch (error) {
        console.error('Save data error:', error);
        sendJSON(res, 500, { error: 'Server error' });
    }
}

async function handleChangePassword(req, res) {
    const username = getSessionUser(req);
    
    if (!username) {
        return sendJSON(res, 401, { error: 'Invalid session' });
    }
    
    try {
        const body = await parseBody(req);
        const { oldPassword, newPassword } = body;
        
        if (!oldPassword || !newPassword) {
            return sendJSON(res, 400, { error: 'Old and new password required' });
        }
        
        if (newPassword.length < 4) {
            return sendJSON(res, 400, { error: 'New password must be at least 4 characters' });
        }
        
        const db = readDatabase();
        const user = db.users[username];
        
        if (!user) {
            return sendJSON(res, 404, { error: 'User not found' });
        }
        
        // Verify old password
        const isValidPassword = await verifyPassword(oldPassword, user.password);
        
        if (!isValidPassword) {
            return sendJSON(res, 401, { error: 'Current password is incorrect' });
        }
        
        // Hash new password
        user.password = await hashPassword(newPassword);
        user.updatedAt = new Date().toISOString();
        
        writeDatabase(db);
        
        sendJSON(res, 200, { success: true });
    } catch (error) {
        console.error('Change password error:', error);
        sendJSON(res, 500, { error: 'Server error' });
    }
}

// HTTP Server with routing
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    // API Routes
    if (pathname === '/api/register' && method === 'POST') {
        return handleRegister(req, res);
    }
    if (pathname === '/api/login' && method === 'POST') {
        return handleLogin(req, res);
    }
    if (pathname === '/api/logout' && method === 'POST') {
        return handleLogout(req, res);
    }
    if (pathname === '/api/verify-session' && method === 'GET') {
        return handleVerifySession(req, res);
    }
    if (pathname === '/api/save-data' && method === 'POST') {
        return handleSaveData(req, res);
    }
    if (pathname === '/api/change-password' && method === 'POST') {
        return handleChangePassword(req, res);
    }
    
    // Static files
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }
    
    serveStaticFile(res, filePath);
});

// Start server
server.listen(PORT, () => {
    initDatabase();
    console.log(`Quiz.io server running at http://localhost:${PORT}`);
});

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ACCOUNTS_PATH = path.join(__dirname, 'accounts.json');
const CUSTOM_QUIZZES_PATH = path.join(__dirname, 'custom-quizzes.json');
const WISHES_PATH = path.join(__dirname, 'wishes.json');
const SECRET_KEY_PATH = path.join(__dirname, '.secret_key');

// One week in milliseconds
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Encryption key management
let ENCRYPTION_KEY = null;

async function getEncryptionKey() {
    if (ENCRYPTION_KEY) return ENCRYPTION_KEY;
    try {
        // Try to read existing key
        const keyHex = await fs.readFile(SECRET_KEY_PATH, 'utf8');
        ENCRYPTION_KEY = Buffer.from(keyHex.trim(), 'hex');
    } catch (e) {
        // Generate new key if not exists
        ENCRYPTION_KEY = crypto.randomBytes(32);
        await fs.writeFile(SECRET_KEY_PATH, ENCRYPTION_KEY.toString('hex'), 'utf8');
        console.log('Generated new encryption key');
    }
    return ENCRYPTION_KEY;
}

// AES-256-GCM encryption
function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    // Format: iv:authTag:encryptedData
    return iv.toString('hex') + ':' + authTag + ':' + encrypted;
}

function decrypt(encryptedText, key) {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted format');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function readAccounts() {
    try {
        const key = await getEncryptionKey();
        const raw = await fs.readFile(ACCOUNTS_PATH, 'utf8');
        if (!raw || raw.trim() === '') return {};
        // Check if data is encrypted (contains colons in specific format)
        if (raw.includes(':') && !raw.startsWith('{')) {
            // Encrypted format
            const decrypted = decrypt(raw.trim(), key);
            return JSON.parse(decrypted);
        } else {
            // Legacy unencrypted JSON - migrate it
            const data = JSON.parse(raw);
            await writeAccounts(data); // Re-save encrypted
            return data;
        }
    } catch (e) {
        console.error('Error reading accounts:', e.message);
        return {};
    }
}

async function writeAccounts(data) {
    const key = await getEncryptionKey();
    const jsonStr = JSON.stringify(data);
    const encrypted = encrypt(jsonStr, key);
    await fs.writeFile(ACCOUNTS_PATH, encrypted, 'utf8');
}

// Custom quizzes helpers
async function readCustomQuizzes() {
    try {
        const raw = await fs.readFile(CUSTOM_QUIZZES_PATH, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (e) {
        return [];
    }
}

async function writeCustomQuizzes(data) {
    await fs.writeFile(CUSTOM_QUIZZES_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Wishes helpers
async function readWishes() {
    try {
        const raw = await fs.readFile(WISHES_PATH, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (e) {
        return [];
    }
}

async function writeWishes(data) {
    await fs.writeFile(WISHES_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Clean up expired custom quizzes (older than 1 week)
async function cleanupExpiredQuizzes() {
    const quizzes = await readCustomQuizzes();
    const now = Date.now();
    const filtered = quizzes.filter(q => (now - q.createdAt) < ONE_WEEK_MS);
    if (filtered.length !== quizzes.length) {
        await writeCustomQuizzes(filtered);
    }
    return filtered;
}

// Return the full accounts object
app.get('/accounts', async (req, res) => {
    const accounts = await readAccounts();
    res.json(accounts);
});

// Return a single user (without password)
app.get('/accounts/:username', async (req, res) => {
    const accounts = await readAccounts();
    const u = accounts[req.params.username];
    if (!u) return res.status(404).json({ error: 'Not found' });
    const { password, ...rest } = u;
    res.json(rest);
});

// Register: create user with hashed password
app.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ error: 'Missing' });
        const accounts = await readAccounts();
        if (accounts[username]) return res.status(400).json({ error: 'User exists' });
        const hash = await bcrypt.hash(password, 10);
        accounts[username] = {
            password: hash,
            totalScore: 0,
            completedQuizzes: {},
            quizHistory: [],
            dontShowRestartWarning: false,
            tutorialCompleted: false,
            isAdmin: false,
            isBanned: false
        };
        await writeAccounts(accounts);
        const { password: _p, ...rest } = accounts[username];
        res.json(rest);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login: verify password and return user data (without password)
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ error: 'Missing' });
        const accounts = await readAccounts();
        const user = accounts[username];
        if (!user) return res.status(404).json({ error: 'User not found' });
        const match = await bcrypt.compare(password, user.password || '');
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        if (user.isBanned) return res.status(403).json({ error: 'Account is banned' });
        const { password: _p, ...rest } = user;
        res.json(rest);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update single user fields. If `user.password` provided and not bcrypt-hash, hash it.
app.post('/accounts/update-user', async (req, res) => {
    try {
        const { username, user } = req.body || {};
        if (!username || !user) return res.status(400).json({ error: 'Missing' });
        const accounts = await readAccounts();
        const existing = accounts[username] || {};
        // If password provided and doesn't look like a bcrypt hash, hash it
        if (user.password) {
            const pw = String(user.password);
            if (!pw.startsWith('$2a$') && !pw.startsWith('$2b$') && !pw.startsWith('$2y$')) {
                const hash = await bcrypt.hash(pw, 10);
                existing.password = hash;
            } else {
                existing.password = pw;
            }
        }
        // Merge other fields
        for (const k of Object.keys(user)) {
            if (k === 'password') continue;
            existing[k] = user[k];
        }
        accounts[username] = existing;
        await writeAccounts(accounts);
        const { password, ...rest } = existing;
        res.json(rest);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Overwrite accounts (expects { users: { ... } })
app.post('/accounts/save', async (req, res) => {
    try {
        const { users } = req.body || {};
        if (typeof users !== 'object') return res.status(400).json({ error: 'Invalid payload' });
        await writeAccounts(users);
        res.json({ ok: true });
    } catch (e) {
        console.error('Error saving accounts:', e);
        res.status(500).json({ error: 'Failed to save accounts' });
    }
});

// Simple session verification endpoint (no real sessions implemented here)
app.get('/api/verify-session', async (req, res) => {
    // If you implement real sessions, check token from header or cookie here
    // For now, return not authenticated
    res.json({ success: false });
});

// Simple logout endpoint
app.post('/api/logout', async (req, res) => {
    // With real sessions you would clear the server-side session here
    res.json({ ok: true });
});

// ========== CUSTOM QUIZZES ==========

// Get all custom quizzes (auto-cleanup expired ones)
app.get('/api/custom-quizzes', async (req, res) => {
    try {
        const quizzes = await cleanupExpiredQuizzes();
        res.json(quizzes);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new custom quiz
app.post('/api/custom-quizzes', async (req, res) => {
    try {
        const { name, questions, createdBy } = req.body || {};
        if (!name || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Name and at least one question required' });
        }
        if (!createdBy) {
            return res.status(400).json({ error: 'Creator username required' });
        }
        
        const quizzes = await cleanupExpiredQuizzes();
        const newQuiz = {
            id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name.substring(0, 100), // Begrenze Namen auf 100 Zeichen
            questions: questions.slice(0, 20).map(q => ({ // Begrenze auf 20 Fragen
                question: String(q.question || '').substring(0, 500),
                answers: (q.answers || []).slice(0, 6).map(a => String(a).substring(0, 200)),
                correct: Math.min(Math.max(0, parseInt(q.correct) || 0), (q.answers || []).length - 1)
            })),
            createdBy: createdBy,
            createdAt: Date.now(),
            isCustom: true
        };
        
        quizzes.push(newQuiz);
        await writeCustomQuizzes(quizzes);
        res.json(newQuiz);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a custom quiz (by creator or admin)
app.delete('/api/custom-quizzes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body || {};
        
        let quizzes = await cleanupExpiredQuizzes();
        const quiz = quizzes.find(q => q.id === id);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Check if user is admin
        const accounts = await readAccounts();
        const user = accounts[username];
        const isAdmin = user && user.isAdmin === true;
        
        if (quiz.createdBy !== username && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this quiz' });
        }
        
        quizzes = quizzes.filter(q => q.id !== id);
        await writeCustomQuizzes(quizzes);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== ADMIN ENDPOINTS ==========

// Get all users (admin only, no passwords)
app.get('/api/admin/users', async (req, res) => {
    try {
        const adminUser = req.headers['x-admin-user'];
        const accounts = await readAccounts();
        const admin = accounts[adminUser];
        if (!admin || admin.isAdmin !== true) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        // Return users without passwords
        const usersList = Object.entries(accounts).map(([username, data]) => ({
            username,
            totalScore: data.totalScore || 0,
            isBanned: data.isBanned || false,
            isAdmin: data.isAdmin || false
        }));
        res.json(usersList);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Ban/unban a user (admin only)
app.post('/api/admin/ban', async (req, res) => {
    try {
        const { adminUser, targetUser, ban } = req.body || {};
        const accounts = await readAccounts();
        const admin = accounts[adminUser];
        if (!admin || admin.isAdmin !== true) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        if (!accounts[targetUser]) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (targetUser === adminUser) {
            return res.status(400).json({ error: 'Cannot ban yourself' });
        }
        
        accounts[targetUser].isBanned = !!ban;
        await writeAccounts(accounts);
        res.json({ ok: true, isBanned: accounts[targetUser].isBanned });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== WISHES ENDPOINTS ==========

// Submit a wish (any logged-in user)
app.post('/api/wishes', async (req, res) => {
    try {
        const { username, wish } = req.body || {};
        if (!username || !wish || typeof wish !== 'string' || wish.trim().length === 0) {
            return res.status(400).json({ error: 'Username and wish text required' });
        }
        
        const wishes = await readWishes();
        const newWish = {
            id: 'wish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            username: username,
            wish: wish.trim().substring(0, 500),
            createdAt: Date.now()
        };
        
        wishes.push(newWish);
        await writeWishes(wishes);
        res.json(newWish);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all wishes (admin only)
app.get('/api/admin/wishes', async (req, res) => {
    try {
        const adminUser = req.headers['x-admin-user'];
        const accounts = await readAccounts();
        const admin = accounts[adminUser];
        if (!admin || admin.isAdmin !== true) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const wishes = await readWishes();
        res.json(wishes);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a wish (admin only)
app.delete('/api/admin/wishes/:id', async (req, res) => {
    try {
        const adminUser = req.headers['x-admin-user'];
        const { id } = req.params;
        
        const accounts = await readAccounts();
        const admin = accounts[adminUser];
        if (!admin || admin.isAdmin !== true) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        let wishes = await readWishes();
        wishes = wishes.filter(w => w.id !== id);
        await writeWishes(wishes);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

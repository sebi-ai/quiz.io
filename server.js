const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const ACCOUNTS_PATH = path.join(__dirname, 'accounts.json');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function readAccounts() {
    try {
        const raw = await fs.readFile(ACCOUNTS_PATH, 'utf8');
        return JSON.parse(raw || '{}');
    } catch (e) {
        return {};
    }
}

async function writeAccounts(data) {
    await fs.writeFile(ACCOUNTS_PATH, JSON.stringify(data, null, 2), 'utf8');
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
            tutorialCompleted: false
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

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

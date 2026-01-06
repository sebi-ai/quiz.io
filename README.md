Quiz App — Local JSON account storage

This project includes a minimal Express server to persist accounts/passwords to `accounts.json`.

How it works
- Static frontend lives in this folder (`index.html`, `script.js`, ...).
- The Express server serves the static files and provides two endpoints:
  - `GET /accounts` — returns the accounts object from `accounts.json`.
  - `POST /accounts/save` — accepts `{ users: { ... } }` and overwrites `accounts.json`.

Security note
- Passwords in this demo are stored as a simple hash (not secure). Do NOT use this code in production.

Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open http://localhost:3000 in your browser.

If you prefer not to run the server, the frontend will fall back to using `localStorage` for accounts.
# quiz.io

This is how it works: 
When you start the 


# quiz.io

A local quiz web app built with Node.js, Express, and plain JavaScript/HTML/CSS.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm

## How to Run

1. Clone or download the repository into a local folder.
2. Open your terminal in the project folder and install the dependencies:

   ```bash
   npm install
   ```

3. Start the local server:

   ```bash
   npm start
   ```

4. Open your web browser and navigate to:

   ```text
   http://localhost:3000
   ```

*Optional: The app runs on port 3000 by default. You can change this by setting the `PORT` environment variable before starting the app (e.g., `PORT=8080 npm start`).*

## Features

- **User Accounts:** Local registration and login.
- **Quizzes:** Play predefined quizzes to earn points and view your local history.
- **Community Quizzes:** Create your own custom quizzes which automatically disappear after 1 week.
- **Admin Panel:** Built-in interface to moderate users and quizzes.

## Data Storage

All data (accounts, custom quizzes, wishes) is saved entirely locally in `.json` files within the project directory. The `accounts.json` file is encrypted automatically on startup.

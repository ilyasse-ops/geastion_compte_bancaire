# Secure Bank Account Management System

A full-stack web application for digital financial services, built with React (Redux Toolkit), Node.js (Express), and SQLite.

## Features

- **Secure Authentication:** JWT-based login and registration.
- **Account Management:** Create new checking/savings accounts and view real-time balances.
- **Transactions:** Deposit, withdraw, and transfer funds securely. Backend uses SQLite transactions to prevent race conditions and ensure data integrity.
- **Transaction History:** Detailed logs of all account activities.
- **Premium UI:** Modern design with glassmorphism, dark mode, and dynamic animations built with Vanilla CSS.

## Tech Stack

- **Frontend:** React, Vite, Redux Toolkit, React Router, Axios, Lucide React (Icons), Vanilla CSS.
- **Backend:** Node.js, Express, SQLite, JSON Web Tokens (JWT), Bcrypt.
- **Database:** SQLite (No installation required).

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server (The SQLite database will automatically create itself!):
   ```bash
   npm run dev
   # or
   node server.js
   ```

### 2. Frontend Setup
1. Open a **new terminal** and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Architectural Highlights

- **Security:** Passwords are cryptographically hashed using `bcrypt`. Route protection is implemented via JWT middleware.
- **Data Integrity:** Transfers between accounts use ACID-compliant SQLite transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) to ensure funds are not lost or duplicated during concurrent requests.
- **State Management:** Redux Toolkit handles complex async states cleanly with `createAsyncThunk`.

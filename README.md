# FinTrack – Smart Finance Manager

A full-stack personal finance app built on the MERN stack. Record income and expenses, set monthly budgets per category, and see where your money goes.

## Features

- Account registration and sign-in with JWT authentication and bcrypt-hashed passwords
- Income and expense tracking with search, type and category filters, and pagination
- Monthly budgets per category with live progress against actual spending
- Dashboard with balance, income, spending, savings rate, a 6-month trend chart and a category breakdown
- Input validation, rate-limited auth routes, Helmet security headers, and centralized error handling
- Every query is scoped to the signed-in user

## Tech stack

| Layer    | Tools |
|----------|-------|
| Frontend | React 18, Vite, React Router, Axios, Recharts |
| Backend  | Node.js, Express, express-validator, Helmet, express-rate-limit |
| Database | MongoDB with Mongoose |
| Auth     | JSON Web Tokens, bcryptjs |

## Project structure

```
fintrack/
├── package.json            # root scripts (run client + server together)
├── server/
│   ├── server.js           # app entry
│   ├── config/db.js
│   ├── models/             # User, Transaction, Budget
│   ├── controllers/        # auth, transactions, budgets, analytics
│   ├── routes/
│   └── middleware/         # auth, validation, error handling
└── client/
    └── src/
        ├── api.js          # Axios instance + auth interceptor
        ├── context/        # AuthContext
        ├── components/     # Layout, TransactionForm
        └── pages/          # AuthPage, Dashboard, Transactions, Budgets
```

## Getting started

Prerequisites: Node.js 18+ and a MongoDB instance (local or MongoDB Atlas).

```bash
npm run install:all                     # installs root, server and client deps
cp server/.env.example server/.env      # then set MONGO_URI and a long random JWT_SECRET
cp client/.env.example client/.env      # optional: currency and locale (defaults to INR, en-IN)
npm run dev                             # API on :5000, client on :5173
```

Open http://localhost:5173 and create an account.

## API overview

All routes except `/api/auth/register` and `/api/auth/login` need an `Authorization: Bearer <token>` header.

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/transactions` | List (`type`, `category`, `search`, `from`, `to`, `page`, `limit`) |
| POST | `/api/transactions` | Create |
| PUT / DELETE | `/api/transactions/:id` | Update / delete |
| GET | `/api/budgets?month=YYYY-MM` | Budgets with amount spent |
| POST | `/api/budgets` | Create or update a category budget |
| DELETE | `/api/budgets/:id` | Remove |
| GET | `/api/analytics/summary?month=YYYY-MM` | Totals, category split, 6-month trend |

## Production

```bash
npm run build      # builds client/dist
```

Serve `client/dist` from a static host (or add `express.static` to the server), set `NODE_ENV=production`, and set `CLIENT_URL` to your deployed frontend origin.

## Roadmap ideas

Recurring transactions, CSV import/export, savings goals, refresh tokens, and automated tests (Jest + Supertest).

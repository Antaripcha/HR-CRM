# 🏢 HR-CRM — Internal Employee Management System

A full-stack, production-ready HR and CRM platform built on a **Turborepo monorepo** architecture.

---

## 📐 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| State | Redux Toolkit |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Monorepo | Turborepo |
| Auth | JWT (Access + Refresh tokens) |
| Styling | Tailwind CSS |
| HTTP | Axios (with interceptors) |
| Validation | Zod |
| Testing | Jest (API) + Vitest (UI) |

---

## 📁 Project Structure

```
hr-crm/
├── apps/
│   ├── api/                     # Express backend
│   │   ├── src/
│   │   │   ├── config/          # DB, JWT, seed
│   │   │   ├── controllers/     # Route handlers
│   │   │   ├── middleware/      # Auth, validation, errors
│   │   │   ├── models/          # Mongoose schemas
│   │   │   ├── routes/          # Express routers
│   │   │   └── services/        # Business logic
│   │   └── tests/               # Jest test suites
│   └── web/                     # React frontend
│       └── src/
│           ├── components/      # UI components
│           │   ├── common/      # Reusable atoms
│           │   └── layout/      # Sidebar, Header
│           ├── lib/             # API client, utils, validations
│           ├── pages/           # Route-level views
│           ├── routes/          # ProtectedRoute
│           ├── store/           # Redux store + slices
│           └── test/            # Vitest tests
├── packages/
│   ├── config/                  # Shared ESLint config
│   └── utils/                   # Shared utilities
└── turbo.json                   # Turborepo pipeline
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (or provide a `MONGO_URI`)
- npm ≥ 9 (workspaces support)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example apps/api/.env
# Edit apps/api/.env with your MongoDB URI and JWT secrets
```

Also create `apps/web/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the database (optional but recommended)

```bash
cd apps/api
npm run seed
```

This creates departments and demo users:

| Role | Email | Password |
|---|---|---|
| Admin | admin@hrcrm.com | Admin@123 |
| HR | hr@hrcrm.com | Hr@123 |
| Employee | emp@hrcrm.com | Emp@123 |

### 4. Start development

```bash
# From root — starts both api and web in parallel
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## 🔐 Authentication Flow

```
Login → POST /api/auth/login
      → Returns { accessToken (15m), refreshToken (7d, httpOnly cookie) }

Protected request → Bearer <accessToken> in Authorization header

Token expired (401 + TOKEN_EXPIRED) → Axios interceptor auto-calls
      → POST /api/auth/refresh
      → Rotates both tokens transparently
      → Retries original request

Logout → POST /api/auth/logout → Clears DB refresh token + cookie
```

---

## 👥 Role-Based Access Control

| Feature | Admin | HR | Employee |
|---|:---:|:---:|:---:|
| View all employees | ✅ | ✅ | ❌ |
| Create/edit employee | ✅ | ✅ | ❌ |
| Delete employee | ✅ | ❌ | ❌ |
| Manage departments | ✅ | ❌ | ❌ |
| Approve/reject leaves | ✅ | ✅ | ❌ |
| Apply for leave | ❌ | ❌ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Admin dashboard | ✅ | ✅ | ❌ |

---

## 🛠 REST API Reference

### Auth
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login
POST   /api/auth/refresh      Refresh access token
POST   /api/auth/logout       Logout (requires auth)
GET    /api/auth/me           Get current user
```

### Employees
```
GET    /api/employees         List all (Admin/HR)
GET    /api/employees/me      My profile
GET    /api/employees/:id     Get by ID (Admin/HR)
POST   /api/employees         Create (Admin/HR)
PATCH  /api/employees/:id     Update (Admin/HR)
DELETE /api/employees/:id     Deactivate (Admin only)
```

### Departments
```
GET    /api/departments       List all
GET    /api/departments/:id   Get by ID
POST   /api/departments       Create (Admin)
PATCH  /api/departments/:id   Update (Admin)
DELETE /api/departments/:id   Delete (Admin)
```

### Leaves
```
GET    /api/leaves            List (filtered by role)
GET    /api/leaves/stats      Leave statistics
GET    /api/leaves/:id        Get by ID
POST   /api/leaves/apply      Apply for leave
PATCH  /api/leaves/:id/review Approve/reject (Admin/HR)
PATCH  /api/leaves/:id/cancel Cancel own leave
```

### Dashboard
```
GET    /api/dashboard/admin   Admin stats + charts
GET    /api/dashboard/employee Employee stats
```

---

## 🧪 Testing

```bash
# API tests (Jest)
cd apps/api && npm test

# Frontend tests (Vitest)
cd apps/web && npm test
```

---

## 🏗 Building for Production

```bash
npm run build
```

### API
```bash
cd apps/api && NODE_ENV=production npm start
```

### Web
Serve the `apps/web/dist/` folder with any static host (Nginx, Vercel, Netlify, etc.).

---

## 🔧 Key Features Implemented

- ✅ JWT auth with refresh token rotation
- ✅ Role-based access control (Admin / HR / Employee)
- ✅ Employee CRUD with auto-generated IDs
- ✅ Department management with employee counts
- ✅ Leave lifecycle (apply → approve/reject → cancel)
- ✅ Overlap detection for leave requests
- ✅ Role-aware dashboards with Recharts
- ✅ Axios interceptor for silent token refresh
- ✅ Zod validation on frontend and backend
- ✅ Global error handling middleware
- ✅ Rate limiting + Helmet security headers
- ✅ Optimistic UI updates via Redux
- ✅ Lazy-loaded pages with code splitting
- ✅ Dark-themed, responsive UI
- ✅ Database seed script with demo data

---

## 📦 Available Scripts (root)

| Command | Description |
|---|---|
| `npm run dev` | Start all apps in dev mode |
| `npm run build` | Build all apps |
| `npm run test` | Run all test suites |
| `npm run lint` | Lint all packages |

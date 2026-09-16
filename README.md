# Devendra Bhoi — Production-Grade Personal Portfolio & CMS

A decoupled, dynamic personal portfolio and Content Management System (CMS) engineered with **FastAPI**, **PostgreSQL**, **SQLAlchemy 2.x**, **React 18**, and **Tailwind CSS**.

Engineered by **Devendra Bhoi** (Computer Engineering Graduate) to demonstrate clean architecture, robust security practices, and decoupled system design.

---

## 🏛️ System Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          React SPA (Frontend)                             │
│        React 18 • Vite • JavaScript (ES6+) • Tailwind CSS • React Router  │
│       Zero localStorage Tokens • Session via Signed httpOnly Cookies      │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ HTTP / JSON REST
                                      │ Credentials: 'include'
                                      │ CSRF Defense: 'X-Requested-With'
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    FastAPI Core Service (/api/v1)                         │
│           Pydantic v2 Validation • Production SECRET_KEY Guard            │
│         Signed JWT Cookie Auth • Origin / CSRF Defense Layer              │
│            In-Memory Sliding-Window IP Rate Limiter (Contact)             │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Dependency Injection (get_db, auth)
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              Service Layer                                │
│       AuthService (bcrypt 12) • ProjectService • ContactService           │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                            Repository Layer                               │
│      UserRepository • ProjectRepository • ContactRepository               │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ SQLAlchemy 2.0 ORM
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Relational Database                       │
│    Alembic Migrations (001_projects, 002_users, 003_contact_messages)     │
└───────────────────────────────────────────────────────────────────────────┘
```

### Architectural Layer Responsibilities

| Layer | Path | Responsibility |
| :--- | :--- | :--- |
| **API Endpoints** | `backend/app/api/v1/` | Routes HTTP requests, parses query parameters, coordinates dependencies, and returns HTTP status codes. **Contains no direct DB queries.** |
| **Security & Auth** | `backend/app/core/security.py` & `deps.py` | Native `bcrypt` password hashing, `pyjwt` token generation/decoding, `httpOnly` cookie parsing, and CSRF Origin validation. |
| **Rate Limiting** | `backend/app/core/rate_limiter.py` | Thread-safe in-memory sliding window limiter protecting contact submissions per client IP. |
| **Schemas (DTOs)** | `backend/app/schemas/` | Pydantic v2 models for strict request validation, sanitized output formatting, and type-safety. Passwords are never serialized. |
| **Service Layer** | `backend/app/services/` | Encapsulates domain logic, authentication workflows, uniqueness verification, and honeypot spam checks. |
| **Repository Layer** | `backend/app/repositories/` | Manages database operations (CRUD, filtering, sorting, pagination) via SQLAlchemy 2.x session queries. |
| **Database Models** | `backend/app/models/` | SQLAlchemy 2.x `DeclarativeBase` models representing PostgreSQL relational tables (`users`, `projects`, `contact_messages`). |
| **Frontend State & CMS** | `frontend/src/` | Single-page application consuming the REST API, featuring a public project showcase, contact system, and an authenticated admin management console. |

---

## 🔒 Security Architecture & Defensive Controls

1. **Native Bcrypt Password Hashing**:
   - Administrator passwords are salted and hashed using `bcrypt` with a work factor of 12. Plaintext passwords and password hashes are never exposed through API response schemas.
2. **Signed JWT Authentication in HttpOnly Cookies**:
   - Authentication tokens are cryptographically signed using HS256 with strict expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`).
   - Tokens are transmitted and stored exclusively inside `httpOnly`, `SameSite=Lax` cookies (`Secure=True` enforced in production).
   - Zero tokens are stored in browser `localStorage` or `sessionStorage`, mitigating Cross-Site Scripting (XSS) credential theft.
3. **Login Brute-Force & Credential Stuffing Protection**:
   - A thread-safe, in-memory sliding-window `LoginFailureLimiter` tracks failed authentication attempts by `(normalized_identifier, client_ip)`.
   - Maximum 5 failed attempts within 10 minutes; subsequent attempts from that key are blocked with HTTP 429 Too Many Requests.
   - Successful authentication resets the failure counter. Generic authentication error messages ("Invalid username or password.") prevent account enumeration.
4. **CSRF Protection on Mutating Endpoints**:
   - State-changing admin endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) require both trusted Origin/Referer (`BACKEND_CORS_ORIGINS`) and a custom request header (`X-Requested-With` or `X-CSRF-Token`), defending cookie-authenticated sessions against cross-site form forgery.
   - Public contact form submission remains accessible without requiring authentication cookies or admin CSRF headers.
5. **Contact Form Rate Limiting & Spam Honeypot**:
   - Public inquiries are metered via an in-memory sliding-window limiter (max 5 submissions per 10 minutes per client IP).
   - An invisible honeypot field catches automated spam bots without impacting legitimate visitors.
6. **Parameterized & ORM Database Queries**:
   - Database operations are executed using SQLAlchemy 2.x ORM models with bound parameters.
   - Slugs, queries, and filters are strictly parameterized, protecting against SQL injection attacks.
7. **Strict Input Validation & Bounded Payloads**:
   - Pydantic v2 schemas enforce field length boundaries, URL schemes, email formats, and pagination limits.
   - Mutation schemas enforce `extra="forbid"` to reject unexpected payload fields.
8. **Production Security Guardrails**:
   - In production (`ENVIRONMENT="production"`), startup settings validation strictly requires `COOKIE_SECURE=True`, rejects default or weak `SECRET_KEY` values (minimum 32 characters), and forbids wildcard `*` CORS origins.
9. **Defensive Security Headers**:
   - Responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
   - Content-Security-Policy enforces `frame-ancestors 'none'` to mitigate clickjacking, with documentation endpoints specifically scoped.
10. **Zero Hardcoded Secrets**:
    - `.env` files are strictly excluded from source control via `.gitignore`. Sanitized configuration templates are maintained in `.env.example`.

### Architecture Limitations & Operational Context
- **In-Memory Rate Limiting**: The sliding-window rate limiters for contact submissions and login brute-force protection operate in process memory. In a distributed multi-instance deployment, rate limiting state applies per application instance.
- **Client IP Attribution**: Client IP address resolution relies on socket connection host (`request.client.host`) and deliberately avoids trusting arbitrary unverified `X-Forwarded-For` headers from the public internet. Reverse proxy environments (such as Render or Nginx) must configure trusted proxy headers via ASGI middleware or Uvicorn proxy header settings.

---

## 📁 Repository Structure

```
portfolio/
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Footer, Button, SectionHeading, ProjectCard,
│   │   │                          # ProjectGrid, TechnologyTag, ContactForm, SEO, State views
│   │   ├── context/               # AuthContext (user session state via /api/v1/auth/me)
│   │   ├── layouts/               # RootLayout (Navbar + Outlet + Footer)
│   │   ├── pages/                 # Public pages (Home, About, Projects, ProjectDetail, Contact)
│   │   │   └── admin/             # Admin console (AdminLoginPage, AdminDashboard, AdminProjects)
│   │   ├── services/              # API client with credentials & CSRF headers (projectsApi, contactApi)
│   │   ├── App.jsx                # Route registry & ProtectedRoute wrapper
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind CSS directives & accessible focus styles
│   ├── public/                    # robots.txt, sitemap.xml, favicon
│   ├── package.json               # Frontend dependencies & scripts
│   ├── vite.config.js             # Vite configuration
│   └── tailwind.config.js         # Tailwind theme & design tokens
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py            # get_db, get_current_active_user, verify_csrf_protection
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py    # Login (cookie set), Logout, Me
│   │   │       │   ├── contact.py # Public contact submit & admin message retrieval
│   │   │       │   ├── health.py  # Health check
│   │   │       │   └── projects.py# Public & Admin project CRUD
│   │   │       └── router.py      # Route aggregator
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic Settings with production key guard
│   │   │   ├── database.py        # SQLAlchemy 2.x sessionmaker & engine
│   │   │   ├── rate_limiter.py    # SlidingWindowRateLimiter (thread-safe IP limiter)
│   │   │   └── security.py        # Native bcrypt & PyJWT helpers
│   │   ├── models/                # Project, User, ContactMessage models
│   │   ├── repositories/          # ProjectRepository, UserRepository, ContactRepository
│   │   ├── schemas/               # Project, User, ContactMessage Pydantic schemas
│   │   ├── services/              # ProjectService, AuthService, ContactService
│   │   ├── scripts/
│   │   │   └── create_admin.py    # CLI tool to initialize administrator
│   │   └── main.py                # FastAPI factory & CORS middleware
│   ├── alembic/                   # Database migrations (001_projects, 002_users, 003_contact_messages)
│   ├── tests/
│   │   ├── conftest.py            # SQLite in-memory test database & auth fixtures
│   │   ├── test_auth.py           # 11 authentication, bcrypt, CSRF, and secret tests
│   │   ├── test_contact.py        # 8 contact message, honeypot, and rate limiter tests
│   │   ├── test_health.py         # 2 health and root endpoint tests
│   │   └── test_projects.py       # 19 project schema, CRUD, and pagination tests
│   ├── requirements.txt           # Pinned backend dependencies
│   ├── alembic.ini                # Alembic CLI config
│   └── .env.example               # Backend environment variable template
│
├── docker-compose.yml             # Local PostgreSQL 16 container definition
├── .gitignore                     # Source control exclusions (.env, node_modules, venvs)
└── README.md                      # Project documentation
```

---

## 📡 REST API Reference

### Public Endpoints

| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status check | Public |
| `GET` | `/api/v1/projects` | List published projects with filters (`category`, `featured`, pagination) | Public |
| `GET` | `/api/v1/projects/{slug}` | Fetch published project details by unique URL slug | Public |
| `POST` | `/api/v1/contact` | Submit contact inquiry (rate limited, honeypot protected) | Public |

### Authentication Endpoints

| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticates credentials; sets signed JWT in `httpOnly` cookie | Public |
| `POST` | `/api/v1/auth/logout` | Clears authentication cookie | Public |
| `GET` | `/api/v1/auth/me` | Returns profile of currently authenticated user | Authenticated |

### Admin Endpoints (Guarded by JWT Cookie + CSRF Header)

| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/projects` | List all projects (including drafts/unpublished) | Admin Only |
| `POST` | `/api/v1/admin/projects` | Create a new project | Admin Only |
| `GET` | `/api/v1/admin/projects/{id}` | Get project details by primary key ID | Admin Only |
| `PATCH` | `/api/v1/admin/projects/{id}` | Partially update project attributes | Admin Only |
| `DELETE` | `/api/v1/admin/projects/{id}` | Permanently delete project from database | Admin Only |
| `GET` | `/api/v1/admin/messages` | List submitted contact messages | Admin Only |
| `PATCH` | `/api/v1/admin/messages/{id}/read` | Mark message as read | Admin Only |

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Python**: 3.10 or newer
- **Node.js**: 18+ & npm
- **Database**: PostgreSQL 14+ (or Docker)

---

### 1. Database Setup

#### Option A: Docker Compose (Recommended)
```bash
docker compose up -d
```
Starts PostgreSQL 16 on port `5432` with persistent data in `postgres_data`.

#### Option B: Local PostgreSQL
Create a database named `portfolio_db`:
```sql
CREATE DATABASE portfolio_db;
```

---

### 2. Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - macOS / Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up local environment variables**:
   ```powershell
   Copy-Item .env.example .env
   ```
   *(Ensure `DATABASE_URL` matches your local PostgreSQL connection credentials).*

5. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Create an administrator account**:
   ```bash
   python -m app.scripts.create_admin
   ```
   Follow the prompt to set an admin username, email, and secure password.

7. **Start the FastAPI backend server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - Health check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
   - Interactive Swagger docs: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

---

### 3. Frontend Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Public Portfolio: [http://localhost:5173](http://localhost:5173)
   - Admin Login: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
   - Admin CMS Console: [http://localhost:5173/admin/projects](http://localhost:5173/admin/projects)

---

## 🧪 Automated Testing & Verification

### Backend Automated Test Suite
The backend includes 40 automated tests covering authentication, bcrypt hashing, token validation, CSRF defense, production security guards, contact message rate limiting, honeypot defense, schema constraints, and project CRUD operations:

```powershell
cd backend
.\venv\Scripts\python -m pytest -v
```

**Results**:
- `test_auth.py`: 11 passed (login, signed httpOnly cookie, 401 on bad password, inactive user check, logout, bcrypt verification, CSRF Origin protection, production secret guard)
- `test_contact.py`: 8 passed (message creation, validation, honeypot spam drop, sliding-window 429 rate limiting, unauthenticated 401 protection, admin message retrieval)
- `test_health.py`: 2 passed (health check and root endpoint)
- `test_projects.py`: 19 passed (models, unique slug constraint, validation, filtering, pagination, admin CRUD, 401 unauthenticated protection)

### Frontend Production Build Verification
```powershell
cd frontend
npm run build
```
Compiles cleanly with zero JSX/JavaScript errors or lint warnings.

---

## ☁️ Deployment Readiness

- **Backend**: ASGI-ready via Uvicorn. Automatically normalizes PostgreSQL connection URIs (`postgres://` to `postgresql://`) for seamless deployment on platforms like Render or AWS.
- **Frontend**: Standard Vite static output (`dist/`), compatible with CDN static hosting (Render Static Site, Cloudflare Pages, Netlify).
- **Environment Parity**: Zero hardcoded secrets; strict separation between development and production configurations.

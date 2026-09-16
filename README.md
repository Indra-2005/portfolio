# Devendra Bhoi — Portfolio

A decoupled, dynamic personal portfolio and Content Management System (CMS) engineered with **React**, **FastAPI**, **PostgreSQL**, and **SQLAlchemy 2.x**. This application combines a responsive, accessible public showcase for projects, skills, and contact inquiries with an authenticated, database-driven administrative dashboard for content management.

---

## Live Demo

Deployment is currently pending. Live demonstration URLs will be documented here once cloud infrastructure provisioning and domain configuration are completed.

---

## Features

Only fully implemented and verified features are listed:

- **Dynamic Project Showcase**: Browse published projects with category filtering, featured highlighting, and server-side pagination.
- **Project Detail Pages**: Dedicated, SEO-friendly pages for individual projects using unique URL slugs.
- **Administrative CMS Console**: Authenticated dashboard to create, view, edit, publish/unpublish, reorder, and delete projects.
- **Visitor Contact System**: Public contact inquiry form with strict input validation, client IP rate limiting, and hidden honeypot spam protection.
- **Message Management**: Inquiries stored securely in PostgreSQL with administrative views to list messages and mark them as read.
- **Secure Admin Authentication**: Native bcrypt password hashing and cryptographically signed JWT sessions delivered via `httpOnly` cookies.
- **CSRF Defense**: Custom request header validation (`X-Requested-With` / `X-CSRF-Token`) combined with Origin/Referer verification on state-changing administrative requests.
- **Brute-Force Protection**: In-memory sliding-window limiter on login attempts by identifier and client IP to mitigate credential stuffing.
- **Automated Input Validation**: Pydantic v2 schemas enforcing string boundaries, valid email formats, and URL formats while rejecting extraneous payload fields (`extra="forbid"`).
- **Responsive Interface**: Clean, accessible UI built with Tailwind CSS, supporting mobile, tablet, and desktop viewports with accessible focus indicators.
- **Search Engine Optimization**: Route-level dynamic `<title>` and `<meta name="description">` management via custom React component, plus configured `robots.txt` and `sitemap.xml`.
- **Interactive API Documentation**: Automated OpenAPI documentation via Swagger UI (`/api/v1/docs`) and ReDoc (`/api/v1/redoc`).

---

## Architecture

The project follows a decoupled client-server architecture with strict separation between user interface, business logic, data persistence, and administrative controls:

```
┌─────────────────────────────────────────────────────────────┐
│                    React SPA (Frontend)                     │
│  Vite • JavaScript (ES6+ / JSX) • Tailwind CSS • Router v6  │
│          Zero token storage in localStorage/session         │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST
                               │ Credentials: 'include' (Cookies)
                               │ Header: 'X-Requested-With'
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI REST API (/api/v1)                 │
│         Pydantic v2 Validation • Defensive Middleware       │
│     JWT Cookie Verification • In-Memory Rate Limiters       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Dependency Injection (get_db, auth)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        Service Layer                        │
│       AuthService • ProjectService • ContactService         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Repository Layer                       │
│     UserRepository • ProjectRepository • ContactRepository  │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy 2.0 ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Relational Database               │
│               Schema Managed by Alembic Migrations          │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

- **Frontend (`frontend/src/`)**: Single-page application consuming the REST API with credentialed requests, handling user interaction, client-side routing, and responsive rendering.
- **API Endpoints (`backend/app/api/v1/endpoints/`)**: Routes HTTP requests, parses query parameters, delegates to services via dependency injection, and returns status codes without direct database queries.
- **Dependencies & Security (`backend/app/api/deps.py`, `backend/app/core/security.py`)**: Resolves database sessions, extracts and validates JWTs from cookies, enforces admin role checks, and validates CSRF headers.
- **Rate Limiting (`backend/app/core/rate_limiter.py`)**: Thread-safe in-memory sliding-window limiters providing both public contact submission rate limiting and failed-login brute-force protection.
- **Service Layer (`backend/app/services/`)**: Encapsulates business logic, credential authentication, unique slug generation/validation, and spam honeypot checks.
- **Repository Layer (`backend/app/repositories/`)**: Executes database operations (CRUD, filtering, sorting, pagination) using SQLAlchemy 2.x session queries.
- **Data Models (`backend/app/models/`)**: SQLAlchemy declarative models mapping to PostgreSQL tables (`users`, `projects`, `contact_messages`).

---

## Tech Stack

### Frontend
- **React 18**: Component-based UI library
- **Vite 5**: Fast build tool and development server
- **JavaScript (ES6+) / JSX**: Application logic and views
- **Tailwind CSS 3**: Utility-first responsive design
- **React Router 6**: Client-side declarative routing
- **Lucide React**: Minimal, accessible SVG iconography

### Backend
- **FastAPI 0.110+**: High-performance Python async web framework
- **Python 3.10+**: Backend programming language
- **Pydantic v2**: Request/response data validation and serialization
- **SQLAlchemy 2.0**: Relational database ORM with parameterized queries
- **Alembic 1.13+**: Database schema migration management
- **Uvicorn**: Production ASGI web server

### Database
- **PostgreSQL 16**: Primary relational database
- **psycopg2-binary**: PostgreSQL database adapter for Python

### Security & Cryptography
- **bcrypt**: Password hashing with salt (work factor 12)
- **PyJWT**: Cryptographic JSON Web Token encoding and decoding
- **httpOnly Cookies**: Protected token transport preventing JavaScript access
- **Custom CSRF Header**: Defense-in-depth against cross-site request forgery
- **In-Memory Rate Limiting**: Sliding-window limiters protecting contact form submissions and mitigating login brute-force attacks

### Testing & Code Quality
- **pytest**: Automated unit and integration testing
- **HTTPX**: Synchronous test client for FastAPI
- **SQLite (In-Memory)**: Isolated test database execution

---

## Project Structure

```
portfolio/
├── frontend/
│   ├── public/                    # robots.txt, sitemap.xml, vite.svg
│   ├── src/
│   │   ├── components/            # Reusable UI elements (Buttons, Cards, SEO, States)
│   │   ├── context/               # AuthContext (state via /api/v1/auth/me)
│   │   ├── layouts/               # RootLayout with Navbar and Footer
│   │   ├── pages/                 # Public views (Home, About, Projects, Detail, Contact)
│   │   │   └── admin/             # Admin views (Login, Dashboard, Project Manager)
│   │   ├── services/              # API clients configured with credentials and CSRF
│   │   ├── App.jsx                # Route registry and ProtectedRoute wrapper
│   │   ├── index.css              # Tailwind directives and accessible focus styles
│   │   └── main.jsx               # React DOM mount point
│   ├── package.json               # Frontend dependencies and npm scripts
│   ├── tailwind.config.js         # Design tokens and theme settings
│   └── vite.config.js             # Vite development server configuration
│
├── backend/
│   ├── alembic/                   # Migration environment and version scripts
│   │   └── versions/              # 001_projects, 002_users, 003_contact_messages
│   ├── app/
│   │   ├── api/                   # Router, dependencies, and v1 endpoints
│   │   ├── core/                  # Configuration, database engine, rate limiter, security
│   │   ├── models/                # SQLAlchemy ORM database models
│   │   ├── repositories/          # Data access layer
│   │   ├── schemas/               # Pydantic v2 request/response schemas
│   │   ├── scripts/               # CLI utility scripts (create_admin.py)
│   │   ├── services/              # Business logic layer
│   │   └── main.py                # FastAPI application setup and security middleware
│   ├── tests/                     # 74 automated unit and integration tests
│   │   ├── conftest.py            # SQLite in-memory test database & auth fixtures
│   │   ├── test_auth.py           # Authentication, session cookies, lockout & CSRF tests (19)
│   │   ├── test_contact.py        # Contact submission & rate limiting tests (8)
│   │   ├── test_health.py         # Service health & root endpoint tests (2)
│   │   ├── test_projects.py       # Project schema, CRUD & pagination tests (19)
│   │   └── test_security.py       # Defensive security, bcrypt & headers tests (26)
│   ├── alembic.ini                # Alembic configuration
│   ├── requirements.txt           # Pinned backend Python dependencies
│   └── .env.example               # Sanitized backend environment template
│
├── docker-compose.yml             # Local PostgreSQL 16 service definition
├── .gitignore                     # Source control exclusions (secrets, artifacts, builds)
└── README.md                      # Project documentation
```

---

## Database / Migrations

The application uses **PostgreSQL** as its primary datastore. Database schema changes are tracked and executed using **Alembic**.

### Migration Scripts

Migrations are sequentially chained and located in `backend/alembic/versions/`:
1. `001_create_projects` — Creates the `projects` table with indexes on `slug`, `category`, `is_published`, `is_featured`, and `order_index`.
2. `002_create_users` — Creates the `users` table for administrative accounts.
3. `003_create_contact_messages` — Creates the `contact_messages` table for visitor submissions.

### Running Migrations

From the `backend` directory with the virtual environment activated:

```bash
alembic upgrade head
```

---

## Local Development Setup

### Prerequisites

- **Python**: 3.10 or newer
- **Node.js**: 18 or newer (with npm)
- **Database**: PostgreSQL 14+ or Docker

---

### 1. Database Setup

#### Option A: Docker Compose (Recommended)
From the repository root:
```bash
docker compose up -d
```
This launches a PostgreSQL 16 container on port `5432` with credentials defined in `docker-compose.yml`.

#### Option B: Local PostgreSQL Installation
Create a local database named `portfolio_db`:
```sql
CREATE DATABASE portfolio_db;
```

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
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

4. **Configure environment variables**:
   - Windows:
     ```powershell
     copy .env.example .env
     ```
   - macOS / Linux:
     ```bash
     cp .env.example .env
     ```
   Verify that `DATABASE_URL` matches your local PostgreSQL connection string.

5. **Apply database migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Create an initial administrator account**:
   ```bash
   python -m app.scripts.create_admin
   ```
   Follow the interactive prompt to set a username, email, and secure password.

7. **Start the FastAPI backend server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

### 3. Frontend Setup

1. **Navigate to the frontend directory** (in a new terminal):
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

---

### 4. Verified Local URLs

| Service / View | URL |
| :--- | :--- |
| **Public Portfolio** | [http://localhost:5173](http://localhost:5173) |
| **Admin Login** | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) |
| **Admin CMS Console** | [http://localhost:5173/admin/projects](http://localhost:5173/admin/projects) |
| **Backend API Root** | [http://localhost:8000/](http://localhost:8000/) |
| **API Health Check** | [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) |
| **Interactive Swagger UI** | [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs) |
| **ReDoc Specification** | [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc) |

---

## API

The REST API is versioned under `/api/v1`. Endpoints are organized into distinct functional groups:

| Area | Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/v1/health` | Public | System status and health verification |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticates credentials and sets signed `httpOnly` JWT cookie |
| **Auth** | `POST` | `/api/v1/auth/logout` | Public | Clears authentication cookie session |
| **Auth** | `GET` | `/api/v1/auth/me` | Authenticated | Returns profile of currently authenticated user |
| **Projects** | `GET` | `/api/v1/projects` | Public | List published projects with filters (`category`, `featured`, pagination) |
| **Projects** | `GET` | `/api/v1/projects/{slug}` | Public | Fetch a single published project by unique slug |
| **Admin Projects** | `GET` | `/api/v1/admin/projects` | Admin | List all projects (including drafts and unpublished) |
| **Admin Projects** | `POST` | `/api/v1/admin/projects` | Admin | Create a new project record |
| **Admin Projects** | `GET` | `/api/v1/admin/projects/{id}` | Admin | Retrieve a specific project by primary key ID |
| **Admin Projects** | `PATCH` | `/api/v1/admin/projects/{id}` | Admin | Partially update an existing project |
| **Admin Projects** | `DELETE` | `/api/v1/admin/projects/{id}` | Admin | Delete a project record |
| **Contact** | `POST` | `/api/v1/contact` | Public | Submit visitor inquiry (rate limited, honeypot protected) |
| **Admin Messages** | `GET` | `/api/v1/admin/messages` | Admin | List submitted contact inquiries with pagination |
| **Admin Messages** | `PATCH` | `/api/v1/admin/messages/{id}/read` | Admin | Mark a contact message as read |

---

## Testing

The codebase includes an automated test suite, syntax compilation validation, and production build checks.

### Backend Test Suite
The backend is tested using `pytest` against an in-memory SQLite database, isolating tests from external network or database dependencies:

```powershell
cd backend
.\venv\Scripts\pytest
```

**Verified Test Results (74 passed)**:
- `test_auth.py`: 19
- `test_contact.py`: 8
- `test_health.py`: 2
- `test_projects.py`: 19
- `test_security.py`: 26
- **Total**: 74

Coverage breakdown:
- `tests/test_auth.py` (19 tests): Login flows, signed `httpOnly` cookie issuance, credential validation, brute-force lockout, inactive user rejection, logout, and CSRF origin verification.
- `tests/test_contact.py` (8 tests): Message persistence, payload validation, honeypot spam drops, sliding-window rate limiting, and authenticated admin access.
- `tests/test_health.py` (2 tests): Service health status and root metadata endpoints.
- `tests/test_projects.py` (19 tests): Schema validation, unique slug constraints, public filtering, pagination boundaries, and administrative CRUD operations.
- `tests/test_security.py` (26 tests): Bcrypt work factor verification, token lifecycle, CSRF header checks, production settings validators, defensive HTTP headers, and error masking.

### Backend Python Compilation
Verify that all Python modules compile cleanly without syntax errors:

```powershell
cd backend
.\venv\Scripts\python -m compileall app
```

### Frontend Production Build
Verify that the React frontend bundles cleanly without missing imports or JSX syntax errors:

```powershell
cd frontend
npm run build
```

---

## Security

The application implements defense-in-depth controls across authentication, transport, data access, and input handling:

- **Bcrypt Password Hashing**: Passwords are salted and hashed with `bcrypt` (work factor 12). Plaintext passwords and hash strings are excluded from API serialization models.
- **Signed JWT in HttpOnly Cookies**: Session tokens are cryptographically signed (HS256) and transmitted exclusively via `httpOnly`, `SameSite=Lax` cookies (`Secure=True` enforced over HTTPS in production). Browser `localStorage` and `sessionStorage` are not used for token storage.
- **CSRF Defense**: State-changing administrative endpoints require trusted Origin/Referer verification and a custom request header (`X-Requested-With` or `X-CSRF-Token`).
- **Login Brute-Force Limiter**: A thread-safe, in-memory sliding-window limiter restricts failed login attempts to 5 per 10 minutes per `(identifier, client_ip)` key.
- **Contact Rate Limiting & Honeypot**: Public submissions are rate-limited to 5 requests per 10 minutes per client IP. Automated spam bots submitting values in a hidden honeypot field are discarded.
- **SQL Injection Prevention**: Database operations use SQLAlchemy 2.x ORM models with parameterized queries.
- **Input Validation**: Pydantic v2 schemas enforce type constraints, string length limits, and email formats while forbidding unexpected payload fields (`extra="forbid"`).
- **Defensive HTTP Response Headers**: All responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and scoped `Content-Security-Policy`.
- **Production Information Masking**: In production mode (`ENVIRONMENT="production"`), unhandled server exceptions return generic 500 error messages, preventing filesystem paths or stack traces from reaching clients.
- **Secret Hygiene**: Real environment secrets are excluded from source control via `.gitignore`. The application verifies at startup that default development keys are not used in production.

### Operational Limitations
- **In-Memory Rate Limiting**: The sliding-window rate limiters operate in local process memory. In a multi-worker or multi-instance deployment, rate-limiting state applies per instance rather than globally. A distributed store (such as Redis) is required for global state sharing across multiple instances.
- **Client IP Attribution**: Client IP resolution defaults to `request.client.host`. When deployed behind reverse proxies (such as Nginx, Cloudflare, or platform load balancers), trusted proxy headers must be configured via Uvicorn (`--proxy-headers`) or ASGI middleware to ensure accurate client IP identification.
- **Scope**: These security controls mitigate common web vulnerabilities (OWASP Top 10) for this project's architecture, but do not claim absolute immunity against all potential attack vectors.

---

## SEO

Search engine optimization controls are implemented at both the build and runtime layers:

- **Dynamic Document Titles & Descriptions**: The `SEO` component updates `document.title` and `meta[name="description"]` dynamically across route transitions.
- **Semantic Structure**: Public pages use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) with structured heading hierarchies.
- **Crawler Directives (`robots.txt`)**: Located at `frontend/public/robots.txt`, explicitly permitting public pages and disallowing administrative routes (`/admin`, `/admin/*`).
- **Sitemap (`sitemap.xml`)**: Located at `frontend/public/sitemap.xml`, indexing primary public routes (`/`, `/about`, `/projects`, `/contact`) with crawl priorities and update frequencies.

---

## Roadmap

Planned future enhancements (not currently implemented):

- **Cloud Object Storage**: Direct file and image uploads to an object storage provider (e.g., AWS S3 or Cloudinary) for project screenshots.
- **Centralized Rate Limiting**: Redis-backed distributed rate limiter to support multi-instance horizontal scaling.
- **Email Notifications**: Transactional email dispatch (e.g., via Resend or SendGrid) upon visitor contact form submission.
- **CI/CD Automation**: GitHub Actions workflow to run backend pytest, python compileall, and frontend build on every pull request.
- **Rich Text / Markdown Editor**: Enhanced administrative interface for formatted project case studies.

---

## License

Licensing is not currently specified. All rights reserved by the author.

---

## Author

**Devendra Bhoi**
- Computer Engineering graduate, SSBT COET (Class of 2026)
- Focus: Machine Learning, Artificial Intelligence, Python, SQL, REST API Engineering
- GitHub: [https://github.com/Indra-2005](https://github.com/Indra-2005)

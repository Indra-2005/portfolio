# Engineering Portfolio (Dynamic & Database-Driven)

A professional, production-oriented personal portfolio web application built with a decoupled modern stack. Designed specifically for interview explainability, clean architectural layering, and dynamic database-driven management without code modifications.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React SPA (Frontend)                     │
│      React 18 • Vite • JavaScript (ES6+) • Tailwind CSS      │
│                      React Router                           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Backend (/api/v1)                   │
│                Pydantic Settings & Schemas                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Service Layer                         │
│             Business Logic & Orchestration                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Repository Layer                        │
│            Data Access & Queries (SQLAlchemy)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy 2.x ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               PostgreSQL Relational Database                │
│            Alembic Schema Versioning & Migrations           │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Layer Responsibilities

| Layer | Directory | Responsibility |
| :--- | :--- | :--- |
| **API Endpoints** | `backend/app/api/v1/` | Handles HTTP requests, HTTP status codes, and input/output serialization. **Contains no direct DB queries.** |
| **Schemas** | `backend/app/schemas/` | Pydantic models for strict request validation and response serialization. |
| **Service Layer** | `backend/app/services/` | Encapsulates business logic, data manipulation, and domain rules. |
| **Repository Layer** | `backend/app/repositories/` | Manages database operations (CRUD, filtering, ordering) via SQLAlchemy sessions. |
| **Database Models** | `backend/app/models/` | SQLAlchemy 2.x declarative models representing database tables. |
| **Core & Config** | `backend/app/core/` | Type-safe settings via `pydantic-settings`, database engine, and CORS middleware. |

---

## 📁 Repository Structure

```
portfolio/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI elements
│   │   ├── pages/            # Page components in JSX (Home, About, Projects, Contact, Admin)
│   │   ├── layouts/          # Shell layouts with navigation & live backend health status
│   │   ├── services/         # API client & HTTP services (checkBackendHealth)
│   │   ├── assets/           # Static media and graphics
│   │   ├── App.jsx           # React Router route registry
│   │   ├── main.jsx          # Application entry point
│   │   └── index.css         # Tailwind CSS directives and base typography
│   ├── public/               # Static assets served as-is (vite.svg, favicon)
│   ├── package.json          # Frontend scripts and dependencies
│   ├── vite.config.js        # Vite build tool configuration (JavaScript)
│   ├── tailwind.config.js    # Tailwind theme & design tokens
│   ├── postcss.config.js     # PostCSS configuration
│   └── .env.example          # Frontend environment template
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── health.py             # Health check endpoint (/api/v1/health)
│   │   │       │   └── projects.py           # Project public & admin endpoints
│   │   │       └── router.py                 # v1 route aggregator
│   │   ├── core/
│   │   │   ├── config.py                     # Pydantic BaseSettings loading from environment
│   │   │   └── database.py                   # SQLAlchemy 2.x engine, session, and DeclarativeBase
│   │   ├── models/
│   │   │   └── project.py                    # SQLAlchemy 2.x Project model
│   │   ├── schemas/
│   │   │   ├── health.py                     # Health check response schema
│   │   │   ├── pagination.py                 # Generic pagination response schema
│   │   │   └── project.py                    # Project validation & response DTOs
│   │   ├── services/
│   │   │   └── project_service.py            # Project business rules & orchestration
│   │   ├── repositories/
│   │   │   └── project_repository.py         # Project database access layer
│   │   └── main.py                           # FastAPI factory & CORS middleware configuration
│   ├── alembic/
│   │   ├── env.py                            # Migration environment pulling settings.DATABASE_URL
│   │   ├── script.py.mako                    # Migration file template
│   │   └── versions/
│   │       └── 001_create_projects_table.py  # Projects table creation migration
│   ├── tests/
│   │   ├── conftest.py                       # In-memory test DB fixtures
│   │   ├── test_health.py                    # Health endpoint tests
│   │   └── test_projects.py                  # Project model, schema, & API tests
│   ├── requirements.txt                      # Pinned backend dependencies
│   ├── alembic.ini                           # Alembic CLI configuration
│   └── .env.example                          # Backend environment variable template
│
├── README.md                                 # Documentation & setup guide
├── .gitignore                                # Source control exclusion rules
└── docker-compose.yml                        # Local PostgreSQL 16 container definition
```

---

## 📦 Phase 2: Project Management & Persistence API

### Database Model (`projects` table)
- **Primary Key**: `id` (Integer, autoincrement)
- **Unique & Indexed**: `slug` (String, URL-friendly)
- **Required**: `title` (String), `short_description` (String), `description` (Text), `technologies` (JSON array)
- **Optional Attributes**: `category`, `github_url`, `live_demo_url`, `image_url`, `start_date`, `completion_date`, `key_features` (JSON array), `challenges` (JSON array)
- **Ordering & Visibility Controls**: `featured` (Boolean, indexed), `published` (Boolean, indexed), `display_order` (Integer, indexed, default 0)
- **Timestamps**: `created_at` (DateTime timezone-aware), `updated_at` (DateTime timezone-aware)

### REST API Endpoints

#### Public Endpoints (Exclusively for Published Projects)
- `GET /api/v1/projects`: List published projects with pagination (`page`, `page_size`) and filters (`featured`, `category`). Ordered by `display_order ASC`, then `created_at DESC`.
- `GET /api/v1/projects/{slug}`: Retrieve a single published project by slug. Returns `404` if not found or unpublished.

#### Admin Endpoints (Content Management)
> [!NOTE]
> **Authentication Notice**: In Phase 2, admin endpoints are intentionally unauthenticated to enable rapid local development and automated testing. Secure authentication (JWT / OAuth2) will be introduced in **Phase 3** before production deployment.
- `POST /api/v1/admin/projects`: Create a new project (HTTP 201).
- `GET /api/v1/admin/projects`: List all projects (both published and drafts) with pagination and filters.
- `GET /api/v1/admin/projects/{id}`: Fetch project details by ID.
- `PATCH /api/v1/admin/projects/{id}`: Partial update project fields.
- `DELETE /api/v1/admin/projects/{id}`: Permanently delete a project (HTTP 204).

#### Pagination Response Structure
```json
{
  "items": [...],
  "page": 1,
  "page_size": 10,
  "total": 25,
  "total_pages": 3
}
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Python**: 3.10 or newer
- **Node.js**: 18.0 or newer (v20+ recommended) & npm
- **Database**: PostgreSQL 14+ (or Docker to run the included `docker-compose.yml`)

---

### 1. Database Setup

#### Option A: Using Docker Compose (Recommended)
If Docker is installed on your system, launch a local PostgreSQL 16 instance with:

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` with a persistent volume `postgres_data`.

#### Option B: Standalone or Cloud PostgreSQL
If using local PostgreSQL or a hosted database (e.g. Render, Supabase, Neon):
1. Ensure the PostgreSQL service is running.
2. Create a database named `portfolio_db`:
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
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Copy `.env.example` to `.env`:
   - **Windows (PowerShell)**:
     ```powershell
     Copy-Item .env.example .env
     ```
   - **macOS / Linux**:
     ```bash
     cp .env.example .env
     ```
   Update `DATABASE_URL` in `.env` if your local database credentials differ from the defaults.

5. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

7. **Verify backend**:
   - Health Endpoint: `http://localhost:8000/api/v1/health` (Returns `{"status": "ok"}`)
   - Interactive Swagger Docs: `http://localhost:8000/api/v1/docs`

---

### 3. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**:
   ```bash
   cp .env.example .env
   ```
   *(If omitted, Vite defaults to `http://localhost:8000/api/v1`)*

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

### Run Backend Unit Tests
Execute the test suite using pytest inside the backend virtual environment:
```powershell
cd backend
python -m pytest
```

### Build Frontend for Production
Compile the optimized static bundle with Vite:
```powershell
cd frontend
npm run build
```

---

## 🔒 Security Best Practices

1. **Zero Secrets in Source Control**: `.env` and private configuration files are strictly ignored by `.gitignore`. Only `.env.example` templates with non-sensitive defaults are committed.
2. **Strict CORS Policy**: Cross-Origin Resource Sharing is controlled via environment variables (`BACKEND_CORS_ORIGINS`) to ensure only authorized frontend origins can query the API.
3. **Prepared Statements & SQL Injection Prevention**: All queries pass through SQLAlchemy 2.x parameter binding. No raw string interpolation is used.
4. **No Client-Side Authentication Shortcuts**: No mock credentials or insecure `localStorage` authentication bypasses exist.

---

## ☁️ Deployment Readiness (Render / Cloud)

- **Backend**: Configured for ASGI hosting (e.g. Uvicorn on Render Web Service). Database connection string automatically normalizes `postgres://` to `postgresql://` to ensure seamless compatibility with Render PostgreSQL instances.
- **Frontend**: Standard Vite build outputs to `frontend/dist`, ready for static site hosting (Render Static Site, Cloudflare Pages, or Vercel).

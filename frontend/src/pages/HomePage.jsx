import { Link } from 'react-router-dom';
import { Server, Database, Layout, ShieldCheck, ArrowRight } from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-10 py-6">
      {/* Hero Badge & Heading */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
          <span>Phase 1 Verification</span>
          <span>•</span>
          <span>Foundation Ready</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Computer Engineering <span className="text-indigo-400">Portfolio</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          A production-oriented personal portfolio powered by a clean, decoupled architecture.
          Designed to be database-driven, interview-ready, and effortlessly explainable.
        </p>
      </div>

      {/* Architectural Pillars Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Layout className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">React + Vite (JavaScript)</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Fast, lightweight SPA built with React 18, JavaScript (ES6+), Tailwind CSS, and React Router.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">FastAPI REST Backend</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Multi-layered Python API with strict separation between routes, services, repositories, and schemas.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">PostgreSQL + SQLAlchemy 2.x</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Database layer with SQLAlchemy DeclarativeBase and Alembic migration versioning.
          </p>
        </div>
      </div>

      {/* Routes Confirmation Box */}
      <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400 text-sm font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Phase 1 Route Confirmation</span>
        </div>
        <p className="text-sm text-slate-400">
          Click through each route to confirm client-side routing is operating properly:
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/about"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            <span>Visit /about</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            <span>Visit /projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            <span>Visit /contact</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-sm font-medium transition-colors"
          >
            <span>Visit /admin (Placeholder)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

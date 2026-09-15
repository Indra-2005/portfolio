import { User, Code2, GraduationCap } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
          <User className="w-3.5 h-3.5" />
          <span>Route: /about</span>
        </div>
        <h1 className="text-3xl font-bold text-white">About Me</h1>
        <p className="text-slate-400">
          Computer Engineering graduate with a strong focus on backend systems, Python, FastAPI, and data-driven web architectures.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <GraduationCap className="w-4 h-4" />
            <h3 className="font-semibold text-white">Background</h3>
          </div>
          <p className="text-sm text-slate-400">
            B.E./B.Tech in Computer Engineering with solid fundamentals in computer science, system design, and algorithms.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Code2 className="w-4 h-4" />
            <h3 className="font-semibold text-white">Core Competencies</h3>
          </div>
          <p className="text-sm text-slate-400">
            Python, FastAPI, Flask, PostgreSQL, SQLAlchemy, Git/GitHub, Docker, and REST API development.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-500 font-mono">
        Status: Placeholder route successfully mounted. Full biography and timeline will be configured in subsequent phases.
      </div>
    </div>
  );
}

import { FolderGit2, Database } from 'lucide-react';

export function ProjectsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Route: /projects</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <p className="text-slate-400">
          This portfolio is strictly database-driven. All projects, categories, order rankings, and feature flags will be queried dynamically from PostgreSQL.
        </p>
      </div>

      <div className="p-8 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center mx-auto">
          <Database className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-200">Dynamic Project Feed (Phase 2)</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Zero hardcoded project mockups. Projects will be populated via the FastAPI REST API after the Project model, repository, and CRUD endpoints are implemented in Phase 2.
          </p>
        </div>
        <div className="inline-block text-xs font-mono px-3 py-1 rounded bg-slate-800 text-slate-400">
          Route verification status: OK
        </div>
      </div>
    </div>
  );
}

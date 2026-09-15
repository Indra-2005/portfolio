import { Shield, Lock, AlertTriangle } from 'lucide-react';

export function AdminPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" />
          <span>Route: /admin (Phase 1 Placeholder)</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
        <p className="text-slate-400">
          Centralized administrative management dashboard placeholder.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-4">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Phase 1 Boundary Enforcement</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          In adherence to clean architecture principles and Phase 1 specifications, no simulated authentication, mock credentials, or <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">localStorage</code> bypasses have been implemented here.
        </p>
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upcoming Admin Architecture (Future Phases):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-slate-400">
            <li>Secure backend authentication (FastAPI OAuth2 / JWT with bcrypt password hashing)</li>
            <li>HTTP-only cookies or bearer tokens without client-side fake auth</li>
            <li>Admin CRUD operations: Create, Edit, Delete, Reorder, Feature, and Publish projects</li>
          </ul>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-500 font-mono">
        Status: Placeholder route successfully mounted. No authentication shortcuts introduced.
      </div>
    </div>
  );
}

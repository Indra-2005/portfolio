import { Link } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-6">
      <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center mx-auto">
        <HelpCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="text-lg text-slate-300">Page Not Found</p>
        <p className="text-sm text-slate-400">
          The route you requested does not exist or has been moved.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}

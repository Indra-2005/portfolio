import { Link } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-6">
      <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
        <HelpCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="text-lg text-slate-700 font-medium">Page Not Found</p>
        <p className="text-sm text-slate-500">
          The route you requested does not exist or has been moved.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-xs"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}

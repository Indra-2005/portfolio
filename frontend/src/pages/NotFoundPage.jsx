import { Link } from 'react-router-dom';
import { Home, FolderGit2, HelpCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Button } from '../components/Button';

export function NotFoundPage() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The requested page could not be located on Devendra Bhoi's portfolio."
        noindex={true}
      />

      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            404
          </h1>
          <p className="text-lg text-slate-800 dark:text-slate-200 font-semibold">
            Page Not Found
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The route you requested does not exist or may have been relocated. You can navigate back to the home page or explore published engineering projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            to="/"
            variant="primary"
            size="md"
            icon={Home}
          >
            Return Home
          </Button>
          <Button
            to="/projects"
            variant="secondary"
            size="md"
            icon={FolderGit2}
          >
            View Projects
          </Button>
        </div>
      </div>
    </>
  );
}

export default NotFoundPage;

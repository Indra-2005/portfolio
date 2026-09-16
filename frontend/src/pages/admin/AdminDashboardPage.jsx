import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { contactApi, projectsApi } from '../../services/api';
import { SEO } from '../../components/SEO';
import {
  Shield,
  FolderGit2,
  CheckCircle2,
  EyeOff,
  Star,
  PlusCircle,
  ExternalLink,
  LogOut,
  Server,
  RefreshCw,
  Mail,
  Inbox,
} from 'lucide-react';

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projectsRes, messagesRes] = await Promise.all([
        projectsApi.getAdminProjects({ page_size: 100 }),
        contactApi.getAdminMessages({ page_size: 100 }).catch(() => ({ total: 0 })),
      ]);

      const items = projectsRes.items || [];
      setStats({
        total: projectsRes.total || items.length,
        published: items.filter((p) => p.published).length,
        drafts: items.filter((p) => !p.published).length,
        featured: items.filter((p) => p.featured).length,
        messages: messagesRes.total || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load project metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <>
      <SEO
        title="Admin Dashboard"
        description="Administrator metrics and management console for Devendra Bhoi's portfolio."
        noindex={true}
      />

      <div className="max-w-6xl mx-auto space-y-8 py-4">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-xs font-mono uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Management Console</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Welcome back, <span className="font-semibold text-slate-900 dark:text-white">{user?.username}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchStats}
              title="Refresh statistics"
              aria-label="Refresh statistics"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-sm">
            {error}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Projects */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Total Projects</span>
              <FolderGit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              {loading ? '—' : stats.total}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">PostgreSQL database</p>
          </div>

          {/* Published Projects */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Published</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {loading ? '—' : stats.published}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Live on public portfolio</p>
          </div>

          {/* Draft Projects */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Drafts</span>
              <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {loading ? '—' : stats.drafts}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Hidden from public</p>
          </div>

          {/* Featured Projects */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Featured</span>
              <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {loading ? '—' : stats.featured}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Home page showcase</p>
          </div>

          {/* Clickable Inquiries Metric Card */}
          <Link
            to="/admin/messages"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-md space-y-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 block"
            title="View Inquiries & Messages"
            aria-label={`Inquiries: ${loading ? 'Loading' : stats.messages} messages. Click to manage.`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Inquiries</span>
              <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white font-mono group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {loading ? '—' : stats.messages}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              Click to view messages &rarr;
            </p>
          </Link>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Manage Projects CTA */}
          <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Project CMS</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Create new projects, edit descriptions, adjust display order ranking, upload image URLs, or toggle published and featured states dynamically.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/admin/projects"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
              >
                <span>Manage Projects Table</span>
              </Link>
              <Link
                to="/admin/projects?create=true"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Create New Project</span>
              </Link>
            </div>
          </div>

          {/* Manage Messages CTA */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <Inbox className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Contact Inquiries</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Review visitor messages submitted through the contact form, inspect full inquiry details, and mark inquiries as read.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/admin/messages"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Open Messages Inbox</span>
              </Link>
              <Link
                to="/projects"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-mono font-medium"
              >
                <span>Preview Public Portfolio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboardPage;

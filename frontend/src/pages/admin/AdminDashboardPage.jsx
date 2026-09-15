import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { contactApi, projectsApi } from '../../services/api';
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
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-blue-600 text-xs font-mono uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Management Console</h1>
          <p className="text-sm text-slate-600">
            Welcome back, <span className="font-semibold text-slate-900">{user?.username}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-medium transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            {loading ? '—' : stats.total}
          </div>
          <p className="text-xs text-slate-400">PostgreSQL database</p>
        </div>

        {/* Published Projects */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-600 font-mono">
            {loading ? '—' : stats.published}
          </div>
          <p className="text-xs text-slate-400">Live on public portfolio</p>
        </div>

        {/* Draft Projects */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider">Drafts</span>
            <EyeOff className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-600 font-mono">
            {loading ? '—' : stats.drafts}
          </div>
          <p className="text-xs text-slate-400">Hidden from public</p>
        </div>

        {/* Featured Projects */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider">Featured</span>
            <Star className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600 font-mono">
            {loading ? '—' : stats.featured}
          </div>
          <p className="text-xs text-slate-400">Home page showcase</p>
        </div>

        {/* Inquiries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider">Inquiries</span>
            <Mail className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-bold text-slate-800 font-mono">
            {loading ? '—' : stats.messages}
          </div>
          <p className="text-xs text-slate-400">Contact form messages</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Manage Projects CTA */}
        <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <FolderGit2 className="w-5 h-5 text-blue-600" />
              <span>Project CMS</span>
            </h3>
            <p className="text-sm text-slate-600">
              Create new projects, edit descriptions, adjust display order ranking, upload image URLs, or toggle published and featured states dynamically.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/admin/projects"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-all"
            >
              <span>Manage Projects Table</span>
            </Link>
            <Link
              to="/admin/projects?create=true"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium border border-slate-300 shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Create New Project</span>
            </Link>
          </div>
        </div>

        {/* Public Preview & Architecture Info */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>Security &amp; Persistence Layer</span>
            </h3>
            <p className="text-sm text-slate-600">
              All state changes are verified via FastAPI dependency injection with signed JWT in an httpOnly cookie and CSRF Origin protection.
            </p>
          </div>
          <div className="pt-2 flex items-center space-x-4">
            <Link
              to="/projects"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-mono font-medium"
            >
              <span>Open Public Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { checkBackendHealth, API_BASE_URL } from '../services/api';
import { Activity, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export function RootLayout() {
  const [backendStatus, setBackendStatus] = useState({
    checked: false,
    connected: false,
    error: undefined,
  });

  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      const result = await checkBackendHealth();
      if (isMounted) {
        setBackendStatus({
          checked: true,
          connected: result.connected,
          error: result.error,
        });
      }
    };

    verifyBackend();
    const intervalId = setInterval(verifyBackend, 15000); // Check every 15s

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/projects', label: 'Projects' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <NavLink to="/" className="flex items-center space-x-2 text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
              <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-mono text-sm text-white shadow-lg shadow-indigo-600/30">
                CE
              </span>
              <span>DevPortfolio</span>
            </NavLink>
            <span className="hidden sm:inline-block text-xs uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Phase 1 (JS)
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <span className="text-slate-700 px-1">|</span>

            {/* Admin Link */}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
                }`
              }
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer & Live Backend Diagnostic Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <span>Backend API Status:</span>
              {!backendStatus.checked ? (
                <span className="inline-flex items-center text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse mr-1.5"></span>
                  Checking {API_BASE_URL}...
                </span>
              ) : backendStatus.connected ? (
                <span className="inline-flex items-center text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Connected ({API_BASE_URL}/health)
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-400 font-medium" title={backendStatus.error}>
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Disconnected ({API_BASE_URL})
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
              <span>React 18</span>
              <span>•</span>
              <span>JavaScript (ES6+)</span>
              <span>•</span>
              <span>FastAPI</span>
              <span>•</span>
              <span>PostgreSQL</span>
              <span>•</span>
              <span>SQLAlchemy 2.x</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkBackendHealth } from '../services/api';
import { Github, Linkedin, Activity, CheckCircle2, XCircle } from 'lucide-react';

export function Footer() {
  const [backendStatus, setBackendStatus] = useState({
    checked: false,
    connected: false,
  });

  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      const result = await checkBackendHealth();
      if (isMounted) {
        setBackendStatus({
          checked: true,
          connected: result.connected,
        });
      }
    };

    verifyBackend();
    const intervalId = setInterval(verifyBackend, 20000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 mt-auto transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center font-mono text-[10px] font-bold text-white">
                DB
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Devendra Bhoi
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Computer Engineering graduate from SSBT COET (2026) focused on Machine Learning, AI fundamentals, and data-driven systems.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Social Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white font-semibold">
              Connect
            </h4>
            <div className="flex flex-col space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <a
                href="https://github.com/Indra-2005"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="inline-flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Profile</span>
              </a>
              <a
                href="https://www.linkedin.com/in/devendra-bhoi-21a720243"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="inline-flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn Profile</span>
              </a>
              <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Contact Form
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, API status, and subtle admin portal link */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <span>&copy; {new Date().getFullYear()} Devendra Bhoi. All rights reserved.</span>
            <span>•</span>
            <Link
              to="/admin"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Portfolio Administration"
            >
              Portal
            </Link>
          </div>

          {/* Diagnostic status */}
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>API Status:</span>
            {!backendStatus.checked ? (
              <span className="text-slate-500">Checking...</span>
            ) : backendStatus.connected ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center font-semibold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Online
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center font-semibold">
                <XCircle className="w-3 h-3 mr-1" />
                Offline
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

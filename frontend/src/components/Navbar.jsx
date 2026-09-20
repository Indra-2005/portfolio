import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Linkedin, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Close mobile menu on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <NavLink
          to="/"
          className="flex items-center space-x-2.5 text-base font-bold tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
        >
          <span className="h-7 w-7 rounded-md bg-slate-900 dark:bg-white flex items-center justify-center font-mono text-[10px] font-bold text-white dark:text-slate-900">
            DB
          </span>
          <span className="font-bold tracking-tight">Devendra Bhoi</span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {PUBLIC_NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors cursor-pointer"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <a
            href="https://www.linkedin.com/in/devendra-bhoi-21a720243"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors cursor-pointer"
            title="LinkedIn Profile"
          >
            <Linkedin className="w-4 h-4" />
          </a>

          <NavLink
            to="/contact"
            className="ml-1 px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Contact
          </NavLink>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center space-x-1 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-5 space-y-3"
          aria-label="Mobile Navigation"
        >
          <nav className="flex flex-col space-y-1">
            {PUBLIC_NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'text-slate-900 dark:text-white font-semibold bg-slate-50 dark:bg-slate-900'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="pt-2 flex items-center space-x-3 px-3">
            <a
              href="https://github.com/Indra-2005"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/devendra-bhoi-21a720243"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

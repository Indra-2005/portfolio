import { Link } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand & Description */}
          <div className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              Devendra Bhoi
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Computer Engineering Graduate · AI/ML & Software Development
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex items-center flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              About
            </Link>
            <Link to="/projects" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Projects
            </Link>
            <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Contact
            </Link>
          </nav>

          {/* Social */}
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/Indra-2005"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/devendra-bhoi-21a720243"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>&copy; {new Date().getFullYear()} Devendra Bhoi</span>
          <Link
            to="/admin"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Portfolio Administration"
          >
            Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

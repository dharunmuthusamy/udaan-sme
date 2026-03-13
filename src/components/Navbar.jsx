import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const landingLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const isLoggedIn = !loading && !!user;
  const isHomePage = location.pathname === '/';

  const handleNavClick = (e, href) => {
    if (isHomePage && href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileOpen(false);
    }
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('[Navbar] logout failed', err);
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-surface-200/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white text-lg font-black shadow-lg group-hover:shadow-primary-500/20 transition-all">
              U
            </span>
            <span className="text-xl font-black text-surface-900 tracking-tight">
              UDAAN<span className="text-primary-600">-SME</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-2">
            {landingLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA — auth-aware */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center rounded-2xl bg-surface-900 px-6 py-3 text-sm font-black text-white shadow-xl shadow-surface-900/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold text-surface-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold text-surface-600 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center rounded-2xl bg-primary-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-2xl p-2.5 text-surface-700 hover:bg-surface-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-8 pt-4 space-y-2 bg-white border-t border-surface-100 shadow-2xl">
          {landingLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block rounded-2xl px-4 py-4 text-base font-bold text-surface-700 hover:bg-primary-50 hover:text-primary-600 transition-all"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-4 border-t border-surface-100 mt-4 space-y-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl bg-surface-900 py-4 text-center text-sm font-black text-white"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="block w-full rounded-2xl py-4 text-center text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl py-4 text-center text-sm font-bold text-surface-600 hover:bg-surface-50"
                >
                  Login
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl bg-primary-600 py-4 text-center text-sm font-black text-white"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

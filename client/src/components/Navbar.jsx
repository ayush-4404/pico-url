import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Mail, X, ExternalLink, LogOut, LayoutDashboard, BarChart2, Home, User, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const handleSendContact = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setFeedback('');
      setContactOpen(false);
    }, 1800);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-[#0a0a0a]/60 backdrop-blur-md border-b border-white/[0.04]">
        <div className="w-full px-6 sm:px-10 lg:px-16 h-14 flex items-center justify-between">
          {/* Menu button (left) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="nav-pill"
            aria-label="Open menu"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          {/* Minimal center indicator if authenticated */}
          <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300 tracking-wider font-mono uppercase transition-colors">
            pico-url<span className="text-blue-500">.app</span>
          </Link>

          {/* Contact button (right) */}
          <button
            onClick={() => setContactOpen(true)}
            className="nav-pill"
            aria-label="Contact us"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>
        </div>
      </header>

      {/* ── Slide-over / Modal Menu ─────────────────────────── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm clean-card p-6 bg-[#0d0d0d]/95 border-white/10 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs tracking-widest uppercase font-mono text-zinc-400">Navigation</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="mt-4 space-y-1">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Home className="w-4 h-4 text-blue-400" />
                <span>Shorten URL</span>
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                <span>Dashboard</span>
              </Link>
            </nav>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[11px] uppercase tracking-wider text-zinc-500">Signed in as</p>
                    <p className="text-xs font-medium text-zinc-200 truncate mt-0.5">{user?.name} ({user?.email})</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/[0.06] hover:bg-red-500/[0.12] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn-secondary text-xs text-center py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="btn-white text-xs text-center py-2"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Contact Modal ───────────────────────────────────── */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm clean-card p-6 bg-[#0d0d0d]/95 border-white/10 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs uppercase tracking-widest font-mono text-zinc-400">Get in Touch</span>
              </div>
              <button
                onClick={() => setContactOpen(false)}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {contactSent ? (
              <div className="py-8 text-center space-y-2 animate-fade-in">
                <div className="w-8 h-8 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <p className="text-sm font-medium text-white">Message received</p>
                <p className="text-xs text-zinc-500">Thank you for reaching out.</p>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="mt-4 space-y-3">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Have feedback, feature requests, or questions? Send us a quick note.
                </p>
                <textarea
                  required
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Type your message..."
                  className="clean-input text-xs resize-none"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setContactOpen(false)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-white text-xs px-4 py-1.5"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

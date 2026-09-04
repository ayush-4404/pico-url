import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="fixed top-0 inset-x-0 z-50"
      style={{
        background: 'rgba(26,26,46,0.75)',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-white font-semibold text-lg tracking-tight flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent fill-accent" /> pico.url
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">
                Dashboard
              </Link>
              <span className="text-white/10">|</span>
              <span className="text-white/30 text-sm hidden sm:block">{user?.name}</span>
              <button onClick={handleLogout} className="text-sm text-white/50 hover:text-white transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5">
                Login
              </Link>
              <Link to="/register" className="glass-btn text-sm px-4 py-1.5 rounded-lg gap-0">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

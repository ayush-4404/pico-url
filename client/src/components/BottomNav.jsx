import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const pathname = location.pathname;

  const isHome = pathname === '/';
  const isAnalytics = pathname.startsWith('/analytics');
  const isDashboard = pathname === '/dashboard';
  const isAccount = pathname === '/login' || pathname === '/register';

  const handleNav = (targetPath, requiresAuth) => {
    if (requiresAuth && !isAuthenticated) {
      navigate('/login');
    } else {
      navigate(targetPath);
    }
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0a]/85 backdrop-blur-md border-t border-white/[0.04] py-2 px-6 sm:px-12 md:px-20"
    >
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between sm:justify-around">
        {/* 1. Home */}
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-3 ${
            isHome ? 'text-[#f9fafb]' : 'text-[#4b5563] hover:text-[#9ca3af]'
          }`}
        >
          {isHome ? (
            <div className="w-1 h-1 rounded-full bg-blue-500 mb-0.5 animate-fade-in" />
          ) : (
            <div className="w-1 h-1 mb-0.5 opacity-0" />
          )}
          <Home className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-[0.08em] font-medium">Home</span>
        </button>

        {/* 2. Analytics */}
        <button
          onClick={() => handleNav('/dashboard', true)}
          className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-3 ${
            isAnalytics ? 'text-[#f9fafb]' : 'text-[#4b5563] hover:text-[#9ca3af]'
          }`}
        >
          {isAnalytics ? (
            <div className="w-1 h-1 rounded-full bg-blue-500 mb-0.5 animate-fade-in" />
          ) : (
            <div className="w-1 h-1 mb-0.5 opacity-0" />
          )}
          <BarChart2 className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-[0.08em] font-medium">Analytics</span>
        </button>

        {/* 3. Dashboard */}
        <button
          onClick={() => handleNav('/dashboard', true)}
          className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-3 ${
            isDashboard ? 'text-[#f9fafb]' : 'text-[#4b5563] hover:text-[#9ca3af]'
          }`}
        >
          {isDashboard ? (
            <div className="w-1 h-1 rounded-full bg-blue-500 mb-0.5 animate-fade-in" />
          ) : (
            <div className="w-1 h-1 mb-0.5 opacity-0" />
          )}
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-[0.08em] font-medium">Dashboard</span>
        </button>

        {/* 4. Account */}
        <button
          onClick={() => handleNav(isAuthenticated ? '/dashboard' : '/login', false)}
          className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-3 ${
            isAccount ? 'text-[#f9fafb]' : 'text-[#4b5563] hover:text-[#9ca3af]'
          }`}
        >
          {isAccount ? (
            <div className="w-1 h-1 rounded-full bg-blue-500 mb-0.5 animate-fade-in" />
          ) : (
            <div className="w-1 h-1 mb-0.5 opacity-0" />
          )}
          <User className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-[0.08em] font-medium">
            {isAuthenticated ? 'Account' : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar             from './components/Navbar';
import PrivateRoute       from './components/PrivateRoute';
import AnimatedBackground from './components/AnimatedBackground';
import BottomNav        from './components/BottomNav';
import Landing   from './pages/Landing';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    // relative + z-10 so page content renders above the z-0 fixed background
    <div className="relative min-h-screen" style={{ zIndex: 1 }}>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/analytics/:shortId" element={<Analytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Animated background lives at z-0, below all page content */}
        <AnimatedBackground />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

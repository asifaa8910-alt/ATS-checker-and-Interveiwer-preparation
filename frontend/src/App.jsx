import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FloatingChatbot from './components/FloatingChatbot';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeAnalysis from './pages/ResumeAnalysis';
import InterviewSimulator from './pages/InterviewSimulator';
import Performance from './pages/Performance';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import { Loader2 } from 'lucide-react';

// Protected Route Handler
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center transition-colors duration-200">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-sm font-semibold tracking-wide text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Admin Route Handler
const AdminRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center transition-colors duration-200">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return isAuthenticated && user?.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// Layout Wrapper for App Panel Pages
const DashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role === 'admin' && location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1 relative px-8 pt-6 pb-12 gap-3">
        <Sidebar />
        <main className="flex-1 pr-2">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <FloatingChatbot />
    </div>
  );
};

// Public Route (redirects authenticated users to dashboard)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center transition-colors duration-200">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Dashboard Panel Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resume" element={<ResumeAnalysis />} />
                <Route path="/interview" element={<InterviewSimulator />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Admin Exclusive Route */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Route>
            </Route>

            {/* Default Route redirection */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

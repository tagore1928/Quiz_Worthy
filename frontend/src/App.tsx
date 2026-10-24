import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GoogleOnboardingModal } from './components/GoogleOnboardingModal';
import { MaintenanceGuard } from './components/MaintenanceGuard';
import { Backdrop } from './components/Backdrop';
import { Loader } from './components/Loader';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Analytics } from './pages/Analytics';
import { Leaderboard } from './pages/Leaderboard';
import { Admin } from './pages/Admin';
import { Maintenance } from './pages/Maintenance';
import { AboutUs } from './pages/AboutUs';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { QuizArena } from './pages/QuizArena';

// Reset scroll position on every route change (in-page #hash links excepted).
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Route Guard with First-Time Visitor routing
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Loader />
    );
  }

  if (!currentUser) {
    const hasVisited = localStorage.getItem('quizworthy_visited');
    if (!hasVisited) {
      localStorage.setItem('quizworthy_visited', 'true');
      return <Navigate to="/register" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Root index routing handler
const RootRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Loader />
    );
  }

  if (currentUser) {
    return <Home />;
  }

  const hasVisited = localStorage.getItem('quizworthy_visited');
  if (!hasVisited) {
    localStorage.setItem('quizworthy_visited', 'true');
    return <Navigate to="/register" replace />;
  }

  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Backdrop />
        <div className="relative z-10 min-h-screen flex flex-col text-slate-100 font-sans">
          <Navbar />
          
          <main className="flex-grow">
            <MaintenanceGuard>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/maintenance" element={<Maintenance />} />

                {/* Platform Pages (Protected) */}
                <Route path="/" element={<RootRoute />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <Leaderboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz/:topic"
                  element={
                    <ProtectedRoute>
                      <QuizArena />
                    </ProtectedRoute>
                  }
                />

                {/* Footer Info Pages */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MaintenanceGuard>
          </main>

          <Footer />
          
          {/* Mandatory Google Sign-In Onboarding Modal */}
          <GoogleOnboardingModal />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

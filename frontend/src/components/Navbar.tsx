import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  User as UserIcon, 
  BarChart3, 
  Trophy, 
  ShieldAlert, 
  LogOut, 
  Flame, 
  Zap, 
  Menu, 
  X, 
  BrainCircuit 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  if (userProfile?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: ShieldAlert });
  }

  const handleLogoutConfirm = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setShowLogoutModal(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm group-hover:bg-sky-500 transition">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Quiz Worthy
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Profile & Actions */}
            {userProfile ? (
              <div className="hidden md:flex items-center gap-3">
                {/* Stats badge */}
                <div className="flex items-center gap-3 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold" title="Current Streak">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{userProfile.currentStreak}d</span>
                  </div>
                  <div className="w-px h-3.5 bg-slate-800" />
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold" title="Total XP">
                    <Zap className="w-3.5 h-3.5 fill-sky-400" />
                    <span>{userProfile.xp} XP</span>
                  </div>
                </div>

                {/* Avatar / Name */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="w-6 h-6 rounded-md bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                    {userProfile.name}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-5 space-y-2 animate-fade-in">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    location.pathname === link.path
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {userProfile && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm auth-glass-card p-6 space-y-4 text-center">
            <div className="inline-flex p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <LogOut className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Confirm Sign Out</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to sign out of your Quiz Worthy account?
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={loggingOut}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                {loggingOut ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sign Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

import React, { useEffect, useState } from 'react';
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
  X
} from 'lucide-react';
import { BrandMark } from './BrandMark';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
      <nav className="sticky top-0 z-40 w-full bg-ink/75 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <BrandMark className="w-7 h-7" />
              <span className="text-[15px] font-semibold tracking-tight text-white">
                Quiz Worthy
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-0.5 p-1 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-3 py-1 rounded-md text-[13px] transition-colors duration-150 ${
                      isActive
                        ? 'bg-white/[0.07] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-1/2 -bottom-[5px] -translate-x-1/2 w-4 h-px bg-sky-400 shadow-[0_0_8px_rgba(200,241,53,0.9)]" />
                    )}
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* User Profile & Actions */}
            {userProfile ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-3 px-2.5 py-1 rounded-md border border-white/[0.06] font-mono text-xs">
                  <div className="flex items-center gap-1 text-amber-400" title="Current Streak">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{userProfile.currentStreak}d</span>
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1 text-sky-400" title="Total XP">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{userProfile.xp}</span>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-md border border-white/[0.06] hover:border-white/15 transition"
                >
                  <div className="w-6 h-6 rounded bg-slate-800 border border-white/10 flex items-center justify-center text-sky-400 font-mono font-semibold text-[11px]">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-200 max-w-[120px] truncate">
                    {userProfile.name}
                  </span>
                </Link>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-white/[0.04] transition"
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-[13px] text-slate-300 hover:text-white transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-md text-[13px] font-medium text-ink bg-sky-400 hover:bg-sky-300 transition"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-slate-300 hover:text-white"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] px-4 pt-2 pb-4 space-y-1 animate-fade-in">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm border-l-2 ${
                    isActive
                      ? 'border-sky-400 bg-white/[0.05] text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-rose-400 border border-rose-500/20 mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm auth-glass-card p-6 space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-rose-400">Session</p>
            <h3 className="text-lg font-semibold text-white">Sign out of Quiz Worthy?</h3>
            <p className="text-sm text-slate-400">
              You'll need to sign in again to continue practising.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-md border border-white/10 text-slate-200 hover:bg-white/[0.04] text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={loggingOut}
                className="flex-1 py-2 rounded-md bg-rose-500 hover:bg-rose-400 text-white text-sm font-medium transition flex items-center justify-center gap-1.5"
              >
                {loggingOut ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sign out</span>
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

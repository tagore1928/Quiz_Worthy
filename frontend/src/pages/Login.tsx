import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, loginWithGoogle, resendVerificationEmail } = useAuth();

  const noticeMessage = (location.state as { notice?: string })?.notice;

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [error, setError] = useState<string>('');
  const [verificationBlocked, setVerificationBlocked] = useState<boolean>(false);
  const [resentSuccess, setResentSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationBlocked(false);
    setResentSuccess(false);

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginWithEmail(email.trim(), password);

      if (res.requiresVerification) {
        setVerificationBlocked(true);
        return;
      }

      if (res.success) {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError(`This domain (${window.location.hostname}) is not authorized in Firebase Console. Add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`);
      } else {
        setError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await resendVerificationEmail();
      setResentSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md auth-glass-card p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to your Quiz Worthy account to continue practice
          </p>
        </div>

        {/* Notice from registration */}
        {noticeMessage && !error && !verificationBlocked && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Verification Block Notice */}
        {verificationBlocked && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-sm space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Email Verification Required</p>
                <p className="text-xs text-amber-200/80 mt-1">
                  Your email has not been verified yet. Please check your inbox and verify your email link before signing in.
                </p>
              </div>
            </div>

            {resentSuccess ? (
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Verification link sent. Check your inbox.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-xs font-medium rounded-md transition flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Resend Verification Email</span>
              </button>
            )}
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="clean-button-secondary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.6-.8-1-1.7-1-2.7z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-xs text-slate-400">
            or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="clean-input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter at least 8 characters"
                className="clean-input pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="clean-button-primary mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

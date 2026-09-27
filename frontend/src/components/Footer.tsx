import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit, HelpCircle, X, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const Footer: React.FC = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Hide footer on specific pages (Auth & Quiz Arena)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/signup';
  const isQuizPage = location.pathname.startsWith('/quiz/');

  if (isAuthPage || isQuizPage) {
    return null;
  }

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;

    try {
      setSubmitting(true);
      const reqCol = collection(db, 'topic_requests');
      await addDoc(reqCol, {
        userEmail: userProfile?.email || 'anonymous@quizworthy.com',
        userName: userProfile?.name || 'Anonymous User',
        subject: subject.trim(),
        details: details.trim(),
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsSupportOpen(false);
        setSubmitted(false);
        setSubject('');
        setDetails('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting topic request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-slate-400 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-white">Quiz Worthy</span>
            <span className="text-slate-500">© 2026. Practice real technical interview questions.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <Link to="/about" className="hover:text-slate-200 transition">
              About
            </Link>
            <Link to="/privacy" className="hover:text-slate-200 transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-200 transition">
              Terms of Service
            </Link>
            <button
              onClick={() => setIsSupportOpen(true)}
              className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </footer>

      {/* Contact Support Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md auth-glass-card p-6 space-y-4 relative">
            <button
              onClick={() => setIsSupportOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-sky-400">
              <HelpCircle className="w-4 h-4" />
              <h3 className="text-base font-semibold text-white">Contact Support / Request Topic</h3>
            </div>

            {submitted ? (
              <div className="py-6 text-center space-y-2 text-emerald-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-semibold text-sm">Request Submitted</p>
                <p className="text-xs text-slate-300">Our team will review your feedback shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendSupport} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Request New Topic: Distributed Systems"
                    className="clean-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe your feedback or requested quiz category..."
                    className="clean-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="clean-button-primary mt-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;

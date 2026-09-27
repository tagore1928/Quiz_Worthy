import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PREDEFINED_COLLEGES } from '../types/user';
import { GraduationCap, UserCheck, Plus, AlertCircle } from 'lucide-react';

export const GoogleOnboardingModal: React.FC = () => {
  const { pendingGoogleUser, completeGoogleOnboarding, cancelGoogleOnboarding } = useAuth();

  const [collegesList, setCollegesList] = useState<string[]>(PREDEFINED_COLLEGES);
  const [selectedCollege, setSelectedCollege] = useState<string>(PREDEFINED_COLLELESS_FALLBACK[0] || PREDEFINED_COLLEGES[0]);
  const [customCollege, setCustomCollege] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [name, setName] = useState<string>(pendingGoogleUser?.name || '');
  const [isNotStudent, setIsNotStudent] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!pendingGoogleUser) return null;

  const handleSelectCollege = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'OTHER_CUSTOM') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setSelectedCollege(val);
    }
  };

  const handleAddCustomCollege = () => {
    if (!customCollege.trim()) return;
    const trimmed = customCollege.trim();
    if (!collegesList.includes(trimmed)) {
      setCollegesList((prev) => [...prev, trimmed]);
    }
    setSelectedCollege(trimmed);
    setShowCustomInput(false);
    setCustomCollege('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    const finalCollege = isNotStudent ? 'Not Applicable' : selectedCollege;
    if (!isNotStudent && !finalCollege) {
      setError('Please select or add your institution.');
      return;
    }

    try {
      setSubmitting(true);
      await completeGoogleOnboarding({
        name: name.trim(),
        collegeName: finalCollege,
        isStudent: !isNotStudent,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile initialization.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg auth-glass-card p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold text-white">
            Complete Your Profile
          </h2>
          <p className="text-slate-400 text-xs">
            Please fill in your details to finalize setting up your Quiz Worthy account.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="clean-input"
            />
          </div>

          {/* Not a Student Checkbox */}
          <div className="flex items-center gap-2.5 p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
            <input
              type="checkbox"
              id="notStudentCheck"
              checked={isNotStudent}
              onChange={(e) => setIsNotStudent(e.target.checked)}
              className="w-4 h-4 accent-sky-500 cursor-pointer rounded"
            />
            <label htmlFor="notStudentCheck" className="text-xs text-slate-300 cursor-pointer select-none">
              I am a working professional / not currently a student
            </label>
          </div>

          {/* College Name Selection */}
          {!isNotStudent && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                Select Institution / University
              </label>

              {!showCustomInput ? (
                <select
                  value={selectedCollege}
                  onChange={handleSelectCollege}
                  className="clean-input bg-slate-950 cursor-pointer"
                >
                  {collegesList.map((college, idx) => (
                    <option key={idx} value={college} className="bg-slate-900 text-white">
                      {college}
                    </option>
                  ))}
                  <option value="OTHER_CUSTOM" className="bg-slate-900 text-sky-400 font-medium">
                    + Other (Add Custom Institution...)
                  </option>
                </select>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCollege}
                      onChange={(e) => setCustomCollege(e.target.value)}
                      placeholder="Select your institution or enter name"
                      className="clean-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCollege}
                      className="px-3.5 py-2 bg-sky-600 text-white font-medium text-xs rounded-lg hover:bg-sky-500 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    ← Back to dropdown list
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={submitting}
              className="clean-button-primary flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Complete Setup</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={cancelGoogleOnboarding}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition text-center"
            >
              Cancel & Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PREDEFINED_COLLELESS_FALLBACK = PREDEFINED_COLLEGES;

export default GoogleOnboardingModal;

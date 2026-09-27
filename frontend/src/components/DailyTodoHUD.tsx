import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getISTDateKey } from '../utils/dateUtils';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { BadgeCelebrationModal } from './BadgeCelebrationModal';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Calendar, 
  Medal, 
  AlertCircle, 
  CheckCircle2,
  ListTodo
} from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export const DailyTodoHUD: React.FC = () => {
  const { userProfile } = useAuth();
  const istDateKey = getISTDateKey();

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [silverAwarded, setSilverAwarded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSilverModal, setShowSilverModal] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (userProfile?.uid) {
      loadDailyTodos();
    }
  }, [userProfile?.uid, istDateKey]);

  const loadDailyTodos = async () => {
    if (!userProfile?.uid) return;
    try {
      setLoading(true);
      const todoDocRef = doc(db, 'users', userProfile.uid, 'daily_todos', istDateKey);
      const snap = await getDoc(todoDocRef);

      if (snap.exists()) {
        const data = snap.data();
        setTodos(data.tasks || []);
        setSilverAwarded(!!data.silverAwarded);
      } else {
        setTodos([]);
        setSilverAwarded(false);
      }
    } catch (err) {
      console.error('Error loading daily todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTodosToFirestore = async (updatedTodos: TodoItem[], isSilverDone: boolean) => {
    if (!userProfile?.uid) return;
    try {
      const todoDocRef = doc(db, 'users', userProfile.uid, 'daily_todos', istDateKey);
      await setDoc(todoDocRef, {
        dateKey: istDateKey,
        tasks: updatedTodos,
        silverAwarded: isSilverDone,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving todos to Firestore:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newTaskText.trim()) return;
    if (todos.length >= 10) {
      setError('Daily limit reached: Maximum 10 tasks allowed per day.');
      return;
    }

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    };

    const updated = [...todos, newTodo];
    setTodos(updated);
    setNewTaskText('');
    await saveTodosToFirestore(updated, silverAwarded);
  };

  const handleToggleTask = async (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTodos(updated);

    const allCompleted = updated.length > 0 && updated.every((t) => t.completed);
    let nowSilverAwarded = silverAwarded;

    if (allCompleted && !silverAwarded && userProfile?.uid) {
      nowSilverAwarded = true;
      setSilverAwarded(true);
      setShowSilverModal(true);

      try {
        const userRef = doc(db, 'users', userProfile.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentSilver = userSnap.data().silverBadges || 0;
          await updateDoc(userRef, {
            silverBadges: currentSilver + 1,
          });
        }

        const activityRef = doc(db, 'users', userProfile.uid, 'activity', istDateKey);
        await setDoc(
          activityRef,
          {
            date: istDateKey,
            allTodosDone: true,
            timestamp: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error updating Silver badge award in Firestore:', err);
      }
    }

    await saveTodosToFirestore(updated, nowSilverAwarded);
  };

  const handleDeleteTask = async (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    await saveTodosToFirestore(updated, silverAwarded);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const progressPercent = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <>
      <div className="clean-glass-card p-6 sm:p-8 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white">Daily Tasks</h2>
            </div>
            <p className="text-xs text-slate-400">
              Complete your daily learning checklist to earn a{' '}
              <span className="text-slate-200 font-semibold">Silver Badge</span>.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Date: {istDateKey}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {todos.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>
                Progress: {completedCount} / {todos.length} Done
              </span>
              <span className={progressPercent === 100 ? 'text-emerald-400 font-semibold' : 'text-sky-400 font-semibold'}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-md overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-sky-500 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Silver Badge Status Notice */}
        {silverAwarded && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Medal className="w-4 h-4 text-slate-200" />
              <span className="font-semibold">Today's Silver Badge Earned (+1 Silver Badge)</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Input Form */}
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            disabled={todos.length >= 10}
            placeholder={
              todos.length >= 10
                ? 'Daily limit reached (10/10 tasks)'
                : 'Add a new daily goal (e.g. Complete 2 OS quizzes)...'
            }
            className="clean-input flex-1 text-xs"
          />
          <button
            type="submit"
            disabled={todos.length >= 10 || !newTaskText.trim()}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-lg transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        {/* Task Checklist Items */}
        {loading ? (
          <div className="text-center py-6 text-xs text-slate-400 animate-pulse">
            Loading checklist...
          </div>
        ) : todos.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs space-y-1">
            <ListTodo className="w-5 h-5 text-slate-500 mx-auto mb-1" />
            <p>No tasks added for today.</p>
            <p className="text-slate-500">Add up to 10 goals above to track your daily progress.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`p-3 rounded-lg border transition-all duration-150 flex items-center justify-between gap-3 ${
                  todo.completed
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800 text-white hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleTask(todo.id)}
                  className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                >
                  {todo.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 hover:text-sky-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs font-medium ${todo.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {todo.text}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(todo.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Silver Celebration Popup Modal */}
      {showSilverModal && (
        <BadgeCelebrationModal
          type="silver"
          title="Daily Goals Completed"
          description="You marked 100% of today's checklist complete. Your Silver Badge has been awarded."
          onClose={() => setShowSilverModal(false)}
        />
      )}
    </>
  );
};

export default DailyTodoHUD;

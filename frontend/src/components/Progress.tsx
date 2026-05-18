import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

interface ExerciseLog {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface ProgressEntry {
  _id: string;
  type: 'workout' | 'weight';
  workoutName?: string;
  exercises?: ExerciseLog[];
  duration?: number;
  weightValue?: number;
  notes?: string;
  date: string;
  createdAt: string;
}

interface Stats {
  totalWorkouts: number;
  totalDuration: number;
  streak: number;
  latestWeight: number | null;
}

export function Progress() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [stats, setStats] = useState<Stats>({ totalWorkouts: 0, totalDuration: 0, streak: 0, latestWeight: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState<'workout' | 'weight' | null>(null);
  const [saving, setSaving] = useState(false);

  // Workout form state
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState<ExerciseLog[]>([{ name: '', sets: 0, reps: 0, weight: 0 }]);
  const [workoutNotes, setWorkoutNotes] = useState('');

  // Weight form state
  const [weightValue, setWeightValue] = useState('');
  const [weightNotes, setWeightNotes] = useState('');

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    if (!token) {
      setError('Please log in to track progress');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [entriesData, statsData] = await Promise.all([
        api.getProgress(token),
        api.getProgressStats(token),
      ]);
      setEntries(entriesData);
      setStats(statsData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogWorkout = async () => {
    if (!token) return;
    if (!workoutName.trim()) {
      setError('Please enter a workout name');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await api.logWorkout(token, {
        workoutName,
        exercises: exercises.filter((e) => e.name.trim()),
        duration: Number(duration) || 0,
        notes: workoutNotes,
      });
      setWorkoutName('');
      setDuration('');
      setExercises([{ name: '', sets: 0, reps: 0, weight: 0 }]);
      setWorkoutNotes('');
      setActiveModal(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to log workout');
    } finally {
      setSaving(false);
    }
  };

  const handleLogWeight = async () => {
    if (!token) return;
    if (!weightValue || Number(weightValue) <= 0) {
      setError('Please enter a valid weight');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await api.logWeight(token, {
        weightValue: Number(weightValue),
        notes: weightNotes,
      });
      setWeightValue('');
      setWeightNotes('');
      setActiveModal(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to log weight');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Delete this entry?')) return;
    try {
      await api.deleteProgressEntry(token, id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete entry');
    }
  };

  const addExerciseField = () => {
    setExercises([...exercises, { name: '', sets: 0, reps: 0, weight: 0 }]);
  };

  const updateExercise = (index: number, field: keyof ExerciseLog, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    if (exercises.length <= 1) return;
    setExercises(exercises.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"
          style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.5, repeat: Infinity } }}
        />
        <p className="mt-4 text-gray-400">Loading progress...</p>
      </div>
    );
  }

  if (error && !entries.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <motion.div
          className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-red-400"
          initial={{ opacity: 0, rotateX: 20, z: -100 }}
          animate={{ opacity: 1, rotateX: 0, z: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <p className="font-semibold mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h2
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -30, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.5 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        Track Progress
      </motion.h2>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Workouts', value: stats.totalWorkouts, icon: '🏋️' },
          { label: 'Current Streak', value: `${stats.streak} days`, icon: '🔥' },
          { label: 'Total Duration', value: `${stats.totalDuration} min`, icon: '⏱️' },
          { label: 'Latest Weight', value: stats.latestWeight ? `${stats.latestWeight} kg` : '—', icon: '⚖️' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, rotateY: -20, z: -50 }}
            animate={{ opacity: 1, rotateY: 0, z: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            style={{ transformStyle: 'preserve-3d' }}
            whileHover={{ z: 20, scale: 1.03 }}
          >
            <div
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-center hover:border-red-500 transition-all"
              style={{
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-red-400">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap justify-center gap-4 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={() => setActiveModal('workout')}
          className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-all"
          whileHover={{ scale: 1.08, rotateY: 3, z: 20, boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          🏋️ Log Workout
        </motion.button>
        <motion.button
          onClick={() => setActiveModal('weight')}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg font-semibold transition-all"
          whileHover={{ scale: 1.08, rotateY: -3, z: 20, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
          whileTap={{ scale: 0.95 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          ⚖️ Log Weight
        </motion.button>
      </motion.div>

      {error && (
        <motion.div
          className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8 text-red-400 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-2xl font-bold mb-6">History</h3>
        {entries.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No entries yet. Start by logging a workout or weight!</p>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-5 hover:border-red-500/50 transition-all"
                  style={{
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
                    transformStyle: 'preserve-3d',
                  }}
                  whileHover={{ z: 10, scale: 1.01 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">
                          {entry.type === 'workout' ? '🏋️' : '⚖️'}
                        </span>
                        <h4 className="text-lg font-bold">
                          {entry.type === 'workout'
                            ? entry.workoutName || 'Workout'
                            : `Weight Log: ${entry.weightValue} kg`}
                        </h4>
                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      {entry.type === 'workout' && entry.exercises && entry.exercises.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {entry.exercises.map((ex, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20"
                            >
                              {ex.name} — {ex.sets}x{ex.reps} @ {ex.weight}kg
                            </span>
                          ))}
                        </div>
                      )}
                      {entry.duration && entry.duration > 0 && (
                        <p className="text-sm text-gray-400 mt-1">Duration: {entry.duration} min</p>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-gray-400 mt-1 italic">"{entry.notes}"</p>
                      )}
                    </div>
                    <motion.button
                      onClick={() => handleDelete(entry._id)}
                      className="text-gray-500 hover:text-red-400 transition-colors px-2 py-1"
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ×
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Log Workout Modal */}
      <AnimatePresence>
        {activeModal === 'workout' && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              initial={{ opacity: 0, rotateX: 30, scale: 0.8, z: -300 }}
              animate={{ opacity: 1, rotateX: 0, scale: 1, z: 0 }}
              exit={{ opacity: 0, rotateX: -20, scale: 0.9, z: -200 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h3 className="text-2xl font-bold mb-6">🏋️ Log Workout</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Workout Name</label>
                  <input
                    type="text"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    placeholder="e.g. Chest Day"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    placeholder="45"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm text-gray-400">Exercises</label>
                    <motion.button
                      onClick={addExerciseField}
                      className="text-sm text-red-400 hover:text-red-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      + Add Exercise
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {exercises.map((ex, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => updateExercise(i, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                          placeholder="Exercise name"
                        />
                        <input
                          type="number"
                          value={ex.sets || ''}
                          onChange={(e) => updateExercise(i, 'sets', Number(e.target.value))}
                          className="w-16 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none text-sm text-center"
                          placeholder="Sets"
                        />
                        <input
                          type="number"
                          value={ex.reps || ''}
                          onChange={(e) => updateExercise(i, 'reps', Number(e.target.value))}
                          className="w-16 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none text-sm text-center"
                          placeholder="Reps"
                        />
                        <input
                          type="number"
                          value={ex.weight || ''}
                          onChange={(e) => updateExercise(i, 'weight', Number(e.target.value))}
                          className="w-20 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none text-sm text-center"
                          placeholder="Weight"
                        />
                        <motion.button
                          onClick={() => removeExercise(i)}
                          className="text-gray-500 hover:text-red-400 px-2"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ×
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes</label>
                  <textarea
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    rows={3}
                    placeholder="How did it go?"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={handleLogWorkout}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saving ? 'Saving...' : 'Save Workout'}
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveModal(null)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                  Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Weight Modal */}
      <AnimatePresence>
        {activeModal === 'weight' && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              initial={{ opacity: 0, rotateX: 30, scale: 0.8, z: -300 }}
              animate={{ opacity: 1, rotateX: 0, scale: 1, z: 0 }}
              exit={{ opacity: 0, rotateX: -20, scale: 0.9, z: -200 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h3 className="text-2xl font-bold mb-6">⚖️ Log Weight</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none text-2xl font-bold text-center"
                    placeholder="75.0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes</label>
                  <textarea
                    value={weightNotes}
                    onChange={(e) => setWeightNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    rows={3}
                    placeholder="Morning weigh-in, after workout, etc."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={handleLogWeight}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saving ? 'Saving...' : 'Save Weight'}
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveModal(null)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                  Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

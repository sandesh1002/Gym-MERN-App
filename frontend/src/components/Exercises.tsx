import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { api } from '../services/api';

interface Exercise {
  _id: string;
  name: string;
  category: string;
  description: string;
  videoUrl: string;
  sets: string;
  reps: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

export function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    videoUrl: '',
    sets: '',
    reps: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
  });
  const [saving, setSaving] = useState(false);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace('www.', '');

      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (parsed.pathname === '/watch') {
          const videoId = parsed.searchParams.get('v');
          return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        }
        if (parsed.pathname.startsWith('/embed/')) return url;
        if (parsed.pathname.startsWith('/shorts/')) {
          const videoId = parsed.pathname.split('/')[2];
          return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        }
      }

      if (host === 'youtu.be') {
        const videoId = parsed.pathname.replace('/', '');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      return url;
    } catch {
      return url;
    }
  };


  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core'];


  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const data = await api.getExercises('All');
        setExercises(data.map((item: Exercise) => ({ ...item, videoUrl: getEmbedUrl(item.videoUrl) })));
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to load exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setUserRole(u.role);
      }
    }
  }, []);


  const filteredExercises = selectedCategory === 'All'
    ? exercises
    : exercises.filter(ex => ex.category === selectedCategory);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      videoUrl: '',
      sets: '',
      reps: '',
      difficulty: 'Beginner',
    });
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const created = await api.createExercise(formData, token);
      setExercises((prev) => [{ ...created, videoUrl: getEmbedUrl(created.videoUrl) }, ...prev]);
      setShowAdminModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to create exercise');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      return;
    }
    if (!confirm('Delete this exercise?')) return;

    try {
      await api.deleteExercise(exerciseId, token);
      setExercises((prev) => prev.filter((item) => item._id !== exerciseId));
      setSelectedExercise((prev) => (prev?._id === exerciseId ? null : prev));
    } catch (err: any) {
      setError(err.message || 'Failed to delete exercise');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="mt-4 text-gray-400">Loading exercises...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <motion.div
          className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-red-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-semibold mb-2">Error loading exercises</p>
          <p className="text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h2
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Exercise Library
      </motion.h2>


      {/* Category Filter */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {categories.map((category, index) => (
          <motion.button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedCategory === category
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      {/* Trainer Admin Panel */}
      {userRole === 'trainer' && (
        <motion.div
          className="mb-8 bg-gray-800/40 border border-red-500/30 rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="font-semibold text-red-400">Trainer Mode</p>
            <p className="text-sm text-gray-300">You can add new expert exercises for all users.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 font-semibold transition-colors"
          >
            + Add Exercise
          </button>
        </motion.div>
      )}
      {/* Exercise Grid */}
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredExercises.map((exercise) => (
          <motion.div
            key={exercise._id}
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div
              onClick={() => setSelectedExercise(exercise)}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-red-500 transition-all h-full"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold">{exercise.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    exercise.difficulty === 'Beginner'
                      ? 'bg-green-500/20 text-green-400'
                      : exercise.difficulty === 'Intermediate'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {exercise.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                {exercise.description}
              </p>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Sets:{' '}
                  <span className="text-white">{exercise.sets}</span>
                </span>
                <span className="text-gray-500">
                  Reps:{' '}
                  <span className="text-white">{exercise.reps}</span>
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="inline-block px-3 py-1 bg-gray-700 rounded-full text-xs">
                  {exercise.category}
                </span>
                {userRole === 'trainer' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteExercise(exercise._id);
                    }}
                    className="ml-auto px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Trainer Admin Modal */}
      <AnimatePresence>
        {showAdminModal && userRole === 'trainer' && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdminModal(false)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full p-6"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
            >
              <h3 className="text-2xl font-bold mb-4">Add Expert Exercise</h3>
              <form onSubmit={handleCreateExercise} className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Exercise name"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Category (e.g. Chest)"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                  rows={3}
                  required
                />
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, videoUrl: getEmbedUrl(e.target.value) }))}
                  placeholder="Video URL (YouTube embed link)"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.sets}
                    onChange={(e) => setFormData((p) => ({ ...p, sets: e.target.value }))}
                    placeholder="Sets"
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                  <input
                    type="text"
                    value={formData.reps}
                    onChange={(e) => setFormData((p) => ({ ...p, reps: e.target.value }))}
                    placeholder="Reps"
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData((p) => ({ ...p, difficulty: e.target.value as Exercise['difficulty'] }))}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Exercise'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {filteredExercises.length === 0 && (
        <motion.div
          className="text-center py-12 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No exercises found in this category.
        </motion.div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full p-6"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <motion.h3
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {selectedExercise.name}
                  </motion.h3>
                  <motion.p
                    className="text-gray-400"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {selectedExercise.description}
                  </motion.p>
                </div>
                <motion.button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>

              <motion.div
                className="aspect-video mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedExercise.videoUrl}
                  title={selectedExercise.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </motion.div>

              <motion.div
                className="grid grid-cols-3 gap-4 bg-gray-800 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }}>
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="font-semibold">
                    {selectedExercise.category}
                  </p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <p className="text-gray-400 text-sm">Sets</p>
                  <p className="font-semibold">{selectedExercise.sets}</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <p className="text-gray-400 text-sm">Reps</p>
                  <p className="font-semibold">{selectedExercise.reps}</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

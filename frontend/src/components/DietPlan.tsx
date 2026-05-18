import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { createPortal } from 'react-dom';
import { api } from '../services/api';
import { TiltCard } from './3d';

interface Meal {
  name: string;
  items: string[];
  calories: number;
  protein: string;
}

interface DietPlanType {
  _id: string;
  name: string;
  goal: string;
  description: string;
  totalCalories: number;
  meals: {
    breakfast: Meal;
    midMorning: Meal;
    lunch: Meal;
    evening: Meal;
    dinner: Meal;
  };
}

const planContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const planCardVariants: Variants = {
  hidden: { opacity: 0, rotateY: -30, z: -100 },
  visible: {
    opacity: 1,
    rotateY: 0,
    z: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const mealVariants: Variants = {
  hidden: { opacity: 0, rotateX: 15, y: 30, z: -50 },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    z: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 15,
    },
  },
};

const mealContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export function DietPlan() {
  const [dietPlans, setDietPlans] = useState<DietPlanType[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DietPlanType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    description: '',
    totalCalories: 0,
    meals: {
      breakfast: { name: '', items: [], calories: 0, protein: '' },
      midMorning: { name: '', items: [], calories: 0, protein: '' },
      lunch: { name: '', items: [], calories: 0, protein: '' },
      evening: { name: '', items: [], calories: 0, protein: '' },
      dinner: { name: '', items: [], calories: 0, protein: '' },
    },
  });
  const [saving, setSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);



  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        setLoading(true);
        const data = await api.getDietPlans();
        setDietPlans(data);
        if (data.length > 0) {
          setSelectedPlan(data[0]);
        }
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to load diet plans');
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlans();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!showAdminModal) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowAdminModal(false);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showAdminModal]);

  const resetDietForm = () => {
    setFormData({
      name: '',
      goal: '',
      description: '',
      totalCalories: 0,
      meals: {
        breakfast: { name: '', items: [], calories: 0, protein: '' },
        midMorning: { name: '', items: [], calories: 0, protein: '' },
        lunch: { name: '', items: [], calories: 0, protein: '' },
        evening: { name: '', items: [], calories: 0, protein: '' },
        dinner: { name: '', items: [], calories: 0, protein: '' },
      },
    });
  };

  const handleCreateDietPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...formData,
        meals: {
          breakfast: { ...formData.meals.breakfast, items: formData.meals.breakfast.items.filter(Boolean) },
          midMorning: { ...formData.meals.midMorning, items: formData.meals.midMorning.items.filter(Boolean) },
          lunch: { ...formData.meals.lunch, items: formData.meals.lunch.items.filter(Boolean) },
          evening: { ...formData.meals.evening, items: formData.meals.evening.items.filter(Boolean) },
          dinner: { ...formData.meals.dinner, items: formData.meals.dinner.items.filter(Boolean) },
        },
      };
      const created = await api.createDietPlan(payload, token);
      setDietPlans((prev) => [created, ...prev]);
      setSelectedPlan(created);
      setShowAdminModal(false);
      resetDietForm();
    } catch (err: any) {
      setError(err.message || 'Failed to create diet plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDietPlan = async (planId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      return;
    }
    if (!confirm('Delete this diet plan?')) return;

    try {
      await api.deleteDietPlan(planId, token);
      setDietPlans((prev) => {
        const updated = prev.filter((plan) => plan._id !== planId);
        setSelectedPlan((current) => {
          if (!current || current._id !== planId) return current;
          return updated.length > 0 ? updated[0] : null;
        });
        return updated;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete diet plan');
    }
  };

  const updateMeal = (mealKey: keyof DietPlanType['meals'], field: keyof Meal, value: string | number | string[]) => {
    setFormData((prev) => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealKey]: {
          ...prev.meals[mealKey],
          [field]: value,
        },
      },
    }));
  };

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


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"
          style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.5, repeat: Infinity } }}
        />
        <p className="mt-4 text-gray-400">Loading diet plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <motion.div
          className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-red-400"
          initial={{ opacity: 0, rotateX: 20, z: -100 }}
          animate={{ opacity: 1, rotateX: 0, z: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <p className="font-semibold mb-2">Error loading diet plans</p>
          <p className="text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-400">
        No diet plans available.
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
        Diet Plans
      </motion.h2>

      {userRole === 'trainer' && (
        <motion.div
          className="mb-8 bg-gray-800/40 border border-red-500/30 rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="font-semibold text-red-400">Trainer Mode</p>
            <p className="text-sm text-gray-300">You can add new diet plans for all members.</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAdminModal(true);
            }}
            className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 font-semibold transition-colors"
          >
            + Add Diet Plan
          </button>
        </motion.div>
      )}

      {/* Plan Selector */}
      <motion.div
        className="grid md:grid-cols-3 gap-6 mb-12"
        variants={planContainerVariants}
        initial="hidden"
        animate="visible"
        style={{ perspective: 1000 }}
      >
        {dietPlans.map((plan) => (
          <motion.div
            key={plan._id}
            variants={planCardVariants}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <TiltCard tiltAmount={10} scale={1.02}>
              <div
                onClick={() => setSelectedPlan(plan)}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all h-full ${
                  selectedPlan._id === plan._id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
                style={{
                  boxShadow: selectedPlan._id === plan._id
                    ? '0 20px 40px -10px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1)'
                    : '0 15px 35px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
                }}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-red-400 font-semibold mb-2">{plan.goal}</p>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-sm text-gray-400">Total Daily Calories</p>
                  <p className="text-2xl font-bold text-red-400">{plan.totalCalories}</p>
                </div>
                {userRole === 'trainer' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDietPlan(plan._id);
                    }}
                    className="mt-3 w-full px-3 py-2 rounded-lg text-sm bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                  >
                    Delete Plan
                  </button>
                )}
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Selected Plan Details */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-8"
        initial={{ opacity: 0, rotateX: 10, y: 40 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
        }}
      >
        <motion.h3
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {selectedPlan.name} - Daily Meal Plan
        </motion.h3>

        <motion.div
          className="space-y-6"
          variants={mealContainerVariants}
          initial="hidden"
          animate="visible"
          style={{ perspective: 800 }}
        >
          {Object.entries(selectedPlan.meals).map(([key, meal]) => (
            <motion.div
              key={key}
              variants={mealVariants}
              className="bg-gray-900/50 rounded-lg p-6 border border-gray-700"
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.4)',
              }}
              whileHover={{ rotateX: -2, z: 10, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)' }}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-bold text-red-400">{meal.name}</h4>
                <motion.div
                  className="text-right"
                  whileHover={{ scale: 1.1, z: 15 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <p className="text-sm text-gray-400">Calories</p>
                  <p className="font-bold">{meal.calories}</p>
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Food Items:</p>
                  <ul className="space-y-2">
                    {meal.items.map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <span className="text-red-500 mr-2">•</span>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <motion.div
                    className="bg-gray-800 rounded-lg p-4 text-center"
                    whileHover={{ scale: 1.05, rotateY: 5, z: 20 }}
                    style={{ transformStyle: 'preserve-3d', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)' }}
                  >
                    <p className="text-sm text-gray-400">Protein</p>
                    <p className="text-2xl font-bold text-green-400">{meal.protein}</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Nutrition Tips */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 15px 35px -10px rgba(239, 68, 68, 0.15)',
          }}
        >
          <h4 className="text-xl font-bold mb-4">💡 Nutrition Tips</h4>
          <ul className="space-y-2 text-gray-300">
            {[
              'Drink at least 3-4 liters of water daily',
              'Eat meals every 3-4 hours to maintain metabolism',
              'Adjust portions based on your activity level',
              'Include a variety of colorful vegetables for micronutrients',
              'Get adequate sleep (7-9 hours) for optimal recovery',
            ].map((tip, index) => (
              <motion.li
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + 0.1 * index }}
                whileHover={{ x: 5 }}
              >
                <span className="text-red-500 mr-2">✓</span>
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {showAdminModal && userRole === 'trainer' && (
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
                onClick={() => setShowAdminModal(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-gray-900 border border-gray-700 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                >
                <h3 className="text-2xl font-bold mb-4">Add Diet Plan</h3>
                <form onSubmit={handleCreateDietPlan} className="space-y-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="Plan name"
                    required
                  />
                  <input
                    type="text"
                    value={formData.goal}
                    onChange={(e) => setFormData((p) => ({ ...p, goal: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="Goal (e.g. Muscle Gain)"
                    required
                  />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="Description"
                    rows={3}
                    required
                  />
                  <input
                    type="number"
                    value={formData.totalCalories}
                    onChange={(e) => setFormData((p) => ({ ...p, totalCalories: Number(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="Total calories"
                    required
                  />

                  {(['breakfast', 'midMorning', 'lunch', 'evening', 'dinner'] as const).map((mealKey) => (
                    <div key={mealKey} className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 space-y-2">
                      <p className="font-semibold capitalize">{mealKey}</p>
                      <input
                        type="text"
                        value={formData.meals[mealKey].name}
                        onChange={(e) => updateMeal(mealKey, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                        placeholder="Meal name"
                        required
                      />
                      <input
                        type="text"
                        value={formData.meals[mealKey].items.join(', ')}
                        onChange={(e) =>
                          updateMeal(
                            mealKey,
                            'items',
                            e.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                        placeholder="Items (comma separated)"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={formData.meals[mealKey].calories}
                          onChange={(e) => updateMeal(mealKey, 'calories', Number(e.target.value) || 0)}
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                          placeholder="Calories"
                          required
                        />
                        <input
                          type="text"
                          value={formData.meals[mealKey].protein}
                          onChange={(e) => updateMeal(mealKey, 'protein', e.target.value)}
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                          placeholder="Protein (e.g. 25g)"
                          required
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Save Diet Plan'}
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
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}


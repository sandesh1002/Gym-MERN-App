import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Exercises } from './components/Exercises';
import { DietPlan } from './components/DietPlan';
import { Progress } from './components/Progress';
import SubscriptionPlans from './components/SubscriptionPlans';
import { FloatingElement } from './components/3d';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [dailyGoals, setDailyGoals] = useState({
    workout: false,
    hydration: false,
    sleep: false,
  });

  const todayKey = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
  }, []);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const savedGoals = localStorage.getItem(`daily-goals-${todayKey}`);
    if (savedGoals) {
      try {
        setDailyGoals(JSON.parse(savedGoals));
      } catch {
        setDailyGoals({ workout: false, hydration: false, sleep: false });
      }
    } else {
      setDailyGoals({ workout: false, hydration: false, sleep: false });
    }
  }, [isLoggedIn, todayKey]);

  useEffect(() => {
    if (!isLoggedIn) return;
    localStorage.setItem(`daily-goals-${todayKey}`, JSON.stringify(dailyGoals));
  }, [dailyGoals, isLoggedIn, todayKey]);

  const handleLogin = (token, userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleSignup = (token, userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleGoalToggle = (goalKey) => {
    setDailyGoals((prev) => ({
      ...prev,
      [goalKey]: !prev[goalKey],
    }));
  };

  const completedGoals = Object.values(dailyGoals).filter(Boolean).length;
  const goalCompletionPercent = Math.round((completedGoals / 3) * 100);
const pathToPage = {
    '/': 'home',
    '/login': 'login',
    '/signup': 'signup',
    '/exercises': 'exercises',
    '/diet-plan': 'diet',
    '/progress': 'progress',
    '/subscriptions': 'subscriptions',
  };
  const pageToPath = {
    home: '/',
    login: '/login',
    signup: '/signup',
    exercises: '/exercises',
    diet: '/diet-plan',
    progress: '/progress',
    subscriptions: '/subscriptions',
  };
  const currentPage = pathToPage[location.pathname] || 'home';

  const navigateToPage = (page) => {
    navigate(pageToPath[page] || '/');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20, rotateX: 10 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    exit: { opacity: 0, y: -20, rotateX: -10 },
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black text-white" style={{ perspective: 1200 }}>
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="bg-black/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <motion.div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => navigateToPage('home')}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Logo Image */}
                <img 
                  src="/path-to-your-logo.png" 
                  alt="FitZone Gym Logo" 
                  className="h-10 w-10 object-contain"
                />
                <h1 className="text-2xl font-bold text-red-500">
                  FitZone Gym
                </h1>
              </motion.div>
{isLoggedIn && (
                <div className="hidden md:flex space-x-4">
                  <motion.button
                    onClick={() => navigateToPage('subscriptions')}
                    className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05, z: 20 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    Membership
                  </motion.button>
                  <motion.button
                    onClick={() => navigateToPage('exercises')}
                    className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05, z: 20 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    Exercises
                  </motion.button>
                  <motion.button
                    onClick={() => navigateToPage('diet')}
                    className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05, z: 20 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    Diet Plan
                  </motion.button>
                  <motion.button
                    onClick={() => navigateToPage('progress')}
                    className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05, z: 20 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    Progress
                  </motion.button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn && user && (
                <span className="text-sm text-gray-400 hidden sm:inline">
                  Welcome, {user.name}
                </span>
              )}
              {!isLoggedIn ? (
                <>
                  <motion.button
                    onClick={() => navigateToPage('login')}
                    className="px-6 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    whileHover={{ scale: 1.05, rotateY: -5, z: 20 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    Login
                  </motion.button>
                  <motion.button
                    onClick={() => navigateToPage('signup')}
                    className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-all"
                    whileHover={{ scale: 1.05, rotateY: 5, z: 20 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    Sign Up
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  whileHover={{ scale: 1.05, rotateY: -5, z: 20 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  Logout
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {currentPage === 'home' && (
            <div className="relative">
              {/* Hero Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                  {/* Large Logo in Hero Section */}
                  <FloatingElement duration={4} distance={10}>
                    <motion.img 
                      src="/path-to-your-logo.png" 
                      alt="FitZone Gym" 
                      className="h-32 w-32 mx-auto mb-8 object-contain"
                      initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    />
                  </FloatingElement>
                  
                  <FloatingElement duration={4} distance={10}>
                    <h2 className="text-5xl md:text-7xl font-bold mb-6" style={{ transformStyle: 'preserve-3d' }}>
                      <motion.span
                        initial={{ opacity: 0, rotateX: -30, z: -100 }}
                        animate={{ opacity: 1, rotateX: 0, z: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ display: 'inline-block', transformStyle: 'preserve-3d' }}
                      >
                        Transform Your{' '}
                      </motion.span>
                      <motion.span
                        className="text-red-500"
                        initial={{ opacity: 0, rotateX: -30, z: -100 }}
                        animate={{ opacity: 1, rotateX: 0, z: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        style={{ display: 'inline-block', transformStyle: 'preserve-3d' }}
                      >
                        Body
                      </motion.span>
                    </h2>
                  </FloatingElement>
                  <motion.p
                    className="text-xl md:text-2xl text-gray-300 mb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    Premium Gym Experience | Expert Trainers | Results Guaranteed
                  </motion.p>
                  {!isLoggedIn && (
                    <motion.button
                      onClick={() => navigateToPage('signup')}
                      className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-lg text-lg font-semibold transition-all"
                      initial={{ opacity: 0, y: 30, rotateX: 20 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      whileHover={{ scale: 1.1, rotateY: 5, z: 30, boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      Start Your Journey
                    </motion.button>
                  )}

                  {isLoggedIn && (
                    <motion.div
                      className="mt-12 max-w-2xl mx-auto text-left bg-gray-900/60 border border-gray-700 rounded-2xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">Daily Goals</h3>
                        <span className="text-sm px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                          {goalCompletionPercent}% complete
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { key: 'workout', label: 'Complete a workout session', icon: '🏋️' },
                          { key: 'hydration', label: 'Drink 2+ liters of water', icon: '💧' },
                          { key: 'sleep', label: 'Sleep at least 7 hours', icon: '😴' },
                        ].map((goal) => (
                          <button
                            key={goal.key}
                            type="button"
                            onClick={() => handleGoalToggle(goal.key)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                              dailyGoals[goal.key]
                                ? 'bg-green-500/10 border-green-500/40 text-green-300'
                                : 'bg-gray-800/70 border-gray-700 hover:border-red-500/50'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span>{goal.icon}</span>
                              <span>{goal.label}</span>
                            </span>
                            <span className="text-lg">{dailyGoals[goal.key] ? '✅' : '⬜'}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

{/* Features */}
                <div className="grid md:grid-cols-4 gap-8 mt-20" style={{ perspective: 1000 }}>
                  <motion.div
                    initial={{ opacity: 0, rotateY: -30, z: -100 }}
                    animate={{ opacity: 1, rotateY: 0, z: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    whileHover={{ z: 40, rotateY: -5, scale: 1.03 }}
                  >
                    <div
                      onClick={() => navigateToPage('subscriptions')}
                      className="bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700 hover:border-red-500 transition-all h-full cursor-pointer"
                      style={{
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div className="text-4xl mb-4">👑</div>
                      <h3 className="text-xl font-bold mb-2">Membership</h3>
                      <p className="text-gray-400">Choose from our premium plans</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, rotateY: -10, z: -100 }}
                    animate={{ opacity: 1, rotateY: 0, z: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    whileHover={{ z: 40, rotateY: -5, scale: 1.03 }}
                  >
                    <div
                      onClick={() => isLoggedIn && navigateToPage('exercises')}
                      className={`bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700 hover:border-red-500 transition-all h-full ${isLoggedIn ? 'cursor-pointer' : 'opacity-75'}`}
                      style={{
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div className="text-4xl mb-4">🏋️</div>
                      <h3 className="text-xl font-bold mb-2">Expert Exercises</h3>
                      <p className="text-gray-400">Video demonstrations for perfect form</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, rotateY: 0, z: -100 }}
                    animate={{ opacity: 1, rotateY: 0, z: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    whileHover={{ z: 40, rotateY: 0, scale: 1.03 }}
                  >
                    <div
                      onClick={() => isLoggedIn && navigateToPage('diet')}
                      className={`bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700 hover:border-red-500 transition-all h-full ${isLoggedIn ? 'cursor-pointer' : 'opacity-75'}`}
                      style={{
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div className="text-4xl mb-4">🥗</div>
                      <h3 className="text-xl font-bold mb-2">Diet Plans</h3>
                      <p className="text-gray-400">Customized nutrition guidance</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, rotateY: 30, z: -100 }}
                    animate={{ opacity: 1, rotateY: 0, z: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    whileHover={{ z: 40, rotateY: 5, scale: 1.03 }}
                  >
                    <div
                      onClick={() => isLoggedIn && navigateToPage('progress')}
                      className={`bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700 hover:border-red-500 transition-all h-full ${isLoggedIn ? 'cursor-pointer' : 'opacity-75'}`}
                      style={{
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div className="text-4xl mb-4">💪</div>
                      <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                      <p className="text-gray-400">Monitor your fitness journey</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

{currentPage === 'login' && <Login onLogin={handleLogin} onSwitchToSignup={() => navigateToPage('signup')} />}
          {currentPage === 'signup' && <Signup onSignup={handleSignup} onSwitchToLogin={() => navigateToPage('login')} />}
          {currentPage === 'subscriptions' && <SubscriptionPlans />}
          {currentPage === 'exercises' && <Exercises />}
          {currentPage === 'diet' && <DietPlan />}
          {currentPage === 'progress' && <Progress />}
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 FitZone Gym. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
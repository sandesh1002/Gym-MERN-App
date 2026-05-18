import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

interface SignupProps {
  onSignup: (token: string, user: { _id: string; name: string; email: string; role?: string }) => void;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [signupType, setSignupType] = useState<'user' | 'trainer'>('user');
  const [trainerId, setTrainerId] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const data =
        signupType === 'trainer'
          ? await api.trainerSignup(trainerId, trainerName, password)
          : await api.register(name, email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
      onSignup(data.token, { _id: data._id, name: data.name, email: data.email });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4" style={{ perspective: 1200 }}>
      <motion.div
        initial={{ opacity: 0, rotateX: 20, z: -200 }}
        animate={{ opacity: 1, rotateX: 0, z: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ transformStyle: 'preserve-3d', maxWidth: '28rem', width: '100%' }}
      >
        <div
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-8"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Join FitZone
          </motion.h2>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setSignupType('user');
                setError('');
              }}
              className={`py-2 rounded-lg border transition-colors ${
                signupType === 'user'
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-red-500'
              }`}
            >
              Normal Signup
            </button>
            <button
              type="button"
              onClick={() => {
                setSignupType('trainer');
                setError('');
              }}
              className={`py-2 rounded-lg border transition-colors ${
                signupType === 'trainer'
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-red-500'
              }`}
            >
              Trainer Signup
            </button>
          </div>

          {error && (
            <motion.div
              className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {signupType === 'trainer' && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium mb-2">Trainer ID</label>
                <input
                  type="text"
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Enter trainer ID"
                  required={signupType === 'trainer'}
                  disabled={loading}
                />
              </motion.div>
            )}

            {signupType === 'user' && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="John Doe"
                  required={signupType === 'user'}
                  disabled={loading}
                />
              </motion.div>
            )}

            {signupType === 'trainer' ? (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium mb-2">
                  Trainer Name
                </label>
                <input
                  type="text"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Trainer name"
                  required={signupType === 'trainer'}
                  disabled={loading}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="your@email.com"
                  required={signupType === 'user'}
                  disabled={loading}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.03, z: 20, boxShadow: '0 10px 30px -10px rgba(239, 68, 68, 0.5)' }}
              whileTap={{ scale: 0.97 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {signupType === 'trainer' ? 'Trainer Sign Up' : 'Sign Up'}
            </motion.button>
          </form>

          <motion.p
            className="text-center mt-6 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Already have an account?{' '}
            <motion.button
              onClick={onSwitchToLogin}
              className="text-red-500 hover:text-red-400 font-semibold"
              whileHover={{ scale: 1.05 }}
            >
              Login
            </motion.button>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

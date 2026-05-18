import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FloatingElement } from './3d';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  originalPrice?: number;
  features: string[];
  isPopular: boolean;
  category: string;
}

interface UserSubscription {
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState('');
  const [razorpayKey, setRazorpayKey] = useState('');

  useEffect(() => {
    fetchPlans();
    fetchMySubscription();
    fetchRazorpayKey();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await api.getSubscriptionPlans();
      setPlans(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load plans');
      setLoading(false);
    }
  };

  const fetchMySubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await api.getMySubscription(token);
      if (data && data.status === 'active') {
        setUserSubscription(data);
      }
    } catch (err) {
      // No subscription found - that's okay
    }
  };

  const fetchRazorpayKey = async () => {
    try {
      const data = await api.getRazorpayKey();
      setRazorpayKey(data.keyId);
    } catch (err) {
      console.error('Failed to get Razorpay key:', err);
    }
  };

  const handleSubscribe = async (planId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to subscribe');
      return;
    }

    if (!razorpayKey || razorpayKey === 'your_key_id') {
      // Demo mode - simulate payment (for testing without real Razorpay)
      setSubscribing(planId);
      setError('');
      setSubscribeSuccess('');

      try {
        await api.subscribe(token, { planId });
        setSubscribeSuccess('Subscription activated successfully!');
        fetchMySubscription();
      } catch (err: any) {
        setError(err.message || 'Failed to subscribe');
      } finally {
        setSubscribing(null);
      }
      return;
    }

    setSubscribing(planId);
    setError('');
    setSubscribeSuccess('');

    try {
      // Step 1: Create Razorpay order
      const orderData = await api.createPaymentOrder(token, planId);
      const { orderId, amount } = orderData;

      // Step 2: Open Razorpay checkout
      const rzId = razorpayKey || 'your_key_id';
      
      const razorpayInstance = new window.Razorpay({
        key: rzId,
        order_id: orderId,
        amount: amount,
        currency: 'INR',
        name: 'FitZone Gym',
        description: 'Gym Membership',
        image: '/path-to-your-logo.png',
        handler: async (response: any) => {
          // Step 3: Verify payment
          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: planId,
            };

            const result = await api.verifyPayment(token, verifyData);
            setSubscribeSuccess(result.message || 'Payment successful! Subscription activated.');
            fetchMySubscription();
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
          }
          setSubscribing(null);
        },
        prefill: {
          name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).name : '',
          email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : '',
        },
        theme: {
          color: '#dc2626',
        },
      });

      razorpayInstance.on('payment.failed', (response: any) => {
        setError(`Payment failed: ${response.description}`);
        setSubscribing(null);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      setSubscribing(null);
    }
  };

  const handleCancelSubscription = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await api.cancelSubscription(token);
      setUserSubscription(null);
      setSubscribeSuccess('Subscription cancelled successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDurationText = (duration: number) => {
    if (duration === 1) return '1 Month';
    if (duration === 3) return '3 Months';
    if (duration === 6) return '6 Months';
    if (duration === 12) return '12 Months';
    return `${duration} Months`;
  };

  const getPlanColor = (category: string) => {
    switch (category) {
      case 'basic':
        return { border: 'border-amber-600', bg: 'from-amber-700 to-amber-900', text: 'text-amber-400', btn: 'from-amber-600 to-amber-700' };
      case 'standard':
        return { border: 'border-gray-400', bg: 'from-gray-500 to-gray-700', text: 'text-gray-300', btn: 'from-gray-500 to-gray-600' };
      case 'premium':
        return { border: 'border-yellow-500', bg: 'from-yellow-600 to-yellow-800', text: 'text-yellow-400', btn: 'from-yellow-500 to-yellow-600' };
      case 'vip':
        return { border: 'border-purple-500', bg: 'from-purple-600 to-purple-900', text: 'text-purple-400', btn: 'from-purple-500 to-purple-600' };
      default:
        return { border: 'border-red-500', bg: 'from-red-600 to-red-800', text: 'text-red-400', btn: 'from-red-600 to-red-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Choose Your <span className="text-red-500">Plan</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Select the perfect membership plan tailored to your fitness goals
        </p>
        {(razorpayKey === 'your_key_id' || !razorpayKey) && (
          <p className="text-xs text-amber-400 mt-2">
            ⚠️ Demo Mode: Payment is simulated for testing
          </p>
        )}
      </motion.div>

      {/* Current Subscription Status */}
      {userSubscription && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-green-400">Active Membership</h3>
              <p className="text-white">{userSubscription.planName} Plan</p>
              <p className="text-sm text-gray-400">
                Valid until {formatDate(userSubscription.endDate)}
              </p>
            </div>
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      <AnimatePresence>
        {subscribeSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-green-400 text-center"
          >
            {subscribeSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => {
          const colors = getPlanColor(plan.category);
          
          return (
<FloatingElement duration={3 + index * 0.2} distance={15}>
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, rotateY: -30, z: -100 }}
                animate={{ opacity: 1, rotateY: 0, z: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-gray-900/80 backdrop-blur rounded-2xl border-2 overflow-hidden h-full ${
                  plan.isPopular 
                    ? `${colors.border} ring-2 ring-red-500/50` 
                    : `${colors.border} border-gray-700`
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: plan.isPopular 
                    ? '0 0 40px rgba(239, 68, 68, 0.3)' 
                    : '0 10px 30px -10px rgba(0,0,0,0.5)',
                }}
                whileHover={{
                  z: 40, 
                  rotateY: plan.isPopular ? 0 : -5, 
                  scale: 1.02,
                  boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)'
                }}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    POPULAR
                  </div>
                )}

                {/* Plan Header */}
                <div className={`bg-gradient-to-r ${colors.bg} p-6`}>
                  <h3 className={`text-2xl font-bold ${colors.text}`}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">{plan.description}</p>
                </div>

                {/* Plan Body */}
                <div className="p-6">
                  {/* Price */}
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{plan.originalPrice}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                      <span className="text-gray-400">/{getDurationText(plan.duration)}</span>
                    </div>
                    {plan.originalPrice && (
                      <span className="text-xs text-green-400 ml-2">
                        Save ₹{plan.originalPrice - plan.price}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(plan._id)}
                    disabled={subscribing === plan._id || (userSubscription?.status === 'active')}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
                        : `bg-gradient-to-r ${colors.btn} text-white hover:opacity-90`
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {subscribing === plan._id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Processing...
                      </span>
                    ) : userSubscription?.status === 'active' ? (
                      'Current Plan'
                    ) : (
                      'Choose Plan'
                    )}
                  </button>
                </div>
              </motion.div>
            </FloatingElement>
          );
        })}
      </div>

      {/* Payment Methods Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <p className="text-gray-400 text-sm mb-4">Secure payments powered by</p>
        <div className="flex justify-center items-center gap-4">
          <span className="text-2xl font-bold text-gray-500">Razorpay</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          We accept UPI, Cards, Wallets, and Net Banking
        </p>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 max-w-3xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {[
            {
              q: 'Can I upgrade my plan later?',
              a: 'Yes! You can upgrade your plan at any time. The new plan will be activated immediately with prorated billing.',
            },
            {
              q: 'Is there a joining fee?',
              a: 'No, there are no joining fees for any of our membership plans.',
            },
            {
              q: 'Can I pause my membership?',
              a: 'Yes, you can freeze your membership for up to 30 days per year for medical or travel reasons.',
            },
            {
              q: 'What payment methods are accepted?',
              a: 'We accept all major credit/debit cards, UPI, digital wallets, and net banking through Razorpay.',
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
            >
              <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
              <p className="text-gray-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

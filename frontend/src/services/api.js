const API_BASE_URL =
  (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : '/api';


export const api = {
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },


  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
    return data;
  },


  async trainerLogin(trainerId, trainerName, password) {
    const res = await fetch(`${API_BASE_URL}/auth/trainer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, trainerName, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Trainer login failed');
    return data;
  },

  async trainerSignup(trainerId, trainerName, password) {
    const res = await fetch(`${API_BASE_URL}/auth/trainer-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, trainerName, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Trainer signup failed');
    return data;
  },


  async getMe(token) {

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get user');
    return data;
  },

  async getExercises(category = 'All') {
    const url = category === 'All'
      ? `${API_BASE_URL}/exercises`
      : `${API_BASE_URL}/exercises?category=${encodeURIComponent(category)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch exercises');
    return data;
  },


  async getDietPlans() {
    const res = await fetch(`${API_BASE_URL}/diet-plans`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch diet plans');
    return data;
  },

  async createExercise(exerciseData, token) {
    const res = await fetch(`${API_BASE_URL}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(exerciseData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create exercise');
    return data;
  },

  async updateExercise(id, exerciseData, token) {
    const res = await fetch(`${API_BASE_URL}/exercises/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(exerciseData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update exercise');
    return data;
  },

  async deleteExercise(id, token) {
    const res = await fetch(`${API_BASE_URL}/exercises/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete exercise');
    return data;
  },

  async createDietPlan(dietData, token) {
    const res = await fetch(`${API_BASE_URL}/diet-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dietData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create diet plan');
    return data;
  },

  async updateDietPlan(id, dietData, token) {
    const res = await fetch(`${API_BASE_URL}/diet-plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dietData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update diet plan');
    return data;
  },

  async deleteDietPlan(id, token) {
    const res = await fetch(`${API_BASE_URL}/diet-plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete diet plan');
    return data;
  },

  async logWorkout(token, workoutData) {

    const res = await fetch(`${API_BASE_URL}/progress/workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(workoutData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to log workout');
    return data;
  },

  async logWeight(token, weightData) {
    const res = await fetch(`${API_BASE_URL}/progress/weight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(weightData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to log weight');
    return data;
  },

  async getProgress(token) {
    const res = await fetch(`${API_BASE_URL}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch progress');
    return data;
  },

  async getProgressStats(token) {
    const res = await fetch(`${API_BASE_URL}/progress/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data;
  },

async deleteProgressEntry(token, id) {
    const res = await fetch(`${API_BASE_URL}/progress/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete entry');
    return data;
  },


  // Subscription Plans
  async getSubscriptionPlans() {
    const res = await fetch(`${API_BASE_URL}/subscriptions/plans`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch plans');
    return data;
  },


  async getMySubscription(token) {
    const res = await fetch(`${API_BASE_URL}/subscriptions/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'No subscription found');
    return data;
  },


  async subscribe(token, planData) {
    const res = await fetch(`${API_BASE_URL}/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(planData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to subscribe');
    return data;
  },


async cancelSubscription(token) {
    const res = await fetch(`${API_BASE_URL}/subscriptions/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel subscription');
    return data;
  },


  // Payment Methods (Razorpay)
  async getRazorpayKey() {
    const res = await fetch(`${API_BASE_URL}/payments/key`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get key');
    return data;
  },


  async createPaymentOrder(token, planId) {
    const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create order');
    return data;
  },


  async verifyPayment(token, paymentData) {
    const res = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Payment verification failed');
    return data;
  },
};


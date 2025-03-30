import React, { useState, useEffect } from 'react';
import './SubscribeForm.css';
import Navbar from "../components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/Firebase";

function SubscribeForm() {
  const [mobileDimension, setMobileDimension] = useState(false);
  const [user, setUser] = useState();
  const [planId, setPlanId] = useState('price_1R7njCF2kI0aSHJWLHIkZrpk');
  const [planName, setPlanName] = useState('Cookr+');
  const [planPrice, setPlanPrice] = useState('$5/month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      setMobileDimension(window.innerWidth < 768);
    };
    
    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser?.email);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePlanChange = (e) => {
    const selectedPlanId = e.target.value;
    setPlanId(selectedPlanId);

    // Set the plan name and price based on the selected plan ID
    if (selectedPlanId === 'price_1R7njCF2kI0aSHJWLHIkZrpk') {
      setPlanName('Cookr+');
      setPlanPrice('$5/month');
    } else if (selectedPlanId === 'price_1R7nl5F2kI0aSHJW59k0yIm3') {
      setPlanName('Cookr Pro');
      setPlanPrice('$45/yearly');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create checkout session directly
      const response = await fetch('http://localhost:5001/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          planName: planName,
          planPrice: planPrice,
          email: user
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Switch to Premium</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Get access to all premium features
          </p>
          
          <select
            value={planId}
            onChange={handlePlanChange}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          >
            <option value="price_1R7njCF2kI0aSHJWLHIkZrpk">Cookr+ ($5/month)</option>
            <option value="price_1R7nl5F2kI0aSHJW59k0yIm3">Cookr Pro ($45/yearly)</option>
          </select>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-xl font-semibold text-gray-900">{planPrice}</p>
            <p className="text-sm text-gray-600">Cancel anytime</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : 'Switch Over'}
        </button>
      </form>
    </div>
  );
}

export default SubscribeForm;

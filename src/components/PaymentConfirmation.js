import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase/Firebase";
import { auth } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

function PaymentConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setEmail(currentUser?.email);
    });
    console.log("Email:", email);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handlePaymentConfirmation = async () => {
      try {
        // Get plan info from URL
        const searchParams = new URLSearchParams(location.search);
        console.log("Full URL search params:", location.search);
        
        // Get all parameters
        const planId = searchParams.get('planId');
        const planName = searchParams.get('planName');
        const clientSecret = searchParams.get('payment_intent_client_secret');
        
        console.log("Retrieved parameters:", {
          planId,
          planName,
          clientSecret
        });

        if (!planId || !planName) {
          setError('Invalid payment confirmation link.');
          return;
        }

        // Verify the payment status using the client secret
        const stripe = await stripePromise;
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
        
        if (!paymentIntent) {
          setError('Payment verification failed.');
          return;
        }

        console.log("Payment intent details:", paymentIntent);

        // Verify the payment belongs to the current user
        if (!paymentIntent.metadata?.email && !paymentIntent.receipt_email) {
          setError('Payment verification failed: No email found in payment details.');
          return;
        }

        const paymentEmail = paymentIntent.metadata?.email || paymentIntent.receipt_email;
        if (paymentEmail !== email) {
          setError('Invalid payment. This payment was made by a different user.');
          return;
        }

        if (paymentIntent.status === 'succeeded') {
          console.log("Payment succeeded! Updating Firestore...");
          try {
            // Ensure email is properly formatted
            const userEmail = email?.toLowerCase()?.trim();
            if (!userEmail) {
              setError('User email not found.');
              return;
            }

            const userRef = doc(db, "users", userEmail);
            console.log("User document reference:", userRef.path);
            
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
              setError('User not found.');
              return;
            }

            // Check if user already has an active subscription
            if (userDoc.data().subscription) {
              setError('You already have an active subscription.');
              return;
            }

            await updateDoc(userRef, {
              subscription: true,
              plan: planName,
              planId: planId
            });
            
            console.log("Firestore document updated successfully!");
            setStatus('success');
            setPlanInfo({ name: planName, id: planId });
          } catch (firestoreError) {
            console.log("Error updating Firestore:", firestoreError);
            setError("Error updating subscription status. Please contact support.");
          }
        } else if (paymentIntent.status === 'processing') {
          setStatus('processing');
        } else {
          setError('Payment failed. Please try again.');
        }
      } catch (err) {
        console.log("Error processing payment:", err);
        setError('An unexpected error occurred.');
      }
    };

    handlePaymentConfirmation();
  }, [location, email]);

  const handleReturnToProfile = () => {
    window.location.href = '/#/profile';
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      {status === 'processing' && (
        <div>
          <h2>Processing your payment...</h2>
          <p>Please wait while we confirm your payment.</p>
        </div>
      )}
      
      {status === 'success' && planInfo && (
        <div>
          <h2 style={{ color: 'green' }}>Payment Successful!</h2>
          <p>Your {planInfo.name} subscription has been activated.</p>
          <button 
            onClick={handleReturnToProfile}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Return to Profile
          </button>
        </div>
      )}
      
      {error && (
        <div style={{ color: 'red' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            onClick={handleReturnToProfile}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Return to Profile
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentConfirmation; 
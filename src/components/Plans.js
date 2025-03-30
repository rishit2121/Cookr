import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { async } from "@firebase/util";
import CheckMark from "./mini_components/green_check"
import CrossMark from "./mini_components/cross_mark"
import { Elements } from '@stripe/react-stripe-js';
import { auth, db } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

const Plans = ({ planType }) => {
  const item = {
    price: "price_1PnC5hKU472eG61vQgz1hUnm",
    quantity: 1,
  };
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [userPlanId, setUserPlanId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [prices, setPrices] = useState({
    monthly: { id: '', amount: '', interval: 'month' },
    yearly: { id: '', amount: '', interval: 'year' }
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('http://localhost:5001/stripe/prices');
        const data = await response.json();
        
        if (data.success) {
          const monthlyPrice = data.prices.find(p => p.interval === 'month');
          const yearlyPrice = data.prices.find(p => p.interval === 'year');
          
          setPrices({
            monthly: {
              id: monthlyPrice.id,
              amount: (monthlyPrice.unit_amount / 100).toFixed(2),
              interval: 'month'
            },
            yearly: {
              id: yearlyPrice.id,
              amount: (yearlyPrice.unit_amount / 100).toFixed(2),
              interval: 'year'
            }
          });
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
        setStripeError('Error loading prices. Please try again later.');
      }
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        // Get user's subscription status and plan from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.email));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserPlan(userData.plan);
          setUserPlanId(userData.planId);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const checkoutOptions = {
    lineItems: [item],
    mode: "payment",
    successUrl: `${window.location.origin}/`,
    cancelUrl: `${window.location.origin}/`,
  };

  const handleSwitchToFree = async () => {
    setLoading(true);
    try {
      console.log('Attempting to cancel subscription for:', userEmail);
      const response = await fetch('http://localhost:5001/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });

      const data = await response.json();
      console.log('Cancel subscription response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Update local state
      setUserPlan('Free');
      setUserPlanId(null);
      setShowConfirmDialog(false);
      console.log('Successfully switched to free plan');
    } catch (error) {
      console.error('Detailed error in handleSwitchToFree:', error);
      console.error('Error stack:', error.stack);
      setStripeError('Error cancelling subscription. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchPlan = async (planId, planName, planPrice) => {
    if (!userEmail) {
      setStripeError('Please sign in to continue with the payment');
      return;
    }

    // If switching to free plan, show confirmation dialog
    if (planName === 'Free') {
      setShowConfirmDialog(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          planName,
          planPrice,
          email: userEmail
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
      setStripeError('Error connecting to payment service. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Bottom Sheet Dialog Component
  const BottomSheet = ({ show, onClose, children }) => {
    if (!show) return null;

    return (
      <div style={{
        position: 'fixed',
        bottom: '75px',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        padding: '20px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease-out',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginBottom: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    );
  };

  // Confirmation Dialog Component
  const ConfirmDialog = ({ show, onClose, onConfirm, loading }) => {
    if (!show) return null;

    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
        zIndex: 1000,
        width: '400px',
      }}>
        <h2 style={{ marginBottom: '20px' }}>Confirm Switch to Free Plan</h2>
        <p style={{ marginBottom: '20px' }}>
          Are you sure you want to switch to the Free plan? You will lose access to premium features.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: loading ? '#cccccc' : '#ff9900',
              color: 'black',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Processing...' : 'Confirm Switch'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        margin: "0px 00px",
        display: "flex",
        flexDirection: "row",
        overflowY:'visible',
        overflowX: "auto",
        paddingBottom: "20px",
        width:'100%',
        height:'calc(100dvh - 50px)',
        alignItems: isMobile?'center': 'initial',
      }}
    >
      <div
        style={{
          width: "300px",
          height:'fit-content',
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "10px",
          background: "#fcfcfc",
          borderRadius: "10px",
          outline: "1px solid gainsboro",
          marginTop: "3.5%",
          flex: "0 0 auto",
          marginLeft:'5%',
        }}
      >
        <h1 style={{marginTop:'0%'}}>Free</h1>
        <br></br>
        <br></br>
        <h1
          style={{
            fontSize: "60px",
            borderTop: "1px solid blue",
            borderBottom: "1px solid blue",
          }}
        >
          $0
          <span style={{ fontSize: "15px", fontWeight: "normal" }}>
            /forever
          </span>
        </h1>
        <br></br>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: "35px",
            listStyle: "none",
          }}
        >
          <li> <div style={{display:'flex', }}><CheckMark></CheckMark> Unlimited Scrolling</div></li>
          <li>
          <div style={{display:'flex', }}><CheckMark></CheckMark>Unlimted Subjects</div>
          <li><div style={{display:'flex', }}><CheckMark></CheckMark>Save Scrolls</div></li>

            {/* <span style={{ fontSize: "10px" }}> (Till September 5th)</span> */}
          </li>
          {/* <li><div style={{display:'flex', }}><CrossMark></CrossMark> Save Scrolls</li> */}
          <li><div style={{display:'flex', }}><CrossMark></CrossMark> Infinite Note Uploads</div></li>
          <li><div style={{display:'flex', }}><CrossMark></CrossMark> AI Tutor Bot</div></li>
          {/* <li><div style={{display:'flex', }}><CrossMark></CrossMark> No Priority Customer Support</li> */}
          <li><div style={{display:'flex', width:'200px'}}><CrossMark></CrossMark> New Feature Access</div></li>
        </div>
        <button
          style={{
            width: "100%",
            padding: "4%",
            borderRadius: "100px",
            border: "none",
            color: "white",
            cursor: userPlan === 'Free' ? "not-allowed" : "pointer",
            marginTop: "24px",
            marginBottom:'7px',
            fontSize:'20px',
            backgroundColor: userPlan === 'Free' ? "#cccccc" : "#ff9900",
            color:'black',
            fontWeight:'bold'
          }}
          onClick={() => userPlan !== 'Free' && handleSwitchPlan(null, 'Free', '$0')}
          disabled={userPlan === 'Free'}
        >
          {userPlan === 'Free' ? "Current" : "Switch Over"}
        </button>
        
      </div>

      <div
        style={{
          width: "300px",
          height:'fit-content',
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "10px",
          background: "#fcfcfc",
          borderRadius: "10px",
          outline: "1px solid black",
          boxShadow: "5px 5px 1px 1px blue",
          marginTop: "2%",
          flex: "0 0 auto",
          marginLeft:'10%',
        }}
      >
        <h1 style={{ textShadow: "0px 0px 10px white" }}>Cookr+</h1>

        {/* <p style={{ fontSize: "14px" }}>For those to lock out, to lock in.</p> */}
        <br></br>
        <br></br>
        <h1
          style={{
            fontSize: "60px",
            borderTop: "1px solid blue",
            borderBottom: "1px solid blue",
          }}
        >
          $5
          <span style={{ fontSize: "15px", fontWeight: "normal" }}>/month</span>
        </h1>
        <br></br>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: "31px",
            listStyle: "none",
          }}
        >
          <li><div style={{display:'flex',width:'200px' }}><CheckMark></CheckMark> Everything in Standard</div></li>
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> Share Scrolls</div></li>
          {/* <li><div style={{display:'flex', }}><CheckMark></CheckMark> Save Scrolls</li> */}
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> Infinite Note Uploads </div></li>
          {/* <li>
            <div style={{display:'flex', }}><CheckMark></CheckMark> Access to Themes{" "}
            <span style={{ fontSize: "10px" }}>(Coming Soon)</span>
          </li> */}
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> Answer Explanations</div></li>
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> New Feature Access</div></li>
          {/* <li><div style={{display:'flex', }}><CheckMark></CheckMark> Priority Customer Support</li> */}
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> AI Tutor Bot </div></li>
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> New Feature Access </div></li>
        </div>
        <button
          style={{
            width: "100%",
            padding: "4%",
            borderRadius: "100px",
            border: "none",
            color: "white",
            cursor: userPlanId === 'price_1R7njCF2kI0aSHJWLHIkZrpk' ? "not-allowed" : "pointer",
            marginTop: "20px",
            fontSize:'20px',
            backgroundColor: userPlanId === 'price_1R7njCF2kI0aSHJWLHIkZrpk' ? "#cccccc" : "#ff9900",
            color:'black',
            fontWeight:'bold'
          }}
          onClick={() => userPlanId !== 'price_1R7njCF2kI0aSHJWLHIkZrpk' && handleSwitchPlan('price_1R7njCF2kI0aSHJWLHIkZrpk', 'Cookr+', '$5/month')}
          disabled={userPlanId === 'price_1R7njCF2kI0aSHJWLHIkZrpk'}
        >
          {userPlanId === 'price_1R7njCF2kI0aSHJWLHIkZrpk' ? "Current" : "Switch Over"}
        </button>
      </div>
      <div
        style={{
          width: "300px",
          height:'fit-content',
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "10px",
          background: "#fcfcfc",
          borderRadius: "10px",
          outline: "1px solid black",
          boxShadow: "5px 5px 1px 1px blue",
          flex: "0 0 auto",
          marginTop:'2%',
          marginLeft:'10%',
          overflowY:'visible'
        }}
      >
        <h1 style={{ textShadow: "0px 0px 10px white" }}>Cookr Elite</h1>
        <span class="sale">-25%</span>

        {/* <p style={{ fontSize: "14px" }}>You'll never touch TikTok again.</p> */}

        <h1
          style={{
            fontSize: "60px",
            borderTop: "1px solid blue",
            borderBottom: "1px solid blue",
          }}
        >
          $45.00
          <span style={{ fontSize: "15px", fontWeight: "normal" }}>
            /year
          </span>
        </h1>
        <br></br>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: "31px",
            listStyle: "none",
          }}
        >
          <li><div style={{display:'flex',width:'200px' }}><CheckMark></CheckMark> Everything in Standard</div></li>
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> Share Scrolls</div></li>
          {/* <li><div style={{display:'flex', }}><CheckMark></CheckMark> Save Scrolls</li> */}
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> Infinite Note Uploads </div></li>
          {/* <li>
            <div style={{display:'flex', }}><CheckMark></CheckMark> Access to Themes{" "}
            <span style={{ fontSize: "10px" }}>(Coming Soon)</span>
          </li> */}
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> Answer Explanations</div></li>
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> New Feature Access</div></li>
          {/* <li><div style={{display:'flex', }}><CheckMark></CheckMark> Priority Customer Support</li> */}
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> AI Tutor Bot </div></li>
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> New Feature Access </div></li>
          {/* <li>
            <div style={{display:'flex', }}><CheckMark></CheckMark> Exclusive Perks{" "}
            <span style={{ fontSize: "10px" }}>(more details coming soon)</span>
          </li> */}
        </div>
        <button
          style={{
            width: "100%",
            padding: "4%",
            borderRadius: "100px",
            border: "none",
            color: "white",
            cursor: userPlanId === 'price_1R7nl5F2kI0aSHJWLHIkZrpk' ? "not-allowed" : "pointer",
            marginTop: "24px",
            fontSize:'20px',
            backgroundColor: userPlanId === 'price_1R7nl5F2kI0aSHJWLHIkZrpk' ? "#cccccc" : "#ff9900",
            color:'black',
            fontWeight:'bold'
          }}
          onClick={() => userPlanId !== 'price_1R7nl5F2kI0aSHJWLHIkZrpk' && handleSwitchPlan('price_1R7nl5F2kI0aSHJWLHIkZrpk', 'Cookr Elite (Yearly)', '$45.00 per year')}
          disabled={userPlanId === 'price_1R7nl5F2kI0aSHJWLHIkZrpk'}
        >
          {userPlanId === 'price_1R7nl5F2kI0aSHJWLHIkZrpk' ? "Current" : "Switch Over"}
        </button>
      </div>

      {isMobile ? (
        <BottomSheet 
          show={showPaymentSheet} 
          onClose={() => setShowPaymentSheet(false)}
        >
          {/* Render payment section */}
        </BottomSheet>
      ) : (
        showPaymentSheet && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(0,0,0,0.2)',
            zIndex: 1000,
            width: '400px',
          }}>
            <button
              onClick={() => setShowPaymentSheet(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            {/* Render payment section */}
          </div>
        )
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleSwitchToFree}
        loading={loading}
      />
    </div>
  );
};

export default Plans;

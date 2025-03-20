import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import './SubscribeForm.css'; // Import the CSS for custom styles
import Navbar from "../components/Navbar";
import { useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase/Firebase";
import { auth} from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";


function SubscribeForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [mobileDimension, setMobileDimension] = useState(false);


  const [user, setUser] = useState();
  const [planId, setPlanId] = useState('price_1P9Kn2F2kI0aSHJWKnN6O8kf');
  const [planName, setPlanName] = useState('Scroller+');
  const [planPrice, setPlanPrice] = useState('$2/month');
  const [loading, setLoading] = useState(false);
  const [canMakePayment, setCanMakePayment] = useState(false);
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser.email);
      console.log(user)
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);
  // useEffect(() => {
  //   try {
  //     const document = onSnapshot(
  //       doc(db, "users", user),
  //       (doc) => {
  //         setName(doc.data().name);
  //         setEmail(doc.data().email);
  //         setPlanType(doc.data().plan);
  //         setReferalCode(doc.data().myCode)
  //       }
  //     );
  //   } catch (error) {
  //     alert("Error");
  //   }
  // }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);
    const amount = planPrice.includes('$') ? parseFloat(planPrice.replace(/[^0-9.]/g, '')) * 100 : 500;

    try {
      // Create a PaymentMethod
      const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: { email: user },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Send the payment method and plan ID to your server
      const response = await fetch('http://localhost:5001/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user,
          paymentMethodId: paymentMethod.id,
          planId: planId,
          amount: amount, 
        }),
      });

      const subscription = await response.json();

      if (subscription.error) {
        throw new Error(subscription.error);
      }

      const { clientSecret } = subscription;

      // Confirm the PaymentIntent on the client side
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret);

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        alert('Subscription successful!');
        
      }
    } catch (error) {
      alert(`Subscription failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRequestButtonClick = async () => {
    // Implement Payment Request Button logic
  };

  const handlePlanChange = (e) => {
    const selectedPlanId = e.target.value;
    const selectedPlanName = e.target.options[e.target.selectedIndex].text;
    setPlanId(selectedPlanId);
    setPlanName(selectedPlanName);

    // Set pricing based on selected plan using setPlanPrice
    if (selectedPlanId === 'price_1P9Kn2F2kI0aSHJWKnN6O8kf') {
      setPlanPrice('$5/month');
    } else if (selectedPlanId === 'price_1P9Kn2F2kI0aSHJWKnN6O8k') {
      setPlanPrice('$50/yearly');
    } else {
      setPlanPrice('');
    }                                        
  };
  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <div
      className="App"
      style={{ display: "flex", height: "100vh", overflow: "hidden",}}
    >
      {user ? (<Navbar setMobileDimension={setMobileDimension} />):<div></div>}
    <div style={{ display: 'flex', flexDirection: 'column',minHeight: '100vh', backgroundColor: '#f9f9f9', padding: '20px', width:"100%"}}>
      <div style={{display:"flex", flexDirection:"row"}}>
      <div style={{display:'flex', width:'70%', flexDirection:"column", alignItems:'center'}}>
        <h1 style={{ marginBottom: '20px', color: '#333', width:'100%' }}>What You're Getting</h1>
        {planName === 'Scroller+' ? (
        <div
        style={{
          alignContent:'center',
          width: "300px",
          height: "80%",
          marginTop:'3%',
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          background: "#fcfcfc",
          borderRadius: "10px",
          outline: "1px solid black",
          boxShadow: "5px 5px 1px 1px #6A6CFF",
          justifyContent:'center',
          alignItems:'center'
        }}
      >
        <h1 style={{ textShadow: "0px 0px 10px #82beff" }}>Scroller+</h1>

        <br></br>
        <p style={{ fontSize: "14px" }}>For those to lock out, to lock in.</p>
        <br></br>
        <h1
          style={{
            fontSize: "70px",
            borderTop: "1px solid #6A6CFF",
            borderBottom: "1px solid #6A6CFF",
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
            lineHeight: "35px",
            listStyle: "none",
          }}
        >
          <li>✅ Unlimited Scrolling</li>
          <li>✅ Unlimited Subjects</li>
          <li>✅ Save Scrolls</li>
          <li>✅ Access to Answer Explanations </li>
          <li>
            ✅ Access to Themes{" "}
            <span style={{ fontSize: "10px" }}>(Coming Soon)</span>
          </li>
          <li>✅ No Ads</li>
          <li>✅ Early Acccess to New Features</li>
          <li>✅ Priority Customer Support</li>
          <li>✅ Exclusive Newsletter </li>
        </div>
        {/* <button
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "black",
            borderRadius: "100px",
            border: "none",
            color: "white",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Coming Soon
        </button> */}
      </div>
        ) : (
          <div
        style={{
          width: "300px",
          height: "80%",
          marginTop:'3%',
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "10px",
          background: "#fcfcfc",
          borderRadius: "10px",
          outline: "1px solid black",
          boxShadow: "5px 5px 1px 1px #6A6CFF",
          alignItems:'center'
        }}
      >
        <h1 style={{ textShadow: "0px 0px 10px #82beff" }}>Cookr 4 Life</h1>
        <span class="sale">-25%</span>
        <br></br>
        <br></br>
        <p style={{ fontSize: "14px" }}>You'll never touch TikTok again.</p>
        <br></br>
        <h1
          style={{
            fontSize: "70px",
            borderTop: "1px solid #6A6CFF",
            borderBottom: "1px solid #6A6CFF",
          }}
        >
          $50
          <span style={{ fontSize: "15px", fontWeight: "normal" }}>
            / lifetime
          </span>
        </h1>
        <br></br>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: "40px",
            listStyle: "none",
          }}
        >
          <li>✅ Everything in Scroller+</li>
          <li>✅ Thank You Letter</li>
          <li>✅ Own Scroller Forever</li>
          <li>✅ Access to Answer Explanations </li>
          <li>
            ✅ Exclusive Perks{" "}
            <span style={{ fontSize: "10px" }}>(more details coming soon)</span>
          </li>
        </div>
        <button
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "black",
            borderRadius: "100px",
            border: "none",
            color: "white",
            cursor: "pointer",
            marginTop: "30px",
          }}
        >
          Coming Soon
        </button>
      </div>
        )}

      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '35%', height:"100%", marginLeft:"2%"}}>
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginRight: '0px', width:"1000%"}}>
          <h3 style={{display:'flex', marginBottom:"10%"}}>Continue With Payment</h3>
          <label htmlFor="cardNumber" style={{ marginBottom: '8px' }}>Choose a Plan</label>

          <form onSubmit={handleSubmit} className="subscribe-form">
          <select
            value={planId}
            onChange={handlePlanChange}
            required
            className="form-select"
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          >
            {/* <option value="">Select a plan</option> */}
            <option value="price_1P9Kn2F2kI0aSHJWKnN6O8kf">Scroller+</option>
            <option value="price_1P9Kn2F2kI0aSHJWKnN6O8k">Scroller4Life</option>
          </select>

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <label htmlFor="cardNumber" style={{ marginBottom: '8px' }}>Card Number</label>
              <div id="cardNumber" style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <CardNumberElement options={cardStyle} />
              </div>

              <label htmlFor="cardExpiry" style={{ marginBottom: '8px' }}>Expiration Date</label>
              <div id="cardExpiry" style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <CardExpiryElement options={cardStyle} />
              </div>

              <label htmlFor="cardCvc" style={{ marginBottom: '8px' }}>CVC</label>
              <div id="cardCvc" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <CardCvcElement options={cardStyle} />
              </div>
            </div>
            <div style={{height:'32vh'}}></div>

            {canMakePayment && (
              <button
                type="button"
                onClick={handlePaymentRequestButtonClick}
                className="payment-request-button"
                style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '10px' }}
              >
                Pay with Apple
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !stripe}
              className="form-button"
              style={{ padding: '10px 20px', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
            >
              {loading ? 'Processing...' : `Subscribe for ${planPrice}`}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
    </div>
  );
}

export default SubscribeForm;

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { async } from "@firebase/util";
import CheckMark from "./mini_components/green_check"
import CrossMark from "./mini_components/cross_mark"


const Plans = ({ planType }) => {
  const item = {
    price: "price_1PnC5hKU472eG61vQgz1hUnm",
    quantity: 1,
  };
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  const checkoutOptions = {
    lineItems: [item],
    mode: "payment",
    successUrl: `${window.location.origin}/`,
    cancelUrl: `${window.location.origin}/`,
  };
  let stripePromise;

  const getStripe = () => {
    if (!stripePromise) {
      stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_KEY}`);
    }
    return stripePromise;
  };

  const redirectToCheckout = async () => {
    console.log("redirectingToCheckout");
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout(checkoutOptions);
    console.log(error);
  };

  return (
    <div
      style={{
        margin: "0px 00px",
        display: "flex",
        flexDirection: "row",
        overflowY:'visible',
        // gap:'50px',
        overflowX: "auto", // Enable horizontal scrolling
        paddingBottom: "20px", // Optional: adds some padding at the bottom to prevent content cut-off
        width:'100%',
        height:'calc(100dvh - 50px)',
        alignItems: isMobile?'center': 'initial',
      }}
    >
      <div
        style={{
          width: "300px",
          // height: "80%",
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
        {/* <p style={{ fontSize: "14px" }}>Get a break from brainrot.</p> */}
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
            cursor: "pointer",
            marginTop: "24px",
            marginBottom:'7px',
            fontSize:'20px',
            backgroundColor:"#ff9900",
            color:'black',
            fontWeight:'bold'
          }}
        >
          {planType == "free" && "Current"}
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
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> Exclusive Newsletter </div></li>
        </div>
        <button
          style={{
            width: "100%",
            padding: "4%",
            borderRadius: "100px",
            border: "none",
            color: "white",
            cursor: "pointer",
            marginTop: "20px",
            fontSize:'20px',
            backgroundColor:"#ff9900",
            color:'black',
            fontWeight:'bold'
          }}
        >
          Switch Over
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
          $45
          <span style={{ fontSize: "15px", fontWeight: "normal" }}>
            / yearly
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
          <li><div style={{display:'flex', }}><CheckMark></CheckMark> Exclusive Newsletter </div></li>
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
            cursor: "pointer",
            marginTop: "24px",
            fontSize:'20px',
            backgroundColor:"#ff9900",
            color:'black',
            fontWeight:'bold'
          }}
        >
          Switch Over
        </button>
      </div>
    </div>
  );
};

export default Plans;

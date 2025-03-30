import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Renders errors or successful transactions on the screen
function Message({ content }) {
  return <p style={{ color: "white", marginTop: "20px" }}>{content}</p>;
}

const Paypal = () => {
  const [message, setMessage] = useState("");

  const initialOptions = {
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
    currency: "USD",
  };

  return (
    <div style={{ 
      width: "100%", 
      margin: "0 auto", 
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      color: "white"
    }}>
      <h1 style={{ marginBottom: "20px" }}>Premium Subscription</h1>
      <div style={{ 
        background: "rgb(34, 34, 34)",
        padding: "20px",
        borderRadius: "10px",
        width: "90%",
        maxWidth: "400px"
      }}>
        <h2 style={{ marginBottom: "20px" }}>Upgrade to Premium</h2>
        <p style={{ marginBottom: "20px" }}>
          Get access to all premium features for just $10/month
        </p>
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{
              shape: "rect",
              layout: "vertical",
              color: "gold",
              label: "paypal",
            }}
            createOrder={async () => {
              try {
                const response = await fetch("http://localhost:5001/api/orders", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    items: [
                      {
                        name: "Premium Subscription",
                        price: "10.00",
                        quantity: "1",
                      },
                    ],
                  }),
                });

                const orderData = await response.json();

                if (orderData.id) {
                  return orderData.id;
                } else {
                  const errorDetail = orderData?.details?.[0];
                  const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);

                  throw new Error(errorMessage);
                }
              } catch (error) {
                console.error(error);
                setMessage(`Could not initiate PayPal Checkout...${error}`);
              }
            }}
            onApprove={async (data, actions) => {
              try {
                const response = await fetch(
                  `http://localhost:5001/api/orders/${data.orderID}/capture`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                const orderData = await response.json();
                const errorDetail = orderData?.details?.[0];

                if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                  // Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                  return actions.restart();
                } else if (errorDetail) {
                  // Other non-recoverable errors -> Show a failure message
                  throw new Error(
                    `${errorDetail.description} (${orderData.debug_id})`
                  );
                } else {
                  // Successful transaction -> Show confirmation or thank you message
                  const transaction =
                    orderData.purchase_units[0].payments.captures[0];
                  setMessage(
                    `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                  );
                  console.log(
                    "Capture result",
                    orderData,
                    JSON.stringify(orderData, null, 2)
                  );
                }
              } catch (error) {
                console.error(error);
                setMessage(
                  `Sorry, your transaction could not be processed...${error}`
                );
              }
            }}
          />
        </PayPalScriptProvider>
        <Message content={message} />
      </div>
    </div>
  );
};

export default Paypal; 
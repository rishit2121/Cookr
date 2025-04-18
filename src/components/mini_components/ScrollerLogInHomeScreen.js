import React from "react";
import { useNavigate } from "react-router-dom";
import cookrLogo from "./../../assets/cook.png";

function ScrollerLogInHomeScreen({ mobileDimension }) {
  const navigate = useNavigate();
  return (
    <div style={{ width: "100%", background: "black" }}>
      <div
        style={{
          position: "absolute",
          left: mobileDimension ? "50%" : "calc(50% + 110px)",
          top: "50%",
          transform: mobileDimension ? "translate(-50%, -50%)" : "translate(-50%, -50%)",
        }}
      >
        <p style={{ fontSize: "30px", color: "white", textAlign: "center" }}>
          It's time to
        </p>
        <div
          style={{ display: "flex", justifyContent: "center", height: "100px" }}
        >
          <img style={{ scale: "3.5" }} src={cookrLogo} />
        </div>
        <br></br>
        <button
          onClick={async () => navigate("/auth")}
          style={{
            width: "300px",
            height:"7vh",
            padding: "10px 40px",
            backgroundColor: "#6A6CFF",
            border: "none",
            color: "white",
            borderRadius: "10px",
            cursor: "pointer",
            marginTop: "150px",
            boxShadow: "0px 5px #484AC3",
            fontSize: "18px",
          }}
        >
          Start Cooking
        </button>
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          to get scrollin'!
        </p>
      </div>
      <div
        style={{
          bottom: "10dvh",
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
          position: "absolute",
          width: "300px",
          left: mobileDimension ? "50%" : "calc(50% + 110px)",
          transform: "translateX(-50%)"
        }}
      >
        <p
          style={{
            margin: "0px",
            color: "gray",
            fontSize: "15px",
            cursor: "pointer",
          }}
          onClick={async () => navigate("terms")}
        >
          Terms & Conditions
        </p>
        <p
          style={{
            margin: "0px",
            color: "gray",
            fontSize: "15px",
            cursor: "pointer",
          }}
          onClick={async () => navigate("privacy")}
        >
          Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default ScrollerLogInHomeScreen;
import React from "react";
import { useNavigate } from "react-router-dom";
import cookrLogo from "./../../assets/CookrLogo.webp";

function ScrollerLogInHomeScreen({ mobileDimension }) {
  const navigate = useNavigate();
  return (
    <div style={{ width: "100%", background: "black" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: mobileDimension
            ? "translate(-50%, -50%)"
            : "translate(0%, -50%)",
        }}
      >
        <p style={{ fontSize: "30px", color: "white", textAlign: "center" }}>
          It's time to
        </p>
        <div
          style={{ display: "flex", justifyContent: "center", height: "100px" }}
        >
          <img style={{ scale: "4" }} src={cookrLogo} />
        </div>
        <br></br>
        <button
          onClick={async () => navigate("/auth")}
          style={{
            width: "100%",
            padding: "10px 40px",
            backgroundColor: "#6A6CFF",
            border: "none",
            color: "white",
            borderRadius: "10px",
            cursor: "pointer",
            marginTop: "150px",
            boxShadow: "0px 5px #484AC3",
            width: "300px",
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
          bottom: "10px",
          alignItems: "end",
          display: "flex",
          justifyContent: "end",
          marginTop: "10px",
          position: "absolute",
          right: "0%",
        }}
      >
        <p
          style={{
            margin: "0px 0px",
            color: "gray",
            fontSize: "10px",
            cursor: "pointer",
          }}
          onClick={async () => navigate("terms")}
        >
          Terms & Conditions
        </p>
        <p
          style={{
            margin: "0px 10px",
            color: "gray",
            fontSize: "10px",
            cursor: "pointer",
          }}
          onClick={async () => navigate("careers")}
        >
          Privacy Policy
        </p>
        <p
          style={{
            margin: "0px 10px",
            color: "gray",
            fontSize: "10px",
            cursor: "pointer",
          }}
          onClick={async () => navigate("careers")}
        >
          Careers
        </p>
      </div>
    </div>
  );
}

export default ScrollerLogInHomeScreen;
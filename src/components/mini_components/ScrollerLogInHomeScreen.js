import React from "react";
import { useNavigate } from "react-router-dom";

function ScrollerLogInHomeScreen({ mobileDimension }) {
  const navigate = useNavigate();
  return (
    <div style={{width:"100%"}}>
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
        <p style={{ fontSize: "21px" }}>Hey 👋! welcome to </p>
        <h1
          style={{
            margin: "0px",
            fontSize: "50px",
          }}
        >
          Scro<span style={{ fontStyle: "italic", color:"orange" }}>ll</span>er
        </h1>
        <br></br>
        <button
          onClick={async () => navigate("/auth")}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "black",
            border: "none",
            color: "white",
            borderRadius: "100px",
            cursor: "pointer",
          }}
        >
          Sign In
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
          justifyContent:"end",
          marginTop:"10px"
          
        }}
      >
        <p style={{margin:"0px 10px", color:"gray", fontSize:"10px", cursor:"pointer"}} onClick={async()=>navigate("terms")}>Terms & Conditions</p>
        <p style={{margin:"0px 10px", color:"gray", fontSize:"10px", cursor:"pointer"}} onClick={async()=>navigate("careers")}>Careers</p>
      </div>
    </div>
  );
}

export default ScrollerLogInHomeScreen;
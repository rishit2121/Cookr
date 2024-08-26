import MyLibrary from "../components/MyLibrary";
import Navbar from "../components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Library() {
  const [mobileDimension, setMobileDimension] = useState(false);
  const navigate = useNavigate();
  return (
    <div
      className="App"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      <div>
        <Navbar setMobileDimension={setMobileDimension}/>
      </div>
      <div style={{ flex: 1, padding: "10px", overflowY: "auto", justifyContent:mobileDimension&&"center", display:"flex", width:"100%" }}>
        {localStorage.getItem("email")?<MyLibrary />: <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: mobileDimension?"translate(-50%, -50%)":"translate(0%, -50%)",
          }}
        >
          <p style={{fontSize:"21px"}}>Hey 👋, welcome to{" "}</p>
          <h1
            style={{
              margin: "0px",
              textShadow: "2px 2px 5px orange",
              fontSize: "50px",
            }}
          >
            Scro<span style={{fontStyle:"italic"}}>ll</span>er
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
        </div>}
      </div>
    </div>
  );
}

export default Library;

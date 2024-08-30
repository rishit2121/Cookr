import React, { useState, useEffect } from "react";
import { getDoc, onSnapshot, doc } from "firebase/firestore";
import { db } from "../components/firebase/Firebase.js";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";


function Explore() {
  const [mobileDimension, setMobileDimension] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [planType, setPlanType] = useState();
  const [referalCode, setReferalCode] = useState();
  useEffect(() => {
    try {
      const document = onSnapshot(
        doc(db, "explore", "sets"),
        (doc) => {
        //   setName(doc.data().name);
        //   setEmail(doc.data().email);
        //   setPlanType(doc.data().plan);
        //   setReferalCode(doc.data().myCode)
        }
      );
    } catch (error) {
      alert("Error");
    }
  }, []);
    return (
        <div
        className="App"
        style={{ display: "flex", height: "100vh", overflow: "hidden",}}
      >

        <div>
        <Navbar setMobileDimension={setMobileDimension} />
      </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            // justifyContent: "center",
          }}
        >
          <h1 style={{ margin: "40px 50px" }}>Find Fun Sets!</h1>
          
        </div>
        </div>
      );
}

export default Explore;

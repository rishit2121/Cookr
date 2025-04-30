import React, { useState, useEffect } from "react";
import NewPrompt from "../components/NewPrompt";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../components/firebase/Firebase";
import Stellar from "../assets/stellar.png";
import {
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
  } from "firebase/firestore";
import { auth, signInWithGoogle, logOut } from "../components/firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import Bottom from "../components/BottomNav";
import Navbar from "../components/Navbar";
import Features from "../components/feature";

var randomColor = require("randomcolor"); // import the script

const generateUniqueNumber = (email) => {
  

  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash).toString().slice(0, 6); 
};

const Featured_Sets = () => {
  const [isVisible, setIsVisible] = useState(window.innerWidth > 1100);
  const [mobileDim, setMobileDim] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth > 1100);
      setMobileDim(window.innerWidth <= 768);
    };

    // Initial check
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "black",
      }}
    >
      <div style={{ display: "flex", width: "100%" }}>
        <Navbar setMobileDimension={setMobileDim} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginLeft: isVisible ? "0px" : "0",
            transition: "margin-left 0.3s ease",
          }}
        >
          <Features mobileDimension={mobileDim} />
        </div>
      </div>

      {mobileDim && (
        <Bottom
          streak={0}
          currentPage={'featured'}
          xp={0}
          sets={[]}
          currentSet={null}
          setCurrentSet={() => {}}
          mobileDimension={mobileDim}
        />
      )}
    </div>
  );
};

export default Featured_Sets;

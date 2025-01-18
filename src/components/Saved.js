import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/Firebase";
import QuestionCard from "./QuestionCard";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle, logOut } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";

const SavedQuestions = () => {
  const navigate = useNavigate();
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  const [streak, setStreak] = useState(
    localStorage.getItem("streak")
      ? parseInt(localStorage.getItem("streak"))
      : 0
  );
  const [mobileDimension, setMobileDimension] = useState(false);
  const [xp, setXP] = useState(
    localStorage.getItem("xp") ? parseInt(localStorage.getItem("xp")) : 0
  );
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser.email);
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  useEffect(() => {
    if (user) {
      const userEmail = user;
      const userDocRef = doc(db, "users", userEmail);
  
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          setSavedQuestions(docSnapshot.data().cards || []);
        } else {
          console.log("No such document!");
        }
      });
  
      // Cleanup subscription on unmount or when user changes
      return () => unsubscribe();
    }
  }, [user]);
  

  return (
    <div
      className="App"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      <Navbar setMobileDimension={setMobileDimension} />
      <div style={{ width: "5%", backgroundColor: isDarkMode ? "black": "whitesmoke"}}></div>
      {user ? (
        <div
          style={{ flex: 1, height: "100%", overflow: "auto", padding: "20px", backgroundColor: isDarkMode ? "black": "whitesmoke"
          }}
        >
          <h2 style={{color: isDarkMode ? "white": "black"}}>Saved Questions</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0% 20%" }}>
            {savedQuestions.length > 0 ? (
              savedQuestions.map((questionData, index) => (
                <QuestionCard
                  key={index}
                  question={questionData.question}
                  choices={questionData.choices}
                  answer={questionData.answer}
                  selectedAnswer={questionData.selectedAnswer}
                  setStreak={setStreak}
                  setXP={setXP}
                  title={questionData.title && questionData.title}
                  color={questionData.color && questionData.color}
                  fullJSON={questionData}
                  isFavorites={true}
                />
              ))
            ) : (
              <p>No saved questions yet.</p>
            )}
          </div>
        </div>
      ) : (
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
          <p style={{ fontSize: "21px" }}>Hey 👋, welcome to </p>
          <h1
            style={{
              margin: "0px",
              textShadow: "2px 2px 5px orange",
              fontSize: "50px",
            }}
          >
            Scro<span style={{ fontStyle: "italic" }}>ll</span>er
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
      )}
    </div>
  );
};

export default SavedQuestions;

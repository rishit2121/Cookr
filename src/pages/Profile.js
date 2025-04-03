import Navbar from "../components/Navbar";
import MyProfile from "../components/Profile";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle, logOut } from "../components/firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import {useEffect, useRef } from "react";
import Bottom from "../components/BottomNav";
import { signOut } from "firebase/auth";


function Profile() {
  const [mobileDimension, setMobileDimension] = useState(false);
  const [streak, setStreak] = useState(
    localStorage.getItem("streak")
      ? parseInt(localStorage.getItem("streak"))
      : 0
  );
  const [xp, setXP] = useState(
    localStorage.getItem("xp") ? parseInt(localStorage.getItem("xp")) : 0
  );
  const [sets, setSets] = useState();
  const [currentSet, setCurrentSet] = useState(
    localStorage.getItem("currentSet")
      ? JSON.parse(localStorage.getItem("currentSet"))
      : null
  );
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser.email);
      } else {
        setUser(null); // Set user to null when not logged in
      }
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);
  return (
    <div
      className="App"
      style={{ display: "flex", height: "100dvh", overflow: "hidden", backgroundColor: "black"}}
    >
      <div>
        <Navbar setMobileDimension={setMobileDimension} />
      </div>
      {user ? (
        <div style={{ display:'flex', flexDirection:'column',flex: 1, overflowY: "auto", backgroundColor: "black", justifyContent: 'flex-end', // Align items at the bottom
        }}>
          <MyProfile mobileDimension={mobileDimension} />
          {mobileDimension && (
            <Bottom
              streak={streak}
              currentPage={'profile'}
              xp={xp}
              sets={sets}
              currentSet={currentSet}
              setCurrentSet={setCurrentSet}
              mobileDimension={mobileDimension}
            />
          )}

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
          <p style={{ fontSize: "21px", color: "white" }}>Hey 👋, welcome to </p>
          <h1
            style={{
              marginLeft: "15px",
              textShadow: "2px 2px 5px blue",
              fontSize: "50px",
              color: "white"
            }}
          >
                C<span style={{ fontStyle: "italic" }}>oo</span>kr
          </h1>
          <br></br>
          <button
            onClick={async () => navigate("/auth")}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "white",
              border: "none",
              color: "black",
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
}

export default Profile;

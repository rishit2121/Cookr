import Bottom from "../components/Bottom";
import CustomDropdown from "../components/Dropdown";
import Navbar from "../components/Navbar";
import Scroller from "../components/Scroller";
import { useState, useEffect, useRef } from "react";
import { doc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { db } from "../components/firebase/Firebase";
import { useNavigate } from "react-router-dom";
import VideoScroller from "../components/VideoScroller";
import HomeScreenTutorial from "../components/mini_components/HomeScreenTutorial";
import ScrollerLogInHomeScreen from "../components/mini_components/ScrollerLogInHomeScreen";
import { auth, signInWithGoogle, logOut } from "../components/firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";

function Scrolls() {
  const [streak, setStreak] = useState(
    localStorage.getItem("streak") 
      ? parseInt(localStorage.getItem("streak"))
      : 0
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
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
  const [sets, setSets] = useState();
  const [currentSet, setCurrentSet] = useState(
    localStorage.getItem("currentSet")
      ? JSON.parse(localStorage.getItem("currentSet"))
      : null
  );
  const navigate = useNavigate();
  const [mobileDimension, setMobileDimension] = useState(false);
  const [announcement, setAnnouncement] = useState(true);

  useEffect(() => {
    localStorage.setItem("streak", streak);
    localStorage.setItem("xp", xp);
    localStorage.setItem("sets", JSON.stringify(sets));
  }, [streak, xp, sets]);

  useEffect(() => {
    try {
      if (user) {
        const document = onSnapshot(
          doc(db, "users", user),
          (doc) => {
            // Get the sets and filter only scrollGenerationMode 1 sets
            const filteredSets = doc
              .data()
              .sets.filter((set) => set.scrollGenerationMode == 2);
            setSets(filteredSets);
            console.log(filteredSets);
          }
        );
      }
    } catch (error) {
      alert("Error");
    }
  }, []);

  return (
    <div
      className="App"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      {<Navbar setMobileDimension={setMobileDimension} />}
      {user ? (
        <div
          style={{
            flex: 1,
            padding: "10px",
            overflowY: "auto",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: isDarkMode ? "black": "whitesmoke"
          }}
        >
          {currentSet ? (
            <div
              style={{
                width: "100%",
                height: "100vh",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              <VideoScroller
                setStreak={setStreak}
                setXP={setXP}
                currentSet={currentSet}
              />
            </div>
          ) : (sets && sets.length) > 0 && !currentSet ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p style={{}}>Pick a subject to get started with your session!</p>
            </div>
          ) : (
            <HomeScreenTutorial/>
          )}
          <Bottom
            streak={streak}
            xp={xp}
            sets={sets}
            currentSet={currentSet}
            setCurrentSet={setCurrentSet}
            mobileDimension={mobileDimension}
            location={"videos"}
          />
        </div>
      ) : (
        <ScrollerLogInHomeScreen mobileDimension={mobileDimension}/>
      )}
    </div>
  );
}

export default Scrolls;
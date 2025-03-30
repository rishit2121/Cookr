import React, { useState, useEffect } from "react";
import "../index.css";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import correct from "../assets/correct-answer-sound-effect-19.wav";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore"; // Import necessary Firebase methods
import { db } from "./firebase/Firebase";
import ShareButtons from './share_buttons'; // Adjust the path according to your file structure
import Comments from "./mini_components/Comments";
import { auth, signInWithGoogle, logOut } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
var randomColor = require("randomcolor"); // import the script



const QuestionCard = ({
  question,
  choices,
  answer,
  comment,
  setStreak,
  selectedAnswer,
  setXP,
  title,
  color,
  fullJSON,
  isFavorites,
  currentIndex,
  mobileDimension,
  savedQuestions
}) => {
  const cardStyle = {
    cardColor: "whitesmoke",
    textColor: "black",
    buttonColor: "whitesmoke",
  };
  
  // Get the question states from the shared dictionary
  const questionKey = `question_${question.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const questionStates = JSON.parse(localStorage.getItem("questionStates") || "{}");
  const savedState = questionStates[questionKey] || {};
  
  const [selectedChoice, setSelectedChoice] = useState(savedState.selectedChoice || selectedAnswer);
  const [isAnswered, setIsAnswered] = useState(savedState.isAnswered || false);
  const [showPlus10, setShowPlus10] = useState(false);
  const [shake, setShake] = useState(false);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState(savedState.reveal || false);

  // Save state to the shared dictionary whenever it changes
  useEffect(() => {
    const questionStates = JSON.parse(localStorage.getItem("questionStates") || "{}");
    questionStates[questionKey] = {
      selectedChoice,
      isAnswered,
      reveal
    };
    localStorage.setItem("questionStates", JSON.stringify(questionStates));
  }, [selectedChoice, isAnswered, reveal, questionKey]);

const [user, setUser] = useState('rishit.agrawal121@gmail.com');
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser.email);
      setLoading(false); // Auth state resolved
      if (currentUser) {
        // Get subscription status from Firestore
        const userRef = doc(db, "users", currentUser.email);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            setHasSubscription(docSnap.data().subscription || false);
          }
        });
      }
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);


  // Retrieve favorites from local storage, or initialize with an empty array
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [showComments, setShowComments] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    // Update local storage whenever favorites change
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const formatBoldText = (text) => {
    try {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <b style={{}} key={index}>
              <Latex>{part.slice(2, -2)}</Latex>
            </b>
          );
        }
        return <Latex key={index}>{part}</Latex>;
      });
    } catch {}
  };

  const handleChoiceClick = async (choice, isFavorites) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    setIsAnswered(true);
    setReveal(true);
    if (choice === parseInt(answer)) {
      if (isFavorites) {
        return;
      } else {
        setStreak((prevStreak) => prevStreak + 1);
        setXP((prevXP) => prevXP + 10);
        triggerPlus10Animation();

        // Update trueXP in localStorage
        const currentXP = parseInt(localStorage.getItem("trueXP") || "0");
        localStorage.setItem("trueXP", (currentXP + 10).toString());

        // Update leaderboard
        try {
          const userEmail = user;
          const leaderboardRef = doc(db, "leaderboard", "rankings");
          const leaderboardDoc = await getDoc(leaderboardRef);
          
          if (!leaderboardDoc.exists()) {
            // Create new leaderboard document if it doesn't exist
            await updateDoc(leaderboardRef, {
              ranking: []
            });
          }

          const rankingList = leaderboardDoc.data().ranking || [];
          const userIndex = rankingList.findIndex(player => player.email === userEmail);
          
          let userData;
          
          if (userIndex !== -1) {
            // Remove user from current position before searching
            userData = rankingList[userIndex];
            userData.XP += 10; // Add 10 to current XP
            rankingList.splice(userIndex, 1);
          } else {
            // For new users, create their data
            const userDoc = await getDoc(doc(db, "users", userEmail));
            const currentUser = auth.currentUser;
            const googleName = currentUser.displayName ? currentUser.displayName : null;
            
            let userName;
            if (userDoc.exists()) {
              const firestoreName = userDoc.data().name;
              if (googleName) {
                userName = googleName;
              } else if (firestoreName && firestoreName !== 'null') {
                userName = firestoreName;
              } else {
                userName = `@Cookr${generateUniqueNumber(userEmail)}`;
              }
            } else {
              if (googleName) {
                userName = googleName;
              } else {
                userName = `@Cookr${generateUniqueNumber(userEmail)}`;
              }
            }

            userData = {
              email: userEmail,
              name: userName,
              XP: 10
            };
          }

          let left = 0;
          let right = rankingList.length - 1;
          
          while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (rankingList[mid].XP > userData.XP) {
              // If middle XP is higher than user's XP, look in right half (lower values)
              left = mid + 1;
            } else {
              // If middle XP is lower than user's XP, look in left half (higher values)
              right = mid - 1;
            }
          }
          
          // Insert user at the correct position
          rankingList.splice(left, 0, userData);

          // Update the leaderboard document
          await updateDoc(leaderboardRef, {
            ranking: rankingList
          });
        } catch (error) {
          console.error("Error updating leaderboard:", error);
        }
      }
    } else {
      setStreak(0);
      triggerShakeAnimation();
    }
  };

  const triggerPlus10Animation = () => {
    setShowPlus10(true);
    setTimeout(() => {
      setShowPlus10(false);
    }, 1500);
  };
  const handleRevealAnswer = () => {
    setReveal(localStorage.getItem("mode") === "2" ? !reveal : true);
    setIsAnswered(true);
  };

  const triggerShakeAnimation = () => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
    }, 500);
  };
    function toggleLiked() {
        setLiked(prevLiked => !prevLiked);
    }


  const handleHeartClick = async () => {
    const existingFavorites = savedQuestions ?? JSON.parse(localStorage.getItem("favorites")) ?? [];
    toggleLiked()
    const userEmail = user; // Get the user's email
    const userDocRef = doc(db, "users", userEmail); // Reference to the user's document in Firebase

    try {
      if (existingFavorites.some((fav) => fav.question === fullJSON.question)) {
        // Remove from favorites in local storage
        const updatedFavorites = existingFavorites.filter(
          (fav) => fav.question !== fullJSON.question
        );
        setFavorites(updatedFavorites);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

        // Remove the fullJSON object from the 'cards' field in Firebase
        await updateDoc(userDocRef, {
          cards: arrayRemove(fullJSON),
        });
      } else {
        console.log(selectedAnswer);
        const newJSON = {
          question,
          choices,
          answer,
          setStreak,
          selectedAnswer,
          setXP,
          title,
          color,
          fullJSON,
        };

        // Add to favorites in local storage
        const updatedFavorites = [...existingFavorites, newJSON];
        setFavorites(updatedFavorites);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

        // Add the fullJSON object to the 'cards' field in Firebase
        await updateDoc(userDocRef, {
          cards: arrayUnion(fullJSON),
        });
      }
    } catch (error) {
      console.error("Error updating favorites: ", error);
      alert("Error updating favorites.");
    }
  };

  const isFavorite = isFavorites ?? favorites.some(
    (fav) => fav.question === fullJSON.question
  );

  const generateUniqueNumber = (email) => {
    // Create a hash of the email by converting it to a string and then hashing it
    const hash = Array.from(email)
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
    // Generate a random number using the hash value, and ensure it's a 6-digit number
    const randomNumber = (hash * 1000) % 900000 + 100000; // Generates a 6-digit number
  
    return randomNumber;
  };

  return (
    <div>
      <div
        className="card"
        style={{
          backgroundColor: !mobileDimension? "#282828": "black",
          boxShadow: `0px 0px 20px -5px black`,
          padding: "10px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start", // Ensures content stays at the top
          position: "relative",
          animation: shake ? "shake 0.5s ease-out" : "none",
          outline: mobileDimension ? "none" : `1px solid ${color}80`,
          transition: "transform 0.3s ease-in-out",
          minHeight: "300px", // Ensures the card has enough space to work with
        }}
        onDoubleClick={(localStorage.getItem("mode") == 1 || isFavorites) ? handleHeartClick : undefined}
      >
        {showPlus10 && (
          <div className="plus10-animation">Correct! You Cooked.</div>
        )}
        <div>
          <p
            style={{
              fontSize:
                question.length < 150
                  ? "20px"
                  : question.length < 400
                  ? "16px"
                  : "12px",
              marginTop: "20px",
              color: "white",
              lineHeight: "1.2",
            }}
          >
            {formatBoldText(question)}
          </p>
        </div>
        {showComments && (
          <Comments
            comment={comment}
            randomColor={randomColor}
            formatBoldText={formatBoldText}
            setShowComments={setShowComments}
          />
        )}
        {
          <div style={{ marginTop: "40px" }}>
            {(localStorage.getItem("mode") == 1 || isFavorites) &&
              choices.map((choice, index) => (
                <button
                  className="cardButton"
                  key={index}
                  style={{
                    display: "block",
                    width: "85%",
                    outline: "1px solid white",
                    border: "none",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "10px",
                    textAlign: "left",
                    boxShadow: "none",
                    fontSize: choice.length > 60 ? "10px" : "15px",
                    cursor: isAnswered ? "not-allowed" : "pointer",
                    backgroundColor: true
                      ? selectedChoice === index
                        ? selectedChoice === parseInt(answer)
                          ? "palegreen"
                          : "salmon"
                        : isAnswered && index === parseInt(answer) && reveal
                        ? "palegreen"
                        : "gainsboro"
                      : choice == parseInt(answer)
                      ? "palegreen"
                      : "whitesmoke",
                    opacity: isAnswered && selectedChoice !== index ? 0.6 : 1,
                    color: cardStyle.textColor,
                  }}
                  onClick={() => {
                    handleChoiceClick(index, isFavorites);
                  }}
                >
                  <Latex>{choice}</Latex>
                </button>
              ))}
            <div
              style={{width: "90%",}}
            >
              <p
                style={{
                  margin: "0% 0px",
                  color: "#6A6CFF",
                  fontSize: "18px",
                  boxSizing:"border-box",
                  
                }}
              >
                {reveal && formatBoldText(answer)}
              </p>
              <div style={{position: "absolute", bottom: "25px", width: "90%", alignItems: "flex-end", justifyContent: "flex-end"}}>
                <button
                  style={{
                    borderRadius: "10px",
                    cursor: "pointer",
                    color: "white",
                    background: "#6A6CFF",
                    boxShadow: "0px 2px 0px 0px #484AC3",
                    border: "none",
                    marginBottom: "10px",
                    width: "60%",
                    padding: "10px 15px",
                    marginBottom: "20px",
                    fontSize: "18px",
                  }}
                  onClick={handleRevealAnswer}
                >
                  {localStorage.getItem("mode") === "2" ? (reveal ? "Hide Answer" : "Reveal Answer") : "Reveal Answer"}
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "-10px",
                    padding: "10px",
                    borderRadius: "inherit",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: `${color}`,
                      height: "25px",
                      width: "25px",
                      borderRadius: "100px",
                      display: "flex",
                      justifyContent: "center",
                      marginRight: "10px",
                      flexShrink: 0,
                    }}
                  >
                    {title.slice(0, 1)}
                  </div>
                  <p
                    style={{
                      margin: "0px",
                      color: color,
                      backgroundColor: `${color}20`,
                      padding: "1px 15px",
                      outline: mobileDimension ? "none" : `1px solid ${color}`,
                      borderRadius: "100px",
                      width: "fit-content",
                      maxWidth: "100%", // Ensures it doesn't exceed the container width
                      whiteSpace: "nowrap", // Prevents text from wrapping to the next line
                      overflow: "hidden", // Hides any overflowing text
                      textOverflow: "ellipsis", // Adds "..." when text overflows
                    }}
                  >
                    {title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
        
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexDirection: "column",
            position: "absolute",
            bottom: "25px",
            right: "20px",
          }}
        >
            {(localStorage.getItem("mode") == 1 || isFavorites) && (
              <i
                onClick={handleHeartClick}
                style={{
                  // fontSize: "33px", 
                  cursor: "pointer",
                  color: "whitesmoke",
                }}
                id={isFavorite ? "heart-clicked" : "heart-unclicked"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  width="2.2em"
                  height="2.2em"
                >
                  <path
                    fill={isFavorite ? "#6A6CFF" : "currentColor"}
                    d="M17.718 7h-.002c-6.814 0-12.18 3.957-14.723 10.855c-5.788 15.71 15.227 29.479 24.2 35.357c1.445.946 3.082 2.019 3.404 2.354L31.851 57l1.397-1.292c.232-.204 1.305-.891 2.342-1.555c8.605-5.508 31.459-20.141 25.402-36.318c-2.566-6.857-7.941-10.79-14.742-10.79c-5.744 0-11.426 2.763-14.313 6.554C28.955 9.75 23.345 7 17.718 7"
                  ></path>
                </svg>
              </i>
            )}
          {(localStorage.getItem("mode") == 1 || isFavorites) && hasSubscription && (
          <svg
            onClick={async () => setShowComments(!showComments)}
            style={{ cursor: "pointer" }}
            fill={`whitesmoke`}
            outline={"1px solid yellow"}
            width="33px"
            height="33px"
            viewBox="0 0 24 24"
            id="Layer_1"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              class="cls-1"
              d="M21.5,12A9.5,9.5,0,1,0,12,21.5h9.5l-2.66-2.92A9.43,9.43,0,0,0,21.5,12Z"
            />
          </svg>
          )}
          {!isFavorites && (
          <div
            style={{
              marginTop: "5px",
              display: "flex",
              height: "28px",
              width: "28px",
              borderRadius: "100px",
              outline: "1px solid white",
              justifyContent: "center",
              alignItems: "center",
              fontSize:'12px',
              padding:'5px',
              color:'white'
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              width="1.2em"
              height="1.2em"
              style={{
                marginRight:'5%'
              }}
            >
              <g fill="none">
                <path
                  fill="url(#f517id0)"
                  d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022"
                ></path>
                <path
                  fill="url(#f517id1)"
                  d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022"
                ></path>
                <path
                  fill="url(#f517idb)"
                  d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022"
                ></path>
                <path
                  fill="url(#f517id2)"
                  d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022"
                ></path>
                <path
                  fill="url(#f517id3)"
                  d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022"
                ></path>
                <path
                  fill="url(#f517id4)"
                  d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022"
                ></path>
                <path
                  fill="url(#f517id5)"
                  d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022"
                ></path>
                <path
                  fill="url(#f517id6)"
                  d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022"
                ></path>
                <g filter="url(#f517idf)">
                  <path
                    fill="url(#f517id7)"
                    d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118"
                  ></path>
                  <path
                    fill="url(#f517id8)"
                    d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118"
                  ></path>
                  <path
                    fill="url(#f517id9)"
                    d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118"
                  ></path>
                </g>
                <path
                  fill="url(#f517idc)"
                  d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118"
                ></path>
                <path
                  fill="url(#f517ida)"
                  d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118"
                ></path>
                <g filter="url(#f517idg)">
                  <path
                    fill="url(#f517idd)"
                    d="M11.814 11.539c2.315-3.39 3.67-7.058 4.083-7.962c-.603 4.634-2.36 8.028-5.668 12.398c-2.646 3.496-3.124 6.488-3.101 7.217c-.827-5.562 1.791-7.416 4.686-11.653"
                  ></path>
                </g>
                <g filter="url(#f517idh)">
                  <path
                    fill="url(#f517ide)"
                    d="M9.814 7.874c-1.3 1.614-3.884 6.09-3.82 11.084c1.28-5.122 4.275-6.736 3.82-11.084"
                  ></path>
                </g>
                <defs>
                  <radialGradient
                    id="f517id0"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="rotate(-179.474 12.046 9.805)scale(17.0988 25.7861)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FF953D"></stop>
                    <stop offset="1" stopColor="#FF5141"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517id1"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="rotate(-157.937 6.712 6.816)scale(10.3441 17.8495)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#CE5327"></stop>
                    <stop offset="1" stopColor="#CE5327" stopOpacity="0"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517id2"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="rotate(24.015 -31.353 18.85)scale(3.10465 25.6991)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFAA7B"></stop>
                    <stop offset="1" stopColor="#FFAA7B" stopOpacity="0"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517id3"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(.843 3.74668 -4.675 1.05188 9.31 6.25)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FF5E47"></stop>
                    <stop offset="1" stopColor="#FF5E47" stopOpacity="0"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517id4"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(.37467 10.13047 -9.3768 .3468 16.429 1.366)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FF2F3C"></stop>
                    <stop offset="1" stopColor="#FF2F3C" stopOpacity="0"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517id5"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(2.07795 .9835 -1.9737 4.17002 13.9 4.8)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FF846C"></stop>
                    <stop offset="1" stopColor="#FF846C" stopOpacity="0"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517id6"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(-.89842 2.09375 -.4798 -.20588 12.458 8.21)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFA682"></stop>
                    <stop offset="1" stopColor="#FFA682" stopOpacity="0"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517id7"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="rotate(-168.558 11.823 11.126)scale(10.0291 12.4891)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFDA2F"></stop>
                    <stop offset="1" stopColor="#FF8E41"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517id8"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(5.05808 13.20705 -11.47512 4.39478 12.4 8.592)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FD5639"></stop>
                    <stop offset="1" stopColor="#FE5533" stopOpacity="0"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517id9"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(-9.74917 .98358 -2.40823 -23.87023 19.239 20.629)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset=".628" stopColor="#D7812D" stopOpacity="0"></stop>
                    <stop offset="1" stopColor="#D7812D"></stop>
                  </radialGradient>
                  <radialGradient
                    id="f517ida"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="rotate(143.063 8.353 13.24)scale(16.0546 11.6174)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset=".772" stopColor="#F18A52" stopOpacity="0"></stop>
                    <stop offset="1" stopColor="#F18A52"></stop>
                  </radialGradient>
                  <linearGradient
                    id="f517idb"
                    x1="18.336"
                    x2="18.336"
                    y1="29.944"
                    y2="24.846"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FF7583"></stop>
                    <stop offset="1" stopColor="#FF7583" stopOpacity="0"></stop>
                  </linearGradient>
                  <linearGradient
                    id="f517idc"
                    x1="16.503"
                    x2="16.503"
                    y1="10.612"
                    y2="14.259"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#F95131"></stop>
                    <stop offset="1" stopColor="#F95131" stopOpacity="0"></stop>
                  </linearGradient>
                  <linearGradient
                    id="f517idd"
                    x1="14.996"
                    x2="7.655"
                    y1="4.255"
                    y2="22.732"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FF7558"></stop>
                    <stop offset="1" stopColor="#F38758"></stop>
                  </linearGradient>
                  <linearGradient
                    id="f517ide"
                    x1="9.541"
                    x2="5.582"
                    y1="8.144"
                    y2="19.479"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FF815B"></stop>
                    <stop offset="1" stopColor="#FF9C6D"></stop>
                  </linearGradient>
                  <filter
                    id="f517idf"
                    width="14.525"
                    height="18.91"
                    x="9.49"
                    y="11.085"
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                    <feBlend
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    ></feBlend>
                    <feColorMatrix
                      in="SourceAlpha"
                      result="hardAlpha"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    ></feColorMatrix>
                    <feOffset dx=".5"></feOffset>
                    <feGaussianBlur stdDeviation=".25"></feGaussianBlur>
                    <feComposite
                      in2="hardAlpha"
                      k2="-1"
                      k3="1"
                      operator="arithmetic"
                    ></feComposite>
                    <feColorMatrix values="0 0 0 0 0.952941 0 0 0 0 0.615686 0 0 0 0 0.364706 0 0 0 1 0"></feColorMatrix>
                    <feBlend
                      in2="shape"
                      result="effect1_innerShadow_18_15821"
                    ></feBlend>
                  </filter>
                  <filter
                    id="f517idg"
                    width="11.424"
                    height="22.115"
                    x="5.723"
                    y="2.327"
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                    <feBlend
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    ></feBlend>
                    <feGaussianBlur
                      result="effect1_foregroundBlur_18_15821"
                      stdDeviation=".625"
                    ></feGaussianBlur>
                  </filter>
                  <filter
                    id="f517idh"
                    width="6.868"
                    height="14.084"
                    x="4.492"
                    y="6.374"
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                    <feBlend
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    ></feBlend>
                    <feGaussianBlur
                      result="effect1_foregroundBlur_18_15821"
                      stdDeviation=".75"
                    ></feGaussianBlur>
                  </filter>
                </defs>
              </g>
            </svg>

            {localStorage.getItem("streak")}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
      {/* <div style={{display: 'flex', flexDirection:"column", height:"82vh", backgroundColor:'', margin: "50px 0px", justifyContent:'center'}}>
      <i
              onClick={toggleLiked}
              style={{
                fontSize: "28px",
                cursor: "pointer",
                
                  marginTop:'33vh',
                  marginLeft:"10%",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  color: liked ? "" : "black", // Darker outline for unfilled heart


              }}
              className={`${liked ? "fa-solid" : "fa-regular"} fa-heart`}
              id={liked? "heart-clicked" : "heart-unclicked"}
            ></i>



      <ShareButtons title={question} body={choices} />
      <i
              onClick={handleHeartClick}
              style={{
                fontSize: "28px",
                cursor: "pointer",
                
                  marginTop:'10%',
                  marginLeft:"20%",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  color: isFavorite ? "" : "black", // Darker outline for unfilled heart


              }}
              className={`${isFavorite ? "fa-solid" : "fa-regular"} fa-bookmark`}
              id={isFavorite ? "bookmark-clicked" : "bookmark-unclicked"}
            ></i>
      </div> */}


export default QuestionCard;

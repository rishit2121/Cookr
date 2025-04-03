import React, { useState, useEffect } from "react";
import "../index.css";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import correct from "../assets/correct-answer-sound-effect-19.wav";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"; // Import necessary Firebase methods
import { db } from "./firebase/Firebase";
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
}) => {
  const cardStyle = {
    cardColor: "whitesmoke",
    textColor: "black",
    buttonColor: "whitesmoke",
  };
  const [selectedChoice, setSelectedChoice] = useState(selectedAnswer);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showPlus10, setShowPlus10] = useState(false);
  const [shake, setShake] = useState(false);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState(false);

  const [user, setUser] = useState("rishit.agrawal121@gmail.com");
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser.email);
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Retrieve favorites from local storage, or initialize with an empty array
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [showComments, setShowComments] = useState(false);

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

  const handleChoiceClick = (choice, isFavorites) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    setIsAnswered(true);
    if (choice === parseInt(answer)) {
      if (isFavorites) {
        return;
      } else {
        setStreak((prevStreak) => prevStreak + 1);
        setXP((prevXP) => prevXP + 10);
        triggerPlus10Animation();
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
    setReveal(true);
    setIsAnswered(true);
  };

  const triggerShakeAnimation = () => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
    }, 500);
  };
  function toggleLiked() {
    setLiked((prevLiked) => !prevLiked);
  }

  const handleHeartClick = async () => {
    const existingFavorites =
      JSON.parse(localStorage.getItem("favorites")) || [];
    toggleLiked();
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

  const isFavorite = favorites.some(
    (fav) => fav.question === fullJSON.question
  );

  return (
    <div>
      <div
        className="card"
        style={{
          backgroundColor: !mobileDimension ? "black" : "black",
          boxShadow: `0px 0px 20px -5px black`,
          padding: "10px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start", // Ensures content stays at the top
          position: "relative",
          animation: shake ? "shake 0.5s ease-out" : "none",
          /*outline: mobileDimension ? "none" : `1px solid ${color}80`,*/
          transition: "transform 0.3s ease-in-out",
          minHeight: "300px", // Ensures the card has enough space to work with
        }}
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
            {localStorage.getItem("mode" == 2) &&
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
              style={{ position: "absolute", bottom: "20px", width: "90%", }}
            >
              <p
                style={{
                  margin: "20px 0px",
                  color: "#484AC3",
                  fontSize: "18px",
                  boxSizing:"border-box",
                  
                }}
              >
                {reveal && formatBoldText(answer)}
              </p>
              <div>
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
                  Reveal Answer
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
          {!isFavorites && (
            <i
              onClick={handleHeartClick}
              style={{
                fontSize: "33px",
                cursor: "pointer",
                color: "whitesmoke",
              }}
              className="fa-solid fa-heart"
              id={isFavorite ? "heart-clicked" : "heart-unclicked"}
            ></i>
          )}
          {localStorage.getItem("mode" == 2) && (
            <div>
              {" "}
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
              <div
                style={{
                  marginTop: "5px",
                  display: "flex",
                  fontSize: "18px",
                  padding: "0px",
                  color: "white",
                }}
              >
                🔥 {localStorage.getItem("streak")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;

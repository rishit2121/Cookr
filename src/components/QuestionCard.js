import React, { useState, useEffect } from "react";
import "../index.css";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import correct from "../assets/correct-answer-sound-effect-19.wav";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"; // Import necessary Firebase methods
import { db } from "./firebase/Firebase";
import ShareButtons from './share_buttons'; // Adjust the path according to your file structure
import Comments from "./mini_components/Comments";
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

  const handleChoiceClick = (choice) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    setIsAnswered(true);
    if (choice === answer) {
      setStreak((prevStreak) => prevStreak + 1);
      setXP((prevXP) => prevXP + 10);
      triggerPlus10Animation();
      //correctAudio.play();
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
    const existingFavorites =
      JSON.parse(localStorage.getItem("favorites")) || [];

    const userEmail = localStorage.getItem("email"); // Get the user's email
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

  const isFavorite = favorites.some(
    (fav) => fav.question === fullJSON.question
  );


  return (
    <div style={{display:'flex', flexDirection:"row", marginLeft:'0%', width:"100%",  justifyContent:'center'  }}>
      <div
        style={{
          height: "80vh",
          width: "376px", // 95% change back
          background: `${color}08`,
          margin: "50px 0px",
          borderRadius: "10px",
          boxShadow: "0px 0px 4px 1px gainsboro",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          animation: shake ? "shake 0.5s ease-out" : "none",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                margin: "0px",
                color: color,
                backgroundColor: `${color}08`,
                padding: "1px 15px",
                outline: `1px solid ${color}`,
                borderRadius: "100px",
                width: "fit-content",
              }}
            >
              {title}
            </p>
            <div
              style={{
                margin: "0px",
                color: color,
                backgroundColor: `${color}08`,
                padding: "1px 15px",
                outline: `1px solid ${color}`,
                borderRadius: "100px",
                width: "fit-content",
              }}
            >
              <div style={{display: 'flex', flexDirection:"row",  backgroundColor:'', margin: "0px", }}>
      <i
              onClick={toggleLiked}
              style={{
                fontSize: "19px",
                cursor: "pointer",
                
                  marginTop:'0vh',
                  marginLeft:"0%",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  color: liked ? "" : `${color}`, // Darker outline for unfilled heart


              }}
              className={`${liked ? "fa-solid" : "fa-regular"} fa-heart`}
              id={liked? "heart-clicked" : "heart-unclicked"}
            ></i>



      <ShareButtons title={question} body={choices} />
      <svg
                onClick={async () => setShowComments(!showComments)}
                style={{ cursor: "pointer",           padding:"7px",
                }}
                fill={`${color}80`}
                width="24px"
                height="24px"
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
      {/* <i
              onClick={handleHeartClick}
              style={{
                fontSize: "19px",
                cursor: "pointer",
                
                  marginTop:'0',
                  marginLeft:"5%",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  color: isFavorite ? "" : `${color}`, // Darker outline for unfilled heart


              }}
              className={`${isFavorite ? "fa-solid" : "fa-regular"} fa-bookmark`}
              id={isFavorite ? "bookmark-clicked" : "bookmark-unclicked"}
            ></i> */}
      </div>
            </div>
            
          </div>
          <p
            style={{
              fontSize:
                question.length < 150
                  ? "30px"
                  : question.length < 400
                  ? "18px"
                  : "14px",
              marginTop: "20px",
              color: isDarkMode ? 'white': 'black', //darkmode
              height: "300px",
              overflow: "scroll",
              marginBottom: "10px",
            }}
          >
            {formatBoldText(question)}
            {question.length > 500 && (
              <p
                style={{
                  position: "absolute",
                  top: "-40px",
                  left: "50%",
                  background: "white",
                  padding: "5px 10px",
                  borderRadius: "100px",
                  transform: "translate(-50%, 0%)",
                }}
              >
                Scroll for More
              </p>
            )}
          </p>
        </div>
        {showComments&&<Comments comment={comment} randomColor={randomColor} formatBoldText={formatBoldText} />}
        <div style={{ overflow: "scroll" }}>
          {choices.map((choice, index) => (
            <button
              className="cardButton"
              key={index}
              style={{
                display: "block",
                width: "100%",
                border: "1px solid gainsboro",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "10px",
                textAlign: "left",
                boxShadow: "none",
                fontSize: choice.length > 60 && "10px",
                cursor: isAnswered || isFavorites ? "not-allowed" : "pointer",
                backgroundColor: !isFavorites
                  ? selectedChoice === choice
                    ? selectedChoice === answer
                      ? "palegreen"
                      : "salmon"
                    : isAnswered && choice === answer
                    ? "palegreen"
                    : cardStyle.buttonColor
                  : choice == answer
                  ? "palegreen"
                  : "salmon",
                opacity: isAnswered && selectedChoice !== choice ? 0.6 : 1,
                color: cardStyle.textColor,
              }}
              disabled={isFavorites}
              onClick={() => handleChoiceClick(choice)}
            >
              <Latex>{choice}</Latex>
            </button>
          ))}
        </div>

        {showPlus10 && <div className="plus10-animation">+10</div>}
      </div>
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
    </div>
  );
};

export default QuestionCard;

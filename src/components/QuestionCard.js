import React, { useState, useEffect } from "react";
import "../index.css";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import correct from "../assets/correct-answer-sound-effect-19.wav";
import { useTranslation } from 'react-i18next';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore"; // Import necessary Firebase methods
import { db } from "./firebase/Firebase";
import ShareButtons from "./share_buttons"; // Adjust the path according to your file structure
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
  savedQuestions,
}) => {
  const cardStyle = {
    cardColor: "whitesmoke",
    textColor: "black",
    buttonColor: "whitesmoke",
  };

  // Get the question states from the shared dictionary
  const questionKey = `question_${question.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const questionStates = JSON.parse(
    localStorage.getItem("questionStates") || "{}"
  );
  const savedState = questionStates[questionKey] || {};

  const [selectedChoice, setSelectedChoice] = useState(
    savedState.selectedChoice || selectedAnswer
  );
  const [isAnswered, setIsAnswered] = useState(savedState.isAnswered || false);
  const [showPlus10, setShowPlus10] = useState(false);
  const [shake, setShake] = useState(false);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState(
    localStorage.getItem("mode") === "3" ? false : savedState.reveal || false
  );
  const [user, setUser] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false); // for free response mode (reveal answer)
  const [showWarning2, setShowWarning2] = useState(false); // for free response mode (submit answer)
  const [textAreaMaxHeight, setTextAreaMaxHeight] = useState(0); // for free response mode text area
  const [textAreaMinHeight, setTextAreaMinHeight] = useState(0); // for free response mode text area
  const [isClosing, setIsClosing] = useState(false); // for free response mode answer container to close
  const { t } = useTranslation();

  // Icon color for heart and comment (grey)
  const iconGrey = '#888888';

  // For conditional shaded background and font size if question overflows
  const questionBoxRef = React.useRef(null);
  const [isQuestionOverflowing, setIsQuestionOverflowing] = React.useState(false);

  // Detect if choices container is overflowing
  const choicesContainerRef = React.useRef(null);
  const [areChoicesOverflowing, setAreChoicesOverflowing] = React.useState(false);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (questionBoxRef.current) {
        const el = questionBoxRef.current;
        // Check both vertical and horizontal overflow
        const isOverflow =
          el.scrollHeight > el.clientHeight + 1 ||
          el.scrollWidth > el.clientWidth + 1;
        setIsQuestionOverflowing(isOverflow);
      }
    };
    // Use setTimeout to ensure DOM has painted
    const timeout = setTimeout(checkOverflow, 0);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [question, mobileDimension]);

  React.useEffect(() => {
    const checkChoicesOverflow = () => {
      if (choicesContainerRef.current) {
        const el = choicesContainerRef.current;
        const isOverflow = el.scrollHeight > el.clientHeight + 1;
        setAreChoicesOverflowing(isOverflow);
      }
    };
    // Use setTimeout to ensure DOM has painted
    const timeout = setTimeout(checkChoicesOverflow, 0);
    window.addEventListener('resize', checkChoicesOverflow);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkChoicesOverflow);
    };
  }, [choices, mobileDimension]);

  const getCorrectAnswerIndex = () => {
    if (typeof answer === 'number') return answer;
    
    if (typeof answer === 'string' && answer.trim() !== '') {
      const parsed = parseInt(answer);
      if (!isNaN(parsed)) return parsed;
    }

    return 0;
  };

  // Save state to the shared dictionary whenever it changes
  useEffect(() => {
    const questionStates = JSON.parse(
      localStorage.getItem("questionStates") || "{}"
    );
    questionStates[questionKey] = {
      selectedChoice,
      isAnswered,
      reveal,
    };
    localStorage.setItem("questionStates", JSON.stringify(questionStates));
  }, [selectedChoice, isAnswered, reveal, questionKey]);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser.email);
        setLoading(false);
        // Get subscription status from Firestore
        const userRef = doc(db, "users", currentUser.email);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            setHasSubscription(docSnap.data().subscription || false);
          }
        });
      } else {
        setUser(null);
        setHasSubscription(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
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
  
  useEffect (() => {
    // for free response text area
    const calculateTextAreaHeight = () => {
      const documentHeight = window.innerHeight;
      const maxHeightRatio = 400/1200;
      const minHeightRatio = 200/1200;

      setTextAreaMaxHeight(Math.floor(documentHeight * maxHeightRatio));
      setTextAreaMinHeight(Math.floor(documentHeight * minHeightRatio));
    }

    calculateTextAreaHeight();

    window.addEventListener("resize", calculateTextAreaHeight);

    return () => {
      window.removeEventListener("resize", calculateTextAreaHeight);
    }
  }, []);

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
    
    const correctAnswer = getCorrectAnswerIndex();
    
    if (choice === correctAnswer) {
      if (isFavorites) {
        return;
      } else {
        // setStreak((prevStreak) => prevStreak + 1);
        setXP((prevXP) => prevXP + 10);
        triggerPlus10Animation();

        // Update trueXP in localStorage
        const currentXP = parseInt(localStorage.getItem("trueXP") || "0");
        localStorage.setItem("trueXP", (currentXP + 10).toString());

        // Update questionStreak in localStorage
        const currentQuestionStreak = parseInt(
          localStorage.getItem("questionStreak") || "0"
        );
        localStorage.setItem(
          "questionStreak",
          (currentQuestionStreak + 1).toString()
        );

        // Update leaderboard
        try {
          const userEmail = user;
          const leaderboardRef = doc(db, "leaderboard", "rankings");
          const leaderboardDoc = await getDoc(leaderboardRef);

          if (!leaderboardDoc.exists()) {
            // Create new leaderboard document if it doesn't exist
            await updateDoc(leaderboardRef, {
              ranking: [],
            });
          }

          const rankingList = leaderboardDoc.data().ranking || [];
          const userIndex = rankingList.findIndex(
            (player) => player.email === userEmail
          );

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
            const googleName = currentUser.displayName
              ? currentUser.displayName
              : null;

            let userName;
            if (userDoc.exists()) {
              const firestoreName = userDoc.data().name;
              if (googleName) {
                userName = googleName;
              } else if (firestoreName && firestoreName !== "null") {
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
              XP: 10,
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
            ranking: rankingList,
          });
        } catch (error) {
          console.error("Error updating leaderboard:", error);
        }
      }
    } else {
      // setStreak(0);
      triggerShakeAnimation();

      // Reset questionStreak to 0 when wrong
      localStorage.setItem("questionStreak", "0");
    }
  };

  const triggerPlus10Animation = () => {
    setShowPlus10(true);
    setTimeout(() => {
      setShowPlus10(false);
    }, 1500);
  };
  const handleRevealAnswer = () => {
    // for free response mode:

    console.log(answer);

    if (localStorage.getItem("mode") === "3" && !isSubmitted) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      return;
    }

    if (localStorage.getItem("mode") === "2") {
      setReveal(!reveal);
    } else {
      setReveal(true);
    }
    
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
      savedQuestions ?? JSON.parse(localStorage.getItem("favorites")) ?? [];
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

  const isFavorite =
    isFavorites ?? favorites.some((fav) => fav.question === fullJSON.question);

  const generateUniqueNumber = (email) => {
    // Create a hash of the email by converting it to a string and then hashing it
    const hash = Array.from(email).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );

    // Generate a random number using the hash value, and ensure it's a 6-digit number
    const randomNumber = ((hash * 1000) % 900000) + 100000; // Generates a 6-digit number

    return randomNumber;
  };

  const isFlashcardDesktop = !mobileDimension && localStorage.getItem("mode") == "2";
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        className="card"
        style={{
          backgroundColor: 'transparent',
          padding: mobileDimension ? '0px 12px' : '10px 20px',
          display: 'flex',
          flexDirection: 'column',
          position: "relative",
          animation: shake ? "shake 0.5s ease-out" : "none",
          border: !mobileDimension ? '1.5px solid white' : 'none',
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          minHeight: mobileDimension ? 'calc(100dvh - 75px)' : undefined,
          height: mobileDimension ? 'calc(100dvh - 75px)' : '90dvh',
          marginBottom:'5dvh',
          width: mobileDimension ? '100dvw' : undefined,
          maxWidth: mobileDimension ? '100dvw' : undefined,
          zIndex: 2,
        }}
        onDoubleClick={
          localStorage.getItem("mode") == 1 || isFavorites
            ? handleHeartClick
            : undefined
        }
      >
        {/* Subject/Topic and Streak always at the top */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 14,
          marginBottom: mobileDimension ? 18 : 2,
          marginTop: mobileDimension ? 20 : 2,
        }}>
          {/* Subject/Topic oval */}
          <div
            style={{
              border: `1px solid grey`,
              borderRadius: 999,
              padding: '6px 22px',
              color: color,
              fontWeight: 500,
              fontSize: 13,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px 0 rgba(106,108,255,0.05)',
              letterSpacing: 0.2,
              maxWidth: '60%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          {/* Streak oval */}
          {!isFavorites && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1.5px solid grey`,
                borderRadius: 999,
                padding: '6px 3px',
                color: '#fff',
                fontWeight: 500,
                fontSize: 13,
                minWidth: 60,
                justifyContent: 'center',
                boxShadow: '0 2px 8px 0 rgba(106,108,255,0.05)',
              }}
            >
              {/* Fire SVG icon for streak */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                width="1.2em"
                height="1.2em"
                style={{ marginRight: 8 }}
              >
                <g fill="none">
                  <path fill="url(#f517id0)" d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022" />
                  <path fill="url(#f517id1)" d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022" />
                  <path fill="url(#f517idb)" d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022" />
                  <path fill="url(#f517id2)" d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022" />
                  <path fill="url(#f517id3)" d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022" />
                  <path fill="url(#f517id4)" d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022" />
                  <path fill="url(#f517id5)" d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022" />
                  <path fill="url(#f517id6)" d="M12.555 8.935c1.537-2.397 2.447-4.611 2.921-6.177c.182-.6.95-.845 1.406-.415c6.873 6.481 9.12 11.43 9.567 17.148c.328 5.531-2.39 10.453-9.687 10.453c-6.85 0-11.907-4.781-11.22-12.36c.412-4.528 2.173-7.979 3.58-10.033c.438-.639 1.351-.648 1.856-.06l1.259 1.466c.087.101.246.09.318-.022" />
                  <g filter="url(#f517idf)">
                    <path fill="url(#f517id7)" d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118" />
                    <path fill="url(#f517id8)" d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118" />
                    <path fill="url(#f517id9)" d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118" />
                  </g>
                  <path fill="url(#f517idc)" d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118" />
                  <path fill="url(#f517ida)" d="M10.178 19.877c1.302-3.1 3.975-6.529 5.78-8.39a1.336 1.336 0 0 1 1.872-.038c3.461 3.189 4.503 6.072 5.387 9.428c.92 3.492 0 9.118-6.921 9.118c-5.96 0-8.026-5.578-6.118-10.118" />
                  <g filter="url(#f517idg)">
                    <path fill="url(#f517idd)" d="M11.814 11.539c2.315-3.39 3.67-7.058 4.083-7.962c-.603 4.634-2.36 8.028-5.668 12.398c-2.646 3.496-3.124 6.488-3.101 7.217c-.827-5.562 1.791-7.416 4.686-11.653" />
                  </g>
                  <g filter="url(#f517idh)">
                    <path fill="url(#f517ide)" d="M9.814 7.874c-1.3 1.614-3.884 6.09-3.82 11.084c1.28-5.122 4.275-6.736 3.82-11.084" />
                  </g>
                  <defs>
                    <radialGradient id="f517id0" cx="0" cy="0" r="1" gradientTransform="rotate(-179.474 12.046 9.805)scale(17.0988 25.7861)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF953D"></stop>
                      <stop offset="1" stopColor="#FF5141"></stop>
                    </radialGradient>
                    <radialGradient id="f517id1" cx="0" cy="0" r="1" gradientTransform="rotate(-157.937 6.712 6.816)scale(10.3441 17.8495)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#CE5327"></stop>
                      <stop offset="1" stopColor="#CE5327" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient id="f517id2" cx="0" cy="0" r="1" gradientTransform="rotate(24.015 -31.353 18.85)scale(3.10465 25.6991)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFAA7B"></stop>
                      <stop offset="1" stopColor="#FFAA7B" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient id="f517id3" cx="0" cy="0" r="1" gradientTransform="matrix(.843 3.74668 -4.675 1.05188 9.31 6.25)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF5E47"></stop>
                      <stop offset="1" stopColor="#FF5E47" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient id="f517id4" cx="0" cy="0" r="1" gradientTransform="matrix(.37467 10.13047 -9.3768 .3468 16.429 1.366)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF2F3C"></stop>
                      <stop offset="1" stopColor="#FF2F3C" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient id="f517id5" cx="0" cy="0" r="1" gradientTransform="matrix(2.07795 .9835 -1.9737 4.17002 13.9 4.8)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF846C"></stop>
                      <stop offset="1" stopColor="#FF846C" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient id="f517id6" cx="0" cy="0" r="1" gradientTransform="matrix(-.89842 2.09375 -.4798 -.20588 12.458 8.21)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFA682"></stop>
                      <stop offset="1" stopColor="#FFA682" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient id="f517id7" cx="0" cy="0" r="1" gradientTransform="rotate(-168.558 11.823 11.126)scale(10.0291 12.4891)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFDA2F"></stop>
                      <stop offset="1" stopColor="#FF8E41"></stop>
                    </radialGradient>
                    <radialGradient id="f517id8" cx="0" cy="0" r="1" gradientTransform="matrix(5.05808 13.20705 -11.47512 4.39478 12.4 8.592)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FD5639"></stop>
                      <stop offset="1" stopColor="#FE5533" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient id="f517id9" cx="0" cy="0" r="1" gradientTransform="matrix(-9.74917 .98358 -2.40823 -23.87023 19.239 20.629)" gradientUnits="userSpaceOnUse">
                      <stop offset=".628" stopColor="#D7812D" stopOpacity="0"></stop>
                      <stop offset="1" stopColor="#D7812D"></stop>
                    </radialGradient>
                    <radialGradient id="f517ida" cx="0" cy="0" r="1" gradientTransform="rotate(143.063 8.353 13.24)scale(16.0546 11.6174)" gradientUnits="userSpaceOnUse">
                      <stop offset=".772" stopColor="#F18A52" stopOpacity="0"></stop>
                      <stop offset="1" stopColor="#F18A52"></stop>
                    </radialGradient>
                    <linearGradient id="f517idb" x1="18.336" x2="18.336" y1="29.944" y2="24.846" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF7583"></stop>
                      <stop offset="1" stopColor="#FF7583" stopOpacity="0"></stop>
                    </linearGradient>
                    <linearGradient id="f517idc" x1="16.503" x2="16.503" y1="10.612" y2="14.259" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F95131"></stop>
                      <stop offset="1" stopColor="#F95131" stopOpacity="0"></stop>
                    </linearGradient>
                    <linearGradient id="f517idd" x1="14.996" x2="7.655" y1="4.255" y2="22.732" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF7558"></stop>
                      <stop offset="1" stopColor="#F38758"></stop>
                    </linearGradient>
                    <linearGradient id="f517ide" x1="9.541" x2="5.582" y1="8.144" y2="19.479" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF815B"></stop>
                      <stop offset="1" stopColor="#FF9C6D"></stop>
                    </linearGradient>
                    <filter id="f517idf" width="14.525" height="18.91" x="9.49" y="11.085" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                      <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix>
                      <feOffset dx=".5"></feOffset>
                      <feGaussianBlur stdDeviation=".25"></feGaussianBlur>
                      <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"></feComposite>
                      <feColorMatrix values="0 0 0 0 0.952941 0 0 0 0 0.615686 0 0 0 0 0.364706 0 0 0 1 0"></feColorMatrix>
                      <feBlend in2="shape" result="effect1_innerShadow_18_15821"></feBlend>
                    </filter>
                    <filter id="f517idg" width="11.424" height="22.115" x="5.723" y="2.327" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                      <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                      <feGaussianBlur result="effect1_foregroundBlur_18_15821" stdDeviation=".625"></feGaussianBlur>
                    </filter>
                    <filter id="f517idh" width="6.868" height="14.084" x="4.492" y="6.374" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                      <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                      <feGaussianBlur result="effect1_foregroundBlur_18_15821" stdDeviation=".75"></feGaussianBlur>
                    </filter>
                  </defs>
                </g>
              </svg>
              {localStorage.getItem("questionStreak") || "0"}
            </div>
          )}
        </div>
        {showPlus10 && (
          <div className="plus10-animation">{t("correctMessage")}</div>
        )}
        {/* Flashcard mode: only render one wide answer box for desktop/laptop, and fix mobile scroll logic */}
        {localStorage.getItem("mode") == "2" ? (
          <>
            <div
              style={{
                fontSize:
                  question.length < 150
                    ? (mobileDimension ? '18px' : '18px')
                    : question.length < 400
                    ? (mobileDimension ? '17px' : '17px')
                    : (mobileDimension ? '15px' : '15px'),
                marginTop: mobileDimension ? '24px' : '32px',
                marginBottom: mobileDimension ? '0px' : '0px',
                paddingLeft: '18px',
                paddingRight: mobileDimension ? '18px' : '32px',
                color: 'white',
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
                textAlign: 'left',
                lineHeight: '1.2',
                width: '100%',
                overflowWrap: 'break-word',
              }}
            >
              {formatBoldText(question)}
            </div>
            {reveal && (
              <div
                style={{
                  backgroundColor: '#6A6CFF10',
                  padding: '15px',
                  borderRadius: '15px',
                  border: '1px solid #6A6CFF30',
                  color: '#6A6CFF',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  boxShadow: '0 4px 12px rgba(106, 108, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  animation: 'fadeIn 0.4s ease-out',
                  maxWidth: mobileDimension ? '95%' : '80%',
                  width: mobileDimension ? '85%' : '95%',
                  textAlign: 'center',
                  margin: mobileDimension ? '16px auto 0 auto' : '24px auto 0 auto',
                }}
              >
                {(answer !== undefined && answer !== null) ? (
                  <div>
                    {formatBoldText(answer)}
                  </div>
                ) : (
                  <p style={{ color: '#FF6B6B' }}>{t('noAnswerAvailable')}</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div
            ref={questionBoxRef}
            className={isQuestionOverflowing ? 'question-scrollbox-overflowing' : ''}
            style={{
              maxHeight: mobileDimension ? '16dvh' : '18dvh',
              minHeight: '48px',
              overflowY: isQuestionOverflowing ? 'auto' : 'visible',
              marginTop: mobileDimension ? '20px' : '12px',
              marginBottom: mobileDimension ? '0px' : '2px',
              paddingLeft: '18px',
              paddingRight: '8px',
              color: 'white',
              borderRadius: isQuestionOverflowing ? '18px' : '8px',
              background: isQuestionOverflowing ? 'rgba(10,10,20,0.92)' : 'transparent',
              fontSize: isQuestionOverflowing
                ? (mobileDimension ? '18px' : '14px')
                : (
                   question.length < 150
                     ? (mobileDimension ? '18px' : '17px')
                     : question.length < 400
                     ? (mobileDimension ? '18px' : '15px')
                     : (mobileDimension ? '14px' : '12px')
                 ),
              transition: 'background 0.2s, font-size 0.2s, border-radius 0.2s',
            }}
          >
            <div
              style={{
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
                textAlign: 'left',
                lineHeight: '1.2',
                width: '100%',
                overflowWrap: 'break-word',
              }}
            >
              {formatBoldText(question)}
            </div>
            {/* Custom scrollbar for Webkit browsers - only if overflowing, and only for this box */}
            {isQuestionOverflowing && (
              <style>{`
                .question-scrollbox-overflowing::-webkit-scrollbar {
                  width: 5px;
                  background: transparent;
                  border-radius: 8px;
                  display: block;
                  opacity: 1 !important;
                }
                .question-scrollbox-overflowing::-webkit-scrollbar-thumb {
                  background: #6A6CFF;
                  border-radius: 8px;
                  min-height: 20px;
                  visibility: visible !important;
                  opacity: 1 !important;
                }
                .question-scrollbox-overflowing::-webkit-scrollbar-track {
                  background: transparent;
                }
                .question-scrollbox-overflowing {
                  scrollbar-gutter: stable both-edges;
                }
              `}</style>
            )}
          </div>
        )}
        {showComments && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom:0,
            width: mobileDimension ? '100%' : '100%',
            height: mobileDimension ? '100%' : '100%',
            maxWidth: mobileDimension ? '100vw' : undefined,
            zIndex: 100,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Comments
              comment={comment}
              randomColor={randomColor}
              formatBoldText={formatBoldText}
              setShowComments={setShowComments}
            />
          </div>
        )}
        {
          <div style={{ marginTop: mobileDimension ? 40 : 8 }}>
            {/*multiple choice*/}
            {(localStorage.getItem("mode") == 1 || isFavorites) && (
              !mobileDimension ? (
                <div
                  ref={choicesContainerRef}
                  style={{
                    marginTop: 2,
                    height: '50vh',
                    overflowY: 'auto',
                    marginBottom: 10,
                    width: '100%',
                    padding: 4,
                  }}
                >
                  {choices.map((choice, index) => {
                    // Determine main and shadow color
                    let mainColor = "white";
                    let shadowColor = "#ededed";
                    if (selectedChoice === index) {
                      if (selectedChoice === getCorrectAnswerIndex()) {
                        mainColor = "#7ed957";
                        shadowColor = "#8eea7a";
                      } else {
                        mainColor = "#ff7b7b";
                        shadowColor = "#ffb3b3";
                      }
                    } else if (isAnswered && index === getCorrectAnswerIndex() && reveal) {
                      mainColor = "#7ed957";
                      shadowColor = "#8eea7a";
                    } else if (isAnswered) {
                      mainColor = "#e0e0e0";
                      shadowColor = "#cccccc";
                    }
                    return (
                      <div key={index} style={{
                        width: '92%',
                        height: areChoicesOverflowing ? '44px' : '64px',
                        margin: '0 auto 12px auto',
                        borderRadius: '12px',
                        background: shadowColor,
                        display: 'flex',
                        alignItems: 'flex-start',
                        boxSizing: 'border-box',
                        padding: 0,
                        position: 'relative',
                      }}>
                        <button
                          className="cardButton"
                          style={{
                            width: '100%',
                            height: areChoicesOverflowing ? '36px' : '56px',
                            margin: 0,
                            border: 'none',
                            borderRadius: '12px',
                            background: mainColor,
                            color: cardStyle.textColor,
                            fontSize:
                              choice.length < 40
                                ? (areChoicesOverflowing ? "13px" : "15px")
                                : choice.length < 100
                                ? (areChoicesOverflowing ? "12px" : "14px")
                                : (areChoicesOverflowing ? "11px" : "12px"),
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            padding: '0 14px',
                            boxSizing: 'border-box',
                            cursor: isAnswered ? "not-allowed" : "pointer",
                            opacity: isAnswered && selectedChoice !== index ? 0.6 : 1,
                            outline: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                          onClick={() => {
                            handleChoiceClick(index, isFavorites);
                          }}
                        >
                          <Latex>{choice}</Latex>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  {choices.map((choice, index) => {
                    // Determine main and shadow color
                    let mainColor = "white";
                    let shadowColor = "#ededed";
                    if (selectedChoice === index) {
                      if (selectedChoice === getCorrectAnswerIndex()) {
                        mainColor = "#7ed957";
                        shadowColor = "#8eea7a";
                      } else {
                        mainColor = "#ff7b7b";
                        shadowColor = "#ffb3b3";
                      }
                    } else if (isAnswered && index === getCorrectAnswerIndex() && reveal) {
                      mainColor = "#7ed957";
                      shadowColor = "#8eea7a";
                    } else if (isAnswered) {
                      mainColor = "#e0e0e0";
                      shadowColor = "#cccccc";
                    }
                    return (
                      <div key={index} style={{
                        width: '95%',
                        height: areChoicesOverflowing ? '44px' : '8dvh',
                        margin: '0 auto 12px auto',
                        borderRadius: '12px',
                        background: shadowColor,
                        display: 'flex',
                        alignItems: 'flex-start',
                        boxSizing: 'border-box',
                        padding: 0,
                        position: 'relative',
                      }}>
                        <button
                          className="cardButton"
                          style={{
                            width: '100%',
                            height: areChoicesOverflowing ? '36px' : '90%',
                            margin: 0,
                            border: 'none',
                            borderRadius: '12px',
                            background: mainColor,
                            color: cardStyle.textColor,
                            fontSize:
                              choice.length < 40
                                ? (areChoicesOverflowing ? "13px" : "15px")
                                : choice.length < 100
                                ? (areChoicesOverflowing ? "12px" : "14px")
                                : (areChoicesOverflowing ? "11px" : "12px"),
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            padding: '0 14px',
                            boxSizing: 'border-box',
                            cursor: isAnswered ? "not-allowed" : "pointer",
                            opacity: isAnswered && selectedChoice !== index ? 0.6 : 1,
                            outline: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                          onClick={() => {
                            handleChoiceClick(index, isFavorites);
                          }}
                        >
                          <Latex>{choice}</Latex>
                        </button>
                      </div>
                    );
                  })}
                </>
              )
            )}

                {/* free response mode */}
                
                {localStorage.getItem("mode") == "3" && (
                  <div style={{ 
                    width: "100%", 
                    marginBottom: "20px",
                    padding: "0 20px", 
                    boxSizing: "border-box"
                  }}>
                    <textarea
                      style={{
                        width: "100%", 
                        minHeight: `${textAreaMinHeight}px`,
                        maxHeight: window.innerHeight >= 708? `${textAreaMaxHeight}px` : "50px",
                        resize: "vertical",
                        overflowX: "hidden",
                        overflowY: "auto",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "1px solid white",
                        backgroundColor: "gainsboro",
                        fontSize: mobileDimension ? "16px" : "18px", // font size is responsive
                        marginBottom: "10px",
                        color: "black",
                        boxSizing: "border-box" 
                      }}
                      placeholder={t("typeYourAnswer")}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={isSubmitted}
                      className="freeResponseAnswer"
                    />
                    <button
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        cursor: isSubmitted ? "not-allowed" : "pointer",
                        color: "white",
                        background: "#6A6CFF",
                        boxShadow: "0px 2px 0px 0px #484AC3",
                        border: "none",
                        padding: mobileDimension ? "8px 12px" : "10px 15px", // padding changes
                        fontSize: mobileDimension ? "16px" : "18px", // font size changes
                        marginBottom: "10px",
                        opacity: isSubmitted ? 0.6 : 1,
                        transition: "background-color 0.2s ease", 
                        boxSizing: "border-box" 
                      }}
                      onClick={() => {
                        if (userAnswer.trim() === "") {
                          setShowWarning2(true);
                          setTimeout(() => {
                            setShowWarning2(false);
                          }, 3000);
                          return;
                        }
                        setIsSubmitted(true);
                        setIsAnswered(true);
                      }}
                      disabled={isSubmitted}
                    >
                      {t("submitAnswer")}
                    </button>
                    {showWarning2 === true ? (
                      userAnswer.trim() === "" ? (
                        <p
                          style={{
                            color: "#FF6B6B",
                            fontSize: "14px",
                            margin: "0",
                            textAlign: "center",
                          }}
                        >
                          {t("responseCannotBeBlank")}
                        </p>
                      ) : null
                    ) : null}
                  </div>
                )}
                <div style={{ width: "90%" }}>
                  <p
                    style={{
                      margin: "0% 0px",
                      color: "#6A6CFF",
                      fontSize: "18px",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* reveals the answer in flashcard mode */}
                    {/* {localStorage.getItem("mode") == "2" && reveal && (
                      <div
                        style={{
                          backgroundColor: "#6A6CFF10",
                          padding: "15px",
                          borderRadius: "15px",
                          border: "1px solid #6A6CFF30",
                          color: "#6A6CFF",
                          fontSize: "16px",
                          lineHeight: "1.5",
                          marginTop: "15px",
                          boxShadow: "0 4px 12px rgba(106, 108, 255, 0.1)",
                          transition: "all 0.3s ease",
                          animation: "fadeIn 0.4s ease-out",
                          maxHeight: "60vh",
                          overflowY: "auto"
                        }}
                      >
                        {(answer !== undefined && answer !== null) ? (
                          <div>
                            {formatBoldText(answer)}
                          </div>
                        ) : (
                          <p style={{ color: "#FF6B6B" }}>{t("noAnswerAvailable")}</p>
                        )}
                      </div>
                    )} */}

              {/* For mode 3 - slide up/down container */}
              {localStorage.getItem("mode") == "3" && (reveal || isClosing) && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    backgroundColor: "#1B1B1B",
                    borderTopLeftRadius: "15px",
                    borderTopRightRadius: "15px",
                    padding: "20px",
                    boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.2)",
                    animation: `${isClosing ? 'slideDown' : 'slideUp'} 0.3s ease-out forwards`,
                    zIndex: 99999,
                    maxHeight: "60vh",
                    overflowY: "auto",
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                    boxSizing: "border-box", 
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <h3
                      style={{
                        color: "#6A6CFF",
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: "500",
                      }}
                    >
                      {t("answerGuideline")}
                    </h3>
                    <button
                      onClick={() => {
                        setIsClosing(true);
                        setTimeout(() => {
                          setIsClosing(false);
                          setReveal(false);
                        }, 300);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        fontSize: "20px",
                        cursor: "pointer",
                        padding: "5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        transition: "background-color 0.2s",
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#6A6CFF20",
                      padding: "15px",
                      borderRadius: "10px",
                      border: "1px solid #6A6CFF40",
                      color: "#6A6CFF",
                      fontSize: "16px",
                      lineHeight: "1.5",
                    }}
                  >                   
                    {answer !== undefined && answer !== null ? (
                      <div>
                        {formatBoldText(answer)}
                      </div>
                      ) : (
                        <p style={{ color: "#FF6B6B" }}>{t("noAnswerAvailable")}</p>
                      )}       
                    
                  </div>
                </div>
              )}
              </p>
              <div
                style={{
                  position: "absolute",
                  bottom: "25px",
                  width: "90%",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
              >
                {showWarning && localStorage.getItem("mode") === "3" && (
                  <p
                    style={{
                      color: "#FF6B6B",
                      fontSize: "14px",
                      margin: "0 0 10px 0",
                      textAlign: "center",
                      width: "60%",
                      marginRight: "auto",
                    }}
                  >
                    {t("pleaseSubmitAnswerFirst")}
                  </p>
                )}
              </div>
            </div>
          </div>
        }

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
            width: '100%',
            zIndex: 3,
            position: 'absolute',
            left: 0,
            bottom: 25,
            paddingLeft: 20,
            paddingBottom: mobileDimension ? 10 : 27,
            background: 'transparent',
          }}
        >
          {/* Reveal Answer Button */}
          <button
            style={{
              borderRadius: "10px",
              cursor:
                localStorage.getItem("mode") === "3" && !isSubmitted
                  ? "not-allowed"
                  : localStorage.getItem("mode") === "1" && reveal
                  ? "not-allowed"
                  : "pointer",
              color: "white",
              background:
                localStorage.getItem("mode") === "3" && !isSubmitted
                  ? "#6A6CFF80"
                  : localStorage.getItem("mode") === "2"
                  ? reveal ? "#FF6B6B" : "#6A6CFF"
                  : "#6A6CFF",
              boxShadow: localStorage.getItem("mode") === "2" && reveal 
                ? "0px 2px 0px 0px #C84B4B"
                : "0px 2px 0px 0px #484AC3",
              border: "none",
              width: '60%',
              minWidth: 120,
              height: 48,
              padding: '10px 15px',
              fontSize: "18px",
              position: "relative",
              overflow: "hidden",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="revealAnswerButton"
            onClick={handleRevealAnswer}
          >
            {localStorage.getItem("mode") === "2"
              ? reveal
                ? t("hideAnswer")
                : t("revealAnswer")
              : t("revealAnswer")}
            {localStorage.getItem("mode") === "2" && (
              <span style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "14px",
                opacity: 0.8
              }}>
                {reveal ? "↓" : "↑"}
              </span>
            )}
          </button>
          {/* Like (Heart) Button */}
          {(localStorage.getItem("mode") == 1 || isFavorites) && (
            <div
              style={{
                background: '#23232a',
                borderRadius: 10,
                height: 48,
                width: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                cursor: 'pointer',
              }}
              onClick={handleHeartClick}
            >
              <i
                style={{
                  color: iconGrey,
                  fontSize: 17,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
                id={isFavorite ? "heart-clicked" : "heart-unclicked"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  width="1.7em"
                  height="1.7em"
                  style={{ display: 'block', margin: 'auto' }}
                >
                  <path
                    fill={isFavorite ? "#6A6CFF" : iconGrey}
                    d="M17.718 7h-.002c-6.814 0-12.18 3.957-14.723 10.855c-5.788 15.71 15.227 29.479 24.2 35.357c1.445.946 3.082 2.019 3.404 2.354L31.851 57l1.397-1.292c.232-.204 1.305-.891 2.342-1.555c8.605-5.508 31.459-20.141 25.402-36.318c-2.566-6.857-7.941-10.79-14.742-10.79c-5.744 0-11.426 2.763-14.313 6.554C28.955 9.75 23.345 7 17.718 7"
                  ></path>
                </svg>
              </i>
            </div>
          )}
          {/* Comment Button */}
          {(localStorage.getItem("mode") == 1 || isFavorites) && hasSubscription && (
            <div
              style={{
                background: '#23232a',
                borderRadius: 10,
                height: 48,
                width: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                cursor: 'pointer',
              }}
              onClick={() => setShowComments(!showComments)}
            >
              <svg
                fill={iconGrey}
                width="1.7em"
                height="1.7em"
                viewBox="0 0 24 24"
                id="Layer_1"
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.5,12A9.5,9.5,0,1,0,12,21.5h9.5l-2.66-2.92A9.43,9.43,0,0,0,21.5,12Z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;

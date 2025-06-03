import React, { useRef, useState, useEffect } from "react";
import QuestionCard from "./QuestionCard";
import { Link } from "react-router-dom";
import { jsonrepair } from "jsonrepair";
import ScrollerLoader from "./mini_components/ScrollerLoader";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/Firebase";
import { auth } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useTranslation } from 'react-i18next';

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100dvh",
  width: "100%",
  overflowY: "auto", // Change from 'scroll' to 'auto'
  scrollSnapType: "y mandatory", // Enforce snapping on the y-axis
  scrollBehavior: "smooth", // Smooth scrolling
  boxSizing: "border-box",
  padding: "0px",
  margin: "0px",
  alignItems: "center",
  overflowX: 'hidden',
  maxWidth: '100dvw',
};

const getCardContainerStyle = (mobileDimension) => ({
  display: 'flex',
  flexDirection: mobileDimension ? 'column' : 'row',
  height: '100dvh',
  scrollSnapAlign: 'start',
  scrollSnapStop: 'always',
  overflowX: 'hidden',
  maxWidth: '100dvw',
  justifyContent: mobileDimension ? 'flex-start' : 'center',
  alignItems: mobileDimension ? 'stretch' : 'center',
});

const loadingStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100dvh",
  fontSize: "24px",
  color: "#888",
};

// const AdCard = () => {
//   return (
//     <div
//       style={{
//         height: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#f0f0f0",
//         scrollSnapAlign: "start",
//         outline:"1px solid gainsboro",
//         borderRadius:"10px"
//       }}
//     >
//       <p style={{ fontSize: "24px", color: "#888" }}>Advertisement</p>
//     </div>
//   );
// };

const QuestionScroller = ({ setStreak, setXP, currentSet, mobileDimension}) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [userLanguage, setUserLanguage] = useState("English"); // default

  const [questions, setQuestions] = useState(
    localStorage.getItem("lastFlashSet")
      ? JSON.parse(localStorage.getItem("lastFlashSet"))
      : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (currentSet) {
      const savedIndex = localStorage.getItem(`scrollPosition_${currentSet.title}`);
      return savedIndex ? parseInt(savedIndex) : 0;
    }
    return 0;
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser.email);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("previousQuestionsLength", "0");
  }, []);
  // Save current index to localStorage whenever it changes
  useEffect(() => {
    if (currentSet) {
      const previousQuestionsLength = parseInt(localStorage.getItem("previousQuestionsLength") || "0");
      const adjustedIndex = currentIndex - previousQuestionsLength;
      if (adjustedIndex >= 0) {
        localStorage.setItem(`scrollPosition_${currentSet.title}`, adjustedIndex.toString());
      } else {
        localStorage.setItem(`scrollPosition_${currentSet.title}`, "0");
      }
    }
  }, [currentIndex, currentSet]);

  // Restore scroll position when component mounts or questions change
  useEffect(() => {
    if (containerRef.current && currentSet && questions.length > 0) {
      const savedIndex = localStorage.getItem(`scrollPosition_${currentSet.title}`);
      if (savedIndex) {
        const previousQuestionsLength = parseInt(localStorage.getItem("previousQuestionsLength") || "0");
        const adjustedIndex = parseInt(savedIndex) - previousQuestionsLength;
        
        if (adjustedIndex >= 0) {
          const scrollHeight = containerRef.current.clientHeight;
          containerRef.current.scrollTop = scrollHeight * adjustedIndex;
          setCurrentIndex(adjustedIndex);
          // Scroll to the correct card for both MCQ and FRQ
          if (cardsRef.current[adjustedIndex]) {
            cardsRef.current[adjustedIndex].scrollIntoView({ behavior: 'auto', block: 'start' });
          }
        } else {
          setCurrentIndex(0);
        }
      }
    }
  }, [currentSet, questions.length]);

  // Initialize previousQuestionsLength to 0 whenever the page is visited


  useEffect(() => {
    if (
      questions.length === 0 &&
      !localStorage.getItem("lastFlashSet") &&
      currentSet
    ) {
      fetchQuestions();
    }
  }, [questions]);

  // Function to check and update streak
  const checkAndUpdateStreak = async () => {
    if (!user) return;

    const today = new Date();
    const userRef = doc(db, "users", user);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const langCode = userDoc.data().language || "en";
      const langMap = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
        zh: "Chinese",
        hi: "Hindi",
        ar: "Arabic",
        pt: "Portuguese",
        ru: "Russian",
        ja: "Japanese",
        ko: "Korean",
      };
      setUserLanguage(langMap[langCode] || "English");
    }

    if (!userDoc.exists()) {
      // First time user
      await updateDoc(userRef, {
        streak: 1,
        lastStreakUpdate: today.toISOString()
      });
      setStreak(1);
      return;
    }

    const userData = userDoc.data();
    const lastStreakUpdate = userData.lastStreakUpdate;
    const currentStreak = userData.streak || 0;

    if (!lastStreakUpdate) {
      // First time user
      await updateDoc(userRef, {
        streak: 1,
        lastStreakUpdate: today.toISOString()
      });
      setStreak(1);
      return;
    }

    const lastUpdate = new Date(lastStreakUpdate);
    const isSameDay = today.getDate() === lastUpdate.getDate() &&
                    today.getMonth() === lastUpdate.getMonth() &&
                    today.getFullYear() === lastUpdate.getFullYear();

    const isNextDay = today.getDate() === lastUpdate.getDate() + 1 &&
                    today.getMonth() === lastUpdate.getMonth() &&
                    today.getFullYear() === lastUpdate.getFullYear();

    if (isSameDay) {
      // Already updated today, don't change anything
      return;
    }

    if (isNextDay) {
      // Consecutive day, increment streak
      const newStreak = currentStreak + 1;
      await updateDoc(userRef, {
        streak: newStreak,
        lastStreakUpdate: today.toISOString()
      });
      setStreak(newStreak);
    } else {
      // Not consecutive, reset streak to 1
      await updateDoc(userRef, {
        streak: 1,
        lastStreakUpdate: today.toISOString()
      });
      setStreak(1);
    }
  };
 

  // Add streak check on component mount
  useEffect(() => {
    checkAndUpdateStreak();
  }, [user]);

  const handleScroll = () => {
    if (isFetching) return;

    const container = containerRef.current;
    if (!container) return;

    const newIndex = Math.floor(container.scrollTop / container.clientHeight);
    setCurrentIndex(newIndex);
    const currentMode = localStorage.getItem("mode");
    const cardsBeforeEnd = (currentMode === "3" ? questions.length - 3 : questions.length - 4);

    if (currentIndex >= cardsBeforeEnd && !isFetching) {
      setIsFetching(true);
      fetchQuestions();
    }
  };

  const fetchQuestions = async () => {
    const options = {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        info: currentSet,
        lastQuestionSet: questions.slice(-10),
        mode: localStorage.getItem("mode"),
        language: localStorage.getItem('language') || 'en',
      }),
    };

    try {
      const response = await fetch(
        'http://localhost:5001/genAI/generate-questions',
        options
      );
      console.log(response)
      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      const newQuestions = JSON.parse(jsonrepair(data));
      const modifiedQuestions = newQuestions.map((question) => {
        return {
          ...question,
          title: currentSet.title,
          color: currentSet.color,
        };
      });

      if (Array.isArray(newQuestions)) {
        // Increment previousQuestionsLength by 10 for each new set
        const currentPreviousLength = localStorage.getItem("previousQuestionsLength");
        if (!currentPreviousLength) {
          localStorage.setItem("previousQuestionsLength", "0");
        } else {
          localStorage.setItem("previousQuestionsLength", (parseInt(currentPreviousLength) + 10).toString());
        }

        // Clear old question states when loading new questions
        const questionStates = JSON.parse(localStorage.getItem("questionStates") || "{}");
        const newQuestionStates = {};
        modifiedQuestions.forEach(q => {
          const key = `question_${q.question.replace(/[^a-zA-Z0-9]/g, '_')}`;
          if (questionStates[key]) {
            newQuestionStates[key] = questionStates[key];
          }
        });
        localStorage.setItem("questionStates", JSON.stringify(newQuestionStates));

        setQuestions((prevQuestions) => [
          ...prevQuestions,
          ...modifiedQuestions,
        ]);
        localStorage.setItem("lastFlashSet", JSON.stringify(modifiedQuestions));
      } else {
        console.error("Unexpected response format:", data);
      }

      setIsFetching(false);
    } catch (e) {
      console.error("Error fetching questions:", e);
      setIsFetching(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: '100dvh',
        overflowX: 'hidden',
        maxWidth: '100dvw',
        zIndex: 1,
        ...(mobileDimension ? {
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        } : {
          justifyContent: 'center',
          alignItems: 'center',
        }),
      }}
    >
      {/* Purple semicircle gradient overlay for the whole page background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '180vw',
        height: '100vw',
        background: 'radial-gradient(ellipse at 50% 0%,rgb(2, 3, 60) 0%, rgba(2, 3, 70, 0.45) 40%, rgba(0,0,0,0.85) 80%, #000 100%)',
        zIndex: 0,
        pointerEvents: 'none',
        borderBottomLeftRadius: '90vw',
        borderBottomRightRadius: '90vw',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }} />
      {isFetching && (
        <div
          style={{
            position: "fixed",
            top: mobileDimension? "5px" : "10px",
            left: mobileDimension ? "50%" : "calc(50% + 110px)",
            transform: "translateX(-50%)",
            backgroundColor: "#6A6CFF",
            color: "white",
            fontSize: "13px",
            fontWeight: "500",
            padding: mobileDimension ? "3px 10px" : "5px 12px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(106, 108, 255, 0.4)",
            zIndex: "999",
            animation: "gentle-pulse 1.5s infinite ease-in-out",
            width: "auto",
            maxWidth: mobileDimension ? "calc(350px - 20px)" : "400px"
          }}
        >
          <span>{t('loadingMoreQuestions')}</span>
          <div className="loader_mini" style={{ 
            margin: 0,
            width: "6px", 
            height: "6px",
            border: "4px solid rgb(73, 73, 255)"
          }}></div>
        </div>
      )}
      {questions.length > 1 ? (
        <div ref={containerRef} style={containerStyle} onScroll={handleScroll}>
          {questions.map((item, index) => (
            <div key={index} ref={(el) => (cardsRef.current[index] = el)}>
              {/* {index > 0 && index % 3 === 0 && <AdCard />} Insert ad every 3 cards */}
              <div style={getCardContainerStyle(mobileDimension)}>
                {!isLoading && (
                  <QuestionCard
                  question={item.question || ""}
                  choices={item.choices || []} // Default to an empty array if undefined
                  answer={item.answer || ""}
                  selectedAnswer={item.selectedAnswer || null}
                  comment={item.comments || []} // Default to an empty array if undefined
                  setStreak={setStreak}
                  setXP={setXP}
                  title={item.title || ""}
                  color={item.color || ""}
                  fullJSON={item}
                  currentIndex={currentIndex}
                  mobileDimension={mobileDimension}
                />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ScrollerLoader/>
      )}
    </div>
  );
};

export default QuestionScroller;

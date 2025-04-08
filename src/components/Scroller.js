import React, { useRef, useState, useEffect } from "react";
import QuestionCard from "./QuestionCard";
import { Link } from "react-router-dom";
import { jsonrepair } from "jsonrepair";
import ScrollerLoader from "./mini_components/ScrollerLoader";

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
};

const cardContainerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100dvh", // Each card takes up full viewport height
  scrollSnapAlign: "start", // Snap to the start of each card
  scrollSnapStop: "always", // Stop scrolling at each snap point
};

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
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
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

  // Add streak check on component mount
  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  // Function to check and update streak
  const checkAndUpdateStreak = () => {
    const today = new Date();
    const lastStreakUpdate = localStorage.getItem('lastStreakUpdate');
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');

    if (!lastStreakUpdate) {
      // First time user
      localStorage.setItem('streak', '1');
      localStorage.setItem('lastStreakUpdate', today.toISOString());
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
      localStorage.setItem('streak', newStreak.toString());
      localStorage.setItem('lastStreakUpdate', today.toISOString());
      setStreak(newStreak);
    } else {
      // Not consecutive, reset streak to 1
      localStorage.setItem('streak', '1');
      localStorage.setItem('lastStreakUpdate', today.toISOString());
      setStreak(1);
    }
  };

  const handleScroll = () => {
    if (isFetching) return;

    const container = containerRef.current;
    if (!container) return;

    const newIndex = Math.floor(container.scrollTop / container.clientHeight);
    setCurrentIndex(newIndex);
    const threeBeforeEnd = questions.length - 3;

    if (currentIndex >= threeBeforeEnd && !isFetching) {
      setIsFetching(true);
      fetchQuestions();
    }
  };

  const fetchQuestions = async () => {
    const options = {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        info: currentSet,
        lastQuestionSet: questions.slice(-10),
        mode: localStorage.getItem("mode"),
      }),
    };

    try {
      const response = await fetch(
        "https://hfob3eouy6.execute-api.us-west-2.amazonaws.com/production/",
        options
      );

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
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isFetching && (
        <p
          style={{
            position: "absolute",
            top: "1%",
            textAlign: "center",
            backgroundColor: "white",
            padding: "5px 10px",
            borderRadius: "100px",
            display: "flex",
            width: "300px",
            justifyContent: "space-around",
            boxShadow: "0px 0px 1px 1px gainsboro",
            zIndex: "999",
            color:'black'
          }}
        >
          Loading More Questions
          <div className="loader_mini"></div>
        </p>
      )}
      {questions.length > 1 ? (
        <div ref={containerRef} style={containerStyle} onScroll={handleScroll}>
          {questions.map((item, index) => (
            <div key={index} ref={(el) => (cardsRef.current[index] = el)}>
              {/* {index > 0 && index % 3 === 0 && <AdCard />} Insert ad every 3 cards */}
              <div style={cardContainerStyle}>
                {!isLoading && (
                  <QuestionCard
                    question={item.question}
                    choices={item.choices}
                    answer={item.answer}
                    selectedAnswer={item.selectedAnswer}
                    comment={item.comments}
                    setStreak={setStreak}
                    setXP={setXP}
                    title={item.title && item.title}
                    color={item.color && item.color}
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
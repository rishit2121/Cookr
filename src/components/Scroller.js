import React, { useRef, useState, useEffect } from "react";
import QuestionCard from "./QuestionCard";
import { Link } from "react-router-dom";
import { jsonrepair } from "jsonrepair";
import AdCard from './adComponent'

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
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
  height: "100vh", // Each card takes up full viewport height
  scrollSnapAlign: "start", // Snap to the start of each card
  scrollSnapStop: "always", // Stop scrolling at each snap point
};

const loadingStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
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

const QuestionScroller = ({ setStreak, setXP, currentSet }) => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [questions, setQuestions] = useState(
    localStorage.getItem("lastSet")
      ? JSON.parse(localStorage.getItem("lastSet"))
      : []
  );
  const processedAdIndices = useRef(new Set()); // Track indices where timer is applied
  const [isScrollingDisabled, setIsScrollingDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Flag for showing the loading indicator
  const [isFetching, setIsFetching] = useState(false); // Flag for indicating an API call
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current card index
  useEffect(() => {
    if (
      questions.length < 1 &&
      !localStorage.getItem("lastSet") &&
      (currentSet != null || currentSet != undefined)
    ) {
      fetchQuestions();
    }
    console.log(questions)
  }, []);

  const handleScroll = () => {
    if (isFetching || isScrollingDisabled) return;

    const container = containerRef.current;
    if (!container) return;

    const newIndex = Math.floor(container.scrollTop / window.innerHeight) + 1;
    setCurrentIndex(newIndex);
    console.log(newIndex)
    // if (newIndex % 4 === 0 && !processedAdIndices.current.has(newIndex)) {
    //   // Disable scrolling for 3 seconds
    //   processedAdIndices.current.add(newIndex); // Mark as processed
    //   setIsScrollingDisabled(true);
    //   container.style.overflowY = "hidden";

    //   setTimeout(() => {
    //     setIsScrollingDisabled(false);
    //     container.style.overflowY = "auto";
    //   }, 3000);
    // }

    const threeBeforeEnd = Math.floor(questions.length / 3) + questions.length - 3;
    if (newIndex >= threeBeforeEnd && !isFetching) {
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
      const newQuestions = JSON.parse(data);
      const modifiedQuestions = newQuestions.map((question) => {
        return {
          ...question, // Keep existing fields
          title: currentSet.title,
          color: currentSet.color,
        };
      });

      // Check if the response is an array
      if (Array.isArray(newQuestions)) {
        setQuestions((prevQuestions) => [
          ...prevQuestions,
          ...modifiedQuestions,
        ]);
        localStorage.setItem("lastSet", JSON.stringify(modifiedQuestions));
      } else {
        console.error("Unexpected response format:", data);
      }

      setIsFetching(false); // Reset fetching flag
    } catch (e) {
      console.error("Error fetching questions:", e);
      setIsFetching(false); // Reset fetching flag in case of error
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
              {/* {index > 0 && index % 3 === 0 && <div style={cardContainerStyle}><AdCard /></div>} */}
              <div style={cardContainerStyle}>
                {!isLoading && (
                  <QuestionCard
                    question={item.question}
                    choices={item.choices}
                    answer={item.answer}
                    comment={item.comments}
                    selectedAnswer={item.selectedAnswer}
                    setStreak={setStreak}
                    setXP={setXP}
                    title={item.title && item.title}
                    color={item.color && item.color}
                    fullJSON={item}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <p>Initializing Scroller...</p>
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default QuestionScroller;

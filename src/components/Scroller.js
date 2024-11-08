import React, { useRef, useState, useEffect, useCallback } from "react";
import QuestionCard from "./QuestionCard";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';

import { jsonrepair } from "jsonrepair";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100%",
  overflowY: "auto",
  scrollSnapType: "y mandatory",
  scrollBehavior: "smooth",
  boxSizing: "border-box",
  padding: "0px",
  margin: "0px",
  alignItems: "center",
};

const cardContainerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh", 
  scrollSnapAlign: "start", 
  scrollSnapStop: "always", 
};

const AdCard = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        scrollSnapAlign: "start",
        outline:"1px solid gainsboro",
        borderRadius:"10px"
      }}
    >
      <p style={{ fontSize: "24px", color: "#888" }}>Advertisement</p>
    </div>
  );
};

const QuestionScroller = ({ setStreak, setXP, currentSet }) => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [questions, setQuestions] = useState(
    localStorage.getItem("lastSet")
      ? JSON.parse(localStorage.getItem("lastSet"))
      : []
  );
  const [isLoading, setIsLoading] = useState(false); 
  const [isFetching, setIsFetching] = useState(false); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const location = useLocation();


  const [lastSnapIndex, setLastSnapIndex] = useState(null); // Track the last snap index


  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    if (isFetching) return; 
  
    const container = containerRef.current;
    if (!container) return;

    let visibleIndex = Math.floor(container.scrollTop / container.clientHeight);
    visibleIndex = visibleIndex + 1;
    var adIndex=visibleIndex
    const cards = Math.floor(visibleIndex / 4);
    visibleIndex = visibleIndex - cards;

    const thirdToLastIndex = questions.length - 3;
    // console.log(visibleIndex)
    // console.log(thirdToLastIndex)
    // console.log(adIndex)
    // console.log(lastSnapIndex)
    // If an advertisement card is visible, lock scrolling

    if (adIndex % 4 === 0 && adIndex > lastSnapIndex) {
      setLastSnapIndex(adIndex); // Update last snap index

      // If an advertisement card is visible, lock scrolling
      container.style.overflowY = "hidden"; 
      container.style.pointerEvents = "none"; 

      setTimeout(() => {
        container.style.overflowY = "auto"; 
        container.style.pointerEvents = "auto"; 
      }, 3000); 

      // Fetch more questions if necessary
    }
    if (visibleIndex >= thirdToLastIndex && !isFetching) {
      setIsFetching(true);
      fetchQuestions();
    }
  }, [isFetching, questions.length, lastSnapIndex]);
  useEffect(() => {
    console.log("Scroll event listener useEffect running");
  
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      
      // Cleanup function to remove the event listener
      return () => {
        // console.log("Cleaning up scroll event listener");
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]); // Dependency array includes handleScroll
  
  

  useEffect(() => {

    // Cleanup function to remove event listener
    return () => {
      console.log("Location changed:", location.pathname);

    const container = containerRef.current;

    // Restore scroll position from localStorage when the route changes
    if (container) {
      const savedScrollPosition = localStorage.getItem("scrollPosition");
      if (savedScrollPosition) {
        container.scrollTop = parseInt(savedScrollPosition, 10);
      }
    }

    // Function to save scroll position to localStorage
    const saveScrollPosition = () => {
      console.log(container)
      if (container) {
        let visibleIndex = Math.floor(container.scrollTop / container.clientHeight);
        visibleIndex += 1;
        const cards = Math.floor(visibleIndex / 4);
        visibleIndex -= cards;
        console.log(visibleIndex, questions.length - 10);
        if (visibleIndex > questions.length - 10) {
          localStorage.setItem("scrollPosition", (visibleIndex - (questions.length - 10)) * window.innerHeight);
        }
        console.log("hey")
        console.log((visibleIndex - (questions.length - 10)) * window.innerHeight);
      }
    };

    // Call saveScrollPosition when the location changes
    console.log("hi")
    saveScrollPosition();
    };
  }, [location]); // Trigger effect only when location changes

  
  

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
          ...question, 
          title: currentSet.title,
          color: currentSet.color,
        };
      });

      if (Array.isArray(newQuestions)) {
        setQuestions((prevQuestions) => [
          ...prevQuestions,
          ...modifiedQuestions,
        ]);
        localStorage.setItem("lastSet", JSON.stringify(modifiedQuestions));
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
          }}
        >
          Loading More Questions
          <div className="loader_mini"></div>
        </p>
      )}
      {questions.length > 1 ? (
        <div ref={containerRef} style={containerStyle}>
          {questions.map((item, index) => (
            <div key={index} ref={(el) => (cardsRef.current[index] = el)}>
              {index > 0 && index % 3 === 0 && <AdCard />} 
              <div style={cardContainerStyle}>
                {!isLoading && (
                  <QuestionCard
                    question={item.question}
                    choices={item.choices}
                    answer={item.answer}
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

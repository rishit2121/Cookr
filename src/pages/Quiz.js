import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import Latex from "react-latex-next";

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, color } = location.state || {};
  const [time, setTime] = useState(5 * 60); // Default value set to 5 minutes in seconds
  const [questions, setQuestions] = useState([]); // State to store questions
  const [isFetching, setIsFetching] = useState(false); // State to manage loading state
  const [showQuiz, setShowQuiz] = useState(false); // State to manage display of quiz questions
  const [selectedAnswers, setSelectedAnswers] = useState({}); // State to store selected answers
  const [correctAnswers, setCorrectAnswers] = useState({}); // State to store correct answers
  const [mobileDimension, setMobileDimension] = useState(false);

  // Fetch questions from the server
  const fetchQuestions = async () => {
    console.log(location.state)
    setIsFetching(true);
    const options = {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        info: location.state,
        lastQuestionSet: [],
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
          title: title,
          color: color,
        };
      });

      // Store correct answers
      const answerMap = {};
      modifiedQuestions.forEach(q => {
        answerMap[q.id] = q.correctAnswer; // Assuming 'id' and 'correctAnswer' fields exist
      });
      setCorrectAnswers(answerMap);

      setQuestions(modifiedQuestions);
      setShowQuiz(true);
      setIsFetching(false);
    } catch (e) {
      console.error("Error fetching questions:", e);
      setIsFetching(false);
    }
  };

  // Handle the "Next" button click
  const handleNext = () => {
    fetchQuestions(); // Fetch questions when Next is clicked
  };
  const handleChange = (e) => {
    const selectedTime = Number(e.target.value);
    console.log(`Selected Time (minutes): ${selectedTime}`); // Debugging log
    setTime(selectedTime * 60); // Convert minutes to seconds and update state
  };
  
  // Use useEffect to log the updated time value
  useEffect(() => {
    console.log(`Updated Time (seconds): ${time}`);
  }, [time]); // 

  // Handle changes in selected answers
  const handleAnswerChange = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  // Calculate the score and navigate to results
  const handleGrade = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        score += 1;
      }
    });
    navigate('/results', {
      state: { score, total: questions.length, selectedAnswers, questions }
    });
  };

  // Timer effect
  useEffect(() => {
    if (time === 0) {
      handleGrade(); // Submit quiz when time runs out
      return; // Prevent further execution if time has reached zero
    }
    if(showQuiz===true){
      console.log('hey')
    const timer = setInterval(() => {
      setTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
    }
 // Cleanup interval on component unmount
  });

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div style={{ height: "100%" }}>
      <div
        className="App"
        style={{ display: "flex", height: "100%", overflow: "hidden" }}
      >
        <div>
          <Navbar setMobileDimension={setMobileDimension} />
        </div>

        <div
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {!showQuiz ? (
            <>
              <h1>Ready To Take the {title} Quiz?</h1>
              <div style={{ height: "4%" }}></div>
              <div>How long would you like the test to be?</div>

              <div style={{ margin: "20px 0" }}>
              <select
                value={(time / 60)} // Convert seconds to minutes for display
                onChange={handleChange}
                style={{
                  border: "2px solid #ccc",
                  outline: "none",
                  borderRadius: "12px",
                  padding: "10px 15px",
                  backgroundColor: "#f7f7f7",
                  fontSize: "16px",
                  color: "#333",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  width: "100%",
                  maxWidth: "200px",
                }}
              >
                <option value="" disabled>Select Time</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>

              </div>
            </>
          ) : (
            <div style={{ height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <h2>Quiz Questions</h2>
  <div
    style={{
      width: "15%",
      height: "40%",
      borderRadius: "15px", // Circular shapex
      border: "2px solid black", // Black border
      display: "flex",
      alignItems: "center",
      marginLeft:"15%",
      justifyContent: "center",
      fontSize: "16px",
      fontWeight: "bold",
      backgroundColor: "#ffffff", // White background for the circle
    }}
  >
    {formatTime(time)}
  </div>


                {showQuiz && (
                  <button
                    onClick={handleGrade}
                    style={{
                    //   marginBottom: "15px",
                      backgroundColor: "black",
                      color: "white",
                      padding: "10px",
                      marginLeft: "auto",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      minWidth: "100px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Submit
                  </button>
                )}
              </div>
              <div
                style={{
                  marginTop: "20px",
                  width: "100%",
                  maxWidth: "600px",
                  height: "calc(100vh - 120px)",
                  overflowY: "auto",
                }}
              >
                <div style={{ height: "20px" }}></div>
                {questions.length > 0 ? (
                  questions.map((question, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px",
                        height: "60%",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div style={{ height: "35%" }}>
                      <Latex>
                        {typeof question.question === 'string' ? question.question : 'Question corrupted'}
                      </Latex>

                      </div>
                      <div>
                        {question.choices.map((choice, choiceIndex) => (
                          <div
                            key={choiceIndex}
                            onClick={() => handleAnswerChange(index, choice)}
                            style={{
                              backgroundColor:
                                selectedAnswers[index] === choice
                                  ? "orange"
                                  : "#f7f7f7",
                              border: "1px solid #ccc",
                              height: "10%",
                              borderRadius: "8px",
                              padding: "10px",
                              margin: "5px 0",
                              cursor: "pointer",
                              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                              textAlign: "center",
                            }}
                          >
                            <Latex>
                        {typeof choice === 'string' ? choice : 'Answers not found'}
                      </Latex>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No questions available. Please click "Next" to fetch questions.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {!showQuiz && (
          <button
            onClick={handleNext}
            style={{
              marginTop: "15px",
              marginBottom: "15px",
              backgroundColor: "black",
              color: "white",
              padding: "10px",
              marginRight: "10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              minWidth: "100px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
                        {isFetching ? "Loading..." : "Next"}

          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;

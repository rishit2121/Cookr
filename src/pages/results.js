import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Latex from "react-latex-next";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";


const Results = () => {
  const location = useLocation();
  const { questions, selectedAnswers, correctAnswers, score } = location.state || {};
  const [mobileDimension, setMobileDimension] = useState(false);
  const navigate=useNavigate()
  return (
    <div className="App" style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div>
        <Navbar setMobileDimension={setMobileDimension} />
      </div>
      <div style={{ padding: "20px", width: "100%" }}>
        <div style={{display:'flex', flexDirection:"row"}}>
        <h1>Quiz Results</h1>
         <button
                  onClick={() => navigate("/library")}
                  style={{
                      marginBottom: "15px",
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
                    Done
                  </button>
        </div>
        <h2>Score: {score} / {questions.length}</h2>
        <div
          style={{
            maxHeight: "calc(100vh - 100px)", // Adjust based on the height of other elements
            overflowY: "auto", // Enables vertical scrolling
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {questions.map((question, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div>
              <Latex>
                        {typeof question.question === 'string' ? question.question : 'Question corrupted'}
                      </Latex>
              </div>
              <div>
                {selectedAnswers[index] === undefined ? (
                  <div style={{ color: "red" }}>You have not selected an answer for this question.</div>
                ) : (
                <div>
                  <strong>Your selected answer:</strong> <Latex>
                        {typeof selectedAnswers[index] === 'string' ? selectedAnswers[index] : 'Question corrupted'}
                      </Latex>
                  </div>
                )}
              </div>
              <div>
                <strong>Correct Answer:</strong> <Latex>
                        {typeof question.answer === 'string' ? question.answer : 'Answer is corrupted'}
                      </Latex>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;

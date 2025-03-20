import React, { useState, useEffect } from "react";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import MathJax from 'react-mathjax';
import Latex from "react-latex-next";



const FlippingCard = ({ question, answer, flipCard }) => {
  const [flipped, setFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


    

  // Use the flipCard prop to control the flip state of the card
  useEffect(() => {
    if (flipCard !== undefined) {
      setFlipped(flipCard); // If flipCard is true, show the back; if false, show the front
    }
  }, [flipCard]);

  const handleFlip = () => {
    setFlipped(!flipped); // Toggle the flip on click if needed
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault(); // Prevents page scrolling when pressing space
        setFlipped(!flipped)
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipped]);

  return (
    <div
      style={{
        perspective: "1000px", // Perspective should be applied here
        width: isMobile ? "100dvw" : "100dvw",
        height: isMobile ? "40dvh" : "47dvh",
        position: "relative",  // Ensure the 3D effect works
        margin: "auto"  // Center the card
      }}
      onClick={handleFlip} // Add click handler directly here
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", // Flip based on the flipped state
        }}
      >
        {/* Front Side */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#6A6CFF",
            boxShadow: "0px 0px 20px 10px rgba(57, 60, 241, 0.5)",
            color: "white",
            fontSize: "1.5rem",
            borderRadius: "10px",
            textAlign: 'center',
            
          }}
        >
          <div style={{display:'flex', height:'80%', width:'80%', alignItems:'center', justifyContent:'center'}}>
          <Latex>{flipped ? answer : question}</Latex>
          </div>
        </div>
  

        {/* Back Side */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#6A6CFF",
            color: "white",
            fontSize: "1.5rem",
            borderRadius: "10px",
            transform: "rotateY(180deg)", // Rotate back side for the flip effect
            textAlign: 'center',
          }}
        >
            <div style={{display:'flex', height:'80%', width:'80%', alignItems:'center', justifyContent:'center'}}>
            <Latex>{flipped ? answer : question}</Latex>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlippingCard;

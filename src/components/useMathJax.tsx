import React, { useEffect, useRef } from "react";

interface MyLatexProps {
  question: {
    question: string;
  };
}

function MyLatex({ question }: MyLatexProps) {
  const mathContainerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (window.MathJax) {
      const mathJax = window.MathJax as any; // Type assertion for MathJax

      // Ensure MathJax is fully loaded and initialized
      mathJax.typesetPromise([mathContainerRef.current])
        .catch((err: any) => console.error("MathJax typeset failed: ", err));
    } else {
      console.error("MathJax is not loaded.");
    }
  }, [question]);

  return <p ref={mathContainerRef}>{question.question}</p>;
}

export default MyLatex;

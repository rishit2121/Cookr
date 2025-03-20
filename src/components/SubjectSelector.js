import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebase/Firebase"; // Adjust the import based on your project setup

const SubjectSelector = ({ onSubjectChange }) => { // Added onSubjectChange prop
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(
    localStorage.getItem("currentFlashcard") || ""
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userDoc = doc(db, "users", user.email);
        const unsubscribeSnapshot = onSnapshot(userDoc, (doc) => {
          if (doc.exists()) {
            const fetchedSubjects = doc.data().sets || [];
            setSubjects(fetchedSubjects);

            // Set initial selection if not already set
            if (fetchedSubjects.length > 0 && !localStorage.getItem("currentFlashcard")) {
              setSelectedSubject(fetchedSubjects[0].title);
              localStorage.setItem("currentFlashcard", fetchedSubjects[0].title);
              // Find the dictionary where title matches the selected subject
              const flashcardList = JSON.parse(localStorage.getItem("sets") || "[]");

              // Find the dictionary where title matches the selected subject
              const selectedSet = flashcardList.find((set) => set.title === localStorage.getItem("currentFlashcard"));

              // If found, store it as flashcardSet in localStorage
              localStorage.setItem("flashcardSet", JSON.stringify(selectedSet));
            }
          }
        });
        return () => unsubscribeSnapshot();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSelect = (subject) => {
    setSelectedSubject(subject);
    localStorage.setItem("currentFlashcard", subject);
    const flashcardList = JSON.parse(localStorage.getItem("sets") || "[]");

    // Find the dictionary where title matches the selected subject
    const selectedSet = flashcardList.find((set) => set.title === subject);

    // If found, store it as flashcardSet in localStorage
    if (selectedSet) {
      localStorage.setItem("flashcardSet", JSON.stringify(selectedSet));
    }

    // Notify the parent component of the subject change
    if (onSubjectChange) {
      onSubjectChange(subject); // Call the parent's onSubjectChange
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        perspective: "1000px",
        width: "85%",
      }}
    >
      <div style={{ color: "white", padding: "10px", fontSize: "15px" }}>
        Select Subject
      </div>
      <div
        style={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          padding: "10px",
          display: "flex",
          gap: "10px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          width: "100%",
        }}
      >
        {subjects.map((subject, index) => {
          const truncatedSubject = subject.title.slice(0, 12);
          const isSelected = selectedSubject === subject.title;

          return (
            <div
              key={index}
              onClick={() => handleSelect(subject.title)}
              style={{
                padding: "10px 15px",
                borderRadius: "25px",
                border: "1px solid #46016e",
                backgroundColor: isSelected ? "#E3D1FF" : "transparent",
                color: isSelected ? "black" : "#7A5CFA",
                cursor: "pointer",
                fontWeight: "bold",
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {truncatedSubject}
            </div>
          );
        })}
      </div>
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default SubjectSelector;

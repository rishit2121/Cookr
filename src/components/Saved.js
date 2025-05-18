import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/Firebase";
import QuestionCard from "./QuestionCard";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle, logOut } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Bottom from "../components/BottomNav";
import Comments from "./mini_components/Comments";
import { useTranslation } from 'react-i18next';

const SavedQuestions = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState();
  const [currentSet, setCurrentSet] = useState(
    localStorage.getItem("currentSet")
      ? JSON.parse(localStorage.getItem("currentSet"))
      : null
  );
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  const { t } = useTranslation();
  const [streak, setStreak] = useState(
    localStorage.getItem("streak")
      ? parseInt(localStorage.getItem("streak"))
      : 0
  );
  const [mobileDimension, setMobileDimension] = useState(false);
  const [xp, setXP] = useState(
    localStorage.getItem("xp") ? parseInt(localStorage.getItem("xp")) : 0
  );
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser.email);
      } else {
        setUser(null);
      }
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  useEffect(() => {
    if (user) {
      const userEmail = user;
      const userDocRef = doc(db, "users", userEmail);
  
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const questions = docSnapshot.data().cards || [];
          setSavedQuestions(questions);
          setFilteredQuestions(questions);
        } else {
          setSavedQuestions([]);
          setFilteredQuestions([]);
        }
      });
  
      // Cleanup subscription on unmount or when user changes
      return () => unsubscribe();
    } else {
      setSavedQuestions([]);
      setFilteredQuestions([]);
    }
  }, [user]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredQuestions(savedQuestions);
      // Show all unique subjects and questions when search is empty
      const uniqueSubjects = [...new Set(savedQuestions.map(q => q.title))];
      const allQuestions = [...savedQuestions];
      setSuggestions([
        ...uniqueSubjects.map(title => ({ type: 'subject', title })),
        ...allQuestions.map(q => ({ type: 'question', ...q }))
      ]);
    } else {
      const filtered = savedQuestions.filter(question => 
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (question.title && question.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredQuestions(filtered);
      
      // Show all matching subjects and questions
      const matchingSubjects = [...new Set(filtered.map(q => q.title))]
        .filter(title => title.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchingQuestions = filtered
        .filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()));
      
      setSuggestions([
        ...matchingSubjects.map(title => ({ type: 'subject', title })),
        ...matchingQuestions.map(q => ({ type: 'question', ...q }))
      ]);
    }
  }, [searchQuery, savedQuestions]);

  const handleSuggestionClick = (item) => {
    if (item.type === 'subject') {
      setSearchQuery(item.title);
      setShowSuggestions(false);
    } else {
      setSearchQuery(item.question);
      setSelectedQuestion(item);
      setShowSuggestions(false);
    }
  };

  return (
    <div
      className="App"
      style={{ display: "flex", height: "100dvh", overflow: "hidden", backgroundColor: "black"}}
    >
      <Navbar setMobileDimension={setMobileDimension} />
      {user ? (
        <div
          style={{ flex: 1, height:mobileDimension? "90%":"100%",flexDirection:'column', justifyContent:'center', overflow: "auto", backgroundColor: "black", marginTop:'10px'
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            marginTop: "10px",
            width: "calc(99% - 20px)",

            boxSizing: "border-box",
          }}>
            <h2 style={{
              color: "white",
              fontSize: "1.8rem",
              whiteSpace: "nowrap",
              marginLeft:'5%'
            }}>
              {t("favorites")}
            </h2>

            {/* Search bar wrapper aligned right */}
            <div style={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-end"
            }}>
              <div style={{
                width: "60%",
                position: "relative",
               
              }}>
                <input
                  type="text"
                  placeholder={t('searchQuestions')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                    setSelectedQuestion(null);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  style={{
                    
                    width: "100%",
                    padding: "10px 7px",
                    borderRadius: "8px",
                    border: "1px solid white",
                    backgroundColor: "#282828",
                    color: "white",
                    outline: "none",
                    fontSize: "1rem"
                  }}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#282828",
                    border: "1px solid white",
                    borderRadius: "8px",
                    marginTop: "4px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    zIndex: 1000,
                    width: "calc(100% + 14px)",
                    // padding: "10px 14px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          color: "white",
                          borderBottom: index < suggestions.length - 1 ? "1px solid #444" : "none",
                          backgroundColor: suggestion.type === 'subject' ? '#333' : 'transparent',
                          transition: "background-color 0.2s ease"
                        }}
                      >
                        {suggestion.type === 'subject' ? (
                          <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{suggestion.title}</div>
                        ) : (
                          <>
                            <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{suggestion.title || "Untitled"}</div>
                            <div style={{ fontSize: "0.9rem", color: "#aaa", marginTop: "4px" }}>
                              {suggestion.question.length > 50
                                ? suggestion.question.substring(0, 50) + "..."
                                : suggestion.question}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>


          <div style={{ display: "flex", flexWrap: "wrap", gap: "0% 20%", justifyContent:'center' }}>
            {selectedQuestion ? (
              <QuestionCard
                question={selectedQuestion.question}
                choices={selectedQuestion.choices}
                answer={selectedQuestion.answer}
                comment={selectedQuestion.comments}
                selectedAnswer={selectedQuestion.selectedAnswer}
                setStreak={setStreak}
                setXP={setXP}
                title={selectedQuestion.title}
                color={selectedQuestion.color}
                fullJSON={selectedQuestion}
                isFavorites={true}
                savedQuestions={savedQuestions}
              />
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((questionData, index) => (
                <QuestionCard
                  key={index}
                  question={questionData.question}
                  choices={questionData.choices}
                  answer={questionData.answer}
                  comment={questionData.comments}
                  selectedAnswer={questionData.selectedAnswer}
                  setStreak={setStreak}
                  setXP={setXP}
                  title={questionData.title && questionData.title}
                  color={questionData.color && questionData.color}
                  fullJSON={questionData}
                  isFavorites={true}
                  savedQuestions={savedQuestions}
                />
              ))
            ) : (
              <div style={{ 
                width: "100%", 
                height: "80vh", // Add height to create vertical space
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
              }}>
                <p>{t('noSavedQuestions')}</p>
              </div>
            )}
          </div>
          {mobileDimension && (
        <Bottom
          streak={streak}
          xp={xp}
          currentPage={'saved'}
          sets={sets}
          currentSet={currentSet}
          setCurrentSet={setCurrentSet}
          mobileDimension={mobileDimension}
        />
      )}
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: mobileDimension
              ? "translate(-50%, -50%)"
              : "translate(0%, -50%)",
          }}
        >
          <p style={{ fontSize: "21px", color: "white" }}>Hey 👋, welcome to </p>
          <h1
            style={{
              marginLeft: "15px",
              textShadow: "2px 2px 5px blue",
              fontSize: "50px",
              color: "white"
            }}
          >
                C<span style={{ fontStyle: "italic" }}>oo</span>kr
          </h1>
          <br></br>
          <button
            onClick={async () => navigate("/auth")}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "white",
              border: "none",
              color: "black",
              borderRadius: "100px",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            to get scrollin'!
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedQuestions;

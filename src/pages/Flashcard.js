import React, { useRef, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import { auth } from "../components/firebase/Firebase";
import FlippingCard from "../components/Card";
import Bottom from "../components/BottomNav";
import Selector from "../components/SubjectSelector";
import { jsonrepair } from "jsonrepair";
import { useNavigate } from "react-router-dom";




const containerStyle = {
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    marginTop:'5%',
    // justifyContent: "center",
    alignItems: "center",
    scrollSnapType: "y mandatory",
    height: "100dvh",
    width: "100%",
    backgroundColor: "black"
};



const FlashCard = () => {
    const [user, setUser] = useState(null);
    const [flashcards, setFlashcards] = useState([

    ]);
  
      const [isFetching, setIsFetching] = useState(false);
      const [currentSet, setCurrentSet] = useState(
        localStorage.getItem("flashcardSet")
          ? JSON.parse(localStorage.getItem("flashcardSet"))
          : null
      );
      const [xp, setXP] = useState(
        localStorage.getItem("xp") ? parseInt(localStorage.getItem("xp")) : 0
      );
      const [sets, setSets] = useState();
      const [streak, setStreak] = useState(
        localStorage.getItem("streak")
          ? parseInt(localStorage.getItem("streak"))
          : 0
      );
    const [mobileDimension, setMobileDimension] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [flipCard, setFlipCard] = useState(false);  // Track if card should be flipped
    const intervalRef = useRef(null);
    const [isShuffled, setIsShuffled] = useState(false);  // Track whether the list is shuffled
    const [shuffledCards, setShuffledCards] = useState(flashcards);  // Shuffled flashcards
    const [inputValue, setInputValue] = useState(''); // Input value
    const [selectedSubject, setSelectedSubject] = useState(null);
    const navigate = useNavigate();
      
  const handleSubjectChange = (newSubject) => {
    setSelectedSubject(newSubject);  // This triggers re-render in FlashCard
  };

     // Store the original order of the flashcards
     const originalFlashcards = useRef(flashcards);

     useEffect(() => {
      localStorage.setItem("mode", 2);
    }, []);
    
     useEffect(() => {
        // Disable scrolling for the entire page
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.body.classList.add("no-scroll")
    
        // Cleanup function to re-enable scrolling when the component unmounts or when needed
        return () => {
          document.body.style.overflow = "hidden";
          document.documentElement.style.overflow = "hidden";
          document.body.classList.add("no-scroll")
        };
      }, []);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser?.email);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    const fetchFlashcards = async () => {
      if (!currentSet) {
        console.error("currentSet is undefined, skipping fetch.");
        return;
      }
  
      const options = {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          info: JSON.parse(localStorage.getItem("flashcardSet")),
          lastFlashcards: flashcards.slice(-10), // Using flashcards instead of questions
          mode: localStorage.getItem("mode"),
        }),
      };
  
      try {

  
        const response = await fetch(
          "https://hfob3eouy6.execute-api.us-west-2.amazonaws.com/production/",
          options
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const responseText = await response.json();
  
        const newFlashcards= JSON.parse(jsonrepair(responseText));
        if(Array.isArray(newFlashcards)){
        } else{
        }
        if (Array.isArray(newFlashcards)) {
          setFlashcards(newFlashcards);
          setShuffledCards(newFlashcards)
          localStorage.setItem("lastSet", JSON.stringify(newFlashcards));
        } else {
          console.error("Unexpected response format:", newFlashcards);
        }
      } catch (e) {
        console.error("Error fetching flashcards:", e);
      } finally {
        setIsFetching(false);
      }
    };
  
    useEffect(() => {
      if (!isFetching) {
        const storedSet = localStorage.getItem("flashcardSet");
        if (storedSet) {
          setCurrentSet(JSON.parse(storedSet));
        }
        setIsFetching(true);
        fetchFlashcards();
      }
    }, [currentSet, selectedSubject]);

    useEffect(() => {
        let intervalId;
      
        if (isPlaying) {
          // Start the interval for auto-play
          intervalId = setInterval(() => {
            setCurrentIndex((prevIndex) => {
              if (prevIndex + 1 < flashcards.length) {
                // Flip the card immediately after the previous card
                setFlipCard(false);  // Show front side of the current card
                
                // After 2 seconds, flip to the back
                setTimeout(() => {
                  setFlipCard(true); // Show the back side
                }, 3000); 
      
                return prevIndex + 1;
              } else {
                // Stop the auto-play after the last card
                clearInterval(intervalId);
                setIsPlaying(false);
                return prevIndex;
              }
            });
          }, 7000);  // 7-second interval for each card before moving to the next (4 seconds to show card, 2 for flip)
          
          // Flip the first card immediately on start
          setFlipCard(false); // Ensure the first card starts with the front side showing
          setTimeout(() => {
            setFlipCard(true); // After 2 seconds, flip to the back
          }, 2000);
        } else {
          clearInterval(intervalId);
        }
      
        return () => clearInterval(intervalId);
      }, [isPlaying]);
      useEffect(() => {
        setFlipCard(true);  // Reset to front when index changes
        const timeoutId = setTimeout(() => {
            setFlipCard(false); // Flip the card after a short delay
        }, 1); // Small delay before flip
        return () => clearTimeout(timeoutId);
    }, [currentIndex]);
      

    const startAutoPlay = () => {
        if (!isPlaying) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };

    const nextCard = () => {
        if (currentIndex < shuffledCards.length - 1) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledCards.length);
        }
    };
    
    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + shuffledCards.length) % shuffledCards.length);
        }
    };
    useEffect(() => {
        const handleKeyDown = (event) => {
          if (event.code === "ArrowLeft" ) {
            event.preventDefault(); // Prevent default scrolling behavior
            prevCard();
          }
          if (event.code === "ArrowRight" ) {
            event.preventDefault(); // Prevent default scrolling behavior
            nextCard();
          }
          if (event.code === "ArrowDown" ) {
            event.preventDefault(); // Prevent default scrolling behavior
            nextCard();
          }
          if (event.code === "ArrowUp" ) {
            event.preventDefault(); // Prevent default scrolling behavior
            prevCard();
          }
        };
    
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
      }, [currentIndex]);
    
    useEffect(() => {
        setInputValue((currentIndex + 1).toString()); // Display 1-based index in the input
      }, [currentIndex]);
    
      const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value); // Set the input value as user types
      };
      const handleBlur = () => {
        // Validate input when user clicks away (loses focus)
        const parsedValue = parseInt(inputValue, 10);
        if (inputValue === '' || isNaN(parsedValue) || parsedValue < 1 || parsedValue > flashcards.length) {
          // If invalid, revert back to the current card index
          setInputValue((currentIndex + 1).toString());
        } else {
          // Valid input, update currentIndex (convert to 0-based index)
          setCurrentIndex(parsedValue - 1);
        }
      };

    
      const handleKeyDown = (event) => {
        // Validate input if the user presses Enter
        if (event.key === 'Enter') {
          handleBlur();
        }
      };
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };
    const toggleShuffle = () => {
        setIsShuffled((prev) => {
            const newShuffleState = !prev;
            if (newShuffleState) {
                setShuffledCards(shuffleArray(flashcards)); // Shuffle the list
            } else {
                setShuffledCards(flashcards); // Restore the original order
            }
            return newShuffleState;
        });
        setCurrentIndex(0); // Reset to the first card
    };
    // Handle swipe gestures
    const [startX, setStartX] = useState(null);
  const [startY, setStartY] = useState(null);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (startX === null || startY === null) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal Swipe
      if (diffX > 50) {
        // prevCard();
      } else if (diffX < -50) {
        // nextCard();
      }
    } else {
      // Vertical Swipe
      if (diffY > 50) {
        prevCard()
      } else if (diffY < -50) {
        nextCard()
      }
    }

    // Reset
    setStartX(null);
    setStartY(null);
  };

    // Add window resize handler
    useEffect(() => {
        const handleResize = () => {
            setMobileDimension(window.innerWidth <= 768);
        };

        // Set initial value
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="App" style={{ display: "flex", height: "100dvh", overflowX: "hidden",overflowY:"hidden", backgroundColor: "black" }}>
            <div>
              <Navbar setMobileDimension={setMobileDimension} />
            </div>
            {user ? (
                <>
                    <div style={containerStyle} ref={containerRef}>
                        <Selector onSubjectChange={handleSubjectChange} />
                        {isFetching ? (
                            <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>
                                <div className="loading-circle"></div>
                                <p style={{marginTop:'20px', marginBottom:'50%'}}>Loading...</p>
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    position: 'relative',
                                    alignItems:'center',
                                    // justifyContent:'center',
                                    height: !mobileDimension? "55dvh": "48dvh",
                                    width: !mobileDimension? "78vw": "100vw",  // Use full width of the viewport
                                    overflowX: "hidden",  // Prevent horizontal scrolling
                                    overflowY: "hidden"   // Prevent vertical scrolling

                                }}
                            >
                                {shuffledCards.map((card, index) => (
                                    <div 
                                        onTouchStart={handleTouchStart} 
                                        onTouchEnd={handleTouchEnd}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: !mobileDimension ? "50dvw" : "80dvw", // Adjust width according to mobile dimension
                                            marginLeft: !mobileDimension ? "15.5dvw" : "10dvw", // Adjust margin for positioning
                                            marginRight: !mobileDimension ? "11.5dvw" : "10dvw", // Adjust margin for positioning
                                            marginTop: !mobileDimension? '3.5dvh': '3.5dvh',
                                            marginBottom: !mobileDimension? '3.5dvh': '3.5dvh',
                                            height: !mobileDimension ? "45vh" : "50vh", // Adjust height according to mobile dimension
                                            overflow: "visible",  // Allow overflow of cards
                                            transition: 'transform 0.6s ease',
                                            transform: !mobileDimension? `translateY(-${currentIndex * 52}dvh)`: `translateY(-${currentIndex * 47}dvh)`, // Slide effect
                                        }}
                                    >  
                                        <FlippingCard
                                            key={currentIndex} 
                                            question={shuffledCards[currentIndex].question} 
                                            answer={shuffledCards[currentIndex].answer} 
                                            flipCard={flipCard} 
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100dvw',
                                                height: '100dvw',
                                                transform: `translateX(-${(currentIndex - index) * 100}%)`, // Ensure cards are positioned correctly
                                                transition: 'transform 0.6s ease',
                                                visibility: currentIndex === index ? 'visible' : 'hidden',
                                            }}
                                            />
                                        </div>
                                    ))}
                            </div>
                        )}
                        {/* Navigation buttons */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginTop: "20px",}}>
                            <div
                                onClick={prevCard}
                                style={{
                                    width: mobileDimension? "11dvw": '55px',
                                    height: mobileDimension? "11dvw": '55px',
                                    borderRadius: "50%",
                                    // border: "3px solid darkblue",
                                    backgroundColor:"#2e2e2e",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    alignText:'center',
                                    color: "white",
                                    fontSize: "35px",
                                }}
                            >
                                ←
                            </div>

                            <div
                                onClick={startAutoPlay}
                                style={{
                                    width: mobileDimension? "11dvw": '55px',
                                    height: mobileDimension? "11dvw": '55px',
                                    borderRadius: "50%",
                                    // border: "3px solid darkblue",
                                    backgroundColor:"#2e2e2e",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "white",
                                    alignText:'center',
                                }}
                            >
                                {isPlaying ? 

                                    <svg
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    height="1em"
                                    >
                                    <path
                                    fill="currentColor"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 4h4v16H6zm8 0h4v16h-4z"
                                    />
                                    </svg>
                                  

                                : <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="1em"
                                    height="1em"
                                    >
                                    <path
                                        fill="currentColor"
                                        d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69L9.54 5.98A.998.998 0 0 0 8 6.82"
                                    ></path>
                                    </svg>
                                }
                            </div>
                            {/* New Randomize Button */}
                            <div
                                onClick={toggleShuffle}
                                style={{
                                    width: mobileDimension? "11dvw": '55px',
                                    height: mobileDimension? "11dvw": '55px',
                                    borderRadius: "50%",
                                    border: isShuffled ? "3px solid white" : "none",
                                    backgroundColor:"#2e2e2e",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "white",
                                    fontSize: "25px"
                                }}
                            >
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 1200 1200"
                                width="1em"
                                height="1em"
                                >
                                <path
                                    fill="currentColor"
                                    d="M935.926 42.203v186.061H763.958c-54.408 0-114.484 26.559-164.729 77.32c-50.242 50.761-104.842 126.065-191.527 249.904c-87.076 124.394-135.567 199.565-165.807 233.346c-30.24 33.78-25.376 30.882-69.388 30.882H0v147.863h172.507c66.078 0 132.54-27.619 179.515-80.093s91.312-125.164 176.742-247.208c85.82-122.601 140.381-195.159 175.512-230.651c35.129-35.491 36.641-33.5 59.685-33.5h171.967v194.147L1200 306.276zM0 228.263v147.863h172.507c44.012 0 39.148-2.975 69.388 30.805c19.456 21.734 51.507 67.826 91.49 125.915c5.419-7.773 7.973-11.521 13.708-19.716c21.78-31.114 41.563-59.187 59.838-84.79c6.36-8.91 11.688-15.939 17.714-24.259c-27.021-39.039-49.525-70.001-72.623-95.803c-46.975-52.474-113.437-80.015-179.515-80.015zm935.926 401.464v189.988H763.958c-23.043 0-24.554 1.915-59.684-33.577c-23.237-23.477-56.146-65.093-99.809-124.76c-5.281 7.49-9.555 13.418-15.095 21.333c-30.571 43.674-51.648 75.183-73.777 107.816c31.395 41.578 58.12 73.875 83.637 99.652c50.242 50.763 110.319 77.397 164.729 77.397h171.968v190.22L1200 893.801z"
                                    ></path>
                                </svg>
                            </div>
                            <div
                                onClick={nextCard}
                                style={{
                                    width: mobileDimension? "11dvw": '55px',
                                    height: mobileDimension? "11dvw": '55px',
                                    borderRadius: "50%",
                                    // border: "3px solid darkblue",
                                    backgroundColor:"#2e2e2e",
                                    display: "flex",
                                    alignItems: "center",
                                    alignText: 'center',
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "white",
                                    fontSize: "35px"
                                }}
                            >
                                →
                            </div>
                            
                        </div>
                        <div>
                        <div style={{ marginTop:'15%', justifyContent:'center',}}>
                        <span style={{color:'white'}}>Card   

                        </span>
                        <input
                           type="tel"
                          value={inputValue}
                          onChange={handleInputChange}
                          onBlur={handleBlur} // Validate when input loses focus
                          onKeyDown={handleKeyDown} // Validate on Enter key
                          min="1"
                          max={flashcards.length }
                          style={{
                            width: "50px",
                            textAlign: "center",
                            backgroundColor: "#2e2e2e",
                            border: "none", // Removes the border
                            color: "#fff", // Sets the text color to white
                            padding: "5px",
                            margin: "0 10px", // Adds more space between the words,
                            borderRadius:'5px',
                            WebkitAppearance: "none", // Removes stepper controls on iOS
                            MozAppearance: "textfield", // Removes stepper controls on Firefox
                            inputMode: "numeric", // Prevents non-numeric inputs
                            appearance: "none", 
                          }}
                        />
                        <span style={{color:'white'}}> of {flashcards.length}</span>
                        </div>
                      </div>
                        {mobileDimension && (
                            <Bottom
                            streak={streak}
                            currentPage={'flashcards'}
                            xp={xp}
                            sets={sets}
                            currentSet={currentSet}
                            setCurrentSet={setFlashcards}
                            mobileDimension={mobileDimension}
                            />
                        )}
                    </div>
                </>
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

export default FlashCard;

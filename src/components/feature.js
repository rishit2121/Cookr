import React, { useState, useEffect } from "react";
import NewPrompt from "./NewPrompt";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase/Firebase";
import Stellar from "../assets/stellar.png";
import {
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
  } from "firebase/firestore";
  import { auth, signInWithGoogle, logOut } from "./firebase/Firebase";
  import { onAuthStateChanged } from "firebase/auth";

var randomColor = require("randomcolor"); // import the script


const Features= ({ mobileDimension }) => {
  const [isVisible, setIsVisible] = useState(window.innerWidth >1100);
  const [sets, setSets] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [openNewTopic, setOpenNewTopic] = useState(false);
  const [style, setStyle] = useState(0); // Manage the style with useState
  const [params, setParams] = useState([]); // Manage the params with useState
  const [currentsets, setCurrentSets] = useState([]);
  const [selected, setSelected] = useState("Community Sets");
  const [filteredSets, setFilteredSets] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState("rishit.agrawal121@gmail.com");
  const [hasSubscription, setHasSubscription] = useState(false);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth > 1100);
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(doc(db, "sets", "featured"), (doc) => {
        const data = doc.data();
        setSets(data?.sets || []); // Default to an empty array if no sets are found
      });
  
      return () => unsubscribe(); // Cleanup listener on unmount
    } catch (error) {
      alert("Error fetching sets");
    }
  }, []);
  useEffect(() => {
    try {
        const document = onSnapshot(
            doc(db, "users", user),
            (doc) => {
                setCurrentSets(doc.data().sets);
            }
          );
    } catch (error) {
      alert("Error");
    }
  }, [user]);
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser.email);
      setLoading(false); // Auth state resolved
      if (currentUser) {
        // Get subscription status from Firestore
        const userRef = doc(db, "users", currentUser.email);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            setHasSubscription(docSnap.data().subscription || false);
          }
        });
      }
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);


  const handleDelete = async (item) => {
    try {
      // Reference to the 'featured' document
      const featuredDocRef = doc(db, 'sets', 'featured'); // Adjust collection and document name as needed
      
      // Remove the item from the 'sets' array
      await updateDoc(featuredDocRef, {
        sets: arrayRemove(item), // 'item' is the specific item to remove from the array
      });
  
      // Optionally, update the local state to reflect the deletion or re-fetch the list
    } catch (error) {
      console.error('Error deleting item from sets:', error);
    }
  };

  // Function to handle the "My Sets" filtering
  const filterMySets = () => {
    const userEmail = user;
    const mySets = sets.filter((item) => item.author === userEmail);
    setFilteredSets(mySets);
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleClick = (text) => {
    setSelected(text);

    if (text === "My Sets") {
      filterMySets();
    }
  };


  const getStyle = (text) => ({
    display: "flex",
    width: text === "Community Sets" ? "140px" : "100px",
    justifyContent: text === "My Sets" ? "center" : "flex-start",
    alignItems: "center",
    fontWeight: selected === text ? "bold" : "normal",
    position: "relative", // Needed for the underline
    cursor: "pointer",
  });
  

  const isSetAdded = (title) => {

    return currentsets.some((set) => set.title === title);
  };
  // Updated generateBlob function with dynamic width and height
  const saveToFirestore = async (title, content, subject, promptMode, tag) => {
    try {
      const color = randomColor({
        luminosity: "dark",
      });
      const selectedMode = 1;
      const userEmail = user;
      const docRef = doc(db, "users", userEmail);
      
      // Fetch the current data from Firestore
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error("Document not found");
        return;
      }
  
      let currentSets = docSnap.data().sets || [];
  
      // Check if the title already exists in currentSets
      const isDuplicate = currentSets.some(set => set.title === title);
      if (isDuplicate) {
        window.alert("This set already exists in your library!");
        return; // Exit early if duplicate
      }
  
      // Check subscription status before adding new set
      if (!hasSubscription && currentSets.length >= 10) {
        window.alert("You can only have 10 sets at once in the library. Upgrade to premium for unlimited sets!");
        return;
      }
  
      // Add the new set
      const newSet = {
        title: title,
        content: content,
        subject: subject,
        promptMode: promptMode,
        color: color,
        tag: tag,
        scrollGenerationMode: selectedMode,
      };
      currentSets.push(newSet);
  
      // Update Firestore
      await updateDoc(docRef, { sets: currentSets });
  
      // Update localStorage
      localStorage.setItem("sets", JSON.stringify(currentSets));
  
      if (!localStorage.getItem("currentSet")) {
        localStorage.setItem("currentSet", JSON.stringify(newSet));
      }
  
    } catch (e) {
      console.error("Error adding set:", e);
    }
  };
  
  const generateBlob = (
    width = 400,
    height = 250,
    amplitude = Math.random() * 50,
    wavelength = Math.random() * 100 + 200,
    offset = Math.random() * 100
  ) => {
    const waveHeight = height / 2;

    let path = `M 0 ${waveHeight}`;
    for (let x = 0; x <= width; x += 10) {
      const y =
        waveHeight +
        amplitude * Math.sin(((x + offset) / wavelength) * 2 * Math.PI);
      path += ` L ${x} ${y}`;
    }

    path += ` L ${width} ${height} L 0 ${height} Z`;


    return path;
  };

  

  // Function to change style and params when a button is clicked
  const handleNewClick = () => {
    setStyle(0); // Toggle style between 0 and 1
    setParams([]); // Example params
    setOpenNewTopic(!openNewTopic);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: mobileDimension ? "center" : "flex-start",
      }}
    >
        <div
            style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            }}
        >
        <h1 style={{ margin: "5px 50px", color: isDarkMode ? "#fff" : "#000" }}>
        Explore Featured Sets
        </h1>
        {isVisible && (
        <div style={{
            position: "absolute",
            right: "20px", // Adjust this value for spacing from the screen edge
            top: "10px", // Align with the title
            padding: "10px 15px",
            width:'30%',
            height:'5%'}}>
        <button
            style={{
              borderRadius: "10px",
              backgroundColor: "#FF8C00",
              position: "absolute",
              right: "88%",
              width: "50px",
              height: "50px",
              justifyContent: "center",
              alignItems: "center",
              border: "none", // Removed outline
              cursor: "pointer", // Optional: for better UX
              color: "white", // Text color
              fontSize: "30px", // Size of "+"
            }}
            onClick={handleNewClick}
          >
            +
          </button>
        <input
        type="text"
        placeholder="Search..."
        style={{
            position: "absolute",
            right: "0px", // Adjust this value for spacing from the screen edge
            borderRadius: "20px",
            backgroundColor: "#f0f0f0", // Light gray background
            border: "1px solid #808080", // Dark gray outline
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Subtle shadow
            color: "#333", // Text color
            outline: "none", // Remove default focus outline
            fontSize: "16px",
            width:'80%',
            height:'50px',
            paddingLeft: "20px",
        }}
        value={searchQuery}
        onChange={handleSearchChange}
        />
        </div>
        )}
    </div>
    <div style={{display:'flex', flexDirection:'row', margin: "20px 50px",width:'300px'}}>
    <p
        style={getStyle("Community Sets")}
        onClick={() => handleClick("Community Sets")}
      >
        Community Sets
        {selected === "Community Sets" && (
          <span
            style={{
              position: "absolute",
              bottom: "-4px", // Adjust the vertical position of the underline
              left: "0",
              width: "100%",
              height: "3px", // Thickness of the underline
              backgroundColor: "black", // Color of the underline
              borderRadius: "2px",
            }}
          ></span>
        )}
      </p>
      <div style={{display:'flex', width:'30px'}}></div>
      <p
        style={getStyle("My Sets")}
        onClick={() => handleClick("My Sets")}
      >
        My Sets
        {selected === "My Sets" && (
          <span
            style={{
              position: "absolute",
              bottom: "-4px", // Adjust the vertical position of the underline
              left: "0",
              width: "100%",
              height: "3px", // Thickness of the underline
              backgroundColor: "black", // Color of the underline
              borderRadius: "2px",
            }}
          ></span>
        )}
      </p>
    </div>
      <div
        style={{
          margin: "5px 50px",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: mobileDimension ? "center" : "flex-start",
          alignItems: mobileDimension ? "center" : "flex-start",
          
        }}
      >
        {Array.isArray(sets) &&
    sets
      .filter((item) => {
        // Filter based on selected sets (My Sets or Community Sets)
        const isMySet = selected === "My Sets" ? item.author === user : true;
        
        // Filter based on search query (matching title or content)
        const isSearchMatch =
          item.Title.toLowerCase().includes(searchQuery.toLowerCase()) 
        //   item.content.toLowerCase().includes(searchQuery.toLowerCase());

        return isMySet && isSearchMatch;
      })
      .map((item, index) => (
            <div>
              <div
                key={index}
                style={{
                  width: "400px",
                  height: "250px",
                  boxShadow: `0px 0px 1px 1px ${item.color}`,
                  borderRadius: "10px",
                  display: "flex",
                  margin: "10px 10px",
                  backgroundColor: `${item.color}10`,
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative", // Ensure relative positioning
                }}
              >
                <div style={{display:'flex', flexDirection:'row', width:"400px"}}>
                <div>
                <p
                  style={{
                    color: item.color,
                    padding: "10px 10px",
                    display: "flex",
                    width:'300px',
                    flexDirection: "column",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textShadow: `0px 0px 10px ${item.color}90`,
                    whiteSpace: "nowrap", // Prevents text from wrapping
                    overflow: "hidden", // Ensures text does not overflow the container
                    textOverflow: "ellipsis", // Displays ellipsis (...) if the text is too long
                  }}
                >
                  {item.Title.slice(0,12)}
                </p>
                
                </div>
                {item.author === "Stellar" && (
                <button style={{ background: 'none', border: 'none', outline: 'none',display:'flex',marginTop:'10px',marginRight:'10px',justifyContent: "flex-end", width:'70px', zIndex:50.0}} onClick={() => (window.location.href = 'https://stellarlearning.app/')}>
                <img 
                    src={Stellar} 
                    alt="Description of image" 
                    style={{ width: "85px", height: "25px", borderRadius: "10px",}}
                />
                </button>
                )}
     
                </div>

                {/* Updated SVG to fit inside the div */}
                <svg
                  width="100%" // Adjust to fit the div's width
                  height="100%" // Adjust to fit the div's height
                  viewBox="0 0 400 250" // Adjust viewbox to match div's dimensions
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    zIndex: 0,
                    borderRadius: 10, // Ensure SVG is behind the text
                  }}
                >
                  <path d={generateBlob(400, 250)} fill={`${item.color}19`} />
                </svg>
                {item.author === user && (
                <button 
                    style={{ 
                        margin: "10px 10px",
                        color: "#ffffff", // Explicit white color for text
                        background: "#ff4d4d", // Fallback to a dark background
                        boxShadow: `0px 0px 10px 1px ${item.color || "#000000"}`, // Subtle glow
                        padding: "7px 20px",
                        borderRadius: "100px",
                        textAlign: "center",
                        display: "inline-block",
                        zIndex:20,
                        marginTop:'90px',
                        border: "0px solid gainsboro",
                    }} 
                    onClick={() => handleDelete(item)}
                >
                    Delete
                </button>
                )}
                {isSetAdded(item.Title) ? (
                    <p
                    style={{
                        margin: "10px 10px",
                        color: "#ffffff", // Explicit white color for text
                        background: item.color || "#333333", // Fallback to a dark background
                        boxShadow: `0px 0px 10px 1px ${item.color || "#000000"}`, // Subtle glow
                        padding: "7px 20px",
                        borderRadius: "100px",
                        textAlign: "center",
                        display: "inline-block",
                        zIndex:20,
                        border: "0px solid gainsboro",
                    }}
                    >
                    Added Already
                    </p>
                ):(
                    <button
                    style={{
                        margin: "10px 10px",
                        color: "#ffffff", // Explicit white color for text
                        background: item.color || "#333333", // Fallback to a dark background
                        boxShadow: `0px 0px 10px 1px ${item.color || "#000000"}`, // Subtle glow
                        padding: "7px 20px",
                        borderRadius: "100px",
                        textAlign: "center",
                        display: "inline-block",
                        zIndex:20,
                        border: "0px solid gainsboro",
                    }}
                    onClick={() => saveToFirestore(item.Title, "", "", 3, 'fa-solid fa-calculator')} // Fix here
                    >
                    Add To Library
                    </button>
                )}
              </div>
            </div>
        ))}
      </div>

      {openNewTopic && (
        <NewPrompt
          setOpenNewTopic={setOpenNewTopic}
          style={style}
          params={params}
          type={3}
        />
      )}
    </div>
  );
};

export default Features;
              {/* <div style={{ display: "flex", flexDirection: "row", bottom:'10px' }}>
                <button
                  style={{
                    position: "relative",
                    bottom: "2%",
                    fontSize: "12px",
                    left: "10px",
                    width: "20%", // Increased width
                    height: "20%",
                    backgroundColor: item.color,
                    color: "white", // Set text color to white
                    outline: "none",
                    border: "none",
                    borderRadius: "12px", // Rounded borders
                    textAlign: "center",
                    padding: "10px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={() => navigate("/quiz", { state: { title: item.title, context: item.content, subject: item.subject, color: item.color, promptMode: item.promptMode, tag: item.tag } })}
                >
                  Quiz
                </button>
                <button
                  style={{
                    position: "relative",
                    bottom: "2%",
                    fontSize: "15px",
                    left: "20px",
                    width: "20%", // Increased width
                    height: "20%",
                    backgroundColor: item.color,
                    color: "white", // Set text color to white
                    outline: "none",
                    border: "none",
                    borderRadius: "12px", // Rounded borders
                    textAlign: "center",
                    padding: "10px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={() => {
                    setStyle(1);
                    setParams([item.color, item.content, item.promptMode, item.subject, item.tag, item.title]);
                    setOpenNewTopic(!openNewTopic);
                  }}
                >
                  
                  <FontAwesomeIcon icon={faPen} style={{height:"70%"}}/>

                </button>
                <i
                  style={{ position: "relative", bottom: "10px", fontSize: "50px", left: "75%", color: item.color }}
                  className={item.tag}
                ></i>
              </div> */}
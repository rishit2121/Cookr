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

var randomColor = require("randomcolor"); // import the script


const Features= ({ mobileDimension }) => {
  const [sets, setSets] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [openNewTopic, setOpenNewTopic] = useState(false);
  const [style, setStyle] = useState(0); // Manage the style with useState
  const [params, setParams] = useState([]); // Manage the params with useState
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  const [currentsets, setCurrentSets] = useState([]);
  useEffect(() => {
    try {
        const document = onSnapshot(
            doc(db, "users", localStorage.getItem("email")),
            (doc) => {
                setCurrentSets(doc.data().sets);
            }
          );
    } catch (error) {
      alert("Error");
    }
  }, []);

  const isSetAdded = (title) => {
    console.log(currentsets)
    console.log(title)
    return currentsets.some((set) => set.title === title);
  };
  console.log(isSetAdded("Astronomy"))
  // Updated generateBlob function with dynamic width and height
  const saveToFirestore = async (title, content, subject, promptMode, tag) => {
    try {
      console.log("Trying to add...");
      console.log(sets)
      console.log('hiii')
      const color = randomColor({
        luminosity: "dark",
      });
      const selectedMode = 1;
      const userEmail = localStorage.getItem("email");
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
  
      console.log("Set added successfully!");
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
      <h1 style={{ margin: "40px 50px",color: isDarkMode ? "#fff" : "#000" }}>Explore Featured Sets</h1>
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
            sets.map((item, index) => (
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
                <div style={{display:'flex',marginTop:'10px',marginRight:'10px',justifyContent: "flex-end", width:'100px' }}>
                <img 
                    src={Stellar} 
                    alt="Description of image" 
                    style={{ width: "85px", height: "25px", borderRadius: "10px",}}
                />
                </div>
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
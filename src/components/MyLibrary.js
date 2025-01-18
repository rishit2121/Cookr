import React, { useState, useEffect } from "react";
import NewPrompt from "./NewPrompt";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase/Firebase";
import {
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth, signInWithGoogle, logOut } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";

const MyLibrary = ({ mobileDimension }) => {
  const [sets, setSets] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [openNewTopic, setOpenNewTopic] = useState(false);
  const [style, setStyle] = useState(0); // Manage the style with useState
  const [params, setParams] = useState([]); // Manage the params with useState
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('rishit.agrawal121@gmail.com');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser.email);
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);
  // Updated generateBlob function with dynamic width and height
  const deleteItemFromFirestore = async (subtitle,subcontent,subsubject,subpromptmode,subselectedmode,subcolor,subtag) => {
    console.log('tryna delete...')
    try {
      const userEmail = user;
      const docRef = doc(db, "users", userEmail);

      // Fetch the current data from Firestore
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error("Document not found");
        return;
      }

      // Get the current sets array
      let currentSets = docSnap.data().sets || [];

      // Filter out the item to be deleted
      currentSets = currentSets.filter(
        (item) =>
          !(
            item.title === subtitle &&
            item.content === subcontent &&
            item.subject === subsubject &&
            item.promptMode === subpromptmode &&
            item.scrollGenerationMode == subselectedmode &&
            item.color === subcolor &&
            item.tag === subtag
          )
      );

      // Update the Firestore document with the modified sets array
      await updateDoc(docRef, { sets: currentSets });
      setSets(currentSets)

      // Remove from localStorage if necessary
      const currentSet = JSON.parse(localStorage.getItem("currentSet"));
      if (currentSet && currentSet.title === subtitle) {
        localStorage.removeItem("currentSet");
      }

      console.log("Item deleted successfully");
      setOpenNewTopic(false);
    } catch (e) {
      console.error("Error deleting item:", e);
      setOpenNewTopic(false);
    }
  };
  const generateBlob = (
    width = 200,
    height = 200,
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
    if (user) {
      const unsubscribe = onSnapshot(
        doc(db, "users", user),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setSets(docSnapshot.data().sets || []);
            console.log(docSnapshot.data().sets)
            console.log(user)
          } else {
            console.log("Document does not exist");
            setSets([]); // Clear sets if the document doesn't exist
          }
        },
        (error) => {
          console.error("Error fetching document:", error);
          alert("Error");
        }
      );
  
      // Cleanup subscription when user changes or component unmounts
      return () => unsubscribe();
    } else {
      // Reset sets if user is null
      setSets([]);
    }
  }, [user]);
  
  // if (loading) {
  //   return null; // Show loading indicator while resolving auth state
  // }

  // Function to change style and params when a button is clicked
  const handleNewClick = () => {
    setStyle(0); // Toggle style between 0 and 1
    setParams([]); // Example params
    setOpenNewTopic(!openNewTopic);
  };

  return (
    user ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: mobileDimension ? "center" : "flex-start",
      }}
    >
      <h1 style={{ margin: "40px 50px",color: isDarkMode ? "#fff" : "#000" }}>My Library</h1>
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
        <div
          style={{
            width: "200px",
            height: "200px",
            boxShadow: "0px 0px 16px 1px gainsboro",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            margin: "10px 10px",
          }}
          onClick={() => handleNewClick()}
        >
          <p style={{color: isDarkMode ? "#fff" : "#000",}}>Add Subject</p>
        </div>
        {sets &&
          sets.map((item, index) => (
            <div>
              <div
                key={index}
                style={{
                  width: "200px",
                  height: "200px",
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
                <p
                  style={{
                    color: item.color,
                    padding: "10px 10px",
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textShadow: `0px 0px 10px ${item.color}90`,
                    whiteSpace: "nowrap", // Prevents text from wrapping
                    overflow: "hidden", // Ensures text does not overflow the container
                    textOverflow: "ellipsis", // Displays ellipsis (...) if the text is too long
                  }}
                >
                  {item.title.slice(0,12)}
                  {item.promptMode!=3  && (
                  <span
                    onClick={() => {
                      setStyle(1);
                      setParams([
                        item.color,
                        item.content,
                        item.promptMode,
                        item.subject,
                        item.tag,
                        item.title,
                        item.scrollGenerationMode,
                      ]);
                      setOpenNewTopic(!openNewTopic);
                    }}
                    style={{
                      fontSize: "14px",
                      fontWeight: "normal",
                      cursor: "pointer",
                      zIndex:20
                    }}
                  >
                    edit
                    <svg xmlns="http://www.w3.org/2000/svg" style={{marginLeft:"5px"}} viewBox="0 0 512 512"  fill={item.color} height={10}><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
                  </span>
                  )}
                  {item.promptMode==3  && (
                    <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "normal",
                      cursor: "pointer",
                      zIndex:20
                    }}
                  >
                    Featured Set
                  </span>
                  )}
                  {item.promptMode==3  && (
                  <button
                    onClick={() => deleteItemFromFirestore(item.title,"","",3,1,item.color,item.tag)}
                    style={{
                      width: "47%",
                      zIndex:20,
                      background: "transparent",
                      border: "1px solid gainsboro",
                      padding: "10px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                  )}
                </p>

                {/* Updated SVG to fit inside the div */}
                <svg
                  width="100%" // Adjust to fit the div's width
                  height="100%" // Adjust to fit the div's height
                  viewBox="0 0 200 200" // Adjust viewbox to match div's dimensions
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    zIndex: 0,
                    borderRadius: 10, // Ensure SVG is behind the text
                  }}
                >
                  <path d={generateBlob(200, 200)} fill={`${item.color}19`} />
                </svg>
                <p
                  style={{
                    margin: "10px 10px",
                    color: `${item.color}`,
                    background: `${item.color}10`,
                    boxShadow: `0px 0px 10px 1px ${item.color}38`,
                    padding: "5px 10px",
                    borderRadius: "100px",
                  }}
                >
                  Mode:{" "}
                  {item.scrollGenerationMode != 2 ? "Questions" : "Videos"}
                </p>
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
    ):(
      <div></div>
    )
  );
};

export default MyLibrary;
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
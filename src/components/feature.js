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
  import { useNavigate } from 'react-router-dom';
  import Bottom from "./BottomNav";

var randomColor = require("randomcolor"); // import the script

const generateUniqueNumber = (email) => {
  

  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash).toString().slice(0, 6); 
};

const Features= ({ mobileDimension }) => {
  const [streak, setStreak] = useState(
    localStorage.getItem("streak") ? parseInt(localStorage.getItem("streak")) : 0
  );
  const [xp, setXP] = useState(
    localStorage.getItem("xp") ? parseInt(localStorage.getItem("xp")) : 0
  );
  const [currentSet, setCurrentSet] = useState(
    localStorage.getItem("currentSet") ? JSON.parse(localStorage.getItem("currentSet")) : null
  );
  const [isVisible, setIsVisible] = useState(window.innerWidth > 1100);
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
  const [user, setUser] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [mySets, setMySets] = useState([]); 
  const [featuredSets, setFeaturedSets] = useState([]); 
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
  const [usernameCache, setUsernameCache] = useState({});
  const [recentlyAdded, setRecentlyAdded] = useState(new Set());
  const [duplicateSet, setDuplicateSet] = useState(new Set());
  const [ownSetAttempt, setOwnSetAttempt] = useState(new Set());
  const [showAlreadyFeaturedWarning, setShowAlreadyFeaturedWarning] = useState(false);

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
      
      const fetchFeaturedSets = async () => {
        const featuredDoc = await getDoc(doc(db, "sets", "featured"));
        const data = featuredDoc.data();
        const sets = data?.sets || [];
        
        
        const sortedSets = [...sets].sort((a, b) => {
          const timesAddedA = a.timesAdded || 0;
          const timesAddedB = b.timesAdded || 0;
          return timesAddedB - timesAddedA;
        });
        
        setFeaturedSets(sortedSets);
        setSets(sortedSets);
      };

      fetchFeaturedSets();
    } catch (error) {
      console.error("Error fetching featured sets:", error);
    }
  }, []); 
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setMySets(doc.data().sets || []);
        }
      });

      return () => unsubscribe();
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
    if (currentsets && currentsets.length > 0) {
      setFilteredSets(currentsets);
    } else {
      setFilteredSets([]);
    }
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleClick = async (text) => {
    setSelected(text);
    
    
    if (text === "Community Sets") {
      try {
        const featuredDoc = await getDoc(doc(db, "sets", "featured"));
        const data = featuredDoc.data();
        const sets = data?.sets || [];
        
        
        const sortedSets = [...sets].sort((a, b) => {
          const timesAddedA = a.timesAdded || 0;
          const timesAddedB = b.timesAdded || 0;
          return timesAddedB - timesAddedA;
        });
        
        setFeaturedSets(sortedSets);
        setSets(sortedSets);
      } catch (error) {
        console.error("Error fetching featured sets:", error);
      }
    }
  };


  const getStyle = (text) => ({
    display: "flex",
    width: text === "Community Sets" ? "140px" : "100px",
    justifyContent: text === "My Sets" ? "center" : "flex-start",
    alignItems: "center",
    fontWeight: selected === text ? "bold" : "normal",
    position: "relative",
    cursor: "pointer",
    color: "white"
  });
  

  
  const getSetKey = (title, content) => `${title}-${content}`;

  const isSetAdded = (title, content) => {
    return currentsets.some((set) => 
      set.title === title && set.content === content
    );
  };

  const isSetDuplicate = (title, content) => {
    return duplicateSet.has(getSetKey(title, content));
  };

  const isSetAddedOrRecent = (title, content) => {
    return recentlyAdded.has(getSetKey(title, content));
  };

  // Updated generateBlob function with dynamic width and height
  const saveToFirestore = async (title, content, subject, promptMode, tag, isOwnSet = false) => {
    try {
      if (isOwnSet) {
        setOwnSetAttempt(prev => new Set([...prev, getSetKey(title, content)]));
        setShowDuplicateWarning(true);
        return;
      }

      const userEmail = user;
      const docRef = doc(db, "users", userEmail);
      const featuredDocRef = doc(db, "sets", "featured");
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error("Document not found");
        return;
      }

      let currentSets = docSnap.data().sets || [];

      const isDuplicate = currentSets.some(set => 
        set.title === title && set.content === content
      );
      if (isDuplicate) {
        setDuplicateSet(prev => new Set([...prev, getSetKey(title, content)]));
        setShowDuplicateWarning(true);
        return;
      }

      // Check subscription status before adding new set
      if (!hasSubscription && currentSets.length >= 10) {
        setShowSubscriptionWarning(true);
        return;
      }

      
      const featuredSnap = await getDoc(featuredDocRef);
      if (featuredSnap.exists()) {
        const featuredSets = featuredSnap.data().sets || [];
        const updatedFeaturedSets = featuredSets.map(set => {
          if (set.title === title && set.author === set.author) {
            return {
              ...set,
              timesAdded: (parseInt(set.timesAdded) || 0) + 1
            };
          }
          return set;
        });

        
        await updateDoc(featuredDocRef, {
          sets: updatedFeaturedSets
        });
      }

      
      const newSet = {
        title: title,
        content: content,
        subject: subject,
        promptMode: promptMode,
        color: randomColor({ luminosity: "dark" }),
        tag: tag,
        scrollGenerationMode: 1,
      };
      currentSets.push(newSet);

    
      await updateDoc(docRef, { sets: currentSets });

      
      localStorage.setItem("sets", JSON.stringify(currentSets));
      if (!localStorage.getItem("currentSet")) {
        localStorage.setItem("currentSet", JSON.stringify(newSet));
      }

      
      setRecentlyAdded(prev => new Set([...prev, getSetKey(title, content)]));

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

  const handlePublicToggle = async (item) => {
    try {
      const featuredDocRef = doc(db, 'sets', 'featured');
      const userRef = doc(db, "users", user);
      
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        return;
      }
      const currentSets = userDoc.data().sets || [];

      const featuredDoc = await getDoc(featuredDocRef);
      if (!featuredDoc.exists()) {
        return;
      }
      const featuredSets = featuredDoc.data()?.sets || [];

      
      const isCurrentlyPublic = featuredSets.some(set => 
        set.title === item.title && 
        set.content === item.content && 
        set.color === item.color && 
        set.author === user
      );

      if (isCurrentlyPublic) {
        // stores timesAdded
        const currentSet = featuredSets.find(set => 
          set.title === item.title && 
          set.content === item.content && 
          set.color === item.color && 
          set.author === user
        );
        const savedTimesAdded = currentSet?.timesAdded || 0;
        
        // stores timesAdded in localStorage
        localStorage.setItem(`timesAdded_${item.title}_${item.color}`, savedTimesAdded.toString());

        const updatedFeaturedSets = featuredSets.filter(set => 
          !(set.title === item.title && 
            set.content === item.content && 
            set.color === item.color && 
            set.author === user)
        );
        
        await updateDoc(featuredDocRef, {
          sets: updatedFeaturedSets
        });

        const updatedSets = currentSets.map(set => 
          set.title === item.title && 
          set.content === item.content &&
          set.color === item.color
            ? { ...set, isPublic: false }
            : set
        );
        
        await updateDoc(userRef, { sets: updatedSets });
        setMySets(updatedSets);
      } else {
        if (!item.title || !item.content) {
          return;
        }

        // retrieves the saved timesAdded value
        const savedTimesAdded = parseInt(localStorage.getItem(`timesAdded_${item.title}_${item.color}`)) || 0;

        const publicItem = {
          ...item,
          isPublic: true,
          author: user,
          timesAdded: savedTimesAdded 
        };

        
        const isDuplicate = featuredSets.some(set => {
          if (!set.title || !set.content) {
            return false;
          }
          
          const normalizedSetTitle = set.title.trim().toLowerCase();
          const normalizedItemTitle = item.title.trim().toLowerCase();
          const normalizedSetContent = set.content.trim().toLowerCase();
          const normalizedItemContent = item.content.trim().toLowerCase();
          
          return normalizedSetTitle === normalizedItemTitle && 
                 normalizedSetContent === normalizedItemContent;
        });

        if (isDuplicate) {
          setShowAlreadyFeaturedWarning(true);
          return;
        }

        await updateDoc(featuredDocRef, {
          sets: [...featuredSets, publicItem]
        });

        const updatedSets = currentSets.map(set => 
          set.title === item.title && 
          set.content === item.content &&
          set.color === item.color
            ? { ...set, isPublic: true }
            : set
        );
        
        await updateDoc(userRef, { sets: updatedSets });
        setMySets(updatedSets);
      }
    } catch (error) {
      console.error('Error in handlePublicToggle:', error);
    }
  };

  
  const handleNewClick = () => {
    setStyle(0); 
    setParams([]); 
    setOpenNewTopic(!openNewTopic);
  };

  const Toggle = ({ isChecked, handleChange, id }) => {
    const toggleStyles = {
      container: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
      },
      input: {
        visibility: "hidden",
        width: 0,
        height: 0,
      },
      switch: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        width: "60px",
        height: "30px",
        borderRadius: "30px",
        transition: "background-color 0.3s ease",
      },
      button: {
        position: "absolute",
        top: "2px",
        left: "2px",
        width: "26px",
        height: "26px",
        borderRadius: "50%",
        background: "white",
        transition: "transform 0.3s ease",
        transform: isChecked ? "translateX(30px)" : "translateX(0)",
      },
      text: {
        color: "white",
        fontSize: "14px",
        marginLeft: "8px",
      }
    };

    return (
      <div style={toggleStyles.container}>
        <input
          type="checkbox"
          id={`toggle-${id}`}
          style={toggleStyles.input}
          checked={isChecked}
          onChange={(e) => handleChange(e.target.checked)}
        />
        <label 
          htmlFor={`toggle-${id}`} 
          style={{
            ...toggleStyles.switch,
            backgroundColor: isChecked ? "#4CAF50" : "#f44336"
          }}
        >
          <span 
            style={toggleStyles.button}
            id={`toggle-button-${id}`}
          />
        </label>
        <span style={toggleStyles.text}>Make Public</span>
      </div>
    );
  };

  const DuplicateWarningPopup = ({ onClose, isOwnLibrary }) => {
    return (
      <>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999
        }} onClick={onClose} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: window.innerWidth <= 768 ? 'translate(-50%, -50%)' : 'translate(-25.5%, -50%)',
          backgroundColor: '#28282B',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          zIndex: 1000,
          width: '400px',
          border: '1px solid #353935'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, color: 'white' }}>
              {isOwnLibrary ? "This is your own library!" : "Set Already Exists"}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '5px'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ color: 'white', marginBottom: '20px' }}>
            {isOwnLibrary ? "You can't add sets from your own library!" : "This set already exists in your library!"}
          </p>
        </div>
      </>
    );
  };

  const SubscriptionWarningPopup = ({ onClose }) => {
    return (
      <>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999
        }} onClick={onClose} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: window.innerWidth <= 768 ? 'translate(-50%, -50%)' : 'translate(-25.5%, -50%)',
          backgroundColor: '#28282B',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          zIndex: 1000,
          width: '400px',
          border: '1px solid #353935'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, color: 'white' }}>Subscription Required</h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '5px'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ color: 'white', marginBottom: '20px' }}>
            You can only have 10 sets at once in the library. Upgrade to premium for unlimited sets!
          </p>
        </div>
      </>
    );
  };

  const getUsername = async (email) => {
    if (usernameCache[email]) return usernameCache[email];

    try {
      const userDoc = await getDoc(doc(db, "users", email));
      let username;
      
      if (userDoc.exists()) {
        username = userDoc.data().name || `@Cookr${generateUniqueNumber(email)}`;
      } else {
        username = `@Cookr${generateUniqueNumber(email)}`;
      }

      setUsernameCache(prev => ({ ...prev, [email]: username }));
      return username;
    } catch (error) {
      console.error("Error fetching username:", error);
      return `@Cookr${generateUniqueNumber(email)}`;
    }
  };

  const AuthorDisplay = ({ email }) => {
    const [username, setUsername] = useState(usernameCache[email] || '');

    useEffect(() => {
      if (!username) {
        getUsername(email).then(name => setUsername(name));
      }
    }, [email]);

    if (!username) return null;

    return (
      <p style={{ margin: 0, color: "#999", fontSize: "14px", marginBottom: "12px" }}>
        By {username}
      </p>
    );
  };

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const usernamesDoc = await getDoc(doc(db, "usernames", "names"));
        if (usernamesDoc.exists()) {
          const usernames = usernamesDoc.data().usernames;
          const usernameMapping = {};
          if (Array.isArray(usernames)) {
            usernames.forEach(entry => {
              if (entry && entry.email) {
                usernameMapping[entry.email] = entry.name;
              }
            });
          }
          setUsernameCache(usernameMapping);
        }
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    };

    fetchUsernames();
  }, []);

  const AlreadyFeaturedWarningPopup = ({ onClose }) => {
    return (
      <>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999
        }} onClick={onClose} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: window.innerWidth <= 768 ? 'translate(-50%, -50%)' : 'translate(-25.5%, -50%)',
          backgroundColor: '#28282B',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          zIndex: 1000,
          width: '400px',
          border: '1px solid #353935'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, color: 'white' }}>Already Featured</h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '5px'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ color: 'white', marginBottom: '20px' }}>
            The same set is already featured in the community sets.
          </p>
        </div>
      </>
    );
  };

  const addTimesAddedToSets = async () => {
    
    try {
      const featuredDocRef = doc(db, 'sets', 'featured');
      const featuredDoc = await getDoc(featuredDocRef);
      
      if (featuredDoc.exists()) {
        const featuredSets = featuredDoc.data().sets || [];
        const updatedSets = featuredSets.map(set => ({
          ...set,
          timesAdded: set.timesAdded || 0
        }));

        await updateDoc(featuredDocRef, {
          sets: updatedSets
        });
      }
    } catch (error) {
      console.error('Error adding timesAdded to sets:', error);
    }
  };

  useEffect(() => {
    addTimesAddedToSets();
  }, []); 

  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "black",
        position: "relative"
      }}
    >
      {/*container for top portion*/}
      <div style={{
        backgroundColor: "black",
        zIndex: 1,
        padding: "20px 50px",
        display: "flex",
        flexDirection: "column",
        alignItems: window.innerWidth <= 768 ? "center" : "flex-start",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        marginTop: "20px"
      }}>
        <button
          onClick={() => navigate('/library')}
          style={{
            position: "absolute",
            left: "-1px", // Push all the way to the left
            top: "-17.5px", // Push all the way to the top
            backgroundColor: "#333",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "7px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "14px",
            zIndex: 2
          }}
        >
          ← Back to Library
        </button>
        <div style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          justifyContent: window.innerWidth <= 768 ? "center" : "space-between",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "20px",
        }}>
          <h1 style={{ 
            margin: "5px 0", 
            color: "white",
            minWidth: "200px",
            textAlign: window.innerWidth <= 768 ? "center" : "left"
          }}>
            Explore Featured Sets
          </h1>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            minWidth: "300px",
            maxWidth: "500px",
          }}>
            <button
              style={{
                borderRadius: "10px",
                backgroundColor: "#FF8C00",
                width: "50px",
                height: "50px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "none",
                cursor: "pointer",
                color: "white",
                fontSize: "30px",
                flexShrink: 0,
              }}
              onClick={handleNewClick}
            >
              +
            </button>
            <input
              type="text"
              placeholder="Search..."
              style={{
                flex: 1,
                borderRadius: "20px",
                backgroundColor: "#f0f0f0",
                border: "1px solid #808080",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                color: "#333",
                outline: "none",
                fontSize: "16px",
                height: "50px",
                paddingLeft: "20px",
                minWidth: "200px",
              }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        {/* Tabs section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          width: '300px',
          justifyContent: window.innerWidth <= 768 ? "center" : "flex-start"
        }}>
          <p
            style={getStyle("Community Sets")}
            onClick={() => handleClick("Community Sets")}
          >
            Community Sets
            {selected === "Community Sets" && (
              <span
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: "0",
                  width: "100%",
                  height: "3px",
                  backgroundColor: "white",
                  borderRadius: "2px",
                }}
              ></span>
            )}
          </p>
          <div style={{ display: 'flex', width: '30px' }}></div>
          <p
            style={getStyle("My Sets")}
            onClick={() => handleClick("My Sets")}
          >
            My Sets
            {selected === "My Sets" && (
              <span
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: "0",
                  width: "100%",
                  height: "3px",
                  backgroundColor: "white",
                  borderRadius: "2px",
                }}
              ></span>
            )}
          </p>
        </div>
      </div>

      {/*container for the cards*/}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: window.innerWidth <= 768 ? "center" : "flex-start", // Updated
          alignItems: "flex-start",
          overflowY: "auto",
          padding: window.innerWidth <= 768 ? "0" : "20px 50px", 
          gap: "20px",
          width: "100%",
        }}
      >
        {selected === "Community Sets" ? (
          <div style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: window.innerWidth <= 768 ? "center" : "flex-start", // Updated
            width: window.innerWidth <= 768 ? "100%" : "calc(100% - 10px)", // Updated width
            overflow: "visible",
            alignItems: "flex-start",
            padding: window.innerWidth <= 768 ? "0 20px" : "0", // Added horizontal padding for mobile
            marginRight: window.innerWidth <= 768 ? "0" : "10px" // Updated margin
          }}>
            {featuredSets
              .filter(item => 
                item.title?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <div
                  key={index}
                  className="libCard"
                  style={{
                    borderRadius: "10px",
                    display: "flex",
                    border: "1px solid #353935",
                    backgroundColor: "#28282B",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    width: window.innerWidth <= 768 ? "100%" : "300px", // Updated width
                    maxWidth: "300px",
                    margin: "0",
                    padding: "20px",
                    flexShrink: 0
                  }}
                >
                  <div>
                    <h3 style={{
                      margin: 0,
                      color: "white",
                      fontSize: "18px",
                      marginBottom: "4px"
                    }}>
                      {item.title}
                    </h3>
                    <AuthorDisplay email={item.author} />
                    <div style={{
                      color: "#ccc",
                      fontSize: "14px",
                      marginBottom: "20px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: "4",
                      WebkitBoxOrient: "vertical",
                      maxHeight: "80px"
                    }}>
                      {item.content}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        alert("Please sign in to add sets to your library");
                        return;
                      }
                      const isOwnSet = selected === "My Sets";
                      saveToFirestore(
                        item.title,
                        item.content,
                        item.subject || "",
                        item.promptMode || "",
                        item.tag || "",
                        isOwnSet
                      );
                    }}
                    style={{
                      backgroundColor: isSetDuplicate(item.title, item.content) ? "#ff4444" : 
                                      isSetAddedOrRecent(item.title, item.content) ? "#4CAF50" : "#FF8C00",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "8px 16px",
                      cursor: isSetDuplicate(item.title, item.content) || 
                              isSetAddedOrRecent(item.title, item.content) ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.7s ease",
                    }}
                    disabled={isSetDuplicate(item.title, item.content) || 
                              isSetAddedOrRecent(item.title, item.content)}
                  >
                    {isSetDuplicate(item.title, item.content) ? "Set Already in Library" :
                     isSetAddedOrRecent(item.title, item.content) ? "Added to Library!" : "Add to Library"}
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: window.innerWidth <= 768 ? "center" : "flex-start", // Updated
            width: window.innerWidth <= 768 ? "100%" : "calc(100% - 10px)", // Updated width
            overflow: "visible",
            alignItems: "flex-start",
            padding: window.innerWidth <= 768 ? "0 20px" : "0", // Added horizontal padding for mobile
            marginRight: window.innerWidth <= 768 ? "0" : "10px" // Updated margin
          }}>
            {mySets
              .filter(item => 
                item.title?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <div
                  key={index}
                  className="libCard"
                  style={{
                    borderRadius: "10px",
                    display: "flex",
                    border: "1px solid #353935",
                    backgroundColor: "#28282B",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    width: window.innerWidth <= 768 ? "100%" : "300px", // Updated width
                    maxWidth: "300px",
                    margin: "0",
                    padding: "20px",
                    flexShrink: 0
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px"
                  }}>
                    <h3 style={{
                      margin: 0,
                      color: "white",
                      fontSize: "18px"
                    }}>
                      {item.title}
                    </h3>
                    <Toggle
                      id={index}
                      isChecked={item.isPublic || false}
                      handleChange={() => handlePublicToggle(item)}
                    />
                  </div>
                  <div style={{
                    color: "#ccc",
                    fontSize: "14px",
                    marginTop: "10px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: "7",
                    WebkitBoxOrient: "vertical",
                    maxHeight: "140px"
                  }}>
                    {item.content}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {openNewTopic && (
        <NewPrompt
          setOpenNewTopic={setOpenNewTopic}
          style={style}
          params={params}
          type={3}
        />
      )}
      {showDuplicateWarning && (
        <DuplicateWarningPopup 
          onClose={() => {
            setShowDuplicateWarning(false);
          }} 
          isOwnLibrary={selected === "My Sets"}
        />
      )}
      {showSubscriptionWarning && (
        <SubscriptionWarningPopup onClose={() => setShowSubscriptionWarning(false)} />
      )}
      {showAlreadyFeaturedWarning && (
        <AlreadyFeaturedWarningPopup onClose={() => setShowAlreadyFeaturedWarning(false)} />
      )}
      {window.innerWidth <= 768 && (
        <Bottom
          streak={streak}
          currentPage={'featured'}
          xp={xp}
          sets={sets}
          currentSet={currentSet}
          setCurrentSet={setCurrentSet}
          mobileDimension={true}
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

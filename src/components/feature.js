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
  import { useNavigate } from 'react-router-dom';
  import Bottom from "./BottomNav";

var randomColor = require("randomcolor"); // import the script

const generateUniqueNumber = (email) => {
  if (!email) {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

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
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [user, setUser] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [mySets, setMySets] = useState([]); 
  const [featuredSets, setFeaturedSets] = useState([]); 
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
  const [usernameCache, setUsernameCache] = useState({});
  const [recentlyAdded, setRecentlyAdded] = useState(new Set());
  const [duplicateSet, setDuplicateSet] = useState(new Set());
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
        
        // Check for already added sets immediately
        if (user) {
          const userRef = doc(db, "users", user);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userSets = userDoc.data().sets || [];
            const alreadyAdded = new Set();
            userSets.forEach(set => {
              alreadyAdded.add(getSetKey(set.title, set.content));
            });
            setDuplicateSet(alreadyAdded);
          }
        }
        
        setFeaturedSets(sortedSets);
        setSets(sortedSets);
      };

      fetchFeaturedSets();
    } catch (error) {
      console.error("Error fetching featured sets:", error);
    }
  }, [user]); 
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
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 0) {
      const searchResults = selected === "Community Sets" ? 
        featuredSets.filter(item => 
          item.title?.toLowerCase().includes(query.toLowerCase()) ||
          item.content?.toLowerCase().includes(query.toLowerCase())
        ) :
        mySets.filter(item => 
          item.title?.toLowerCase().includes(query.toLowerCase()) ||
          item.content?.toLowerCase().includes(query.toLowerCase())
        );
      
      setRecommendations(searchResults.slice(0, 5));
      setShowRecommendations(true);
    } else {
      setShowRecommendations(false);
    }
  };

  const handleRecommendationClick = (item) => {
    setSearchQuery(item.title);
    setShowRecommendations(false);
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

      // Check if the set is already in featured sets
      const isCurrentlyPublic = featuredSets.some(set => 
        set.title === item.title && 
        set.content === item.content && 
        set.color === item.color && 
        set.author === user
      );

      if (isCurrentlyPublic) {
        // Remove from featured sets but preserve the timesAdded value
        const removedSet = featuredSets.find(set => 
          set.title === item.title && 
          set.content === item.content && 
          set.color === item.color && 
          set.author === user
        );
        
        const updatedFeaturedSets = featuredSets.filter(set => 
          !(set.title === item.title && 
            set.content === item.content && 
            set.color === item.color && 
            set.author === user)
        );
        
        await updateDoc(featuredDocRef, {
          sets: updatedFeaturedSets
        });

        // Update user's sets while preserving timesAdded
        const updatedSets = currentSets.map(set => 
          set.title === item.title && 
          set.content === item.content &&
          set.color === item.color
            ? { ...set, isPublic: false, timesAdded: removedSet.timesAdded || 0 }
            : set
        );
        
        await updateDoc(userRef, { sets: updatedSets });
        setMySets(updatedSets);
      } else {
        if (!item.title || !item.content) {
          return;
        }

        // Add to featured sets with preserved timesAdded
        const publicItem = {
          ...item,
          isPublic: true,
          author: user,
          timesAdded: item.timesAdded || 0 // Preserve the existing timesAdded value
        };

        await updateDoc(featuredDocRef, {
          sets: [...featuredSets, publicItem]
        });

        // Update user's sets
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

  // Add a new function to handle set updates
  const updateSetInBothCollections = async (updatedSet) => {
    try {
      const userRef = doc(db, "users", user);
      const featuredDocRef = doc(db, 'sets', 'featured');

      // Update in user's sets
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentSets = userDoc.data().sets || [];
        const updatedSets = currentSets.map(set => 
          set.title === updatedSet.title && 
          set.content === updatedSet.content &&
          set.color === updatedSet.color
            ? { ...set, ...updatedSet }
            : set
        );
        await updateDoc(userRef, { sets: updatedSets });
        setMySets(updatedSets);
      }

      // Update in featured sets if the set is public
      const featuredDoc = await getDoc(featuredDocRef);
      if (featuredDoc.exists()) {
        const featuredSets = featuredDoc.data()?.sets || [];
        const updatedFeaturedSets = featuredSets.map(set => 
          set.title === updatedSet.title && 
          set.content === updatedSet.content &&
          set.color === updatedSet.color &&
          set.author === user
            ? { ...set, ...updatedSet }
            : set
        );
        await updateDoc(featuredDocRef, {
          sets: updatedFeaturedSets
        });
      }
    } catch (error) {
      console.error('Error updating set:', error);
    }
  };

  // Updated saveToFirestore function
  const saveToFirestore = async (title, content, subject, promptMode, tag) => {
    try {
      console.log('Starting saveToFirestore with:', { title, content, subject, promptMode, tag });
      
      const userEmail = user;
      if (!userEmail) {
        console.error('No user email found');
        return;
      }

      const docRef = doc(db, "users", userEmail);
      const featuredDocRef = doc(db, "sets", "featured");
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error("User document not found");
        return;
      }

      let currentSets = docSnap.data().sets || [];
      console.log('Current sets:', currentSets);

      const isDuplicate = isSetDuplicate(title, content) || isSetAddedOrRecent(title, content);
      if (isDuplicate) {
        console.log('Duplicate set detected');
        setDuplicateSet(prev => new Set([...prev, getSetKey(title, content)]));
        setShowDuplicateWarning(true);
        return;
      }

      if (!hasSubscription && currentSets.length >= 10) {
        console.log('Set limit reached for free user');
        setShowSubscriptionWarning(true);
        return;
      }

      // Find the original set in featured sets
      const featuredSnap = await getDoc(featuredDocRef);
      const featuredSets = featuredSnap.exists() ? featuredSnap.data().sets || [] : [];
      const originalSet = featuredSets.find(set => 
        set.title === title && 
        set.content === content
      );

      if (originalSet) {
        // Increment timesAdded in the featured set
        const updatedFeaturedSets = featuredSets.map(set => {
          if (set.title === title && set.content === content) {
            return {
              ...set,
              timesAdded: (set.timesAdded || 0) + 1
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
        author: originalSet?.author || userEmail,
        isPublic: false,
        isAddedFromCommunity: !!originalSet,
        timesAdded: originalSet?.timesAdded || 0 // Preserve the timesAdded value
      };

      currentSets.push(newSet);
      console.log('Updated sets array:', currentSets);

      await updateDoc(docRef, { sets: currentSets });
      console.log('Successfully updated Firestore');

      localStorage.setItem("sets", JSON.stringify(currentSets));
      if (!localStorage.getItem("currentSet")) {
        localStorage.setItem("currentSet", JSON.stringify(newSet));
      }

      setRecentlyAdded(prev => new Set([...prev, getSetKey(title, content)]));
      console.log('Successfully completed saveToFirestore');

    } catch (e) {
      console.error("Error in saveToFirestore:", e);
      console.error("Error details:", {
        message: e.message,
        code: e.code,
        stack: e.stack
      });
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
        gap: "4px",  // Reduced from 8px to 4px
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
        marginLeft: "4px",  // Reduced from 8px to 4px
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
              Set Already Exists
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
            This set already exists in your library!
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
    if (!email) {
      return `@Cookr${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    }

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
      if (!username && email) {
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

  const PersonIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      style={{ width: '16px', height: '16px', marginRight: '4px' }}
    >
      <path
        fill="currentColor"
        d="M13 8c0-2.21-1.79-4-4-4S5 5.79 5 8s1.79 4 4 4s4-1.79 4-4m2 2v2h3v3h2v-3h3v-2h-3V7h-2v3zM1 18v2h16v-2c0-2.66-5.33-4-8-4s-8 1.34-8 4"
      ></path>
    </svg>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
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
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        marginTop: "10px",
        alignItems: "center"
      }}>
        <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginBottom: "20px"
        }}>
          {window.innerWidth <= 768 ? (
            <svg
              onClick={() => navigate('/library')}
              style={{
                position: "absolute",
                left: "-30px",
                top: "0px",
                cursor: "pointer",
                width: "35px",
                height: "35px",
                fill: "white"
              }}
              viewBox="0 0 24 24"
            >
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          ) : (
        <button
              onClick={() => navigate('/library')}
            style={{
              position: "absolute",
                left: "-30px",
                top: "0px",
                cursor: "pointer",
                display: "flex",
              alignItems: "center",
                gap: "8px",
                background: "linear-gradient(90deg, #1a1a1a, #333333, #1a1a1a)",
                border: "none",
                color: "white",
                fontSize: "13px",
                padding: "8px 8px",
                borderRadius: "5px"
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to Library
          </button>
          )}
          <h1 style={{ 
            color: "white",
            minWidth: "200px",
            textAlign: "center",
            margin: 0
          }}>
            Explore Sets
          </h1>
        </div>
        <div style={{
          display: "flex",
          flexDirection: window.innerWidth <= 768 ? "column" : "row",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          gap: window.innerWidth <= 768 ? "20px" : "0",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            minWidth: "300px",
            maxWidth: "500px",
            justifyContent: "center",
            width: window.innerWidth <= 768 ? "100%" : "auto",
            position: "relative"
          }}>
            <div style={{ position: "relative", flex: 1 }}>
        <input
        type="text"
        placeholder="Search..."
        style={{
                  width: "100%",
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
                  maxWidth: window.innerWidth <= 768 ? "100%" : "none"
        }}
        value={searchQuery}
        onChange={handleSearchChange}
                onBlur={() => setTimeout(() => setShowRecommendations(false), 200)}
              />
              {showRecommendations && recommendations.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: window.innerWidth <= 768 ? "105%" : "108%", // Match full width of search bar
                  backgroundColor: "#28282B",
                  border: "1px solid #353935",
                  borderRadius: "10px",
                  marginTop: "5px",
                  zIndex: 1000,
                  maxHeight: "180px",
                  overflowY: "auto"
                }}>
                  {recommendations.slice(0, 10).map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleRecommendationClick(item)}
                      style={{
                        padding: "8px 20px 4px 20px", // Reduced bottom padding to 4px
                        cursor: "pointer",
                        color: "white",
                        borderBottom: index < recommendations.length - 1 ? "1px solid #353935" : "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        overflow: "hidden"
                      }}
                    >
                      <div style={{ 
                        fontWeight: "bold",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {item.title}
                      </div>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#999",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {item.content?.substring(0, 100)}...
                      </div>
                      {item.author && (
                        <div style={{ 
                          fontSize: "12px",
                          color: "#999",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: 0 // Ensure no bottom margin
                        }}>
                          <AuthorDisplay email={item.author} />
        </div>
        )}
    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Tabs section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          width: '300px',
          justifyContent: "center"
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
                  left: "-11%",
                  width: "110%",
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
          justifyContent: "center",
          alignItems: "flex-start",
          overflowY: "auto",
          padding: window.innerWidth <= 768 ? "0" : "20px 50px", 
          gap: "20px",
          width: window.innerWidth <= 768 ? "100%" : "95.5%",
          height: window.innerWidth <= 768 ? "calc(100vh - 200px)" : "auto",
          marginBottom: window.innerWidth <= 768 ? "80px" : "0"
        }}
      >
        {selected === "Community Sets" ? (
          <div style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
            width: window.innerWidth <= 768 ? "100%" : "calc(100% - 10px)",
            overflow: "visible",
            alignItems: "flex-start",
            padding: window.innerWidth <= 768 ? "0 20px" : "0",
            marginRight: window.innerWidth <= 768 ? "0" : "10px"
          }}>
            {featuredSets
              .filter(item => 
                item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.content?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    width: window.innerWidth <= 768 ? "100%" : "300px",
                    maxWidth: "300px",
                    margin: "0",
                    padding: "20px",
                    flexShrink: 0,
                    height: "200px" // Fixed height for the card
                  }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#999',
                    fontSize: '14px'
                  }}>
                    <PersonIcon />
                    {item.timesAdded || 0}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start", 
                      marginBottom: "15px",
                      width: "100%",
                      marginTop: "-10px"
                    }}>
                      <div style={{ 
                        display: "flex", 
                        flexDirection: "column",
                        width: "calc(100% - 40px)"
                      }}>
                        <h3 style={{
                          margin: 0,
                          color: "white",
                          fontSize: "18px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                          lineHeight: "1.2",
                          padding: "2px 0"
                        }}>
                          {item.title}
                        </h3>
                        <div style={{
                          minHeight: "20px"
                        }}>
                          {item.author && <AuthorDisplay email={item.author} />}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      color: "#ccc",
                      fontSize: "14px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: "5",  // Changed from 4 to 5 lines
                      WebkitBoxOrient: "vertical",
                      maxHeight: "100px",    // Adjusted from 80px to 100px for 5 lines
                      flex: "0 1 auto",
                      marginTop: "-7px"      // Added negative margin to move content up
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
                      saveToFirestore(
                        item.title,
                        item.content,
                        item.subject || "",
                        item.promptMode || "",
                        item.tag || ""
                      );
                    }}
                    style={{ 
                      backgroundColor: isSetDuplicate(item.title, item.content) ? "#4CAF50" : 
                                      isSetAddedOrRecent(item.title, item.content) ? "#4CAF50" : "#FF8C00",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "8px 16px",
                      cursor: isSetDuplicate(item.title, item.content) || 
                              isSetAddedOrRecent(item.title, item.content) ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.7s ease",
                      marginTop: "15px",
                      opacity: isSetDuplicate(item.title, item.content) || 
                              isSetAddedOrRecent(item.title, item.content) ? 0.7 : 1
                    }}
                    disabled={isSetDuplicate(item.title, item.content) || 
                              isSetAddedOrRecent(item.title, item.content)}
                  >
                    {isSetDuplicate(item.title, item.content) ? "Already Added" :
                     isSetAddedOrRecent(item.title, item.content) ? "Already Added" : "Add to Library"}
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
            justifyContent: "center",
            width: window.innerWidth <= 768 ? "100%" : "calc(100% - 10px)",
            overflow: "visible",
            alignItems: "flex-start",
            padding: window.innerWidth <= 768 ? "0 20px" : "0",
            marginRight: window.innerWidth <= 768 ? "0" : "10px"
          }}>
            {mySets
              .filter(item => 
                item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.content?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    width: window.innerWidth <= 768 ? "100%" : "300px",
                    maxWidth: "300px",
                    margin: "0",
                    padding: "20px",
                    flexShrink: 0,
                    minHeight: window.innerWidth <= 768 ? "200px" : "auto"
                  }}
                >
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    height: "40px"  // Fixed height for the header section
                  }}>
                    <h3 style={{
                      margin: 0,
                      color: "white",
                      fontSize: "18px"
                    }}>
                      {item.title.length > 12 
                        ? `${item.title.substring(0, 12)}...` 
                        : item.title}
                    </h3>
                    <div style={{
                      minHeight: "20px"  // Reserved space for author display
                    }}>
                      {(selected === "Community Sets" || (selected === "My Sets" && item.author && item.author !== user)) && 
                        <AuthorDisplay email={item.author} />
                      }
                    </div>
                  </div>
                  {selected === "My Sets" && (item.author === user || !item.author) && (
                    <Toggle
                      id={index}
                      isChecked={item.isPublic || false}
                      handleChange={() => handlePublicToggle(item)}
                    />
                  )}
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
                    lineHeight: "1.4em",  // Set explicit line height
                    height: "9.8em",      // Set height to exactly 7 lines (1.4em * 7)
                    marginBottom: "10px", // Add margin to separate from any elements below
                    flex: "0 1 auto"      // Changed from flex: 1
                  }}>
                    {item.content}
                  </div>
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

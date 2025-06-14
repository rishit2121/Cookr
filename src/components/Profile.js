import React, { useState, useEffect, useRef} from "react";
import NewPrompt from "./NewPrompt";
import { getDoc, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { db} from "./firebase/Firebase";
import Plans from "./Plans";
import { useNavigate } from "react-router-dom";
import AdsComponent from './adComponent';
import { auth, signInWithGoogle, logOut, } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";
import panda from "../assets/panda.jpeg"
import monkey from "../assets/monkey.jpeg"
import shark from "../assets/shark.jpeg"
import owl from "../assets/owl.jpeg"
import chipmunk from "../assets/chipmunk.jpeg"
import squirrel from "../assets/squirrel.jpeg"
import dog from "../assets/dog.jpeg"
import userIcon from "../assets/user_icon_image_bigger.png"
import { initializeApp } from "firebase/app";
import { uploadBytes, getDownloadURL,getStorage, ref, deleteObject } from "firebase/storage";
import i18n from "../i18n";
import { useTranslation } from 'react-i18next';



const firebaseConfig = {
  apiKey: "AIzaSyBcAflmvDXqpij4lsHbQvBcEzfH0OmpVDc",
  authDomain: "scroller-study.firebaseapp.com",
  projectId: "scroller-study",
  storageBucket: "scroller-study.firebasestorage.app",
  messagingSenderId: "851981711973",
  appId: "1:851981711973:web:a81c4df819510a2cd8648c",
  measurementId: "G-SKW3ECVBYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage=getStorage(app)


const profilePictures = {
  panda: panda,
  shark: shark,
  monkey: monkey,
  owl: owl,
  squirrel:  squirrel,
  chipmunk: chipmunk,
  dog: dog
};




const MyProfile = ({ mobileDimension }) => {
  const { t } = useTranslation();
  const [showPlans, setShowPlans] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [name, setName] = useState();
  const [planType, setPlanType] = useState('free');
  const [referalCode, setReferalCode] = useState();
  const [streak, setStreak] = useState(0);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userXP, setUserXP] = useState(0);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAlias, setSelectedAlias] = useState(null);
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("profileImage") || null;
    
  });


  const [joinDate, setJoinDate] = useState(() => {
    return localStorage.getItem("joinDate") || '';
  });

  const [popupType, setPopupType] = useState(null);
  const link = "https://www.cookr.co/";

  const [copied, setCopied] = useState(false);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState(name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);

    // Hide the notification after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out Cookr!',
        text: 'Join me on Cookr, a study app designed for students aged 12 and above!',
        url: link, // The link to share
      })
      .then(() => console.log('Share successful'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that do not support the Web Share API
      alert('Sharing is not supported in this browser. Please copy the link manually.');
    }
  };

  const handleContact = () => {
    window.open("https://forms.gle/ryFqJFQPqgG2xJhJ6", "_blank");
  };

  const handleTerms = () => {
    window.open('/#/terms', '_blank'); // Opens the terms page in a new tab with hash routing
  };

  const handleClosePopup = () => {
    setPopupType(null);
  };
//   const forceUpdate = useState()[1];

// useEffect(() => {
//   if (profileImage) {
//     forceUpdate((prev) => !prev);
//   }
// }, [profileImage]);


  function generateUniqueNumber(email) {
    // Create a hash of the email by converting it to a string and then hashing it
    const hash = Array.from(email)
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
    // Generate a random number using the hash value, and ensure it's a 6-digit number
    const randomNumber = (hash * 1000) % 900000 + 100000; // Generates a 6-digit number
  
    return randomNumber;
  }
  const toggleEmailVisibility = () => {
    setIsEmailVisible(!isEmailVisible);
  };
  const [imageSrc, setImageSrc] = useState(null);

  const handleImageUpload = (event) => {
    event.preventDefault(); // Prevent default form behavior

    let file;
    if (event.type === "drop") {
      file = event.dataTransfer.files[0]; // File from drag event
    } else {
      file = event.target.files[0]; // File from input
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleRetake = () => setImageSrc(null);
  const handleConfirm = async () => {
    setShowPopup(false);
  
    if (!imageSrc) {
      alert("No image selected!");
      return;
    }
  
    const userEmail = user; // Replace with actual user email, e.g., from session or auth context
    const imageFile = dataUrlToFile(imageSrc); // Converts the data URL to a File object

  
    // Reference for the previous image (profile_picture.jpg)
    const oldImageRef = ref(storage, `images/${userEmail}/profile_picture.jpg`);
    const newImageRef = ref(storage, `images/${userEmail}/${imageFile.name}`);
  
    try {
      // Check if the old image exists and delete it if it does
      try {
        await deleteObject(oldImageRef);
      } catch (deleteError) {
      }
  
      // Upload the new image
      await uploadBytes(newImageRef, imageFile);
  
      // After successful upload, get the download URL
      const downloadURL = await getDownloadURL(newImageRef);
      localStorage.setItem("profileImage", downloadURL);
      setProfileImage(downloadURL)

  
      // Do whatever you want with the download URL (e.g., save to Firestore)
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  const [isUsernameValid, setIsUsernameValid] = useState(null); // true, false, or null

  
  
  // Helper function to convert the data URL to a File object
  const dataUrlToFile = (dataUrl) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "profile_picture.jpg", { type: mime });
  };
  



  
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
  
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  const logout = () => {
    signOut(auth)
      .then(() => {
        // Clear specific items from localStorage, preserving language
        const itemsToKeep = ['language', 'darkMode']; // Add any other items to keep
        Object.keys(localStorage).forEach(key => {
          if (!itemsToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        });
        navigate("/auth");

      })
      .catch((error) => {
      });
  };
  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    
    // Format the date to "Feb 10, 2024"
    return date.toLocaleDateString('en-US', options);
  };
  function formatXP(xp) {
    if (xp < 1000) return xp.toString();
    if (xp < 1_000_000) return (xp / 1000).toPrecision(3) + 'K';
    return (xp / 1_000_000).toPrecision(3) + 'M';
  }
  
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
      setUser(currentUser.email);
        const userName = currentUser.displayName ? currentUser.displayName : null;
      const rawJoinDate = currentUser.metadata.creationTime;
      const formattedJoinDate = formatJoinDate(rawJoinDate);

        setName(userName);
      setJoinDate(formattedJoinDate);
        setLoading(false);

        // Set up Firestore listener only when we have a valid user
        try {
          const unsubscribeFirestore = onSnapshot(
            doc(db, "users", currentUser.email),
        (doc) => {
              if(doc.data().name !== null){
          setName(doc.data().name);
          }
              setPlanType(doc.data().plan || 'free');
              setReferalCode(doc.data().myCode);
              setStreak(doc.data().streak || 0);
          const profilePicture = doc.data().profilePicture;
          setSelectedAlias(profilePicture ? profilePicture : '');
          // Set the language from Firebase, defaulting to 'en' if not set
          setSelectedLanguage(doc.data().language || 'en');
          // Also update the i18n instance with the fetched language
          i18n.changeLanguage(doc.data().language || 'en');
        }
      );
          return () => unsubscribeFirestore(); // Cleanup Firestore listener
    } catch (error) {
          setPlanType('free');
      alert("Error");
    }
      } else {
        // Handle case when user is not logged in
        setUser(null);
        setName(null);
        setPlanType('free');
        setLoading(false);
      }
    });
    return () => unsubscribe(); // Cleanup auth listener
  }, []);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) {
        const imageRef = ref(storage, `images/${user}/profile_picture.jpg`);
        try {
          const imageUrl = await getDownloadURL(imageRef);
          localStorage.setItem("profileImage", imageUrl);
          setProfileImage(imageUrl)
        } catch (error) {
          console.error("Error fetching image from Firebase:", error);
          const defaultImageUrl = userIcon; 
          localStorage.setItem("profileImage", defaultImageUrl);
          setProfileImage(defaultImageUrl);
        }
      }
    };

    const fetchXP = async () => {
      if (user) {
        try {
          const docRef = doc(db, "leaderboard", "rankings");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const rankingList = docSnap.data().ranking || [];
            const userData = rankingList.find(player => player.email === user);
            const userXPValue = userData ? userData.XP : 0;
            localStorage.setItem("trueXP", userXPValue.toString());
            setUserXP(userXPValue);
          }
        } catch (error) {
          console.error("Error fetching XP from Firestore:", error);
        }
      }
    };

    
      fetchProfileImage();
    

    if(!localStorage.getItem("trueXP")) {
      fetchXP();
    } else {
      setUserXP(parseInt(localStorage.getItem("trueXP")));
    }
  }, [user]); // This effect will run when userEmail changes
  const handleSelectPicture = async (alias) => {
    setSelectedAlias(alias);
    setShowPopup(false);

    // Save alias in Firestore
    await updateDoc(doc(db, "users", user), { profilePicture: alias });
  };
  // useEffect(() => {
  //   if (!loading) {
  //     // Subscribe to the leaderboard document
  //     const unsubscribe = onSnapshot(doc(db, "leaderboard", "rankings"), (doc) => {
  //       if (doc.exists()) {
  //         const rankingList = doc.data().ranking || [];
  //         const userData = rankingList.find(player => player.email === user);
  //         setUserXP(userData ? userData.XP : 0);
  //       }
  //     });
  //     return () => unsubscribe();
  //   }
  // }, [loading, user]);
  if (loading) {
    return null; // Show nothing while loading
  }

  if (!user) {
    return null; // Show nothing if no user
  }

  const handleUsernameEdit = async () => {
    if (isEditingUsername) {
      // Save the changes
      if (editedUsername.trim() === '') {
        setErrorMessage(t("usernameError1"));
        return;
      }

      // Check if username is the same as current
      if (editedUsername === name) {
        setErrorMessage(t("usernameError2"));
        return;
      }

      // Check for spaces
      if (editedUsername.includes(' ')) {
        setErrorMessage(t("usernameError3"));
        return;
      }

      // Check for capital letters
      if (editedUsername !== editedUsername.toLowerCase()) {
        setErrorMessage(t("usernameError4"));
        return;
      }

      // Check for special characters
      const specialChars = "!\"#$%&'()*+,-/:;<=>?@[]^_`{|}~";
      if (editedUsername.split('').some(char => specialChars.includes(char))) {
        setErrorMessage(t("usernameError5"));
        return;
      }
      // Check username length
      if (editedUsername.length < 4 || editedUsername.length > 18) {
        setErrorMessage(t("usernameError6"));
        return;
      }

      // Check for explicit words
      const explicitWords = [
        "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cock", "pussy", "cunt", "twat", 
        "hell", "crap", "prick", "slut", "whore", "sex", "porn", "porno",
        "pornhub", "xxx", "dildo", "anal", "oral", "nude", "boob", "boobs", "tits", "vagina",
        "penis", "cum", "ejaculate", "jerkoff", "blowjob", "handjob", "threesome", "fingering",
        "rimjob", "milf", "bdsm", "fetish", "pegging", "stripper", "stripclub",
        "masturbate", "masturbation", "retard", "fag", "faggot", "dyke", "tranny", "coon",
        "chink", "gook", "nigga", "nigger", "kike","wetback", "towelhead",
        "rape", "sex", "sexy",
        "marijuana", "cocaine", "meth", "heroin", "lsd",
        "ecstasy","adderall", "xanax", "opioid", "ketamine","stoner","onlyfans", "fuk", "fck",
        "sht", "bi7ch", "b1tch","c0ck", "d1ck", "pu55y", "cumslut", "s3x",
        "p0rn", "n00d","phuck"
      ];
       

      const containsExplicitWord = explicitWords.some(word => 
        editedUsername.toLowerCase().includes(word)
      );

      if (containsExplicitWord) {
        setErrorMessage(t("usernameError7"));
        return;
      }
      // Check for duplicate username
      const usernamesDoc = await getDoc(doc(db, "usernames", "names"));
      if (usernamesDoc.exists()) {
        const usernames = usernamesDoc.data().usernames;
        if (usernames.includes(editedUsername) && editedUsername !== name) {
          setErrorMessage(t("usernameError8"));
          return;
        }
      }

      setIsSaving(true);
      try {
        // Update the username in the users collection
        await updateDoc(doc(db, "users", user), {
          name: editedUsername
        });

        // Update the usernames collection
        if (usernamesDoc.exists()) {
          const usernames = usernamesDoc.data().usernames;
          if (name) {
            // Remove old username if it exists
            const index = usernames.indexOf(name);
            if (index > -1) {
              usernames.splice(index, 1);
            }
          }
          // Add new username
          usernames.push(editedUsername);
          await updateDoc(doc(db, "usernames", "names"), {
            usernames: usernames
          });
        } else {
          // Create usernames collection if it doesn't exist
          await setDoc(doc(db, "usernames", "names"), {
            usernames: [editedUsername]
          });
        }
        const leaderboardRef = doc(db, "leaderboard", "rankings");
        const leaderboardDoc = await getDoc(leaderboardRef);

        if (leaderboardDoc.exists()) {
          const leaderboardData = leaderboardDoc.data();
          const updatedRankings = leaderboardData.ranking.map(entry => {
            if (entry.email === user) {
              console.log(entry)
              return { ...entry, name: editedUsername };
            }
            return entry;
          });

          await updateDoc(leaderboardRef, { ranking: updatedRankings });
        }

        setName(editedUsername);
        setIsEditingUsername(false);
        setErrorMessage('');
      } catch (error) {
        console.error('Error updating username:', error);
        setErrorMessage('Error updating username. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Enter edit mode and set initial value to current username
      setIsEditingUsername(true);
      setEditedUsername(name || '');
      setErrorMessage('');
    }
  };
  const validateUsername = (value) => {
    if (value.trim() === '') return t("usernameError1");
    if (value === name) return t("usernameError2");
    if (value.includes(' ')) return t("usernameError3");
    if (value !== value.toLowerCase()) return t("usernameError4");
    const specialChars = "!\"#$%&'()*+,-/:;<=>?@[]^_`{|}~";
    if (value.split('').some(char => specialChars.includes(char))) return t("usernameError5");
    if (value.length < 4 || value.length > 18) return t("usernameError6");
  
    const explicitWords = [
      "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cock", "pussy", "cunt", "twat",
      "damn", "hell", "crap", "prick", "slut", "whore", "sex", "sexy", "porn", "porno",
      "pornhub", "xxx", "dildo", "anal", "oral", "nude", "boob", "boobs", "tits", "vagina",
      "penis", "cum", "ejaculate", "jerkoff", "blowjob", "handjob", "threesome", "fingering",
      "rimjob", "milf", "bdsm", "fetish", "pegging", "squirting", "stripper", "stripclub",
      "masturbate", "masturbation", "retard", "fag", "faggot", "dyke", "tranny", "coon",
      "chink", "gook", "nigga", "nigger", "kike", "spic", "wetback", "towelhead", "kill",
      "murder", "rape", "shoot", "bomb", "terrorist", "suicide", "die", "hang", "slit",
      "stab", "abuse", "abuser", "weed", "marijuana", "cocaine", "meth", "heroin", "lsd",
      "ecstasy", "crack", "adderall", "xanax", "opioid", "ketamine", "shrooms", "stoner",
      "druggie", "dope", "highaf", "420", "casino", "betting", "bet", "poker", "slots",
      "lotto", "jackpot", "crypto", "scam", "fraud", "hustler", "onlyfans", "fuk", "fck",
      "sht", "bi7ch", "b1tch", "ass", "a55", "c0ck", "d1ck", "pu55y", "cumslut", "s3x",
      "p0rn", "n00d", "l0ser", "phuck"
    ];
    const containsExplicitWord = explicitWords.some(word => value.toLowerCase().includes(word));
    if (containsExplicitWord) return t("usernameError7");
  
    return ''; // no error
  };
  

  const handleLanguageSave = async () => {
    if (!user) return;
    
    setIsSavingLanguage(true);
    try {
      // Update language in Firestore
      await updateDoc(doc(db, "users", user), {
        language: selectedLanguage
      });
      
      // Update i18n language
      i18n.changeLanguage(selectedLanguage);
      // Update localStorage
      localStorage.setItem('language', selectedLanguage);
      
      setShowLanguageDropdown(false);
    } catch (error) {
      console.error('Error saving language:', error);
    } finally {
      setIsSavingLanguage(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingUsername(false);
    setEditedUsername(name || '');
    setErrorMessage('');
  };

  if (loading) {
    return null; // Show nothing while loading
  }

  if (!user) {
    return null; // Show nothing if no user
  }

  if(isMobile){
  return (
    <>
    {!showPlans && !showSettings && user? (
    <div style={{ position: "relative", bottom:0, height:'90dvh'}}>
    {/* Circle */}
    <button
              style={{
                display:'flex',
                position:'absolute',
                bottom:'93dvh',
                right:'0%',
                color: "white",
                background: "#837E7D",
                // background: `#6A6CFF`,
                borderRadius: "20px",
                fontSize: "12px",
                border: "none",
                cursor: "pointer",
                marginRight: '5%', // 5% margin from the right
                // width:'17%',
                height:'5%',
                justifyContent:'center',
                alignItems:'center'
              }}
              onClick={() => setShowSettings(true)}
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.7em"
                height="1.7em"
                style={{display:'flex', marginRight:'8%', alignItems:'flex-start'}}
              >
                <path
                  fill="currentColor"
                  d="M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6"
                ></path>
              </svg>

              <p style={{minWidth: "fit-content"}}>
              {t("settings")}
              </p>
            </button>
    <div
      style={{
        position: "absolute",
        bottom:'82%',
        background: profileImage
          ? `url(${profileImage}) center/cover`
          : "#6A6CFF", // Show Firebase image if available, otherwise use default color
        left: "20%",
        transform: "translateX(-50%)", // Center it horizontally
        width: "95px", // Adjust as needed
        height: "95px",
        backgroundColor: "#6A6CFF", // Change color if needed
        borderRadius: "50%",
        boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
        border: "5px solid white", 
        justifyContent:'center',
        alignItems:'center',
        zIndex: 9999,
      }}
      onClick={() => setShowPopup(true)}
    >
       {(!profileImage || profileImage===null || profileImage==='null') && (
        <p style={{ fontSize: "60px", color: "white", marginLeft: '32%', marginTop:'6%' }}>+</p>
      )}
    </div>
    {showPopup && (
       <div
       style={{
         position: "absolute",
         bottom: '76px',
         left: "50%",
         transform: "translateX(-50%)",
         width: "93%",
         height: "55%",
         background: "#383837",
         padding: "20px",
         borderRadius: "20px 20px 0 0",
         zIndex:99999,
         borderTop: "2px solid white",
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
       }}
     >
      <span
      style={{
        position: "absolute",
        top: "5px",
        right: "20px",
        color: "white",
        fontSize: "40px",
        cursor: "pointer",
      }}
      onClick={() => setShowPopup(false)} // Close the popup when clicked
    >
      ×
    </span>
       {!imageSrc ? (
         <div
           style={{
             width: "50%",
             height: "50%",
             border: "2px dashed white",
             borderRadius: "10px",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
             flexDirection: "column",
             cursor: "pointer",
             textAlign: "center",
           }}
           onDragOver={(e) => e.preventDefault()} // Allow dropping
            onDrop={handleImageUpload} // Handle dropped file
         >
           <input
             type="file"
             accept="image/*"
             onChange={handleImageUpload}
             id="upload-input"
             style={{
              position: "absolute", // Position input over the div

              width: "50%",
              height: "50%",
              opacity: 0, // Make input invisible but still clickable
              cursor: "pointer",
            }}
           />
           <label htmlFor="upload-input" style={{ color: "white", fontWeight: "bold", cursor: "pointer", width:'90%' }}>
             {t("clickOrDragAndDrop")}
           </label>
         </div>
       ) : (
         <div style={{ textAlign: "center" }}>
           <img
             src={imageSrc}
             alt="Uploaded"
             style={{
               width: "50dvw",
               height: "50dvw",
              
               borderRadius: "10px",
               border: "2px solid white",
             }}
           />
           <div style={{ marginTop: "20px", display: "flex", gap: "20px", justifyContent: "center" }}>
             <button
               onClick={handleConfirm}
               style={{
                 padding: "10px 20px",
                 background: "black",
                 color: "white",
                 borderRadius: "10px",
                 border: "none",
                 cursor: "pointer",
                 boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.3)", // Soft shadow
               }}
             >
               {t("confirm")}
             </button>
             <button
               onClick={handleRetake}
               style={{
                 padding: "10px 20px",
                 background: "#d4543f",
                 color: "white",
                 borderRadius: "10px",
                 border: "none",
                 cursor: "pointer",
                 boxShadow: "2px 4px 10px rgba(255, 0, 0, 0.3)", // Soft shadow

               }}
             >
               {t("retake")}
             </button>
           </div>
         </div>
       )}
     </div>
    )}

    {/* Scrollable images */}
    {/* <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)", // 3 images per row
        gap: "15px",
        justifyItems: "center",
        alignItems: "center",
        overflowY: "auto", // Enable scrolling for the images
        maxHeight: "calc(100% - 50px)", // Adjust to allow space for the title
      }}
    >
      {Object.entries(profilePictures).map(([alias, path]) => (
        <img
          key={alias}
          src={path}
          alt={alias}
          onClick={() => handleSelectPicture(alias)}
          style={{
            width: "30dvw", // Bigger images
            height: "30dvw",
            borderRadius: "15px",
            cursor: "pointer",
            border: selectedAlias === alias ? "3px solid white" : "none",
          }}
        />
      ))}
    </div> */}




  
    {/* Main Container */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: "#202020",
        borderRadius: "40px 40px 0 0",
        height: "77%",
        width:'100dvw',
        paddingTop: "20px", // Adjust for spacing
        bottom:'10%',
        position:'absolute'
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems:'center',
          justifyContent:'center',
          width: "100%",
          flexDirection: mobileDimension && "row",
        }}
      >
        <div
          style={{
            flexDirection: "column",
            width: "100%",
            alignItems:'center',
            justifyContent:'center',


          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginLeft:'8%',
              width:'92%',
              position:'absolute',
              bottom:'84%',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <label style={{ display:'flex',color: "white", fontWeight: "bold", fontSize: "22px", width: '60%', flexDirection:'row'}}>
              {name || `@Cookr${generateUniqueNumber(user)}`}
              {!loading && planType && planType.toLowerCase() !== 'free' && (
                <div style={{
                  backgroundColor: 'transparent',
                  backgroundColor: '#e1af32',
                  color: 'black',
                  padding: '0px 14px',
                  borderRadius: '15px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '10px'
                }}>
                  Pro
                </div>
              )}
            </label>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginLeft: '8%',
              position:'absolute',
              bottom:'79%'
            }}
          >
            <label style={{ color: "white" }}>
            <span
              style={{
                display: "inline-block",
                borderRadius:'5px',
                color: "white", // Hide text when covered
                padding: "0 2px", // Adjust padding if needed
              }}
            >
              {/* {user.charAt(0).toUpperCase() + user.slice(1)} */}
              {t("memberSince") + " " + joinDate}
            </span>
          </label>
            {/* <button
              onClick={toggleEmailVisibility}
              style={{ background: "transparent", border: "none", marginLeft: "5px", fontSize:'20px', marginTop:'1%'}}
            >
              {!isEmailVisible ? 

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="1em"
              fill='white'
              height="1em"
            >
              <path
                fill="white"
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3"
              ></path>
            </svg>

        :
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
            >
              <path
                fill="none"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3.933 13.909A4.36 4.36 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.07 5.07 0 0 1 21 12c0 1-3 6-9 6q-.471 0-.918-.04M5 19L19 5m-4 7a3 3 0 1 1-6 0a3 3 0 0 1 6 0"
              ></path>
            </svg>

          } {/* Replace with icons as needed */}
            {/* </button> */}
            {/* {isEmailVisible && (
              <span style={{ color: "white", marginLeft: "10px" }}>{user}</span>
            )} */}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop:'8%', gap:'5%' }}>
            {/* Streak Container */}
            <div style={{ 
              display: "flex", 
              flexDirection: "row", 
              alignItems: "center", 
              padding: "10px", 
              borderRadius: "10px", 
              backgroundColor: "#363636",
              position:'absolute',
              bottom:'54%', 
              marginRight:'47%',
              // justifyContent:'center',
              width: "37.5%",
              height:'10dvh'
            }}>
              <span style={{ fontSize: "35px", fontWeight: "bold", color:'white', marginLeft:'5%', marginRight:'17%'}}>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="1.3em"
                    height="1.3em"
                  >
                    <path
                      fill="#FF8F1F"
                      d="M266.91 500.44c-168.738 0-213.822-175.898-193.443-291.147c.887-5.016 7.462-6.461 10.327-2.249c8.872 13.04 16.767 31.875 29.848 30.24c19.661-2.458 33.282-175.946 149.807-224.761c3.698-1.549 7.567 1.39 7.161 5.378c-5.762 56.533 28.181 137.468 88.316 137.468c34.472 0 58.058-27.512 69.844-55.142c3.58-8.393 15.843-7.335 17.896 1.556c21.031 91.082 77.25 398.657-179.756 398.657"
                    ></path>
                    <path
                      fill="#FFB636"
                      d="M207.756 330.827c3.968-3.334 9.992-1.046 10.893 4.058c2.108 11.943 9.04 32.468 31.778 32.468c27.352 0 45.914-75.264 50.782-97.399c.801-3.642 4.35-6.115 8.004-5.372c68.355 13.898 101.59 235.858-48.703 235.858c-109.412 0-84.625-142.839-52.754-169.613M394.537 90.454c2.409-18.842-31.987 32.693-31.987 32.693s26.223 12.386 31.987-32.693M47.963 371.456c.725-8.021-9.594-29.497-11.421-20.994c-4.373 20.344 10.696 29.016 11.421 20.994"
                    ></path>
                    <path
                      fill="#FFD469"
                      d="M323.176 348.596c-2.563-10.69-11.755 14.14-10.6 24.254c1.155 10.113 16.731 1.322 10.6-24.254"
                    ></path>
                  </svg>

              </span>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'35%'}}>
              <span style={{ fontSize: "40px", fontWeight: "bold", color: 'white' }}>
                {streak || 0}
              </span>              
              <span style={{ fontSize: 'clamp(10px, 3vw, 16px)', color:'white', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', lineHeight: 1.1 }}>{t("streak")}</span>              </div>
            </div>

            {/* XP Container */}
            <div style={{ 
              display: "flex", 
              flexDirection: "row", 
              alignItems: "center", 
              padding: "10px", 
              borderRadius: "10px", 
              backgroundColor: "#363636", 
              width: "37.5%",
              position:'absolute',
              bottom:'54%',
              marginLeft:'47%',
              height:'10dvh'
            }}>
                <span style={{ fontSize: "35px", fontWeight: "bold", color:'blue', marginLeft:'5%' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    width="1.4em"
                    height="1.4em"
                  >
                    <path
                      fill="#2F88FF"
                      stroke="#000"
                      strokeLinejoin="round"
                      strokeWidth="4"
                      d="M19 4H37L26 18H41L17 44L22 25H8L19 4Z"
                    ></path>
                  </svg>

              </span>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'65%'}}>
              <span style={{ 
                fontSize: "clamp(20px, 7.7vw, 40px)", 
                fontWeight: "bold", 
                color: 'white',
                transition: 'font-size 0.3s ease',
                maxWidth: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {formatXP(userXP)}
              </span>  
              <span style={{ fontSize: "16px", color:'white'}}>XP</span>
              </div>
            </div>
          </div>
          <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              marginTop:'5%',
              padding: "10px", 
              borderRadius: "10px", 
              backgroundColor: "#363636", 
              width: "84%",
              marginLeft:'6%',
              position:'absolute',
              bottom:'30%',
              // justifyContent:'center',
              // marginRight:'12%',
              height:'16%'
            }}>
              <span style={{ fontSize: "19px", fontWeight: "bold", color:'white', marginTop:'5px'}}>{t("recentActivity")}</span>
              <span style={{ fontSize: "20px", color:'white', marginTop:'5%', textAlign: "center"}}>  {
                (() => {
                  const activity = JSON.parse(localStorage.getItem("currentSet") || "{}")?.title || t("noSetsYet");
                  const maxLength = 60;
                  return activity.length > maxLength ? activity.slice(0, maxLength).trim() + "..." : activity;
                })()
              }
              </span>
            </div>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              marginTop:'5%',
              padding: "10px", 
              borderRadius: "10px", 
              backgroundColor: "#363636", 
              width: "84%",
              marginLeft:'6%',
              position:'absolute',
              bottom:'7%',
              height:'16%',
            }}>
              <span style={{ fontSize: "18px", fontWeight: "bold", color:'#e1af32', marginTop:'1%'}}>{t("upgradeToPro")}</span>
              <div style={{
                backgroundColor: "#e1af32",
                width:'90%',
                marginTop:'3%',
                height:'55%',
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "0.3s ease-in-out",
                justifyContent:'center',
                alignItems:'center',
              }}>
                
              <button
                style={{
                  backgroundColor: "#e1af32",
                  width:'100%',
                  height:'90%',
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "0.3s ease-in-out",
                  justifyContent:'center',
                  alignItems:'center',
                }}
                onClick={() => setShowPlans(true)}
                onMouseOver={(e) => (e.target.style.opacity = 1)}
                onMouseOut={(e) => (e.target.style.opacity = 1)}
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 14 14"
                width="30px"
                height="30px"
                style={{marginTop:'2%'}}
              >
                <g
                  fill="none"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.64 1.54H3.36a1.07 1.07 0 0 0-.85.46L.69 4.52a1.05 1.05 0 0 0 .06 1.29l5.46 6.29a1 1 0 0 0 1.58 0l5.46-6.29a1.05 1.05 0 0 0 .06-1.29L11.49 2a1.07 1.07 0 0 0-.85-.46Z"></path>
                  <path d="M6.48 1.53L4.04 5.31L7 12.46m.55-10.93l2.43 3.78L7 12.46M.52 5.31h12.96"></path>
                </g>
              </svg>
              </button>
              </div>
            </div>

          {/* <button
            style={{
              marginTop: "5px",
              color: "white",
              background: `#6A6CFF`,
              boxShadow: `0px 5px 0px 0px #484AC3`,
              padding: "5px 15px",
              borderRadius: "10px",
              fontSize: "15px",
              textAlign: "center",
              border: "none",
              cursor: "pointer",
            }}
            onClick={async () => logout()}
          >
            Log Out!
          </button> */}
        </div>
      </div>
    </div>
  </div>
    ): (
      showPlans ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100dvw",
            height: isMobile? "calc(100vh - 50px)": "100dvh",
            backgroundColor: "#202020",
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "center" : "initial",
            overflowY: "auto",
          }}
        >
          <Plans planType={planType} />
    
          {/* Close Button */}
          <button
            onClick={() => setShowPlans(false)}
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              background: "none",
              border: "none",
              fontSize: "30px",
              color: "white",
              cursor: "pointer",
            }}
          >
            ╳
          </button>
        </div>
      ) : (
        <div

          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100dvw",
            height: "100vh",
            backgroundColor: "black",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",  // Align content from top to bottom
            color: "white",
          }}
        >
          {/* Back button */}
          <div
            style={{
              position: "absolute",
              left: "4%",
              marginTop: "4%",
              cursor: "pointer",
              fontSize: "30px",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => setShowSettings(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="1em"
              height="1em"
              style={{ color: "white" }}
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="48"
                d="M328 112L184 256l144 144"
              ></path>
            </svg>
          </div>
          {/* Language Selector */}
            <div
              style={{
                position: "absolute",
                right: "4%",
                marginTop: "4%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#232323",
                padding: "6px 12px",
                borderRadius: "8px",
              }}
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.2em"
                height="1.2em"
                fill="white"
              >
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                {selectedLanguage.toUpperCase()}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                fill="white"
                style={{ transform: showLanguageDropdown ? 'rotate(180deg)' : 'none' }}
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
          </div>

            {/* Language Dropdown */}
            {showLanguageDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "12%",
                  right: "4%",
                  backgroundColor: "#232323",
                  borderRadius: "8px",
                  padding: "8px 0",
                  minWidth: "150px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  zIndex: 1001
                }}
              >
                {[
                  { code: 'en', name: 'English' },
                  { code: 'es', name: 'Español' },
                  { code: 'fr', name: 'Français' },
                  { code: 'de', name: 'Deutsch' },
                  { code: 'it', name: 'Italiano' },
                  { code: 'pt', name: 'Português' },
                  { code: 'ru', name: 'Русский' },
                  { code: 'zh-Hans', name: '中文' },
                  { code: 'ja', name: '日本語' },
                  { code: 'ko', name: '한국어' }
                ].map((lang) => (
                  <div
                    key={lang.code}
              style={{
                      padding: "8px 16px",
                      cursor: "pointer",
                      backgroundColor: selectedLanguage === lang.code ? "#363636" : "transparent",
                display: "flex",
                alignItems: "center",
                      gap: "8px"
                    }}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <span style={{ fontSize: "14px" }}>{lang.name}</span>
                    {selectedLanguage === lang.code && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="1em"
                        height="1em"
                        fill="rgba(0, 255, 0, 0.76)"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                ))}
                <div
                style={{
                    borderTop: "1px solid #363636",
                    marginTop: "8px",
                    padding: "8px 16px"
                  }}
                >
                  <button
                    onClick={handleLanguageSave}
                    disabled={isSavingLanguage}
                    style={{
                      width: "100%",
                      padding: "8px",
                      backgroundColor: "#363636",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    {isSavingLanguage ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="1em"
                          height="1em"
                          fill="white"
                          style={{ animation: "spin 1s linear infinite" }}
                        >
                          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3l4-4-4-4v3z"/>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="1em"
                          height="1em"
                          fill="white"
                        >
                          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                        </svg>
                        Save
                      </>
                    )}
                  </button>
            </div>
              </div>
            )}


          {/* Title */}
          <h3 style={{ fontWeight: "bold", marginTop: "4%" }}>{t("settings")}</h3>  {/* Title centered */}

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height:'0.3px',
              backgroundColor: "gray",
              marginTop: "20px", // Space between the title and the divider
            }}
          />

          {/* Username Section */}
          <div
            style={{
              backgroundColor: "#232323",
              borderRadius: "15px",
              width: "90%",
              height: isEditingUsername ? "15%" : "10%",
              display: "flex",
              flexDirection: "column",
              color: "white",
              marginTop:'10%'
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px" }}>
              {isEditingUsername ? (
                <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: "3%" }}>
                  <h7 style={{ fontWeight: "bold", marginLeft: "1%",marginBottom:'2%'}}>{t('editUsername')}</h7>
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <input
  type="text"
  value={editedUsername}
  onChange={(e) => {
    const val = e.target.value;
    setEditedUsername(val);
    const err = validateUsername(val);
    setErrorMessage(err);
  }}
  style={{
    flex: 1,
    padding: "8px",
    marginLeft: "2%",
    borderRadius: "5px",
    border: errorMessage
      ? "2px solid #ff4444"
      : editedUsername !== "" && !validateUsername(editedUsername)
      ? "2px solid #00cc66"
      : "1px solid #ccc",
    marginRight: "10px",
    backgroundColor: "#333",
    color: "white",
    outline: "none"
  }}
/>

                    <button
                      onClick={handleUsernameEdit}
                      disabled={isSaving}
                      style={{
                        background: "rgba(0, 255, 0, 0.2)",
                        border: "none",
                        cursor: "pointer",
                        marginRight: "10px",
                        borderRadius: "5px",
                        padding: "5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight:'10px',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="rgba(0, 255, 0, 0.76)"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        background: "rgba(255, 0, 0, 0.2)",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "5px",
                        padding: "5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight:'5px',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="red"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                  {errorMessage && (
                    <p style={{ 
                      color: "red", 
                      fontSize: "12px", 
                      marginLeft: "2%", // Match the input's marginLeft
                      marginTop: "5px",
                      marginBottom: "0px"
                    }}>
                      {errorMessage}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <h4 style={{ fontWeight: "bold", marginLeft: "4%", marginTop: "3%" }}>
                    {name || `@Cookr${generateUniqueNumber(user)}`}
            </h4>
                  <button
                    onClick={handleUsernameEdit}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "auto",
                      marginRight: "2%",
                      marginTop:'1%'
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="white"
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {!isEditingUsername && (
              <p style={{ fontSize: "12px", marginLeft: "5%", marginTop: "0%" }}>
              {user}
            </p>
            )}
          </div>
          <div
            style={{
              marginTop:'10%',
              backgroundColor: "#232323", // Gray background
              borderRadius: "15px", // Rounded corners
              width: "90%", // Adjust width as needed
              height: "25%", // Adjust height to make it taller
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              color: "white",
            }}
          >

            {/* Divider and Sections */}
              {/* Section 1 */}
              <div style={{ display:'flex', height:'33.33%', alignItems:'center', justifyContent:'center' }}>
              <div style={{ padding: "10px", display: "flex", alignItems: "center",  width:'100%', cursor: 'pointer'}} onClick={handleShare}>
                {/* Icon */}
                <div style={{ display: "flex", alignItems: "center", width:'90%', }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="1.5em"
                      height="1.5em"
                      style={{marginRight:'7%', marginLeft:'2%'}}
                    >
                      <path
                        fill="currentColor"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="4"
                        d="m26 4l18 18l-18 17V28C12 28 6 43 6 43c0-17 5-28 20-28z"
                      ></path>
                    </svg>
                  {/* Title */}
                  <p style={{ color: "white", fontWeight: "bold",width:'80%' }}>{t("shareWithAFriend")}</p>
                </div>

                {/* Arrow */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  width="1.5em"
                  height="1.5em"
                  style={{ color: "white", marginRight: "2%", alignItems: "flex-end", marginLeft: "auto" }}
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="48"
                    d="m184 112l144 144l-144 144"
                  ></path>
                </svg>
              </div>
              </div>
              {/* Divider */}
              <div style={{ borderBottom: "1px solid black", margin: "0px 0", width:'100%' }}></div>

              {/* Section 2 */}
              <div style={{ display:'flex', height:'33.33%', alignItems:'center', justifyContent:'center' }}>
              <div style={{ padding: "10px", display: "flex", alignItems: "center",  width:'100%', cursor: 'pointer' }} onClick={handleContact}>
                {/* Icon */}
                <div style={{ display: "flex", alignItems: "center", width:'90%', }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="1.5em"
                    height="1.5em"
                    style={{marginRight:'7%', marginLeft:'2%'}}

                  >
                    <path
                      fill="currentColor"
                      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
                    ></path>
                  </svg>


                  {/* Title */}
                  <p style={{ color: "white", fontWeight: "bold",width:'80%' }}>{t("contactTheTeam")}</p>
                </div>

                {/* Arrow */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  width="1.5em"
                  height="1.5em"
                  style={{ color: "white", marginRight: "2%", alignItems: "flex-end", marginLeft: "auto" }}
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="48"
                    d="m184 112l144 144l-144 144"
                  ></path>
                </svg>
              </div>
              </div>
              {/* Divider */}
              <div style={{ borderBottom: "1px solid black", margin: "0px 0" }}></div>

              {/* Section 3 */}
              <div style={{ display:'flex', height:'33.33%', alignItems:'center', justifyContent:'center' }}>
              <div style={{ padding: "10px", display: "flex", alignItems: "center",  width:'100%', cursor: 'pointer' }} onClick={handleTerms}>
                {/* Icon */}
                <div style={{ display: "flex", alignItems: "center", width: '90%' }}>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      width="1.5em"
                      height="1.5em"
                      style={{marginRight:'7%', marginLeft:'2%'}}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeWidth="32"
                        d="M416 221.25V416a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V96a48 48 0 0 1 48-48h98.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62Z"
                      ></path>
                      <path

                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="32"
                        d="M256 56v120a32 32 0 0 0 32 32h120m-232 80h160m-160 80h160"
                      ></path>
                    </svg>




                  {/* Title */}
                  <p style={{ color: "white", fontWeight: "bold",width:'80%' }}>{t("termsAndConditions")}</p>
                </div>

                {/* Arrow */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  width="1.5em"
                  height="1.5em"
                  style={{ color: "white", marginRight: "2%", alignItems: "flex-end", marginLeft: "auto" }}
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="48"
                    d="m184 112l144 144l-144 144"
                  ></path>
                </svg>
              </div>
              </div>
          </div>
          <div
            style={{
              backgroundColor: "#232323", // Gray background
              borderRadius: "15px", // Rounded corners
              width: "90%", // Adjust width as needed
              height: "12%", // Adjust height as needed
              display: "flex",
              flexDirection: "column",
              // justifyContent: "space-between",
              color: "white",
              marginTop:'10%'
            }}
          >
            {/* Title */}
            {/* <h4 style={{ display:'flex', fontWeight: "bold", marginLeft:'4%', marginTop:'3%', alignItems:'center'}}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                width="1.3em"
                height="1.3em"
                style={{marginRight:'3%',}}
              >
                <path
                  fill="currentColor"
                  d="M5.016 16c-1.066-2.219-.498-3.49.321-4.688c.897-1.312 1.129-2.61 1.129-2.61s.706.917.423 2.352c1.246-1.387 1.482-3.598 1.293-4.445c2.817 1.969 4.021 6.232 2.399 9.392c8.631-4.883 2.147-12.19 1.018-13.013c.376.823.448 2.216-.313 2.893C9.999 1.002 6.818.002 6.818.002c.376 2.516-1.364 5.268-3.042 7.324c-.059-1.003-.122-1.696-.649-2.656c-.118 1.823-1.511 3.309-1.889 5.135c-.511 2.473.383 4.284 3.777 6.197z"
                ></path>
              </svg>
              Account Details
            </h4> */}
            <button
              style={{
                marginTop: "5%",
                color: "black",
                background: `#F05858`,
                // boxShadow: `0px 5px 0px 0pxrgb(230, 38, 38)`,
                padding: "5px 15px",
                borderRadius: "10px",
                fontSize: "20px",
                textAlign: "center",
                border: "none",
                cursor: "pointer",
                width:'80%',
                marginLeft:'10%',
                height:'50%',
                fontWeight: "bold",

              }}
              onClick={async () => logout()}
            >
              {t("logOut")}
            </button>

            {/* Spacer */}
            {/* <div style={{ flexGrow: 1 }}></div> Pushes email to the bottom */}

            {/* Email */}
            
          </div>
          {popupType === "share" && (
            <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "black",
              border: "1px solid white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "70%",
              height:'30%',

            }}
          >
            {/* Close Button */}
            <div
              onClick={handleClosePopup}
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                color: "white",
                cursor: "pointer",
              }}
            >X</div>
            
            <p style={{ color: "white", marginBottom: "10px", marginTop:'20%' }}>Share this link:</p>
      
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#111",
                borderRadius: "20px",
                padding: "5px",
                border: "1px solid white",
              }}
            >
              <input
                type="text"
                value={link}
                readOnly
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  color: "white",
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                  padding: "5px",
                }}


              />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="1em"
                  height="1em"
                  onClick={handleCopy}
                  style={{display:'flex', marginRight:'5%'}}
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </g>
                </svg>

              </div>
                {copied && (
                  <div
                    style={{
                      marginTop: "10px",
                      color: "#455DBF",
                      fontWeight: "bold",
                    }}
                  >
                    Copied!
                  </div>
                )}
              </div>
            )}
        </div>     
      )
    )}  
  </>  
  );
} else {
  return(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          overflowY: 'auto',
          width: '100%',
          height: '100%',
          padding: '0%',
          top: 0,
          left: '10%'
        }}
      >
        {/* Settings Button */}
        <button
          style={{
            position: 'absolute',
            top: '2%',
            right: '2%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            backgroundColor: '#373737',
            borderRadius: '100px',
            padding: '5px',
          }}
          onClick={() => setShowSettings(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="1.7em"
            height="1.7em"
          >
            <path
              fill="currentColor"
              d="M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6"
            ></path>
          </svg>
        </button>

        {/* Settings Popup */}
        {showSettings && (
        <div
          style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100dvw",
              height: "100vh",
              backgroundColor: "black",
            display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              color: "white",
              zIndex: 1000
            }}
          >
            {/* Back button */}
          <div
            style={{
                position: "absolute",
                left: "4%",
                marginTop: "4%",
                cursor: "pointer",
                fontSize: "30px",
              display: "flex",
                alignItems: "center",
                justifyContent:'center',
              }}
              onClick={() => setShowSettings(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="1em"
                height="1em"
                style={{ color: "white" }}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="48"
                  d="M328 112L184 256l144 144"
                ></path>
              </svg>
          </div>

            {/* Language Selector */}
            <div
              style={{
                position: "absolute",
                right: "4%",
                marginTop: "4%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#232323",
                padding: "6px 12px",
                borderRadius: "8px",
              }}
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.2em"
                height="1.2em"
                fill="white"
              >
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                {selectedLanguage.toUpperCase()}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                fill="white"
                style={{ transform: showLanguageDropdown ? 'rotate(180deg)' : 'none' }}
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>

            {/* Language Dropdown */}
            {showLanguageDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "12%",
                  right: "4%",
                  backgroundColor: "#232323",
                  borderRadius: "8px",
                  padding: "8px 0",
                  minWidth: "150px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  zIndex: 1001
                }}
              >
                {[
                  { code: 'en', name: 'English' },
                  { code: 'es', name: 'Español' },
                  { code: 'fr', name: 'Français' },
                  { code: 'de', name: 'Deutsch' },
                  { code: 'it', name: 'Italiano' },
                  { code: 'pt', name: 'Português' },
                  { code: 'ru', name: 'Русский' },
                  { code: 'zh-Hans', name: '中文' },
                  { code: 'ja', name: '日本語' },
                  { code: 'ko', name: '한국어' }
                ].map((lang) => (
                  <div
                    key={lang.code}
              style={{
                      padding: "8px 16px",
                      cursor: "pointer",
                      backgroundColor: selectedLanguage === lang.code ? "#363636" : "transparent",
                display: "flex",
                alignItems: "center",
                      gap: "8px"
                    }}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <span style={{ fontSize: "14px" }}>{lang.name}</span>
                    {selectedLanguage === lang.code && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="1em"
                        height="1em"
                        fill="rgba(0, 255, 0, 0.76)"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                ))}
                <div
                style={{
                    borderTop: "1px solid #363636",
                    marginTop: "8px",
                    padding: "8px 16px"
                  }}
                >
                  <button
                    onClick={handleLanguageSave}
                    disabled={isSavingLanguage}
                    style={{
                      width: "100%",
                      padding: "8px",
                      backgroundColor: "#363636",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    {isSavingLanguage ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="1em"
                          height="1em"
                          fill="white"
                          style={{ animation: "spin 1s linear infinite" }}
                        >
                          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3l4-4-4-4v3z"/>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="1em"
                          height="1em"
                          fill="white"
                        >
                          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                        </svg>
                        Save
                      </>
                    )}
                  </button>
            </div>
              </div>
            )}

            {/* Title */}
            <h3 style={{ fontWeight: "bold", marginTop: "4%" }}>{t("settings")}</h3>
              
            {/* Divider */}
            <div
              style={{
                width: "100%",
                height:'0.3px',
                backgroundColor: "gray",
                marginTop: "20px",
              }}
            />

            {/* Username Section */}
            <div
              style={{
                backgroundColor: "#232323",
                borderRadius: "15px",
                width: "90%",
                height: isEditingUsername ? "15%" : "10%",
                display: "flex",
                flexDirection: "column",
                color: "white",
                marginTop:'4%'
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px", height:'50%' }}>
                {isEditingUsername ? (
                  <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: "3%" }}>
                    <h7 style={{ fontWeight: "bold", marginLeft: "1%", marginBottom:'2%', marginTop:'2%'}}>{t('editUsername')}</h7>
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <input
  type="text"
  value={editedUsername}
  onChange={(e) => {
    const val = e.target.value;
    setEditedUsername(val);
    const err = validateUsername(val);
    setErrorMessage(err);
  }}
  style={{
    flex: 1,
    padding: "8px",
    marginLeft: "2%",
    borderRadius: "5px",
    border: errorMessage
      ? "2px solid #ff4444"
      : editedUsername !== "" && !validateUsername(editedUsername)
      ? "2px solid #00cc66"
      : "1px solid #ccc",
    marginRight: "10px",
    backgroundColor: "#333",
    color: "white",
    outline: "none"
  }}
/>

                      <button
                        onClick={handleUsernameEdit}
                        disabled={isSaving}
                        style={{
                          background: "rgba(0, 255, 0, 0.2)",
                          border: "none",
                          cursor: "pointer",
                          marginRight: "10px",
                          borderRadius: "5px",
                          padding: "5px",
                          display: "flex",
                alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="rgba(0, 255, 0, 0.76)"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                style={{
                          background: "rgba(255, 0, 0, 0.2)",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "5px",
                  padding: "5px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="red"
                        >
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    </div>
                    {errorMessage && (
                      <p style={{ 
                        color: "red", 
                        fontSize: "12px", 
                        marginLeft: "2%", // Match the input's marginLeft
                        marginTop: "5px",
                        marginBottom: "0px"
                      }}>
                        {errorMessage}
                      </p>
                    )}
            </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", width: "100%", height:'10%' }}>
                    <h4 style={{ fontWeight: "bold", marginLeft: "4%", marginTop: "0%" }}>
                      {name || `@Cookr${generateUniqueNumber(user)}`}
                    </h4>
            <button
                      onClick={handleUsernameEdit}
              style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginLeft: "auto",
                        marginRight: "2%",
                        marginTop:'1%'
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="white"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {!isEditingUsername && (
                <p style={{ fontSize: "12px", marginLeft: "4%", marginTop: "0%" }}>
                  {user}
                </p>
              )}
            </div>

            {/* Share Section */}
            <div
              style={{
                marginTop:'5%',
                backgroundColor: "#232323",
                borderRadius: "15px",
                width: "90%",
                height: "25%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                color: "white",
              }}
            >
              {/* Section 1 */}
              <div style={{ display:'flex', height:'33.33%', alignItems:'center', justifyContent:'center' }}>
                <div style={{ padding: "10px", display: "flex", alignItems: "center", width:'100%', cursor: 'pointer'}} onClick={handleShare}>
                  <div style={{ display: "flex", alignItems: "center", width:'90%', }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="1.5em"
                      height="1.5em"
                      style={{marginRight:'7%', marginLeft:'2%'}}
                    >
                      <path
                        fill="currentColor"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="4"
                        d="m26 4l18 18l-18 17V28C12 28 6 43 6 43c0-17 5-28 20-28z"
                      ></path>
                    </svg>
                    <p style={{ color: "white", fontWeight: "bold",width:'80%' }}>{t("shareWithAFriend")}</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="1.5em"
                    height="1.5em"
                    style={{ color: "white", marginRight: "2%", alignItems: "flex-end", marginLeft: "auto" }}
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="48"
                      d="m184 112l144 144l-144 144"
                    ></path>
                  </svg>
                </div>
              </div>
              <div style={{ borderBottom: "1px solid black", margin: "0px 0", width:'100%' }}></div>

              {/* Section 2 */}
              <div style={{ display:'flex', height:'33.33%', alignItems:'center', justifyContent:'center' }}>
                <div style={{ padding: "10px", display: "flex", alignItems: "center", width:'100%', cursor: 'pointer' }} onClick={handleContact}>
                  <div style={{ display: "flex", alignItems: "center", width:'90%', }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="1.5em"
                      height="1.5em"
                      style={{marginRight:'7%', marginLeft:'2%'}}
                    >
                      <path
                        fill="currentColor"
                        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
                      ></path>
                    </svg>
                    <p style={{ color: "white", fontWeight: "bold",width:'80%' }}>{t("contactTheTeam")}</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="1.5em"
                    height="1.5em"
                    style={{ color: "white", marginRight: "2%", alignItems: "flex-end", marginLeft: "auto" }}
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="48"
                      d="m184 112l144 144l-144 144"
                    ></path>
                  </svg>
                </div>
              </div>
              {/* Divider */}
              <div style={{ borderBottom: "1px solid black", margin: "0px 0" }}></div>

              {/* Section 3 */}
              <div style={{ display:'flex', height:'33.33%', alignItems:'center', justifyContent:'center' }}>
                <div style={{ padding: "10px", display: "flex", alignItems: "center", width:'100%', cursor: 'pointer' }} onClick={handleTerms}>
                  <div style={{ display: "flex", alignItems: "center", width: '90%' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      width="1.5em"
                      height="1.5em"
                      style={{marginRight:'7%', marginLeft:'2%'}}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeWidth="32"
                        d="M416 221.25V416a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V96a48 48 0 0 1 48-48h98.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62Z"
                      ></path>
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="32"
                        d="M256 56v120a32 32 0 0 0 32 32h120m-232 80h160m-160 80h160"
                      ></path>
                    </svg>
                    <p style={{ color: "white", fontWeight: "bold",width:'80%' }}>{t("termsAndConditions")}</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="1.5em"
                    height="1.5em"
                    style={{ color: "white", marginRight: "2%", alignItems: "flex-end", marginLeft: "auto" }}
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="48"
                      d="m184 112l144 144l-144 144"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div
              style={{
                backgroundColor: "#232323",
                borderRadius: "15px",
                width: "90%",
                height: "12%",
                display: "flex",
                flexDirection: "column",
                color: "white",
                marginTop:'5%'
              }}
            >
              <button
                style={{
                  marginTop: "3%",
                  color: "black",
                  background: `#F05858`,
                  padding: "5px 1px",
                borderRadius: "10px",
                  fontSize: "20px",
                textAlign: "center",
                border: "none",
                cursor: "pointer",
                  width:'80%',
                  marginLeft:'10%',
                  height:'50%',
                fontWeight: "bold",
              }}
              onClick={async () => logout()}
            >
                {t("logOut")}
            </button>
          </div>
        </div>
        )}

        {/* Original Profile Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "96%",
            marginBottom: "3%",
            marginTop: "3%",
            gap: "3%",
          }}
        >
          {/* Profile Picture */}
          <div
            style={{
              width: "15%",
              aspectRatio: "1/1",
              background: profileImage
                ? `url(${profileImage}) center/cover`
                : "#6A6CFF",
              borderRadius: "50%",
              border: "5px solid white",
              boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
              cursor: "pointer"
            }}
            onClick={() => setShowPopup(true)}
          >
            {(!profileImage || profileImage===null || profileImage==='null') && (
              <p style={{ fontSize: "60px", color: "white", textAlign: "center", marginTop: "25%" }}>+</p>
            )}
          </div>

          {showPopup && !isMobile && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: "220px", // Width of the sidebar (adjust if needed)
                width: "calc(100vw - 220px)", // Full width minus sidebar width
                height: "100vh",
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 99999
              }}
            >
              <div
                style={{
                  background: "#232323",
                  borderRadius: "20px",
                  padding: "32px",
                  width: "450px", // Increased width
                  height: "450px", // Increased height
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center", // Center content vertically
                  position: "relative"
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "18px",
                    color: "white",
                    fontSize: "32px",
                    cursor: "pointer",
                    zIndex: 100000
                  }}
                  onClick={() => setShowPopup(false)}
                >
                  ×
                </span>
                {!imageSrc ? (
                  <div
                    style={{
                      width: "300px", // Increased size
                      height: "300px", // Increased size
                      border: "2px dashed white",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      cursor: "pointer",
                      textAlign: "center",
                      margin: "0 auto" // Center horizontally
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleImageUpload}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="upload-input-desktop"
                      style={{
                        position: "absolute",
                        width: "300px", // Match parent
                        height: "300px", // Match parent
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                    <label 
                      htmlFor="upload-input-desktop" 
                      style={{ 
                        color: "white", 
                        fontWeight: "bold", 
                        cursor: "pointer", 
                        width: '80%',
                        textAlign: "center", // Center text
                        fontSize: "18px" // Larger text
                      }}
                    >
                      {t("clickOrDragAndDrop")}
                    </label>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%"
                  }}>
                    <img
                      src={imageSrc}
                      alt="Uploaded"
                      style={{
                        width: "300px", // Increased size
                        height: "300px", // Increased size
                        borderRadius: "10px",
                        border: "2px solid white",
                        objectFit: "cover" // Maintain aspect ratio
                      }}
                    />
                    <div style={{ 
                      marginTop: "30px", 
                      display: "flex", 
                      gap: "30px", 
                      justifyContent: "center" 
                    }}>
                      <button
                        onClick={handleConfirm}
                        style={{
                          padding: "12px 30px", // Larger button
                          background: "black",
                          color: "white",
                          borderRadius: "10px",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.3)",
                          fontSize: "16px" // Larger text
                        }}
                      >
                        {t("confirm")}
                      </button>
                      <button
                        onClick={handleRetake}
                        style={{
                          padding: "12px 30px", // Larger button
                          background: "#d4543f",
                          color: "white",
                          borderRadius: "10px",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "2px 4px 10px rgba(255, 0, 0, 0.3)",
                          fontSize: "16px" // Larger text
                        }}
                      >
                        {t("retake")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Info */}
          <div style={{ width: "35%" }}>
            <h1 style={{ color: "white", fontSize: "2vw", marginBottom: "2%", fontSize:'22px'}}>
              {name || `@Cookr${generateUniqueNumber(user)}`}
              {!loading && planType && planType.toLowerCase() !== 'free' && (
                <span style={{
                  backgroundColor: '#e1af32',
                  color: 'black',
                  padding: '5px 16px',
                  borderRadius: '15px',
                  fontSize: '0.8vw',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  marginLeft: '3%',
                  fontSize:'12px'
                }}>
                  Pro
                </span>
              )}
            </h1>
            <p style={{ color: "white", fontSize: "1vw", fontSize:'13px' }}>
              {t("memberSince") + " " + joinDate}
            </p>
          </div>
        </div>

        {/* Stats Container */}
        <div style={{ 
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "90%",
          marginBottom: "3%",
          gap: "2%",
        }}>
          {/* Streak Container */}
          <div style={{ 
            display: "flex", 
            flexDirection: "row", 
            alignItems: "center", 
            padding: "2%", 
            borderRadius: "10px", 
            backgroundColor: "#363636",
            width: "45%",
            height: "8vh"
          }}>
            <span style={{ fontSize: "2vw", color: '#FF8F1F', marginRight: "5%" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="2.5em"
                height="2.5em"
              >
                <path
                  fill="#FF8F1F"
                  d="M266.91 500.44c-168.738 0-213.822-175.898-193.443-291.147c.887-5.016 7.462-6.461 10.327-2.249c8.872 13.04 16.767 31.875 29.848 30.24c19.661-2.458 33.282-175.946 149.807-224.761c3.698-1.549 7.567 1.39 7.161 5.378c-5.762 56.533 28.181 137.468 88.316 137.468c34.472 0 58.058-27.512 69.844-55.142c3.58-8.393 15.843-7.335 17.896 1.556c21.031 91.082 77.25 398.657-179.756 398.657"
                ></path>
              </svg>
            </span>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'100%'}}>
              <span style={{ fontSize: "35px", fontWeight: "bold", color: 'white' }}>
                {streak || 0}
              </span>              
              <span style={{ fontSize: "14px", color:'white'}}>{t('streak')}</span>
            </div>
          </div>

          {/* XP Container */}
          <div style={{ 
            display: "flex", 
            flexDirection: "row", 
            alignItems: "center", 
            padding: "2%", 
            borderRadius: "10px", 
            backgroundColor: "#363636", 
            width: "45%",
            height: "8vh"
          }}>
            <span style={{ fontSize: "2vw", color: '#2F88FF', marginRight: "5%" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="2.5em"
                height="2.5em"
              >
                <path
                  fill="#2F88FF"
                  stroke="#000"
                  strokeLinejoin="round"
                  strokeWidth="4"
                  d="M19 4H37L26 18H41L17 44L22 25H8L19 4Z"
                ></path>
              </svg>
            </span>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'100%'}}>
              <span style={{ fontSize: "2vw", fontWeight: "bold", color: 'white', fontSize:'35px'}}>
                {formatXP(userXP)}
              </span>  
              <span style={{ fontSize: "14px", color:'white'}}>XP</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          paddingTop: "3%",
          paddingBottom: "3%",
          borderRadius: "10px", 
          backgroundColor: "#363636", 
          width: "90%",
          marginBottom: "3%"
        }}>
          <span style={{ fontSize: "1.2vw", fontWeight: "bold", color:'white', marginBottom: "2%", fontSize:'18px'}}>{t("recentActivity")}</span>
          <span style={{ fontSize: "1vw", color:'white', fontSize:'18px'}}>
            {JSON.parse(localStorage.getItem("currentSet") || "{}")?.title || t("noSetsYet")}
          </span>
        </div>

        {/* Plans Section */}
        <div style={{ 
          display: "flex",
          flexDirection: "column",
          alignItems: "center", 
          borderRadius: "10px",
          width: "96%",
          marginBottom: "3%"
        }}>
        <Plans planType={planType} />
        </div>
      </div>
  )
}
};

export default MyProfile;

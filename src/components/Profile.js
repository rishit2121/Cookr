import React, { useState, useEffect, useRef} from "react";
import NewPrompt from "./NewPrompt";
import { getDoc, onSnapshot, doc, updateDoc } from "firebase/firestore";
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
import { initializeApp } from "firebase/app";
import { uploadBytes, getDownloadURL,getStorage, ref, deleteObject } from "firebase/storage";



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
  const [showPlans, setShowPlans] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [name, setName] = useState();
  const [planType, setPlanType] = useState();
  const [referalCode, setReferalCode] = useState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState("rishit.agrawal121@gmail.com");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userXP, setUserXP] = useState(0);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAlias, setSelectedAlias] = useState(null);
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
    // Load from localStorage on component mount
    return localStorage.getItem("profileImage") || null;
  });
  const [joinDate, setJoinDate] = useState(() => {
    // Load from localStorage on component mount
    return localStorage.getItem("joinDate") || '';
  });

  const [popupType, setPopupType] = useState(null);
  const link = "https://www.cookr.co/";

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);

    // Hide the notification after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };
  const handleShare = () => {
    setPopupType("share");
  };

  const handleContact = () => {
    window.location.href = "mailto:scrollercontact@gmail.com";
  };

  const handleTerms = () => {
    window.open("https://cookrapp.co/privacy_policy", "_blank");
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
        localStorage.clear();
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
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser.email);
      const userName = currentUser.displayName ? currentUser.displayName : null; // Set null if no name
      const rawJoinDate = currentUser.metadata.creationTime;
      const formattedJoinDate = formatJoinDate(rawJoinDate);

      setName(userName); // Store name or null
      setJoinDate(formattedJoinDate);
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  useEffect(() => {
    try {
      const document = onSnapshot(
        doc(db, "users", user),
        (doc) => {
          if(name===null || name==='null'){
          setName(doc.data().name);
          }
          setPlanType(doc.data().plan);
          setReferalCode(doc.data().myCode)
          const profilePicture = doc.data().profilePicture;
          setSelectedAlias(profilePicture ? profilePicture : '');
        }
      );
    } catch (error) {
      alert("Error");
    }
  }, [user]);
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
          localStorage.setItem("profileImage", null);
          setProfileImage(null)
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

    if(!profileImage || profileImage===null || profileImage==='null'){
      fetchProfileImage();
    }

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

              <p style={{}}>
              Settings
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
              cursor: "pointer", // Make the cursor indicate clickability
            }}
           />
           <label htmlFor="upload-input" style={{ color: "white", fontWeight: "bold", cursor: "pointer", width:'90%' }}>
             Click or Drag & Drop to Upload
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
              //  objectFit: "cover",
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
               Confirm
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
               Retake
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
              bottom:'84%'
            }}
          >
            <label style={{ color: "white", fontWeight: "bold", fontSize: "22px", width: '60%' }}>
              {name || `@Cookr${generateUniqueNumber(user)}`}
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
              Member since {joinDate}
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
                {localStorage.getItem("streak") || 0}
              </span>              
              <span style={{ fontSize: "16px", color:'white'}}>Streak</span>
              </div>
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
              // justifyContent:'center',
              // marginRight:'12%',
              height:'10dvh'
            }}>
                <span style={{ fontSize: "35px", fontWeight: "bold", color:'blue', marginLeft:'5%', }}>
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
                fontSize: userXP > 9999 ? "32px" : "40px", 
                fontWeight: "bold", 
                color: 'white',
                transition: 'font-size 0.3s ease'
              }}>
                {userXP}
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
              <span style={{ fontSize: "19px", fontWeight: "bold", color:'white', marginTop:'5px'}}>Recent Activity</span>
              <span style={{ fontSize: "20px", color:'white', marginTop:'5%'}}>  {JSON.parse(localStorage.getItem("currentSet") || "{}")?.title || "No Sets Yet :("}
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
              // justifyContent:'center',
              // marginRight:'12%',
              height:'16%',
            }}>
              <span style={{ fontSize: "18px", fontWeight: "bold", color:'#cfa208', marginTop:'1%'}}>Upgrade to Pro</span>
              <div style={{
                backgroundColor: "#cfa208",
                width:'90%',
                marginTop:'3%',
                height:'55%',
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "10px", // Rounded rectangle effect
                cursor: "pointer",
                transition: "0.3s ease-in-out",
                justifyContent:'center',
                alignItems:'center',
              }}>
                
              <button
                style={{
                  backgroundColor: "#dde023",
                  width:'100%',
                  height:'90%',
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "10px", // Rounded rectangle effect
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
              left: "5%",
              top: "1.4%",  // Adjust top position if needed
              cursor: "pointer",
              fontSize: "30px",
            }}
            onClick={() => setShowSettings(false)}
          >
            <i className="fas fa-chevron-left" style={{ fontSize: "20px", color: "white", marginRight:'2%', alignItems:'flex-end', marginLeft:'auto' }}></i>
          </div>

          {/* Title */}
          <h3 style={{ fontWeight: "bold", marginTop: "4%" }}>Settings</h3>  {/* Title centered */}

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height:'0.3px',
              backgroundColor: "gray",
              marginTop: "20px", // Space between the title and the divider
            }}
          />

          {/* Alternative content when showPlans is false */}
          <div
            style={{
              backgroundColor: "#232323", // Gray background
              borderRadius: "15px", // Rounded corners
              width: "90%", // Adjust width as needed
              height: "10%", // Adjust height as needed
              display: "flex",
              flexDirection: "column",
              // justifyContent: "space-between",
              color: "white",
              marginTop:'10%'
            }}
          >
            {/* Title */}
            <h4 style={{ fontWeight: "bold", marginLeft:'4%', marginTop:'3%'}}>
               {`@${name}` || `@Cookr${generateUniqueNumber(user)}`}
            </h4>

            {/* Spacer */}
            {/* <div style={{ flexGrow: 1 }}></div> Pushes email to the bottom */}

            {/* Email */}
            <p style={{ fontSize: "12px", marginLeft: "5%", marginTop:'2.5%'  }}>
              {user}
            </p>
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
              <div style={{ padding: "10px", display: "flex", alignItems: "center",  width:'100%' }}>
                {/* Icon */}
                <div style={{ display: "flex", alignItems: "center", width:'90%' }}>
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
                  <p style={{ color: "white", fontWeight: "bold",width:'80%' }}>Share With a Friend</p>
                </div>

                {/* Arrow */}
                <i className="fas fa-chevron-right" onClick={handleShare} style={{ fontSize: "20px", color: "white", marginRight:'2%', alignItems:'flex-end', marginLeft:'auto' }}></i>
              </div>
              </div>
              {/* Divider */}
              <div style={{ borderBottom: "1px solid black", margin: "0px 0", width:'100%' }}></div>

              {/* Section 2 */}
              <div style={{ display:'flex', height:'33.33%', alignItems:'center', justifyContent:'center' }}>
              <div style={{ padding: "10px", display: "flex", alignItems: "center",  width:'100%' }}>
                {/* Icon */}
                <div style={{ display: "flex", alignItems: "center", width:'90%' }}>
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
                  <p style={{ color: "white", fontWeight: "bold",width:'80%' }}>Contact The Team</p>
                </div>

                {/* Arrow */}
                <i className="fas fa-chevron-right"  onClick={handleContact} style={{ fontSize: "20px", color: "white", marginRight:'2%', alignItems:'flex-end', marginLeft:'auto' }}></i>
              </div>
              </div>
              {/* Divider */}
              <div style={{ borderBottom: "1px solid black", margin: "0px 0" }}></div>

              {/* Section 3 */}
              <div style={{ display:'flex', height:'33.33%', alignItems:'center', justifyContent:'center' }}>
              <div style={{ padding: "10px", display: "flex", alignItems: "center",  width:'100%' }}>
                {/* Icon */}
                <div style={{ display: "flex", alignItems: "center", width:'90%' }}>

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
                  <p style={{ color: "white", fontWeight: "bold",width:'80%' }}>Terms and Conditions</p>
                </div>

                {/* Arrow */}
                <i className="fas fa-chevron-right" onClick={handleTerms} style={{ fontSize: "20px", color: "white", marginRight:'2%', alignItems:'flex-end', marginLeft:'auto' }}></i>
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
              Log Out
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
}else{
  return(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          overflowY:'auto',
        }}
      >
        <h1 style={{ margin: "40px 20px", color: "white"}}>My Profile</h1>
        <div
          style={{
            margin: "0px 10px",
            display: "flex",
            width: "60%",
            flexDirection: mobileDimension && "row",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "Center",
              justifyContent: "center",
              width: "1px",
              height: "100px",
              background: "whitesmoke",
              borderRadius: "100px",
              boxShadow: "0px 0px 4px 2px black",
              fontSize: "150px",
              fontWeight: "bold",
              color: "white"
            }}
          >
          </div>
          <div
            style={{ marginLeft: "10px", flexDirection: "column", width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <label style={{color: "white"}}>Name: </label>
              <p
                style={{
                  fontWeight: "bold",
                  padding: "5px",
                  borderRadius: "10px",
                  color: "white"
                }}
              >
                {name && name}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <label style={{color: "white"}}>Email: </label>
              <p
                style={{
                  fontWeight: "bold",
                  padding: "5px",
                  borderRadius: "10px",
                  color: "white"
                }}
              >
                {user && user}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <label style={{color: "white"}}>Referal Code: </label>
              <p
                style={{
                  fontWeight: "bold",
                  padding: "5px",
                  borderRadius: "10px",
                  color: "white"
                }}
              >
                {referalCode && referalCode}
              </p>
            </div>
            <button
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
                fontWeight: "bold",
              }}
              onClick={async () => logout()}
            >
              Log Out!
            </button>
          </div>
        </div>
        <h1 style={{ margin: "40px 20px", color: "white"}}>Plans</h1>
        <Plans planType={planType} />
      </div>
  )
}
};

export default MyProfile;

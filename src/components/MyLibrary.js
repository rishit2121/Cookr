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
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const DeleteConfirmationPopup = ({ onClose, onConfirm }) => {
  const { t } = useTranslation();
  
  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 999999999
      }} onClick={onClose} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#28282B',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
        zIndex: 999999999,
        width: '80%',
        maxWidth: '400px',
        border: '1px solid #353935'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: 0, color: 'white' }}>{t("deleteSet")}</h3>
          <svg
            onClick={onClose}
            style={{
              cursor: 'pointer'
            }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <p style={{ color: 'white', marginBottom: '20px' }}>
          {t("deleteSetConfirmation")}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '5px',
              border: 'none',
              background: '#555',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              borderRadius: '5px',
              border: 'none',
              background: '#a90000',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {t("yesDelete")}
          </button>
        </div>
      </div>
    </>
  );
};

const MyLibrary = ({ mobileDimension }) => {
  const { t } = useTranslation();
  const [sets, setSets] = useState([]);
  const [openMode, setOpenMode] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [openNewTopic, setOpenNewTopic] = useState(false);
  const [style, setStyle] = useState(0); // Manage the style with useState
  const [params, setParams] = useState([]); // Manage the params with useState
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  const navigate = useNavigate();
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
  // Updated generateBlob function with dynamic width and height
  const deleteItemFromFirestore = async (subtitle, subcontent, subsubject, subpromptmode, subselectedmode, subcolor, subtag) => {
    console.log("deleteItemFromFirestore called with:", { subtitle, subcontent });
    try {
      const userEmail = user;
      const docRef = doc(db, "users", userEmail);
      const featuredDocRef = doc(db, "sets", "featured");

      // Fetch the current data from Firestore
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error("Document not found");
        return;
      }

      // Get the current sets array
      let currentSets = docSnap.data().sets || [];

      const setToDelete = currentSets.find(
        (item) =>
            item.title === subtitle &&
          item.content === subcontent
      );

      if (!setToDelete) {
        console.log("Set not found in user's sets");
        return;
      }

      console.log("Found set to delete:", setToDelete);
      console.log("Is set public?", setToDelete.isPublic);

      // If the set is public, remove it from featured sets
      if (setToDelete && setToDelete.isPublic) {
        console.log("Attempting to remove from featured sets");
        const featuredSnap = await getDoc(featuredDocRef);
        if (featuredSnap.exists()) {
          const featuredSets = featuredSnap.data().sets || [];
          
          const matchingFeaturedSet = featuredSets.find(
            set => set.title === subtitle && 
                  set.content === subcontent && 
                  set.author === userEmail
          );

          if (matchingFeaturedSet) {
            console.log("Found matching featured set:", matchingFeaturedSet);
            await updateDoc(featuredDocRef, {
              sets: arrayRemove(matchingFeaturedSet)
            });
            console.log("Removed from featured sets");
          }
        }
      }

      // Remove from user's sets
      const updatedSets = currentSets.filter(
        (item) => !(item.title === subtitle && item.content === subcontent)
      );

      await updateDoc(docRef, { sets: updatedSets });
      setSets(updatedSets);

      // Clear from localStorage if it's the current set
      const currentSet = JSON.parse(localStorage.getItem("currentSet"));
      if (currentSet && currentSet.title === subtitle) {
        localStorage.removeItem("currentSet");
      }

      console.log("Delete operation completed successfully");

    } catch (error) {
      console.error("Error in deleteItemFromFirestore:", error);
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

          } else {
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

  const handleLetMeCook = (item) => {
    setSelectedItem(item);
    setOpenMode(true);
  };

  const handleEdit = () => {
    if (!selectedItem) return;
    setOpenNewTopic(true);
  };

  const handleDelete = () => {
    console.log("Delete button clicked");
    if (!selectedItem) {
      console.log("No item selected");
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    console.log("Confirming delete for selected item:", selectedItem);
    deleteItemFromFirestore(
      selectedItem.title, 
      selectedItem.content, 
      selectedItem.subject, 
      selectedItem.promptMode, 
      selectedItem.scrollGenerationMode, 
      selectedItem.color, 
      selectedItem.tag
    );
    setShowDeleteConfirmation(false);
  };

  return (
    user ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: mobileDimension ? "center" : "flex-start",
        overflowX: "hidden",
        height: mobileDimension? '88%': '100%',
        position: "relative",
      }}
    >
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "black",
        width: "100%",
        paddingBottom: "10px",
        paddingTop: mobileDimension ? "30px" : "0"
      }}>
        <button
          onClick={() => navigate("/featured")}
          style={{
            background: "linear-gradient(90deg, #1a1a1a, #333333, #1a1a1a)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "8px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            position: "fixed",
            right: "10px",
            top: "20px",
            zIndex: 2,
            fontSize: "14px"
          }}
        >
          {t("collections")}
          {/*<svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg> */}
        </button>
        
        <div style={{ 
          display: "flex",
          justifyContent: mobileDimension ? "center" : "space-between", 
          alignItems: "center",
          padding: "20px 50px 10px",
          position: "relative"
        }}>
          <h1 style={{ margin: 0, color: "white" }}>{t("myLibrary")}</h1>
        </div>
        <div style={{ 
          textAlign: mobileDimension ? "center" : "left",
          color: (!hasSubscription && sets.length >= 10) ? "#ff4444" : "white", 
          marginBottom: "10px",
          fontSize: "14px",
          opacity: 0.8,
          marginLeft: mobileDimension ? "0" : "50px",
          marginRight: mobileDimension ? "0" : "50px"
        }}>
          {hasSubscription ? (
            `${sets.length} sets added. No limit for Cookr Pro.`
          ) : (
            sets.length > 10 ? (
              <div>
                {sets.length} {t("outOf10Sets")}{" "}
                <span 
                  onClick={() => navigate("/profile")}
                  style={{ 
                    textDecoration: "underline",
                    cursor: "pointer",
                    color: "#ff4444"
                  }}
                >
                  {t("switchBackToPro")}
                </span>
              </div>
            ) : sets.length === 10 ? (
              <div>
                {sets.length} {t("outOf10Sets")}{" "}
                <span 
                  onClick={() => navigate("/profile")}
                  style={{ 
                    textDecoration: "underline",
                    cursor: "pointer",
                    color: "#ff4444"
                  }}
                >
                  {t("upgradeToPro")}
                </span>
              </div>
            ) : (
              `${sets.length} ${t("outOf10OnFree")}`
            )
          )}
        </div>
      </div>
    
      <div style={{
        overflowY: "auto",
        flex: 1,
        width: "100%"
      }}>
        <div
          style={{
            margin: "0px 50px",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: mobileDimension ? "center" : "flex-start",
            alignItems: mobileDimension ? "center" : "flex-start",
          }}
        >
          <div
            className="libCard"
            style={{
            position: "fixed",
            bottom: mobileDimension ? "90px" : "30px",
            right: mobileDimension ? "3%" : "30px",
            width: mobileDimension ?"75px": "85px",
            height: mobileDimension ?"75px": "85px",
            borderRadius: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            cursor: (!hasSubscription && sets.length >= 10) ? "not-allowed" : "pointer",
            color: (!hasSubscription && sets.length >= 10) ? "#666666" : "white",
              border: "1px solid #353935",
            background: "radial-gradient(circle at center,rgb(20, 18, 18), #1a1a1d)",
            boxShadow: "0 0px 12px rgb(155, 155, 155)",
            borderColor: "#8a8a8a",
            zIndex: 1000,
            opacity: (!hasSubscription && sets.length >= 10) ? 0.5 : 1,
          }}
          onClick={() => (!hasSubscription && sets.length >= 10) ? null : handleNewClick()}
          >
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        {sets &&
          sets.map((item, index) => (
            <div>
              <div
                className="libCard"
                key={index}
                style={{
                  borderRadius: "10px",
                  display: "flex",
                  margin: "10px 10px",
                  border:"1px solid #353935",
                  backgroundColor: "#28282B",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative", 
                }}
              >
                <p
                  style={{
                    color: "whitesmoke",
                    padding: "10px 10px",
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "24px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                  }}
                >
                  { mobileDimension ? item.title :  item.title.slice(0, 12)}
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
                        item.author
                      ]);
                      setOpenNewTopic(!openNewTopic);
                    }}
                    style={{
                      fontSize: "14px",
                      fontWeight: "normal",
                      cursor: "pointer",
                    }}
                  >
                    {t('edit')}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginLeft: "5px" }}
                      viewBox="0 0 512 512"
                      fill={"white"}
                      height={10}
                    >
                      <path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" />
                    </svg>
                  </span>
                </p>

                <button
                  style={{
                    margin: "10px 10px",
                    color: "white",
                    background: `#6A6CFF`,
                    boxShadow: `0px 5px 0px 0px #484AC3`,
                    padding: "10px 10px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    textAlign: "center",
                    border: "none",
                    cursor: "pointer",
                    fontSize:'15px'
                  }}
                  onClick={() => handleLetMeCook(item)}
                >
                  Let me cook
                </button>
              </div>
            </div>
          ))}
        </div>
        
      </div>
      
      {openMode && (
        <div
          style={{
            position: "fixed",
            backgroundColor: "#181818",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            zIndex: "999999999",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            overflow: "auto",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "30px 50px",
            position: "relative"
          }}>
            <svg
              onClick={() => setOpenMode(false)}
              style={{
                cursor: "pointer",
                position: "absolute",
                left: "20px"
              }}
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            <p
              style={{
                textAlign: "center",
                color: "white",
                fontSize: "30px",
                margin: "0 auto"
              }}
            >
              {t("selectMode")}
            </p>
          </div>
          <hr style={{
            width: "100%",
            border: "1px solid #555",
            margin: "0"
          }} />
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            gap: "1dvh",
            padding: "0%",
            justifyContent: "flex-start",
            alignItems: "center",
            flex: 1,
            marginTop: "5%"
          }}>
            <button
              style={{
                color: "white",
                background: `#0194a3`,
                boxShadow: `0px 2px 0px 5px #00b3d1`,
                padding: "20px",
                borderRadius: "10px",
                fontSize: "23px",
                textAlign: "center",
                border: "none",
                cursor: "pointer",
                width: "90%",
                height: "20dvh",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
              onClick={() => {
                if (!selectedItem) return;
                localStorage.setItem("currentSet", JSON.stringify(selectedItem));
                localStorage.removeItem("lastSet");
                localStorage.removeItem("lastFlashSet");
                localStorage.setItem("mode", 1);
                navigate("/");
              }}
            >
              <span style={{ fontWeight: "bold" }}>{t("multipleChoice")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18dvw"
                height="18dvh"
              >
                <path
                  fill="currentColor"
                  d="M3 12a3.5 3.5 0 0 1 3.5-3.5c1.204 0 2.02.434 2.7 1.113c.726.727 1.285 1.72 1.926 2.873l.034.06c.6 1.082 1.283 2.311 2.227 3.255c1.008 1.008 2.316 1.699 4.113 1.699a5.5 5.5 0 1 0-4.158-9.1a24 24 0 0 1 1.122 1.857A3.5 3.5 0 1 1 17.5 15.5c-1.203 0-2.02-.434-2.7-1.113c-.726-.727-1.285-1.72-1.926-2.873l-.034-.06c-.6-1.082-1.283-2.311-2.227-3.255C9.605 7.191 8.297 6.5 6.5 6.5a5.5 5.5 0 1 0 4.158 9.1a24 24 0 0 1-1.122-1.857A3.5 3.5 0 0 1 3 12"
                ></path>
              </svg>
            </button>
            <button
              style={{
                color: "white",
                background: `#6700d9`,
                boxShadow: `0px 2px 0px 5px #7729cf`,
                padding: "20px",
                borderRadius: "10px",
                fontSize: "23px",
                textAlign: "center",
                border: "none",
                cursor: "pointer",
                width: "90%",
                marginTop:'4dvh',
                height: "20dvh",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
              onClick={() => {
                if (!selectedItem) return;
                localStorage.setItem("currentSet", JSON.stringify(selectedItem));
                localStorage.removeItem("lastSet");
                localStorage.removeItem("lastFlashSet");
                localStorage.setItem("mode", 2);
                navigate("/");
              }}
            >
              <span style={{ fontWeight: "bold" }}>{t("flashcards")}</span>


              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 14 14"
                width="15dvw"
                height="15dvh"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="8" height="6" x="5.5" y="1.5" rx="1"></rect>
                  <path d="M11 10H4a1 1 0 0 1-1-1V4"></path>
                  <path d="M9 12.5H1.5a1 1 0 0 1-1-1V6"></path>
                </g>
              </svg>

            </button>
            <button
              style={{
                color: "white",
                background: `rgb(169, 0, 0)`,
                boxShadow: `0px 2px 0px 5px rgb(255, 8, 8)`,
                padding: "20px",
                borderRadius: "10px",
                fontSize: "23px",
                textAlign: "center",
                border: "none",
                cursor: hasSubscription ? "pointer" : "not-allowed",
                width: "90%",
                marginTop:'4dvh',
                height: "20dvh",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: hasSubscription ? 1 : 0.5,
                position: "relative"
              }}
              onClick={() => {
                if (!selectedItem || !hasSubscription) return;
                localStorage.setItem("currentSet", JSON.stringify(selectedItem));
                localStorage.removeItem("lastSet");
                localStorage.removeItem("lastFlashSet");
                localStorage.setItem("mode", 2);
                navigate("/");
              }}
            >
              <span style={{ fontWeight: "bold" }}>{t("freeResponse")}</span>
              {!hasSubscription && (
                <div style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "gold",
                  fontSize: "14px"
                }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  {t("proOnly")}
                </div>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 14 14"
                width="15dvw"
                height="15dvh"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="8" height="6" x="5.5" y="1.5" rx="1"></rect>
                  <path d="M11 10H4a1 1 0 0 1-1-1V4"></path>
                  <path d="M9 12.5H1.5a1 1 0 0 1-1-1V6"></path>
                </g>
              </svg>
            </button>
          </div>
        </div>
      )}
      {openNewTopic && (
        <NewPrompt
          setOpenNewTopic={setOpenNewTopic}
          style={style}
          params={params}
          mobileDimension={mobileDimension}
        />
      )}
      {showDeleteConfirmation && (
        <DeleteConfirmationPopup 
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={confirmDelete}
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

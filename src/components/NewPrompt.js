import React, { useEffect, useState } from "react";
import { db } from "./firebase/Firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
} from "firebase/firestore";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import PDFJSWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import { YoutubeTranscript } from 'youtube-transcript';
import { auth, signInWithGoogle, logOut } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker;

var randomColor = require("randomcolor"); // import the script

const DeleteConfirmationPopup = ({ onClose, onConfirm }) => {
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
          <h3 style={{ margin: 0, color: 'white' }}>Delete Set</h3>
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
          Are you sure you want to delete this set?
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
            Cancel
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
            Yes, Delete
          </button>
        </div>
      </div>
    </>
  );
};

function NewPrompt({ mobileDimension, setOpenNewTopic, style, params, type=1}) {
  const [promptMode, setPromptMode] = useState(1);
  const [
    subcolor,
    subcontent,
    subpromptmode,
    subsubject,
    subtag,
    subtitle,
    subselectedmode,
    subauthor
  ] = params;
  const [selectedMode, setSelectedMode] = useState(subselectedmode);
  const [title, setTitle] = useState(style === 1 ? subtitle : "");
  const [content, setContent] = useState(style === 1 ? subcontent : "");
  const [subject, setSubject] = useState(style === 1 ? subsubject : "");
  const [tag, setTage] = useState("fa-solid fa-calculator");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('rishit.agrawal121@gmail.com');
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [subjectError, setSubjectError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Define canEdit based on author
  const canEdit = !subauthor || subauthor === user;

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

  useEffect(() => {
    // Set isOpening to false after the initial animation
    const timer = setTimeout(() => {
      setIsOpening(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  function extractVideoId(url) {
    // Regex to match YouTube URLs
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
  
  function isYouTubeUrl(url) {
    // Check if the URL contains 'youtube.com' or 'youtu.be'
    return /youtube\.com|youtu\.be/.test(url);
  }
  const fetchTranscriptUsingAPI = async (videoUrl) => {
    if (!isYouTubeUrl(videoUrl)) {
      handleLink(videoUrl)
      return;
    }
    
    const videoId = extractVideoId(videoUrl);
    const apiKey = 'AIzaSyAX8pq_aqGJIOe36SGciWVu9_0Z9ra1PrE'; // Replace with your actual API key
    const url = `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}`;
  
    try {
      // Fetch captions data
      const response = await fetch(url);
      const data = await response.json();
  
      // Check if captions are available
      if (data.items && data.items.length > 0) {
        const captionId = data.items[0].id;  // Get the first available caption ID
  
        // Now fetch the actual caption text (subtitles) using the caption ID
        const captionUrl = `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`;
        const captionResponse = await fetch(captionUrl);
        const captionData = await captionResponse.text();
  
  
        // You can now set the transcript to your state or handle it
        setContent(captionData);
      } else {
        console.error('No captions available for this video.');
      }
    } catch (err) {
      console.error('Error fetching captions:', err);
    }
  };



  const handleLink = async (link) => {
    try {
      const response = await fetch(link);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
    // Extract all <p> tags
    const pTags = doc.querySelectorAll('p');

    // Convert NodeList to an array and extract the text content or outer HTML
    const pTextContents = Array.from(pTags).map(p => p.textContent); // for text content
    // or


      const textContent = doc.body.innerText || ''; // Extracts text content from the page body
      setContent(pTextContents);
    } catch (error) {

      console.error('Error fetching text from the website:', error);
      alert('Failed to fetch text from the provided link.');
    }
  };
  function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        // Handle PDF file
        const fileUrl = URL.createObjectURL(file);
        setPdfUrl(fileUrl);
        extractTextFromPdf(file);
      } else if (file.type.startsWith("image/")) {
        // Handle image file
        const fileUrl = URL.createObjectURL(file);
        setImageUrl(fileUrl);
        extractTextFromImage(file);
      } else {
        alert("Please upload a valid PDF or image file.");
      }
    }
  }
  function extractTextFromImage(file) {
    Tesseract.recognize(
      file,
      "eng", // Language
      {
        // logger: (info) => console.log(info), // Optional: for logging progress
      }
    )
      .then(({ data: { text } }) => {
        setContent(text);
      })
      .catch((error) => {
        console.error("Error recognizing text from image:", error);
      });
  }
  function extractTextFromPdf(file) {
    const fileReader = new FileReader();

    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);

      try {
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const numPages = pdf.numPages;
        let fullText = "";

        // Function to extract text from each page
        const extractTextFromPage = async (pageNum) => {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";

          if (pageNum < numPages) {
            extractTextFromPage(pageNum + 1);
          } else {
            setContent(fullText);
          }
        };

        extractTextFromPage(1);
      } catch (error) {
        console.error("Error loading PDF document:", error);
      }
    };

    fileReader.readAsArrayBuffer(file);
  }

  const removeItemFromLocalStorage = (itemToDelete) => {
    // Retrieve the current set from localStorage
    const currentSet = JSON.parse(localStorage.getItem("currentSet"));

    // Check if the current set matches the item to delete
    if (
      currentSet.title === itemToDelete.title &&
      currentSet.content === itemToDelete.content &&
      currentSet.subject === itemToDelete.subject &&
      currentSet.promptMode === itemToDelete.promptMode &&
      currentSet.scrollGenerationMode == itemToDelete.scrollGenerationMode &&
      // currentSet.color === itemToDelete.color &&
      currentSet.tag === itemToDelete.tag
    ) {
      // Remove the item by setting it to null or an empty object/string
      localStorage.removeItem("currentSet");
    } else {
    }
  };

  const deleteItemFromFirestore = async () => {
    try {
      const userEmail = user;
      const docRef = doc(db, "users", userEmail);
      const featuredDocRef = doc(db, "sets", "featured");

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      let currentSets = docSnap.data().sets || [];

      // Find the set to delete to check if it was public
      const setToDelete = currentSets.find(
        item =>
          item.title === subtitle &&
          item.content === subcontent
      );

      // If the set was public, remove it from featured sets
      if (setToDelete?.isPublic) {
        const featuredSnap = await getDoc(featuredDocRef);
        if (featuredSnap.exists()) {
          const featuredSets = featuredSnap.data().sets || [];
          const matchingFeaturedSet = featuredSets.find(
            set => 
              set.title === subtitle && 
              set.content === subcontent && 
              set.author === userEmail
          );

          if (matchingFeaturedSet) {
            await updateDoc(featuredDocRef, {
              sets: arrayRemove(matchingFeaturedSet)
            });
          }
        }
      }

      // Filter out the item to be deleted
      currentSets = currentSets.filter(
        (item) =>
          !(
            item.title === subtitle &&
            item.content === subcontent &&
            item.subject === subsubject &&
            item.promptMode === subpromptmode &&
            item.scrollGenerationMode === subselectedmode &&
            item.color === subcolor &&
            item.tag === subtag
          )
      );

      await updateDoc(docRef, { sets: currentSets });
      localStorage.setItem('sets', JSON.stringify(currentSets));

      const currentSet = JSON.parse(localStorage.getItem("currentSet"));
      if (currentSet && currentSet.title === subtitle) {
        localStorage.removeItem("currentSet");
      }

      setOpenNewTopic(false);
    } catch (error) {
      console.error("Error in deleteItemFromFirestore:", error);
      setOpenNewTopic(false);
    }
  };

  // Limit Dialog Component
  const LimitDialog = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
        zIndex: 1000,
        width: '400px',
      }}>
        <h2 style={{ marginBottom: '20px', color: 'black' }}>Set Limit Reached</h2>
        <p style={{ marginBottom: '20px', color: 'black' }}>
          You can only have 10 sets at once in the library. Upgrade to premium for unlimited sets!
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer',
              color: 'black'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const saveToFirestore = async (isDelete = false) => {
    try {
      console.log('Starting saveToFirestore with:', {
        title,
        content,
        subject,
        promptMode,
        style,
        user
      });

      if (!user) {
        console.error('No user email found');
        alert('Please sign in to save sets');
        return;
      }

      if (title.trim() === "") {
        setTitleError(true);
        return;
      }
      
      if (promptMode === 1 && content.trim() === "") {
        setContentError(true);
        return;
      }

      if (promptMode === 2 && subject.trim() === "") {
        setSubjectError(true);
        return;
      }

      const color = randomColor({
        luminosity: "light",
      });
      const userEmail = user;
      const docRef = doc(db, "users", userEmail);
      const featuredDocRef = doc(db, "sets", "featured");
      
      // Fetch the current data from Firestore
      const docSnap = await getDoc(docRef);
      console.log('Current user document:', docSnap.exists() ? docSnap.data() : 'Document does not exist');

      let currentSets = [];
      if (docSnap.exists()) {
        currentSets = docSnap.data().sets || [];
      } else {
        // Create a new document if it doesn't exist
        try {
          await setDoc(docRef, { sets: [] });
          console.log('Created new user document');
        } catch (createError) {
          console.error('Error creating new user document:', createError);
          throw new Error('Failed to create new user document');
        }
      }

      console.log('Current sets:', currentSets);

      // Check if user can edit based on author
      const canEdit = !subauthor || subauthor === user;

      if (style === 1) {
        // Find the original set to check if it was public
        const originalSet = currentSets.find(
          (item) =>
            item.title === subtitle &&
            item.content === subcontent &&
            item.subject === subsubject &&
            item.promptMode === subpromptmode &&
            item.scrollGenerationMode == subselectedmode &&
            item.color === subcolor &&
            item.tag === subtag
        );
        console.log('Original set found:', originalSet);

        // Create the updated set
        const updatedSet = {
          title: title,
          content: content,
          subject: subject,
          promptMode: promptMode,
          color: subcolor,
          isPublic: originalSet?.isPublic || false,
          author: originalSet?.author || userEmail,
          tag: tag,
          scrollGenerationMode: selectedMode || 1
        };
        console.log('Updated set:', updatedSet);

        // Update the set in the array
        const setIndex = currentSets.findIndex(
          (item) =>
            item.title === subtitle &&
            item.content === subcontent &&
            item.subject === subsubject &&
            item.promptMode === subpromptmode &&
            item.scrollGenerationMode == subselectedmode &&
            item.color === subcolor &&
            item.tag === subtag
        );

        if (setIndex !== -1) {
          currentSets[setIndex] = updatedSet;
        }

        // If the original set was public, update it in featured sets
        if (originalSet?.isPublic) {
          try {
            const featuredSnap = await getDoc(featuredDocRef);
            if (featuredSnap.exists()) {
              const featuredSets = featuredSnap.data().sets || [];
              const updatedFeaturedSets = featuredSets.map(set => {
                if (set.title === subtitle && 
                    set.content === subcontent && 
                    set.author === userEmail) {
                  return {
                    ...set,
                    title: title,
                    content: content,
                    subject: subject,
                    promptMode: promptMode,
                    color: subcolor,
                    tag: tag,
                    scrollGenerationMode: selectedMode || 1
                  };
                }
                return set;
              });
              await updateDoc(featuredDocRef, { sets: updatedFeaturedSets });
              console.log('Successfully updated featured sets');
            }
          } catch (featuredError) {
            console.error('Error updating featured sets:', featuredError);
            // Continue with the rest of the operation even if featured sets update fails
          }
        }
      } else {
        // Check subscription status before limiting sets
        if (!hasSubscription && currentSets.length >= 10) {
          setShowLimitDialog(true);
          return;
        }
        
        const newSet = {
          title: title,
          content: content,
          subject: subject,
          promptMode: promptMode,
          color: color,
          isPublic: false,
          author: userEmail,
          tag: tag,
          scrollGenerationMode: selectedMode || 1 // Ensure scrollGenerationMode is set
        };
        console.log('New set to be added:', newSet);
        currentSets.push(newSet);
      }

      // Update the Firestore document
      console.log('Updating Firestore with sets:', currentSets);
      try {
        await updateDoc(docRef, { sets: currentSets });
        console.log('Successfully updated Firestore');
      } catch (updateError) {
        console.error('Error updating Firestore:', updateError);
        throw new Error('Failed to update Firestore document');
      }

      // Update localStorage
      try {
        if (
          localStorage.getItem("currentSet") == null ||
          localStorage.getItem("currentSet") == undefined
        ) {
          const currentSet = {
            title: title,
            content: content,
            subject: subject,
            promptMode: promptMode,
            color: color,
            tag: tag,
            scrollGenerationMode: selectedMode || 1 ,
          };
          console.log('Setting currentSet in localStorage:', currentSet);
          localStorage.setItem("currentSet", JSON.stringify(currentSet));
        }
        localStorage.setItem('sets', JSON.stringify(currentSets));
        console.log('Successfully updated localStorage');
      } catch (storageError) {
        console.error('Error updating localStorage:', storageError);
        // Continue even if localStorage update fails
      }

      // Close the modal
      setOpenNewTopic(false);
    } catch (e) {
      console.error('Error in saveToFirestore:', e);
      console.error('Error details:', {
        message: e.message,
        code: e.code,
        stack: e.stack
      });
      alert('Failed to save set. Please try again.');
      setOpenNewTopic(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setTitleError(false);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setContentError(false);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setSubjectError(false);
  };

  const handleModeClick = (mode) => {
    setSelectedMode(mode);
  };

  const getModeStyle = (mode) => ({
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "0px 5px",
    borderRadius: "8px",
    backgroundColor: selectedMode === mode ? "#f1f1f1" : "white",
    boxShadow: selectedMode === mode ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
    transform: selectedMode === mode ? "scale(0.98)" : "scale(1)",
    outline: selectedMode === mode ? "1px solid black" : "1px solid gainsboro",
    transition: "all 0.2s ease",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpenNewTopic(false);
    }, 300); // Match this with the animation duration
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    deleteItemFromFirestore();
    setShowDeleteConfirmation(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: mobileDimension ? 0 : 0,
        width: mobileDimension ? "100vw" : "450px",
        height: "100dvh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "30px",
        justifyContent: "space-between",
        zIndex: 99999999999999,
        boxSizing: "border-box",
        transform: isClosing ? "translateY(100%)" : isOpening ? "translateY(100%)" : "translateY(0)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}
      </style>
      <svg
        onClick={handleClose}
        xmlns="http://www.w3.org/2000/svg"
        fill="gainsboro"
        viewBox="0 0 384 512"
        style={{
          position: "absolute",
          height: "20px",
          right: "10px",
          top: "10px",
          cursor: "pointer",
        }}
      >
        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
      </svg>
      <div style={{ display: "flex", marginBottom: "15px" }}>
        <div
          onClick={() => setPromptMode(1)}
          style={{
            borderBottom:
              promptMode === 1 ? "10px solid #6A6CFF" : "1px solid black",
            marginRight: "10px",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          <p style={{ margin: "0px" }}>Upload Notes</p>
        </div>
        <div
          onClick={() => setPromptMode(2)}
          style={{
            borderBottom:
              promptMode === 2 ? "10px solid #6A6CFF" : "1px solid black",
            marginRight: "10px",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          <p style={{ margin: "0px" }}>General</p>
        </div>
      </div>
      <div>
        <div style={{ width: "100%", marginBottom: "20px" }}>
          <p style={{ fontSize: "22px", margin: "0px 0px 8px 0px" }}>Title</p>
          <p style={{ margin: "4px 0px 12px 0px", fontSize: "14px", color: "gray" }}>
            Set a title for your AI generated Cookr questions, so it's easy to access
            later.
          </p>
          <input
            value={title}
            onChange={handleTitleChange}
            style={{
              background: "#28282B",
              outline: titleError ? "1px solid #ff4444" : "1px solid #353935",
              border: "none",
              borderRadius: "10px",
              padding: "12px 10px",
              width: "100%",
              boxSizing: "border-box",
              color: "white",
              fontSize: "16px",
              cursor: style === 1 && !canEdit ? "not-allowed" : "text",
              opacity: style === 1 && !canEdit ? 0.5 : 1
            }}
            placeholder={"Chef Shark"}
            disabled={style === 1 && !canEdit}
          />
          {titleError && (
            <p style={{ 
              color: "#ff4444", 
              fontSize: "12px", 
              margin: "4px 0px 0px 0px",
              opacity: 0.8
            }}>
              Title cannot be blank
            </p>
          )}
        </div>
        {promptMode === 1 ? (
          <div style={{ width: "100%", marginBottom: "20px" }}>
            <p style={{ fontSize: "22px", margin: "0px 0px 8px 0px" }}>Content</p>
            <p style={{ margin: "4px 0px 12px 0px", fontSize: "14px", color: "gray" }}>
              Copy and paste your notes, lectures or any other textual content.
            </p>
            <div
              style={{
                outline: contentError ? "1px solid #ff4444" : "1px solid #353935",
                border: "none",
                borderRadius: "10px",
                width: "100%",
                boxSizing: "border-box",
                height: "45dvh",
                position: "relative",
                background: "#28282B",
              }}
            >
              <textarea
                value={content}
                onChange={handleContentChange}
                style={{
                  outline: "none",
                  border: "none",
                  borderRadius: "10px",
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "none",
                  padding: "12px",
                  height: "90%",
                  background: "#28282B",
                  color: "white",
                  fontSize: "16px",
                  cursor: style === 1 && !canEdit ? "not-allowed" : "text",
                  opacity: style === 1 && !canEdit ? 0.5 : 1
                }}
                maxLength={hasSubscription ? 15000 : 8000}
                disabled={style === 1 && !canEdit}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                {contentError && (
                  <p style={{ 
                    color: "#ff4444", 
                    fontSize: "12px", 
                    margin: "4px 0px 0px 12px",
                    opacity: 0.8,
                    position: "absolute",
                    bottom: "34px",
                    left: "-6px",
                  }}>
                    Content cannot be blank
                  </p>
                )}
                <p
                  style={{
                    textAlign: "end",
                    fontSize: "12px",
                    color: "gray",
                    padding: "0px 10px",
                  }}
                >
                  {content.length}/{hasSubscription ? 15000 : 8000}
                </p>
                {canEdit && (
                  <form
                    style={{ position: "absolute", bottom: "5px", left: "5px" }}
                  >
                    <label
                      htmlFor="fileUpload"
                      style={{
                        display: "inline-block",
                        padding: "5px 8px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: "white",
                        fontSize: "12px",
                        color: "white",
                        textAlign: "center",
                        boxSizing: "border-box",
                        background: "#6A6CFF",
                        boxShadow: "0px 2px 0px 0px #484AC3",
                      }}
                    >
                      Upload Notes
                      <input
                        id="fileUpload"
                        type="file"
                        name="file"
                        accept=".pdf, image/*"
                        onChange={handleFile}
                        style={{
                          display: "none",
                          background: "#28282B",
                          outline: "1px solid #353935",
                        }}
                      />
                    </label>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", marginBottom: "20px" }}>
            <p style={{ fontSize: "22px", margin: "0px 0px 8px 0px" }}>Subject</p>
            <p style={{ margin: "4px 0px 12px 0px", fontSize: "14px", color: "gray" }}>
              What subject or topic is this content about?
            </p>
            <div
              style={{
                outline: subjectError ? "1px solid #ff4444" : "1px solid #353935",
                border: "none",
                borderRadius: "10px",
                width: "100%",
                boxSizing: "border-box",
                height: "45dvh",
                position: "relative",
                background: "#28282B",
              }}
            >
              <textarea
                value={subject}
                onChange={handleSubjectChange}
                style={{
                  outline: "none",
                  border: "none",
                  borderRadius: "10px",
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "none",
                  padding: "12px",
                  height: "90%",
                  background: "#28282B",
                  color: "white",
                  fontSize: "16px",
                  cursor: style === 1 && !canEdit ? "not-allowed" : "text",
                  opacity: style === 1 && !canEdit ? 0.5 : 1
                }}
                placeholder="Chain rule for AP Calculus BC..."
                maxLength={1000}
                disabled={style === 1 && !canEdit}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                {subjectError && (
                  <p style={{ 
                    color: "#ff4444", 
                    fontSize: "12px", 
                    margin: "4px 0px 0px 12px",
                    opacity: 0.8,
                    position: "absolute",
                    bottom: "4px",
                    left: "-6px"
                  }}>
                    Subject cannot be blank
                  </p>
                )}
                <p
                  style={{
                    textAlign: "end",
                    fontSize: "12px",
                    color: "gray",
                    padding: "0px 10px",
                  }}
                >
                  {subject.length}/1000
                </p>
              </div>
            </div>
          </div>
        )}

        {/*<div style={{ width: "100%", marginBottom: "10px" }}>
          <p style={{ fontSize: "20px", margin: "0px" }}>Mode</p>
          <p style={{ margin: "4px 0px", fontSize: "12px", color: "gray" }}>
            Choose how you want to study!
          </p>
          <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
            <div style={getModeStyle(1)} onClick={() => handleModeClick(1)}>
              📖 Questions
            </div>
            <div style={getModeStyle(2)} onClick={() => handleModeClick(2)}>
              📹 Videos
            </div>
          </div>
              </div>*/}
      </div>

      <div>
        {style === 0 && (
          <button
            onClick={() => saveToFirestore(false)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              padding: "10px",
              borderRadius: "10px",
              cursor: "pointer",
              color: "white",
              background: "#6A6CFF",
              boxShadow: "0px 2px 0px 0px #484AC3", 
              fontSize:'15px'
            }}
          >
            Save
          </button>
        )}
        {style === 1 && (
          <div style={{ 
            display: "flex", 
            flexDirection: "row",
            marginTop: "20px",
            marginBottom: "10px"
          }}>
              <button
                onClick={() => saveToFirestore(false)}
                disabled={!canEdit}
                style={{
                  width: "47%",
                  background: !canEdit ? "#999" : "#6A6CFF",
                  boxShadow: !canEdit ? "none" : "0px 5px 0px 0px #484AC3",
                  border: "none",
                  padding: "15px",
                  borderRadius: "10px",
                  cursor: !canEdit ? "not-allowed" : "pointer",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "500",
                  opacity: !canEdit ? 0.7 : 1
                }}
              >
                Save
              </button>

            <div style={{ width: !canEdit ? "6%" : "6%" }}></div>
            <button
              onClick={handleDeleteClick}
              style={{
                width: !canEdit ? "47%" : "47%",
                background: "#ff4444",
                boxShadow: "0px 5px 0px 0px #cc0000",
                border: "none",
                padding: "15px",
                borderRadius: "10px",
                cursor: "pointer",
                color: "white",
                fontSize: "16px",
                fontWeight: "500"
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {
        <div
          onClick={() => setOpenNewTopic(false)}
          style={{ position: "absolute", right: "30px", cursor: "pointer" }}
        ></div>
      }

      {/* Add the Limit Dialog */}
      <LimitDialog
        show={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
      />
      {/* Add the DeleteConfirmationPopup */}
      {showDeleteConfirmation && (
        <DeleteConfirmationPopup 
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default NewPrompt;

        



       

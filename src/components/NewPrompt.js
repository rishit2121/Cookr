import React, { useEffect, useState } from "react";
import { db } from "./firebase/Firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
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
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser.email);
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe(); // Cleanup listener
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
        console.log('Caption ID:', captionId);
  
        // Now fetch the actual caption text (subtitles) using the caption ID
        const captionUrl = `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`;
        const captionResponse = await fetch(captionUrl);
        const captionData = await captionResponse.text();
  
        console.log('Transcript:', captionData); // This will contain the caption text
  
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

    console.log(link); // Logs an array of text contents of <p> tags

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
        logger: (info) => console.log(info), // Optional: for logging progress
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
      console.log("Item removed from localStorage");
    } else {
      console.log("Item not found in localStorage");
    }
  };

  const deleteItemFromFirestore = async () => {
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
      localStorage.setItem('sets', JSON.stringify(currentSets))

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

  const saveToFirestore = async () => {
    try {
      const color = randomColor({
        luminosity: "light",
      });
      const userEmail = user;
      const docRef = doc(db, "users", userEmail);
      // Fetch the current data from Firestore
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error("Document not found");
        return;
      }
      let currentSets = docSnap.data().sets || [];
      if (style === 1) {
        // Remove the item if style === 1
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
        // Wrap the removeItemFromLocalStorage call in a try-catch block
        try {
          removeItemFromLocalStorage({
            title: subtitle,
            content: subcontent,
            subject: subsubject,
            promptMode: subpromptmode,
            color: subcolor,
          });
        } catch (removeError) {
          console.error("Error removing item from localStorage:", removeError);
        }
        // Add the new item at the same index
        const index = docSnap
          .data()
          .sets.findIndex(
            (item) =>
              item.title === subtitle &&
              item.content === subcontent &&
              item.subject === subsubject &&
              item.promptMode === subpromptmode &&
              item.color === subcolor 
          );
        if (index !== -1) {
          currentSets.splice(index, 0, {
            title: title,
            content: content,
            subject: subject,
            promptMode: promptMode,
            color: subcolor,
           
          });
        } else {
          // If item was not found, just add to the end
          currentSets.push({
            title: title,
            content: content,
            subject: subject,
            promptMode: promptMode,
            color: subcolor,
            
          });
        }
      } else {
        // If style !== 1, just add to the end
        if(currentSets.length<10){
        currentSets.push({
          title: title,
          content: content,
          subject: subject,
          promptMode: promptMode,
          color: color,
         
        });
      }else{
          console.error("You can only have 10 sets at once in the library.")
        }
      }

      // Update the Firestore document
      await updateDoc(docRef, { sets: currentSets });

      // Update localStorage
      if (
        localStorage.getItem("currentSet") == null ||
        localStorage.getItem("currentSet") == undefined
      ) {
        localStorage.setItem(
          "currentSet",
          JSON.stringify({
            title: title,
            content: content,
            subject: subject,
            promptMode: promptMode,
            color: color,
            tag: tag,
            scrollGenerationMode: selectedMode,
          })
        );
      }
      localStorage.setItem('sets', JSON.stringify(currentSets))

      setOpenNewTopic(false);
    } catch (e) {
      console.error(e);
      setOpenNewTopic(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
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

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        // left: 0,
        right: mobileDimension? 0: 0,
        width: mobileDimension? "100vw": "370px",
        height: "100dvh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        justifyContent: "space-around",
        zIndex: 99999999999999,
        boxSizing: "border-box",
      }}
    >
      <svg
        onClick={async () => {
          setOpenNewTopic(false);
        }}
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
        <div style={{ width: "100%", marginBottom: "10px" }}>
          <p style={{ fontSize: "20px", margin: "0px" }}>Title</p>
          <p style={{ margin: "4px 0px", fontSize: "12px", color: "gray" }}>
            Set a title for your AI generated Cookr questions, so it's easy to access
            later.
          </p>
          <input
            value={title}
            onChange={handleTitleChange}
            style={{
              background: "#28282B",
              outline: "1px solid #353935",
              border: "none",
              borderRadius: "10px",
              padding: "10px 5px",
              width: "100%",
              boxSizing: "border-box",
              color: "white",
              
            }}
            placeholder={"Chef Shark"}
          />
        </div>
        {promptMode === 1 ? (
          <div style={{ width: "100%", marginBottom: "10px" }}>
            <p style={{ fontSize: "20px", margin: "0px" }}>Content</p>
            <p style={{ margin: "4px 0px", fontSize: "12px", color: "gray" }}>
              Copy and paste your notes, lectures or any other textual content.
            </p>
            <div
              style={{
                outline: "1px solid gainsboro",
                border: "none",
                borderRadius: "10px",
                width: "100%",
                boxSizing: "border-box",
                height: "35dvh",
                position: "relative",
                background: "#28282B",
                outline: "1px solid #353935",
                height: "50dvh",
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
                  padding: "10px",
                  height: "90%",
                  background: "#28282B",
                  color: "white",
                }}
                maxLength={14000}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <p
                  style={{
                    textAlign: "end",
                    fontSize: "12px",
                    color: "gray",
                    padding: "0px 10px",
                  }}
                >
                  {content.length}/14000
                </p>
                <form
                  style={{ position: "absolute", bottom: "5px", left: "5px" }}
                >
                  <label
                    htmlFor="fileUpload"
                    style={{
                      display: "inline-block",
                      padding: "5px 8px", // Reduced padding
                      borderRadius: "8px", // Reduced border radius
                      cursor: "pointer",
                      backgroundColor: "white",
                      fontSize: "12px", // Reduced font size
                      color: "white",
                      textAlign: "center",
                      boxSizing: "border-box",
                      background: "#6A6CFF",
                      boxShadow: "0px 2px 0px 0px #484AC3", // Shadow added here
                    }}
                  >
                    Upload Notes
                    <input
                      id="fileUpload"
                      type="file"
                      name="file"
                      accept=".pdf, image/*" // Accepts PDF files and all image formats
                      onChange={handleFile}
                      style={{
                        display: "none",
                        background: "#28282B",
                        outline: "1px solid #353935",
                      }}
                    />
                  </label>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "20px", margin: "0px" }}>Content</p>
            <p style={{ margin: "4px 0px", fontSize: "12px", color: "gray" }}>
              Enter what you want to be tested on (and preferrably give an
              example or be as specific as possible).
            </p>
            <div
              style={{
                border: "none",
                borderRadius: "10px",
                width: "100%",
                boxSizing: "border-box",
                height: "50dvh",
                position: "relative",
                marginBottom: "10px",
                background: "#28282B",
                outline: "1px solid #353935",
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
                  padding: "10px",
                  height: "90%",
                  background: "#28282B",
                  color: "white",
                }}
                placeholder="Chain rule for AP Calculus BC..."
                maxLength={1000}
              />
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
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button
              onClick={() => saveToFirestore(false)}
              style={{
                width: "47%",
                background: "#6A6CFF",
                boxShadow: "0px 5px 0px 0px #484AC3", 
                border: "none",
                padding: "10px",
                borderRadius: "10px",
                cursor: "pointer",
                color:"white",
                fontSize:'15px'
              }}
            >
              Save
            </button>
            <div style={{ width: "6%" }}></div>
            <button
              onClick={() => deleteItemFromFirestore()}
              style={{
                width: "47%",
                background: "#6A6CFF",
                boxShadow: "0px 5px 0px 0px #484AC3", 
                border: "none",
                padding: "10px",
                borderRadius: "10px",
                cursor: "pointer",
                color:"white",
                fontSize:'15px'
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
    </div>
  );
}

export default NewPrompt;

        



       
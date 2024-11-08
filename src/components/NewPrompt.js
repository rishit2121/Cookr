import React, { useEffect, useState } from "react";
import { db } from "./firebase/Firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove} from "firebase/firestore";
import FileUpload from "./FileUpload"
import Tesseract from 'tesseract.js';
// Set up the PDF worker
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import PDFJSWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker;



var randomColor = require("randomcolor"); // import the script

function NewPrompt({ setOpenNewTopic, style, params }) {
  const [promptMode, setPromptMode] = useState(1);
  const [subcolor, subcontent, subpromptmode, subsubject, subtag, subtitle] = params;

  const [title, setTitle] = useState(style === 1 ? subtitle : "");
  const [content, setContent] = useState(style === 1 ? subcontent : "");
  const [subject, setSubject] = useState(style === 1 ? subsubject : "");
  
  const [tag, setTage] = useState("fa-solid fa-calculator")
  const [text, setText] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelect = (option) => {
    setSelectedOption(option);
  };
  function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        // Handle PDF file
        const fileUrl = URL.createObjectURL(file);
        setPdfUrl(fileUrl);
        extractTextFromPdf(file);
      } else if (file.type.startsWith('image/')) {
        // Handle image file
        const fileUrl = URL.createObjectURL(file);
        setImageUrl(fileUrl);
        extractTextFromImage(file);
      } else {
        alert('Please upload a valid PDF or image file.');
      }
    }
  }
  // Function to clean up the text
function cleanText(rawText) {
  // Remove any JSON-like structures or HTML tags
  // let cleanedText = rawText.replace(/\{[^}]+\}|\[[^\]]+\]|<[^>]+>/g, '');
  
  // // Further clean-up: remove URLs, special characters, and extra whitespace
  // cleanedText = cleanedText.replace(/https?:\/\/[^\s]+/g, ''); // Remove URLs
  // cleanedText = cleanedText.replace(/[^\w\s.,!?'"-]/g, '');   // Remove special characters except punctuation
  // cleanedText = cleanedText.replace(/\s+/g, ' ').trim();      // Replace multiple spaces with a single space and trim

  return rawText;
}
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
      setContent(cleanText(pTextContents));
    } catch (error) {

      console.error('Error fetching text from the website:', error);
      alert('Failed to fetch text from the provided link.');
    }
  };
  function extractTextFromImage(file) {
    Tesseract.recognize(
      file,
      'eng', // Language
      {
        logger: info => console.log(info) // Optional: for logging progress
      }
    ).then(({ data: { text } }) => {
      setContent(text);
    }).catch(error => {
      console.error('Error recognizing text from image:', error);
    });
  }
function extractTextFromPdf(file) {
  const fileReader = new FileReader();

  fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);

      try {
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          const numPages = pdf.numPages;
          let fullText = '';

          // Function to extract text from each page
          const extractTextFromPage = async (pageNum) => {
              const page = await pdf.getPage(pageNum);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');
              fullText += pageText + '\n';

              if (pageNum < numPages) {
                  extractTextFromPage(pageNum + 1);
              } else {
                  setContent(fullText);
              }
          };

          extractTextFromPage(1);
      } catch (error) {
          console.error('Error loading PDF document:', error);
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
      const userEmail = localStorage.getItem("email");
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
        item =>
          !(item.title === subtitle &&
            item.content === subcontent &&
            item.subject === subsubject &&
            item.promptMode === subpromptmode &&
            item.color === subcolor &&
            item.tag === subtag)
      );
  
      // Update the Firestore document with the modified sets array
      await updateDoc(docRef, { sets: currentSets });
  
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
      const color = randomColor();
      const userEmail = localStorage.getItem("email");
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
          item =>
            !(item.title === subtitle &&
              item.content === subcontent &&
              item.subject === subsubject &&
              item.promptMode === subpromptmode &&
              item.color === subcolor &&
              item.tag === subtag)
        );
  
        // Wrap the removeItemFromLocalStorage call in a try-catch block
        try {
          removeItemFromLocalStorage({
            title: subtitle,
            content: subcontent,
            subject: subsubject,
            promptMode: subpromptmode,
            color: subcolor,
            tag: subtag
          });
        } catch (removeError) {
          console.error("Error removing item from localStorage:", removeError);
        }
  
        // Add the new item at the same index
        const index = docSnap.data().sets.findIndex(
          item =>
            item.title === subtitle &&
            item.content === subcontent &&
            item.subject === subsubject &&
            item.promptMode === subpromptmode &&
            item.color === subcolor &&
            item.tag === subtag
        );
        if (index !== -1) {
          currentSets.splice(index, 0, {
            title: title,
            content: content,
            subject: subject,
            promptMode: promptMode,
            color: subcolor,
            tag: tag
          });
          console.log("hi")
        } else {
          // If item was not found, just add to the end
          currentSets.push({
            title: title,
            content: content,
            subject: subject,
            promptMode: promptMode,
            color: subcolor,
            tag: tag
          });
        }
      } else {
        // If style !== 1, just add to the end
        currentSets.push({
          title: title,
          content: content,
          subject: subject,
          promptMode: promptMode,
          color: color,
          tag: tag
        });
      }
  
      // Update the Firestore document
      await updateDoc(docRef, { sets: currentSets });
  
      // Update localStorage
      if(style===1){
        localStorage.setItem(
          "currentSet",
          JSON.stringify({
            title: title,
            content: content,
            subject: subject,
            promptMode: promptMode,
            color: subcolor,
            tag: tag
          })
        );
      } else{
        localStorage.setItem(
          "currentSet",
          JSON.stringify({
            title: title,
            content: content,
            subject: subject,
            promptMode: promptMode,
            color: color,
            tag: tag
          })
        );
      }
  
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

  return (
    <div
      style={{
        flexDirection: "column",
        width: "350px",
        height: "90vh",
        position: "absolute",
        right: "1%",
        zIndex: "9999",
        top: "20px",
        background: "white",
        boxShadow: "0px 0px 16px 1px gainsboro",
        borderRadius: "10px",
        display: "flex",
        padding: "20px",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex" }}>
        <div
          onClick={() => setPromptMode(1)}
          style={{
            borderBottom:
              promptMode === 1 ? "1px solid black" : "1px solid gainsboro",
            marginRight: "10px",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          <p style={{ margin: "0px" }}>My content</p>
        </div>
        <div
          onClick={() => setPromptMode(2)}
          style={{
            borderBottom:
              promptMode === 2 ? "1px solid black" : "1px solid gainsboro",
            marginRight: "10px",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          <p style={{ margin: "0px" }}>From scratch</p>
        </div>
      </div>
      <div>
        <div style={{ width: "100%", marginBottom: "10px" }}>
          <p style={{ fontSize: "20px", margin: "0px" }}>Title</p>
          <p style={{ marginTop: "4px", fontSize: "12px", color: "gray" }}>
            Set a title for your AI generated scrolls, so it's easy to access
            later.
          </p>
          <input
            value={title}
            onChange={handleTitleChange}
            style={{
              outline: "1px solid gainsboro",
              border: "none",
              borderRadius: "10px",
              padding: "10px 5px",
              width: "100%",
              boxSizing: "border-box",
            }}
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
                height: "35vh",
                position: "relative"
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
                }}
                maxLength={6000}
              />
              <div style={{display:'flex', flexDirection:'column'}}>
              <p
                style={{
                  textAlign: "end",
                  fontSize: "12px",
                  color: "gray",
                  padding: "0px 10px",
                }}
              >
                {content.length}/6000
              </p>
              <form style={{ position: "absolute", bottom: "5px", left: "5px"}}>
              <label
                htmlFor="fileUpload"
                style={{
                  background:'white',
                  display: "inline-block",
                  padding: "5px 8px", // Reduced padding
                  borderRadius: "8px", // Reduced border radius
                  border: "1px solid black",
                  cursor: "pointer",
                  backgroundColor: "white",
                  fontSize: "12px", // Reduced font size
                  color: "black",
                  textAlign: "center",
                  boxSizing: "border-box",
                  boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)", // Shadow added here

                }}
              >
                Upload Notes?
                <input
  id="fileUpload"
  type="file"
  name="file"
  accept=".pdf, image/*"  // Accepts PDF files and all image formats
  onChange={handleFile}
  style={{ display: "none" }}
/>
              </label>
            </form>
            </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              outline: "1px solid gainsboro",
              border: "none",
              borderRadius: "10px",
              width: "100%",
              boxSizing: "border-box",
              height: "34vh",
              position: "relative", // Make the container relative for positioning the form
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
              }}
              placeholder="Chain rule for AP Calculus BC..."
              maxLength={6000}
            />
            <p
              style={{
                textAlign: "end",
                fontSize: "12px",
                color: "gray",
                padding: "0px 10px",
              }}
            >
              {subject.length}/6000
            </p>
            <form style={{ position: "absolute", bottom: "10px", left: "10px" }}>
              <label
                htmlFor="fileUpload"
                style={{
                  display: "inline-block",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid gainsboro",
                  cursor: "pointer",
                  backgroundColor: "white",
                  fontSize: "14px",
                  color: "black",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                Upload Notes?
                <input
  id="fileUpload"
  type="file"
  name="file"
  accept=".pdf, image/*"  // Accepts PDF files and all image formats
  onChange={handleFile}
  style={{ display: "none" }}
/>
              </label>
            </form>
          </div>

        )}
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '5px', padding: '5px' }}>
          <input
            type="text"
            placeholder="Enter website URL"
            style={{ flex: 1, border: 'none', outline: 'none' }}
            id="linkInput"
          />
          <img
            src="upload-icon.png" // Replace with your actual upload icon path
            alt="Upload"
            style={{ width: '20px', height: '20px', cursor: 'pointer', marginLeft: '5px' }}
            onClick={() => handleLink(document.getElementById('linkInput').value)}
          />
        </div>

        <div style={{ width: "100%", marginBottom: "10px" }}>
          <p style={{ fontSize: "20px", margin: "0px" }}>Tag</p>
          <p style={{ margin: "4px 0px", fontSize: "12px", color: "gray" }}>
              Choose what type of content you would like to see. 
            </p>
          <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '10px 0' }}>
          <div 
          onClick={() => handleSelect('questions')} 
          style={{
            padding: '10px 30px',
            borderRadius: '15px', // Makes it fully rounded
            backgroundColor: 'white',
            cursor: 'pointer',
            border: selectedOption === 'questions' ? '2px solid #007bff' : '1px solid black', // Small black outline by default
            transition: 'border 0.3s',
          }}
        >
          ❓Questions
        </div>
        <div style={{width:'1%'}}></div>
        <div 
          onClick={() => handleSelect('reels')} 
          style={{
            padding: '10px 30px',
            borderRadius: '15px', // Makes it fully rounded
            backgroundColor: 'white',
            cursor: 'pointer',
            border: selectedOption === 'reels' ? '2px solid #007bff' : '1px solid black', // Small black outline by default
            transition: 'border 0.3s',
          }}
        >
          🎥 Reels
        </div>


    </div>
        </div>
      </div>
      
      <div>
      {style === 0 && (
        <button
          onClick={() => saveToFirestore(false)}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid gainsboro",
            padding: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Save
        </button>
      )}
      {style === 1 && (
        <div style={{display:'flex', flexDirection:'row'}}>
        <button
        onClick={() => saveToFirestore(false)}
        style={{
          width: "47%",
          background: "transparent",
          border: "1px solid gainsboro",
          padding: "10px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Save
      </button>
      <div style={{width:'6%'}}></div>
      <button
        onClick={() => deleteItemFromFirestore()}
        style={{
          width: "47%",
          background: "transparent",
          border: "1px solid gainsboro",
          padding: "10px",
          borderRadius: "10px",
          cursor: "pointer",
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

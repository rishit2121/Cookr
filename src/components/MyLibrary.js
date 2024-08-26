import React, { useState, useEffect } from "react";
import NewPrompt from "./NewPrompt";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase/Firebase";

const MyLibrary = () => {
  const [sets, setSets] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [openNewTopic, setOpenNewTopic] = useState(false);
  const [style, setStyle] = useState(0); // Manage the style with useState
  const [params, setParams] = useState([]); // Manage the params with useState

  useEffect(() => {
    try {
      const document = onSnapshot(
        doc(db, "users", localStorage.getItem("email")),
        (doc) => {
          setSets(doc.data().sets);
        }
      );
    } catch (error) {
      alert("Error");
    }
  }, []);

  // Function to change style and params when a button is clicked
  const handleNewClick=()=>{
    setStyle(0); // Toggle style between 0 and 1
    setParams([]); // Example params
    setOpenNewTopic(!openNewTopic);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <h1 style={{ margin: "40px 50px" }}>My Library</h1>
      <div style={{ margin: "5px 50px", display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
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
            margin: "10px 50px 0px 0px"
          }}
          onClick={() => handleNewClick()}
        >
          <p>Add New Subject</p>
        </div>
        {sets &&
          sets.map((item, index) => (
            <div
              key={index}
              style={{
                width: "200px",
                height: "200px",
                boxShadow: `0px 0px 1px 1px ${item.color}`,
                borderRadius: "10px",
                display: "flex",
                cursor: "pointer",
                margin: "10px 50px 0px 0px",
                backgroundColor: `${item.color}10`,
                flexDirection: "column",
                justifyContent: "space-between"
              }}
              onClick={()=>{setStyle(1); setParams([item.color, item.content, item.promptMode, item.subject, item.tag, item.title]); setOpenNewTopic(!openNewTopic);}}
            >
              <h1 style={{ color: item.color, textOverflow: "clip", padding: "0px 10px" }}>{item.title}</h1>
              <i style={{ position: "relative", bottom: "10px", fontSize: "50px", left: "140px", color: item.color }} className={item.tag}></i>
            </div>
          ))}
      </div>

      {/* Button to change style and params
      <button onClick={handleButtonClick} style={{ margin: "20px 50px" }}>
        Change Style and Params
      </button> */}

      {openNewTopic && (
        <NewPrompt setOpenNewTopic={setOpenNewTopic} style={style} params={params} />
      )}
    </div>
  );
};

export default MyLibrary;
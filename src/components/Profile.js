import React, { useState, useEffect } from "react";
import NewPrompt from "./NewPrompt";
import { getDoc, onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase/Firebase";
import Plans from "./Plans";
import { useNavigate } from "react-router-dom";
import AdsComponent from './adComponent';

const MyProfile = ({ mobileDimension }) => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [planType, setPlanType] = useState();
  const [referalCode, setReferalCode] = useState();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  useEffect(() => {
    try {
      const document = onSnapshot(
        doc(db, "users", localStorage.getItem("email")),
        (doc) => {
          setName(doc.data().name);
          setEmail(doc.data().email);
          setPlanType(doc.data().plan);
          setReferalCode(doc.data().myCode)
        }
      );
    } catch (error) {
      alert("Error");
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <h1 style={{ margin: "40px 20px", color: isDarkMode ? "white": "black"}}>My Profile</h1>
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
            color: isDarkMode ? "white": "black"
          }}
        >
          {name && name.slice(0, 1)}
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
            <label style={{color: isDarkMode ? "white": "black"}}>Name: </label>
            <p
              style={{
                fontWeight: "bold",
                padding: "5px",
                borderRadius: "10px",
                color: isDarkMode ? "white": "black"
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
            <label style={{color: isDarkMode ? "white": "black"}}>Email: </label>
            <p
              style={{
                fontWeight: "bold",
                padding: "5px",
                borderRadius: "10px",
                color: isDarkMode ? "white": "black"
              }}
            >
              {email && email}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <label style={{color: isDarkMode ? "white": "black"}}>Referal Code: </label>
            <p
              style={{
                fontWeight: "bold",
                padding: "5px",
                borderRadius: "10px",
                color: isDarkMode ? "white": "black"
              }}
            >
              {referalCode && referalCode}
            </p>
          </div>
        </div>
      </div>
      <h1 style={{ margin: "40px 20px", color: isDarkMode ? "white": "black"}}>Plans</h1>
      <Plans planType={planType} />
    </div>
  );
};

export default MyProfile;

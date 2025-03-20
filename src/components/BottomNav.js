import React from "react";
import { Link } from "react-router-dom";
import CustomDropdown from "./Dropdown";

const Bottom = ({ streak, xp, sets, setCurrentSet, mobileDimension, currentSet, location, currentPage }) => {
  return (
    <div
      style={{
        display: "flex",
        zIndex: "9999",
        backgroundColor: "black",
        height: "50px",
        borderTop: "1px solid gray",
        width: "100%",
        position: "absolute",
        bottom: "0px",
        right: "0px",
        margin: "0px",
        color: "white",
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingTop: !mobileDimension? '5px': '10px',
        paddingRight: !mobileDimension? '20px': '0px',
        paddingBottom: mobileDimension? '15px': '0px'
      }}
    >
      {/* Mobile Navigation Buttons */}
      {mobileDimension && (
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "space-evenly",
            // marginRight:'auto',
          }}
        >

        <Link
          to="/profile"
          style={{
            display: "flex",
            marginTop:'5px',
            flexDirection: "column",
            alignItems: "center",
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <svg
            fill={currentPage === "profile" ? "#ffffff" : "#888888"}
            xmlns="https://www.w3.org/2000/svg"
            height={20}
            viewBox="0 0 448 512"
          >
            <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" />
          </svg>
          <span style={{ fontSize: currentPage === "profile" ? "8px" : "8px", marginTop: "4px", marginTop: "4px" }}>Profile</span>

        </Link>
        
        <Link
          to={"/library"}
          style={{
            display: "flex",
            marginTop:'5px',
            alignItems: "center",
            flexDirection: "column",
            color:"#fff",
            textDecoration: "none",
            display: "flex",

            justifyContent: "space-between",
          }}
        >
          <svg height={20} viewBox="0 0 28 28" version="1.1" style={{ transform: "scale(1.2)" }}>
   
            <path fill={currentPage === "library" ? "#ffffff" : "#888888"} d="M5.9897,3 C7.0937,3 7.9897,3.896 7.9897,5 L7.9897,23 C7.9897,24.104 7.0937,25 5.9897,25 L4.0007,25 C2.8957,25 2.0007,24.104 2.0007,23 L2.0007,5 C2.0007,3.896 2.8957,3 4.0007,3 L5.9897,3 Z M12.9897,3 C14.0937,3 14.9897,3.896 14.9897,5 L14.9897,23 C14.9897,24.104 14.0937,25 12.9897,25 L10.9947,25 C9.8897,25 8.9947,24.104 8.9947,23 L8.9947,5 C8.9947,3.896 9.8897,3 10.9947,3 L12.9897,3 Z M22.0701,6.5432 L25.9301,22.0262 C26.1971,23.0972 25.5441,24.1832 24.4731,24.4512 L22.5101,24.9402 C21.4391,25.2072 20.3531,24.5552 20.0861,23.4832 L16.2261,8.0002 C15.9581,6.9282 16.6111,5.8432 17.6821,5.5752 L19.6451,5.0862 C20.7161,4.8182 21.8021,5.4712 22.0701,6.5432 Z">

          </path>

          </svg>
          <span style={{ fontSize: currentPage === "library" ? "8px" : "8px", marginTop: "4px" }}>My Library</span>

        </Link>
        <Link
          to={"/"}
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <svg
            fill={currentPage === "home" ? "#ffffff" : "#888888"}
            xmlns="https://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            height={20}
            style={{ transform: "scale(1.6)" }}
          >
            <path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
          </svg>
          <span style={{ fontSize: currentPage === "home" ? "8px" : "8px", marginTop: "4px"  }}>Home</span>

        </Link>
          <Link
          to={"/leaderboard"}
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
        <svg
          xmlns="https://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          height={20}
          style={{ transform: "scale(1.1)", overflow: "visible" }}
        >
          <path
            fill={currentPage === "leaderboard" ? "#ffffff" : "#888888"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M15 21H9v-8.4a.6.6 0 0 1 .6-.6h4.8a.6.6 0 0 1 .6.6zm5.4 0H15v-2.9a.6.6 0 0 1 .6-.6h4.8a.6.6 0 0 1 .6.6v2.3a.6.6 0 0 1-.6.6M9 21v-4.9a.6.6 0 0 0-.6-.6H3.6a.6.6 0 0 0-.6.6v4.3a.6.6 0 0 0 .6.6zm1.806-15.887l.909-1.927a.312.312 0 0 1 .57 0l.91 1.927l2.032.311c.261.04.365.376.176.568l-1.47 1.5l.347 2.118c.044.272-.228.48-.462.351l-1.818-1l-1.818 1c-.233.128-.506-.079-.462-.351l.347-2.118l-1.47-1.5c-.19-.192-.085-.528.175-.568z"
          ></path>
        </svg>
        <span style={{ fontSize: currentPage === "leaderboard" ? "8px" : "8px",  marginLeft:'30%'}}>Rankings</span>

        </Link>
        <Link
          to="/saved"
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            marginTop:'5px',
            // padding: "20px",
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <svg
            fill={currentPage === "saved" ? "#ffffff" : "#888888"}
            xmlns="https://www.w3.org/2000/svg"
            viewBox="0 0 384 512"
            height={20}
          >
            <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z" />
          </svg>
          <span style={{ fontSize: currentPage === "saved" ? "8px" : "8px", }}>Saved</span>

        </Link> 
        </div>
      )}

      {/* Next Set Dropdown */}
      {!mobileDimension && (
      <div
        style={{
          display: "flex",
          marginLeft: mobileDimension ? "0px" : "auto",
          padding: "0px 0px",
          alignItems: "center",
        }}
      >
        {/* <p style={{ marginRight: "10px", fontSize: "10px" }}></p> */}
        <CustomDropdown sets={sets} setCurrentSet={setCurrentSet} />
      </div>
      )}
    </div>
  );
};

// Link Style
const iconLinkStyle = {
  textDecoration: "none",
  color: "white",
  fontSize: "20px",
  cursor: "pointer",
  padding: "10px",
};

export default Bottom;

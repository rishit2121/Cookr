import React from "react";
import { Link } from "react-router-dom";
import CustomDropdown from "./Dropdown";

const Bottom = ({ streak, xp, sets, setCurrentSet, mobileDimension, currentSet, location }) => {
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
        padding: "5px 20px",
      }}
    >
      {/* Mobile Navigation Buttons */}
      {mobileDimension && (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          <Link
            to="/profile"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#fff",
              textDecoration: "none",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <svg
              fill={"#ffffff"}
              xmlns="https://www.w3.org/2000/svg"
              height={20}
              viewBox="0 0 448 512"
            >
              <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" />
            </svg>
            <span style={{ fontSize: "8px", marginTop: "4px" }}>Profile</span>
          </Link>

          <Link
            to="/saved"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#fff",
              textDecoration: "none",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <svg
              fill={"#ffffff"}
              xmlns="https://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              height={20}
            >
              <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z" />
            </svg>
            <span style={{ fontSize: "8px", marginTop: "4px" }}>Favorites</span>
          </Link>

          <Link
            to="/library"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#fff",
              textDecoration: "none",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <svg
              fill={"#ffffff"}
              width="20px"
              height="20px"
              viewBox="0 0 32 32"
              version="1.1"
              xmlns="https://www.w3.org/2000/svg"
            >
              <title>books</title>
              <path d="M30.156 26.492l-6.211-23.184c-0.327-1.183-1.393-2.037-2.659-2.037-0.252 0-0.495 0.034-0.727 0.097l0.019-0.004-2.897 0.776c-0.325 0.094-0.609 0.236-0.86 0.42l0.008-0.005c-0.49-0.787-1.349-1.303-2.33-1.306h-2.998c-0.789 0.001-1.5 0.337-1.998 0.873l-0.002 0.002c-0.5-0.537-1.211-0.873-2-0.874h-3c-1.518 0.002-2.748 1.232-2.75 2.75v24c0.002 1.518 1.232 2.748 2.75 2.75h3c0.789-0.002 1.5-0.337 1.998-0.873l0.002-0.002c0.5 0.538 1.211 0.873 2 0.875h2.998c1.518-0.002 2.748-1.232 2.75-2.75v-16.848l4.699 17.54c0.327 1.182 1.392 2.035 2.656 2.037h0c0.001 0 0.003 0 0.005 0 0.251 0 0.494-0.034 0.725-0.098l-0.019 0.005 2.898-0.775c1.182-0.326 2.036-1.392 2.036-2.657 0-0.252-0.034-0.497-0.098-0.729l0.005 0.019zM18.415 9.708l5.31-1.423 3.753 14.007-5.311 1.422zM18.068 3.59l2.896-0.776c0.097-0.027 0.209-0.043 0.325-0.043 0.575 0 1.059 0.389 1.204 0.918l0.002 0.009 0.841 3.139-5.311 1.423-0.778-2.905v-1.055c0.153-0.347 0.449-0.607 0.812-0.708l0.009-0.002zM11.5 2.75h2.998c0.69 0.001 1.249 0.56 1.25 1.25v3.249l-5.498 0.001v-3.25c0.001-0.69 0.56-1.249 1.25-1.25h0zM8.75 23.25h-5.5v-14.5l5.5-0.001zM10.25 8.75l5.498-0.001v14.501h-5.498zM4.5 2.75h3c0.69 0.001 1.249 0.56 1.25 1.25v3.249l-5.5 0.001v-3.25c0.001-0.69 0.56-1.249 1.25-1.25h0zM7.5 29.25h-3c-0.69-0.001-1.249-0.56-1.25-1.25v-3.25h5.5v3.25c-0.001 0.69-0.56 1.249-1.25 1.25h-0zM14.498 29.25h-2.998c-0.69-0.001-1.249-0.56-1.25-1.25v-3.25h5.498v3.25c-0.001 0.69-0.56 1.249-1.25 1.25h-0zM28.58 27.826c-0.164 0.285-0.43 0.495-0.747 0.582l-0.009 0.002-2.898 0.775c-0.096 0.026-0.206 0.041-0.319 0.041-0.575 0-1.060-0.387-1.208-0.915l-0.002-0.009-0.841-3.14 5.311-1.422 0.841 3.14c0.027 0.096 0.042 0.207 0.042 0.321 0 0.23-0.063 0.446-0.173 0.63l0.003-0.006z"></path>
            </svg>
            <span style={{ fontSize: "8px", marginTop: "4px" }}>Library</span>
          </Link>

          <Link
            to="/"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#fff",
              textDecoration: "none",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <svg
              fill={"#ffffff"}
              xmlns="https://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
              height={20}
              style={{ transform: "scale(1.6)" }}
            >
              <path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
            </svg>
            <span style={{ fontSize: "8px", marginTop: "4px" }}>Home</span>
          </Link>

          <Link
            to="/flashcards"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#fff",
              textDecoration: "none",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <svg
              fill="none"
              xmlns="https://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              style={{ overflow: "visible" }}
              height={20}
            >
              <path stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.243 7.561h19.514a2.65 2.65 0 0 1 2.657 2.658v27.563a2.65 2.65 0 0 1-2.657 2.657H14.243a2.65 2.65 0 0 1-2.657-2.657V10.219a2.65 2.65 0 0 1 2.656-2.658m1.108 9.325h17.703M15.35 20.312h17.703M15.35 23.74h17.703M15.35 27.166h17.703M15.35 13.459h7.097M15.35 30.593h7.097M15.35 34.02h17.703m-21.468 3.716h24.83m-16.556 0v2.702m8.283-2.702v2.702m-16.573-3.6L5.592 14.524a2.65 2.65 0 0 1 1.878-3.255h0l4.1-1.099m24.861 26.668l5.977-22.314a2.65 2.65 0 0 0-1.878-3.255h0l-4.1-1.099"></path>
            </svg>
            <span style={{ fontSize: "8px", marginTop: "4px" }}>FlashCards</span>
          </Link>
        </div>
      )}

      {/* Next Set Dropdown */}
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

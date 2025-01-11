import React from "react";


export const Toggle = ({ handleChange, isChecked }) => {
  const toggleStyles = {
    container: {
    //   position: "absolute",
      display: "flex",
    //   justifyContent: "center",
      alignItems: "center",
    },
    input: {
      visibility: "hidden",
    },
    label: {
      display: "flex", 
      alignItems: "center",
      cursor: "pointer",
      position: "relative",
      fontSize: "1.5em",
      color: isChecked ? "#fff" : "#000",
    },
    toggleBackground: {
      height: "1.3em",
      width: "3.5em",
      borderRadius: "1.5em",
      backgroundColor: isChecked ? "#888" : "#11A7C1", // Blue when dark mode is off, gray when dark mode is on
      transition: "background-color 0.3s ease",
      position: "relative",
    },
    circle: {
      position: "absolute",
      top: "0.1em",
      left: isChecked ? "2.2em" : "0.2em", // Move the circle on toggle
      height: "1.0em",
      width: "1.0em",
      borderRadius: "50%",
      backgroundColor: isChecked ? "black" : "#E9D200", // Circle color
      transition: "left 0.3s ease",
      display: "flex",
      justifyContent: "center",
      alignItems: "center", // Center the icon
    },
    icon: {
      width: "16px",
      height: "16px", // Icon size
    },
  };

  // Sun SVG (inside the circle)
  const sunIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="black" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler-sun">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
      <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
    </svg>
  );

  // Moon SVG (inside the circle, updated with your provided moon icon)
  const moonIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 3 20 19" fill="black" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler-moon">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
    </svg>
  );

  return (
    <div style={toggleStyles.container}>
      <input
        type="checkbox"
        id="toggle"
        style={toggleStyles.input}
        onChange={handleChange}
        checked={isChecked}
      />
      <label htmlFor="toggle" style={toggleStyles.label}>
        <div style={toggleStyles.toggleBackground}>
          <div style={toggleStyles.circle}>
            {isChecked ? moonIcon : sunIcon}
          </div>
        </div>
      </label>
    </div>
  );
};


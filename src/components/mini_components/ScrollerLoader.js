import React from "react";

function ScrollerLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <p>Generating Content...</p>
      <div className="loader"></div>
    </div>
  );
}

export default ScrollerLoader;
import React from "react";
import { useTranslation } from 'react-i18next';

function ScrollerLoader() {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        background: "black",
        zIndex: 9999,
      }}
    >
      <div className="loader"></div>
      <div style={{ marginTop: 24, fontSize: 22, color: "#fff", fontWeight: 600, letterSpacing: 1, textAlign: "center" }}>
        {t("generatingContent")}
      </div>
    </div>
  );
}

export default ScrollerLoader;
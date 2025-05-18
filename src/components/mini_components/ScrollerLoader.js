import React from "react";
import { useTranslation } from 'react-i18next';

function ScrollerLoader() {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <p>{t("generatingContent")}</p>
      <div className="loader"></div>
    </div>
  );
}

export default ScrollerLoader;
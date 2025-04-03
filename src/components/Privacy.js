import React, { useState } from "react";

const PrivacyPolicyPopup = ({ open, setPrivacyOpen }) => {
  const [isOpen, setIsOpen] = useState(open);

  const closePopup = () => {
    setIsOpen(false);
  };

  return (
    <div>
      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <button
              onClick={async () => {
                closePopup();
              }}
              style={styles.closeButton}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={styles.closeIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2>Privacy Policy</h2>
            <p>
              <strong>Last Updated:</strong> 08/30/2024
            </p>

            <p>
              Welcome to Cookr! We value your privacy and are committed to
              protecting your personal information. This Privacy Policy outlines
              how we collect, use, and safeguard your information when you use
              our educational app.
            </p>

            <h3>1. Information We Collect</h3>
            <p>
              <strong>Name and Email:</strong> When you sign up for Cookr, we
              collect your name and email address. This information helps us
              create your account and provide you with personalized services.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>
              We use your name and email for the following purposes:
              <ul>
                <li>
                  <strong>Account Creation and Management:</strong> To create
                  and manage your Cookr account.
                </li>
                <li>
                  <strong>Communication:</strong> To send you updates,
                  newsletters, and other information related to Cookr. You
                  can opt out of these communications at any time.
                </li>
              </ul>
            </p>

            <h3>3. Information Sharing</h3>
            <p>
              We <strong>do not sell, trade, or otherwise transfer</strong> your
              personal information to outside parties. Your information is used
              solely to enhance your experience within the app.
            </p>

            <h3>4. Data Security</h3>
            <p>
              We use third-party database services to handle account information. We also utilize third-party AI services that may use your data to train their model. We implement a variety of security measures to maintain the safety
              of your personal information. However, please note that no method
              of transmission over the internet, or method of electronic
              storage, is 100% secure.
            </p>

            <h3>5. Your Rights</h3>
            <p>
              You have the right to:
              <ul>
                <li>Access and update your personal information.</li>
                <li>
                  Request the deletion of your account and associated data.
                </li>
              </ul>
            </p>

            <h3>6. Changes to This Privacy Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. If we make
              any significant changes, we will notify you by email or through a
              notice within the app.
            </p>

            <h3>7. Contact Us</h3>
            <p>
              If you have any questions or concerns about this Privacy Policy or
              our data practices, please contact us at{" "}
              <strong>Cookrcontact@gmail.com</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  openButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    zIndex: "9900",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "left",
  },
  popup: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "80%",
    overflowY: "auto",
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    top: "15%",
    textAlign:"left"
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  closeIcon: {
    width: "24px",
    height: "24px",
  },
};

export default PrivacyPolicyPopup;
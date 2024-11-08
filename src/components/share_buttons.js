import React, { useState } from 'react';
import {
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  EmailShareButton,
  TelegramShareButton,
  RedditShareButton,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  EmailIcon,
  TelegramIcon,
  RedditIcon,
} from 'react-share';

const ShareButtons = ({ title, body }) => {
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const shareUrl = window.location.href || 'https://example.com'; // Provide a URL for sharing

  const togglePopup = () => {
    setShowPopup(!showPopup); // Toggle popup visibility
  };

  return (
    <div style={{ position: 'relative', marginTop: "10%", padding: "10px", }}>
      {/* Share Icon Button */}
      <i
        onClick={togglePopup}
        style={{
            marginLeft:"20%",
            fontSize:"28px",
            padding: "0px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            // color: isFavorite ? "" : "black", // Darker outline for unfilled heart

        }}
        class="fa-solid fa-share"
      ></i>

      {/* Popup with Share Buttons */}
      {showPopup && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px', // Position the popup above the icon
            left: '-40px',  // Center the popup relative to the icon
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            gap: '10px',
            flexDirection: 'column',
          }}
        >
          <TwitterShareButton url={shareUrl} title={`${title}\n\n${body}`}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>

          <WhatsappShareButton url={shareUrl} title={`${title}\n\n${body}`} separator=":: ">
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>

          <RedditShareButton url={shareUrl} title={`${title}\n\n${body}`}>
            <RedditIcon size={32} round />
          </RedditShareButton>

          <EmailShareButton url={shareUrl} subject={title} body={`URL: ${shareUrl}\n\n${body}`}>
            <EmailIcon size={32} round />
          </EmailShareButton>

          <TelegramShareButton url={shareUrl} title={`${title}\n\n${body}`}>
            <TelegramIcon size={32} round />
          </TelegramShareButton>
        </div>
      )}
    </div>
  );
};

export default ShareButtons;

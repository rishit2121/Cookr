import React, { useEffect } from 'react';

const injectSpinnerStyle = () => {
  if (document.getElementById('spinner-style')) return; // Avoid duplicate styles
  const style = document.createElement('style');
  style.id = 'spinner-style';
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
};

const LoadingIndicator = () => {
  useEffect(() => {
    injectSpinnerStyle();
  }, []); // Run only once

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  const spinnerStyle = {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderLeft: '4px solid #fff',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={overlayStyle}>
      <div style={spinnerStyle}></div>
    </div>
  );
};

export default LoadingIndicator;

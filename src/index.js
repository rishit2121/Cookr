import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';

const startApp = () => {
  console.log("Starting app...");  // Add this
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <HashRouter>
      <App />
    </HashRouter>
  );
};
// Disable all console error and warning messages
console.error = () => {};
console.warn = () => {};

if (window.cordova) {
  console.log("Cordova detected. Waiting for deviceready...");
  document.addEventListener('deviceready', startApp, false);
} else {
  console.log("Cordova not detected. Starting app immediately.");
  startApp();
}




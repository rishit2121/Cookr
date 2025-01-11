// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// New Firebase configuration for the new app
const firebaseConfig = {
  apiKey: "AIzaSyBcAflmvDXqpij4lsHbQvBcEzfH0OmpVDc",
  authDomain: "scroller-study.firebaseapp.com",
  projectId: "scroller-study",
  storageBucket: "scroller-study.firebasestorage.app",
  messagingSenderId: "851981711973",
  appId: "1:851981711973:web:a81c4df819510a2cd8648c",
  measurementId: "G-SKW3ECVBYZ"
};

// Initialize Firebase with the new configuration
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const analytics = getAnalytics(app);

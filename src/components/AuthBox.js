import React, { useState, useEffect} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "./firebase/Firebase";
import { db } from "./firebase/Firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import PrivacyPolicyPopup from "./Privacy";


const AuthBox = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referalCode, setReferalCode] = useState("");
  const [mode, setMode] = useState(0); // 0 for registration, 1 for login
  const [error, setError] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  useEffect(() => {
    // Check the viewport width to determine if it's mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    // Add a resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sendPasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Please Provide a Valid Email");
    }
  };
  
  const register = async () => {
    try {
      console.log(typeof email, typeof password)
      console.log(typeof auth)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('onto verification')
      await sendEmailVerification(user);
      setVerificationMessage("A verification email has been sent to your email address. Please check your inbox.");
      setError(false);
      console.log("User registered, verification email sent:", user);
      localStorage.setItem("email", email);
      navigate("/auth");
    } catch (e) {
      console.error("Error during registration:", e);
      setError(e.message);
    }
  };

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        await auth.signOut();
        setError("Please verify your email before logging in.");
        return;
      }

      const userDocRef = doc(db, "users", email);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const myCode = Math.floor(Math.random() * 1000000000);
        await setDoc(userDocRef, {
          name: user.displayName || "", 
          email: email,
          userType: "student",
          plan: "free",
          myCode: myCode,
          sets: [],
          cards: [],
        });
      }

      console.log("User logged in:", user);
      localStorage.setItem("email", email);
      navigate("/");
    } catch (e) {
      console.error("Error during login:", e);
      setError(e.message);
    }
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      console.log("signing in...");

      const result = await signInWithPopup(auth, provider);
      console.log("User authenticated:", result);

      const user = result.user;
  
      const userDocRef = doc(db, "users", user.email);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        const myCode = Math.floor(Math.random() * 1000000000);
        await setDoc(userDocRef, {
          name: user.displayName || "", 
          email: user.email,
          userType: "student",
          plan: "free",
          myCode: myCode,
          sets: [],
          cards: [],
        });
      }
  
      console.log("User signed in with Google:", user);
      localStorage.setItem("email", user.email);
      navigate("/");
    } catch (e) {
      console.error("Error during Google sign-in:", e);
  
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(e.message);
      }
    }
  };
  

  return (
    <div
      style={{
        backgroundColor: "black",
        color:"gainsboro",
        padding: "30px 30px",
        width: "300px",
        height: "fit-content",
        borderRadius: "10px",
        overflow: "scroll",
      }}
    >
      {error && (
        <div
          style={{
            height: "50px",
            width: "300px",
            backgroundColor: "tomato",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            fontSize: "11px",
          }}
        >
          <p>
            Oops! {mode === 1 ? error : "There was a problem with the account!"}
          </p>
        </div>
      )}
      {verificationMessage && (
        <div
          style={{
            height: "50px",
            width: "300px",
            backgroundColor: "lightgreen",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "50px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              textAlign: "center",
              margin: "1px",
            }}
          >
            {verificationMessage}
          </p>
        </div>
      )}
      <h2>Hi! 👋</h2>
      <form onSubmit={handleSubmit}>
        {mode === 0 && (
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "20px 0px",
              }}
            >
              <label>Name</label>
              <input
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  outline: "1px solid gainsboro",
                  background:"#343434",
                  color:"white"
                }}
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "20px 0px",
          }}
        >
          <label>Your email address</label>
          {mode == 0 && (
            <p style={{ fontSize: "10px", color: "gray" }}>
              A verification email will be sent to this email address
            </p>
          )}
          <input
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              outline: "1px solid gainsboro",
              background:"#343434",
              color:"white"
            }}
            type="email"
            placeholder="johndoe07@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "20px 0px",
          }}
        >
          <div style={{ flexDirection: "row", display: "flex" }}>
            <label>Password</label>
            <div style={{ width: "98%" }}></div>
            {mode !== 0 && (
              <button
                type="button"
                style={{
                  fontSize: "12px",
                  color: "#6A6CFF",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={sendPasswordReset}
              >
                Forgot?
              </button>
            )}
          </div>
          <input
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              outline: "1px solid gainsboro",
              background:"#343434",
              color:"white"
            }}
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {mode === 1 ? (
          <button
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#6A6CFF",
              border: "none",
              color: "white",
              borderRadius: "10px",
              cursor: "pointer",
              marginBottom: "30px",
              boxShadow: "0px 5px #484AC3",
            }}
            type="submit"
            onClick={login}
          >
            Login
          </button>
        ) : (
          <div>
            <p
              style={{
                fontSize: "10px",
                textAlign: "center",
                marginBottom: "10px",
              }}
            >
              By signing up, you agree to our{" "}
              <span
                onClick={async () => setPrivacyOpen(true)}
                style={{ color: "#6A6CFF", cursor: "pointer" }}
              >
                privacy policy
              </span>
              .
              {privacyOpen && (
                <PrivacyPolicyPopup
                  open={privacyOpen}
                />
              )}
            </p>
            <button
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#6A6CFF",
                borderRadius: "10px",
                border: "none",
                color: "white",
                boxShadow: "0px 5px #484AC3",
                cursor: "pointer",
              }}
              type="submit"
              onClick={register}
            >
              Sign Up
            </button>
          </div>
        )}

        <br />
        {/* <p style={{ fontSize: "14px", margin: "10px 0px" }}>or</p> */}
        <hr></hr>
        <br></br>
        <button
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "white",
            border: "none",
            color: "black",
            borderRadius: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0px 5px gainsboro",
          }}
          onClick={googleSignIn}
        >
          <img
            src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
            style={{
              width: "5%",
              height: "5%",
              scale: "2",
              marginRight: "10px",
            }}
          ></img>
          Continue With Google
        </button>

        {mode === 1 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: "14px", margin: "30px 10px" }}>
              New to Cookr?
            </p>
            <p
              style={{ fontSize: "14px", cursor: "pointer", color: "#6A6CFF" }}
              onClick={() => setMode(0)}
            >
              Sign Up
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: "14px", margin: "30px 10px" }}>
              Already a member?
            </p>
            <p
              style={{ fontSize: "14px", cursor: "pointer", color: "#6A6CFF" }}
              onClick={() => setMode(1)}
            >
              Log in
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default AuthBox;

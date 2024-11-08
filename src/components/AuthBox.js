import React, { useState } from "react";
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

const AuthBox = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referalCode, setReferalCode] = useState("");
  const [mode, setMode] = useState(0); // 0 for registration, 1 for login
  const [error, setError] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
      const result = await signInWithPopup(auth, provider);
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
        backgroundColor: "white",
        padding: "20px 70px",
        width: "300px",
        height: "fit-content",
        borderRadius: "10px",
        boxShadow: "0px 1px 1px 1px gainsboro",
        marginBottom: "100px",
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
          }}
        >
          <p style={{padding:'10px', textAlign:'center'}}>
            Oops! There was a problem with the account!
          </p>
        </div>
      )}
      {verificationMessage && 
      <div style={{
            height: "50px",
            width: "300px",
            backgroundColor: "lightgreen",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{fontSize:"13px", textAlign:'center', margin:'1px'}}>{verificationMessage}</p>
      </div>}
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
                }}
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "20px 0px",
              }}
            >
              <label>Referral Code</label>
              <input
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  outline: "1px solid gainsboro",
                }}
                type="text"
                placeholder="Enter the 10 Digit Referral Code"
                value={referalCode}
                onChange={(e) => setReferalCode(e.target.value)}
                maxLength="10"
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
          <input
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              outline: "1px solid gainsboro",
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
              <textbutton onClick={sendPasswordReset}>
                <p style={{ fontSize: "12px", color: "orange", textAlign: "center", justifyContent: "center", alignItems: "center", height: "100%" }}>Forgot?</p>
              </textbutton>
            )}
          </div>
          <input
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              outline: "1px solid gainsboro",
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
              backgroundColor: "black",
              border: "none",
              color: "white",
              borderRadius: "100px",
              cursor: "pointer",
            }}
            type="submit"
            onClick={async () => login()}
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
              By signing up, you agree to our privacy policy
            </p>
            <button
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "black",
                border: "none",
                color: "white",
                borderRadius: "100px",
                cursor: "pointer",
              }}
              type="submit"
              onClick={async () => register()}
            >
              Register
            </button>
          </div>
        )}
      </form>

      <div style={{display:'flex', marginTop: "20px", textAlign: "center", alignItems:'center', justifyContent:'center', width:'100%' }}>
  {/* <p style={{ fontSize: "14px", margin: "10px 0px" }}>or</p> */}
  <button
    style={{
      width: "80%",
      padding: "10px",
      backgroundColor: "black",
      border: "none",
      color: "white",
      borderRadius: "10px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    onClick={googleSignIn}
  >
    <img 
      src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
      style={{
        width: "10%",
        height: "10%",
        marginRight: "10px",
      }}
    >
    </img>
    Continue With Google
  </button>
  </div>


      <p
        style={{
          fontSize: "14px",
          textAlign: "center",
          marginTop: "20px",
          cursor: "pointer",
        }}
        onClick={() => {
          setMode(mode === 0 ? 1 : 0);
          setError(false);
        }}
              >
        {mode === 0 ? "Have an account already? Log In" : "New here? Create an account"}
      </p>
    </div>
  );
};

export default AuthBox;

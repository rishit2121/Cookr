import Bottom from "../components/BottomNav";
import CustomDropdown from "../components/Dropdown";
import Navbar from "../components/Navbar";
import Scroller from "../components/Scroller";
import { useState, useEffect, useRef } from "react";
import { doc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { db } from "../components/firebase/Firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import './HomePage.css'; // You can create a separate CSS file for styling
import profileImage from '../assets/profile.png'; // Adjust the path as needed
import Text from '../assets/text.png'; // Adjust the path as needed
import Desmos from 'desmos'; // You need to install Desmos or load via CDN
import { auth, signInWithGoogle, logOut } from "../components/firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import HomeScreenTutorial from "../components/mini_components/HomeScreenTutorial";
import ScrollerLogInHomeScreen from "../components/mini_components/ScrollerLogInHomeScreen";
import { useTranslation } from 'react-i18next';




function Home() {
  const { t } = useTranslation();
  const [streak, setStreak] = useState(
    localStorage.getItem("streak")
      ? parseInt(localStorage.getItem("streak"))
      : 0
  );
  // const [featured, setFeatured] = useState(
  //   localStorage.getItem("featured")
  //     ? JSON.parse(localStorage.getItem("featured"))
  //     : [] // Default value if nothing is in localStorage
  // );
  const [showCalculator, setShowCalculator] = useState(false);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const calculatorRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });
  const [loading, setLoading] = useState(true);
const [user, setUser] = useState(null);

useEffect(() => {
  // Listen for authentication state changes
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      // User is logged in
      setUser(currentUser.email);
    } else {
      // User is logged out
      setUser(null);
    }
    setLoading(false); // Auth state resolved
  });

  return () => unsubscribe(); // Cleanup listener
}, []);


  // Sync dark mode with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);
  const [xp, setXP] = useState(
    localStorage.getItem("xp") ? parseInt(localStorage.getItem("xp")) : 0
  );
  const [sets, setSets] = useState();
  const [currentSet, setCurrentSet] = useState(
    localStorage.getItem("currentSet")
      ? JSON.parse(localStorage.getItem("currentSet"))
      : null
  );
  const navigate = useNavigate();
  const [mobileDimension, setMobileDimension] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false); // State for expanding tools
  const handleLoginClick = () => {
    navigate("/auth")
  };
  useEffect(() => {
    let calculator;
    if (showCalculator && calculatorRef.current) {
      const elt = calculatorRef.current;
      calculator = Desmos.GraphingCalculator(elt, {
        keypad: true, 
        expressions: true
      });
    }
    return () => {
      if (calculator) {
        calculator.destroy();
      }
    };
  }, [showCalculator]);
  useEffect(() => {
  });
  const faqData = [
    {
        question: "What is Scroller?",
        answer: "Scroller is a platform designed for interactive studying, similar to TikTok. Students can create subjects, upload their own lecture notes, and contribute to an infinite feed of multiple-choice questions based on those subjects. This dynamic approach makes studying more engaging and personalized. Users can also save questions for later review to aid their learning process."
    },
    {
      question: "Is Scroller free to use?",
      answer: "YES! Scroller is completely free to use. All features and content are accessible at no cost, allowing students to benefit from the platform without any financial commitment."
  },
    {
        question: "How do I get started with Scroller?",
        answer: "To get started, visit the Scroller website and sign up with your email or Google account. After creating an account, you can start creating subjects and uploading your own study materials. You can also browse the feed of multiple-choice questions related to various topics, making your study sessions more interactive."
    },
    {
        question: "Is Scroller available as a mobile app?",
        answer: "Currently, Scroller does not have a mobile app. However, the website is fully optimized for mobile use, so you can access all features and functionalities from your mobile browser."
    },
    {
        question: "What types of content can I find on Scroller?",
        answer: "Scroller offers a variety of content through an interactive feed of multiple-choice questions based on subjects created by users. You can find content related to any study topic, including vocabulary and other academic areas, all generated from your uploaded materials."
    },
    {
        question: "How can I contact customer support?",
        answer: "For support, please email us at scrollercontact@gmail.com. Our team is available to assist with any questions or issues you may have regarding the platform."
    },
];


  useEffect(() => {
    localStorage.setItem("streak", streak);
    // localStorage.setItem('featured', JSON.stringify(featured));
    localStorage.setItem("xp", xp);
    localStorage.setItem("sets", JSON.stringify(sets));
  }, [streak, xp, sets]);

  useEffect(() => {
    try {
      if (user) {
        const document = onSnapshot(
          doc(db, "users", user),
          (doc) => {
            setSets(doc.data().sets);
          }
        );
      }
    } catch (error) {
      alert("Error");
    }
  }, [user]);
  // useEffect(() => {
  //   const unsubscribe = onSnapshot(doc(db, "sets", "featured"), (doc) => {
  //     const data = doc.data()?.sets || [];
  //     setFeatured(data);
  //     localStorage.setItem('featured', JSON.stringify(data)); // Save valid JSON
  //   });
  
  //   return () => unsubscribe();
  // }, []);
  
  const [activeIndex, setActiveIndex] = useState(null);

    const toggleAnswer = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
      <div
        className="App"
        style={{ display: "flex", height: "100dvh", overflow: "hidden" }}
      >
        {<Navbar setMobileDimension={setMobileDimension} />}
        {localStorage.getItem("email") ? (
          <div
            style={{
              flex: 1,
              padding: "0px",
              overflowY: "auto",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "black",
              color: "white",
            }}
          >
            {/* {mobileDimension && (
              <div
                style={{
                  background: "black",
                  width: "100%",
                  height: "40px",
                  position: "absolute",
                  top: "0px",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  zIndex: "10000000",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={16} fill="white">
                  <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" />
                </svg>
                <p style={{ margin: "0px", fontSize: "14px" }}>Library</p>
                <p style={{ margin: "0px", fontSize: "14px" }}>Cook</p>
              </div>
            )}
   */}
            {currentSet ? (
              <div
                style={{
                  width: "100%",
                  height: "100dvh",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Scroller
                  setStreak={setStreak}
                  setXP={setXP}
                  currentSet={currentSet}
                  mobileDimension={mobileDimension}
                />
              </div>
            ) : user && !currentSet ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p style={{}}>{t("pickASubject")}</p>
              </div>
            ) : (
              <HomeScreenTutorial></HomeScreenTutorial>
            )}
            <Bottom
              streak={streak}
              currentPage={'home'}
              xp={xp}
              sets={sets}
              currentSet={currentSet}
              setCurrentSet={setCurrentSet}
              mobileDimension={mobileDimension}
            />
          </div>
        ) : (
          <ScrollerLogInHomeScreen mobileDimension={mobileDimension} />
        )}
      </div>
    );
  }

export default Home;

// {/* <div className="home-page">
//       <nav className="navbar">
//         <ul className="nav-links">
//           <li>Home</li>
//           <li>About</li>
//           <li>Services</li>
//           <li onClick={ handleLoginClick} className="login-button">Login</li>
//         </ul>
//       </nav>
//       <div className="top-box">
//         <h1 className="scroller-text">Scroller</h1>
//         <p className="subtext">The Only Educational Alternative For Tik-Tok
//         </p>
//         <div className="button-row">
//       <button className="button get-started">Get Started</button>
//       <button className="button learn-more">Learn More</button>
//     </div>
//         <img src={profileImage} alt="Profile" className="profile-image" />
//       </div>

//       <div className="white-container">
//     <div className="section">
//       <div className="section-icon">🌟</div> {/* Replace with your icon */}
//       <div className="section-title">Easy To Use</div>
//       <div className="section-body">Dive into learning with ease—Scroller’s user-friendly design makes creating and managing study content a breeze. Whether you're a student or an educator, crafting questions and exploring subjects is as simple as a few clicks.</div>
//     </div>
//     <div className="section">
//       <div className="section-icon">🚀</div> {/* Replace with your icon */}
//       <div className="section-title">Unlimited Subjects</div>
//       <div className="section-body">Explore the boundless possibilities with Scroller. From algebra to zoology, our AI-powered platform offers an endless stream of questions across every subject, ensuring comprehensive coverage and endless learning opportunities.</div>
//     </div>
//     <div className="section">
//       <div className="section-icon">💡</div> {/* Replace with your icon */}
//       <div className="section-title">A Great Addiction</div>
//       <div className="section-body">Experience the excitement of continuous discovery. Scroller transforms studying into a dynamic adventure, where each question unlocks new insights and fuels a passion for knowledge.</div>
//     </div>
//   </div>
//   <div className="page-container">
//             <h1 className="page-title">How it Works</h1>
//             <p className="page-subtitle">The Perfect Way to Learn Quickly While Scrolling</p>
//             <div style={{height:"50px"}}></div>
//             <div className="container">
//             <div className="image-placeholder"></div>
//             <div className="text-content">
//                 <p style={{
//                 font: "caption",
//                 fontSize: "16px",
//                 fontFamily: "Arial", 
//                 fontStretch: "condensed", 
//                 border: "2px solid #000", 
//                 borderRadius: "5%", 
//                 padding: "5px", 
//                 display: "inline-block", 
//                 textAlign: "center"
//             }}>
//                 01 Create
//             </p>
//                 <div style={{height:"5vh"}}></div>
//                 <h2 className="text-title">Quickly Make Any Subject</h2>
//                 <div style={{height:"1vh"}}></div>
//                 <p className="text-subtitle">Tell Scroller what you want to learn about by simply providing a subject description. You can also input notes, to review a class or lecture.</p>
//             </div>
            
//         </div>
//         <div style={{height:"60px"}}></div>
//         <div className="container">
//             <div className="text-content">
//             <p style={{
//             font: "caption",
//             fontSize: "16px",
//             fontFamily: "Arial", 
//             fontStretch: "condensed", 
//             border: "2px solid #000", 
//             borderRadius: "5%", 
//             padding: "5px", 
//             display: "inline-block", 
//             textAlign: "center"
//         }}>
//             02 Scroll!
//         </p>
//                 <div style={{height:"4vh"}}></div>
//                 <h2 className="text-title">Scroll Through Questions</h2>
//                 <div style={{height:"1vh"}}></div>
//                 <p className="text-subtitle">Effortlessly explore a stream of thoughtfully crafted questions tailored to your studies. With Scroller, every swipe brings you closer to mastering your subject, turning learning into a dynamic and interactive experience.</p>
//             </div>
//             <div className="image-placeholder"></div>
            
//         </div>
//         <div style={{height:"60px"}}></div>
//         <div className="container">
//             <div className="image-placeholder"></div>
//             <div className="text-content">
//                 <p style={{
//                 font: "caption",
//                 fontSize: "16px",
//                 fontFamily: "Arial", 
//                 fontStretch: "condensed", 
//                 border: "2px solid #000", 
//                 borderRadius: "5%", 
//                 padding: "5px", 
//                 display: "inline-block", 
//                 textAlign: "center"
//             }}>
//                 03 Additional
//             </p>
//                 <div style={{height:"4vh"}}></div>
//                 <h2 className="text-title">Explore Many More Features</h2>
//                 <div style={{height:"1vh"}}></div>
//                 <p className="text-subtitle">Unlock a world of possibilities with Scroller. Save and share your favorite questions to revisit later, or instantly review your answers and see where you went wrong. Plus, you can also take custom quizzes tailored to your study needs.</p>
//             </div>
            
//         </div>
//         </div>
//         <div className="faq-page">
//             <h1 className="faq-title">Frequently Asked Questions</h1>
//             {faqData.map((item, index) => (
//                 <div key={index} className="faq-section">
//                     <div
//                         className={`question ${activeIndex === index ? 'active' : ''}`}
//                         onClick={() => toggleAnswer(index)}
//                     >
//                         {item.question}
//                     </div>
//                     <div className="answer" style={{ display: activeIndex === index ? 'block' : 'none' }}>
//                         {item.answer}
//                     </div>
//                     {index < faqData.length - 1 && <div className="divider"></div>}
//                     <div style={{height:"20px"}}></div>
//                 </div>
        
//             ))}
//         </div>
//         <div className="get-started-section">
//           <h2 className="get-started-title">Ready To Get Started?</h2>
//           <p className="get-started-subtitle">Join us today and transform the way you study with interactive content and endless learning opportunities.</p>
//           <button className="get-started-button">Get Started</button>
//       </div>
//       <div className="footer">
//     <div className="footer-content">
//         <div className="footer-column">
//             <img style={{scale:'2'}} src={Text} alt="Scroller Logo" />
//             <p style={{color:"black"}}>Helping A World Where Education Comes First</p>
//             <div style={{height:'20px'}}></div>
//             <div className="social-buttons">
//     <a href="https://www.instagram.com/scroller.app/" target="_blank" rel="noopener noreferrer" className="social-button">
//         <i className="fab fa-instagram"></i>
//     </a>
//     <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-button">
//         <i className="fab fa-facebook-f"></i>
//     </a>
//     <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-button">
//         <i className="fab fa-linkedin-in"></i>
//     </a>
// </div>

//         </div>
//         <div className="footer-column">
//             <h3>Company</h3>
//             <p><a href="/">About Us</a></p>
//             <p><a href="/">News</a></p>
//             <p><a href="/">Contact Us</a></p>
//             <p><a href="/">Meet Our Team</a></p>
//         </div>
//         <div className="footer-column">
//             <h3>Support</h3>
//             <p><a href="/">Knowledge Base</a></p>
//             <p><a href="/">Contact Support</a></p>
//             <p><a href="/privacy-policy">Privacy Policy</a></p>
//             <p><a href="/terms-of-service">TOS</a></p>
//         </div>
//     </div>
//     <div style={{height:"30px"}}></div>
//     <div className="footer-bottom">
//         <p>© 2024 · Scroller · All rights reserved</p>
//     </div>
// </div>


//   <div className="content">
//     {/* Other sections of your homepage */}
//   </div>

//     </div> */}

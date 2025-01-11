import Bottom from "../components/Bottom";
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





function Home() {
  const [streak, setStreak] = useState(
    localStorage.getItem("streak")
      ? parseInt(localStorage.getItem("streak"))
      : 0
  );
  const [featured, setFeatured] = useState(
    localStorage.getItem("featured")
      ? JSON.parse(localStorage.getItem("featured"))
      : [] // Default value if nothing is in localStorage
  );
  const [showCalculator, setShowCalculator] = useState(false);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const calculatorRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the initial dark mode state from localStorage, default to false
    return localStorage.getItem("darkMode") === "true";
  });

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
    console.log(sets);
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
    localStorage.setItem('featured', JSON.stringify(featured));
    localStorage.setItem("xp", xp);
    localStorage.setItem("sets", JSON.stringify(sets));
  }, [streak, xp, sets, featured]);

  useEffect(() => {
    try {
      if (localStorage.getItem("email")) {
        const document = onSnapshot(
          doc(db, "users", localStorage.getItem("email")),
          (doc) => {
            setSets(doc.data().sets);
            console.log(sets);
          }
        );
      }
    } catch (error) {
      alert("Error");
    }
  }, []);
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "sets", "featured"), (doc) => {
      const data = doc.data()?.sets || [];
      setFeatured(data);
      localStorage.setItem('featured', JSON.stringify(data)); // Save valid JSON
    });
  
    return () => unsubscribe();
  }, []);
  
  const [activeIndex, setActiveIndex] = useState(null);

    const toggleAnswer = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

  return (
    <div
      className="App"
      style={{ display: "flex", height: "100vh", overflow: "hidden",}}
    >
      {localStorage.getItem("email") ? (<Navbar setMobileDimension={setMobileDimension} />):<div></div>}

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
            backgroundColor: isDarkMode ? "black": "whitesmoke"
          }}
        >
          {currentSet ? (
           
           <div style={{ position: 'relative', width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
      {/* Demos Calculator Button/Icon */}
      {isToolsOpen && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '10px',
            backgroundColor: 'black',
            // padding: '10px',
            borderRadius: '25px',
            width:'50%', // change back 50%
            height:"6.7%",
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            // justifyContent:'center',
            overflow:'hidden',

          }}
        >
      <button 
        style={{
          // position: 'absolute',
          // marginTop:'30%',
          // padding: '10px',
          backgroundColor: 'black',
          color: '#fff',
          marginLeft:'15%',
          border: 'none',
          borderRadius: '50%',
          width:'6.7%',
          height: '6.7%',
          cursor: 'pointer',
          fontSize:'20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => setShowCalculator(true)}
      >
        <i class="fa-solid fa-calculator"></i>
      </button>
      <button
        style={{
          // position: 'absolute',
          // marginTop:'70%',
          // padding: '10px',
          backgroundColor: 'black',
          color: '#fff',
          marginLeft:'15%',
          border: 'none',
          borderRadius: '50%',
          width:'6.7%',
          height: '6.7%',
          cursor: 'pointer',
          display: 'flex',
          fontSize:'20px',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => setShowPeriodicTable(true)}
      >
        <i class="fa-solid fa-flask-vial"></i>
      </button>
      </div>
      )}
      <button
        style={{
          width:'6.7%',
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '10px 20px',
          backgroundColor: 'black',
          color: '#fff',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => setIsToolsOpen(!isToolsOpen)} // Toggle tools visibility
      >
        Tools
      </button>
      
      

      {/* Existing Content */}
      <Scroller
        setStreak={setStreak}
        setXP={setXP}
        currentSet={currentSet}
      />

      {/* Calculator Modal */}

      {showCalculator && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0, // Aligning to the right
          width: '60vw', // Reduced size
          right: '20px', // Moves the calculator to the left of the red button
          top:'15px',
          height: '80vh', // Reduced height
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Shadow for better visibility
          zIndex: 1000, // Ensure it's above other elements
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Close Button */}
          <button
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              marginBottom:'20px',
              marginTop:'20px',
              marginRight:'10px',
              backgroundColor: 'red',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              // fontSize:'30px'
            }}
            onClick={() => setShowCalculator(false)}
          >
            &times;
          </button>

          {/* Desmos Calculator */}
          <div ref={calculatorRef} style={{ width: '100%', height: '100%', marginRight:'40px' }}></div>
        </div>
      )}
            {showPeriodicTable && (
        <div style={{
          position: 'fixed',
          top: '15px',
          right:'20px',
          borderRadius: '8px',
          backgroundColor: 'white',
          display: 'flex',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          // justifyContent: 'center',
          // alignItems: 'center',
          marginLeft:'20%'
        }}>
          <div style={{
            width: '60vw', // Adjust the size
            height: '60vh',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'red',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onClick={() => setShowPeriodicTable(false)}
            >
              &times;
            </button>

            {/* Periodic Table Image */}
            <img
              src="https://pubchem.ncbi.nlm.nih.gov/periodic-table/Periodic_Table.png"
              alt="Periodic Table"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}

    </div>
          ) : (sets && sets.length) > 0 && !currentSet ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p style={{color: isDarkMode ? "white": "black"}}>Pick a subject to get started with your session!</p>
            </div>
          ) : (
            <p style={{ textAlign: "center", width: "50%", color: isDarkMode ? "white": "black"}}>
              Welcome to Scroller! To get started, add a new subject in{" "}
              <span>
                <svg
                  fill={isDarkMode ? "#ffffff" : "#000000"}
                  width="20px"
                  height="20px"
                  viewBox="0 0 32 32"
                  version="1.1"
                  xmlns="https://www.w3.org/2000/svg"
                  style={{margin:"0px 10px"}}
                >
                  <path d="M30.156 26.492l-6.211-23.184c-0.327-1.183-1.393-2.037-2.659-2.037-0.252 0-0.495 0.034-0.727 0.097l0.019-0.004-2.897 0.776c-0.325 0.094-0.609 0.236-0.86 0.42l0.008-0.005c-0.49-0.787-1.349-1.303-2.33-1.306h-2.998c-0.789 0.001-1.5 0.337-1.998 0.873l-0.002 0.002c-0.5-0.537-1.211-0.873-2-0.874h-3c-1.518 0.002-2.748 1.232-2.75 2.75v24c0.002 1.518 1.232 2.748 2.75 2.75h3c0.789-0.002 1.5-0.337 1.998-0.873l0.002-0.002c0.5 0.538 1.211 0.873 2 0.875h2.998c1.518-0.002 2.748-1.232 2.75-2.75v-16.848l4.699 17.54c0.327 1.182 1.392 2.035 2.656 2.037h0c0.001 0 0.003 0 0.005 0 0.251 0 0.494-0.034 0.725-0.098l-0.019 0.005 2.898-0.775c1.182-0.326 2.036-1.392 2.036-2.657 0-0.252-0.034-0.497-0.098-0.729l0.005 0.019zM18.415 9.708l5.31-1.423 3.753 14.007-5.311 1.422zM18.068 3.59l2.896-0.776c0.097-0.027 0.209-0.043 0.325-0.043 0.575 0 1.059 0.389 1.204 0.918l0.002 0.009 0.841 3.139-5.311 1.423-0.778-2.905v-1.055c0.153-0.347 0.449-0.607 0.812-0.708l0.009-0.002zM11.5 2.75h2.998c0.69 0.001 1.249 0.56 1.25 1.25v3.249l-5.498 0.001v-3.25c0.001-0.69 0.56-1.249 1.25-1.25h0zM8.75 23.25h-5.5v-14.5l5.5-0.001zM10.25 8.75l5.498-0.001v14.501h-5.498zM4.5 2.75h3c0.69 0.001 1.249 0.56 1.25 1.25v3.249l-5.5 0.001v-3.25c0.001-0.69 0.56-1.249 1.25-1.25h0zM7.5 29.25h-3c-0.69-0.001-1.249-0.56-1.25-1.25v-3.25h5.5v3.25c-0.001 0.69-0.56 1.249-1.25 1.25h-0zM14.498 29.25h-2.998c-0.69-0.001-1.249-0.56-1.25-1.25v-3.25h5.498v3.25c-0.001 0.69-0.56 1.249-1.25 1.25h-0zM28.58 27.826c-0.164 0.285-0.43 0.495-0.747 0.582l-0.009 0.002-2.898 0.775c-0.096 0.026-0.206 0.041-0.319 0.041-0.575 0-1.060-0.387-1.208-0.915l-0.002-0.009-0.841-3.14 5.311-1.422 0.841 3.14c0.027 0.096 0.042 0.207 0.042 0.321 0 0.23-0.063 0.446-0.173 0.63l0.003-0.006z"></path>
                </svg>
                My Library
              </span>
            </p>
          )}
          <Bottom
            streak={streak}
            xp={xp}
            sets={sets}
            currentSet={currentSet}
            setCurrentSet={setCurrentSet}
            mobileDimension={mobileDimension}
          />
        </div>
      ) : (
        <div className="home-page">
      <nav className="navbar">
        <ul className="nav-links">
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li onClick={ handleLoginClick} className="login-button">Login</li>
        </ul>
      </nav>
      <div className="top-box">
        <h1 className="scroller-text">Scroller</h1>
        <p className="subtext">The Only Educational Alternative For Tik-Tok
        </p>
        <div className="button-row">
      <button className="button get-started">Get Started</button>
      <button className="button learn-more">Learn More</button>
    </div>
        <img src={profileImage} alt="Profile" className="profile-image" />
      </div>

      <div className="white-container">
    <div className="section">
      <div className="section-icon">🌟</div> {/* Replace with your icon */}
      <div className="section-title">Easy To Use</div>
      <div className="section-body">Dive into learning with ease—Scroller’s user-friendly design makes creating and managing study content a breeze. Whether you're a student or an educator, crafting questions and exploring subjects is as simple as a few clicks.</div>
    </div>
    <div className="section">
      <div className="section-icon">🚀</div> {/* Replace with your icon */}
      <div className="section-title">Unlimited Subjects</div>
      <div className="section-body">Explore the boundless possibilities with Scroller. From algebra to zoology, our AI-powered platform offers an endless stream of questions across every subject, ensuring comprehensive coverage and endless learning opportunities.</div>
    </div>
    <div className="section">
      <div className="section-icon">💡</div> {/* Replace with your icon */}
      <div className="section-title">A Great Addiction</div>
      <div className="section-body">Experience the excitement of continuous discovery. Scroller transforms studying into a dynamic adventure, where each question unlocks new insights and fuels a passion for knowledge.</div>
    </div>
  </div>
  <div className="page-container">
            <h1 className="page-title">How it Works</h1>
            <p className="page-subtitle">The Perfect Way to Learn Quickly While Scrolling</p>
            <div style={{height:"50px"}}></div>
            <div className="container">
            <div className="image-placeholder"></div>
            <div className="text-content">
                <p style={{
                font: "caption",
                fontSize: "16px",
                fontFamily: "Arial", 
                fontStretch: "condensed", 
                border: "2px solid #000", 
                borderRadius: "5%", 
                padding: "5px", 
                display: "inline-block", 
                textAlign: "center"
            }}>
                01 Create
            </p>
                <div style={{height:"5vh"}}></div>
                <h2 className="text-title">Quickly Make Any Subject</h2>
                <div style={{height:"1vh"}}></div>
                <p className="text-subtitle">Tell Scroller what you want to learn about by simply providing a subject description. You can also input notes, to review a class or lecture.</p>
            </div>
            
        </div>
        <div style={{height:"60px"}}></div>
        <div className="container">
            <div className="text-content">
            <p style={{
            font: "caption",
            fontSize: "16px",
            fontFamily: "Arial", 
            fontStretch: "condensed", 
            border: "2px solid #000", 
            borderRadius: "5%", 
            padding: "5px", 
            display: "inline-block", 
            textAlign: "center"
        }}>
            02 Scroll!
        </p>
                <div style={{height:"4vh"}}></div>
                <h2 className="text-title">Scroll Through Questions</h2>
                <div style={{height:"1vh"}}></div>
                <p className="text-subtitle">Effortlessly explore a stream of thoughtfully crafted questions tailored to your studies. With Scroller, every swipe brings you closer to mastering your subject, turning learning into a dynamic and interactive experience.</p>
            </div>
            <div className="image-placeholder"></div>
            
        </div>
        <div style={{height:"60px"}}></div>
        <div className="container">
            <div className="image-placeholder"></div>
            <div className="text-content">
                <p style={{
                font: "caption",
                fontSize: "16px",
                fontFamily: "Arial", 
                fontStretch: "condensed", 
                border: "2px solid #000", 
                borderRadius: "5%", 
                padding: "5px", 
                display: "inline-block", 
                textAlign: "center"
            }}>
                03 Additional
            </p>
                <div style={{height:"4vh"}}></div>
                <h2 className="text-title">Explore Many More Features</h2>
                <div style={{height:"1vh"}}></div>
                <p className="text-subtitle">Unlock a world of possibilities with Scroller. Save and share your favorite questions to revisit later, or instantly review your answers and see where you went wrong. Plus, you can also take custom quizzes tailored to your study needs.</p>
            </div>
            
        </div>
        </div>
        <div className="faq-page">
            <h1 className="faq-title">Frequently Asked Questions</h1>
            {faqData.map((item, index) => (
                <div key={index} className="faq-section">
                    <div
                        className={`question ${activeIndex === index ? 'active' : ''}`}
                        onClick={() => toggleAnswer(index)}
                    >
                        {item.question}
                    </div>
                    <div className="answer" style={{ display: activeIndex === index ? 'block' : 'none' }}>
                        {item.answer}
                    </div>
                    {index < faqData.length - 1 && <div className="divider"></div>}
                    <div style={{height:"20px"}}></div>
                </div>
        
            ))}
        </div>
        <div className="get-started-section">
          <h2 className="get-started-title">Ready To Get Started?</h2>
          <p className="get-started-subtitle">Join us today and transform the way you study with interactive content and endless learning opportunities.</p>
          <button className="get-started-button">Get Started</button>
      </div>
      <div className="footer">
    <div className="footer-content">
        <div className="footer-column">
            <img style={{scale:'2'}} src={Text} alt="Scroller Logo" />
            <p style={{color:"black"}}>Helping A World Where Education Comes First</p>
            <div style={{height:'20px'}}></div>
            <div className="social-buttons">
    <a href="https://www.instagram.com/scroller.app/" target="_blank" rel="noopener noreferrer" className="social-button">
        <i className="fab fa-instagram"></i>
    </a>
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-button">
        <i className="fab fa-facebook-f"></i>
    </a>
    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-button">
        <i className="fab fa-linkedin-in"></i>
    </a>
</div>

        </div>
        <div className="footer-column">
            <h3>Company</h3>
            <p><a href="/">About Us</a></p>
            <p><a href="/">News</a></p>
            <p><a href="/">Contact Us</a></p>
            <p><a href="/">Meet Our Team</a></p>
        </div>
        <div className="footer-column">
            <h3>Support</h3>
            <p><a href="/">Knowledge Base</a></p>
            <p><a href="/">Contact Support</a></p>
            <p><a href="/privacy-policy">Privacy Policy</a></p>
            <p><a href="/terms-of-service">TOS</a></p>
        </div>
    </div>
    <div style={{height:"30px"}}></div>
    <div className="footer-bottom">
        <p>© 2024 · Scroller · All rights reserved</p>
    </div>
</div>


  <div className="content">
    {/* Other sections of your homepage */}
  </div>

    </div>

        
      )}
    </div>
  );
}

export default Home;

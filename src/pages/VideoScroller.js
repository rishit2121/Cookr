import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";

// Card data
const cardData = [
  {
    card: [
      {
        text: "Sustainable water management is essential for ensuring access to clean water and protecting water resources.",
        image_keyword: "water droplets, river, reservoir",
        image_url:
          "https://tse2.mm.bing.net/th/id/OIP.eY4XCaPcQiMevhHwl0WICAHaJ4?w=135&h=180&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "Conserving water through efficient irrigation techniques, reducing leaks, and promoting water-wise landscaping is crucial.",
        image_keyword: "sprinkler, leaky faucet, drought-tolerant plants",
        image_url:
          "https://tse1.mm.bing.net/th/id/OIP.FpvrIi7xEE9z8Xv2J-HhoQHaFj?w=211&h=180&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "Water treatment and wastewater management systems play a vital role in ensuring safe drinking water and preventing pollution.",
        image_keyword:
          "water treatment plant, wastewater pipe, clean water glass",
        image_url:
          "https://tse1.mm.bing.net/th/id/OIP.JKrfDYQtPgEMjWwcXQEPAQHaE7?w=182&h=180&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "Sustainable water management practices promote responsible use, protect ecosystems, and ensure water security for future generations.",
        image_keyword:
          "water conservation, healthy river, family drinking water",
        image_url:
          "https://tse4.mm.bing.net/th/id/OIP.whugXn6ifEDy-KhzxlbWRQHaEo?w=255&h=180&c=7&r=0&o=5&pid=1.7",
      },
    ],
  },
  {
    card: [
      {
        text: "Evolution is the process of change over time. ",
        image_keyword: "evolution",
        image_url:
          "https://tse1.mm.bing.net/th/id/OIP.maa-gWqYQd6hDYgHoXa8QQHaFj?w=203&h=180&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "It is the unifying theory of biology. ",
        image_keyword: "natural selection",
        image_url:
          "https://tse2.mm.bing.net/th/id/OIP.hMpvGb_wPYc-L56xeIo-ZwAAAA?w=292&h=175&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "Natural selection is the driving force of evolution. ",
        image_keyword: "adaptation",
        image_url:
          "https://tse2.mm.bing.net/th/id/OIP.FVkOtGeln9OiLijsTGfXUwHaE7?w=223&h=180&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "It favors individuals with traits that increase their survival and reproduction. ",
        image_keyword: "fitness",
        image_url:
          "https://tse2.mm.bing.net/th/id/OIP.3wnkR3I-DJDpT8rSsC3lHQHaKd?w=194&h=274&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "Over time, populations evolve through genetic changes. ",
        image_keyword: "speciation",
        image_url:
          "https://tse2.mm.bing.net/th/id/OIP.YgK8aZ-i1g4Kv-s7kvE7YwHaFU?w=229&h=180&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "Speciation is the formation of new species. ",
        image_keyword: "phylogeny",
        image_url:
          "https://tse2.mm.bing.net/th/id/OIP.iOco6l-YNcEolptbf6fUZQHaE8?w=271&h=181&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "Phylogenetic trees illustrate evolutionary relationships. ",
        image_keyword: "evolutionary tree",
        image_url:
          "https://tse4.mm.bing.net/th/id/OIP.z_G3fKwN3xu1dct7Li75SgHaE6?w=225&h=180&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "The evidence for evolution comes from various sources, including fossil records, anatomical similarities, and molecular data. ",
        image_keyword: "evidence of evolution",
        image_url:
          "https://tse4.mm.bing.net/th/id/OIP.yHJ8eeBomSXGdUBhTKUxyQHaDX?w=264&h=159&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "Evolution is a complex process that continues to shape life on Earth. ",
        image_keyword: "life on Earth",
        image_url:
          "https://tse4.mm.bing.net/th/id/OIP.vtmbuOz5n7TLedB0YWo0wAHaJQ?w=194&h=243&c=7&r=0&o=5&pid=1.7",
      },
      {
        text: "Understanding evolution is crucial for comprehending the diversity and interconnectedness of life. ",
        image_keyword: "biodiversity",
        image_url:
          "https://tse1.mm.bing.net/th/id/OIP.D3ivM1CXvqDn4hZ7xgOGYwHaFC?w=274&h=187&c=7&r=0&o=5&pid=1.7",
      },
    ],
  },
];

const containerStyle = {
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    alignItems: "center",
    scrollSnapType: "y mandatory",  // Enables vertical snap scrolling
    height:'100vh',
  };
  

const cardContainerStyle = {
    display:'flex',
    scrollSnapAlign: "start",  // Adjusts the scroll snapping point
    width: "50%",  // Ensure the groups take full width
    padding: "20px",  // Add some spacing between the groups
    // justifyContent:'center',
    height:'100vh',

  };

const loadingStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  fontSize: "24px",
  color: "#888",
};

// Individual Card Component
const Card = ({
  data,
  color,
  setIsSpeakingGlobal,
  voicesLoaded,
  isSpeakingGlobal,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    if (!isSpeaking || !voicesLoaded) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const currentText = data.card[currentTextIndex].text;
    const utterance = new SpeechSynthesisUtterance(currentText);

    // Set a male voice (assuming it's available at index 1, adjust as needed)
    utterance.voice = window.speechSynthesis.getVoices()[1];

    synth.speak(utterance);
    setIsZooming(true);
    setIsSpeakingGlobal(true);

    utterance.onend = () => {
      if (currentTextIndex < data.card.length - 1) {
        setCurrentTextIndex((prevIndex) => prevIndex + 1);
      } else {
        setIsFinished(true);
        setIsSpeaking(false);
        setIsSpeakingGlobal(false);
        setIsZooming(false);
      }
    };

    return () => {
      synth.cancel();
      setIsZooming(false);
      setIsSpeakingGlobal(false);
    };
  }, [currentTextIndex, voicesLoaded, isSpeaking]);

  const handleStartSpeaking = () => {
    if (isFinished) {
      setCurrentTextIndex(0);
      setIsFinished(false);
    }
    setIsSpeaking(true);
  };

  return (
    <div
      className="videoCard"
      style={{
        borderRadius: "10px",
        boxShadow: `0px 0px 20px 1px ${color}20`,
        padding: "10px",
        margin: "2.5vh 20px",
        height: "90vh",
        border: `1px solid ${color}80`,
        position: "relative",
        overflow: "hidden",
        background: "whitesmoke",
      }}
    >
      <div
        className={`image-container ${isZooming ? "zoom" : ""}`}
        style={{
          backgroundImage: `url(${data.card[currentTextIndex].image_url})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "100%",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          transition: "transform 0.5s ease-in-out",
          zIndex: 0,
          overflow: "hidden",
          animation: isZooming ? "zoomIn 10s ease-in-out forwards" : "none",
        }}
      >
        <div
          className="blur-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "20%",
              backgroundImage: `url(${data.card[currentTextIndex].image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "top center",
              filter: "blur(20px)",
              transform: "scale(1.1)",
              zIndex: -1,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "20%",
              backgroundImage: `url(${data.card[currentTextIndex].image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "bottom center",
              filter: "blur(20px)",
              transform: "scale(1.1)",
              zIndex: -1,
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: `${color}20`,
          padding: "10px",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <FontAwesomeIcon
          icon={faPlay}
          onClick={handleStartSpeaking}
          style={{
            fontSize: "24px",
            cursor: "pointer",
            opacity: isFinished ? 0.5 : 1,
            pointerEvents: !isSpeakingGlobal && voicesLoaded ? "auto" : "none",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          height: "90%",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            fontSize: "24px",
            marginTop: "0px",
            color: "#333",
            position: "relative",
            zIndex: 1,
            background: "white",
            borderRadius: "10px",
            padding: "5px 10px",
            boxShadow: "0px 0px 10px 1px gainsboro",
            textAlign: "center",
          }}
        >
          {data.card[currentTextIndex].text}
        </p>
      </div>
    </div>
  );
};

const VideoScroller = ({}) => {
  const containerRef = useRef(null);
  const [isSpeakingGlobal, setIsSpeakingGlobal] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false); // New state for scrolling
  const [mobileDimension, setMobileDimension] = useState(false);

  useEffect(() => {
    const handleLoadVoices = () => {
      setVoicesLoaded(true);
    };

    window.speechSynthesis.onvoiceschanged = handleLoadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Scroll event handler
  const handleScroll = (event) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Check if we've reached the end of the scroll
    if (scrollTop + clientHeight >= scrollHeight) {
      // Optional: Handle when reaching the end
      console.log("Reached the end of scrolling");
    }
  };

  useEffect(() => {
    const container = containerRef.current;

    // Adding scroll event listener
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [containerRef]);

  return (
    <div className="App" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {localStorage.getItem("email") ? (
        <div>
        <Navbar setMobileDimension={setMobileDimension} />
      </div>
      ) : (
        <div></div>
      )}
      <div style={containerStyle} ref={containerRef}>
        {cardData.map((data, index) => (
          <div style={cardContainerStyle} key={index}>
            <Card
              data={data}
              setIsSpeakingGlobal={setIsSpeakingGlobal}
              voicesLoaded={voicesLoaded}
              isSpeakingGlobal={isSpeakingGlobal}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoScroller;

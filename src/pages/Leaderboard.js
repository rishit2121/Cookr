import React, { useState, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../components/firebase/Firebase";
import { auth } from "../components/firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";

function MyLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef(null);
  const userEntryRef = useRef(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser?.email || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Subscribe to the leaderboard document
      const unsubscribe = onSnapshot(doc(db, "leaderboard", "rankings"), (doc) => {
        if (doc.exists()) {
          const rankingList = doc.data().ranking || [];
          // Sort the ranking list by XP in descending order
          const sortedRankings = [...rankingList].sort((a, b) => b.XP - a.XP);
          setLeaderboardData(sortedRankings);
        }
      });
      return () => unsubscribe();
    }
  }, [loading]);
  const topThree = leaderboardData.slice(0, 3);
  // Get players around the current user's rank
  const userRank = leaderboardData.findIndex(player => player.email === user);
  const nearbyPlayers = leaderboardData.slice(
    Math.max(0, userRank - 25),
    Math.min(leaderboardData.length, userRank + 26)
  );

  useEffect(() => {
    if (scrollContainerRef.current && userEntryRef.current && nearbyPlayers.length > 0) {
      const container = scrollContainerRef.current;
      const userEntry = userEntryRef.current;
      
      if (!container || !userEntry) return;

      // Get total scrollable height
      const totalScrollHeight = container.scrollHeight;
      
      // Get height of one entry (they're all the same height)
      const entryHeight = userEntry.clientHeight;
      
      // Get the distance from our entry to the top
      const distanceFromTop = userEntry.offsetTop;

      // If we're in the first few entries, don't scroll
      const userIndex = nearbyPlayers.findIndex(player => player.email === user);
      if (userIndex <= 2) {
        container.scrollTop = 0;
        return;
      }
      
      // Calculate how much space we want above our entry (half of remaining space)
      const desiredTopSpace = (totalScrollHeight - entryHeight) / 2;
      
      // Calculate final scroll position
      const scrollPosition = Math.max(0, distanceFromTop - desiredTopSpace);
      
      // Apply the scroll
      container.scrollTop = scrollPosition;
    }
  }, [nearbyPlayers.length, user]);

  // Get top 3 players
  

  // Helper function to format name (first name only, capitalize first letter)
  const formatName = (name) => {
    return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1).toLowerCase();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: "100%", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0px ", color:'white' }}>
        <span style={{
          fontWeight: "bold", 
          marginBottom: "2dvh", 
          marginTop:'2dvh', 
          height: '5dvh',
          fontSize: '4dvh', // 80% of the container height to ensure text fits
          display: 'flex',
          alignItems: 'center'
        }}>Leaderboard</span>
        
        <div style={{ 
          width: "95%", 
          // background: "radial-gradient(circle at center,rgb(61, 61, 61) 0%,rgb(29, 29, 29) 100%)",
          background:"rgb(34, 34, 34)",
          borderRadius: "35px 35px 35px 35px",
          height: "28dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "2px solid white"
        }}>
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            padding: "2.5dvh 0 1dvh 0",
          }}>
            {/* 1st Place */}
            {topThree[0] && (
              <div style={{
                width: "90%",
                height:'7dvh',

                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                boxSizing: "border-box"
              }}>
                <div style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#D4AF37",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  marginRight: "15px"
                }}>1</div>
                <span style={{ flex: 1 }}>{formatName(topThree[0].name)}</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{topThree[0].XP.toLocaleString()} XP</span>
              </div>
            )}

            {/* 2nd Place */}
            {topThree[1] && (
              <div style={{
                width: "90%",
                height: "60px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                boxSizing: "border-box",
                height:'7dvh',
              }}>
                <div style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#C0C0C0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  marginRight: "15px"
                }}>2</div>
                <span style={{ flex: 1 }}>{formatName(topThree[1].name)}</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{topThree[1].XP.toLocaleString()} XP</span>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div style={{
                width: "90%",
                height: "60px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                boxSizing: "border-box",
                height:'7dvh',
              }}>
                <div style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#964B00",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  marginRight: "15px"
                }}>3</div>
                <span style={{ flex: 1 }}>{formatName(topThree[2].name)}</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{topThree[2].XP.toLocaleString()} XP</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current User's Rank */}
      {/* {user && (
        <div style={{ width: "78%", height:'3dvh', color:'black', background: "white", padding: "10px 10% 10px 12%", display: "flex", justifyContent: "space-between", fontWeight: "bold", marginTop:'3dvh' }}>
          <span>{userRank + 1}. You</span>
          <span>{leaderboardData[userRank]?.XP.toLocaleString()} XP</span>
        </div>
      )} */}

      {/* Nearby Rankings */}
      <div style={{ 
        padding: "10px 0", 
        display:'flex',
       
      }}>
        {/* <h4 style={{ color: "#6c757d", fontSize: "1em", marginBottom: "5px" }}>RANKINGS</h4> */}
        <div 
          ref={scrollContainerRef}
          style={{ 
            height: window.innerWidth <= 768 ? 'calc(100dvh - 105px - 37dvh)' : 'calc(100dvh - 10px - 37dvh)',
            width: "100%", 
            color:'white',
            overflowY: 'auto',
            overflowX: 'hidden',
            bottom: '75px',
            left: '5%',
            right: 0
          }}>
          {nearbyPlayers.map((player, index) => (
            <div 
              key={player.email} 
              ref={player.email === user ? userEntryRef : null}
              style={{ 
                width: "100%",
                height: "max(7dvh, 50px)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                padding: "0 5% 0 20px",
                boxSizing: "border-box",
                background: player.email === user ? "rgba(255, 255, 255, 0.1)" : "transparent",
                margin: "0 auto"
              }}>
              <div style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: player.email === user ? "#40E0D0" : "white",
                fontWeight: "bold",
                marginRight: "15px"
              }}>{Math.max(0, userRank - 25) + index + 1}</div>
              <span style={{ flex: 1, color: player.email === user ? "#40E0D0" : "white" }}>
                {player.name}
              </span>
              <span style={{ color: player.email === user ? "#40E0D0" : "white" }}>
                {player.XP.toLocaleString()} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyLeaderboard;
  
import React, { useState, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../components/firebase/Firebase";
import { auth } from "../components/firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useTranslation } from 'react-i18next';

function MyLeaderboard() {
  const { t } = useTranslation();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImages, setProfileImages] = useState({});

  const scrollContainerRef = useRef(null);
  const userEntryRef = useRef(null);

  // Function to fetch profile image
  const fetchProfileImage = async (userEmail) => {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, `images/${userEmail}/profile_picture.jpg`);
      const imageUrl = await getDownloadURL(imageRef);
      setProfileImages(prev => ({ ...prev, [userEmail]: imageUrl }));
    } catch (error) {
      console.error("Error fetching profile image:", error);
      // Set a default image or handle the error
      setProfileImages(prev => ({ ...prev, [userEmail]: null }));
    }
  };

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
          
          // Fetch profile images for top 3
          sortedRankings.slice(0, 3).forEach(player => {
            fetchProfileImage(player.email);
          });
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

  // Helper for XP gradient pill
  const xpGradient = (rank) => {
    if (rank === 1) return 'linear-gradient(90deg, #FFD600 0%, #FF5C87 100%)';
    if (rank === 2) return 'linear-gradient(90deg, #00FFD1 0%, #00B2FF 100%)';
    if (rank === 3) return 'linear-gradient(90deg, #FFE29F 0%, #FFA99F 100%)';
    return 'linear-gradient(90deg, #232526 0%, #414345 100%)';
  };

  // Helper for XP formatting
  const formatXP = (xp) => {
    if (xp >= 1000) return (xp / 1000).toFixed(1) + 'k';
    return xp;
  };

  // Responsive height for leaderboard list
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const leaderboardListHeight = 'calc(78dvh - 260px)'; // Keep consistent for mobile view

  if (loading) {
    return <div>Loading...</div>;
  }

  // --- Podium Section ---
  const PodiumUser = ({ player, rank }) => {
    // Podium effect: 1st is highest, 2nd a bit lower, 3rd lowest
    let marginTop = 0;
    let boxHeight = 70;
    let boxWidth = '33vw';
    
    if (rank === 1) { 
      marginTop = 0; 
      boxHeight = 110; 
    }
    if (rank === 2) { 
      marginTop = 40; 
      boxHeight = 90; 
    }
    if (rank === 3) { 
      marginTop = 70; 
      boxHeight = 70; 
    }
    
    // Only scale up for desktop with sidebar (non-mobile)
    if (!isMobile) {
      boxWidth = '25vw';
      if (rank === 1) boxHeight = 160;
      if (rank === 2) { marginTop = 60; boxHeight = 130; }
      if (rank === 3) { marginTop = 100; boxHeight = 100; }
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: boxWidth, 
        minWidth: isMobile ? 100 : 150, 
        maxWidth: isMobile ? 180 : 300, 
        position: 'relative', 
        margin: 0, 
        marginTop 
      }}>
        <div style={{
          width: isMobile ? 60 : 90,
          height: isMobile ? 60 : 90,
          borderRadius: '50%',
          background: profileImages[player.email] ? `url(${profileImages[player.email]}) center/cover` : (rank === 1 ? '#FFD600' : rank === 2 ? '#C0C0C0' : '#964B00'),
          border: `${isMobile ? 3 : 5}px solid ${rank === 1 ? '#FFD600' : rank === 2 ? '#C0C0C0' : '#964B00'}`,
          marginBottom: isMobile ? 10 : 15,
          boxShadow: rank === 1 ? '0 2px 12px #FFD60044' : '0 2px 8px #0004',
        }} />
        <span style={{ 
          fontWeight: 'bold', 
          fontSize: isMobile ? 16 : 24, 
          marginBottom: isMobile ? 6 : 10 
        }}>{formatName(player.name)}</span>
        <span style={{
          background: xpGradient(rank),
          color: '#222',
          fontWeight: 'bold',
          borderRadius: isMobile ? 16 : 24,
          padding: isMobile ? '3px 12px' : '5px 20px',
          fontSize: isMobile ? 14 : 20,
          marginBottom: isMobile ? 8 : 12,
          display: 'inline-block',
        }}>{formatXP(player.XP)} Xp</span>
        {/* Number in a wide, more transparent, blended gradient box below */}
        <div style={{
          width: boxWidth,
          height: boxHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: isMobile ? 18 : 30,
          background: 'linear-gradient(180deg,rgb(34, 13, 67) 0%, #000 60%)',
          border: 'none',
          boxShadow: 'none',
          userSelect: 'none',
          minWidth: isMobile ? 100 : 150,
          maxWidth: isMobile ? 180 : 300,
        }}>
          <span style={{
            fontWeight: 'bold',
            fontSize: isMobile ? 40 : 70,
            background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
          }}>{rank}</span>
        </div>
      </div>
    );
  };


  return (
    <div style={{ 
      width: "100%", 
      margin: "0 auto", 
      fontFamily: "Arial, sans-serif", 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #3a2176 0%,rgb(0, 0, 0) 35%, #000 100%)'
    }}>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        padding: "0px", 
        color: 'white',
        width: "100%"
      }}>
        <span style={{
          fontWeight: "bold", 
          marginBottom: "0dvh", 
          marginTop: '2dvh', 
          height: '5dvh',
          fontSize: isMobile ? '4dvh' : '5dvh',
          display: 'flex',
          alignItems: 'center'
        }}>{t("leaderboard")}</span>

       
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 0,
          margin: '0 0 20px 0',
          minHeight: isMobile ? '140px' : '220px',
        }}>
          {topThree[1] && <PodiumUser player={topThree[1]} rank={2} />}
          {topThree[0] && <PodiumUser player={topThree[0]} rank={1} />}
          {topThree[2] && <PodiumUser player={topThree[2]} rank={3} />}
        </div>
      </div>

     
      <div style={{ 
        width: isMobile ? '100%' : '80%', 
        maxWidth: isMobile ? 500 : 1200, 
        margin: '0 auto', 
        borderRadius: 20, 
        padding: '4px 0 16px 0', 
        height: leaderboardListHeight, 
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'transparent' 
      }} ref={scrollContainerRef}>
        {nearbyPlayers.map((player, idx) => {
          const rank = Math.max(0, userRank - 25) + idx + 1;
          const isCurrentUser = player.email === user;
          return (
            <div key={player.email} ref={isCurrentUser ? userEntryRef : null} style={{
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '6px 12px' : '10px 20px',
              background: isCurrentUser ? 'rgba(64,224,208,0.08)' : 'transparent',
              borderRadius: isMobile ? 12 : 16,
              margin: '2px auto',
              minHeight: isMobile ? 40 : 60,
              width: '100%',
              maxWidth: '90%',
              boxShadow: isCurrentUser ? '0 2px 8px #40E0D044' : 'none',
              overflowX: 'hidden',
            }}>
              <span style={{ 
                width: isMobile ? 30 : 50, 
                textAlign: 'right', 
                color: isCurrentUser ? '#40E0D0' : '#aaa', 
                fontWeight: 'bold', 
                fontSize: isMobile ? 15 : 20, 
                marginRight: isMobile ? 10 : 20,
                flexShrink: 0 
              }}>{rank}.</span>
              <div style={{
                width: isMobile ? 28 : 40,
                height: isMobile ? 28 : 40,
                borderRadius: '50%',
                background: profileImages[player.email] ? `url(${profileImages[player.email]}) center/cover` : '#23243a',
                border: `${isMobile ? 2 : 3}px solid #23243a`,
                marginRight: isMobile ? 10 : 20,
                flexShrink: 0 
              }} />
              <span style={{ 
                flex: 1, 
                color: isCurrentUser ? '#40E0D0' : 'white', 
                fontWeight: 500, 
                fontSize: isMobile ? 14 : 18,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginRight: isMobile ? 2 : 5 
              }}>{player.name}</span>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: isCurrentUser ? '#40E0D0' : '#7fffd4', 
                fontWeight: 'bold', 
                fontSize: isMobile ? 14 : 18,
                width: isMobile ? 80 : 105, 
                flexShrink: 0,
                marginLeft: 'auto',
                paddingRight: isMobile ? 0 : 3, 
                marginRight: isMobile ? 5 : 10
              }}>
                <svg width={isMobile ? 15 : 20} height={isMobile ? 15 : 20} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3, flexShrink: 0 }}>
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                </svg>
                {formatXP(player.XP)} Xp
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyLeaderboard;
  

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  query, 
  orderBy, 
  limit,
  where
} from 'firebase/firestore';
import { db } from './firebase/Firebase';
import { useTranslation } from 'react-i18next';

const AnnouncementDisplay = ({ user, onClose }) => {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      checkAndShowAnnouncement();
    }
  }, [user]);

  const checkAndShowAnnouncement = async () => {
    try {
      // Check if user has already seen the latest announcement
      const userAnnouncementRef = doc(db, 'userAnnouncements', user);
      const userAnnouncementDoc = await getDoc(userAnnouncementRef);

      // Get the latest announcement
      const q = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setLoading(false);
        return;
      }

      const latestAnnouncement = querySnapshot.docs[0].data();
      const latestAnnouncementId = querySnapshot.docs[0].id;

      // Check if the announcement is active
      if (!latestAnnouncement.isActive) {
        setLoading(false);
        return;
      }

      // Check if user has seen this announcement
      if (userAnnouncementDoc.exists()) {
        const userData = userAnnouncementDoc.data();
        if (userData.lastSeenAnnouncementId === latestAnnouncementId) {
          // User has already seen this announcement
          setLoading(false);
          return;
        }
      }

      // Show the announcement
      setAnnouncement({
        id: latestAnnouncementId,
        ...latestAnnouncement
      });
    } catch (error) {
      console.error('Error checking announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (announcement && user) {
      try {
        // Mark this announcement as seen by the user
        const userAnnouncementRef = doc(db, 'userAnnouncements', user);
        const userDoc = await getDoc(userAnnouncementRef);
        
        let seenAnnouncements = [];
        if (userDoc.exists()) {
          seenAnnouncements = userDoc.data().seenAnnouncements || [];
        }
        
        // Add this announcement to the seen list if not already there
        if (!seenAnnouncements.includes(announcement.id)) {
          seenAnnouncements.push(announcement.id);
        }
        
        await setDoc(userAnnouncementRef, {
          seenAnnouncements: seenAnnouncements,
          lastSeenAnnouncementId: announcement.id,
          lastSeenAt: new Date(),
          email: user
        }, { merge: true });
      } catch (error) {
        console.error('Error marking announcement as seen:', error);
      }
    }
    onClose();
  };


  if (loading) {
    return null;
  }

  if (!announcement) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: isMobile ? '5px' : '40px'
    }}>
      <div style={{
        backgroundColor: '#232323',
        borderRadius: '20px',
        padding: isMobile ? '20px' : '30px',
        width: isMobile ? '90vw' : '500px',
        maxWidth: isMobile ? '90vw' : '95vw',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
        border: '3px solid #2f88ff',
        boxShadow: '0 0 20px #2f88ff40',
        margin: '0 auto',
        transform: isMobile ? 'translateX(-5px)' : 'none'
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1
          }}
        >
          ×
        </button>


        {/* Title */}
        <h2 style={{
          color: 'white',
          marginBottom: '15px',
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: 'bold',
          lineHeight: '1.3'
        }}>
          {announcement.title}
        </h2>

        {/* Content */}
        <div style={{
          color: '#e0e0e0',
          lineHeight: '1.6',
          fontSize: isMobile ? '16px' : '18px',
          marginBottom: '25px',
          whiteSpace: 'pre-wrap'
        }}>
          {announcement.content}
        </div>

        {/* Date */}
        <div style={{
          color: '#888',
          fontSize: '14px',
          marginBottom: '20px',
          paddingTop: '15px',
          borderTop: '1px solid #444'
        }}>
          {new Date(announcement.createdAt?.toDate?.() || announcement.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        {/* Action button */}
        <button
          onClick={handleClose}
          style={{
            width: '100%',
            backgroundColor: '#2f88ff',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '15px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px #2f88ff40'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px #2f88ff60';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px #2f88ff40';
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default AnnouncementDisplay;

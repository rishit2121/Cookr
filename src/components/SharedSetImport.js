import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase/Firebase';
import { auth } from './firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const SharedSetImport = () => {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importedSet, setImportedSet] = useState(null);
  const [importError, setImportError] = useState("");
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser?.email);
      setLoading(false);
      if (currentUser) {
        // Get subscription status
        const userRef = doc(db, "users", currentUser.email);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            setHasSubscription(docSnap.data().subscription || false);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && shareCode) {
      importSetFromCode(shareCode);
    }
  }, [loading, shareCode]);

  const importSetFromCode = async (code) => {
    try {
      setImportError("");
      
      // Fetch the shared set data
      const sharedSetRef = doc(db, "sharedSets", code.trim());
      const sharedSetDoc = await getDoc(sharedSetRef);
      
      if (!sharedSetDoc.exists()) {
        setImportError("Invalid share code. This study set may have been deleted or the code is incorrect.");
        return;
      }
      
      const sharedData = sharedSetDoc.data();
      const setData = sharedData.setData;
      
      // Normalize content to string
      const normalizedContent = Array.isArray(setData.content) ? setData.content.join('\n') : (setData.content || '');
      
      // Check if user already has this set
      if (user) {
        const userRef = doc(db, "users", user);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userSets = userDoc.data().sets || [];
          const isDuplicate = userSets.some(set => 
            set.title === setData.title && 
            (Array.isArray(set.content) ? set.content.join('\n') : (set.content || '')) === normalizedContent &&
            set.author === setData.author
          );
          
          if (isDuplicate) {
            setImportError("You already have this study set in your library.");
            return;
          }
        }
      }
      
      // Set the imported set data
      setImportedSet({ ...setData, content: normalizedContent });
      
    } catch (error) {
      console.error("Error importing set:", error);
      setImportError("Failed to import set. Please try again.");
    }
  };

  const saveImportedSet = async () => {
    if (!importedSet || !user) return;
    
    try {
      setSaving(true);
      const userRef = doc(db, "users", user);
      const userDoc = await getDoc(userRef);
      
      let currentSets = [];
      if (userDoc.exists()) {
        currentSets = userDoc.data().sets || [];
      } else {
        await setDoc(userRef, { sets: [] });
      }
      
      // Check subscription status before limiting sets
      if (!hasSubscription && currentSets.length >= 10) {
        setShowLimitDialog(true);
        setSaving(false);
        return;
      }
      
      // Normalize content to string
      const normalizedContent = Array.isArray(importedSet.content) ? importedSet.content.join('\n') : (importedSet.content || '');
      
      // Create the imported set with editable: false flag
      const newSet = {
        ...importedSet,
        content: normalizedContent,
        editable: false, // Mark as non-editable
        importedAt: new Date().toISOString(),
        importedFrom: shareCode
      };
      
      currentSets.push(newSet);
      
      // Update Firestore
      await updateDoc(userRef, { sets: currentSets });
      
      // Update localStorage
      localStorage.setItem('sets', JSON.stringify(currentSets));
      
      // Redirect to library page
      navigate("/library");
      
    } catch (error) {
      console.error("Error saving imported set:", error);
      setImportError("Failed to save imported set. Please try again.");
      setSaving(false);
    }
  };

  const LimitDialog = ({ show, onClose }) => {
    if (!show) return null;
    
    return (
      <>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999999999
        }} onClick={onClose} />
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#28282B',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          zIndex: 999999999,
          width: '80%',
          maxWidth: '400px',
          border: '1px solid #353935'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Set Limit Reached</h3>
          <p style={{ color: 'white', marginBottom: '20px' }}>
            You've reached the limit of 10 sets for free users. Upgrade to Cookr Pro to save unlimited study sets.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '5px',
                border: 'none',
                background: '#555',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                navigate("/profile");
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '5px',
                border: 'none',
                background: '#6A6CFF',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'black',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #353935', 
            borderTop: '4px solid #6A6CFF', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <p>Loading...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'black',
        color: 'white',
        flexDirection: 'column'
      }}>
        <h2>Sign In Required</h2>
        <p style={{ marginBottom: '20px' }}>You need to sign in to import study sets.</p>
        <button
          onClick={() => navigate("/auth")}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#6A6CFF',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  if (importError) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'black',
        color: 'white',
        flexDirection: 'column'
      }}>
        <h2>Import Failed</h2>
        <p style={{ marginBottom: '20px', textAlign: 'center', maxWidth: '400px' }}>{importError}</p>
        <button
          onClick={() => navigate("/library")}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#6A6CFF',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go to Library
        </button>
      </div>
    );
  }

  if (!importedSet) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'black',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #353935', 
            borderTop: '4px solid #6A6CFF', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <p>Loading study set...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 999999999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#28282B',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 0 30px rgba(0,0,0,0.5)',
        border: '1px solid #353935',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{ margin: 0, color: 'white' }}>Import Study Set</h2>
          <button
            onClick={() => navigate("/library")}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          background: '#1a1a1a',
          border: '1px solid #353935',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>Preview</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: 'gray', fontSize: '14px', margin: '0 0 5px 0' }}>Title:</p>
            <p style={{ color: 'white', fontSize: '16px', margin: '0' }}>{importedSet.title}</p>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: 'gray', fontSize: '14px', margin: '0 0 5px 0' }}>Author:</p>
            <p style={{ color: 'white', fontSize: '16px', margin: '0' }}>{importedSet.author}</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'gray', fontSize: '14px', margin: '0 0 5px 0' }}>Content Preview:</p>
            <div style={{
              background: '#28282B',
              border: '1px solid #353935',
              borderRadius: '8px',
              padding: '15px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              <p style={{ 
                color: 'white', 
                fontSize: '14px', 
                margin: '0',
                lineHeight: '1.4'
              }}>
                {importedSet.content ? 
                  (importedSet.content.length > 300 ? 
                    importedSet.content.substring(0, 300).trimEnd() + "..." : 
                    importedSet.content
                  ) : 
                  "No content available"
                }
              </p>
            </div>
          </div>

          <div style={{
            background: '#23234a',
            border: '1px solid #353935',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '15px'
          }}>
            <p style={{ 
              color: '#6A6CFF', 
              fontSize: '14.5px', 
              margin: '0',
              textAlign: 'center',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}>
              ⚠️ This set will be saved as non-editable (read-only)
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => navigate("/library")}
            style={{
              background: '#555',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={saveImportedSet}
            disabled={saving}
            style={{
              background: saving ? '#555' : '#6A6CFF',
              boxShadow: saving ? 'none' : '0px 2px 0px 0px #484AC3',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save to Library'}
          </button>
        </div>
      </div>

      <LimitDialog 
        show={showLimitDialog} 
        onClose={() => setShowLimitDialog(false)} 
      />
    </div>
  );
};

export default SharedSetImport; 
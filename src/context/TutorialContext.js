import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../components/firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const TutorialContext = createContext();

export const useTutorial = () => useContext(TutorialContext);

export const TutorialProvider = ({ children }) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(null); // Default to null (unknown)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false); // NEW: confirmation dialog state
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsNarrowScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const steps = React.useMemo(() => [
    {
      target: isNarrowScreen ? '.mobile-nav-home' : '.nav-home',
      content: 'Welcome to Cookr! This is your home page, where you can find questions for your sets.',
      disableBeacon: true,
      placement: isNarrowScreen ? 'top' : 'right',
    },
    {
      target: isNarrowScreen ? '.mobile-nav-library' : '.nav-library',
      content: 'This is your library, where you can access and edit your study sets.',
      disableBeacon: true,
      placement: isNarrowScreen ? 'top' : 'right',
    },
    {
      target: isNarrowScreen ? '.mobile-nav-leaderboard' : '.nav-leaderboard',
      content: 'Check out the leaderboard to see how you rank against other users.',
      disableBeacon: true,
      placement: isNarrowScreen ? 'top' : 'right',
    },
    {
      target: isNarrowScreen ? '.mobile-nav-favorites' : '.nav-favorites',
      content: 'Here you can find all of your saved questions.',
      disableBeacon: true,
      placement: isNarrowScreen ? 'top' : 'right',
    },
    {
      target: isNarrowScreen ? '.mobile-nav-profile' : '.nav-profile',
      content: 'Access your profile and settings here.',
      disableBeacon: true,
      placement: isNarrowScreen ? 'top' : 'right',
    },
    {
      target: isNarrowScreen ? '.mobile-tutorial-library-btn' : '.tutorial-library-btn',
      content: "Welcome! Let's start by heading to your library.",
      disableBeacon: true,
      placement: isNarrowScreen ? 'top' : 'right',
    },
    {
      target: '.tutorial-create-set-btn',
      content: 'Click the plus button to create your first study set.',
      disableBeacon: true,
      placement: isNarrowScreen ? 'top' : 'top-start',
    },
    {
      target: isNarrowScreen ? '.tutorial-save-btn' : '.tutorial-new-prompt',
      content: 'Give your set a title and provide some notes or content to study from, then click Save.',
      disableBeacon: true,
      placement: isNarrowScreen ? 'bottom' : 'left',
      disableOverlay: isNarrowScreen,
      styles: {
        tooltip: {
          maxWidth: 260,
          padding: '12px',
          fontSize: 14,
        },
      },
    },
    {
      target: '.tutorial-targeted-let-me-cook-btn',
      content: 'Great! Now click "Let me cook" to start a study session.',
      disableBeacon: true,
      placement: 'top',
    },
  ], [isNarrowScreen]);

  // Helper to start the tutorial
  const startTutorial = useCallback(() => {
    setTutorialCompleted('no');
    setStepIndex(0);
    if (isNarrowScreen) {
      // Wait for the first mobile nav item to exist in the DOM
      const waitForMobileNav = () => {
        if (document.querySelector('.mobile-nav-home')) {
          setRun(true);
        } else {
          setTimeout(waitForMobileNav, 30);
        }
      };
      waitForMobileNav();
    } else {
      setRun(true);
    }
  }, [isNarrowScreen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.tutorialCompleted === 'no') {
            startTutorial();
          } else if (userData.tutorialCompleted === undefined) {
             await updateDoc(userRef, { tutorialCompleted: 'no' });
             startTutorial();
          } else {
            setTutorialCompleted('yes');
            setRun(false);
          }
        } else {
          // If user doc doesn't exist, create it and start the tutorial immediately.
          await setDoc(userRef, { tutorialCompleted: 'no', email: user.email });
          // Now fetch the doc again to ensure the rest of the logic runs as normal
          const newUserSnap = await getDoc(userRef);
          const newUserData = newUserSnap.data();
          if (newUserData.tutorialCompleted === 'no') {
            startTutorial();
          } else {
            setTutorialCompleted('yes');
            setRun(false);
          }
        }
      } else {
        setRun(false);
        setTutorialCompleted('yes');
      }
      setLoading(false); // Set loading to false after check
    });

    return () => unsubscribe();
  }, [startTutorial]);

  const completeTutorial = useCallback(async () => {
    if (auth.currentUser && tutorialCompleted === 'no') {
        const userRef = doc(db, 'users', auth.currentUser.email);
        await updateDoc(userRef, { tutorialCompleted: 'yes' });
        setTutorialCompleted('yes');
        setRun(false);
        setShowSkipConfirm(false); // Hide confirmation if open
    }
  }, [tutorialCompleted]);

  const handleJoyrideCallback = useCallback(async (data) => {
    const { action, index, status, type } = data;

    if (action === ACTIONS.CLOSE || action === ACTIONS.SKIP) {
      setShowSkipConfirm(true);
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + (action === ACTIONS.NEXT ? 1 : -1));
    } else if (type === EVENTS.TOUR_END) {
      if (status === STATUS.FINISHED) {
        completeTutorial();
      }
      setRun(false);
    }
  }, [completeTutorial]);
  
  const handleNextStep = useCallback(() => {
    setStepIndex(prev => {
      const next = prev + 1;
      if (next === steps.length) {
        completeTutorial();
        setRun(false);
        return prev; // Don't advance past the last step
      }
      return next;
    });
  }, [completeTutorial, steps.length]);
  
  const goToStep = (index) => {
    if (index === steps.length) {
      completeTutorial();
      setRun(false);
      return;
    }
    setStepIndex(index);
  }

  const isTutorialRunning = run;

  const spotlightClicks = stepIndex >= 5;

  // Wait for step 6 target element to be available after navigation
  useEffect(() => {
    if (isTutorialRunning && stepIndex === 6 && window.location.pathname === "/library") {
      console.log('Waiting for .tutorial-create-set-btn to be available...');
      const waitForElement = () => {
        const element = document.querySelector('.tutorial-create-set-btn');
        if (element) {
          console.log('Found .tutorial-create-set-btn, tutorial should continue');
        } else {
          console.log('Element not found, retrying...');
          setTimeout(waitForElement, 100);
        }
      };
      waitForElement();
    }
  }, [isTutorialRunning, stepIndex]);

  return (
    <TutorialContext.Provider value={{ handleNextStep, goToStep, isTutorialRunning, tutorialStep: stepIndex }}>
      {loading ? null : (
        <>
          {children}
          <Joyride
            key={run}
            run={run && !showSkipConfirm}
            steps={steps}
            stepIndex={stepIndex}
            callback={handleJoyrideCallback}
            continuous
            disableOverlayClose
            hideBackButton
            showProgress={false}
            showSkipButton={false}
            spotlightClicks={spotlightClicks}
            styles={{
              options: {
                zIndex: 10000,
                backgroundColor: '#18181c', // dark background
                color: '#fff', // white text
                borderRadius: 16,
                border: '2px solid #6A6CFF', // purple border
                fontSize: 16,
                padding: '18px 22px',
                fontWeight: 500,
                maxWidth: 340,
                minWidth: 220,
              },
              tooltipContent: {
                marginTop: "15px",
                marginBottom: "-10px"
              },
              overlay: {
                zIndex: 10001,
                backgroundColor: 'rgba(10,10,20,0.55)',
              },
              tooltip: {
                zIndex: 10002,
                backgroundColor: '#18181c',
                color: '#fff',
                borderRadius: 16,
                border: '2px solid #6A6CFF', // purple border
                fontSize: 16,
                padding: '18px 22px',
                fontWeight: 500,
                maxWidth: 340,
                minWidth: 220,
              },
              buttonNext: {
                backgroundColor: '#6A6CFF',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                display: !spotlightClicks ? 'inline-block' : 'none',
              },
              arrow: {
                display: 'none',
              },
            }}
          />
          {/* Confirmation dialog for skipping tutorial */}
          {showSkipConfirm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.45)',
              zIndex: 20000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                background: '#18181c',
                border: '2px solid #6A6CFF',
                borderRadius: 16,
                padding: '32px 28px',
                color: '#fff',
                minWidth: 260,
                maxWidth: 340,
                boxShadow: '0 4px 32px #0008',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>
                  Are you sure you want to skip the tutorial?
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
                  <button
                    style={{
                      background: '#6A6CFF',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 22px',
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                      marginRight: 8,
                      boxShadow: '0 2px 8px #6A6CFF44',
                    }}
                    onClick={completeTutorial}
                  >
                    Yes
                  </button>
                  <button
                    style={{
                      background: 'transparent',
                      color: '#fff',
                      border: '1.5px solid #6A6CFF',
                      borderRadius: 8,
                      padding: '8px 22px',
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                      marginLeft: 8,
                    }}
                    onClick={() => setShowSkipConfirm(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </TutorialContext.Provider>
  );
}; 
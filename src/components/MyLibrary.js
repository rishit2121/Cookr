import React, { useState, useEffect, useRef } from "react";
import NewPrompt from "./NewPrompt";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase/Firebase";
import {
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth, signInWithGoogle, logOut } from "./firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTutorial } from '../context/TutorialContext';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MiniMap = ({ guide, onTopicSelect, mobileDimension, activeTopicId }) => {
  const { t } = useTranslation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [navPath, setNavPath] = useState([]);

  useEffect(() => {
    if (activeTopicId && !mobileDimension && guide) {
      const segments = activeTopicId.replace('topic-', '').split('-').map(Number);
      
      // Find the active node in the guide tree
      let activeNode = { subtopics: guide }; // Start with a dummy root
      for (const index of segments) {
        if (!activeNode.subtopics || !activeNode.subtopics[index]) {
          activeNode = null; // Path is invalid, abort
          break;
        }
        activeNode = activeNode.subtopics[index];
      }

      if (activeNode) {
        // If the active node has children, it becomes the parent in the nav.
        // If it's a leaf node, its actual parent is shown.
        const hasChildren = activeNode.subtopics && activeNode.subtopics.length > 0;
        const newNavPath = hasChildren ? segments : segments.slice(0, -1);
        setNavPath(newNavPath);
      }
    }
  }, [activeTopicId, mobileDimension, guide]);

  // --- Data for Navigator ---
  const getNavNodeData = () => {
      let currentLevel = { topic: "Navigation", subtopics: guide };
      let parent = null;
      if (!guide) return { parent, children: [] };
      
      let pathTrace = "topic";
      for (const index of navPath) {
          parent = currentLevel.subtopics[index];
          currentLevel = currentLevel.subtopics[index];
          pathTrace += `-${index}`;
      }
      const childrenWithPaths = (currentLevel.subtopics || []).map((child, index) => ({
          ...child,
          fullPath: `${pathTrace}-${index}`
      }));

      return { parent: parent, children: childrenWithPaths };
  };
  const { parent: navParent, children: navChildren } = getNavNodeData();
  const navParentTitle = navParent ? navParent.topic : "Navigation";

  // --- Click Handlers ---
  const handleNodeClick = (node) => {
    // 1. Scroll main content to the topic
    onTopicSelect(node.fullPath);
    // 2. If it has subtopics, drill down in the navigator
    if(node.subtopics && node.subtopics.length > 0) {
      const childIndex = navChildren.findIndex(c => c.fullPath === node.fullPath);
      setNavPath(p => [...p, childIndex]);
    }
  }

  const handleNavBack = () => {
    setNavPath(p => p.slice(0, -1));
  }

  const navigatorStyle = {
    position: 'fixed',
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid #444',
    borderRadius: '10px',
    zIndex: 1000,
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    transition: 'all 0.3s ease-in-out',
    overflow: 'hidden',
    ...(mobileDimension 
      ? { // Mobile styles
          bottom: '20px',
          left: '5%',
          right: '5%',
          width: '90%',
          maxHeight: isNavCollapsed ? '50px' : '60vh',
        }
      : { // Desktop styles
          bottom: '20px',
          right: '20px',
          width: '300px',
          maxHeight: isNavCollapsed ? '50px' : '400px',
        }
    )
  };

  if (!guide || typeof guide === 'string' || !Array.isArray(guide)) {
    return null;
  }

  return (
    <div style={navigatorStyle}>
      <div style={{ padding: '10px', borderBottom: isNavCollapsed ? 'none' : '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden'}}>
            {navPath.length > 0 && (
                <button onClick={handleNavBack} style={{ background: 'none', border: 'none', color: 'white', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
            )}
            <span style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{navParentTitle}</span>
        </div>
        <button onClick={() => setIsNavCollapsed(!isNavCollapsed)} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center'}}>
          {isNavCollapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </button>
      </div>
      {!isNavCollapsed && (
        <ul style={{ flex: 1, overflowY: 'auto', padding: '10px', listStyle: 'none', margin: 0 }}>
          {navChildren.map((node, index) => (
            <li key={node.fullPath}>
              <a
                onClick={() => handleNodeClick(node)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  borderRadius: '5px'
                }}
                className="minimap-link"
              >
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{node.topic}</span>
                {node.subtopics && node.subtopics.length > 0 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>}
              </a>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .minimap-link:hover {
          background-color: #333;
        }
      `}</style>
    </div>
  );
};

const DeleteConfirmationPopup = ({ onClose, onConfirm }) => {
  const { t } = useTranslation();
  
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: 0, color: 'white' }}>{t("deleteSet")}</h3>
          <svg
            onClick={onClose}
            style={{
              cursor: 'pointer'
            }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <p style={{ color: 'white', marginBottom: '20px' }}>
          {t("deleteSetConfirmation")}
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
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              borderRadius: '5px',
              border: 'none',
              background: '#a90000',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {t("yesDelete")}
          </button>
        </div>
      </div>
    </>
  );
};

function ModeSelectionTutorialAdvance() {
  const { isTutorialRunning, tutorialStep, goToStep } = useTutorial();
  useEffect(() => {
    if (isTutorialRunning && tutorialStep === 8) {
      const interval = setInterval(() => {
        if (document.querySelector('.tutorial-mcq-btn')) {
          goToStep(8);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isTutorialRunning, tutorialStep, goToStep]);
  return null;
}

const MyLibrary = ({ mobileDimension }) => {
  const { t, i18n } = useTranslation();
  const { handleNextStep, goToStep, isTutorialRunning, tutorialStep } = useTutorial();
  const [sets, setSets] = useState([]);
  const [openMode, setOpenMode] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [openNewTopic, setOpenNewTopic] = useState(false);
  const [style, setStyle] = useState(0);
  const [params, setParams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showStudyGuide, setShowStudyGuide] = useState(false);
  const [studyGuideContent, setStudyGuideContent] = useState(null);
  const [studyGuideData, setStudyGuideData] = useState(null);
  const [isGeneratingStudyGuide, setIsGeneratingStudyGuide] = useState(false);
  const prevSetsLength = useRef(0);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser.email);
      setLoading(false);
      if (currentUser) {
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
    if (isTutorialRunning && tutorialStep === 7 && sets.length > prevSetsLength.current) {
      setTimeout(() => {
        handleNextStep();
      }, 350);
    }
    prevSetsLength.current = sets.length;
  }, [sets, isTutorialRunning, tutorialStep, handleNextStep]);

  useEffect(() => {
    if (isTutorialRunning && tutorialStep === 8 && openMode) {
      const interval = setInterval(() => {
        if (document.querySelector('.tutorial-mcq-btn')) {
          goToStep(8);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isTutorialRunning, tutorialStep, openMode, goToStep]);

  const SummaryRenderer = ({ text }) => {
    // Ensure text is a single string with normalized newlines
    const summaryText = (Array.isArray(text) ? text.join('\n') : text || '').replace(/\\n/g, '\n');
    
    // Split into lines and filter for bullet points
    const lines = summaryText.split('\n').filter(line => line.trim().startsWith('*'));

    const renderLine = (line, index) => {
        // Remove leading '*' and trim
        const cleanedLine = line.trim().substring(1).trim();

        // Split the line by the bold delimiter, keeping the captured group
        const parts = cleanedLine.split(/\*\*(.*?)\*\*/g);

        return (
            <li key={index} style={{ marginBottom: '10px' }}>
                {parts.map((part, i) => {
                    if (i % 2 === 1) {
                        // Odd-indexed parts are the bolded content
                        return <strong key={i}><Latex>{part}</Latex></strong>;
                    } else {
                        // Even-indexed parts are regular text (may contain LaTeX)
                        return <Latex key={i}>{part}</Latex>;
                    }
                })}
            </li>
        );
    };

    return (
        <ul style={{ paddingLeft: '20px', margin: '10px 0', color: '#ccc', lineHeight: '1.6' }}>
            {lines.map(renderLine)}
        </ul>
    );
  };

  const CollapsibleTopic = ({ topic, level = 0, topicId, collapsedTopics, setCollapsedTopics }) => {
    const isCollapsed = collapsedTopics[topicId] === undefined ? false : collapsedTopics[topicId];
  
    const toggleCollapse = () => {
      setCollapsedTopics(prev => ({
        ...prev,
        [topicId]: !isCollapsed
      }));
    };
  
    const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
    const hasSummary = topic.summary && typeof topic.summary === 'string' && topic.summary.trim() !== '';
    const canCollapse = hasSubtopics || hasSummary;
  
    return (
      <div id={topicId} style={{ marginBottom: '15px' }}>
        <div 
          onClick={canCollapse ? toggleCollapse : undefined}
          style={{
            paddingLeft: `${level * 20}px`,
            cursor: canCollapse ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            color: '#eee'
          }}
        >
          {canCollapse ? (
              <svg
                style={{
                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  marginRight: '10px',
                  flexShrink: 0
                }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
          ) : (
            <div style={{width: '26px', flexShrink: 0}}></div>
          )}
          <h3 style={{
            fontSize: `${Math.max(16, 22 - level * 2)}px`,
            margin: '0',
          }}>
            {topic.topic}
          </h3>
        </div>
        {!isCollapsed && (
          <div style={{ paddingLeft: `${level * 20}px`, marginTop: '5px' }}>
            <div style={{ paddingLeft: '26px' }}>
              {hasSummary && (
                 <SummaryRenderer text={topic.summary} />
              )}
              {hasSubtopics && (
                <div style={{ 
                  marginTop: hasSummary ? '10px' : '0',
                  borderLeft: '2px solid #444',
                  paddingLeft: '15px'
                }}>
                  {topic.subtopics.map((subtopic, index) => (
                    <CollapsibleTopic key={subtopic.topic} topic={subtopic} level={level + 1} topicId={`${topicId}-${index}`} collapsedTopics={collapsedTopics} setCollapsedTopics={setCollapsedTopics} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const StudyGuideOverlay = ({ item, onClose, mobileDimension, guide, isLoading }) => {
    const { t } = useTranslation();
    const contentRef = useRef(null);
    const activeTopicIdRef = useRef(null);
    
    // --- Desktop State & Handlers ---
    const [collapsedTopics, setCollapsedTopics] = useState({});
    const [scrollToTopic, setScrollToTopic] = useState(null);
    const [activeTopicId, setActiveTopicId] = useState(null);

    const handleTopicSelect = (topicId) => {
      const newCollapsedState = { ...collapsedTopics };
      const segments = topicId.replace('topic-', '').split('-');
      let currentPath = 'topic';
      
      for (let i = 0; i < segments.length - 1; i++) {
        currentPath += `-${segments[i]}`;
        newCollapsedState[currentPath] = false;
      }
      
      setCollapsedTopics(newCollapsedState);
      setScrollToTopic(topicId); 
    };

    useEffect(() => {
      if (scrollToTopic) {
        setTimeout(() => {
          const element = document.getElementById(scrollToTopic);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          setScrollToTopic(null);
        }, 100);
      }
    }, [scrollToTopic]);

    // Desktop scroll-syncing logic
    useEffect(() => {
      if (mobileDimension || !guide || isLoading) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const intersectingEntries = entries.filter((e) => e.isIntersecting);
          if (intersectingEntries.length > 0) {
            // Sort by position on screen
            intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            // The "most current" is the highest one on the screen
            const currentEntry = intersectingEntries[0];
            
            if (currentEntry.target.id !== activeTopicIdRef.current) {
              setActiveTopicId(currentEntry.target.id);
              activeTopicIdRef.current = currentEntry.target.id;
            }
          }
        },
        {
          root: contentRef.current,
          rootMargin: '-50% 0px -50% 0px', // Trigger when element is in the vertical center
          threshold: 0,
        }
      );

      const topics = contentRef.current.querySelectorAll('div[id^="topic-"]');
      topics.forEach((topic) => observer.observe(topic));

      return () => topics.forEach((topic) => observer.unobserve(topic));
    }, [guide, isLoading, mobileDimension]);

    // --- Mobile State & Handlers ---
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const mobileNavRef = useRef(null);
    const mobileNavToggleRef = useRef(null);
    const [mobileDropdownPath, setMobileDropdownPath] = useState([]);
    const [flattenedTopics, setFlattenedTopics] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const mobileContentRef = useRef(null);
    const prevIsMobileNavOpen = useRef(isMobileNavOpen);

    useEffect(() => {
      if (!guide || typeof guide !== 'object' || !Array.isArray(guide)) return;

      let idCounter = 0;
      const flatList = [];
      const traverse = (nodes, path) => {
          nodes.forEach((node, index) => {
              const newPath = [...path, index];
              // Assign a unique, persistent ID for the flattened list
              node.flatId = idCounter++;
              flatList.push({ ...node, topicId: `topic-${newPath.join('-')}`, path: newPath });
              if (node.subtopics && node.subtopics.length > 0) {
                  traverse(node.subtopics, newPath);
              }
          });
      };
      traverse(guide, []);
      setFlattenedTopics(flatList);
      setCurrentPageIndex(0);
    }, [guide]);

    useEffect(() => {
      if (isMobileNavOpen && !prevIsMobileNavOpen.current) {
        // When navigator opens, sync its path with the current content page
        const currentTopicData = flattenedTopics[currentPageIndex];
        if (currentTopicData && currentTopicData.path) {
          // If the current topic has children, show it as the parent in the nav.
          // Otherwise, show its actual parent.
          const hasChildren = currentTopicData.subtopics && currentTopicData.subtopics.length > 0;
          const newPath = hasChildren ? currentTopicData.path : currentTopicData.path.slice(0, -1);
          setMobileDropdownPath(newPath);
        }
      }
      prevIsMobileNavOpen.current = isMobileNavOpen;
    }, [isMobileNavOpen, currentPageIndex, flattenedTopics]);

    useEffect(() => {
      function handleClickOutside(event) {
        if (
          mobileNavRef.current &&
          !mobileNavRef.current.contains(event.target) &&
          mobileNavToggleRef.current &&
          !mobileNavToggleRef.current.contains(event.target)
        ) {
          setIsMobileNavOpen(false);
        }
      }
      if (isMobileNavOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isMobileNavOpen]);

    const handlePageChange = (newIndex) => {
        if (newIndex < 0 || newIndex >= flattenedTopics.length || isFading) return;
        
        setIsFading(true);
        setTimeout(() => {
            if (mobileContentRef.current) {
                mobileContentRef.current.scrollTop = 0;
            }
            setCurrentPageIndex(newIndex);
            setIsFading(false);
        }, 200); // Animation duration
    };

    const handleNavSelect = (flatId) => {
      const index = flattenedTopics.findIndex(t => t.flatId === flatId);
      if (index !== -1) {
        handlePageChange(index);
      }
      setIsMobileNavOpen(false);
      setMobileDropdownPath([]);
    };
  
    // --- Data for Mobile Dropdown ---
    const getDropdownNodeData = () => {
        let currentLevel = { topic: "Table of Contents", subtopics: guide };
        let parent = null;
        if (!guide) return { parent, children: [] };
        
        for (const index of mobileDropdownPath) {
            parent = currentLevel.subtopics[index];
            currentLevel = currentLevel.subtopics[index];
        }
        return { parent: parent, children: currentLevel.subtopics || [] };
    };
    const { parent: dropdownParent, children: dropdownChildren } = getDropdownNodeData();
    const dropdownParentTitle = dropdownParent ? dropdownParent.topic : "Table of Contents";

  // --- Data for Mobile View ---
  const currentTopic = flattenedTopics[currentPageIndex];
  
  const handleDownloadPDF = () => {
    if (!guide || typeof guide === 'string') return;

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });

    const pageMargin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (pageMargin * 2);
    let cursorY = pageMargin;

    const addPageIfNeeded = () => {
      if (cursorY > pdf.internal.pageSize.getHeight() - pageMargin) {
        pdf.addPage();
        cursorY = pageMargin;
      }
    };

    // --- PDF Title ---
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    const titleLines = pdf.splitTextToSize(`${t('studyGuide', 'Study Guide')}: ${item.title}`, contentWidth);
    pdf.text(titleLines, pageMargin, cursorY);
    cursorY += (titleLines.length * 20) + 20;

    let isFirstTopic = true;
    // --- Recursive function to render topics ---
    const renderNode = (node, level) => {
      // Add vertical space before each topic for better separation, but not the very first one.
      if (!isFirstTopic) {
        cursorY += 15;
      }
      isFirstTopic = false;

      addPageIfNeeded();
      const indent = pageMargin + (level * 20);
      const fontSize = Math.max(11, 16 - level * 1.5);

      // Topic Title
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, 'bold');
      const topicLines = pdf.splitTextToSize(node.topic, contentWidth - (indent - pageMargin));
      pdf.text(topicLines, indent, cursorY);
      cursorY += (topicLines.length * fontSize) + 5;

      // Summary
      if (node.summary) {
        addPageIfNeeded();
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        const summaryText = (Array.isArray(node.summary) ? node.summary.join('\n') : node.summary || '').replace(/\\n/g, '\n');
        const summaryLines = summaryText.split('\n').filter(line => line.trim().startsWith('*'));

        summaryLines.forEach(line => {
          addPageIfNeeded();
          // Clean up markdown/latex for PDF. This is a simplification.
          const cleanedLine = line.trim().substring(1).trim()
            .replace(/\*\*(.*?)\*\*/g, '$1') // Basic bold removal
            .replace(/\$(.*?)\$/g, '$1');    // Basic LaTeX removal
          
          const bulletPoint = '• ';
          const bulletIndent = indent + 15;
          const textLines = pdf.splitTextToSize(cleanedLine, contentWidth - (bulletIndent - pageMargin));
          
          pdf.text(bulletPoint, bulletIndent, cursorY);
          pdf.text(textLines, bulletIndent + 10, cursorY);
          cursorY += (textLines.length * 10) + 4;
        });
      }

      // Subtopics
      if (node.subtopics && node.subtopics.length > 0) {
        node.subtopics.forEach(subtopic => {
          renderNode(subtopic, level + 1);
        });
      }
    };

    // --- Start rendering ---
    guide.forEach(topic => {
      renderNode(topic, 0);
    });

    pdf.save(`${item.title}_StudyGuide.pdf`);
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    backgroundColor: '#000',
    zIndex: 9999999999,
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    boxSizing: 'border-box',
    borderLeft: mobileDimension ? 'none' : '1px solid #353935',
    ...(mobileDimension 
      ? {
          left: 0,
          right: 0,
          bottom: '76px',
          padding: 0,
        }
      : {
          left: '220px',
          right: 0,
          bottom: 0,
          padding: '20px'
        }
    )
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0',
    flexShrink: 0,
    padding: mobileDimension ? '20px 20px 10px 20px' : '0 0 20px 0',
    position: 'relative',
    zIndex: 10
  };

  const titleStyle = {
    fontSize: mobileDimension ? '20px' :'24px',
    fontWeight: 'bold',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 'calc(100% - 100px)',
  };

  const headerActionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const closeButtonStyle = {
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '28px',
    padding: '0 10px',
    lineHeight: 1
  };
  
  if (mobileDimension) {
      return (
        <div style={overlayStyle}>
          {/* Mobile Header */}
          <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 20px',
              flexShrink: 0,
              borderBottom: '1px solid #333'
          }}>
            <div style={{flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
              <h2 style={titleStyle}>{t('studyGuide', 'Study Guide')}: {item.title}</h2>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '15px'}}>
               <button ref={mobileNavToggleRef} onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} title="Topics" style={{ ...closeButtonStyle, fontSize: '20px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
               </button>
               <button
                onClick={handleDownloadPDF}
                title={t('downloadPDF', 'Download as PDF')}
                style={{ ...closeButtonStyle, fontSize: '20px' }}
                disabled={isLoading || !guide || typeof guide === 'string'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button onClick={onClose} style={closeButtonStyle}>&times;</button>
            </div>
          </div>
          
           {/* Mobile Navigator Dropdown */}
           {isMobileNavOpen && (
              <div 
                ref={mobileNavRef}
                style={{ 
                  position: 'absolute', 
                  top: '65px', // Position below the header
                  left: 'auto', 
                  right: '10px', 
                  width: '250px',
                  background: 'rgba(30, 30, 30, 0.95)', 
                  zIndex: 20, 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '10px',
                  border: '1px solid #444',
                  maxHeight: '70vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                }}
              >
                {/* Dropdown Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', flexShrink: 0, borderBottom: '1px solid #333'
                }}>
                  {mobileDropdownPath.length > 0 && (
                     <button onClick={() => setMobileDropdownPath(p => p.slice(0, -1))} style={{ background: 'none', border: 'none', color: 'white', padding: 0, display: 'flex' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                      </button>
                  )}
                  <h3 style={{fontSize: '14px', color: 'white', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{dropdownParentTitle}</h3>
                </div>
                {/* Dropdown List */}
                <div style={{flex: 1, overflowY: 'auto', padding: '5px'}}>
                  <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
                    {dropdownChildren.map((node, index) => (
                      <li key={node.flatId} style={{
                        padding: '8px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: '5px'
                      }}
                      onClick={() => {
                        // 1. Scroll main content to the tapped topic
                        const flatIndex = flattenedTopics.findIndex(t => t.flatId === node.flatId);
                        if (flatIndex !== -1) {
                          handlePageChange(flatIndex);
                        }
                        
                        // 2. Update dropdown state only if it's a parent
                        if (node.subtopics && node.subtopics.length > 0) {
                          setMobileDropdownPath(p => [...p, index]);
                        }
                      }}
                      >
                        <span style={{flex: 1, color: 'white', fontSize: '14px'}}>{node.topic}</span>
                        {node.subtopics && node.subtopics.length > 0 && (
                          <span style={{color: '#888', padding: '5px'}}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          {/* Mobile Content */}
          <div ref={mobileContentRef} style={{flex: 1, overflowY: 'auto', padding: '20px 20px 100px 20px', position: 'relative'}}>
            {isLoading ? ( 
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <p style={{ fontSize: '18px' }}>{t('generatingStudyGuide', 'Generating your study guide, one moment...')}</p>
              </div>
            ) : currentTopic ? (
                <div style={{ opacity: isFading ? 0 : 1, transition: 'opacity 0.2s ease-in-out' }}>
                    <h2 style={{marginTop: 0}}>{currentTopic.topic}</h2>
                    <SummaryRenderer text={currentTopic.summary} />
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p>{t('noStudyGuide', 'Could not load study guide.')}</p>
                </div>
            )}
          </div>
           {/* Floating Page Navigation */}
           {flattenedTopics.length > 1 && (
                <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                   <button
                        onClick={() => handlePageChange(currentPageIndex - 1)}
                        disabled={currentPageIndex === 0 || isFading}
                        style={{
                            padding: '10px 15px',
                            background: 'rgba(50, 50, 50, 0.8)',
                            border: '1px solid #555',
                            color: 'white',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            opacity: currentPageIndex === 0 ? 0.3 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPageIndex + 1)}
                        disabled={currentPageIndex >= flattenedTopics.length - 1 || isFading}
                        style={{
                            padding: '10px 15px',
                            background: 'rgba(50, 50, 50, 0.8)',
                            border: '1px solid #555',
                            color: 'white',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            opacity: currentPageIndex >= flattenedTopics.length - 1 ? 0.3 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        Next Topic
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            )}
        </div>
      );
    }

  const contentWrapperStyle = {
    display: 'flex',
    flexDirection: mobileDimension ? 'column' : 'row',
    flex: 1,
    overflow: 'hidden',
    position: 'relative', // For MiniMap positioning on mobile
  };
  
  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: mobileDimension ? '15px' : '0 20px',
    marginTop: 0,
  };

  return (
    <div style={overlayStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>{t('studyGuide', 'Study Guide')}: {item.title}</h2>
        <div style={headerActionsStyle}>
          <button
            onClick={handleDownloadPDF}
            title={t('downloadPDF', 'Download as PDF')}
            style={{ ...closeButtonStyle, fontSize: '20px' }}
            disabled={isLoading || !guide || typeof guide === 'string'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button onClick={onClose} style={closeButtonStyle}>&times;</button>
        </div>
      </div>
      <div style={contentWrapperStyle}>
        <div ref={contentRef} style={contentStyle}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <p style={{ fontSize: '18px' }}>{t('generatingStudyGuide', 'Generating your study guide, one moment...')}</p>
            </div>
          ) : guide ? (
            typeof guide === 'string' ? <p style={{color: 'red'}}>{guide}</p> : (Array.isArray(guide) ? guide.map((topic, index) => <CollapsibleTopic key={topic.topic} topic={topic} topicId={`topic-${index}`} collapsedTopics={collapsedTopics} setCollapsedTopics={setCollapsedTopics} />) : <p>Invalid study guide format.</p>)
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <p>{t('noStudyGuide', 'Could not load study guide.')}</p>
            </div>
          )}
        </div>
      </div>
      <MiniMap guide={guide} onTopicSelect={handleTopicSelect} mobileDimension={mobileDimension} activeTopicId={activeTopicId} />
    </div>
  );
};

const deleteItemFromFirestore = async (subtitle, subcontent, subsubject, subpromptmode, subselectedmode, subcolor, subtag) => {
  console.log("deleteItemFromFirestore called with:", { subtitle, subcontent });
  try {
    const userEmail = user;
    const docRef = doc(db, "users", userEmail);
    const featuredDocRef = doc(db, "sets", "featured");

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.error("Document not found");
      return;
    }

    let currentSets = docSnap.data().sets || [];

    const setToDelete = currentSets.find(
      (item) =>
          item.title === subtitle &&
        item.content === subcontent
    );

    if (!setToDelete) {
      console.log("Set not found in user's sets");
      return;
    }

    if (setToDelete && setToDelete.isPublic) {
      const featuredSnap = await getDoc(featuredDocRef);
      if (featuredSnap.exists()) {
        const featuredSets = featuredSnap.data().sets || [];
        
        const matchingFeaturedSet = featuredSets.find(
          set => set.title === subtitle && 
                set.content === subcontent && 
                set.author === userEmail
        );

        if (matchingFeaturedSet) {
          await updateDoc(featuredDocRef, {
            sets: arrayRemove(matchingFeaturedSet)
          });
        }
      }
    }

    const updatedSets = currentSets.filter(
      (item) => !(item.title === subtitle && item.content === subcontent)
    );

    await updateDoc(docRef, { sets: updatedSets });
    setSets(updatedSets);

    const currentSet = JSON.parse(localStorage.getItem("currentSet"));
    if (currentSet && currentSet.title === subtitle) {
      localStorage.removeItem("currentSet");
    }
  } catch (error) {
    console.error("Error in deleteItemFromFirestore:", error);
  }
};

const generateBlob = (
  width = 200,
  height = 200,
  amplitude = Math.random() * 50,
  wavelength = Math.random() * 100 + 200,
  offset = Math.random() * 100
) => {
  const waveHeight = height / 2;

  let path = `M 0 ${waveHeight}`;
  for (let x = 0; x <= width; x += 10) {
    const y =
      waveHeight +
      amplitude * Math.sin(((x + offset) / wavelength) * 2 * Math.PI);
    path += ` L ${x} ${y}`;
  }

  path += ` L ${width} ${height} L 0 ${height} Z`;


  return path;
};

useEffect(() => {
  if (user) {
    const unsubscribe = onSnapshot(
      doc(db, "users", user),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setSets(docSnapshot.data().sets || []);

        } else {
          setSets([]);
        }
      },
      (error) => {
        console.error("Error fetching document:", error);
        alert("Error");
      }
    );
  
    return () => unsubscribe();
  } else {
    setSets([]);
  }
}, [user]);

const handleNewClick = () => {
  if (isTutorialRunning && tutorialStep === 6) {
    setTimeout(() => {
      handleNextStep();
    }, 500);
  }
  setStyle(0);
  setParams([]);
  setOpenNewTopic(!openNewTopic);
};

const handleLetMeCook = (item) => {
  if (isTutorialRunning && tutorialStep === 8) {
    handleNextStep();
  }
  setSelectedItem(item);
  setOpenMode(true);
};

const handleEdit = () => {
  if (!selectedItem) return;
  setOpenNewTopic(true);
};

const handleDelete = () => {
  if (!selectedItem) {
    return;
  }
  setShowDeleteConfirmation(true);
};

const confirmDelete = () => {
  deleteItemFromFirestore(
    selectedItem.title, 
    selectedItem.content, 
    selectedItem.subject, 
    selectedItem.promptMode, 
    selectedItem.scrollGenerationMode, 
    selectedItem.color, 
    selectedItem.tag
  );
  setShowDeleteConfirmation(false);
};

return (
  user ? (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: mobileDimension ? "center" : "flex-start",
      overflowX: "hidden",
      height: mobileDimension? '88%': '100%',
      position: "relative",
    }}
  >
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      backgroundColor: "black",
      width: "100%",
      paddingBottom: "10px",
      paddingTop: mobileDimension ? "30px" : "0"
    }}>
      <button
        onClick={() => navigate("/featured")}
        style={{
          background: "linear-gradient(90deg, #1a1a1a, #333333, #1a1a1a)",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "8px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          position: "fixed",
          right: "10px",
          top: "20px",
          zIndex: 2,
          fontSize: "14px"
        }}
      >
        {t("collections")}
      </button>
      
      <div style={{ 
        display: "flex",
        justifyContent: mobileDimension ? "center" : "space-between", 
        alignItems: "center",
        padding: "20px 50px 10px",
        position: "relative"
      }}>
        <h1 style={{ margin: 0, color: "white" }}>{t("myLibrary")}</h1>
      </div>
      <div style={{ 
        textAlign: mobileDimension ? "center" : "left",
        color: (!hasSubscription && sets.length >= 10) ? "#ff4444" : "white", 
        marginBottom: "10px",
        fontSize: "14px",
        opacity: 0.8,
        marginLeft: mobileDimension ? "0" : "50px",
        marginRight: mobileDimension ? "0" : "50px"
      }}>
        {hasSubscription ? (
          `${sets.length} sets added. No limit for Cookr Pro.`
        ) : (
          sets.length > 10 ? (
            <div>
              {sets.length} {t("outOf10Sets")}{" "}
              <span 
                onClick={() => navigate("/profile")}
                style={{ 
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "#ff4444"
                }}
              >
                {t("switchBackToPro")}
              </span>
            </div>
          ) : sets.length === 10 ? (
            <div>
              {sets.length} {t("outOf10Sets")}{" "}
              <span 
                onClick={() => navigate("/profile")}
                style={{ 
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "#ff4444"
                }}
              >
                {t("upgradeToPro")}
              </span>
            </div>
          ) : (
            `${sets.length} ${t("outOf10OnFree")}`
          )
        )}
      </div>
    </div>
  
    <div style={{
      overflowY: "auto",
      flex: 1,
      width: "100%"
    }}>
      <div
        style={{
          margin: "0px 50px",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: mobileDimension ? "center" : "flex-start",
          alignItems: mobileDimension ? "center" : "flex-start",
        }}
      >
        <div
          className="libCard tutorial-create-set-btn"
          style={{
          position: "fixed",
          bottom: mobileDimension ? "90px" : "30px",
          right: mobileDimension ? "3%" : "30px",
          width: mobileDimension ?"75px": "85px",
          height: mobileDimension ?"75px": "85px",
          borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          cursor: (!hasSubscription && sets.length >= 10) ? "not-allowed" : "pointer",
          color: (!hasSubscription && sets.length >= 10) ? "#666666" : "white",
            border: "1px solid #353935",
          background: "radial-gradient(circle at center,rgb(20, 18, 18), #1a1a1d)",
          boxShadow: "0 0px 12px rgb(155, 155, 155)",
          borderColor: "#8a8a8a",
          zIndex: 1000,
          opacity: (!hasSubscription && sets.length >= 10) ? 0.5 : 1,
        }}
        onClick={() => (!hasSubscription && sets.length >= 10) ? null : handleNewClick()}
        >
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      {sets &&
        sets.map((item, index) => (
          <div>
            <div
              className="libCard"
              key={index}
              style={{
                borderRadius: "10px",
                display: "flex",
                margin: "10px 10px",
                border:"1px solid #353935",
                backgroundColor: "#28282B",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative", 
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  cursor: 'pointer',
                  zIndex: 2,
                  padding: '5px',
                  background: '#202022',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={async () => {
                  setStudyGuideContent(item);
                  setShowStudyGuide(true);
                  
                  if (item.studyGuide) {
                    setStudyGuideData(item.studyGuide);
                    setIsGeneratingStudyGuide(false);
                    return;
                  }
                  
                  setIsGeneratingStudyGuide(true);
                  setStudyGuideData(null);

                  try {
                    const response = await fetch('http://localhost:5002/genAI/generate-study-guide', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        language: i18n.language,
                        info: {
                          promptMode: item.promptMode,
                          content: item.content,
                          subject: item.subject,
                        },
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to generate study guide');
                    }

                    const guideData = await response.json();
                    setStudyGuideData(guideData);

                    // --- [NEW] Save the generated guide to Firestore ---
                    const userDocRef = doc(db, 'users', user);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                      const userSets = userDocSnap.data().sets || [];
                      const setIndex = userSets.findIndex(s => s.title === item.title && s.content === item.content);
                      if (setIndex !== -1) {
                        const updatedSets = [...userSets];
                        updatedSets[setIndex].studyGuide = guideData;
                        await updateDoc(userDocRef, { sets: updatedSets });
                      }
                    }
                    // --- End of new logic ---

                  } catch (error) {
                    console.error("Error generating study guide:", error);
                    setStudyGuideData(`Error: ${error.message}`);
                  } finally {
                    setIsGeneratingStudyGuide(false);
                  }
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <p
                style={{
                  color: "whitesmoke",
                  padding: "10px 10px",
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "24px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap", 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                }}
              >
                { mobileDimension ? item.title :  item.title.slice(0, 12)}
                <span
                  onClick={() => {
                    setStyle(1);
                    setParams([
                      item.color,
                      item.content,
                      item.promptMode,
                      item.subject,
                      item.tag,
                      item.title,
                      item.scrollGenerationMode,
                      item.author
                    ]);
                    setOpenNewTopic(!openNewTopic);
                  }}
                  style={{
                    fontSize: "14px",
                    fontWeight: "normal",
                    cursor: "pointer",
                  }}
                >
                  {t('edit')}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ marginLeft: "5px" }}
                    viewBox="0 0 512 512"
                    fill={"white"}
                    height={10}
                  >
                    <path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" />
                  </svg>
                </span>
              </p>

              <div style={{ margin: '10px' }}>
                <button
                  className={`tutorial-let-me-cook-btn ${
                    isTutorialRunning && tutorialStep === 8 && index === sets.length - 1
                      ? 'tutorial-targeted-let-me-cook-btn'
                      : ''
                  }`}
                  style={{
                    width: '100%',
                    color: "white",
                    background: `#6A6CFF`,
                    boxShadow: `0px 5px 0px 0px #484AC3`,
                    padding: "10px",
                    borderRadius: "10px",
                    fontSize: '15px',
                    textAlign: "center",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleLetMeCook(item)}
                >
                  Let me cook
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
    
    {openMode && (
      <div
        style={{
          position: "fixed",
          backgroundColor: "#181818",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          zIndex: "999999999",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "30px 50px",
          position: "relative"
        }}>
          <svg
            onClick={() => {
              if (!(isTutorialRunning && tutorialStep === 8)) {
                setOpenMode(false);
              }
            }}
            style={{
              cursor: (isTutorialRunning && tutorialStep === 8) ? "not-allowed" : "pointer",
              position: "absolute",
              left: "20px"
            }}
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          <p
            style={{
              textAlign: "center",
              color: "white",
              fontSize: "30px",
              margin: "0 auto"
            }}
          >
            {t("selectMode")}
          </p>
        </div>
        <hr style={{
          width: "100%",
          border: "1px solid #555",
          margin: "0"
        }} />
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: "1dvh",
          padding: "0%",
          justifyContent: "flex-start",
          alignItems: "center",
          flex: 1,
          marginTop: "5%"
        }}>
          <button
            className="tutorial-mcq-btn"
            style={{
              color: "white",
              background: `#0194a3`,
              boxShadow: `0px 2px 0px 5px #00b3d1`,
              padding: "20px",
              borderRadius: "10px",
              fontSize: "23px",
              textAlign: "center",
              border: "none",
              cursor: "pointer",
              width: "90%",
              height: "20dvh",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onClick={() => {
              if (!selectedItem) return;
              if (isTutorialRunning && tutorialStep !== 8) {
                goToStep(8);
              }
              localStorage.setItem("currentSet", JSON.stringify(selectedItem));
              localStorage.removeItem("lastSet");
              localStorage.removeItem("lastFlashSet");
              localStorage.setItem("mode", 1);
              navigate("/");
            }}
            disabled={isTutorialRunning && tutorialStep === 8 && !selectedItem}
          >
            <span style={{ fontWeight: "bold" }}>{t("multipleChoice")}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18dvw"
              height="18dvh"
            >
              <path
                fill="currentColor"
                d="M3 12a3.5 3.5 0 0 1 3.5-3.5c1.204 0 2.02.434 2.7 1.113c.726.727 1.285 1.72 1.926 2.873l.034.06c.6 1.082 1.283 2.311 2.227 3.255c1.008 1.008 2.316 1.699 4.113 1.699a5.5 5.5 0 1 0-4.158-9.1a24 24 0 0 1 1.122 1.857A3.5 3.5 0 1 1 17.5 15.5c-1.203 0-2.02-.434-2.7-1.113c-.726-.727-1.285-1.72-1.926-2.873l-.034-.06c-.6-1.082-1.283-2.311-2.227-3.255C9.605 7.191 8.297 6.5 6.5 6.5a5.5 5.5 0 1 0 4.158 9.1a24 24 0 0 1-1.122-1.857A3.5 3.5 0 0 1 3 12"
              ></path>
            </svg>
          </button>
          <button
            style={{
              color: "white",
              background: `#6700d9`,
              boxShadow: `0px 2px 0px 5px #7729cf`,
              padding: "20px",
              borderRadius: "10px",
              fontSize: "23px",
              textAlign: "center",
              border: "none",
              cursor: (isTutorialRunning && tutorialStep === 8) ? "not-allowed" : "pointer",
              width: "90%",
              marginTop:'4dvh',
              height: "20dvh",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onClick={() => {
              if (isTutorialRunning && tutorialStep === 8) return;
              if (!selectedItem) return;
              localStorage.setItem("currentSet", JSON.stringify(selectedItem));
              localStorage.removeItem("lastSet");
              localStorage.removeItem("lastFlashSet");
              localStorage.setItem("mode", 2);
              navigate("/");
            }}
            disabled={isTutorialRunning && tutorialStep === 8}
          >
            <span style={{ fontWeight: "bold" }}>{t("flashcards")}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 14 14"
              width="15dvw"
              height="15dvh"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="8" height="6" x="5.5" y="1.5" rx="1"></rect>
                <path d="M11 10H4a1 1 0 0 1-1-1V4"></path>
                <path d="M9 12.5H1.5a1 1 0 0 1-1-1V6"></path>
              </g>
            </svg>
          </button>
          <button
            style={{
              color: "white",
              background: `rgb(169, 0, 0)`,
              boxShadow: `0px 2px 0px 5px rgb(255, 8, 8)`,
              padding: "20px",
              borderRadius: "10px",
              fontSize: "23px",
              textAlign: "center",
              border: "none",
              cursor: (isTutorialRunning && tutorialStep === 8) ? "not-allowed" : (hasSubscription ? "pointer" : "not-allowed"),
              width: "90%",
              marginTop:'4dvh',
              height: "20dvh",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: hasSubscription ? 1 : 0.5,
              position: "relative"
            }}
            onClick={() => {
              if (isTutorialRunning && tutorialStep === 8) return;
              if (!selectedItem || !hasSubscription) return;
              localStorage.setItem("currentSet", JSON.stringify(selectedItem));
              localStorage.removeItem("lastSet");
              localStorage.removeItem("lastFlashSet");
              localStorage.setItem("mode", 3);
              navigate("/");
            }}
            disabled={isTutorialRunning && tutorialStep === 8}
          >
            <span style={{ fontWeight: "bold" }}>{t("freeResponse")}</span>
            {!hasSubscription && (
              <div style={{
                position: "absolute",
                top: "2px",
                right: "10px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "gold",
                fontSize: "14px"
              }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {t("proOnly")}
              </div>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="16dvw"
              height="15dvh"
            >
              <path
                fill="currentColor"
                d="m497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9M284.2 99.8L21.6 362.4L.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3l262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0M124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0M88 424h48v36.3l-64.5 11.3l-31.1-31.1L51.7 376H88z"
              ></path>
            </svg>
          </button>
        </div>
        <ModeSelectionTutorialAdvance />
      </div>
    )}
    {openNewTopic && (
      <NewPrompt
        setOpenNewTopic={setOpenNewTopic}
        style={style}
        params={params}
        mobileDimension={mobileDimension}
      />
    )}
    {showDeleteConfirmation && (
      <DeleteConfirmationPopup 
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
      />
    )}
    {showStudyGuide && (
      <StudyGuideOverlay
        item={studyGuideContent}
        onClose={() => setShowStudyGuide(false)}
        mobileDimension={mobileDimension}
        guide={studyGuideData}
        isLoading={isGeneratingStudyGuide}
      />
    )}
  </div>
  ):(
    <div></div>
  )
);
};

export default MyLibrary;

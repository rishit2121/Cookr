import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  where,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase/Firebase';
import { useTranslation } from 'react-i18next';

// Whitelisted emails that can create announcements
const WHITELISTED_EMAILS = [
  'satvik.sharma110@gmail.com',
  // Add more whitelisted emails here
];

const Announcement = ({ mobileDimension, user, onClose }) => {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Check if user is whitelisted
  const isWhitelisted = WHITELISTED_EMAILS.includes(user);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const q = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const announcementsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const announcementData = {
            id: doc.id,
            ...doc.data()
          };
          
          // Get view count for this announcement
          try {
            const viewsQuery = query(collection(db, 'userAnnouncements'));
            const viewsSnapshot = await getDocs(viewsQuery);
            let viewCount = 0;
            
            viewsSnapshot.docs.forEach(userDoc => {
              const userData = userDoc.data();
              const seenAnnouncements = userData.seenAnnouncements || [];
              if (seenAnnouncements.includes(doc.id)) {
                viewCount++;
              }
            });
            
            announcementData.viewCount = viewCount;
          } catch (viewError) {
            console.error('Error fetching view count:', viewError);
            announcementData.viewCount = 0;
          }
          
          return announcementData;
        })
      );
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to fetch announcements');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      // Auto-dismiss error after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const announcementData = {
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date(),
        createdBy: user,
        isActive: true
      };

      if (editingId) {
        // Update existing announcement
        await updateDoc(doc(db, 'announcements', editingId), {
          ...announcementData,
          updatedAt: new Date()
        });
      } else {
        // Create new announcement
        await addDoc(collection(db, 'announcements'), announcementData);
      }

      // Reset form
      setTitle('');
      setContent('');
      setEditingId(null);
      setShowCreateForm(false);
      
      // Refresh announcements
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      setError('Failed to save announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setTitle(announcement.title);
    setContent(announcement.content);
    setEditingId(announcement.id);
    setShowCreateForm(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, 'announcements', deleteId));
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError('Failed to delete announcement');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };


  if (showCreateForm) {
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
        padding: mobileDimension ? '5px' : '40px'
      }}>
        <div style={{
          backgroundColor: '#232323',
          borderRadius: '20px',
          padding: mobileDimension ? '20px' : '30px',
          width: mobileDimension ? '90vw' : '500px',
          maxWidth: mobileDimension ? '90vw' : '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          margin: '0 auto',
          transform: mobileDimension ? 'translateX(-5px)' : 'none'
        }}>
          <button
            onClick={() => {
              setShowCreateForm(false);
              setTitle('');
              setContent('');
              setEditingId(null);
              setError('');
            }}
            style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>

          <h2 style={{ color: 'white', marginBottom: '20px', marginTop: '10px' }}>
            {editingId ? 'Edit Announcement' : 'Create Announcement'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: error && !title.trim() ? '2px solid #ff4444' : '1px solid #444',
                  backgroundColor: '#333',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter announcement title"
              />
            </div>


            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: error && !content.trim() ? '2px solid #ff4444' : '1px solid #444',
                  backgroundColor: '#333',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  minHeight: '150px',
                  maxHeight: '300px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  overflowY: 'auto'
                }}
                placeholder="Enter announcement content"
              />
            </div>

            {error && (
              <p style={{
                color: '#ff4444',
                marginTop: '-20px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </p>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: mobileDimension ? 'center' : 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setTitle('');
                  setContent('');
                  setEditingId(null);
                  setError('');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  minWidth: mobileDimension ? '120px' : 'auto'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isLoading ? '#666' : '#2f88ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  minWidth: mobileDimension ? '120px' : 'auto'
                }}
              >
                {isLoading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
      padding: mobileDimension ? '5px' : '40px'
    }}>
      <div style={{
        backgroundColor: '#232323',
        borderRadius: '20px',
        padding: mobileDimension ? '20px' : '30px',
        width: mobileDimension ? '90vw' : '600px',
        maxWidth: mobileDimension ? '90vw' : '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        margin: '0 auto',
        transform: mobileDimension ? 'translateX(-5px)' : 'none'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        <h2 style={{ color: 'white', marginBottom: '20px', marginTop: '10px' }}>
          Announcements
        </h2>

        {isWhitelisted && (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              backgroundColor: '#2f88ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create Announcement
          </button>
        )}

        {error && (
          <div style={{
            color: '#ff4444',
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            borderRadius: '8px',
            border: '1px solid #ff4444'
          }}>
            {error}
          </div>
        )}

        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {announcements.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#888',
              padding: '40px 20px',
              fontSize: '16px'
            }}>
              No announcements yet
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                style={{
                  backgroundColor: '#363636',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '15px',
                  border: '2px solid #2f88ff'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: 'white',
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                      {announcement.title}
                    </h3>
                    <div style={{
                      color: '#ccc',
                      margin: 0,
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      paddingRight: '8px',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#666 #333'
                    }}
                    className="announcement-content-scroll"
                    >
                      {announcement.content}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #444'
                }}>
                  <div style={{ color: '#888', fontSize: '14px' }}>
                    {new Date(announcement.createdAt?.toDate?.() || announcement.createdAt).toLocaleDateString()}
                    <span style={{ marginLeft: '10px', color: '#2f88ff' }}>
                      seen by {announcement.viewCount || 0}
                    </span>
                    {announcement.updatedAt && (
                      <span style={{ marginLeft: '10px' }}>
                        (Updated: {new Date(announcement.updatedAt?.toDate?.() || announcement.updatedAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>

                  {isWhitelisted && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(announcement)}
                        style={{
                          backgroundColor: '#2f88ff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        style={{
                          backgroundColor: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
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
          zIndex: 10001
        }}>
          <div style={{
            backgroundColor: '#232323',
            borderRadius: '20px',
            padding: '30px',
            width: mobileDimension ? '90vw' : '400px',
            maxWidth: '95vw',
            position: 'relative',
            border: '2px solid #ff4444'
          }}>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '20px', 
              textAlign: 'center',
              fontSize: '18px'
            }}>
              Delete Announcement
            </h3>
            <p style={{ 
              color: '#ccc', 
              marginBottom: '30px', 
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center'
            }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  minWidth: '100px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  minWidth: '100px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;

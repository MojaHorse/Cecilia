import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchBookmarks(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  async function fetchBookmarks(uid) {
    try {
      setLoading(true);
      const q = query(
        collection(db, "bookmarks"),
        where("userId", "==", uid)
      );
      const querySnapshot = await getDocs(q);
      const bks = [];
      querySnapshot.forEach(docSnap => {
        bks.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort in memory
      bks.sort((a, b) => b.timestamp - a.timestamp);
      setBookmarks(bks);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId) => {
    try {
      await deleteDoc(doc(db, "bookmarks", bookmarkId));
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error("Error removing bookmark", err);
    }
  };

  return (
    <div className="page-content-inner">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title">My Bookmarks</h1>
        <p style={{ color: 'var(--color-ink-light)', marginTop: '0.5rem', fontFamily: 'var(--font-serif-body)', fontSize: '1.2rem' }}>
          All your saved verses across the Bible.
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-ink-light)' }}>Loading your bookmarks...</p>
      ) : !user ? (
        <p style={{ textAlign: 'center', color: 'var(--color-ink-light)' }}>Connecting to your account...</p>
      ) : bookmarks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-cream-dark)', borderRadius: '16px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="var(--color-ink-light)" strokeWidth={1} style={{ marginBottom: '1rem', margin: '0 auto', display: 'block' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p style={{ color: 'var(--color-ink-light)', fontSize: '1.1rem' }}>You haven't bookmarked any verses yet.</p>
          <Link to="/bible" className="pill-button" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Start Reading</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {bookmarks.map(bk => (
            <div key={bk.id} style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              <button 
                onClick={() => removeBookmark(bk.id)}
                style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: 'var(--color-ink-light)',
                  padding: '4px'
                }}
                title="Remove Bookmark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              <div style={{ fontSize: '0.875rem', color: 'var(--color-burgundy)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                {bk.bookId} {bk.chapterId.split('.').pop()}:{bk.verseKey.split('.').pop()}
              </div>
              
              <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif-body)', lineHeight: 1.6, color: 'var(--color-ink)', flexGrow: 1, marginBottom: '1.5rem' }}>
                "{bk.text}"
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-start' }}>
                <Link 
                  to={`/bible/${bk.bookId}/${bk.chapterId}`}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    borderRadius: '999px',
                    background: 'var(--color-cream)',
                    color: 'var(--color-burgundy)',
                    textDecoration: 'none'
                  }}
                >
                  Read Chapter →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;

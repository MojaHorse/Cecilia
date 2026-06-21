import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { fetchPassage, fetchChapters, BOOK_NAMES } from '../services/bibleService';
import { useLanguage, languageToBibleId } from '../context/LanguageContext';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const BibleReadPage = () => {
  const { bookId, chapterId } = useParams();
  const [passages, setPassages] = useState([]);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isFullRead, setIsFullRead] = useState(false);
  
  const [highlights, setHighlights] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [popover, setPopover] = useState({ visible: false, x: 0, y: 0, verseKey: null });

  const { uiLang } = useLanguage();
  const bibleId = languageToBibleId[uiLang] || 42;
  const observer = useRef();

  const fetchBookHighlights = async (userId) => {
    try {
      const q = query(
        collection(db, "highlights"),
        where("userId", "==", userId),
        where("bibleId", "==", bibleId),
        where("bookId", "==", bookId)
      );
      const querySnapshot = await getDocs(q);
      const highlightsMap = {};
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        highlightsMap[data.verseKey] = data.color;
      });
      setHighlights(highlightsMap);
    } catch (err) {
      console.error("Error fetching highlights:", err);
    }
  };

  const fetchUserBookmarks = async (userId) => {
    try {
      const q = query(
        collection(db, "bookmarks"),
        where("userId", "==", userId),
        where("bibleId", "==", bibleId),
        where("bookId", "==", bookId)
      );
      const querySnapshot = await getDocs(q);
      const bookmarksMap = {};
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        bookmarksMap[data.verseKey] = data; // store the whole object or just true
      });
      setBookmarks(bookmarksMap);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchBookHighlights(user.uid);
        fetchUserBookmarks(user.uid);
      }
    });
    return () => unsubscribe();
  }, [bibleId, bookId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedPassage, fetchedChapters] = await Promise.all([
          fetchPassage(bibleId, `${bookId}.${chapterId}`),
          fetchChapters(bibleId, bookId)
        ]);
        
        setPassages([{ ...fetchedPassage, chapterId }]);
        setAllChapters(fetchedChapters);
      } catch (err) {
        setError('Failed to load chapter content.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    setIsFullRead(false);
    setPopover({ visible: false, x: 0, y: 0, verseKey: null });
  }, [bibleId, bookId, chapterId]);

  const lastLoadedChapterId = passages.length > 0 ? passages[passages.length - 1].chapterId : null;
  const currentIdx = allChapters.findIndex(c => c.id === lastLoadedChapterId);
  
  const firstIdx = allChapters.findIndex(c => c.id === chapterId);
  const prevChapter = firstIdx > 0 ? allChapters[firstIdx - 1] : null;
  const nextChapter = currentIdx !== -1 && currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null;

  const loadNextChapter = async () => {
    if (!nextChapter || loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPassage = await fetchPassage(bibleId, `${bookId}.${nextChapter.id}`);
      setPassages(prev => [...prev, { ...nextPassage, chapterId: nextChapter.id }]);
    } catch (err) {
      console.error('Failed to load next chapter', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const lastElementRef = useCallback(node => {
    if (loadingMore || !isFullRead) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextChapter) {
        loadNextChapter();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, isFullRead, nextChapter]);

  const handlePassageClick = (e, chapterId) => {
    const pEl = e.target.closest('.p');
    if (!pEl) return;
    
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    
    const vSpan = pEl.querySelector('.yv-v');
    if (vSpan) {
      const verseNum = vSpan.getAttribute('v');
      const verseKey = `${chapterId}.${verseNum}`;
      
      let rawText = pEl.textContent.trim();
      if (rawText.startsWith(verseNum)) {
         rawText = rawText.substring(verseNum.length).trim();
      }
      
      const containerRect = pEl.closest('.bible-read-container').getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      const relativeY = e.clientY - containerRect.top;

      setPopover({
        visible: true,
        x: relativeX,
        y: relativeY,
        verseKey,
        text: rawText
      });
    }
  };

  // Hide popover on scroll or click elsewhere
  useEffect(() => {
    const hidePopover = (e) => {
      if (e.target.closest && !e.target.closest('.highlight-popover') && !e.target.closest('.p')) {
        setPopover(prev => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('scroll', hidePopover, { passive: true });
    window.addEventListener('click', hidePopover);
    return () => {
      window.removeEventListener('scroll', hidePopover);
      window.removeEventListener('click', hidePopover);
    };
  }, []);

    const toggleBookmark = async (e) => {
    if (e) {
      e.stopPropagation();
      if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    }
    const { verseKey, text } = popover;
    if (!verseKey) return;
    
    const isBookmarked = !!bookmarks[verseKey];
    
    setBookmarks(prev => {
      const newMap = { ...prev };
      if (isBookmarked) delete newMap[verseKey];
      else newMap[verseKey] = { text, timestamp: new Date(), bibleId, bookId, chapterId: verseKey.split('.').slice(0, 2).join('.') };
      return newMap;
    });
    
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, "bookmarks", `${auth.currentUser.uid}_${bibleId}_${verseKey}`);
      if (isBookmarked) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          userId: auth.currentUser.uid,
          bibleId,
          bookId,
          chapterId: verseKey.split('.').slice(0, 2).join('.'),
          verseKey,
          text,
          timestamp: new Date()
        });
        
        // If they are anonymous, prompt them to save their data
        if (auth.currentUser.isAnonymous) {
           window.dispatchEvent(new CustomEvent('openAuthModal', { 
             detail: { message: "Want to save your bookmarks permanently? Create a free account to sync your data across all your devices." } 
           }));
        }
      }
    } catch (err) {
      console.error("Error saving bookmark", err);
    }
  };

  const applyHighlight = async (color, e) => {
    if (e) {
      e.stopPropagation();
      if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    }
    const { verseKey } = popover;
    if (!verseKey) return;
    
    setHighlights(prev => {
      const newMap = { ...prev };
      if (color === 'clear') {
        delete newMap[verseKey];
      } else {
        newMap[verseKey] = color;
      }
      return newMap;
    });
    
    setPopover(prev => ({ ...prev, visible: false }));

    if (!auth.currentUser) {
      console.warn("Not signed in, highlight won't save to cloud.");
      return;
    }

    try {
      const docRef = doc(db, "highlights", `${auth.currentUser.uid}_${bibleId}_${verseKey}`);
      if (color === 'clear') {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          userId: auth.currentUser.uid,
          bibleId,
          bookId,
          chapterId: verseKey.split('.').slice(0, 2).join('.'),
          verseKey,
          color,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error("Error saving highlight", err);
    }
  };

  if (loading && passages.length === 0) {
    return <div className="page-content-inner"><p>Loading chapter...</p></div>;
  }

  if (error && passages.length === 0) {
    return <div className="page-content-inner"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="page-content-inner bible-read-container" style={{ position: 'relative' }}>
      
      <style>
        {Object.entries(highlights).map(([key, color]) => {
          const parts = key.split('.');
          const verseNum = parts.pop();
          const chapterId = parts.join('.');
          return `
            [data-chapter-id="${chapterId}"] .p:has(.yv-v[v="${verseNum}"]) {
              background-color: ${color};
              border-radius: 4px;
            }
          `;
        }).join('\n')}
        {Object.keys(bookmarks).map((key) => {
          const parts = key.split('.');
          const verseNum = parts.pop();
          const chapterId = parts.join('.');
          return `
            [data-chapter-id="${chapterId}"] .yv-v[v="${verseNum}"]::after {
              content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%23ef4444' viewBox='0 0 24 24' stroke='%23ef4444' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' /%3E%3C/svg%3E");
              display: inline-block;
              vertical-align: text-bottom;
              margin-left: 4px;
              margin-right: 2px;
            }
          `;
        }).join('\n')}
      </style>

      {popover.visible && (
        <div className="highlight-popover" style={{
          position: 'absolute',
          top: Math.max(0, popover.y - 65),
          left: Math.max(0, popover.x - 120),
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          zIndex: 1000
        }}>
          <button onClick={(e) => applyHighlight('#fef08a', e)} style={{ background: '#fef08a', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Yellow"></button>
          <button onClick={(e) => applyHighlight('#fbcfe8', e)} style={{ background: '#fbcfe8', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Pink"></button>
          <button onClick={(e) => applyHighlight('#bfdbfe', e)} style={{ background: '#bfdbfe', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Blue"></button>
          <button onClick={(e) => applyHighlight('#bbf7d0', e)} style={{ background: '#bbf7d0', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Green"></button>
          <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }}></div>
          <button onClick={(e) => applyHighlight('clear', e)} style={{ background: 'transparent', width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d1d5db', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#6b7280' }} aria-label="Clear">✕</button>
          <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }}></div>
          <button onClick={(e) => toggleBookmark(e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: bookmarks[popover.verseKey] ? '#ef4444' : '#9ca3af' }} aria-label="Bookmark">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={bookmarks[popover.verseKey] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      )}

      <div className="bible-read-header">
        <Link to={`/bible/${bookId}`} className="back-link">← {BOOK_NAMES[bookId] || bookId}</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title" style={{ margin: 0 }}>{passages[0]?.reference}</h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => {
                if (isFullRead) {
                  setPassages(prev => [prev[0]]);
                }
                setIsFullRead(!isFullRead);
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                border: `1px solid ${isFullRead ? 'var(--color-burgundy)' : 'var(--color-border)'}`,
                background: isFullRead ? 'var(--color-cream)' : 'transparent',
                color: isFullRead ? 'var(--color-burgundy)' : 'var(--color-ink)',
                fontFamily: 'var(--font-sans)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Full Read: {isFullRead ? 'ON' : 'OFF'}
            </button>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-sans)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Bookmarks
            </button>
          </div>
        </div>
      </div>
      
      {passages.map((passage, index) => (
        <div key={passage.chapterId} style={{ marginBottom: '3rem' }} data-chapter-id={passage.chapterId}>
          {index > 0 && <h2 style={{ fontFamily: 'var(--font-serif-heading)', color: 'var(--color-ink-light)', borderTop: '1px solid var(--color-border)', paddingTop: '2rem', marginTop: '2rem' }}>{passage.reference}</h2>}
          <div 
            className="bible-read-content" 
            dangerouslySetInnerHTML={{ __html: passage.content }} 
            onClick={(e) => handlePassageClick(e, passage.chapterId)}
          />
        </div>
      ))}

      {isFullRead && nextChapter && (
        <div ref={lastElementRef} style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--color-ink-light)', fontStyle: 'italic' }}>
          {loadingMore ? <p>Loading next chapter...</p> : <p>Scroll down for more</p>}
        </div>
      )}

      {(!isFullRead || !nextChapter) && (
        <div className="bible-navigation-footer">
          {prevChapter ? (
            <Link to={`/bible/${bookId}/${prevChapter.id}`} className="nav-btn prev-btn">
              ← {prevChapter.title}
            </Link>
          ) : <div />}
          
          {nextChapter ? (
            <Link to={`/bible/${bookId}/${nextChapter.id}`} className="nav-btn next-btn">
              {nextChapter.title} →
            </Link>
          ) : <div />}
        </div>
      )}

      {/* Bookmarks Drawer */}
      {createPortal(
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '320px',
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
            transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 10000,
            padding: '2rem',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Bookmarks</h2>
              <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {Object.keys(bookmarks).length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No bookmarks yet. Click a verse and tap the bookmark icon to save it.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(bookmarks)
                  .sort((a, b) => b[1].timestamp - a[1].timestamp)
                  .map(([key, data]) => (
                  <div key={key} style={{ backgroundColor: '#374151', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {data.bookId} {data.chapterId.split('.').pop()}:{key.split('.').pop()}
                    </div>
                    <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#e5e7eb' }}>
                      "{data.text}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Overlay */}
          {isDrawerOpen && (
            <div 
              onClick={() => setIsDrawerOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(2px)',
                zIndex: 9999
              }}
            />
          )}
        </>,
        document.body
      )}
    </div>
  );
};

export default BibleReadPage;

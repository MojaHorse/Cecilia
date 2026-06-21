import React, { useEffect, useState, useRef, useCallback } from 'react';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchBookHighlights(user.uid);
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
    
    const vSpan = pEl.querySelector('.yv-v');
    if (vSpan) {
      const verseNum = vSpan.getAttribute('v');
      const verseKey = `${chapterId}.${verseNum}`;
      
      const x = Math.min(e.clientX, window.innerWidth - 150);
      setPopover({
        visible: true,
        x: x,
        y: e.clientY,
        verseKey
      });
    }
  };

  // Hide popover on scroll or click elsewhere
  useEffect(() => {
    const hidePopover = (e) => {
      if (e.target.closest && !e.target.closest('.highlight-popover') && !e.target.closest('.bible-read-content .p')) {
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

  const applyHighlight = async (color, e) => {
    if (e) e.stopPropagation();
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
          const [chapterId, verseNum] = key.split('.');
          return `
            [data-chapter-id="${chapterId}"] .p:has(.yv-v[v="${verseNum}"]) {
              background-color: ${color};
              border-radius: 4px;
            }
          `;
        }).join('\n')}
      </style>

      {popover.visible && (
        <div className="highlight-popover" style={{
          position: 'fixed',
          top: popover.y - 50,
          left: popover.x,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '8px',
          padding: '8px',
          zIndex: 1000
        }}>
          <button onClick={(e) => applyHighlight('#fef08a', e)} style={{ background: '#fef08a', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Yellow"></button>
          <button onClick={(e) => applyHighlight('#fbcfe8', e)} style={{ background: '#fbcfe8', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Pink"></button>
          <button onClick={(e) => applyHighlight('#bfdbfe', e)} style={{ background: '#bfdbfe', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Blue"></button>
          <button onClick={(e) => applyHighlight('#bbf7d0', e)} style={{ background: '#bbf7d0', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Green"></button>
          <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }}></div>
          <button onClick={(e) => applyHighlight('clear', e)} style={{ background: 'transparent', width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d1d5db', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#6b7280' }} aria-label="Clear">✕</button>
        </div>
      )}

      <div className="bible-read-header">
        <Link to={`/bible/${bookId}`} className="back-link">← {BOOK_NAMES[bookId] || bookId}</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title" style={{ margin: 0 }}>{passages[0]?.reference}</h1>
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
            {isFullRead ? 'Full Read: ON' : 'Full Read: OFF'}
          </button>
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
    </div>
  );
};

export default BibleReadPage;

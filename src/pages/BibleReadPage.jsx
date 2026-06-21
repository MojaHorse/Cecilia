import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPassage, fetchChapters, BOOK_NAMES } from '../services/bibleService';
import { useLanguage, languageToBibleId } from '../context/LanguageContext';

const BibleReadPage = () => {
  const { bookId, chapterId } = useParams();
  const [passages, setPassages] = useState([]);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isFullRead, setIsFullRead] = useState(false);
  
  const { uiLang } = useLanguage();
  const bibleId = languageToBibleId[uiLang] || 42;
  const observer = useRef();

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
    setIsFullRead(false); // Reset when URL chapter changes
  }, [bibleId, bookId, chapterId]);

  // Find index of the LAST loaded chapter in allChapters
  const lastLoadedChapterId = passages.length > 0 ? passages[passages.length - 1].chapterId : null;
  const currentIdx = allChapters.findIndex(c => c.id === lastLoadedChapterId);
  
  // Prev is based on the FIRST loaded chapter (which is chapterId from URL)
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

  if (loading && passages.length === 0) {
    return <div className="page-content-inner"><p>Loading chapter...</p></div>;
  }

  if (error && passages.length === 0) {
    return <div className="page-content-inner"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="page-content-inner bible-read-container">
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
        <div key={passage.chapterId} style={{ marginBottom: '3rem' }}>
          {index > 0 && <h2 style={{ fontFamily: 'var(--font-serif-heading)', color: 'var(--color-ink-light)', borderTop: '1px solid var(--color-border)', paddingTop: '2rem', marginTop: '2rem' }}>{passage.reference}</h2>}
          <div 
            className="bible-read-content" 
            dangerouslySetInnerHTML={{ __html: passage.content }} 
          />
        </div>
      ))}

      {isFullRead && nextChapter && (
        <div ref={lastElementRef} style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--color-ink-light)', fontStyle: 'italic' }}>
          {loadingMore ? <p>Loading next chapter...</p> : <p>Scroll down for more</p>}
        </div>
      )}

      {/* When Full Read is OFF or we reached the end, show standard footer */}
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

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPassage, fetchChapters, BOOK_NAMES } from '../services/bibleService';
import { useLanguage, languageToBibleId } from '../context/LanguageContext';

const BibleReadPage = () => {
  const { bookId, chapterId } = useParams(); // e.g. 'GEN', 'GEN.1'
  const [passage, setPassage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  
  const { uiLang } = useLanguage();
  const bibleId = languageToBibleId[uiLang] || 42;
  const contentRef = useRef(null);

  useEffect(() => {
    // Also load chapters so we know what is prev/next
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedPassage, fetchedChapters] = await Promise.all([
          fetchPassage(bibleId, `${bookId}.${chapterId}`),
          fetchChapters(bibleId, bookId)
        ]);
        
        setPassage(fetchedPassage);
        setAllChapters(fetchedChapters);
      } catch (err) {
        setError('Failed to load chapter content.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [bibleId, bookId, chapterId]);

  // Find prev/next chapter
  const currentIdx = allChapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentIdx > 0 ? allChapters[currentIdx - 1] : null;
  const nextChapter = currentIdx !== -1 && currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null;

  if (loading) {
    return <div className="page-content-inner"><p>Loading chapter...</p></div>;
  }

  if (error) {
    return <div className="page-content-inner"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="page-content-inner bible-read-container">
      <div className="bible-read-header">
        <Link to={`/bible/${bookId}`} className="back-link">← {BOOK_NAMES[bookId] || bookId}</Link>
        <h1 className="page-title">{passage?.reference}</h1>
      </div>
      
      {/* YouVersion returns the text as HTML (with span classes for verses, chapters, etc.) */}
      <div 
        className="bible-read-content" 
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: passage?.content }} 
      />

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
    </div>
  );
};

export default BibleReadPage;

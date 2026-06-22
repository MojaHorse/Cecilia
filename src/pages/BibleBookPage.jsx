import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchChapters, BOOK_NAMES } from '../services/bibleService';
import { useLanguage, languageToBibleId } from '../context/LanguageContext';

const BibleBookPage = () => {
  const { bookId } = useParams(); // e.g., 'GEN'
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { uiLang, t } = useLanguage();
  const bibleId = languageToBibleId[uiLang] || 42;

  useEffect(() => {
    const loadChapters = async () => {
      try {
        setLoading(true);
        const fetchedChapters = await fetchChapters(bibleId, bookId);
        setChapters(fetchedChapters);
      } catch (err) {
        setError(t('bible_error'));
      } finally {
        setLoading(false);
      }
    };
    
    loadChapters();
  }, [bibleId, bookId, t]);

  if (loading) {
    return <div className="page-content-inner"><p>{t('bible_loading')}</p></div>;
  }

  if (error) {
    return <div className="page-content-inner"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="page-content-inner">
      <Link to="/bible" className="back-link">←</Link>
      <h1 className="page-title">{BOOK_NAMES[bookId] || bookId}</h1>
      
      <div className="bible-chapters-compact-grid">
        {chapters.map(chapter => (
          <Link 
            key={chapter.id} 
            to={`/bible/${bookId}/${chapter.id}`} 
            className="bible-chapter-btn"
          >
            {chapter.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BibleBookPage;

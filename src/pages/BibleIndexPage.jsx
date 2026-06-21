import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBooks, BOOK_NAMES } from '../services/bibleService';
import { useLanguage } from '../context/LanguageContext';
import { languageToBibleId } from '../context/LanguageContext';

const BibleIndexPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { uiLang, t } = useLanguage();
  const bibleId = languageToBibleId[uiLang] || 42; // Default to CPDV if not found

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const fetchedBooks = await fetchBooks(bibleId);
        setBooks(fetchedBooks);
      } catch (err) {
        setError('Failed to load books. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    
    loadBooks();
  }, [bibleId]);

  const otBooks = books.slice(0, 46);
  const ntBooks = books.slice(46);

  if (loading) {
    return <div className="page-content-inner"><p>Loading books...</p></div>;
  }

  if (error) {
    return <div className="page-content-inner"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="page-content-inner">
      <h1 className="page-title">{t('nav_bible')}</h1>
      
      {books.length > 0 && (
        <>
          <div className="bible-books-section">
            <h2>Old Testament</h2>
            <div className="bible-books-list">
              {otBooks.map(bookUSFM => (
                <Link key={bookUSFM} to={`/bible/${bookUSFM}`} className="bible-book-item">
                  {BOOK_NAMES[bookUSFM] || bookUSFM}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="bible-books-section">
            <h2>New Testament</h2>
            <div className="bible-books-list">
              {ntBooks.map(bookUSFM => (
                <Link key={bookUSFM} to={`/bible/${bookUSFM}`} className="bible-book-item">
                  {BOOK_NAMES[bookUSFM] || bookUSFM}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BibleIndexPage;

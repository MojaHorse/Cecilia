import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { getHymnsByLanguage } from '../data/hymnsService';
import { useLanguage } from '../context/LanguageContext';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { uiLang, t } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [results, setResults] = useState({ hymns: [], bookmarks: [] });

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setResults({ hymns: [], bookmarks: [] });
      if (inputRef.current) {
        setTimeout(() => inputRef.current.focus(), 100);
      }
      
      if (auth.currentUser) {
        fetchBookmarks(auth.currentUser.uid);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) {
      setResults({ hymns: [], bookmarks: [] });
      return;
    }

    const q = searchQuery.toLowerCase();

    // 1. Search Hymns
    const hymnsData = getHymnsByLanguage(uiLang) || [];
    const matchedHymns = hymnsData.filter(h => 
      h.title?.toLowerCase().includes(q) || 
      h.lyrics?.toLowerCase().includes(q)
    ).slice(0, 8);

    // 2. Search Bookmarks
    const matchedBookmarks = bookmarks.filter(b => 
      b.reference?.toLowerCase().includes(q) || 
      b.text?.toLowerCase().includes(q)
    ).slice(0, 5);

    setResults({
      hymns: matchedHymns,
      bookmarks: matchedBookmarks
    });

  }, [searchQuery, isOpen, bookmarks, uiLang]);

  async function fetchBookmarks(uid) {
    try {
      const qRef = query(collection(db, "bookmarks"), where("userId", "==", uid));
      const snap = await getDocs(qRef);
      const bks = [];
      snap.forEach(doc => {
        bks.push({ id: doc.id, ...doc.data() });
      });
      setBookmarks(bks);
    } catch (err) {
      console.error("Error fetching bookmarks for search:", err);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-content" onClick={e => e.stopPropagation()}>
        <div className="search-modal-header">
          <svg className="search-modal-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            ref={inputRef}
            type="text" 
            className="search-modal-input" 
            placeholder={t('search_placeholder') || "Search hymns, lyrics, or bookmarks..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="search-modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="search-modal-body">
          {searchQuery.trim() && results.hymns.length === 0 && results.bookmarks.length === 0 ? (
            <div className="search-modal-empty">
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : null}

          {results.hymns.length > 0 && (
            <div className="search-category">
              <h3 className="search-category-title">Hymns</h3>
              <ul className="search-results-list">
                {results.hymns.map(h => (
                  <li key={h.id} className="search-result-item" onClick={() => { navigate(`/lifela/${h.id}`); onClose(); }}>
                    <div className="search-result-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div className="search-result-text">
                      <span className="search-item-title">{h.title}</span>
                      <span className="search-item-desc">{h.lyrics.substring(0, 60).replace(/\\n/g, ' ')}...</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.bookmarks.length > 0 && (
            <div className="search-category">
              <h3 className="search-category-title">Bookmarks</h3>
              <ul className="search-results-list">
                {results.bookmarks.map(b => (
                  <li key={b.id} className="search-result-item" onClick={() => { navigate(`/bible/${b.bookId}/${b.chapterId}`); onClose(); }}>
                    <div className="search-result-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    <div className="search-result-text">
                      <span className="search-item-title">{b.reference}</span>
                      <span className="search-item-desc">{b.text.substring(0, 60)}...</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

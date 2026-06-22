import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, NavLink } from 'react-router-dom'
import { useLanguage } from './context/LanguageContext'
import { signInUserAnonymously, auth } from './services/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import HomePage from './pages/HomePage'
import HymnIndexPage from './pages/HymnIndexPage'
import HymnPage from './pages/HymnPage'
import PrayersPage from './pages/PrayersPage'
import MassPage from './pages/MassPage'
import AboutPage from './pages/AboutPage'
import ReadingsPage from './pages/ReadingsPage'
import TodayPage from './pages/TodayPage'
import BibleIndexPage from './pages/BibleIndexPage'
import BibleBookPage from './pages/BibleBookPage'
import BibleReadPage from './pages/BibleReadPage'
import BookmarksPage from './pages/BookmarksPage'
import CookieBanner from './components/CookieBanner'
import CaptureModal from './components/CaptureModal'
import AuthModal from './components/AuthModal'
import GlobalSearchModal from './components/GlobalSearchModal'

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { uiLang, setUiLang, t, availableLangs } = useLanguage()

  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInUserAnonymously().then(user => {
          if (user) console.log("Anonymously signed in:", user.uid);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsDropdownOpen(!isDropdownOpen);
  }

  return (
    <div className="site-container">


      {/* Site Header */}
      <header className="site-header">
        <Link to="/" className="header-logo" onClick={closeMobileMenu} id="tour-header-logo">
          <img src="/Group 69.svg" alt="The Good Shepherd" />
          <div className="header-logo-text">
            <span className="header-logo-name">
              The Good Shepherd 
            </span>
            <span className="header-logo-tagline">John 10:11</span>
          </div>
        </Link>
        <nav className={`header-nav ${isMobileMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end onClick={closeMobileMenu}>{t('nav_home')}</NavLink>
          <NavLink to="/today" onClick={closeMobileMenu}>{t('nav_today')}</NavLink>
          
          <div className="nav-dropdown" id="tour-nav-library" ref={dropdownRef}
               onMouseEnter={() => setIsDropdownOpen(true)} 
               onMouseLeave={() => setIsDropdownOpen(false)}>
            <button className="nav-dropdown-btn" onClick={toggleDropdown}>
              {t('nav_library') || 'Library'}
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`nav-dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
              <NavLink to="/lifela" onClick={closeMobileMenu}>{t('nav_hymns')}</NavLink>
              <NavLink to="/merapelo" onClick={closeMobileMenu}>{t('nav_prayers')}</NavLink>
              <NavLink to="/misa" onClick={closeMobileMenu}>{t('nav_mass')}</NavLink>
              <NavLink to="/bible" onClick={closeMobileMenu}>{t('nav_bible')}</NavLink>
              <NavLink to="/bookmarks" onClick={closeMobileMenu}>{t('bookmarks_title')}</NavLink>
            </div>
          </div>

          <NavLink to="/about" onClick={closeMobileMenu}>{t('nav_about')}</NavLink>
          {user && !user.isAnonymous ? (
            <a href="#" onClick={(e) => { e.preventDefault(); signOut(auth); closeMobileMenu(); }} style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>{t('nav_logout')}</a>
          ) : (
            <a href="#" id="tour-nav-auth" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('openAuthModal')); closeMobileMenu(); }} style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>{t('nav_signin')}</a>
          )}
          
          <div className="nav-lang-container" style={{ display: 'flex', alignItems: 'center' }}>
            <select 
              className="nav-lang-select" 
              value={uiLang} 
              onChange={(e) => {
                setUiLang(e.target.value);
                closeMobileMenu();
              }}
              aria-label="Select Language"
            >
              <option value="sesotho">Sesotho</option>
              <option value="zulu">isiZulu</option>
              <option value="xhosa">isiXhosa</option>
              <option value="setswana">Setswana</option>
              <option value="english">English</option>
            </select>
          </div>
        </nav>
        <div className="header-actions">
          {/* Search Icon */}
          <button className="search-icon" onClick={() => setIsSearchOpen(true)} aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button 
            id="tour-hamburger-menu"
            className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lifela" element={<HymnIndexPage />} />
          <Route path="/lifela/:id" element={<HymnPage />} />
          <Route path="/lifela/:lang/:id" element={<HymnPage />} />
          <Route path="/merapelo" element={<PrayersPage />} />
          <Route path="/misa" element={<MassPage />} />
          <Route path="/readings" element={<ReadingsPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/bible" element={<BibleIndexPage />} />
          <Route path="/bible/:bookId" element={<BibleBookPage />} />
          <Route path="/bible/:bookId/:chapterId" element={<BibleReadPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <img src="/Group 69.svg" alt="The Good Shepherd Logo" style={{ height: '65px', width: 'auto', opacity: 1, filter: 'brightness(0) invert(1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontFamily: 'var(--font-legendary)', fontWeight: 700, fontSize: '2rem', letterSpacing: '0.05em', color: 'var(--color-white)', lineHeight: 1.1, paddingBottom: '0.2rem' }}>
                The Good Shepherd 
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700 }}>
                John 10:11
              </span>
            </div>
          </div>
          <p className="footer-text">
            <em>The Good Shepherd &mdash; {t('tagline')}</em>
          </p>
          <p className="footer-text">
            {t('footer_source_hymns')}{' '}
            <a href="https://catholichymns.co.za/" target="_blank" rel="noopener noreferrer">
              Lifela Tsa BaKriste
            </a>
            {' '}&middot;{' '}
            {t('footer_source_church')}{' '}
            <a href="https://www.vatican.va/content/vatican/en.html" target="_blank" rel="noopener noreferrer">
              {t('holy_church')}
            </a>
          </p>
          <p className="footer-text footer-verse">
            {t('footer_verse')}
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            {user && !user.isAnonymous ? (
              <button 
                onClick={() => signOut(auth)}
                style={{
                  background: 'transparent', border: '1px solid currentColor', borderRadius: '999px',
                  padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem', color: 'inherit', fontWeight: 600
                }}
              >
                Log Out
              </button>
            ) : (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
                style={{
                  background: 'transparent', border: '1px solid currentColor', borderRadius: '999px',
                  padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem', color: 'inherit', fontWeight: 600
                }}
              >
                Sign In / Create Account
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Global Modals & Overlays */}
      <AuthModal />
      <CookieBanner />
      <CaptureModal />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}

export default App

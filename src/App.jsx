import { useState } from 'react'
import { Routes, Route, Link, NavLink } from 'react-router-dom'
import { useLanguage } from './context/LanguageContext'
import HomePage from './pages/HomePage'
import HymnIndexPage from './pages/HymnIndexPage'
import HymnPage from './pages/HymnPage'
import PrayersPage from './pages/PrayersPage'
import MassPage from './pages/MassPage'
import AboutPage from './pages/AboutPage'
import ReadingsPage from './pages/ReadingsPage'
import TodayPage from './pages/TodayPage'

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { uiLang, setUiLang, t, availableLangs } = useLanguage()

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="site-container">
      {/* Floating Language Selector (Desktop Only) */}
      <select 
        className="global-lang-select desktop-only" 
        value={uiLang} 
        onChange={(e) => setUiLang(e.target.value)}
        aria-label="Select Language"
      >
        <option value="sesotho">Sesotho</option>
        <option value="zulu">isiZulu</option>
        <option value="xhosa">isiXhosa</option>
        <option value="setswana">Setswana</option>
        <option value="english">English</option>
      </select>

      {/* Site Header */}
      <header className="site-header">
        <Link to="/" className="header-logo" onClick={closeMobileMenu}>
          <div className="header-logo-text">
            <span className="header-logo-name">The Good Shepherd</span>
            <span className="header-logo-tagline">{t('tagline')}</span>
          </div>
        </Link>
        <nav className={`header-nav ${isMobileMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end onClick={closeMobileMenu}>Home</NavLink>
          <NavLink to="/today" onClick={closeMobileMenu}>Today</NavLink>
          <NavLink to="/lifela" onClick={closeMobileMenu}>Hymns</NavLink>
          <NavLink to="/merapelo" onClick={closeMobileMenu}>Prayers</NavLink>
          <NavLink to="/misa" onClick={closeMobileMenu}>Order of Mass</NavLink>
          <NavLink to="/about" onClick={closeMobileMenu}>About Us</NavLink>
        </nav>
        <div className="header-actions">
          {/* Mobile Language Selector */}
          <select 
            className="global-lang-select mobile-only" 
            value={uiLang} 
            onChange={(e) => setUiLang(e.target.value)}
            aria-label="Select Language"
          >
            <option value="sesotho">Sesotho</option>
            <option value="zulu">isiZulu</option>
            <option value="xhosa">isiXhosa</option>
            <option value="setswana">Setswana</option>
            <option value="english">English</option>
          </select>
          <span className="search-icon" style={{ display: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <button 
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
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="/The Good Shepherd (1)/Logo_Dark.svg" alt="The Good Shepherd Logo" />
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
        </div>
      </footer>
    </div>
  )
}

export default App

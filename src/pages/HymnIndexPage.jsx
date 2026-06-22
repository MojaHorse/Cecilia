import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { languages, getHymnsByLanguage } from '../data/hymnsService'
import { useLanguage } from '../context/LanguageContext'

function HymnIndexPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, uiLang } = useLanguage()
  
  // Try to parse lang from query params ?lang=zulu
  const searchParams = new URLSearchParams(location.search)
  const initialLang = searchParams.get('lang') || localStorage.getItem('preferredHymnLang') || uiLang || 'sesotho'
  
  const [currentLang, setCurrentLang] = useState(initialLang)

  useEffect(() => {
    localStorage.setItem('preferredHymnLang', currentLang)
    // Update URL to match current lang without pushing a new history state
    navigate(`/lifela?lang=${currentLang}`, { replace: true })
  }, [currentLang, navigate])

  // Sync local lang with global uiLang if global changes, and it's a valid hymn language
  useEffect(() => {
    if (languages[uiLang] && uiLang !== currentLang) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentLang(uiLang)
    }
  }, [uiLang])

  const hymnsData = getHymnsByLanguage(currentLang)

  const grouped = {}
  hymnsData.forEach(hymn => {
    // Get the first alphabetical character of the title, default to '?'
    const match = hymn.title.match(/[a-zA-Z]/)
    const letter = match ? match[0].toUpperCase() : '?'
    if (!grouped[letter]) {
      grouped[letter] = []
    }
    grouped[letter].push(hymn)
  })

  const sortedLetters = Object.keys(grouped).sort((a, b) =>
    a.localeCompare(b)
  )

  return (
    <div className="hymn-index">
      <div className="index-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="section-label">{t('nav_hymns')}</span>
        <h1 className="section-title">{t('tagline')}</h1>
        <p className="section-subtitle" style={{ marginBottom: '1rem' }}>{t('home_subtitle')}</p>
        
        {/* Language Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {Object.values(languages).map(lang => (
            <button 
              key={lang.id}
              className={`pill-button ${currentLang === lang.id ? '' : 'pill-button--outline'}`}
              onClick={() => setCurrentLang(lang.id)}
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              {lang.name}
            </button>
          ))}
        </div>
        
        <div className="divider"></div>
      </div>

      {hymnsData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', opacity: 0.7 }}>
          Patience, {languages[currentLang]?.name} hymns are still being loaded...
        </div>
      ) : (
        sortedLetters.map(letter => (
          <section className="letter-section" key={letter}>
            <h2 className="letter-header">{letter}</h2>
            <ul className="hymn-list">
              {grouped[letter].map((hymn, index) => {
                const num = hymn.id.replace(/[^0-9]/g, '')
                return (
                  <li className="hymn-list-item" key={hymn.id || index}>
                    <Link to={`/lifela/${currentLang}/${hymn.id}`}>
                      {num && <span className="hymn-number">{num}</span>}
                      <span className="hymn-name">{hymn.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

export default HymnIndexPage

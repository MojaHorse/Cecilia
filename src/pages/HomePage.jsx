import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getLiturgicalYear, getDailyHymn, fetchTodayLiturgy } from '../services/liturgyService'
import PageTour from '../components/PageTour'

function HomePage() {
  const { t, uiLang } = useLanguage()
  const [liturgy, setLiturgy] = useState(null)

  const homeTourSteps = useMemo(() => {
    const isMobile = window.innerWidth <= 768;
    return [
      {
        target: '#tour-header-logo',
        content: 'Welcome to The Good Shepherd! Your digital library for Catholic hymns, prayers, and daily liturgy.',
        disableBeacon: true,
        placement: 'bottom',
      },
      {
        target: isMobile ? '#tour-hamburger-menu' : '#tour-nav-library',
        content: isMobile ? 'Tap the menu to find the Bible, Order of Mass, Hymns, and Bookmarks.' : 'Open the Library to find the Bible, Order of Mass, Hymns, and your Bookmarks.',
        placement: 'bottom',
      },
      {
        target: isMobile ? '#tour-hamburger-menu' : '#tour-nav-auth',
        content: 'Create a free account to securely save your Bookmarks and Private Prayers across all your devices!',
        placement: 'bottom',
      },
      {
        target: '.liturgy-section',
        content: 'Check here every day to find the liturgical colors, season, readings, and featured hymn for the daily Mass.',
        placement: 'top',
      }
    ];
  }, []);

  useEffect(() => {
    fetchTodayLiturgy().then(data => setLiturgy(data))
  }, [])

  const { year, cycle } = getLiturgicalYear()
  const hymn = getDailyHymn(uiLang) || getDailyHymn('sesotho')

  const processedLyrics = hymn.lyrics
    .replace(/\\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const lines = processedLyrics.split('\n').filter(line => line.trim() !== '')
  const contentLines = lines[0] && lines[0].startsWith('Sefela') ? lines.slice(1) : lines
  const excerpt = contentLines.slice(0, 5).join('\n')

  return (
    <>
      <PageTour tourName="home_tour" steps={homeTourSteps} />
      {/* ===== HERO: VATICAN.VA INSPIRED LAYOUT ===== */}
      <section className="hero-vatican">
        <div className="hero-vatican-inner">
          <div className="hero-vatican-text">
            <span className="section-label">{t('holy_church')}</span>
            <h1 className="section-title">{t('tagline')}</h1>
            <p>
              {t('home_subtitle')}
            </p>
            <Link to="/lifela" className="pill-button">{t('home_btn_hymns')}</Link>
          </div>
        </div>
        <div className="hero-vatican-image">
          <img src="/GoodShepherdIcon.png" alt="Jesus Christ the Good Shepherd" style={{ filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.3))' }} />
        </div>
        <div className="hero-curve">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V73.19C216.71,114.73,439.42,126.3,648.77,105.15C858.12,84,1050.21,30.34,1200,0V120H0V0Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* ===== THE GREATEST COMMANDMENTS ===== */}
      <section className="commandments-section" style={{ backgroundColor: 'var(--color-cream)', padding: '4rem 2rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="section-label" style={{ color: 'var(--color-gold)' }}>{t('commandments_label')}</span>
          <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '1.5rem', color: 'var(--color-burgundy)' }}>{t('commandments_title')}</h2>
          <p style={{ fontSize: '1.25rem', lineHeight: '1.8', fontStyle: 'italic', fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
            {t('commandments_question')}<br/><br/>
            <span dangerouslySetInnerHTML={{ __html: t('commandments_answer') }} />
          </p>
          <p style={{ marginTop: '1.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-ink-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {t('commandments_source')}
          </p>
        </div>
      </section>

      {/* ===== MISSION SECTION ===== */}
      <section className="mission-section">
        <div className="mission-content">
          <span className="section-label">{t('nav_about')}</span>
          <h2 className="section-title">{t('home_mission_title')}</h2>
          <div className="divider"></div>
          <p>
            {t('home_mission_text')}
          </p>
          <Link to="/about" className="pill-button pill-button--outline" style={{ marginTop: '1rem' }}>{t('home_mission_btn')}</Link>
        </div>
      </section>



      {/* ===== TODAY'S LITURGY & DAILY HYMN ===== */}
      <section className="liturgy-section">
        <div className="liturgy-container">
          {/* Liturgy of the Day */}
          <div className="liturgy-card">
            <span className="section-label" style={{ color: 'var(--color-white)' }}>{t('holy_church') || "Today's Liturgy"}</span>
            <h2 className="section-title" style={{ color: 'var(--color-white)' }}>
              {liturgy ? liturgy.title || (liturgy.season.charAt(0).toUpperCase() + liturgy.season.slice(1) + " Season") : 'Loading Liturgy...'}
            </h2>
            <div className="liturgy-details">
              <div className="liturgy-badge">
                <span className={`liturgy-color-dot ${liturgy ? liturgy.colour : 'green'}`}></span>
                {liturgy ? (liturgy.colour.charAt(0).toUpperCase() + liturgy.colour.slice(1)) : 'Green'}
              </div>
              <div className="liturgy-badge">Year {year}</div>
              <div className="liturgy-badge">Cycle {cycle}</div>
              {liturgy && liturgy.week && <div className="liturgy-badge">Week {liturgy.week}</div>}
            </div>
            <p className="liturgy-desc" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              {t('home_readings_desc')}
            </p>
            <Link to="/readings" className="pill-button" style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-burgundy)', border: 'none' }}>
              {t('home_readings_btn')}
            </Link>
          </div>

          {/* Hymn of the Day */}
          {hymn && (
            <div className="daily-hymn-card">
              <span className="section-label" style={{ color: 'var(--color-gold)' }}>{t('home_featured_label')}</span>
              <h3 className="section-title" style={{ color: 'var(--color-ink)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{hymn.title}</h3>
              <div className="divider divider--subtle" style={{ margin: '1rem 0' }}></div>
              <p style={{ fontStyle: 'italic', color: 'var(--color-gray)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                "{excerpt}..."
              </p>
              <Link to={"/lifela/" + hymn.id} style={{ fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-burgundy)' }}>
                {t('home_featured_btn')}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default HomePage

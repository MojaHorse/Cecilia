import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import vaticanNews from '../data/vaticanNews.json'
import { getLiturgicalYear, getDailyHymn, fetchTodayLiturgy } from '../services/liturgyService'

function HomePage() {
  const { t, uiLang } = useLanguage()
  const [liturgy, setLiturgy] = useState(null)

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
          <img src="/PopeLeo_Removedbackground.png" alt="Pope Leo XIV" />
        </div>
        <div className="hero-curve">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V73.19C216.71,114.73,439.42,126.3,648.77,105.15C858.12,84,1050.21,30.34,1200,0V120H0V0Z" className="shape-fill"></path>
          </svg>
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

      {/* ===== NEWS SECTION ===== */}
      <section className="news-section">
        <span className="section-label">{t('holy_church')}</span>
        <h2 className="section-title">{t('home_news_title')}</h2>
        <p className="section-subtitle">{t('home_news_subtitle')}</p>
        <div className="divider"></div>

        <div className="news-grid">
          {vaticanNews.map((item) => (
            <div className="news-card" key={item.id}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-card-link">
                <p className="news-date">{item.date}</p>
                <h3 className="news-title">{item.title}</h3>
                <p className="news-source">{item.source}</p>
              </a>
            </div>
          ))}
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
              The Catholic Church provides daily scripture readings for Mass. Read today's official Lectionary texts in full below.
            </p>
            <Link to="/readings" className="pill-button" style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-burgundy)', border: 'none' }}>
              Read Today's Readings ➔
            </Link>
          </div>

          {/* Hymn of the Day */}
          {hymn && (
            <div className="daily-hymn-card">
              <span className="section-label" style={{ color: 'var(--color-gold)' }}>Daily Hymn Suggestion</span>
              <h3 className="section-title" style={{ color: 'var(--color-ink)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{hymn.title}</h3>
              <div className="divider divider--subtle" style={{ margin: '1rem 0' }}></div>
              <p style={{ fontStyle: 'italic', color: 'var(--color-gray)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                "{excerpt}..."
              </p>
              <Link to={"/lifela/" + hymn.id} style={{ fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-burgundy)' }}>
                {t('home_featured_btn') || "View Full Hymn"} ➔
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default HomePage

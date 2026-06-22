import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getLiturgicalYear, getDailyHymn, fetchTodayLiturgy } from '../services/liturgyService'
import PageTour from '../components/PageTour'

const todayTourSteps = [
  {
    target: '#tour-today-saint',
    content: 'Discover the Saint of the Hour! This updates throughout the day to inspire you with stories of faith.',
    placement: 'bottom',
  },
  {
    target: '#tour-today-checklist',
    content: 'Build a daily habit! Check off these spiritual practices as you complete them each day.',
    placement: 'left',
  },
  {
    target: '#tour-today-liturgy',
    content: "Find the official Liturgical color, season, and readings for today's Mass right here.",
    placement: 'right',
  }
];

function TodayPage() {
  const { t, uiLang } = useLanguage()
  
  // Data states
  const [readingsData, setReadingsData] = useState(null)
  const [error, setError] = useState(false)
  const [liturgy, setLiturgy] = useState(null)
  const [saintData, setSaintData] = useState(null)
  const [funFact, setFunFact] = useState('')

  // Checklist state
  const todayStr = new Date().toISOString().split('T')[0]
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('dailyChecklist')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.date === todayStr) return parsed.tasks
    }
    return {
      morningPrayer: false,
      gospel: false,
      rosary: false,
      eveningPrayer: false
    }
  })

  useEffect(() => {
    localStorage.setItem('dailyChecklist', JSON.stringify({ date: todayStr, tasks: checklist }))
  }, [checklist, todayStr])

  const toggleTask = (task) => {
    setChecklist(prev => ({ ...prev, [task]: !prev[task] }))
  }

  // Fetch liturgy
  useEffect(() => {
    fetchTodayLiturgy().then(data => setLiturgy(data))
  }, [])

  // Fetch Saint and Fun Fact
  useEffect(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
    const oneDay = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay)
    const hourOfEpoch = Math.floor(Date.now() / (1000 * 60 * 60))

    import('../data/saints.json').then(module => {
      const saintsList = module.default || module
      const title = saintsList[hourOfEpoch % saintsList.length]
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
        .then(res => res.json())
        .then(data => setSaintData(data))
        .catch(err => console.error('Error fetching saint:', err))
    })

    import('../data/funFacts.json').then(module => {
      const factsList = module.default || module
      setFunFact(factsList[dayOfYear % factsList.length])
    })
  }, [])

  // Fetch readings
  useEffect(() => {
    window.universalisCallback = (response) => {
      setReadingsData(response)
    }

    const script = document.createElement('script')
    script.src = 'https://universalis.com/en-GB/jsonpmass.js'
    script.async = true
    script.onerror = () => setError(true)
    document.body.appendChild(script)

    return () => {
      delete window.universalisCallback
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const { year, cycle } = getLiturgicalYear()
  const hymn = getDailyHymn(uiLang) || getDailyHymn('sesotho')

  const renderReading = (reading, title) => {
    if (!reading || !reading.text) return null
    return (
      <div className="reading-section">
        <h2 className="reading-section-title">{title}</h2>
        {reading.source && (
          <p className="reading-source" dangerouslySetInnerHTML={{ __html: reading.source }} />
        )}
        {reading.heading && <h3 className="reading-heading">{reading.heading}</h3>}
        <div className="reading-text" dangerouslySetInnerHTML={{ __html: reading.text }} />
      </div>
    )
  }

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <div className="today-page readings-page">
      <PageTour tourName="today_tour" steps={todayTourSteps} />
      <div className="index-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="section-label">{t('nav_today')}</span>
        <h1 className="section-title">{getGreeting()}</h1>
        {readingsData && readingsData.date && (
          <p className="section-subtitle" style={{ color: 'var(--color-burgundy)', fontWeight: '600' }}>
            {readingsData.date}
          </p>
        )}
        <div className="divider"></div>
        {readingsData && readingsData.day && (
          <div className="reading-day-info" dangerouslySetInnerHTML={{ __html: readingsData.day }} />
        )}
      </div>

      <div className="dashboard-grid">
          
          {/* Liturgy of the Day */}
          <div className="dashboard-card liturgy-card" id="tour-today-liturgy">
            <span className="dashboard-label">{t('today_liturgy')}</span>
            <h2 className="dashboard-card-title">
              {liturgy ? liturgy.title || (liturgy.season.charAt(0).toUpperCase() + liturgy.season.slice(1) + " Season") : 'Loading...'}
            </h2>
            <div className="liturgy-details" style={{ justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '0' }}>
              <div className="liturgy-badge">
                <span className={`liturgy-color-dot ${liturgy ? liturgy.colour : 'green'}`}></span>
                {liturgy ? (liturgy.colour.charAt(0).toUpperCase() + liturgy.colour.slice(1)) : 'Green'}
              </div>
              <div className="liturgy-badge">Year {year}</div>
              {liturgy && liturgy.week && <div className="liturgy-badge">Week {liturgy.week}</div>}
            </div>
          </div>

          {/* Daily Checklist */}
          <div className="dashboard-card checklist-card" id="tour-today-checklist">
            <span className="dashboard-label" style={{ color: 'var(--color-burgundy)' }}>{t('today_checklist')}</span>
            <div className="checklist-items">
              <label className={`checklist-item ${checklist.morningPrayer ? 'done' : ''}`}>
                <input type="checkbox" checked={checklist.morningPrayer} onChange={() => toggleTask('morningPrayer')} />
                <span className="checkbox-custom"></span>
                Morning Prayer
              </label>
              <label className={`checklist-item ${checklist.gospel ? 'done' : ''}`}>
                <input type="checkbox" checked={checklist.gospel} onChange={() => toggleTask('gospel')} />
                <span className="checkbox-custom"></span>
                Read the Gospel
              </label>
              <label className={`checklist-item ${checklist.rosary ? 'done' : ''}`}>
                <input type="checkbox" checked={checklist.rosary} onChange={() => toggleTask('rosary')} />
                <span className="checkbox-custom"></span>
                The Rosary
              </label>
              <label className={`checklist-item ${checklist.eveningPrayer ? 'done' : ''}`}>
                <input type="checkbox" checked={checklist.eveningPrayer} onChange={() => toggleTask('eveningPrayer')} />
                <span className="checkbox-custom"></span>
                Evening Prayer
              </label>
            </div>
          </div>

          {/* Daily Hymn */}
          {hymn && (
            <div className="dashboard-card hymn-widget">
              <span className="dashboard-label" style={{ color: 'var(--color-gold)' }}>{t('today_hymn')}</span>
              <h3 className="dashboard-card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{hymn.title}</h3>
              <p style={{ fontStyle: 'italic', color: 'var(--color-ink-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                "{hymn.lyrics.replace(/\\n/g, '\n').split('\n').filter(l => l.trim() !== '' && !l.startsWith('Sefela'))[0]}..."
              </p>
              <Link to={"/lifela/" + hymn.id} className="widget-link">
                View Hymn ➔
              </Link>
            </div>
          )}

          {/* Saint of the Hour */}
          {saintData && (
            <div className="dashboard-card saint-card" id="tour-today-saint">
              <span className="dashboard-label" style={{ color: 'var(--color-burgundy)' }}>{t('today_saint')}</span>
              {saintData.thumbnail && (
                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <img src={saintData.thumbnail.source} alt={saintData.title} style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                </div>
              )}
              <h3 className="dashboard-card-title" style={{ fontSize: '1.5rem' }}>{saintData.title}</h3>
              <p style={{ color: 'var(--color-ink)', fontSize: '0.95rem', lineHeight: '1.6', marginTop: '0.75rem' }}>
                {saintData.extract}
              </p>
              <a href={saintData.content_urls?.desktop?.page} target="_blank" rel="noopener noreferrer" className="widget-link" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                Read more on Wikipedia ➔
              </a>
            </div>
          )}

          {/* Fun Fact */}
          {funFact && (
            <div className="dashboard-card fact-card" style={{ background: 'linear-gradient(135deg, var(--color-burgundy) 0%, #5a1214 100%)', color: 'var(--color-white)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="dashboard-label" style={{ color: 'var(--color-gold)', borderColor: 'rgba(212, 175, 55, 0.3)', background: 'rgba(212, 175, 55, 0.1)' }}>{t('today_fact')}</span>
              <p style={{ fontSize: '1.3rem', lineHeight: '1.6', fontStyle: 'italic', marginTop: '1.5rem', fontFamily: 'var(--font-serif)' }}>
                "{funFact}"
              </p>
            </div>
          )}

          {/* Quick Prayers */}
          <div className="dashboard-card prayers-widget">
            <span className="dashboard-label" style={{ color: 'var(--color-burgundy)' }}>{t('today_quick_prayers')}</span>
            <div className="quick-prayers-list">
              <Link to="/merapelo" className="quick-prayer-item">
                <strong>Glory Be</strong>
                <span>Glory be to the Father, and to the Son...</span>
              </Link>
              <Link to="/merapelo" className="quick-prayer-item">
                <strong>Hail Mary</strong>
                <span>Hail Mary, full of grace...</span>
              </Link>
            </div>
          </div>
        </div>

      <div className="readings-container">
        {/* === TODAY'S READINGS === */}
        <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '2rem', marginTop: '3rem', textAlign: 'center' }}>{t('today_readings')}</h2>

        {!readingsData && !error && (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading Readings...</p>
          </div>
        )}

        {error && (
          <div className="reading-error">
            <p>Failed to load today's readings. Please check your connection or try again later.</p>
          </div>
        )}

        {readingsData && (
          <article className="readings-article fade-in">
            {renderReading(readingsData.Mass_R1, "First Reading")}
            {renderReading(readingsData.Mass_Ps, "Responsorial Psalm")}
            {renderReading(readingsData.Mass_R2, "Second Reading")}
            {renderReading(readingsData.Mass_Ac, "Gospel Acclamation")}
            {renderReading(readingsData.Mass_G, "Gospel")}
            
            <div className="readings-footer">
              <p>Texts provided by <a href="https://universalis.com" target="_blank" rel="noopener noreferrer">Universalis</a>.</p>
              <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>Note: Official Catholic daily readings are currently only available digitally in English. Printed Missals are required for local languages.</p>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}

export default TodayPage

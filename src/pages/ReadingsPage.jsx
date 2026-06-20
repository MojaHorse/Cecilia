import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

function ReadingsPage() {
  const { t } = useLanguage()
  
  // Data states
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  // Fetch initial English JSONP
  useEffect(() => {
    window.universalisCallback = (response) => {
      setData(response)
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

  return (
    <div className="readings-page" style={{ paddingTop: '8rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="index-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="section-label">{t('holy_church') || "Liturgy of the Word"}</span>
        <h1 className="section-title">Today's Readings</h1>
        {data && data.date && (
          <p className="section-subtitle" style={{ color: 'var(--color-burgundy)', fontWeight: '600' }}>
            {data.date}
          </p>
        )}
        <div className="divider"></div>
        {data && data.day && (
          <div className="reading-day-info" dangerouslySetInnerHTML={{ __html: data.day }} />
        )}
      </div>

      <div className="readings-container">
        {!data && !error && (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading Liturgy...</p>
          </div>
        )}

        {error && (
          <div className="reading-error">
            <p>Failed to load today's readings. Please check your connection or try again later.</p>
          </div>
        )}

        {data && (
          <article className="readings-article fade-in">
            {renderReading(data.Mass_R1, "First Reading")}
            {renderReading(data.Mass_Ps, "Responsorial Psalm")}
            {renderReading(data.Mass_R2, "Second Reading")}
            {renderReading(data.Mass_Ac, "Gospel Acclamation")}
            {renderReading(data.Mass_G, "Gospel")}
            
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

export default ReadingsPage

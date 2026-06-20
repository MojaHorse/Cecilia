import { useState, useEffect } from 'react'
import prayersData from '../data/prayers.json'
import { useLanguage } from '../context/LanguageContext'

function PrayersPage() {
  const { t, uiLang } = useLanguage()
  const [lang, setLang] = useState(uiLang || 'sesotho')

  // Sync local language when global uiLang changes, if we have it
  useEffect(() => {
    if (['sesotho', 'zulu', 'xhosa', 'setswana', 'english'].includes(uiLang)) {
      setLang(uiLang)
    }
  }, [uiLang])

  return (
    <div className="prayers-page">
      <div className="index-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="section-label">{t('nav_prayers')}</span>
        <h1 className="section-title">
          {lang === 'sesotho' && "Merapelo ea Bakatolike"}
          {lang === 'zulu' && "Imithandazo YamaKatolika"}
          {lang === 'xhosa' && "Imithandazo YamaKatolika"}
          {lang === 'setswana' && "Merapelo ya Bakatholika"}
          {lang === 'english' && "Catholic Prayers"}
        </h1>
        
        <div className="lang-toggle-container">
          <div className="lang-toggle">
            <button 
              className={`lang-btn ${lang === 'sesotho' ? 'active' : ''}`}
              onClick={() => setLang('sesotho')}
            >
              Sesotho
            </button>
            <button 
              className={`lang-btn ${lang === 'zulu' ? 'active' : ''}`}
              onClick={() => setLang('zulu')}
            >
              isiZulu
            </button>
            <button 
              className={`lang-btn ${lang === 'xhosa' ? 'active' : ''}`}
              onClick={() => setLang('xhosa')}
            >
              isiXhosa
            </button>
            <button 
              className={`lang-btn ${lang === 'setswana' ? 'active' : ''}`}
              onClick={() => setLang('setswana')}
            >
              Setswana
            </button>
            <button 
              className={`lang-btn ${lang === 'english' ? 'active' : ''}`}
              onClick={() => setLang('english')}
            >
              English
            </button>
          </div>
        </div>

        <div className="divider"></div>
      </div>

      <div className="prayers-grid">
        {prayersData.map(prayer => {
          // Fallback to English if translation is somehow missing
          const translation = prayer.translations[lang] || prayer.translations['english'] || prayer.translations['sesotho'];
          
          return (
            <article className="prayer-card" key={prayer.id}>
              <h2 className="prayer-title">{translation.title}</h2>
              <div className="prayer-content">
                {translation.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default PrayersPage

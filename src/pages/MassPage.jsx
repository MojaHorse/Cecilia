import { useState, useEffect } from 'react'
import massData from '../data/massOrder.json'
import { useLanguage } from '../context/LanguageContext'

function MassPage() {
  const { t, uiLang } = useLanguage()
  const [lang, setLang] = useState(uiLang === 'english' ? 'english' : 'sesotho')

  useEffect(() => {
    if (uiLang === 'english' || uiLang === 'sesotho') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(uiLang)
    }
  }, [uiLang])

  return (
    <div className="mass-page">
      <div className="index-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="section-label">{t('nav_mass')}</span>
        <h1 className="section-title">{lang === 'sesotho' ? "Tsamaiso ea 'Misa" : "Order of the Mass"}</h1>
        <p className="section-subtitle">
          {lang === 'sesotho' 
            ? "Tatelano e felletseng ea 'Misa o Halalelang oa Kereke e Katolike."
            : "The complete Order of the Holy Mass of the Catholic Church."}
        </p>
        
        {/* Missing translations warning if global language is not supported locally */}
        {uiLang !== 'sesotho' && uiLang !== 'english' && (
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-ivory)', border: '1px dashed var(--color-gold)', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--color-ink)' }}>
            <em>Note: Translations for {uiLang} are coming soon. Displaying in {lang} for now.</em>
          </div>
        )}

        <div className="lang-toggle-container">
          <div className="lang-toggle">
            <button 
              className={`lang-btn ${lang === 'sesotho' ? 'active' : ''}`}
              onClick={() => setLang('sesotho')}
            >
              Sesotho
            </button>
            <button 
              className={`lang-btn ${lang === 'english' ? 'active' : ''}`}
              onClick={() => setLang('english')}
            >
              English
            </button>
          </div>
        </div>
        
        <div className="divider" style={{ marginTop: '2rem' }}></div>
      </div>

      <div className="mass-content">
        {massData.map((section, sectionIdx) => (
          <section className="mass-section" key={sectionIdx}>
            <h2 className="mass-section-title">
              {lang === 'sesotho' ? section.section : section.sectionEn}
            </h2>
            
            {section.parts.map((part, partIdx) => (
              <div className="mass-part" key={partIdx}>
                <h3 className="mass-part-title">
                  {lang === 'sesotho' ? part.title : part.titleEn}
                </h3>
                
                {part.rubric && lang === 'sesotho' && (
                  <p className="mass-rubric">{part.rubric}</p>
                )}
                {part.rubricEn && lang === 'english' && (
                  <p className="mass-rubric">{part.rubricEn}</p>
                )}

                <div className="mass-dialogues">
                  {part.dialogues.map((dialogue, dIdx) => (
                    <div 
                      key={dIdx} 
                      className={`mass-dialogue ${dialogue.speaker === 'Phutheho' ? 'speaker-people' : 'speaker-priest'}`}
                    >
                      <span className="speaker-label">
                        {lang === 'sesotho' ? dialogue.speaker : dialogue.speakerEn}:
                      </span>
                      <p className="speaker-text">
                        {lang === 'sesotho' ? dialogue.text : dialogue.textEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

export default MassPage

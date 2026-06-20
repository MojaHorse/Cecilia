import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="about-page" style={{ padding: '10rem 1.5rem 6rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="index-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="section-label">{t('nav_about')}</span>
        <h1 className="section-title">The Good Shepherd</h1>
        <div className="divider"></div>
      </div>

      <div style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--color-ink)', marginBottom: '3rem' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          <strong>The Good Shepherd</strong> {t('about_p1').replace('The Good Shepherd ', '')}
        </p>

        <p style={{ marginBottom: '1.5rem' }}>
          {t('about_p2')}
        </p>

        <p style={{ marginBottom: '1.5rem' }}>
          {t('about_p3')}
        </p>

        <p style={{ fontStyle: 'italic', opacity: 0.8, textAlign: 'center', marginTop: '3rem', fontSize: '1.1rem' }}>
          "O binele Morena sefela se secha, hobane o entse mehlolo."<br />
          — Pesalema 98:1
        </p>
      </div>

      <div className="divider"></div>

      <p style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/lifela" className="pill-button">{t('home_btn_hymns')} →</Link>
      </p>
    </div>
  )
}

export default AboutPage

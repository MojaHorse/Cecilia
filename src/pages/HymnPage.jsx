import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { getHymnById, defaultLanguage, languages } from '../data/hymnsService'

function HymnPage() {
  const { lang, id } = useParams()
  
  // Support legacy routes like /lifela/1
  const effectiveLang = lang || defaultLanguage
  const langName = languages[effectiveLang]?.name || 'Sesotho'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id, lang])

  const { hymn, currentIndex, hymnsList } = getHymnById(effectiveLang, id)

  if (!hymn) {
    return (
      <div className="hymn-page" style={{ textAlign: 'center', paddingTop: '8rem' }}>
        <h1 className="section-title">Sefela ha se a fumanoa</h1>
        <p>Hymn not found in {langName}.</p>
        <Link to={`/lifela?lang=${effectiveLang}`} className="pill-button" style={{ marginTop: '2rem' }}>← Khutlela Lenaneong</Link>
      </div>
    )
  }

  const prevHymn = currentIndex > 0 ? hymnsList[currentIndex - 1] : null
  const nextHymn = currentIndex < hymnsList.length - 1 ? hymnsList[currentIndex + 1] : null

  let processedLyrics = hymn.lyrics.replace(/\\n/g, '\n')
  processedLyrics = processedLyrics.replace(/\n{3,}/g, '___STANZA___')
  processedLyrics = processedLyrics.replace(/\n{2}/g, '\n')
  processedLyrics = processedLyrics.replace(/___STANZA___/g, '\n\n')
  processedLyrics = processedLyrics.trim()

  return (
    <div className="hymn-page">
      <div className="hymn-detail-header">
        <span className="section-label">{langName} &middot; Sefela {hymn.id.replace(/[^0-9]/g, '') || '-'}</span>
        <h1 className="hymn-page-title">{hymn.title}</h1>
        <div className="divider"></div>
      </div>

      <div className="hymn-page-lyrics">{processedLyrics}</div>

      {hymn.related_hymns && hymn.related_hymns.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '1.5rem 0', borderTop: '1px solid rgba(179, 142, 93, 0.3)', borderBottom: '1px solid rgba(179, 142, 93, 0.3)' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--color-burgundy)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Also Available In:
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            {hymn.related_hymns.map((rel, idx) => (
              <Link 
                key={idx} 
                to={`/lifela/${rel.lang}/${rel.id}`}
                className="pill-button pill-button--outline"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                {languages[rel.lang]?.name || rel.lang} - {rel.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="hymn-nav">
        {prevHymn ? (
          <Link to={`/lifela/${effectiveLang}/${prevHymn.id}`} className="hymn-nav-link hymn-nav-link--prev">
            <span className="hymn-nav-label">← E fetileng</span>
            <span className="hymn-nav-title">{prevHymn.title}</span>
          </Link>
        ) : <span />}
        {nextHymn ? (
          <Link to={`/lifela/${effectiveLang}/${nextHymn.id}`} className="hymn-nav-link hymn-nav-link--next">
            <span className="hymn-nav-label">E latelang →</span>
            <span className="hymn-nav-title">{nextHymn.title}</span>
          </Link>
        ) : <span />}
      </nav>
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to={`/lifela?lang=${effectiveLang}`} className="pill-button pill-button--outline" style={{ fontSize: '0.7rem' }}>Khutlela Lenaneong ({langName})</Link>
      </div>
    </div>
  )
}

export default HymnPage

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import prayersData from '../data/prayers.json'
import { useLanguage } from '../context/LanguageContext'
import PrayerEditorModal from '../components/PrayerEditorModal'
import PageTour from '../components/PageTour'

const prayersTourSteps = [
  {
    target: '.lang-toggle-container',
    content: 'You can read the Common Prayers in English, Sesotho, isiZulu, isiXhosa, or Setswana. Just tap here!',
    placement: 'bottom',
  },
  {
    target: '#tour-prayers-private',
    content: "This isn't just a static book! Click here to access your Private Journal, where you can write and securely save your own personal prayers.",
    placement: 'bottom',
  }
];

function PrayersPage() {
  const { t, uiLang } = useLanguage()
  const [lang, setLang] = useState(uiLang || 'sesotho')
  const [activeTab, setActiveTab] = useState('common') // 'common' | 'private'
  
  const [privatePrayers, setPrivatePrayers] = useState([])
  const [loadingPrivate, setLoadingPrivate] = useState(false)
  
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingPrayer, setEditingPrayer] = useState(null) // null for new, or object for edit

  // Sync local language when global uiLang changes, if we have it
  useEffect(() => {
    if (['sesotho', 'zulu', 'xhosa', 'setswana', 'english'].includes(uiLang)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(uiLang)
    }
  }, [uiLang])

  // Fetch private prayers
  const fetchPrivatePrayers = async () => {
    if (!auth.currentUser) return;
    setLoadingPrivate(true);
    try {
      const q = query(collection(db, "private_prayers"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const prayers = [];
      querySnapshot.forEach((doc) => {
        prayers.push({ id: doc.id, ...doc.data() });
      });
      // Sort by descending timestamp (newest first)
      prayers.sort((a, b) => b.timestamp - a.timestamp);
      setPrivatePrayers(prayers);
    } catch (err) {
      console.error("Error fetching private prayers:", err);
    } finally {
      setLoadingPrivate(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'private') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPrivatePrayers();
    }
  }, [activeTab]);

  // Auth state listener to reload if user logs in/out
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (activeTab === 'private' && user) fetchPrivatePrayers();
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleSavePrayer = async (prayerData) => {
    if (!auth.currentUser) return;
    
    try {
      if (prayerData.id) {
        // Update existing
        const prayerRef = doc(db, "private_prayers", prayerData.id);
        await updateDoc(prayerRef, {
          title: prayerData.title,
          content: prayerData.content,
          updatedAt: new Date()
        });
      } else {
        // Create new
        await addDoc(collection(db, "private_prayers"), {
          userId: auth.currentUser.uid,
          title: prayerData.title,
          content: prayerData.content,
          timestamp: new Date(),
          updatedAt: new Date()
        });
        
        // Trigger save data prompt for anonymous users
        if (auth.currentUser.isAnonymous) {
          window.dispatchEvent(new CustomEvent('openAuthModal', { 
             detail: { message: "Want to save your private prayers permanently? Create a free account to sync your journal across all your devices." } 
          }));
        }
      }
      // Refresh list
      fetchPrivatePrayers();
    } catch (err) {
      console.error("Error saving prayer:", err);
      alert("Failed to save prayer. Please check your connection.");
    }
  };

  const handleDeletePrayer = async (id) => {
    if (window.confirm("Are you sure you want to delete this prayer?")) {
      try {
        await deleteDoc(doc(db, "private_prayers", id));
        setPrivatePrayers(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error("Error deleting prayer:", err);
      }
    }
  };

  const openNewPrayer = () => {
    setEditingPrayer(null);
    setIsEditorOpen(true);
  };

  const openEditPrayer = (prayer) => {
    setEditingPrayer(prayer);
    setIsEditorOpen(true);
  };

  return (
    <div className="prayers-page">
      <PageTour tourName="prayers_tour" steps={prayersTourSteps} />
      <div className="index-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="section-label">{t('nav_prayers')}</span>
        <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>
          {lang === 'sesotho' && "Merapelo ea Bakatolike"}
          {lang === 'zulu' && "Imithandazo YamaKatolika"}
          {lang === 'xhosa' && "Imithandazo YamaKatolika"}
          {lang === 'setswana' && "Merapelo ya Bakatholika"}
          {lang === 'english' && "Catholic Prayers"}
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('common')}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '999px', fontSize: '1rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: activeTab === 'common' ? 'var(--color-burgundy)' : '#e5e7eb',
              color: activeTab === 'common' ? 'white' : '#4b5563'
            }}
          >
            {t('prayers_common')}
          </button>
          <button 
            id="tour-prayers-private"
            onClick={() => setActiveTab('private')}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '999px', fontSize: '1rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: activeTab === 'private' ? 'var(--color-burgundy)' : '#e5e7eb',
              color: activeTab === 'private' ? 'white' : '#4b5563'
            }}
          >
            {t('prayers_private')}
          </button>
        </div>

        {activeTab === 'common' && (
          <div className="lang-toggle-container">
            <div className="lang-toggle">
              <button className={`lang-btn ${lang === 'sesotho' ? 'active' : ''}`} onClick={() => setLang('sesotho')}>Sesotho</button>
              <button className={`lang-btn ${lang === 'zulu' ? 'active' : ''}`} onClick={() => setLang('zulu')}>isiZulu</button>
              <button className={`lang-btn ${lang === 'xhosa' ? 'active' : ''}`} onClick={() => setLang('xhosa')}>isiXhosa</button>
              <button className={`lang-btn ${lang === 'setswana' ? 'active' : ''}`} onClick={() => setLang('setswana')}>Setswana</button>
              <button className={`lang-btn ${lang === 'english' ? 'active' : ''}`} onClick={() => setLang('english')}>English</button>
            </div>
          </div>
        )}

        <div className="divider" style={{ marginTop: '2rem' }}></div>
      </div>

      {activeTab === 'common' && (
        <div className="prayers-grid">
          {prayersData.map(prayer => {
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
      )}

      {activeTab === 'private' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <button 
              onClick={openNewPrayer}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
                background: 'white', border: '2px dashed #d1d5db', borderRadius: '16px',
                color: 'var(--color-burgundy)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                transition: 'all 0.2s', width: '100%', maxWidth: '400px', justifyContent: 'center'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-burgundy)'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#d1d5db'}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {t('prayers_write_new')}
            </button>
          </div>

          {loadingPrivate ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0' }}>{t('prayers_loading')}</div>
          ) : privatePrayers.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0', background: '#f9fafb', borderRadius: '24px' }}>
              <p style={{ margin: '0 0 1rem', fontSize: '1.125rem' }}>{t('prayers_empty_title')}</p>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{t('prayers_empty_desc')}</p>
            </div>
          ) : (
            <div className="prayers-grid">
              {privatePrayers.map(prayer => (
                <article className="prayer-card" key={prayer.id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openEditPrayer(prayer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }} title="Edit">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDeletePrayer(prayer.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <h2 className="prayer-title" style={{ paddingRight: '3rem' }}>{prayer.title}</h2>
                  <div className="prayer-content">
                    {prayer.content.split('\n').map((paragraph, index) => (
                      <p key={index} style={{ minHeight: '1rem' }}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      <PrayerEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        onSave={handleSavePrayer} 
        initialData={editingPrayer} 
      />
    </div>
  )
}

export default PrayersPage

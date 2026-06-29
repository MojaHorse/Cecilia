import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const AVAILABLE_LANGS = [
  { id: 'english', label: 'English' },
  { id: 'sesotho', label: 'Sesotho' },
  { id: 'zulu', label: 'Zulu' },
  { id: 'xhosa', label: 'Xhosa' },
  { id: 'setswana', label: 'Setswana' }
];

const PrayerEditorModal = ({ isOpen, onClose, onSave, initialData }) => {
  const { t, uiLang } = useLanguage();
  const [translations, setTranslations] = useState({
    english: { title: '', content: '' },
    sesotho: { title: '', content: '' },
    zulu: { title: '', content: '' },
    xhosa: { title: '', content: '' },
    setswana: { title: '', content: '' }
  });
  const [editingLang, setEditingLang] = useState('english');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultLang = uiLang || 'english';
      setEditingLang(defaultLang);
      
      if (initialData?.translations) {
        setTranslations({
          english: initialData.translations.english || { title: '', content: '' },
          sesotho: initialData.translations.sesotho || { title: '', content: '' },
          zulu: initialData.translations.zulu || { title: '', content: '' },
          xhosa: initialData.translations.xhosa || { title: '', content: '' },
          setswana: initialData.translations.setswana || { title: '', content: '' }
        });
      } else {
        // Backwards compatibility: put old root title/content into default lang
        const oldTitle = initialData?.title || '';
        const oldContent = initialData?.content || '';
        setTranslations({
          english: { title: '', content: '' },
          sesotho: { title: '', content: '' },
          zulu: { title: '', content: '' },
          xhosa: { title: '', content: '' },
          setswana: { title: '', content: '' },
          [defaultLang]: { title: oldTitle, content: oldContent }
        });
      }
      setIsSaving(false);
    }
  }, [isOpen, initialData, uiLang]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Ensure the CURRENTLY editing language is saved, but also allow save if ANY language is populated
    const currentTranslation = translations[editingLang];
    const hasAnyContent = Object.values(translations).some(tr => tr.title.trim() && tr.content.trim());
    
    if (!hasAnyContent) return;

    setIsSaving(true);
    
    // Clean translations payload
    const cleanTranslations = {};
    Object.keys(translations).forEach(lang => {
      if (translations[lang].title.trim() || translations[lang].content.trim()) {
        cleanTranslations[lang] = {
          title: translations[lang].title.trim(),
          content: translations[lang].content.trim()
        };
      }
    });

    // Provide root title/content for backwards compatibility using editing lang or first available
    const rootTitle = cleanTranslations[editingLang]?.title || Object.values(cleanTranslations)[0]?.title || '';
    const rootContent = cleanTranslations[editingLang]?.content || Object.values(cleanTranslations)[0]?.content || '';

    await onSave({
      id: initialData?.id,
      translations: cleanTranslations,
      title: rootTitle,
      content: rootContent
    });
    setIsSaving(false);
    onClose();
  };

  const updateCurrentTranslation = (field, value) => {
    setTranslations(prev => ({
      ...prev,
      [editingLang]: {
        ...prev[editingLang],
        [field]: value
      }
    }));
  };

  const isCurrentLangValid = translations[editingLang].title.trim() && translations[editingLang].content.trim();
  const hasAnyContent = Object.values(translations).some(tr => tr.title.trim() && tr.content.trim());

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100000, padding: '1rem', animation: 'fadeIn 0.2s'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .lang-tab {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .lang-tab.active {
          background: var(--color-burgundy);
          color: white;
        }
        .lang-tab.inactive {
          background: #f3f4f6;
          color: #4b5563;
        }
        .lang-tab.inactive:hover {
          background: #e5e7eb;
        }
        .lang-tab.has-content {
          border-color: var(--color-burgundy);
        }
      `}</style>
      
      <div style={{
        background: '#fff', borderRadius: '24px', padding: '2rem',
        maxWidth: '600px', width: '100%', position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-heading)', color: 'var(--color-ink)', fontSize: '1.5rem' }}>
            {initialData ? t('prayer_editor_title_edit') : t('prayer_editor_title_new')}
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px'
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Language Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {AVAILABLE_LANGS.map(lang => {
            const hasContent = translations[lang.id]?.title.trim() || translations[lang.id]?.content.trim();
            const isActive = editingLang === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => setEditingLang(lang.id)}
                className={`lang-tab ${isActive ? 'active' : 'inactive'} ${hasContent && !isActive ? 'has-content' : ''}`}
              >
                {lang.label} {hasContent && !isActive ? '✓' : ''}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ink-light)' }}>
              {t('prayer_editor_label_title')} ({AVAILABLE_LANGS.find(l => l.id === editingLang)?.label})
            </label>
            <input 
              type="text" 
              placeholder={t('prayer_editor_placeholder_title')} 
              value={translations[editingLang].title} 
              onChange={e => updateCurrentTranslation('title', e.target.value)} 
              style={{ padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ink-light)' }}>
              {t('prayer_editor_label_content')} ({AVAILABLE_LANGS.find(l => l.id === editingLang)?.label})
            </label>
            <textarea 
              placeholder={t('prayer_editor_placeholder_content')} 
              value={translations[editingLang].content} 
              onChange={e => updateCurrentTranslation('content', e.target.value)} 
              style={{ 
                padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--color-border)', 
                fontSize: '1rem', outline: 'none', resize: 'none', flex: 1, minHeight: '200px',
                fontFamily: 'inherit', lineHeight: 1.6
              }}
            />
          </div>
          
          <button type="submit" disabled={isSaving || !hasAnyContent} style={{
            padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-burgundy)',
            color: 'white', fontSize: '1rem', fontWeight: 600, cursor: (isSaving || !hasAnyContent) ? 'not-allowed' : 'pointer',
            opacity: (isSaving || !hasAnyContent) ? 0.7 : 1, marginTop: '0.5rem'
          }}>
            {isSaving ? t('prayer_editor_saving') : t('prayer_editor_save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrayerEditorModal;

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const PrayerEditorModal = ({ isOpen, onClose, onSave, initialData }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setContent(initialData?.content || '');
      setIsSaving(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    await onSave({
      id: initialData?.id,
      title: title.trim(),
      content: content.trim()
    });
    setIsSaving(false);
    onClose();
  };

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
      `}</style>
      
      <div style={{
        background: '#fff', borderRadius: '24px', padding: '2rem',
        maxWidth: '500px', width: '100%', position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ink-light)' }}>{t('prayer_editor_label_title')}</label>
            <input 
              type="text" 
              placeholder={t('prayer_editor_placeholder_title')} 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
              style={{ padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ink-light)' }}>{t('prayer_editor_label_content')}</label>
            <textarea 
              placeholder={t('prayer_editor_placeholder_content')} 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              required
              style={{ 
                padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--color-border)', 
                fontSize: '1rem', outline: 'none', resize: 'none', flex: 1, minHeight: '200px',
                fontFamily: 'inherit', lineHeight: 1.6
              }}
            />
          </div>
          
          <button type="submit" disabled={isSaving || !title.trim() || !content.trim()} style={{
            padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-burgundy)',
            color: 'white', fontSize: '1rem', fontWeight: 600, cursor: (isSaving || !title.trim() || !content.trim()) ? 'not-allowed' : 'pointer',
            opacity: (isSaving || !title.trim() || !content.trim()) ? 0.7 : 1, marginTop: '0.5rem'
          }}>
            {isSaving ? t('prayer_editor_saving') : t('prayer_editor_save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrayerEditorModal;

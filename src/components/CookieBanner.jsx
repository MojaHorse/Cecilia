import React, { useState, useEffect } from 'react';
import { useTour } from '../context/TourContext';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { hasCompletedTour } = useTour();

  useEffect(() => {
    if (!hasCompletedTour('home_tour')) return;
    
    // Check if user has already consented
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay before showing the banner so it feels less aggressive
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour]);

  const handleAccept = (type) => {
    localStorage.setItem('cookie_consent', type);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2rem)',
      maxWidth: '800px',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '24px',
      padding: '1.5rem 2rem',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <style>
        {`
          @keyframes slideUp {
            from { transform: translate(-50%, 100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
          @media (min-width: 640px) {
            .cookie-banner-content { flex-direction: row; align-items: center; justify-content: space-between; }
            .cookie-banner-actions { flex-direction: row; }
          }
        `}
      </style>
      
      <div className="cookie-banner-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: 'var(--color-ink)', fontWeight: 600 }}>
            We value your privacy
          </h3>
          <p style={{ margin: 0, color: 'var(--color-ink-light)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
          </p>
        </div>
        
        <div className="cookie-banner-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 'fit-content' }}>
          <button 
            onClick={() => handleAccept('essential')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            Essential Only
          </button>
          <button 
            onClick={() => handleAccept('all')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: 'none',
              background: 'var(--color-burgundy)',
              color: 'var(--color-white)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(118, 43, 56, 0.3)'
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;

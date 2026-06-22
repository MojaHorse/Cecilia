import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useTour } from '../context/TourContext';

const CaptureModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const { hasCompletedTour } = useTour();

  useEffect(() => {
    if (!hasCompletedTour('home_tour')) return;
    
    const hasSeenModal = localStorage.getItem('capture_modal_seen');
    if (!hasSeenModal) {
      // Show modal after 15 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('capture_modal_seen', 'true');
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    try {
      await addDoc(collection(db, 'subscribers'), {
        email: email,
        subscribedAt: serverTimestamp(),
        source: 'daily_verse_modal'
      });
      setStatus('success');
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      console.error("Error subscribing:", err);
      setStatus('error');
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      animation: 'fadeIn 0.3s ease',
      padding: '1rem'
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUpModal {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>

      <div style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '3rem 2rem',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        animation: 'slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        textAlign: 'center'
      }}>
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="var(--color-burgundy)" strokeWidth={1.5} style={{ marginBottom: '1.5rem', margin: '0 auto', display: 'block' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
        </svg>

        <h2 style={{ fontFamily: 'var(--font-serif-heading)', color: 'var(--color-ink)', fontSize: '2rem', marginBottom: '0.5rem', marginTop: 0 }}>
          Daily Inspiration
        </h2>
        <p style={{ color: 'var(--color-ink-light)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          Start your morning with a handpicked Bible verse and a short reflection. Delivered straight to your inbox.
        </p>

        {status === 'success' ? (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '12px', fontWeight: 600 }}>
            Thank you! You've successfully subscribed.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-burgundy)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
            {status === 'error' && (
              <span style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'left' }}>Something went wrong. Please try again.</span>
            )}
            <button 
              type="submit"
              disabled={status === 'loading'}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--color-burgundy)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(118, 43, 56, 0.3)',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => { if(status !== 'loading') e.currentTarget.style.transform = 'scale(0.98)' }}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
            </button>
          </form>
        )}
        
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '1.5rem', marginBottom: 0 }}>
          No spam, ever. You can unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default CaptureModal;

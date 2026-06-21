import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInWithCredential,
  linkWithCredential, 
  linkWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const AuthModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleOpenAuth = (e) => {
      setPromptMessage(e.detail?.message || 'Create an account to sync your data.');
      setMode('signup');
      setIsVisible(true);
      setStatus('idle');
      setErrorMsg('');
    };

    window.addEventListener('openAuthModal', handleOpenAuth);
    return () => window.removeEventListener('openAuthModal', handleOpenAuth);
  }, []);

  if (!isVisible) return null;

  const handleClose = () => setIsVisible(false);

  const handleGoogle = async () => {
    try {
      setStatus('loading');
      setErrorMsg('');
      const currentUser = auth.currentUser;
      
      if (currentUser && currentUser.isAnonymous && mode === 'signup') {
        try {
          await linkWithPopup(currentUser, googleProvider);
        } catch (linkError) {
          if (linkError.code === 'auth/credential-already-in-use') {
            // Fallback to sign in if account exists
            const credential = GoogleAuthProvider.credentialFromError(linkError);
            await signInWithCredential(auth, credential);
          } else {
            throw linkError;
          }
        }
      } else {
        await signInWithPopup(auth, googleProvider);
      }
      
      setIsVisible(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to authenticate with Google.');
      setStatus('idle');
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      setStatus('loading');
      setErrorMsg('');
      const currentUser = auth.currentUser;

      if (mode === 'signup') {
        if (currentUser && currentUser.isAnonymous) {
          const credential = EmailAuthProvider.credential(email, password);
          try {
            await linkWithCredential(currentUser, credential);
          } catch (linkError) {
            if (linkError.code === 'auth/email-already-in-use') {
               setErrorMsg('Email already in use. Please log in.');
               setMode('login');
               setStatus('idle');
               return;
            } else {
              throw linkError;
            }
          }
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setIsVisible(false);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password.');
      } else {
        setErrorMsg(err.message || 'Authentication failed.');
      }
      setStatus('idle');
    }
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
        background: '#fff', borderRadius: '24px', padding: '2.5rem 2rem',
        maxWidth: '400px', width: '100%', position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        textAlign: 'center'
      }}>
        <button onClick={handleClose} style={{
          position: 'absolute', top: '1rem', right: '1rem', background: 'transparent',
          border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '8px', borderRadius: '50%'
        }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-serif-heading)', color: 'var(--color-ink)', fontSize: '1.75rem' }}>
          {mode === 'signup' ? 'Save Your Data' : 'Welcome Back'}
        </h2>
        {mode === 'signup' && (
          <p style={{ margin: '0 0 2rem', color: 'var(--color-ink-light)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {promptMessage}
          </p>
        )}

        <button 
          onClick={handleGoogle} 
          disabled={status === 'loading'}
          style={{
            width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #d1d5db',
            background: '#fff', color: '#374151', fontSize: '1rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer', marginBottom: '1.5rem',
            transition: 'background 0.2s'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        </div>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '1rem', outline: 'none' }}
          />
          <input 
            type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '1rem', outline: 'none' }}
          />
          {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'left' }}>{errorMsg}</div>}
          
          <button type="submit" disabled={status === 'loading'} style={{
            padding: '0.875rem', borderRadius: '12px', border: 'none', background: 'var(--color-burgundy)',
            color: 'white', fontSize: '1rem', fontWeight: 600, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1, marginTop: '0.5rem'
          }}>
            {status === 'loading' ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          {mode === 'signup' ? (
            <>Already have an account? <button onClick={() => {setMode('login'); setErrorMsg('');}} style={{ background: 'none', border: 'none', color: 'var(--color-burgundy)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Log In</button></>
          ) : (
            <>Don't have an account? <button onClick={() => {setMode('signup'); setErrorMsg('');}} style={{ background: 'none', border: 'none', color: 'var(--color-burgundy)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Sign Up</button></>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

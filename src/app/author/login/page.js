'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import formStyles from '@/styles/forms.module.css';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';

export default function AuthorLogin() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'Login successful. Redirecting...' });
        // Assuming setting a cookie or local storage, then redirect
        window.location.href = '/author/dashboard';
      } else {
        setStatus({ type: 'error', message: resData.error || 'Invalid credentials.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container animate-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh' }}>
      <SpotlightCard className={formStyles.formContainer}>
        <h1 style={{ textAlign: 'center' }}>Author Login</h1>
        <p>Access your dashboard, manage manuscripts, and view royalties.</p>
        
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" required />
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          
          <button type="submit" className={`btn-primary ${formStyles.submitBtn}`} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          {status && (
            <div className={`${formStyles.message} ${formStyles[status.type]}`}>
              {status.message}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Don't have an account? <Link href="/author/signup" style={{ color: 'var(--accent)' }}>Request Representation</Link>
          </div>
        </form>
      </SpotlightCard>
    </div>
  );
}

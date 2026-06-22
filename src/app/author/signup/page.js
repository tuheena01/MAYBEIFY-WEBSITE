'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import formStyles from '@/styles/forms.module.css';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';

function SignupForm() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const isAmbassador = type === 'ambassador';

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Add role to the payload
    data.role = isAmbassador ? 'AMBASSADOR' : 'AUTHOR';

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok) {
        setStatus({ 
          type: 'success', 
          message: isAmbassador 
            ? 'Ambassador request sent! You will receive your unique referral link after review.' 
            : 'Account request sent! Your profile will be live after admin approval.' 
        });
      } else {
        setStatus({ type: 'error', message: resData.error || 'Signup failed.' });
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
        <h1 style={{ textAlign: 'center' }}>
          {isAmbassador ? 'Become an Ambassador' : 'Request Representation'}
        </h1>
        <p style={{ textAlign: 'center' }}>
          {isAmbassador 
            ? 'Join our global referral network. Shape the future of literature.' 
            : 'Join our elite roster of authors. Your account will be activated upon editorial review.'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" required />
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" required />
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          
          <button type="submit" className={`btn-primary ${formStyles.submitBtn}`} disabled={loading}>
            {loading ? 'Processing...' : (isAmbassador ? 'Join Program' : 'Apply for Access')}
          </button>

          {status && (
            <div className={`${formStyles.message} ${formStyles[status.type]}`}>
              {status.message}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Already have an account? <Link href="/author/login" style={{ color: 'var(--accent)' }}>Sign In</Link>
          </div>
        </form>
      </SpotlightCard>
    </div>
  );
}

export default function AuthorSignup() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}


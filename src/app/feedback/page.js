'use client';

import { useState } from 'react';
import formStyles from '@/styles/forms.module.css';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';

export default function FeedbackPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Thank you for your valuable feedback.' });
        e.target.reset();
      } else {
        setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container animate-in">
      <SpotlightCard className={formStyles.formContainer}>
        <h1>Service Feedback</h1>
        <p>Your insights shape the future of Maybeify.</p>
        
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGroup}>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="rating">Rating (1-5)</label>
            <select id="rating" name="rating" required>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="message">Feedback</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          
          <button type="submit" className={`btn-primary ${formStyles.submitBtn}`} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>

          {status && (
            <div className={`${formStyles.message} ${formStyles[status.type]}`}>
              {status.message}
            </div>
          )}
        </form>
      </SpotlightCard>
    </div>
  );
}

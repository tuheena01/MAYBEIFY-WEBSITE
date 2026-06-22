'use client';

import { useModal } from '@/context/ModalContext';
import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import styles from './SubmitModal.module.css';

export default function SubmitModal() {
  const { isSubmitModalOpen, setSubmitModalOpen } = useModal();
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', title: '', genre: '', synopsis: '' });



  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        const error = await res.json();
        alert(error.error || 'Submission failed. Please try again.');
        setStatus(null);
      }
    } catch (err) {
      alert('Network error. Please try again.');
      setStatus(null);
    }
  };

  if (!isSubmitModalOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setSubmitModalOpen(false)}>
      <div className={styles.card}>
        <div className={styles.grain}></div>
        <div className={styles.cardGlow}></div>
        
        <button className={styles.closeBtn} onClick={() => setSubmitModalOpen(false)}>
          <X size={20} strokeWidth={1} />
        </button>

        {status !== 'success' ? (
          <div className={styles.container}>
            {/* LEFT SIDE: BRANDING & STATS */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarContent}>
                <span className={styles.eyebrow}>Exclusive Invitation</span>
                <h2 className={styles.sideTitle}>Apply for<br /><em>Representation</em></h2>
                <p className={styles.sideText}>
                  Your story may be the next legacy we publish.
                </p>
                
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>✦</span>
                    <span className={styles.statLabel}>250+ Authors Published</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>✦</span>
                    <span className={styles.statLabel}>50+ Bestselling Titles</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>✦</span>
                    <span className={styles.statLabel}>Global Distribution</span>
                  </div>
                </div>

                <div className={styles.trustBadge}>
                  Every submission is personally reviewed by our editorial team.
                </div>
              </div>
              <div className={styles.sideAccent}></div>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className={styles.formSection}>
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>Tell us about your manuscript.</h3>
                <p className={styles.formSubtitle}>
                  Fiction. Poetry. Memoir. Spirituality.<br />
                  <span>We publish stories that leave a mark.</span>
                </p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.staggeredField} style={{'--i': 1}}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Your Name</label>
                      <input type="text" required placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div className={styles.field}>
                      <label>Email Address</label>
                      <input type="email" required placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className={styles.staggeredField} style={{'--i': 2}}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Book / Manuscript Title</label>
                      <input type="text" required placeholder="Working title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>
                    <div className={styles.field}>
                      <label>Select Genre</label>
                      <input type="text" required placeholder="Literary Fiction, Memoir..." value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className={styles.staggeredField} style={{'--i': 3}}>
                  <div className={styles.field}>
                    <label>Tell Us About Your Story</label>
                    <textarea required placeholder="What is your story about?" value={form.synopsis} onChange={e => setForm({...form, synopsis: e.target.value})} rows={3} />
                    <span className={styles.fieldHint}>Max 300 words</span>
                  </div>
                </div>

                <div className={styles.staggeredField} style={{'--i': 4}}>
                  <div className={styles.actionRow}>
                    <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                      {status === 'loading' ? (
                        <><span className={styles.btnSpinner}></span> Sending...</>
                      ) : (
                        <>Submit Manuscript <span>→</span></>
                      )}
                    </button>
                    <span className={styles.secureText}>
                      Secure & confidential submission
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>✦</div>
            <h2 className="serif">Application Received.</h2>
            <p>Our acquisitions board will review your manuscript within 14 business days. If selected, you will be contacted privately.</p>
            <button className={styles.successClose} onClick={() => { setSubmitModalOpen(false); setStatus(null); }}>
              Begin My Publishing Journey
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


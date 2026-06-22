'use client';

import { useModal } from '@/context/ModalContext';
import { useState } from 'react';
import { X, Award, Sparkles, BookOpen, User, Mail, PenTool, CheckCircle2 } from 'lucide-react';
import styles from './NominateModal.module.css';

export default function NominateModal() {
  const { isNominateModalOpen, setNominateModalOpen } = useModal();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', title: '', genre: '', reason: '', synopsis: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('success');
        setStep(3);
      } else {
        const error = await res.json();
        alert(error.error || 'Nomination failed. Please try again.');
        setStatus(null);
      }
    } catch (err) {
      alert('Network error. Please try again.');
      setStatus(null);
    }
  };

  const handleClose = () => {
    setNominateModalOpen(false);
    // Reset states after animation duration
    setTimeout(() => {
      setStep(1);
      setStatus(null);
      setForm({ name: '', email: '', title: '', genre: '', reason: '', synopsis: '' });
    }, 300);
  };

  if (!isNominateModalOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={styles.card}>
        <div className={styles.grain}></div>
        <div className={styles.cardGlow}></div>
        
        <button className={styles.closeBtn} onClick={handleClose}>
          <X size={20} strokeWidth={1} />
        </button>

        {step === 1 && (
          <div className={styles.introContainer}>
            <div className={styles.badgeSection}>
              <div className={styles.goldenBadgeContainer}>
                <div className={styles.badgeGlow}></div>
                <Award className={styles.badgeIcon} size={64} strokeWidth={1} />
              </div>
              <span className={styles.eyebrow}>2026 Literary Excellence</span>
              <h2 className={styles.awardTitle}>The Maybeify <br /><em>Golden Scroll</em></h2>
              <div className={styles.divider}></div>
              <p className={styles.awardAbout}>
                Celebrating extraordinary, unreleased voices that push the boundaries of modern literature. The Golden Scroll recognizes authors of outstanding promise with complete elite publishing support.
              </p>
            </div>
            
            <div className={styles.detailsSection}>
              <h3 className={styles.sectionHeading}>Award Benefits & Privileges</h3>
              <div className={styles.benefitsGrid}>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>✦</div>
                  <div>
                    <h4>₹50,000 Cash Grant</h4>
                    <p>Financial support to fuel your dedicated writing journey.</p>
                  </div>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>✦</div>
                  <div>
                    <h4>100% Free Elite Publication</h4>
                    <p>Full suite of editorial, bespoke design, and marketing services.</p>
                  </div>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>✦</div>
                  <div>
                    <h4>Global Distribution</h4>
                    <p>Guaranteed release across premier bookstores and online channels.</p>
                  </div>
                </div>
              </div>

              <div className={styles.criteriaBox}>
                <strong>Eligibility:</strong> Open to all genres. Manuscript must be original, unpublished, or in-development. Self-nominations are accepted.
              </div>

              <button className={styles.actionBtn} onClick={() => setStep(2)}>
                Nominate My Work <span>→</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.formContainer}>
            <div className={styles.formSidebar}>
              <div className={styles.sidebarHeader}>
                <span className={styles.eyebrow}>Step 2 of 2</span>
                <h2 className={styles.sidebarTitle}>Author & <br /><em>Manuscript</em></h2>
                <p className={styles.sidebarText}>Provide details about yourself and the story you wish to nominate.</p>
              </div>
              <div className={styles.lockBox}>
                <Sparkles size={16} className={styles.lockIcon} />
                <span>All submissions are confidential & vetted by the board.</span>
              </div>
            </div>

            <div className={styles.formSection}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Full Name</label>
                    <div className={styles.inputWrapper}>
                      <User size={16} className={styles.inputIcon} />
                      <input 
                        type="text" 
                        required 
                        placeholder="Author's name" 
                        value={form.name} 
                        onChange={e => setForm({...form, name: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Email Address</label>
                    <div className={styles.inputWrapper}>
                      <Mail size={16} className={styles.inputIcon} />
                      <input 
                        type="email" 
                        required 
                        placeholder="contact@email.com" 
                        value={form.email} 
                        onChange={e => setForm({...form, email: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Manuscript Title</label>
                    <div className={styles.inputWrapper}>
                      <BookOpen size={16} className={styles.inputIcon} />
                      <input 
                        type="text" 
                        required 
                        placeholder="Title or working title" 
                        value={form.title} 
                        onChange={e => setForm({...form, title: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Genre</label>
                    <div className={styles.inputWrapper}>
                      <PenTool size={16} className={styles.inputIcon} />
                      <input 
                        type="text" 
                        required 
                        placeholder="Literary Fiction, Poetry, Memoir..." 
                        value={form.genre} 
                        onChange={e => setForm({...form, genre: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Story Synopsis</label>
                  <textarea 
                    required 
                    placeholder="Briefly summarize your manuscript..." 
                    value={form.synopsis} 
                    onChange={e => setForm({...form, synopsis: e.target.value})} 
                    rows={3} 
                  />
                </div>

                <div className={styles.field}>
                  <label>Why should this work win the Golden Scroll?</label>
                  <textarea 
                    required 
                    placeholder="Explain the unique themes, impact, or promise of this manuscript..." 
                    value={form.reason} 
                    onChange={e => setForm({...form, reason: e.target.value})} 
                    rows={3} 
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                    {status === 'loading' ? (
                      <><span className={styles.btnSpinner}></span> Submitting...</>
                    ) : (
                      <>Nominate Now 🏆</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.successContainer}>
            <div className={styles.successIconWrapper}>
              <CheckCircle2 size={64} className={styles.successIcon} />
            </div>
            <h2 className={styles.successTitle}>Nomination Submitted.</h2>
            <p className={styles.successText}>
              Your manuscript <strong>"{form.title}"</strong> is now officially under consideration for the 2026 Maybeify Golden Scroll.
            </p>
            <p className={styles.successSub}>
              Our awards committee evaluates entries on a rolling basis. You will receive a confirmation email shortly, and finalists will be contacted directly.
            </p>
            <button className={styles.successClose} onClick={handleClose}>
              Return to Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

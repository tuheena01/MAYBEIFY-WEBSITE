'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Trophy } from 'lucide-react';
import styles from './SpinWheelChallenge.module.css';

export default function SpinWheelChallenge() {
  const [isOpen, setIsOpen] = useState(false);
  const [spinState, setSpinState] = useState('intro'); // 'intro', 'spinning', 'congrats', 'form', 'success'
  const [rotation, setRotation] = useState(0);
  const [wonDiscount, setWonDiscount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    title: '',
    genre: '',
    synopsis: ''
  });

  const sectors = [
    { label: '10%', color: '#C9A050' },   // Gold
    { label: '5%', color: '#0C121D' },    // Navy
    { label: '10%', color: '#E2B65E' },   // Light Gold
    { label: '5%', color: '#162235' },    // Medium Navy
    { label: '10%', color: '#C9A050' },   // Gold
    { label: '5%', color: '#0C121D' },    // Navy
    { label: '10%', color: '#E2B65E' },   // Light Gold
    { label: '5%', color: '#162235' }     // Medium Navy
  ];

  // Auto-open on landing after 2.5 seconds
  useEffect(() => {
    const seen = sessionStorage.getItem('maybeify_spin_seen');
    if (!seen) {
      const t = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('maybeify_spin_seen', '1');
      }, 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSpin = () => {
    if (spinState !== 'intro') return;

    setSpinState('spinning');
    setPointerActive(true);

    // RIGGING: Only land on 5% or 10%
    const allowedIndexes = [0, 1, 2, 3, 4, 5, 6, 7];
    const selectedIndex = allowedIndexes[Math.floor(Math.random() * allowedIndexes.length)];
    const prize = sectors[selectedIndex].label;
    setWonDiscount(prize);

    // Calculate rotation angle to align the winning sector at the top (12 o'clock)
    // Formula: extraSpins * 360 - (selectedIndex * 45 + 90)
    const sectorWidth = 45; 
    const extraSpins = 5; // Spin 5 times
    const targetDegrees = 360 * extraSpins - (selectedIndex * sectorWidth + 90);

    setRotation(targetDegrees);

    // Toggle pointer click animations periodically during the spin
    let tickCount = 0;
    const interval = setInterval(() => {
      setPointerActive(prev => !prev);
      tickCount++;
      if (tickCount > 28) {
        clearInterval(interval);
      }
    }, 130);

    // Wait for the transition to finish (4 seconds)
    setTimeout(() => {
      setSpinState('congrats');
      setPointerActive(false);
    }, 4100);
  };

  const handleClaim = () => {
    setSpinState('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          discount: `${wonDiscount} Off (Spin Wheel)`
        })
      });

      if (res.ok) {
        setSpinState('success');
      } else {
        const error = await res.json();
        alert(error.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
      <div className={`${styles.card} ${spinState === 'form' ? styles.formActive : ''}`}>
        <div className={styles.grain}></div>
        <div className={styles.cardGlow}></div>

        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
          <X size={20} strokeWidth={1} />
        </button>

        <div className={styles.container}>
          {spinState !== 'form' && spinState !== 'success' && (
            <>
              {/* LEFT COLUMN: TEXT INTRO / WINNING CONGRATS */}
              <div className={styles.leftCol}>
                {spinState === 'intro' || spinState === 'spinning' ? (
                  <>
                    <span className={styles.eyebrow}>Exclusive Event</span>
                    <h2 className={styles.title}>The <em>Legacy</em> Wheel</h2>
                    <p className={styles.description}>
                      Every manuscript published by Maybeify is crafted to be timeless. 
                      Spin our wheel to unlock <span className={styles.descBold}>elite author grants & publishing scholarships</span> of up to 10%.
                    </p>
                    <p className={styles.description} style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                      *One spin per manuscript submission. Results are secure and privately reviewed by our Acquisitions Board.
                    </p>
                  </>
                ) : (
                  <div className={styles.congratsText}>
                    <Trophy size={48} className={styles.successIcon} style={{ margin: '0 auto 1.5rem', animation: 'bounce 2s infinite' }} />
                    <span className={styles.eyebrow}>Scholarship Unlocked</span>
                    <h3 className={styles.congratsTitle}>Congratulations!</h3>
                    <p className={styles.description}>
                      You have won an exclusive publishing grant:
                    </p>
                    <span className={styles.discountBadgeText}>{wonDiscount} OFF</span>
                    <p className={styles.description}>
                      Lock in this scholarship by submitting your details to the acquisitions board below.
                    </p>
                    <button className={styles.claimButton} onClick={handleClaim}>
                      Claim Scholarship Now →
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: WHEEL DISPLAY */}
              <div className={styles.rightCol}>
                <div className={styles.wheelOuter}>
                  {/* Outer glowing dots */}
                  <div className={styles.wheelLights}>
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i} 
                        className={styles.lightDot} 
                        style={{ 
                          transform: `rotate(${i * 45}deg)`,
                          animationDelay: `${i * 0.15}s` 
                        }}
                      />
                    ))}
                  </div>

                  {/* Top Pointer */}
                  <svg 
                    className={`${styles.wheelPointer} ${pointerActive ? styles.active : ''}`} 
                    viewBox="0 0 30 40"
                    fill="none"
                  >
                    <path d="M15 40L30 10C30 4.47715 23.2843 0 15 0C6.71573 0 0 4.47715 0 10L15 40Z" fill="url(#pointerGold)" />
                    <defs>
                      <linearGradient id="pointerGold" x1="0" y1="0" x2="30" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#DFB060" />
                        <stop offset="1" stopColor="#C9A050" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Rotating Wheel Svg */}
                  <svg 
                    className={styles.wheelSvg} 
                    viewBox="0 0 300 300"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {/* Render the 8 sectors */}
                    {sectors.map((sector, i) => {
                      const rotationAngle = i * 45 - 22.5;
                      const isDark = sector.color.startsWith('#0C') || sector.color.startsWith('#16');
                      return (
                        <g 
                          key={i} 
                          transform={`rotate(${rotationAngle}, 150, 150)`}
                        >
                          {/* Wedge path from 0 to 45 degrees */}
                          <path 
                            d="M 150 150 L 290 150 A 140 140 0 0 1 248.99 248.99 Z" 
                            fill={sector.color}
                            stroke="rgba(0,0,0,0.15)"
                            strokeWidth="0.5"
                          />
                          {/* Radial text centered at 22.5 degrees */}
                          <text 
                            x="222" 
                            y="155" 
                            fill={isDark ? '#F0EBE3' : '#080C14'} 
                            fontSize="13px" 
                            fontWeight="600" 
                            fontFamily="var(--font-sans)"
                            transform="rotate(22.5, 150, 150)" 
                            textAnchor="middle"
                          >
                            {sector.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Interactive Center Spin Button */}
                  <button 
                    className={styles.wheelCenterButton} 
                    onClick={handleSpin}
                    disabled={spinState !== 'intro'}
                  >
                    {spinState === 'spinning' ? '...' : 'SPIN'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STATE: CLAIM DETAIL FORM */}
          {spinState === 'form' && (
            <div className={styles.formCol} style={{ gridColumn: 'span 2' }}>
              <div className={styles.formHeader}>
                <span className={styles.eyebrow}>Scholarship Locked</span>
                <h3 className={styles.formTitle}>Submit Manuscript Representation</h3>
                <p className={styles.formSubtitle}>
                  Please fill out your details to connect with our editorial team and apply your <strong>{wonDiscount} Discount</strong>.
                </p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Full name" 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="your@email.com" 
                      value={form.email} 
                      onChange={e => setForm({...form, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>Book / Manuscript Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Working title" 
                      value={form.title} 
                      onChange={e => setForm({...form, title: e.target.value})} 
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Select Genre</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Literary Fiction, Memoir, Poetry..." 
                      value={form.genre} 
                      onChange={e => setForm({...form, genre: e.target.value})} 
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Tell Us About Your Story</label>
                  <textarea 
                    required 
                    placeholder="Brief outline or synopsis..." 
                    value={form.synopsis} 
                    onChange={e => setForm({...form, synopsis: e.target.value})} 
                    rows={3} 
                  />
                </div>

                <div className={styles.actionRow}>
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? (
                      <><span className={styles.btnSpinner}></span> Locking Grant...</>
                    ) : (
                      <>Apply {wonDiscount} Scholarship <span>→</span></>
                    )}
                  </button>
                  <span className={styles.secureText} style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>
                    ✦ Personal & secure review by Acquisitions board
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* STATE: SUCCESS SCREEN */}
          {spinState === 'success' && (
            <div className={styles.successCol}>
              <div className={styles.successIcon}>✦</div>
              <h2 className={styles.successTitle}>Scholarship & Manuscript Received.</h2>
              <p className={styles.successDesc}>
                We have registered your <strong>{wonDiscount} OFF</strong> publishing scholarship. 
                Our acquisitions board will review your manuscript synopsis and contact you privately via email within 14 business days.
              </p>
              <button className={styles.successCloseBtn} onClick={() => setIsOpen(false)}>
                Enter The House of Maybeify
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

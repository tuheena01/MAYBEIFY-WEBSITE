'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, BookOpen, User, Mail, Calendar, PenTool, CheckCircle2, ChevronDown, Mic, Share2, MessageCircle, Phone } from 'lucide-react';
import styles from './nominate.module.css';

const InstagramIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function NominatePage() {
  const [perksRevealed, setPerksRevealed] = useState(false);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    title: '', // Book Name
    genre: '',
    yearOfPublishing: '',
    instagram: '',
    whatsapp: '',
    phone: '',
    synopsis: '',
    reason: ''
  });

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

  const handleReset = () => {
    setForm({
      name: '',
      email: '',
      title: '',
      genre: '',
      yearOfPublishing: '',
      instagram: '',
      whatsapp: '',
      phone: '',
      synopsis: '',
      reason: ''
    });
    setStatus(null);
    setPerksRevealed(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.floatingGrid} />
      <div className={styles.pageGlow} />

      <div className="container">
        {/* ── TOP HEADER SECTION ── */}
        <header className={styles.header}>
          <motion.div 
            className={styles.statusBadge}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.pulse}></span>
            Nominations Open
          </motion.div>
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            LITERARY ICONS 2026
          </motion.h1>
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Celebrating exceptional literary voices and stories that deserve to leave an impact. We invite writers, editors, and readers to submit outstanding unreleased or newly published manuscripts for our highest honor.
          </motion.p>
        </header>

        {/* ── SURPRISE BOX SECTION ── */}
        <section className={styles.surpriseSection}>
          <AnimatePresence mode="wait">
            {!perksRevealed ? (
              /* CLOSED BOX STAGE */
              <motion.div 
                key="closed-box"
                className={styles.boxContainer}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                onClick={() => setPerksRevealed(true)}
              >
                <div className={styles.mysteryBoxGlow} />
                <div className={styles.mysteryBox}>
                  <div className={styles.boxLid} />
                  <div className={styles.boxBody}>
                    <div className={styles.boxStar}>✦</div>
                  </div>
                </div>
                <h3 className={styles.boxHeading}>What does the winner receive?</h3>
                <p className={styles.boxSubheading}>Click the vault above to reveal the Literacy Award Perks & Grants</p>
              </motion.div>
            ) : (
              /* REVEALED PERKS STAGE */
              <motion.div 
                key="revealed-perks"
                className={styles.perksContainer}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <div className={styles.perksHeaderBlock}>
                  <div className={styles.sparkleHeading}>
                    <Sparkles size={20} className={styles.goldText} />
                    <h2>Literary Icons Recognition Package</h2>
                    <Sparkles size={20} className={styles.goldText} />
                  </div>
                </div>
                
                <div className={styles.perksGrid}>

                  {/* 01 — Wooden Framed Certificate */}
                  <div className={`${styles.perkCard} ${styles.perkCard01}`}>
                    <span className={styles.perkAccentNum}>01</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h.01M12 8h.01M17 8h.01"/><path d="M7 11h10"/>
                        </svg>
                      </div>
                      <p className={styles.perkCardLabel}>Award 01</p>
                      <h4 className={styles.perkCardTitle}>Wooden Framed Certificate</h4>
                      <p className={styles.perkCardDesc}>A premium wooden-framed recognition certificate hand-delivered to your doorstep.</p>
                    </div>
                  </div>

                  {/* 02 — Appreciation Letter */}
                  <div className={`${styles.perkCard} ${styles.perkCard02}`}>
                    <span className={styles.perkAccentNum}>02</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <Mail size={26} />
                      </div>
                      <p className={styles.perkCardLabel}>Award 02</p>
                      <h4 className={styles.perkCardTitle}>Appreciation Letter</h4>
                      <p className={styles.perkCardDesc}>An official, signed appreciation letter from the Maybeify editorial review board.</p>
                    </div>
                  </div>

                  {/* 03 — Medal */}
                  <div className={`${styles.perkCard} ${styles.perkCard03}`}>
                    <span className={styles.perkAccentNum}>03</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <Award size={26} />
                      </div>
                      <p className={styles.perkCardLabel}>Award 03</p>
                      <h4 className={styles.perkCardTitle}>Medal</h4>
                      <p className={styles.perkCardDesc}>A bespoke literary icon medal recognising your outstanding contribution to literature.</p>
                    </div>
                  </div>

                  {/* 04 — Podcast Feature on Spotify */}
                  <div className={`${styles.perkCard} ${styles.perkCard04}`}>
                    <span className={styles.perkAccentNum}>04</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 0 1-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.722a.78.78 0 0 1-1.072.257C14.1 12.257 10.539 11.82 7.2 12.78a.78.78 0 0 1-.428-1.498c3.795-1.086 7.795-.558 10.782 1.348a.78.78 0 0 1 .255 1.072zm.105-2.835C14.692 9.178 9.375 9 6.297 9.86a.937.937 0 1 1-.543-1.793c3.541-.977 9.44-.787 13.167 1.43a.937.937 0 1 1-.978 1.614l-.029-.234z"/>
                        </svg>
                      </div>
                      <p className={styles.perkCardLabel}>Award 04</p>
                      <h4 className={styles.perkCardTitle}>Podcast Feature on Spotify</h4>
                      <div className={styles.perkBadgeRow}>
                        <span className={styles.platformBadge} style={{background:'rgba(30,215,96,0.12)', borderColor:'rgba(30,215,96,0.4)', color:'#1ED760'}}>
                          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 0 1-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.722a.78.78 0 0 1-1.072.257C14.1 12.257 10.539 11.82 7.2 12.78a.78.78 0 0 1-.428-1.498c3.795-1.086 7.795-.558 10.782 1.348a.78.78 0 0 1 .255 1.072zm.105-2.835C14.692 9.178 9.375 9 6.297 9.86a.937.937 0 1 1-.543-1.793c3.541-.977 9.44-.787 13.167 1.43a.937.937 0 1 1-.978 1.614l-.029-.234z"/></svg>
                          Spotify
                        </span>
                      </div>
                      <p className={styles.perkCardDesc}>Your author interview featured as a full podcast episode on our Spotify channel — reaching thousands of listeners.</p>
                    </div>
                  </div>

                  {/* 05 — Digital Magazine (hero card) */}
                  <div className={`${styles.perkCard} ${styles.perkCard05}`}>
                    <span className={styles.perkAccentNum}>05</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                      </div>
                      <p className={styles.perkCardLabel}>Award 05</p>
                      <h4 className={styles.perkCardTitle}>Feature in Digital Magazine</h4>
                      <div className={styles.platformLogoStrip}>
                        {/* Kindle */}
                        <div className={styles.platformLogo}>
                          <div className={styles.platformLogoIcon} style={{background:'rgba(255,153,0,0.12)', borderColor:'rgba(255,153,0,0.4)', color:'#FF9900'}}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6.8 14.25c0-1.03.297-1.92.892-2.67.595-.75 1.408-1.125 2.438-1.125.896 0 1.65.4 2.265 1.198V10.5h1.448v7.297h-1.448v-1.02c-.636.797-1.403 1.196-2.301 1.196-1.01 0-1.81-.38-2.402-1.138-.592-.757-.888-1.65-.892-2.585zm1.512.04c0 .66.177 1.21.528 1.647.352.438.8.656 1.345.656.52 0 .96-.21 1.317-.63.358-.42.537-.964.537-1.633 0-.67-.18-1.218-.538-1.645-.358-.427-.793-.64-1.303-.64-.53 0-.975.21-1.33.636-.355.426-.533.97-.556 1.61z"/></svg>
                          </div>
                          <span className={styles.platformLogoName} style={{color:'#FF9900'}}>Kindle</span>
                        </div>
                        {/* Google Play Books */}
                        <div className={styles.platformLogo}>
                          <div className={styles.platformLogoIcon} style={{background:'rgba(66,133,244,0.12)', borderColor:'rgba(66,133,244,0.4)', color:'#4285F4'}}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.954 11.616l2.957-2.957L6.36 3.291c-.633-.342-1.226-.39-1.746-.016l8.34 8.34zm3.461 3.462l3.074-1.729c.6-.336.929-.812.929-1.349 0-.537-.329-1.013-.929-1.349l-2.783-1.567-3.133 3.133 2.842 2.861zM4.1 4.002c-.064.197-.1.417-.1.658v14.705c0 .381.084.709.236.97l8.542-8.542L4.1 4.002zm8.854 9.962l-8.443 8.443c.499.344 1.083.284 1.713-.065l9.964-5.604-3.234-2.774z"/></svg>
                          </div>
                          <span className={styles.platformLogoName} style={{color:'#4285F4'}}>Play Books</span>
                        </div>
                        {/* Amazon */}
                        <div className={styles.platformLogo}>
                          <div className={styles.platformLogoIcon} style={{background:'rgba(255,153,0,0.12)', borderColor:'rgba(255,153,0,0.4)', color:'#FF9900'}}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.124.102.17.057.336-.14.496l-.195.125c-.045.026-.097.054-.162.084-.08.038-.161.075-.244.112-2.994 1.292-6.164 1.938-9.513 1.938C7.563 22.18 3.4 21.05-.044 18.796a.62.62 0 0 1-.128-.46l.217-.315z"/></svg>
                          </div>
                          <span className={styles.platformLogoName} style={{color:'#FF9900'}}>Amazon</span>
                        </div>
                      </div>
                      <p className={styles.perkCardDesc}>Your feature published in our Digital Magazine — available on Amazon Kindle, Google Play Books & Amazon Paperback globally.</p>
                    </div>
                  </div>

                  {/* 06 — Social Media Promotions */}
                  <div className={`${styles.perkCard} ${styles.perkCard06}`}>
                    <span className={styles.perkAccentNum}>06</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <Share2 size={26} />
                      </div>
                      <p className={styles.perkCardLabel}>Award 06</p>
                      <h4 className={styles.perkCardTitle}>Social Media Promotions</h4>
                      <div className={styles.perkBadgeRow}>
                        <span className={styles.platformBadge} style={{background:'rgba(225,48,108,0.12)', borderColor:'rgba(225,48,108,0.4)', color:'#E1306C'}}>
                          <InstagramIcon size={10}/> Instagram
                        </span>
                        <span className={styles.platformBadge} style={{background:'rgba(255,255,255,0.06)', borderColor:'rgba(255,255,255,0.2)', color:'#fff'}}>
                          𝕏 Twitter
                        </span>
                      </div>
                      <p className={styles.perkCardDesc}>Spotlight banners, stories & shoutouts across all our social media platforms.</p>
                    </div>
                  </div>

                  {/* 07 — Trailer of Top 30 */}
                  <div className={`${styles.perkCard} ${styles.perkCard07}`}>
                    <span className={styles.perkAccentNum}>07</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                      </div>
                      <p className={styles.perkCardLabel}>Award 07</p>
                      <h4 className={styles.perkCardTitle}>Trailer — Top 30 Authors</h4>
                      <p className={styles.perkCardDesc}>Cinematic trailer feature showcasing the top 30 authors & poets of the year.</p>
                    </div>
                  </div>

                  {/* 08 — Feature on Website */}
                  <div className={`${styles.perkCard} ${styles.perkCard08}`}>
                    <span className={styles.perkAccentNum}>08</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                      </div>
                      <p className={styles.perkCardLabel}>Award 08</p>
                      <h4 className={styles.perkCardTitle}>Feature on Website</h4>
                      <p className={styles.perkCardDesc}>Dedicated author profile & feature page on the official Maybeify website.</p>
                    </div>
                  </div>

                  {/* 09 — Author On Board Certificate */}
                  <div className={`${styles.perkCard} ${styles.perkCard09}`}>
                    <span className={styles.perkAccentNum}>09</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                      </div>
                      <p className={styles.perkCardLabel}>Award 09</p>
                      <h4 className={styles.perkCardTitle}>Author On Board Certificate</h4>
                      <p className={styles.perkCardDesc}>An exclusive digital & printed <em>"Author On Board"</em> certificate marking your official Maybeify induction — a credential to carry forever.</p>
                    </div>
                  </div>

                  {/* 10 — Interview in Digital Magazine */}
                  <div className={`${styles.perkCard} ${styles.perkCard10}`}>
                    <span className={styles.perkAccentNum}>10</span>
                    <div className={styles.perkCardInner}>
                      <div className={styles.perkIconWrap}>
                        <Mic size={26} />
                      </div>
                      <p className={styles.perkCardLabel}>Award 10</p>
                      <h4 className={styles.perkCardTitle}>Interview in Digital Magazine</h4>
                      <div className={styles.perkBadgeRow}>
                        <span className={styles.platformBadge} style={{background:'rgba(255,153,0,0.12)', borderColor:'rgba(255,153,0,0.4)', color:'#FF9900'}}>
                          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M6.8 14.25c0-1.03.297-1.92.892-2.67.595-.75 1.408-1.125 2.438-1.125.896 0 1.65.4 2.265 1.198V10.5h1.448v7.297h-1.448v-1.02c-.636.797-1.403 1.196-2.301 1.196-1.01 0-1.81-.38-2.402-1.138-.592-.757-.888-1.65-.892-2.585z"/></svg>
                          Amazon Kindle
                        </span>
                      </div>
                      <p className={styles.perkCardDesc}>Your author interview published in our Digital Magazine — available on Amazon Kindle for global readers worldwide.</p>
                    </div>
                  </div>

                </div>

                <div className={styles.revealedHint}>
                  <span className={styles.scrollIndicator}>Scroll down to register details and submit your work</span>
                  <ChevronDown className={styles.bounceChevron} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── HOW IT WORKS SECTION ── */}
        <section className={styles.howItWorksSection}>
          <div className={styles.howItWorksHeader}>
            <span className={styles.eyebrow}>Literary Icons 2026</span>
            <h2 className={styles.howItWorksTitle}>How It <em>Works</em></h2>
          </div>
          <div className={styles.howItWorksGrid}>
            <div className={styles.howStep}>
              <span className={styles.howNum}>01</span>
              <h4>Submit Your Nomination</h4>
              <p>Authors can nominate themselves by submitting their details, book information, and achievements through the nomination form.</p>
            </div>
            <div className={styles.howStep}>
              <span className={styles.howNum}>02</span>
              <h4>Evaluation & Review</h4>
              <p>All nominations are reviewed based on predefined evaluation criteria, including literary merit, creativity, impact, and contribution to the writing community.</p>
            </div>
            <div className={styles.howStep}>
              <span className={styles.howNum}>03</span>
              <h4>Finalist Selection</h4>
              <p>Selected authors will be notified via email and invited to the next stage of the recognition program.</p>
            </div>
            <div className={styles.howStep}>
              <span className={styles.howNum}>04</span>
              <h4>Recognition Packages</h4>
              <p>Finalists may choose from optional recognition packages that include certificates, trophies, media features, interviews, promotional opportunities, and other benefits.</p>
            </div>
          </div>
        </section>

        {/* ── REGISTRATION FORM SECTION ── */}
        <section className={styles.formSection}>
          <AnimatePresence mode="wait">
            {status !== 'success' ? (
              <motion.div 
                key="nominate-form"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={styles.formCard}
              >
                <div className={styles.formHeader}>
                  <h2>Awards Entry Form</h2>
                  <p>Submit your details to register your manuscript with the 2026 acquisitions board.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Author Full Name</label>
                      <div className={styles.inputWrapper}>
                        <User size={16} className={styles.inputIcon} />
                        <input 
                          type="text" 
                          required 
                          placeholder="Your name" 
                          value={form.name} 
                          onChange={e => setForm({...form, name: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label>Email ID</label>
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

                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Book Name / Manuscript Title</label>
                      <div className={styles.inputWrapper}>
                        <BookOpen size={16} className={styles.inputIcon} />
                        <input 
                          type="text" 
                          required 
                          placeholder="Working title" 
                          value={form.title} 
                          onChange={e => setForm({...form, title: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label>Year of Publishing</label>
                      <div className={styles.inputWrapper}>
                        <Calendar size={16} className={styles.inputIcon} />
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. 2026 or In-Development" 
                          value={form.yearOfPublishing} 
                          onChange={e => setForm({...form, yearOfPublishing: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Instagram ID</label>
                      <div className={styles.inputWrapper}>
                        <InstagramIcon size={16} className={styles.inputIcon} />
                        <input 
                          type="text" 
                          placeholder="e.g. @yourhandle (optional)" 
                          value={form.instagram} 
                          onChange={e => setForm({...form, instagram: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label>WhatsApp Number</label>
                      <div className={styles.inputWrapper}>
                        <MessageCircle size={16} className={styles.inputIcon} />
                        <input 
                          type="text" 
                          required 
                          placeholder="WhatsApp number" 
                          value={form.whatsapp} 
                          onChange={e => setForm({...form, whatsapp: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Calling Number</label>
                      <div className={styles.inputWrapper}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input 
                          type="text" 
                          required 
                          placeholder="Calling phone number" 
                          value={form.phone} 
                          onChange={e => setForm({...form, phone: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label>Select Genre</label>
                      <div className={styles.inputWrapper}>
                        <PenTool size={16} className={styles.inputIcon} />
                        <input 
                          type="text" 
                          required 
                          placeholder="Literary Fiction, Poetry, Memoir, etc." 
                          value={form.genre} 
                          onChange={e => setForm({...form, genre: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Book Synopsis</label>
                    <textarea 
                      required 
                      placeholder="Outline the core story, premise, and characters..." 
                      value={form.synopsis} 
                      onChange={e => setForm({...form, synopsis: e.target.value})} 
                      rows={4} 
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Why should this work win the 2026 Literacy Award?</label>
                    <textarea 
                      required 
                      placeholder="Explain the unique themes, impact, and legacy value of this manuscript..." 
                      value={form.reason} 
                      onChange={e => setForm({...form, reason: e.target.value})} 
                      rows={4} 
                    />
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                    {status === 'loading' ? (
                      <><span className={styles.btnSpinner}></span> Validating Entry...</>
                    ) : (
                      <>Register Nomination 🏆</>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.successCard}
              >
                <div className={styles.successIconWrapper}>
                  <CheckCircle2 size={64} className={styles.successIcon} />
                </div>
                <h2>Nomination Registered</h2>
                <p className={styles.successText}>
                  Thank you! <strong>"{form.title}"</strong> is officially registered and locked in for the 2026 Maybeify Literacy Legacy Awards.
                </p>
                <p className={styles.successSub}>
                  Our awards board will evaluate your entry and send updates to <strong>{form.email}</strong>. Finalists will be selected in late-2026.
                </p>
                <button className={styles.resetBtn} onClick={handleReset}>
                  Submit Another Entry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

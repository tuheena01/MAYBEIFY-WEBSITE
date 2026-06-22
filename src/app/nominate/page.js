'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, Sparkles, BookOpen, User, Mail, Calendar, PenTool, CheckCircle2, ChevronDown, Image, Newspaper, Mic, MessageSquare, Share2, Gift, MessageCircle, Phone } from 'lucide-react';
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
                  <div className={styles.perkCard}>
                    <span className={styles.perkNum}>01</span>
                    <div className={styles.perkIconContainer}>
                      <Image size={28} />
                    </div>
                    <h4>Wooden Framed Certificate</h4>
                    <p>One large, premium wooden framed recognition certificate delivered to your address.</p>
                  </div>

                  <div className={styles.perkCard}>
                    <span className={styles.perkNum}>02</span>
                    <div className={styles.perkIconContainer}>
                      <Trophy size={28} />
                    </div>
                    <h4>Book-Shaped Trophy</h4>
                    <p>One bespoke, custom-crafted trophy shaped like a classic hardcover book.</p>
                  </div>

                  <div className={styles.perkCard}>
                    <span className={styles.perkNum}>03</span>
                    <div className={styles.perkIconContainer}>
                      <Mail size={28} />
                    </div>
                    <h4>Appreciation Letter</h4>
                    <p>An official commendation letter from the Maybeify editorial review board.</p>
                  </div>

                  <div className={styles.perkCard}>
                    <span className={styles.perkNum}>04</span>
                    <div className={styles.perkIconContainer}>
                      <Newspaper size={28} />
                    </div>
                    <h4>Digital Magazine Feature</h4>
                    <p>A full profile and press release feature in our quarterly literary magazine.</p>
                  </div>

                  <div className={styles.perkCard}>
                    <span className={styles.perkNum}>05</span>
                    <div className={styles.perkIconContainer}>
                      <Mic size={28} />
                    </div>
                    <h4>Free Podcast Release</h4>
                    <p>One free podcast episode distributed across Spotify, JioSaavn, Apple Music, and Amazon.</p>
                  </div>

                  <div className={styles.perkCard}>
                    <span className={styles.perkNum}>06</span>
                    <div className={styles.perkIconContainer}>
                      <MessageSquare size={28} />
                    </div>
                    <h4>Interview Opportunity</h4>
                    <p>An exclusive featured author Q&A session published on our official portal.</p>
                  </div>

                  <div className={styles.perkCard}>
                    <span className={styles.perkNum}>07</span>
                    <div className={styles.perkIconContainer}>
                      <Share2 size={28} />
                    </div>
                    <h4>Social Media Promotions</h4>
                    <p>Dedicated spotlight banners and shoutouts across all our social platforms.</p>
                  </div>

                  <div className={styles.perkCard}>
                    <span className={styles.perkNum}>08</span>
                    <div className={styles.perkIconContainer}>
                      <Gift size={28} />
                    </div>
                    <h4>Personalised Gift</h4>
                    <p>A surprise, hand-curated personalized creator gift from the Maybeify team (worth ₹500).</p>
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

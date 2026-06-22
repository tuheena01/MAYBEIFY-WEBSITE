'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ShieldCheck, BookOpen, Award, Gift } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import styles from './page.module.css';

// ── CUSTOM COMPONENTS ──

const Counter = ({ value, label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Parse prefix, number, and suffix
  // Example: "EST. 2022" -> prefix: "EST. ", num: 2022, suffix: ""
  // Example: "250+" -> prefix: "", num: 250, suffix: "+"
  // Example: "21-Day" -> prefix: "", num: 21, suffix: "-Day"
  const match = value.match(/^(.*?)(\d+)(.*)$/);
  const prefix = match ? match[1] : '';
  const target = match ? parseInt(match[2]) : 0;
  const suffix = match ? match[3] : '';

  useEffect(() => {
    if (isInView) {
      let startTime = null;
      const duration = 2000; // 2 seconds spin

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for a 'mechanical' settle
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        
        setCount(Math.floor(easeOutExpo * target));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, target]);

  return (
    <div ref={ref} className={styles.metricItem}>
      <span className={styles.metricValue}>
        {prefix}{count}{suffix}
      </span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  );
};

const WordReveal = ({ text, className }) => {
  const words = text.split(' ');
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.h1
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <span key={index} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <motion.span variants={child} style={{ display: 'inline-block', marginRight: '0.25em' }}>
            {word === 'Remembered' || word === 'Legacy' || word === 'Extraordinary.' ? (
              <em className={styles.italic}>{word}</em>
            ) : word}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
};

export default function Home() {
  const { setSubmitModalOpen } = useModal();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const books = [
    { id: 1, title: 'Embers of Musings', author: 'Aranyaa Pattnaik', genre: 'Poetry & Musings', image: '/embers_of_musings.png' },
    { id: 2, title: 'Art of Mind', author: 'Deborah M Tungnung', genre: 'Self-Help / Mindset', image: '/art_of_mind.png' },
    { id: 3, title: 'The Fantastic Land of Never-Ending Stories', author: 'Roxana Negut', genre: 'Fantasy & Fairytale', image: '/fantastic_land.png' },
  ];

  return (
    <div className={styles.page}>
      
      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.floatingGrid} />
        <div 
          className={styles.cursorLight} 
          style={{ left: mousePos.x, top: mousePos.y }} 
        />
        
        <div className={styles.heroContent}>
          <motion.span 
            className={styles.eyebrow}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            Est. 2022 · Bhubaneswar, Orissa · Elite Publishing
          </motion.span>

          <WordReveal 
            text="For Writers Destined To Be Remembered" 
            className={styles.heroTitle} 
          />

          <motion.div 
            className={styles.heroLine}
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ delay: 1.2, duration: 1 }}
          />

          <motion.p 
            className={styles.heroDesc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            We don't just publish books. We archive human potential. 
            Join the elite 1% of authors whose voices outlive time.
          </motion.p>

          <motion.div 
            className={styles.heroActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
          >
            <button className={styles.btnPrimary} onClick={() => setSubmitModalOpen(true)}>
              Begin Your Legacy
            </button>
            <Link href="/challenge" className={styles.btnGhost}>
              Enter The House →
            </Link>
          </motion.div>
        </div>

        <motion.div 
          className={styles.heroMetrics}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className={styles.metricsGrid}>
            <Counter value="EST. 2022" label="Independent Publishing House" />
            <Counter value="250+" label="Voices Published" />
            <Counter value="50+" label="Awarded & Featured Titles" />
            <Counter value="21-Day" label="Author Transformation Program" />
          </div>
        </motion.div>
      </section>



      {/* ══════ 3D SHOWCASE ══════ */}
      <section className={styles.showcaseSection}>
        <div className="container">
          <div className={styles.showcaseGrid}>
            {books.map((book, idx) => (
              <motion.div 
                key={book.id} 
                className={styles.book3D}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={styles.bookFrame} style={{ backgroundImage: `url(${book.image})` }}>
                  {/* Decorative foil element */}
                </div>
                <h3 style={{ marginTop: '2rem', fontSize: '1.2rem' }}>{book.title}</h3>
                <p style={{ color: 'var(--text3)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                  {book.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ THE PROCESS ══════ */}
      <section className={styles.processSection}>
        <div className="container">
          <h2 className={styles.processTitle}>The <em>Archive</em> Process</h2>
          <div className={styles.processGrid}>
            {[
              { id: '01', label: 'Manuscript Review', desc: 'A rigorous evaluation of voice, structure, and legacy potential.' },
              { id: '02', label: 'Editorial Crafting', desc: 'Deep-dive development with our award-winning editorial board.' },
              { id: '03', label: 'Design & Publishing', desc: 'Bespoke aesthetic direction and precision production.' },
              { id: '04', label: 'Global Distribution', desc: 'Strategic placement in premium markets and award circles.' }
            ].map((step, idx) => (
              <motion.div 
                key={idx} 
                className={styles.processStep}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <span className={styles.stepNum}>{step.id}</span>
                <span className={styles.stepLabel}>{step.label}</span>
                <p className={styles.stepDesc}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ THE CUSTODIANS ══════ */}
      <section className={styles.custodiansSection}>
        <div className="container">
          <motion.div 
            className={styles.custodiansHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={styles.eyebrow}>Archive Leadership</span>
            <h2 className={styles.processTitle}>The <em>Custodians</em> of Legacy</h2>
          </motion.div>

          <div className={styles.custodiansGrid}>
            <motion.div 
              className={styles.custodianCard}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.custodianIcon}>
                <ShieldCheck size={32} />
              </div>
              <div className={styles.custodianContent}>
                <h3>Project Head</h3>
                <p>Leads and manages the end-to-end publishing process, ensuring smooth coordination between authors, editors, designers, and marketing teams while maintaining quality and timely delivery.</p>
                <div className={styles.signatureLine}>Lead Strategist · Archive Management</div>
              </div>
            </motion.div>

            <motion.div 
              className={styles.custodianCard}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.custodianIcon}>
                <BookOpen size={32} />
              </div>
              <div className={styles.custodianContent}>
                <h3>Compiler</h3>
                <p>Responsible for organizing, structuring, and preparing manuscripts and content submissions into a polished, publication-ready format while ensuring consistency and accuracy.</p>
                <div className={styles.signatureLine}>Editorial Architect · Content Structuring</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ AWARDS & WRITERS VAULT SECTIONS ══════ */}
      <section className={styles.interactiveVaultSection}>
        <div className="container">
          <div className={styles.vaultGrid}>
            {/* CARD 1: AWARDS */}
            <motion.div 
              className={styles.vaultCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.vaultCardGlow}></div>
              <div className={styles.vaultIconContainer}>
                <Award size={36} className={styles.vaultIcon} strokeWidth={1.2} />
              </div>
              <span className={styles.eyebrow}>Now Accepting Entries</span>
              <h3>Literary Icons <br /><em>2026</em></h3>
              <p>
                Nominate your book or manuscript for the Literary Icons 2026 recognition program. Selected authors receive a custom book-shaped trophy, wooden framed certificate, appreciation letter, digital magazine feature, podcast release, author interview, and social media promotions.
              </p>
              <Link href="/nominate" className={styles.vaultBtnPrimary}>
                Nominate Now 🏆
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ FEATURED AUTHORS ══════ */}
      <section className={styles.authorsSection}>
        <div className="container">
          <motion.div 
            className={styles.authorCard}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800" 
              alt="Author" 
              className={styles.authorImg} 
            />
            <div>
              <p className={styles.quote}>
                "Published in 21 days. Sold in 12 countries. Maybeify didn't just give me a platform; they gave me a legacy."
              </p>
              <span className={styles.authorName}>Elena Vance · Award-Winning Novelist</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className={styles.ctaSection}>
        <div className="container">
          <motion.h2 
            className={styles.ctaTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            The World Needs<br />
            <em className={styles.italic}>Your Legacy.</em>
          </motion.h2>
          <motion.button 
            className={styles.btnPrimary}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSubmitModalOpen(true)}
          >
            Submit Your Manuscript
          </motion.button>
        </div>
      </section>

    </div>
  );
}

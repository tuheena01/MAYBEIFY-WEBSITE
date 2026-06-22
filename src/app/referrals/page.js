'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Share2, TrendingUp, Award, ArrowRight, Quote, BookOpen, Star, Globe, Users, ShieldCheck, Mail } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import styles from './referrals.module.css';

export default function ReferralsPage() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleInvite = (e) => {
    e.preventDefault();
    if (inviteEmail) {
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000);
      setInviteEmail('');
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.eyebrow}
        >
          <ShieldCheck size={16} /> Elite Invitation Program
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Gift the Gift of <em>Legacy.</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Invite a fellow visionary to the Maybeify Archive. True influence is shared among the elite.
        </motion.p>
      </header>

      <section className={styles.inviteSection}>
        <div className={styles.card}>
          <h2>Send an Exclusive Invite</h2>
          <p>Each invitation you send is a key to the Archive. Only those with a verified referral can bypass the standard vetting process.</p>
          <form className={styles.inviteForm} onSubmit={handleInvite}>
            <input 
              type="email" 
              placeholder="colleague@visionary.com" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={isSent}>
              {isSent ? 'Invitation Dispatched' : 'Dispatch Invite'}
            </button>
          </form>
        </div>
      </section>

      <div className={styles.grid}>
        <div className={styles.statCard}>
          <Users size={24} className={styles.icon} />
          <div className={styles.statInfo}>
            <h3>Total Invites</h3>
            <p>0</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Globe size={24} className={styles.icon} />
          <div className={styles.statInfo}>
            <h3>Global Reach</h3>
            <p>0 Countries</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Award size={24} className={styles.icon} />
          <div className={styles.statInfo}>
            <h3>Archive Status</h3>
            <p>Initiate</p>
          </div>
        </div>
      </div>

      <section className={styles.mapSection}>
        <div className={styles.mapContainer}>
          <div className={styles.mapOverlay}>
            <h2>Global Impact Map</h2>
            <p>Visualizing your legacy as it spreads across the continents.</p>
          </div>
          <div className={styles.placeholderMap}>
            <div className={styles.mapPulse} style={{ top: '40%', left: '20%' }}></div>
            <div className={styles.mapPulse} style={{ top: '30%', left: '70%' }}></div>
            <div className={styles.mapPulse} style={{ top: '60%', left: '50%' }}></div>
          </div>
        </div>
      </section>

      <section style={{ padding: '8rem 2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="fade-up">
          <h2 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '2.5rem', fontFamily: 'var(--font-serif)' }}>
            Become a <em style={{ fontStyle: 'italic', fontWeight: '400' }}>Literary Scout.</em>
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 4rem', fontSize: '1.2rem', color: '#888', lineHeight: 1.7 }}>
            Identify exceptional talent and receive exclusive rewards for building the Archive.
          </p>
          <Link href="/author/signup?type=ambassador" className={styles.ctaBtn}>
            Join the Program
          </Link>
        </div>
      </section>
    </main>
  );
}

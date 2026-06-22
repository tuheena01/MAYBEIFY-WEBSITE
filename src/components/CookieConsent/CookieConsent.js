'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import styles from './CookieConsent.module.css';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('maybeify_cookie_consent');
    if (!consent) {
      // Delay showing the banner slightly for a premium feel
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('maybeify_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('maybeify_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={styles.banner}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.grain}></div>
          <div className={styles.content}>
            <div className={styles.iconContainer}>
              <Shield size={18} className={styles.icon} />
            </div>
            <div className={styles.textContainer}>
              <h4>Cookie Preference</h4>
              <p>
                We use cookies to optimize your manuscript submission experience and analyze site traffic. By clicking "Accept All", you agree to our storage of cookies on your device.
              </p>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.declineBtn} onClick={handleDecline}>
              Decline
            </button>
            <button className={styles.acceptBtn} onClick={handleAccept}>
              Accept All
            </button>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsVisible(false)} title="Close">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

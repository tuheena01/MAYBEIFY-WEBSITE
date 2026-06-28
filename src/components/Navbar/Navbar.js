'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

const PAGES = [
  { path: '/',                    label: 'Home' },
  { path: '/challenge',           label: '21-Day Challenge' },
  { path: '/author/login',        label: 'Author Portal' },
  { path: '/author/dashboard',    label: 'Author Dashboard' },
  { path: '/feedback',            label: 'Submit Feedback' },
];

export default function Navbar() {
  const { setSubmitModalOpen } = useModal();
  const [scrolled, setScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const audioRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('maybeify_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('maybeify_theme', nextTheme);
  };

  const toggleSound = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play blocked by browser"));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const currentIndex = PAGES.findIndex(p => p.path === pathname);
  const prev = currentIndex > 0 ? PAGES[currentIndex - 1] : null;
  const next = currentIndex < PAGES.length - 1 ? PAGES[currentIndex + 1] : null;

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <audio ref={audioRef} loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
      </audio>
      <div className={styles.inner}>
        
        {/* Minimal Navigation Arrows */}
        <div className={styles.navArrows}>
          {prev && (
            <Link href={prev.path} className={styles.navArrow} title={`Previous: ${prev.label}`}>
              <ChevronLeft size={18} />
            </Link>
          )}
        </div>

        <div className={styles.left}>
          <button className={styles.soundToggle} onClick={toggleSound} title={isMuted ? "Play Library Ambience" : "Mute"}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button className={styles.themeToggle} onClick={toggleTheme} title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link href="/challenge" className={styles.challengeLink}>
            ✦ 21-Day Challenge
          </Link>
          <Link href="/referrals" className={styles.link}>Referral Program</Link>
        </div>

        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>MAYBEIFY</span>
          <span className={styles.logoSub}>Publishing House</span>
        </Link>

        <div className={styles.right}>
          <Link href="/nominate" className={styles.link}>Nominate 🏆</Link>
          <Link href="/author/login" className={styles.link}>Author Portal</Link>
          <button className={styles.authorBtn} onClick={() => setSubmitModalOpen(true)}>
            Become an Author
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button className={styles.mobileMenuToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className={styles.mobileDrawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className={styles.drawerLinks}>
                <Link href="/" className={styles.drawerLink} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/challenge" className={styles.drawerLink} onClick={() => setMobileMenuOpen(false)}>✦ 21-Day Challenge</Link>
                <Link href="/referrals" className={styles.drawerLink} onClick={() => setMobileMenuOpen(false)}>Referral Program</Link>
                <Link href="/nominate" className={styles.drawerLink} onClick={() => setMobileMenuOpen(false)}>Nominate 🏆</Link>
                <Link href="/author/login" className={styles.drawerLink} onClick={() => setMobileMenuOpen(false)}>Author Portal</Link>
                <button 
                  className={styles.drawerBtn} 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSubmitModalOpen(true);
                  }}
                >
                  Become an Author
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.navArrowsRight}>
          {next && (
            <Link href={next.path} className={styles.navArrow} title={`Next: ${next.label}`}>
              <ChevronRight size={18} />
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}


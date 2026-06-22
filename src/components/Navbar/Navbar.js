'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
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
  const audioRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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


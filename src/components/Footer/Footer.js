'use client';

import Link from 'next/link';
import { useModal } from '@/context/ModalContext';

import styles from './Footer.module.css';

export default function Footer() {
  const { setSubmitModalOpen } = useModal();

  return (
    <footer className={styles.footer}>
      {/* ── Page navigation (prev / next) ── */}


      {/* ── Footer body ── */}
      <div className={styles.body}>
        <div className={styles.brand}>
          <span className={styles.brandName}>MAYBEIFY</span>
          <span className={styles.brandSub}>Publishing House</span>
          <p className={styles.brandDesc}>
            An elite literary publishing house dedicated to discovering
            and championing extraordinary voices.
          </p>
        </div>

        <div className={styles.col}>
          <span className={styles.colHead}>Navigate</span>
          <Link href="/" className={styles.colLink}>Home</Link>
          <Link href="/challenge" className={styles.colLink}>21-Day Challenge</Link>
          <Link href="/referrals" className={styles.colLink}>Referral Program</Link>
          <Link href="/author/login" className={styles.colLink}>Author Portal</Link>
          <Link href="/feedback" className={styles.colLink}>Feedback</Link>
        </div>

        <div className={styles.col}>
          <span className={styles.colHead}>Authors</span>
          <button className={styles.colBtn} onClick={() => setSubmitModalOpen(true)}>Become an Author</button>
          <Link href="/author/dashboard" className={styles.colLink}>Author Dashboard</Link>
          <Link href="/author/royalties" className={styles.colLink}>Royalties</Link>
          <Link href="/author/communications" className={styles.colLink}>Communications</Link>
        </div>

        <div className={styles.col}>
          <span className={styles.colHead}>Contact</span>
          <span className={styles.colText}>Bhubaneswar, Orissa</span>
          <span className={styles.colText}>Est. 2022</span>
          <a href="mailto:submissions@maybeify.com" className={styles.colLink}>
            submissions@maybeify.com
          </a>
        </div>
      </div>

      {/* ── Footer base ── */}
      <div className={styles.base}>
        <span className={styles.copy}>
          © 2022–{new Date().getFullYear()} Maybeify Publishing House. All rights reserved.
        </span>
        <span className={styles.copy}>
          Bhubaneswar, Orissa, India
        </span>
      </div>
    </footer>
  );
}

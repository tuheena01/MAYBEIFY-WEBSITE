'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './PageNav.module.css';

const PAGES = [
  { path: '/',                    label: 'Home',              short: '01' },
  { path: '/challenge',           label: '21-Day Challenge',  short: '02' },
  { path: '/author/login',        label: 'Author Portal',     short: '03' },
  { path: '/author/dashboard',    label: 'Author Dashboard',  short: '04' },
  { path: '/feedback',            label: 'Submit Feedback',   short: '05' },
];

export default function PageNav() {
  const pathname = usePathname();

  // find current index (exact or closest prefix match)
  const currentIndex = PAGES.findIndex(p => p.path === pathname);
  if (currentIndex === -1) return null;   // hide on pages not in the list

  const prev = currentIndex > 0 ? PAGES[currentIndex - 1] : null;
  const next = currentIndex < PAGES.length - 1 ? PAGES[currentIndex + 1] : null;

  return (
    <nav className={styles.pageNav}>
      {/* ── left: prev ── */}
      <div className={styles.side}>
        {prev ? (
          <Link href={prev.path} className={styles.navLink}>
            <span className={styles.arrow}>←</span>
            <span className={styles.navMeta}>
              <span className={styles.navNum}>{prev.short}</span>
              <span className={styles.navLabel}>{prev.label}</span>
            </span>
          </Link>
        ) : <div />}
      </div>

      {/* ── center: page dots ── */}
      <div className={styles.dots}>
        {PAGES.map((p, i) => (
          <Link
            key={p.path}
            href={p.path}
            className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`}
            title={p.label}
          />
        ))}
      </div>

      {/* ── right: next ── */}
      <div className={`${styles.side} ${styles.sideRight}`}>
        {next ? (
          <Link href={next.path} className={`${styles.navLink} ${styles.navLinkRight}`}>
            <span className={styles.navMeta}>
              <span className={styles.navNum}>{next.short}</span>
              <span className={styles.navLabel}>{next.label}</span>
            </span>
            <span className={styles.arrow}>→</span>
          </Link>
        ) : <div />}
      </div>
    </nav>
  );
}

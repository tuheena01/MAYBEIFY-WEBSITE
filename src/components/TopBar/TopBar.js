'use client';

import Link from 'next/link';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className={styles.container}>
        <div className={styles.left}>
          <span className={styles.tag}>Latest</span>
          <Link href="/referrals" className={styles.referralLink}>Referrals</Link>
          <span className={styles.divider}>|</span>
          <Link href="/team/join" className={styles.mgmtLink}>Join Our Team</Link>
          <span className={styles.divider}>|</span>
          <p className={styles.message}>The "Archive" Collection — Now Available.</p>
        </div>
        <Link href="/shop" className={styles.shopLink}>
          Explore Shop <span>→</span>
        </Link>
      </div>
    </div>
  );
}

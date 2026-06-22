'use client';
import { useEffect, useState } from 'react';
import styles from './Loader.module.css';

export default function Loader() {
  const [phase, setPhase] = useState('in');
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 2200);
    const t2 = setTimeout(() => setPhase('gone'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (phase === 'gone') return null;
  return (
    <div className={`${styles.loader} ${phase === 'out' ? styles.out : ''}`}>
      <div className={styles.inner}>
        <div className={styles.logoMark}>✦</div>
        <div className={styles.logoText}>MAYBEIFY</div>
        <div className={styles.logoSub}>Publishing House</div>
        <div className={styles.bar}><div className={styles.barFill}></div></div>
      </div>
    </div>
  );
}

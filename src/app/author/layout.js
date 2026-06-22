'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './authorLayout.module.css';
import { LayoutDashboard, MessageSquare, DollarSign, Users, LogOut, ShieldAlert, BookOpen } from 'lucide-react';

export default function AuthorLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/author/login' || pathname === '/author/signup';

  return (
    <div className={styles.portalContainer}>
      {!isAuthPage && (
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Author Portal</h3>
          </div>
          <nav className={styles.sidebarNav}>
            <Link href="/author/dashboard" className={`${styles.navLink} ${pathname === '/author/dashboard' ? styles.active : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <Link href="/author/communications" className={`${styles.navLink} ${pathname === '/author/communications' ? styles.active : ''}`}>
              <MessageSquare size={20} /> Communications
            </Link>
            <Link href="/author/royalties" className={`${styles.navLink} ${pathname === '/author/royalties' ? styles.active : ''}`}>
              <DollarSign size={20} /> Royalties
            </Link>
            <Link href="/author/referrals" className={`${styles.navLink} ${pathname === '/author/referrals' ? styles.active : ''}`}>
              <Users size={20} /> Referrals
            </Link>

            <div className={styles.navDivider}>Management</div>
            
            <Link href="/author/project-head" className={`${styles.navLink} ${pathname === '/author/project-head' ? styles.active : ''}`}>
              <ShieldAlert size={20} /> Project Head
            </Link>
            <Link href="/author/compiler" className={`${styles.navLink} ${pathname === '/author/compiler' ? styles.active : ''}`}>
              <BookOpen size={20} /> Compiler Portal
            </Link>
          </nav>
          <div className={styles.sidebarFooter}>
            <button className={styles.logoutBtn} onClick={() => {
              document.cookie = 'token=; Max-Age=0; path=/';
              window.location.href = '/author/login';
            }}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>
      )}
      <main className={isAuthPage ? styles.mainFull : styles.mainContent}>
        {children}
      </main>
    </div>
  );
}


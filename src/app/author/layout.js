'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './authorLayout.module.css';
import { LayoutDashboard, MessageSquare, Users, LogOut, TrendingUp, User, BookOpen, BarChart3, Wallet } from 'lucide-react';

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
            <Link href="/author/profile" className={`${styles.navLink} ${pathname === '/author/profile' ? styles.active : ''}`}>
              <User size={20} /> My Profile
            </Link>
            <Link href="/author/books" className={`${styles.navLink} ${pathname.startsWith('/author/books') ? styles.active : ''}`}>
              <BookOpen size={20} /> My Books
            </Link>
            <Link href="/author/sales" className={`${styles.navLink} ${pathname === '/author/sales' ? styles.active : ''}`}>
              <TrendingUp size={20} /> Book Sales
            </Link>
            <Link href="/author/earnings" className={`${styles.navLink} ${pathname === '/author/earnings' ? styles.active : ''}`}>
              <Wallet size={20} /> Earnings
            </Link>
            <Link href="/author/analytics" className={`${styles.navLink} ${pathname === '/author/analytics' ? styles.active : ''}`}>
              <BarChart3 size={20} /> Analytics
            </Link>
            <Link href="/author/communications" className={`${styles.navLink} ${pathname === '/author/communications' ? styles.active : ''}`}>
              <MessageSquare size={20} /> Communications
            </Link>
            <Link href="/author/referrals" className={`${styles.navLink} ${pathname === '/author/referrals' ? styles.active : ''}`}>
              <Users size={20} /> Referrals
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

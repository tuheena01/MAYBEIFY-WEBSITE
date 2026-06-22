'use client';

import { useState, useEffect } from 'react';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const [apps, setApps] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/applications').then(res => res.json()),
      fetch('/api/admin/pending-users').then(res => res.json())
    ]).then(([appsData, usersData]) => {
      setApps(appsData);
      setPendingUsers(usersData);
      setLoading(false);
    });
  }, []);

  const handleApproveApp = async (app) => {
    if (!confirm(`Approve ${app.name} as an author?`)) return;

    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Author account created!\nEmail: ${app.email}\nPassword: ${result.password}\n\nPlease share these credentials with the author.`);
        setApps(apps.filter(a => a.id !== app.id));
      } else {
        alert('Approval failed.');
      }
    } catch (err) {
      alert('Error approving application.');
    }
  };

  const handleActivateUser = async (user) => {
    if (!confirm(`Activate account for ${user.name}?`)) return;

    try {
      const res = await fetch('/api/admin/activate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        alert(`${user.name}'s account is now live.`);
        setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
      } else {
        alert('Activation failed.');
      }
    } catch (err) {
      alert('Error activating user.');
    }
  };

  if (loading) return <div className={styles.container}>Loading board...</div>;

  return (
    <div className={styles.container}>
      <h1 className="serif">Acquisitions Board</h1>
      
      {/* ── MANUSCRIPT APPLICATIONS ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Manuscript Submissions</h2>
        <div className={styles.grid}>
          {apps.length === 0 && <p className={styles.empty}>No pending manuscripts.</p>}
          {apps.map(app => (
            <div key={app.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={styles.date}>{new Date(app.createdAt).toLocaleDateString()}</span>
                  {app.discount && (
                    <span className={styles.discountBadge}>{app.discount}</span>
                  )}
                </div>
                <h3>{app.title}</h3>
                <span className={styles.genre}>{app.genre}</span>
              </div>
              <div className={styles.authorInfo}>
                <strong>{app.name}</strong> · <span>{app.email}</span>
              </div>
              <p className={styles.synopsis}>{app.synopsis}</p>
              <div className={styles.actions}>
                <button className={styles.approveBtn} onClick={() => handleApproveApp(app)}>Approve & Create Account</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PENDING ACCOUNTS ── */}
      <section className={styles.section} style={{ marginTop: '4rem' }}>
        <h2 className={styles.sectionTitle}>Account Requests</h2>
        <div className={styles.grid}>
          {pendingUsers.length === 0 && <p className={styles.empty}>No pending account requests.</p>}
          {pendingUsers.map(user => (
            <div key={user.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.date}>{new Date(user.createdAt).toLocaleDateString()}</span>
                <h3>{user.name}</h3>
              </div>
              <div className={styles.authorInfo}>
                <span>{user.email}</span>
              </div>
              <div className={styles.actions}>
                <button className={styles.approveBtn} onClick={() => handleActivateUser(user)}>Activate Account</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

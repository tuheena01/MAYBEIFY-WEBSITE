'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import Link from 'next/link';

export default function AuthorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/author/dashboard')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load dashboard metrics');
        }
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  const { author, stats, activities } = data;

  // Pending Actions Logic based on profile completion
  const pendingActions = [];
  if (author.completionPercent < 100) {
    pendingActions.push({ id: 1, text: 'Complete author profile details', link: '/author/profile' });
  }
  if (stats.manuscriptsCount === 0) {
    pendingActions.push({ id: 2, text: 'Upload your first manuscript draft', link: '/author/communications' });
  }
  pendingActions.push({ id: 3, text: 'Approve book format proofing', link: '/author/communications' });
  pendingActions.push({ id: 4, text: 'Submit author bio & photo for catalog', link: '/author/profile' });

  // Upcoming deadlines mock list
  const deadlines = [
    { id: 1, date: 'Aug 30, 2026', task: 'Formatting approval deadline' },
    { id: 2, date: 'Sep 15, 2026', task: 'Catalog bio submission' }
  ];

  // Latest announcements mock list
  const announcements = [
    { id: 1, date: 'Today', text: 'Maybeify has launched direct Kindle eBook sales integration.' },
    { id: 2, date: 'Yesterday', text: 'Annual Maybeify Writer Awards nomination is open. Go to Acquisitions Board to nominate!' }
  ];

  return (
    <div className="animate-in">
      {/* Welcome & Status Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0 }}>
            Welcome back, {author.name}! 👋
          </h1>
          <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Your next milestone is just one step away.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ 
            padding: '0.4rem 1rem', 
            borderRadius: '20px', 
            fontSize: '0.85rem', 
            fontWeight: 'bold',
            background: author.status === 'PUBLISHED' ? 'rgba(0, 230, 118, 0.15)' : 
                        author.status === 'UNDER_REVIEW' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
            color: author.status === 'PUBLISHED' ? 'var(--success)' : 
                   author.status === 'UNDER_REVIEW' ? 'var(--accent)' : '#fff',
            border: '1px solid currentColor'
          }}>
            Status: {author.status}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
            <span>Profile Completion:</span>
            <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${author.completionPercent}%`, height: '100%', background: 'var(--accent)' }} />
            </div>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{author.completionPercent}%</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>📚 Total Books</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--foreground)', fontWeight: 'bold' }}>{stats.totalBooks}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>✅ Published Books</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--success)', fontWeight: 'bold' }}>{stats.publishedBooks}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>💰 Total Earnings</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>
            ₹{stats.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </SpotlightCard>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Left Side: Pending Actions & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Pending Actions */}
          <SpotlightCard style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
              Pending Actions
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingActions.map(action => (
                <li key={action.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                  <span style={{ color: '#ccc', fontSize: '0.95rem' }}>{action.text}</span>
                  <Link href={action.link} className="btn-primary" style={{ padding: '0.4rem 0.8rem', borderRadius: '15px', fontSize: '0.8rem' }}>
                    Solve
                  </Link>
                </li>
              ))}
            </ul>
          </SpotlightCard>

          {/* Recent Activity */}
          <SpotlightCard style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Activity</h2>
            {activities.length === 0 ? (
              <p style={{ color: '#888' }}>No recent activity.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {activities.map((act, i) => (
                  <li 
                    key={i} 
                    style={{ 
                      padding: '1rem 0', 
                      borderBottom: i < activities.length - 1 ? '1px solid var(--surface-border)' : 'none', 
                      color: '#ccc',
                      fontSize: '0.9rem'
                    }}
                  >
                    <span style={{ color: 'var(--accent)', marginRight: '1rem', fontWeight: 'bold' }}>{act.date}</span> 
                    {act.text}
                  </li>
                ))}
              </ul>
            )}
          </SpotlightCard>
        </div>

        {/* Right Side: Deadlines & Announcements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Deadlines */}
          <SpotlightCard style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Upcoming Deadlines</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {deadlines.map(d => (
                <li key={d.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ 
                    background: 'rgba(255,75,75,0.1)', 
                    color: '#FF4B4B', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '8px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>
                    {d.date}
                  </span>
                  <span style={{ color: '#ccc', fontSize: '0.95rem' }}>{d.task}</span>
                </li>
              ))}
            </ul>
          </SpotlightCard>

          {/* Announcements */}
          <SpotlightCard style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Latest Announcements</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map(a => (
                <li key={a.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold' }}>{a.date}</span>
                  </div>
                  <p style={{ margin: 0, color: '#ccc', fontSize: '0.9rem', lineHeight: '1.4' }}>{a.text}</p>
                </li>
              ))}
            </ul>
          </SpotlightCard>
        </div>

      </div>
    </div>
  );
}

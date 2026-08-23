'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';

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

  const { stats, activities } = data;

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>Total Manuscripts</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>{stats.manuscriptsCount}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>Active Messages</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>{stats.messageCount}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>Total Referrals</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>{stats.referralsCount}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>Book Units Sold</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>{stats.totalUnitsSold}</p>
        </SpotlightCard>
      </div>

      <SpotlightCard style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Recent Activity</h2>
        {activities.length === 0 ? (
          <p style={{ color: '#888' }}>No recent activity found.</p>
        ) : (
          <ul style={{ listStyle: 'none' }}>
            {activities.map((act, i) => (
              <li 
                key={i} 
                style={{ 
                  padding: '1rem 0', 
                  borderBottom: i < activities.length - 1 ? '1px solid var(--surface-border)' : 'none', 
                  color: '#ccc' 
                }}
              >
                <span style={{ color: 'var(--accent)', marginRight: '1rem' }}>{act.date}</span> {act.text}
              </li>
            ))}
          </ul>
        )}
      </SpotlightCard>
    </div>
  );
}

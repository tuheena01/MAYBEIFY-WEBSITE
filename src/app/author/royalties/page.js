'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';

export default function AuthorRoyalties() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/author/royalties')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load royalties');
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
        <p>Loading royalties...</p>
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

  const { totalEarned, royalties } = data;

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Royalties</h1>
      
      <SpotlightCard className="glass" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#888' }}>Total Earned (YTD)</h2>
        <p style={{ fontSize: '3.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>
          ${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </SpotlightCard>

      <SpotlightCard className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ margin: 0 }}>Monthly Breakdown</h3>
        </div>
        
        {royalties.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            No royalty records found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Month</th>
                <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Royalties</th>
                <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {royalties.map((r, i) => (
                <tr key={r.id || i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1.5rem' }}>{r.month}</td>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    ${r.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <span style={{ 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      background: r.status === 'PAID' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                      color: r.status === 'PAID' ? 'var(--success)' : 'var(--accent)'
                    }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SpotlightCard>
    </div>
  );
}

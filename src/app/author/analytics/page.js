'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import { BarChart, TrendingUp, Users, Target, Activity } from 'lucide-react';

export default function AuthorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/author/analytics')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load analytics details');
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
        <p>Loading performance board...</p>
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

  const { overview, chartData, topPerforming, audience } = data;

  // Render SVG Chart calculations
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);
  const maxSales = Math.max(...chartData.map(d => d.sales), 10);

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Analytics & Reports</h1>

      {/* Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Profile Views</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>{overview.profileViews}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Book Views</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>{overview.bookViews}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Book Sales</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>{overview.bookSales}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Downloads</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>{overview.downloads}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Gross Revenue</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)', margin: '0.5rem 0 0' }}>₹{overview.revenue.toFixed(2)}</p>
        </SpotlightCard>
      </div>

      {/* SVG Custom Responsive Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Sales/Revenue Chart */}
        <SpotlightCard className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--accent)" /> Revenue Trends (YTD)
          </h3>
          <div style={{ height: '220px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingTop: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            {chartData.length === 0 ? (
              <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#666' }}>No data points</p>
            ) : (
              chartData.map((d, i) => {
                const heightPercent = (d.revenue / maxRevenue) * 80 + 10; // min 10% height
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '0.3rem' }}>₹{d.revenue.toFixed(0)}</span>
                    <div style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(to top, var(--accent) 0%, rgba(212,175,55,0.3) 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease'
                    }} />
                    <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>{d.month.substring(0, 3)}</span>
                  </div>
                );
              })
            )}
          </div>
        </SpotlightCard>

        {/* Units Sold Chart */}
        <SpotlightCard className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart size={20} color="var(--success)" /> Units Sold by Month
          </h3>
          <div style={{ height: '220px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingTop: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            {chartData.length === 0 ? (
              <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#666' }}>No data points</p>
            ) : (
              chartData.map((d, i) => {
                const heightPercent = (d.sales / maxSales) * 80 + 10;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 'bold', marginBottom: '0.3rem' }}>{d.sales}</span>
                    <div style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(to top, rgba(0,230,118,0.8) 0%, rgba(0,230,118,0.2) 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease'
                    }} />
                    <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>{d.month.substring(0, 3)}</span>
                  </div>
                );
              })
            )}
          </div>
        </SpotlightCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Top Performing Books */}
        <SpotlightCard className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>Top Performing Books</h3>
          {topPerforming.length === 0 ? (
            <p style={{ color: '#888' }}>No performing books.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {topPerforming.map((book, idx) => (
                <div key={book.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < topPerforming.length - 1 ? '1px solid var(--surface-border)' : 'none', paddingBottom: '0.8rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>{book.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{book.sales} units sold</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.05rem' }}>₹{book.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>

        {/* Audience & Location Stats */}
        <SpotlightCard className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>Audience Geography</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {audience.location.map((loc, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span>{loc.name}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{loc.value}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${loc.value}%`, height: '100%', background: 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import { Eye, X } from 'lucide-react';

export default function BookSales() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [activeScreenshot, setActiveScreenshot] = useState(null);

  useEffect(() => {
    fetch('/api/author/sales')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load book sales data');
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
        <p>Loading sales board...</p>
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

  const { metrics, books, reports } = data;

  // Filter reports by Book and Platform
  const filteredReports = reports.filter(r => {
    const bookMatch = selectedBookId === 'all' || r.bookId === selectedBookId;
    const platformMatch = selectedPlatform === 'all' || r.platform.toUpperCase() === selectedPlatform.toUpperCase();
    return bookMatch && platformMatch;
  });

  // Calculate stats based on filter
  const totalUnits = filteredReports.reduce((sum, r) => sum + r.unitsSold, 0);
  const totalRev = filteredReports.reduce((sum, r) => sum + r.revenue, 0);

  // Group by platform for small cards (always show Amazon, Kindle, Playbooks totals for the selected book)
  const platformBreakdown = {
    amazon: { units: 0, revenue: 0 },
    kindle: { units: 0, revenue: 0 },
    playbooks: { units: 0, revenue: 0 }
  };

  reports.forEach(r => {
    if (selectedBookId === 'all' || r.bookId === selectedBookId) {
      const plat = r.platform.toUpperCase();
      if (plat === 'AMAZON') {
        platformBreakdown.amazon.units += r.unitsSold;
        platformBreakdown.amazon.revenue += r.revenue;
      } else if (plat === 'KINDLE') {
        platformBreakdown.kindle.units += r.unitsSold;
        platformBreakdown.kindle.revenue += r.revenue;
      } else if (plat === 'PLAYBOOKS' || plat === 'GOOGLE PLAY BOOKS') {
        platformBreakdown.playbooks.units += r.unitsSold;
        platformBreakdown.playbooks.revenue += r.revenue;
      }
    }
  });

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Book Sales Dashboard</h1>

      {/* platform-specific stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Amazon Card */}
        <SpotlightCard className="glass" style={{ padding: '2rem', borderTop: '4px solid #FF9900' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FF9900', fontWeight: 'bold' }}>Amazon Store</h3>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: 'rgba(255, 153, 0, 0.1)', color: '#FF9900' }}>Paperback/Hardcover</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Units Sold</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
                {platformBreakdown.amazon.units}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Revenue</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                ${platformBreakdown.amazon.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </SpotlightCard>

        {/* Kindle Card */}
        <SpotlightCard className="glass" style={{ padding: '2rem', borderTop: '4px solid #285A84' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#56B4FF', fontWeight: 'bold' }}>Amazon Kindle</h3>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: 'rgba(86, 180, 255, 0.1)', color: '#56B4FF' }}>eBook / KDP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Units Sold</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
                {platformBreakdown.kindle.units}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Revenue</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                ${platformBreakdown.kindle.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </SpotlightCard>

        {/* Google Playbooks Card */}
        <SpotlightCard className="glass" style={{ padding: '2rem', borderTop: '4px solid #4285F4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#4285F4', fontWeight: 'bold' }}>Google Playbooks</h3>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: 'rgba(66, 133, 244, 0.1)', color: '#4285F4' }}>eBook / Audio</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Units Sold</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
                {platformBreakdown.playbooks.units}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Revenue</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                ${platformBreakdown.playbooks.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Aggregate Stats Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <SpotlightCard style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Filtered Units</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--foreground)', margin: '0.5rem 0 0' }}>{totalUnits}</p>
          </div>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Filtered Revenue</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)', margin: '0.5rem 0 0' }}>
              ${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Total Books</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--foreground)', margin: '0.5rem 0 0' }}>{books.length}</p>
          </div>
        </SpotlightCard>
      </div>

      {/* Filters Section */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        <div>
          <label htmlFor="bookSelect" style={{ marginRight: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Book:</label>
          <select
            id="bookSelect"
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '20px',
              border: '1px solid var(--surface-border)',
              background: 'var(--surface)',
              color: 'var(--foreground)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Books</option>
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="platformSelect" style={{ marginRight: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Platform:</label>
          <select
            id="platformSelect"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '20px',
              border: '1px solid var(--surface-border)',
              background: 'var(--surface)',
              color: 'var(--foreground)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Platforms</option>
            <option value="AMAZON">Amazon Store</option>
            <option value="KINDLE">Amazon Kindle</option>
            <option value="PLAYBOOKS">Google Playbooks</option>
          </select>
        </div>
      </div>

      {/* Reports Breakdown Table */}
      <SpotlightCard className="glass" style={{ overflow: 'hidden', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ margin: 0 }}>Monthly Platform Sales Reports</h3>
        </div>

        {filteredReports.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#888' }}>
            No platform sales reports found for the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Month / Year</th>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Book Title</th>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Platform</th>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Units Sold</th>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Revenue</th>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Proof Document</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1.5rem' }}>{report.month} {report.year}</td>
                    <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{report.bookTitle}</td>
                    <td style={{ padding: '1.5rem' }}>
                      <span style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: report.platform.toUpperCase() === 'AMAZON' ? 'rgba(255, 153, 0, 0.15)' : 
                                    report.platform.toUpperCase() === 'KINDLE' ? 'rgba(86, 180, 255, 0.15)' : 'rgba(66, 133, 244, 0.15)',
                        color: report.platform.toUpperCase() === 'AMAZON' ? '#FF9900' : 
                               report.platform.toUpperCase() === 'KINDLE' ? '#56B4FF' : '#4285F4'
                      }}>
                        {report.platform}
                      </span>
                    </td>
                    <td style={{ padding: '1.5rem' }}>{report.unitsSold}</td>
                    <td style={{ padding: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                      ${report.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1.5rem' }}>
                      {report.screenshot ? (
                        <button
                          onClick={() => setActiveScreenshot(report)}
                          className="btn-primary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '15px',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={14} /> View Screenshot
                        </button>
                      ) : (
                        <span style={{ color: '#555', fontSize: '0.85rem' }}>No proof uploaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SpotlightCard>

      {/* Lightbox / Modal for Screenshot Proof */}
      {activeScreenshot && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '12px',
            maxWidth: '90%',
            maxHeight: '90%',
            width: '800px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              padding: '1.2rem 1.5rem',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Proof of Sales Report</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activeScreenshot.bookTitle} · {activeScreenshot.platform} · {activeScreenshot.month} {activeScreenshot.year}
                </p>
              </div>
              <button 
                onClick={() => setActiveScreenshot(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#090a0f'
            }}>
              <img 
                src={activeScreenshot.screenshot} 
                alt={`Proof of sales for ${activeScreenshot.bookTitle}`} 
                style={{
                  maxWidth: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              />
            </div>
            
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--surface-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              background: 'rgba(255,255,255,0.01)'
            }}>
              <button 
                className="btn-primary"
                onClick={() => setActiveScreenshot(null)}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '15px' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

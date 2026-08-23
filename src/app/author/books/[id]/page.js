'use client';

import { useState, useEffect, use } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import { Eye, X, BookOpen, Star, BarChart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BookDetails({ params }) {
  const { id } = use(params);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeScreenshot, setActiveScreenshot] = useState(null);

  useEffect(() => {
    fetch(`/api/author/books/${id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 404) {
            document.cookie = 'token=; Max-Age=0; path=/';
            window.location.href = '/author/login';
            return;
          }
          throw new Error('Failed to load book details');
        }
        return res.json();
      })
      .then((data) => {
        setBook(data.book);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading book details...</p>
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

  return (
    <div className="animate-in">
      {/* Back Button */}
      <Link href="/author/books" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 'bold' }}>
        <ArrowLeft size={16} /> Back to Library
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
        
        {/* Left Side: Book Cover & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SpotlightCard className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img 
              src={book.cover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'} 
              alt={book.title} 
              style={{
                width: '180px',
                height: '260px',
                borderRadius: '8px',
                objectFit: 'cover',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                marginBottom: '1.5rem',
                border: '1px solid var(--surface-border)'
              }}
            />
            <span style={{ 
              padding: '0.4rem 1rem', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: 'bold',
              background: book.status === 'PUBLISHED' ? 'rgba(0, 230, 118, 0.15)' : 
                          book.status === 'UNDER_REVIEW' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
              color: book.status === 'PUBLISHED' ? 'var(--success)' : 
                     book.status === 'UNDER_REVIEW' ? 'var(--accent)' : '#fff',
              border: '1px solid currentColor',
              marginBottom: '1rem'
            }}>
              Status: {book.status}
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', textAlign: 'center', margin: '0 0 0.5rem', lineHeight: '1.3' }}>
              {book.title}
            </h2>
            <p style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>
              Price: ₹{book.price.toFixed(2)}
            </p>
          </SpotlightCard>
        </div>

        {/* Right Side: Synopsis & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SpotlightCard className="glass" style={{ padding: '2rem', height: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
              Book Synopsis
            </h3>
            <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
              {book.synopsis || 'No synopsis registered for this book.'}
            </p>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginTop: '2.5rem', marginBottom: '1.2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
              Catalog Metadata
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#888', display: 'block' }}>Release Date</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{new Date(book.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span style={{ color: '#888', display: 'block' }}>ISBN Registered</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>Yes</span>
              </div>
            </div>
          </SpotlightCard>
        </div>

      </div>

      {/* Analytics Grid */}
      <h2 id="analytics" style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1.5rem', marginTop: '3rem' }}>
        Book Performance Analytics
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Book Views</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--foreground)', margin: '0.5rem 0 0' }}>{book.views}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Downloads</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--foreground)', margin: '0.5rem 0 0' }}>{book.downloads}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Reads / Reads</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--foreground)', margin: '0.5rem 0 0' }}>{book.reads}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Units Sold</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--foreground)', margin: '0.5rem 0 0' }}>{book.unitsSold}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Gross Revenue</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)', margin: '0.5rem 0 0' }}>₹{book.revenue.toFixed(2)}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Rating</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffb300', margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            {book.rating} <Star size={16} fill="#ffb300" />
          </p>
        </SpotlightCard>
      </div>

      {/* Platform Reports Table */}
      <SpotlightCard className="glass" style={{ overflow: 'hidden', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ margin: 0 }}>Associated Platform Reports</h3>
        </div>

        {book.platformReports.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#888' }}>
            No platform sales reports found for this book.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Month / Year</th>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Platform</th>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Units Sold</th>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Revenue</th>
                  <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Proof Document</th>
                </tr>
              </thead>
              <tbody>
                {book.platformReports.map((report) => (
                  <tr key={report.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1.5rem' }}>{report.month} {report.year}</td>
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
                      ₹{report.revenue.toFixed(2)}
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
                  {book.title} · {activeScreenshot.platform} · {activeScreenshot.month} {activeScreenshot.year}
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
                alt={`Proof of sales for ${book.title}`} 
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

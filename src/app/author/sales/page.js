'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import { BookOpen, FileSpreadsheet, Eye, X } from 'lucide-react';

export default function BookSales() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [activeProof, setActiveProof] = useState(null);

  useEffect(() => {
    fetch('/api/author/sales')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch sales reports');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        // Default to the first book if available
        if (resData.books && resData.books.length > 0) {
          setSelectedBookId(resData.books[0].id);
        }
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
        <p>Loading sales portal...</p>
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

  const { books, reports, metrics } = data;

  const selectedBook = books.find(b => b.id === selectedBookId);

  // Group filtered reports by platform
  const bookReports = reports.filter(r => r.bookId === selectedBookId);
  const amazonReports = bookReports.filter(r => r.platform.toUpperCase() === 'AMAZON');
  const kindleReports = bookReports.filter(r => r.platform.toUpperCase() === 'KINDLE');
  const playbooksReports = bookReports.filter(r => r.platform.toUpperCase() === 'PLAYBOOKS');

  // Excel sheet component renderer
  const renderExcelSheet = (title, platformReports, platformName) => {
    return (
      <div style={{ marginBottom: '2.5rem', overflow: 'hidden' }}>
        <div style={{
          background: '#217346', // Classic Excel Green
          color: 'white',
          padding: '0.6rem 1.2rem',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderRadius: '4px 4px 0 0'
        }}>
          <FileSpreadsheet size={16} />
          <span>{title} - Platform Statistics</span>
        </div>

        <div style={{ overflowX: 'auto', background: '#0b0c10', border: '1px solid #2d303a' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'monospace, sans-serif',
            fontSize: '0.85rem',
            textAlign: 'center',
            color: '#c9d1d9',
            minWidth: '780px'
          }}>
            <thead>
              {/* Alphabet Row Headers */}
              <tr style={{ background: '#1c1e24', borderBottom: '1px solid #2d303a' }}>
                <th style={{ width: '40px', background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}></th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #2d303a', color: '#888' }}>A</th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #2d303a', color: '#888' }}>B</th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #2d303a', color: '#888' }}>C</th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #2d303a', color: '#888' }}>D</th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #2d303a', color: '#888' }}>E</th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #2d303a', color: '#888' }}>F</th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #2d303a', color: '#888' }}>G</th>
                <th style={{ padding: '0.4rem', color: '#888' }}>H</th>
              </tr>
              {/* Columns Header Names */}
              <tr style={{ background: '#16181d', borderBottom: '1px solid #2d303a', fontWeight: 'bold' }}>
                <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888', fontWeight: 'bold' }}>1</td>
                <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#aaa' }}>Month</td>
                <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#aaa' }}>MRP</td>
                <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#aaa' }}>Printing cost</td>
                <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#aaa' }}>Shipping cost</td>
                <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#aaa' }}>{platformName} Royalty earned</td>
                <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#aaa' }}>{platformName} Sales</td>
                <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#aaa', fontWeight: 'bold', background: 'rgba(33, 115, 70, 0.08)' }}>Total Royalty earned({platformName})</td>
                <td style={{ padding: '0.8rem', color: '#aaa' }}>Proof Document</td>
              </tr>
            </thead>
            <tbody>
              {platformReports.length === 0 ? (
                <tr>
                  <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}>2</td>
                  <td colSpan={8} style={{ padding: '2rem', color: '#666', fontStyle: 'italic' }}>
                    No entries logged in sheet for {platformName}
                  </td>
                </tr>
              ) : (
                platformReports.map((report, idx) => {
                  const rowNum = idx + 2;
                  return (
                    <tr key={report.id} style={{ borderBottom: '1px solid #2d303a' }}>
                      <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888', fontWeight: 'bold' }}>{rowNum}</td>
                      <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', fontWeight: 'bold' }}>{report.month} {report.year}</td>
                      <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a' }}>₹{report.mrp.toFixed(2)}</td>
                      <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a' }}>₹{report.printingCost.toFixed(2)}</td>
                      <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a' }}>₹{report.shippingCost.toFixed(2)}</td>
                      <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#217346', fontWeight: 'bold' }}>₹{report.royaltyPerUnit.toFixed(2)}</td>
                      <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', fontWeight: 'bold' }}>{report.unitsSold}</td>
                      <td style={{ 
                        padding: '0.8rem', 
                        borderRight: '1px solid #2d303a', 
                        fontWeight: 'bold', 
                        color: 'var(--accent)', 
                        background: 'rgba(212, 175, 55, 0.08)' 
                      }}>
                        ₹{report.revenue.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.8rem' }}>
                        {report.screenshot ? (
                          <button
                            onClick={() => setActiveProof(report)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--accent)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontWeight: 'bold',
                              fontSize: '0.8rem'
                            }}
                          >
                            <Eye size={12} /> View Proof
                          </button>
                        ) : (
                          <span style={{ color: '#555' }}>--</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in">
      {/* Title Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0 }}>Book Sales Ledger</h1>
        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Track platform metrics, print costs, and royalties in formatted spreadsheets.</p>
      </div>

      {/* Book Grid Cards */}
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>Select Book Library:</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
        {books.map((book) => {
          const isSelected = book.id === selectedBookId;
          return (
            <div 
              key={book.id} 
              onClick={() => setSelectedBookId(book.id)}
              style={{ cursor: 'pointer' }}
            >
              <SpotlightCard 
                className="glass" 
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #217346' : '1px solid var(--surface-border)',
                  background: isSelected ? 'rgba(33, 115, 70, 0.04)' : 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                  boxShadow: isSelected ? '0 8px 24px rgba(33, 115, 70, 0.15)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '8px', 
                  background: isSelected ? '#217346' : 'rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: isSelected ? 'white' : '#888'
                }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: isSelected ? '#fff' : '#ccc' }}>
                    {book.title}
                  </h4>
                  <span style={{ fontSize: '0.85rem', color: isSelected ? 'var(--accent)' : '#888', fontWeight: 'bold' }}>
                    Click to load excel
                  </span>
                </div>
              </SpotlightCard>
            </div>
          );
        })}
      </div>

      {/* Spreadsheet Presentation Section */}
      {selectedBook ? (
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Spreadsheet: <span style={{ color: 'var(--accent)' }}>"{selectedBook.title}"</span>
          </h2>
          
          {renderExcelSheet('Amazon Store (Paperback/Hardcover)', amazonReports, 'Amazon')}
          {renderExcelSheet('Amazon Kindle (eBook)', kindleReports, 'Kindle')}
          {renderExcelSheet('Google Playbooks (eBook)', playbooksReports, 'Playbooks')}
        </div>
      ) : (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
          Select a book card above to load platform sales spreadsheets.
        </div>
      )}

      {/* Lightbox Screenshot Modal */}
      {activeProof && (
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
                  {selectedBook?.title} · {activeProof.platform} · {activeProof.month} {activeProof.year}
                </p>
              </div>
              <button 
                onClick={() => setActiveProof(null)}
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
                src={activeProof.screenshot} 
                alt={`Proof of sales`} 
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
                onClick={() => setActiveProof(null)}
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

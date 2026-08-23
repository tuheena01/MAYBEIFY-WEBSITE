'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import { BookOpen, Download, Eye, X } from 'lucide-react';

export default function BookSales() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [activeProof, setActiveProof] = useState(null);

  useEffect(() => {
    fetch('/api/author/sales')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 404) {
            document.cookie = 'token=; Max-Age=0; path=/';
            window.location.href = '/author/login';
            return;
          }
          throw new Error('Failed to fetch sales reports');
        }
        return res.json();
      })
      .then((resData) => {
        setData(resData);
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

  const { books, reports } = data;
  const selectedBook = books.find(b => b.id === selectedBookId);

  // Filter reports for the selected book
  const bookReports = reports.filter(r => r.bookId === selectedBookId);

  // Group reports by platform
  const amazonReports = bookReports.filter(r => r.platform.toUpperCase() === 'AMAZON');
  const maybeifyReports = bookReports.filter(r => r.platform.toUpperCase() === 'MAYBEIFY');
  const kindleReports = bookReports.filter(r => r.platform.toUpperCase() === 'KINDLE');
  const playbooksReports = bookReports.filter(r => r.platform.toUpperCase() === 'PLAYBOOKS');

  const handleExportCSV = () => {
    if (!selectedBook) return;

    const headers = [
      'Platform',
      'Printing price',
      'Shipping price',
      'Book cost',
      'Month',
      'Year',
      'Sales units',
      'Royalty (unit)',
      'Total Royalty Earned'
    ];

    const csvRows = [headers.join(',')];

    const compileCsvRows = (platformName, reportsArr, isFormula) => {
      reportsArr.forEach(r => {
        const mrp = r.mrp || selectedBook.price || 0.0;
        const pCost = r.printingCost || 0.0;
        const sCost = r.shippingCost || 0.0;
        const royaltyUnit = isFormula ? (mrp - pCost - sCost) : (r.royaltyPerUnit || 0.0);
        const totalRoyalty = (r.unitsSold || 0) * royaltyUnit;

        const dataRow = [
          platformName,
          pCost.toFixed(2),
          sCost.toFixed(2),
          mrp.toFixed(2),
          `"${r.month}"`,
          r.year,
          r.unitsSold,
          royaltyUnit.toFixed(2),
          totalRoyalty.toFixed(2)
        ];
        csvRows.push(dataRow.join(','));
      });
    };

    compileCsvRows('Amazon Store', amazonReports, true);
    compileCsvRows('Maybeify Store', maybeifyReports, true);
    compileCsvRows('Amazon Kindle', kindleReports, false);
    compileCsvRows('Google Playbooks', playbooksReports, false);

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedBook.title.replace(/\s+/g, '_')}_stacked_sales_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPlatformTable = (title, reportsList, isFormula, colorTheme, labelSales, labelRoyalty) => {
    return (
      <SpotlightCard className="glass" style={{ padding: '1.5rem', marginBottom: '2.5rem', border: `1px solid ${colorTheme}33` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: colorTheme, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: colorTheme, display: 'inline-block' }}></span>
            {title}
          </h3>
          {isFormula && (
            <span style={{ fontSize: '0.8rem', color: '#aaa', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.8rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              Formula: <code>Royalty = Book cost - Printing price - Shipping cost</code>
            </span>
          )}
          {!isFormula && (
            <span style={{ fontSize: '0.8rem', color: '#aaa', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.8rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              Standard eBook Royalty format (70% standard)
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto', background: '#0b0c10', border: '1px solid #2d303a', borderRadius: '8px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'monospace, sans-serif',
            fontSize: '0.82rem',
            textAlign: 'center',
            color: '#c9d1d9',
            minWidth: '1000px'
          }}>
            <thead>
              {/* Excel letters */}
              <tr style={{ background: '#1c1e24', borderBottom: '1px solid #2d303a' }}>
                <th style={{ width: '45px', background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}></th>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((l, idx) => (
                  <th key={idx} style={{ padding: '0.4rem', borderRight: l !== 'I' ? '1px solid #2d303a' : 'none', color: '#888' }}>{l}</th>
                ))}
              </tr>
              {/* Headers */}
              <tr style={{ borderBottom: '1px solid #2d303a', fontWeight: 'bold', color: 'white' }}>
                <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}>1</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', background: '#d4af37', color: 'black' }}>Printing price</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', background: '#80cbc4', color: 'black' }}>Shipping cost</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', background: '#e28743', color: 'black' }}>Book cost</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', background: '#14161b' }}>Month & Year</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', background: colorTheme, color: colorTheme === '#f57f17' ? 'black' : 'white' }}>{labelSales}</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', background: colorTheme, color: colorTheme === '#f57f17' ? 'black' : 'white' }}>Royalty (unit)</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', background: colorTheme, color: colorTheme === '#f57f17' ? 'black' : 'white', fontWeight: 'bold' }}>{labelRoyalty}</td>
                <td style={{ padding: '0.6rem', background: '#1c1e24' }}>Proof Attachment</td>
              </tr>
            </thead>
            <tbody>
              {reportsList.length === 0 ? (
                <tr>
                  <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}>2</td>
                  <td colSpan={9} style={{ padding: '2.5rem', color: '#666', fontStyle: 'italic' }}>
                    No sales reports found for this platform.
                  </td>
                </tr>
              ) : (
                reportsList.map((row, idx) => {
                  const rowNum = idx + 2;
                  const mrp = row.mrp || selectedBook.price || 299;
                  const printingPrice = row.printingCost || 0.0;
                  const shippingCost = row.shippingCost || 0.0;
                  const unitsSold = row.unitsSold || 0;

                  const royaltyUnit = isFormula ? (mrp - printingPrice - shippingCost) : (row.royaltyPerUnit || 0.0);
                  const totalRoyalty = unitsSold * royaltyUnit;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #2d303a' }}>
                      <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888', fontWeight: 'bold' }}>{rowNum}</td>
                      <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a' }}>₹{printingPrice.toFixed(2)}</td>
                      <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', color: '#80cbc4' }}>₹{shippingCost.toFixed(2)}</td>
                      <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a' }}>₹{mrp.toFixed(2)}</td>
                      <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a' }}>{row.month} {row.year}</td>
                      <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', fontWeight: 'bold' }}>{unitsSold}</td>
                      <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a' }}>₹{royaltyUnit.toFixed(2)}</td>
                      <td style={{ padding: '0.6rem', borderRight: '1px solid #2d303a', fontWeight: 'bold', color: colorTheme, background: 'rgba(255,255,255,0.01)' }}>₹{totalRoyalty.toFixed(2)}</td>
                      <td style={{ padding: '0.6rem' }}>
                        {row.screenshot ? (
                          <button
                            onClick={() => setActiveProof({ ...row, proofLink: row.screenshot })}
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
      </SpotlightCard>
    );
  };

  return (
    <div className="animate-in">
      {/* Title Banner */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0 }}>Platform Sales Ledgers</h1>
          <p style={{ color: '#aaa', marginTop: '0.5rem' }}>View, filter, and download stacked reports for each publishing stream.</p>
        </div>
        {selectedBook && (
          <button 
            onClick={handleExportCSV}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <Download size={18} /> Export Stacked Excel (.csv)
          </button>
        )}
      </div>

      {/* Book Grid Cards */}
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Select Book Library:</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
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
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--surface-border)',
                  background: isSelected ? 'rgba(212, 175, 55, 0.02)' : 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '8px', 
                  background: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: isSelected ? 'black' : '#888'
                }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: isSelected ? '#fff' : '#ccc' }}>
                    {book.title}
                  </h4>
                  <span style={{ fontSize: '0.85rem', color: isSelected ? 'var(--accent)' : '#888', fontWeight: 'bold' }}>
                    Click to load platform sheets
                  </span>
                </div>
              </SpotlightCard>
            </div>
          );
        })}
      </div>

      {/* Spreadsheet Tables */}
      {selectedBook ? (
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '2.5rem' }}>
            Book Sales Spreadsheets: <span style={{ color: 'var(--accent)' }}>"{selectedBook.title}"</span>
          </h2>

          {renderPlatformTable('Amazon Store (Paperback/Hardcover)', amazonReports, true, '#2e7d32', 'Amazon Sales', 'Total Amazon Royalty')}
          {renderPlatformTable('Maybeify Direct Store', maybeifyReports, true, '#455a64', 'Maybeify Sales', 'Total Maybeify Royalty')}
          {renderPlatformTable('Amazon Kindle eBook Store', kindleReports, false, '#c2185b', 'Kindle Sales', 'Total Kindle Royalty')}
          {renderPlatformTable('Google Playbooks eBook Store', playbooksReports, false, '#f57f17', 'Google Sales', 'Total Google Royalty')}
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
                  {selectedBook?.title} · {activeProof.month} {activeProof.year} Report
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
                src={activeProof.proofLink} 
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

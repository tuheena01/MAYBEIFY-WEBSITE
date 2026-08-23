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

  // Group report months
  const months = Array.from(new Set(bookReports.map(r => `${r.month} ${r.year}`)));

  // Build rows matching the horizontal layout structure
  const spreadsheetRows = months.map(m => {
    const [monthName, yearStr] = m.split(' ');
    const yearVal = parseInt(yearStr);

    const amazonReport = bookReports.find(r => r.platform.toUpperCase() === 'AMAZON' && r.month === monthName && r.year === yearVal);
    const kindleReport = bookReports.find(r => r.platform.toUpperCase() === 'KINDLE' && r.month === monthName && r.year === yearVal);
    const playbooksReport = bookReports.find(r => r.platform.toUpperCase() === 'PLAYBOOKS' && r.month === monthName && r.year === yearVal);
    const maybeifyReport = bookReports.find(r => r.platform.toUpperCase() === 'MAYBEIFY' && r.month === monthName && r.year === yearVal);

    // Fallbacks or retrieved database values
    const mrp = amazonReport?.mrp || kindleReport?.mrp || playbooksReport?.mrp || maybeifyReport?.mrp || selectedBook.price || 299;
    const printingPrice = amazonReport?.printingCost || maybeifyReport?.printingCost || 85.00;
    const shippingPrice = amazonReport?.shippingCost || 40.00;
    const bookCost = mrp;

    const amazonSales = amazonReport?.unitsSold || 0;
    // Amazon Royalty Formula: Book Cost - Printing Price - Shipping Cost
    const amazonRoyaltyUnit = bookCost - printingPrice - shippingPrice;
    const amazonRoyalty = amazonSales * amazonRoyaltyUnit;

    const maybeifySales = maybeifyReport?.unitsSold || 0;
    const maybeifyRoyalty = maybeifyReport?.revenue || 0.0;

    const googleSales = playbooksReport?.unitsSold || 0;
    const googleRoyalty = playbooksReport?.revenue || 0.0;

    const kindleSales = kindleReport?.unitsSold || 0;
    const kindleRoyalty = kindleReport?.revenue || 0.0;

    const cumulativeRoyalty = amazonRoyalty + maybeifyRoyalty + googleRoyalty + kindleRoyalty;

    return {
      month: m,
      printingPrice,
      shippingPrice,
      bookCost,
      amazonSales,
      amazonRoyalty,
      maybeifySales,
      maybeifyRoyalty,
      googleSales,
      googleRoyalty,
      kindleSales,
      kindleRoyalty,
      cumulativeRoyalty,
      proofLink: amazonReport?.screenshot || kindleReport?.screenshot || playbooksReport?.screenshot
    };
  });

  const handleExportCSV = () => {
    if (!selectedBook) return;

    // Headers
    const headers = [
      'Printing price',
      'Shipping price',
      'Amazon Book cost',
      'Month',
      'Amazon sales',
      'Royalty earned',
      'Month',
      'Maybeify Sales',
      'Maybeify Royalty earned',
      'Month',
      'Google Play Sales',
      'Google Play Royalty earned',
      'Month',
      'Kindle sales',
      'Kindle Royalty earned',
      'Total cumulative royalty earned'
    ];

    const csvRows = [headers.join(',')];

    spreadsheetRows.forEach(row => {
      const dataRow = [
        row.printingPrice.toFixed(2),
        row.shippingPrice.toFixed(2),
        row.bookCost.toFixed(2),
        `"${row.month}"`,
        row.amazonSales,
        row.amazonRoyalty.toFixed(2),
        `"${row.month}"`,
        row.maybeifySales,
        row.maybeifyRoyalty.toFixed(2),
        `"${row.month}"`,
        row.googleSales,
        row.googleRoyalty.toFixed(2),
        `"${row.month}"`,
        row.kindleSales,
        row.kindleRoyalty.toFixed(2),
        row.cumulativeRoyalty.toFixed(2)
      ];
      csvRows.push(dataRow.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedBook.title.replace(/\s+/g, '_')}_sales_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in">
      {/* Title Banner */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0 }}>Horizontal Sales Ledger</h1>
          <p style={{ color: '#aaa', marginTop: '0.5rem' }}>View, track, and download structured monthly spreadsheet reports.</p>
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
            <Download size={18} /> Export to Excel (.csv)
          </button>
        )}
      </div>

      {/* Book Grid Cards */}
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>Select Book Library:</h3>
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
                    Click to load sheet
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
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Spreadsheet: <span style={{ color: 'var(--accent)' }}>"{selectedBook.title}"</span>
          </h2>

          <div className="glass" style={{ 
            padding: '1rem 1.5rem', 
            borderRadius: '8px', 
            marginBottom: '2rem', 
            background: 'rgba(33, 115, 70, 0.05)', 
            border: '1px dashed rgba(33, 115, 70, 0.3)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.8rem' 
          }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>
              <strong>Amazon Royalty Formula:</strong> <code>Royalty per Unit = Amazon Book Cost - (Printing price + Shipping cost)</code>
            </p>
          </div>

          <div style={{ overflowX: 'auto', background: '#0b0c10', border: '1px solid #2d303a', borderRadius: '8px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'monospace, sans-serif',
              fontSize: '0.82rem',
              textAlign: 'center',
              color: '#c9d1d9',
              minWidth: '1350px'
            }}>
              <thead>
                {/* Excel Column Letters row */}
                <tr style={{ background: '#1c1e24', borderBottom: '1px solid #2d303a' }}>
                  <th style={{ width: '40px', background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}></th>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'].map((letter, i) => (
                    <th key={i} style={{ padding: '0.4rem', borderRight: letter !== 'R' ? '1px solid #2d303a' : 'none', color: '#888' }}>{letter}</th>
                  ))}
                </tr>
                {/* Excel Colored Headers row */}
                <tr style={{ borderBottom: '1px solid #2d303a', fontWeight: 'bold', fontSize: '0.85rem', color: '#fff' }}>
                  <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}>1</td>
                  {/* General cost columns */}
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#d4af37', color: 'black' }}>Printing price</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#80cbc4', color: 'black' }}>Shipping cost</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#e28743', color: 'black' }}>Amazon Book cost</td>
                  {/* Amazon store columns */}
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#2e7d32' }}>Month</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#2e7d32' }}>Amazon sales</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#2e7d32' }}>Royalty earned</td>
                  {/* Maybeify columns */}
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#455a64' }}>Month</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#455a64' }}>Maybeify Sales</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#455a64' }}>Royalty earned</td>
                  {/* Spacer Col I */}
                  <td style={{ width: '20px', borderRight: '1px solid #2d303a', background: '#14161b' }}></td>
                  {/* Google Playbooks columns */}
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#f57f17', color: 'black' }}>Month</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#f57f17', color: 'black' }}>Google Play Sales</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#f57f17', color: 'black' }}>Royalty earned</td>
                  {/* Amazon Kindle columns */}
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#c2185b' }}>Month</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#c2185b' }}>Kindle sales</td>
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#c2185b' }}>Royalty earned</td>
                  {/* Cumulative total column */}
                  <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', background: '#b71c1c', fontWeight: 'bold' }}>Total cumulative royalty earned</td>
                  <td style={{ padding: '0.8rem', background: '#1c1e24' }}>Proof Attachment</td>
                </tr>
              </thead>
              <tbody>
                {spreadsheetRows.length === 0 ? (
                  <tr>
                    <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}>2</td>
                    <td colSpan={18} style={{ padding: '3rem', color: '#666', fontStyle: 'italic' }}>
                      No reports found for this book.
                    </td>
                  </tr>
                ) : (
                  spreadsheetRows.map((row, idx) => {
                    const rowNum = idx + 2;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #2d303a' }}>
                        <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888', fontWeight: 'bold' }}>{rowNum}</td>
                        {/* Costs */}
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', fontWeight: 'bold' }}>₹{row.printingPrice.toFixed(2)}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', fontWeight: 'bold', color: '#80cbc4' }}>₹{row.shippingPrice.toFixed(2)}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a' }}>₹{row.bookCost.toFixed(2)}</td>
                        {/* Amazon Store */}
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#81c784' }}>{row.month}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a' }}>{row.amazonSales}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', fontWeight: 'bold', color: '#81c784' }}>₹{row.amazonRoyalty.toFixed(2)}</td>
                        {/* Maybeify direct */}
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#90a4ae' }}>{row.month}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a' }}>{row.maybeifySales}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', fontWeight: 'bold', color: '#90a4ae' }}>₹{row.maybeifyRoyalty.toFixed(2)}</td>
                        {/* Blank Spacer Col I */}
                        <td style={{ borderRight: '1px solid #2d303a', background: '#14161b' }}></td>
                        {/* Google Playbooks */}
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#ffd54f' }}>{row.month}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a' }}>{row.googleSales}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', fontWeight: 'bold', color: '#ffd54f' }}>₹{row.googleRoyalty.toFixed(2)}</td>
                        {/* Kindle */}
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', color: '#f48fb1' }}>{row.month}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a' }}>{row.kindleSales}</td>
                        <td style={{ padding: '0.8rem', borderRight: '1px solid #2d303a', fontWeight: 'bold', color: '#f48fb1' }}>₹{row.kindleRoyalty.toFixed(2)}</td>
                        {/* Total Cumulative */}
                        <td style={{ 
                          padding: '0.8rem', 
                          borderRight: '1px solid #2d303a', 
                          fontWeight: 'bold', 
                          color: '#e57373', 
                          background: 'rgba(183, 28, 28, 0.08)' 
                        }}>
                          ₹{row.cumulativeRoyalty.toFixed(2)}
                        </td>
                        {/* Screenshot Link */}
                        <td style={{ padding: '0.8rem' }}>
                          {row.proofLink ? (
                            <button
                              onClick={() => setActiveProof(row)}
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
      ) : (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
          Select a book card above to load sales spreadsheets.
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
                  {selectedBook?.title} · {activeProof.month} Report
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

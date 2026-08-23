'use client';

import { useState, useEffect } from 'react';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const [apps, setApps] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [selectedAuthorId, setSelectedAuthorId] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookPrice, setNewBookPrice] = useState('');
  const [newBookCover, setNewBookCover] = useState('');
  const [newBookSynopsis, setNewBookSynopsis] = useState('');
  const [bookMessage, setBookMessage] = useState('');

  // Sales report state
  const [selectedBookId, setSelectedBookId] = useState('');
  const [platform, setPlatform] = useState('AMAZON');
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState('2026');
  const [unitsSold, setUnitsSold] = useState('');
  const [revenue, setRevenue] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  // Bulk Excel Sheet simulated upload state
  const [excelText, setExcelText] = useState('');
  const [excelMessage, setExcelMessage] = useState('');

  const fetchAdminData = () => {
    Promise.all([
      fetch('/api/admin/applications').then(res => res.json()),
      fetch('/api/admin/pending-users').then(res => res.json()),
      fetch('/api/admin/nominations').then(res => res.json()),
      fetch('/api/admin/authors').then(res => res.json()),
      fetch('/api/admin/withdrawals').then(res => res.json())
    ]).then(([appsData, usersData, nomsData, authorsData, withdrawalsData]) => {
      setApps(appsData);
      setPendingUsers(usersData);
      setNominations(Array.isArray(nomsData) ? nomsData : []);
      setAuthors(authorsData.authors || []);
      setWithdrawals(withdrawalsData.withdrawals || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAdminData();
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
        fetchAdminData();
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
        fetchAdminData();
      } else {
        alert('Activation failed.');
      }
    } catch (err) {
      alert('Error activating user.');
    }
  };

  // Create Book
  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!selectedAuthorId || !newBookTitle || !newBookPrice) {
      setBookMessage('Please fill in Author, Title and Price.');
      return;
    }
    setBookMessage('Creating book...');
    try {
      const res = await fetch('/api/admin/sales-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_book',
          authorId: selectedAuthorId,
          title: newBookTitle,
          price: parseFloat(newBookPrice),
          cover: newBookCover || undefined,
          synopsis: newBookSynopsis || ''
        })
      });
      if (res.ok) {
        setBookMessage('Book registered successfully!');
        setNewBookTitle('');
        setNewBookPrice('');
        setNewBookCover('');
        setNewBookSynopsis('');
        fetchAdminData();
      } else {
        const err = await res.json();
        setBookMessage(`Error: ${err.error || 'Failed'}`);
      }
    } catch (err) {
      setBookMessage('Network error.');
    }
  };

  // Add Sales Report Row
  const handleAddReport = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !unitsSold || !revenue) {
      setReportMessage('Please select Book, units, and revenue.');
      return;
    }
    setReportMessage('Saving report...');
    try {
      const res = await fetch('/api/admin/sales-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_report',
          bookId: selectedBookId,
          platform,
          month: `${month}`,
          year: parseInt(year),
          unitsSold: parseInt(unitsSold),
          revenue: parseFloat(revenue),
          screenshot: screenshot || undefined
        })
      });
      if (res.ok) {
        setReportMessage('Platform sales report updated successfully!');
        setUnitsSold('');
        setRevenue('');
        setScreenshot('');
      } else {
        const err = await res.json();
        setReportMessage(`Error: ${err.error || 'Failed'}`);
      }
    } catch (err) {
      setReportMessage('Network error.');
    }
  };

  // Bulk Excel Sheet simulated upload
  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !excelText) {
      setExcelMessage('Select a Book and paste Excel/JSON text.');
      return;
    }
    setExcelMessage('Parsing and importing...');
    try {
      let parsedData;
      try {
        // Try parsing JSON list first
        parsedData = JSON.parse(excelText);
      } catch (err) {
        // Fallback: parse CSV/Tab-delimited format
        const lines = excelText.trim().split('\n');
        parsedData = lines.map(line => {
          const parts = line.split(/[\t,]/); // comma or tab
          return {
            platform: parts[0]?.trim() || 'AMAZON',
            month: parts[1]?.trim() || 'August',
            year: parts[2]?.trim() || '2026',
            unitsSold: parts[3]?.trim() || '10',
            revenue: parts[4]?.trim() || '100',
            screenshot: parts[5]?.trim() || ''
          };
        });
      }

      const res = await fetch('/api/admin/sales-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_import',
          bookId: selectedBookId,
          reportsList: parsedData
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExcelMessage(`Imported ${data.count} report rows successfully!`);
        setExcelText('');
        fetchAdminData();
      } else {
        const err = await res.json();
        setExcelMessage(`Import failed: ${err.error}`);
      }
    } catch (err) {
      setExcelMessage('Failed to parse sheet data. Ensure correct CSV/Tab/JSON structure.');
    }
  };

  // Withdrawal approval
  const handleResolveWithdrawal = async (id, status) => {
    if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return;
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        alert(`Withdrawal request ${status.toLowerCase()} successfully!`);
        fetchAdminData();
      } else {
        alert('Resolution failed.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const selectedAuthorObj = authors.find(a => a.id === selectedAuthorId);
  const authorBooks = selectedAuthorObj ? selectedAuthorObj.books : [];

  if (loading) return <div className={styles.container}>Loading administration console...</div>;

  return (
    <div className={styles.container} style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 className="serif" style={{ fontSize: '2.8rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '2.5rem' }}>
        Maybeify Publishing Admin Console
      </h1>

      {/* ── SECTION: MANAGE BOOKS & SALES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        
        {/* Book Creator */}
        <div className={styles.card} style={{ padding: '2rem', background: 'rgba(255,255,255,0.01)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
            Register New Book
          </h2>
          <form onSubmit={handleCreateBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>Select Author</label>
              <select 
                value={selectedAuthorId} 
                onChange={(e) => { setSelectedAuthorId(e.target.value); setSelectedBookId(''); }}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: '#1c1e24', color: 'white', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">-- Choose Author --</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>Book Title</label>
              <input 
                type="text" 
                value={newBookTitle} 
                onChange={(e) => setNewBookTitle(e.target.value)} 
                placeholder="e.g. Love under the stars"
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Price (₹)</label>
                <input 
                  type="number" 
                  value={newBookPrice} 
                  onChange={(e) => setNewBookPrice(e.target.value)} 
                  placeholder="₹"
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Cover Image URL</label>
                <input 
                  type="text" 
                  value={newBookCover} 
                  onChange={(e) => setNewBookCover(e.target.value)}
                  placeholder="URL link"
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>Synopsis</label>
              <textarea 
                value={newBookSynopsis} 
                onChange={(e) => setNewBookSynopsis(e.target.value)}
                rows={2}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Create Book
            </button>
            {bookMessage && <p style={{ fontSize: '0.9rem', color: 'var(--accent)', marginTop: '0.5rem' }}>{bookMessage}</p>}
          </form>
        </div>

        {/* Sales Report Grid Manager */}
        <div className={styles.card} style={{ padding: '2rem', background: 'rgba(255,255,255,0.01)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
            Submit Sales Report (Single Row)
          </h2>
          <form onSubmit={handleAddReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Select Author</label>
                <select 
                  value={selectedAuthorId} 
                  onChange={(e) => { setSelectedAuthorId(e.target.value); setSelectedBookId(''); }}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: '#1c1e24', color: 'white', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">-- Choose Author --</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Select Book</label>
                <select 
                  value={selectedBookId} 
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: '#1c1e24', color: 'white', outline: 'none', cursor: 'pointer' }}
                  disabled={!selectedAuthorId}
                >
                  <option value="">-- Choose Book --</option>
                  {authorBooks.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Platform</label>
                <select 
                  value={platform} 
                  onChange={(e) => setPlatform(e.target.value)}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: '#1c1e24', color: 'white', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="AMAZON">Amazon Store</option>
                  <option value="KINDLE">Amazon Kindle</option>
                  <option value="PLAYBOOKS">Google Playbooks</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Month</label>
                <input 
                  type="text" 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Year</label>
                <input 
                  type="text" 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Units Sold</label>
                <input 
                  type="number" 
                  value={unitsSold} 
                  onChange={(e) => setUnitsSold(e.target.value)} 
                  placeholder="0"
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Gross Revenue (₹)</label>
                <input 
                  type="number" 
                  value={revenue} 
                  onChange={(e) => setRevenue(e.target.value)} 
                  placeholder="₹"
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>Screenshot Proof Link</label>
              <input 
                type="text" 
                value={screenshot} 
                onChange={(e) => setScreenshot(e.target.value)} 
                placeholder="Image/Proof URL"
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Save Report Row
            </button>
            {reportMessage && <p style={{ fontSize: '0.9rem', color: 'var(--accent)', marginTop: '0.5rem' }}>{reportMessage}</p>}
          </form>
        </div>

      </div>

      {/* ── SECTION: BULK EXCEL SHEET simulated IMPORT ── */}
      <div className={styles.card} style={{ padding: '2rem', marginBottom: '4rem', background: 'rgba(255,255,255,0.01)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
          Import Sales Excel Sheet
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Paste comma-separated, tab-separated, or JSON list representing Excel sheets columns in the format: <code style={{ color: 'var(--accent)' }}>Platform, Month, Year, UnitsSold, Revenue, ScreenshotLink</code>
        </p>
        <form onSubmit={handleBulkImport}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '200px' }}>
              <label style={{ fontSize: '0.85rem', color: '#888' }}>Select Target Book</label>
              <select 
                value={selectedBookId} 
                onChange={(e) => setSelectedBookId(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: '#1c1e24', color: 'white', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">-- Choose Book --</option>
                {authors.flatMap(a => a.books.map(b => (
                  <option key={b.id} value={b.id}>{b.title} (by {a.name})</option>
                )))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#888' }}>Excel Data Content (Tab/CSV or JSON List)</label>
            <textarea 
              value={excelText}
              onChange={(e) => setExcelText(e.target.value)}
              placeholder="AMAZON, August, 2026, 60, 12000, https://screenshot.url&#10;KINDLE, August, 2026, 150, 8500, https://screenshot.url"
              rows={4}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.9rem' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
            Parse & Import Excel Sheet
          </button>
          {excelMessage && <p style={{ fontSize: '0.9rem', color: 'var(--accent)', marginTop: '1rem' }}>{excelMessage}</p>}
        </form>
      </div>

      {/* ── SECTION: WITHDRAWAL REQUESTS MANAGER ── */}
      <section className={styles.section} style={{ marginBottom: '4rem' }}>
        <h2 className={styles.sectionTitle}>Authors Withdrawal Requests</h2>
        {withdrawals.length === 0 ? (
          <p className={styles.empty}>No withdrawal requests registered.</p>
        ) : (
          <div className={styles.grid}>
            {withdrawals.map(req => (
              <div key={req.id} className={styles.card} style={{ border: req.status === 'APPROVED' ? '1px solid var(--success)' : req.status === 'PENDING' ? '1px solid var(--accent)' : '1px solid #FF4B4B' }}>
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles.date}>{new Date(req.createdAt).toLocaleDateString()}</span>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      background: req.status === 'APPROVED' ? 'rgba(0, 230, 118, 0.15)' : 
                                  req.status === 'PENDING' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 75, 75, 0.15)',
                      color: req.status === 'APPROVED' ? 'var(--success)' : 
                             req.status === 'PENDING' ? 'var(--accent)' : '#FF4B4B'
                    }}>
                      {req.status}
                    </span>
                  </div>
                  <h3 style={{ margin: '0.8rem 0 0.2rem' }}>₹{req.amount.toFixed(2)}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>by {req.author.name} ({req.author.email})</p>
                </div>
                <div style={{ margin: '1rem 0', fontSize: '0.9rem', color: '#ccc' }}>
                  {req.author.upiId && <div><strong>UPI ID:</strong> {req.author.upiId}</div>}
                  {req.author.bankAccount && <div style={{ marginTop: '0.2rem' }}><strong>Bank:</strong> {req.author.bankAccount}</div>}
                </div>
                {req.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                    <button 
                      onClick={() => handleResolveWithdrawal(req.id, 'APPROVED')} 
                      className={styles.approveBtn}
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                    >
                      Approve & Transfer
                    </button>
                    <button 
                      onClick={() => handleResolveWithdrawal(req.id, 'REJECTED')} 
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: 'rgba(255,75,75,0.1)', color: '#FF4B4B', border: '1px solid #FF4B4B', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION: MANUSCRIPT APPLICATIONS ── */}
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

      {/* ── SECTION: PENDING ACCOUNTS ── */}
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

      {/* ── SECTION: NOMINATIONS ── */}
      <section className={styles.section} style={{ marginTop: '4rem' }}>
        <h2 className={styles.sectionTitle}>Award Nominations</h2>
        <div className={styles.grid}>
          {nominations.length === 0 && <p className={styles.empty}>No nominations submitted.</p>}
          {nominations.map(nom => (
            <div key={nom.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={styles.date}>{new Date(nom.createdAt).toLocaleDateString()}</span>
                  {nom.instagram && (
                    <span className={styles.discountBadge} style={{ background: '#E1306C', color: '#fff', fontSize: '0.6rem' }}>
                      Instagram: {nom.instagram}
                    </span>
                  )}
                </div>
                <h3>{nom.name}</h3>
                <span className={styles.genre}>WhatsApp: {nom.whatsapp}</span>
              </div>
              <div className={styles.authorInfo}>
                <span>Email: {nom.email}</span>
              </div>
              <p className={styles.synopsis} style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: 'var(--text2)' }}>
                <strong>Reason:</strong> {nom.reason}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

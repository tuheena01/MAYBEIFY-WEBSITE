'use client';

import { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import { Save, Plus, FileSpreadsheet, Edit3, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [apps, setApps] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Author Profile Editor state
  const [selectedAuthorId, setSelectedAuthorId] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    status: 'UNDER_REVIEW',
    completionPercent: 30,
    awards: '',
    publications: ''
  });
  const [profileMessage, setProfileMessage] = useState('');

  // Book selection state
  const [selectedBookId, setSelectedBookId] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookPrice, setNewBookPrice] = useState('');
  const [newBookCover, setNewBookCover] = useState('');
  const [newBookSynopsis, setNewBookSynopsis] = useState('');
  const [bookMessage, setBookMessage] = useState('');

  // Interactive horizontal spreadsheet state
  const [spreadsheetRows, setSpreadsheetRows] = useState([]);
  const [sheetMessage, setSheetMessage] = useState('');

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

  // Update form fields when author changes
  useEffect(() => {
    if (selectedAuthorId) {
      const author = authors.find(a => a.id === selectedAuthorId);
      if (author) {
        setProfileForm({
          name: author.name || '',
          email: author.email || '',
          phone: author.phone || '',
          bio: author.bio || '',
          status: author.status || 'UNDER_REVIEW',
          completionPercent: author.completionPercent || 30,
          awards: author.awards || '',
          publications: author.publications || ''
        });
        setSelectedBookId('');
        setSpreadsheetRows([]);
      }
    } else {
      setProfileForm({
        name: '',
        email: '',
        phone: '',
        bio: '',
        status: 'UNDER_REVIEW',
        completionPercent: 30,
        awards: '',
        publications: ''
      });
      setSelectedBookId('');
      setSpreadsheetRows([]);
    }
  }, [selectedAuthorId, authors]);

  // Load spreadsheet rows when book changes
  useEffect(() => {
    if (selectedBookId && selectedAuthorId) {
      const author = authors.find(a => a.id === selectedAuthorId);
      const book = author?.books?.find(b => b.id === selectedBookId);
      
      if (book && book.platformReports) {
        // Group reports by Month & Year to build horizontal row entities
        const bookReports = book.platformReports;
        const months = Array.from(new Set(bookReports.map(r => `${r.month} ${r.year}`)));
        
        const rows = months.map(m => {
          const [monthName, yearStr] = m.split(' ');
          const yearVal = parseInt(yearStr);

          const amz = bookReports.find(r => r.platform.toUpperCase() === 'AMAZON' && r.month === monthName && r.year === yearVal);
          const kdl = bookReports.find(r => r.platform.toUpperCase() === 'KINDLE' && r.month === monthName && r.year === yearVal);
          const pb = bookReports.find(r => r.platform.toUpperCase() === 'PLAYBOOKS' && r.month === monthName && r.year === yearVal);
          const mbf = bookReports.find(r => r.platform.toUpperCase() === 'MAYBEIFY' && r.month === monthName && r.year === yearVal);

          const mrp = amz?.mrp || kdl?.mrp || pb?.mrp || mbf?.mrp || book.price || 299;
          const printingPrice = amz?.printingCost || mbf?.printingCost || 85.00;
          const shippingCost = amz?.shippingCost || 40.00;

          return {
            month: monthName,
            year: yearVal,
            printingPrice,
            shippingCost,
            bookCost: mrp,
            amazonSales: amz?.unitsSold || 0,
            amazonRoyaltyPerUnit: amz?.royaltyPerUnit || (mrp - printingPrice - shippingCost),
            maybeifySales: mbf?.unitsSold || 0,
            maybeifyRoyaltyPerUnit: mbf?.royaltyPerUnit || 0.0,
            googleSales: pb?.unitsSold || 0,
            googleRoyaltyPerUnit: pb?.royaltyPerUnit || 55.00,
            kindleSales: kdl?.unitsSold || 0,
            kindleRoyaltyPerUnit: kdl?.royaltyPerUnit || 45.00,
            screenshot: amz?.screenshot || kdl?.screenshot || pb?.screenshot || mbf?.screenshot || ''
          };
        });
        setSpreadsheetRows(rows);
      } else {
        setSpreadsheetRows([]);
      }
    } else {
      setSpreadsheetRows([]);
    }
  }, [selectedBookId, selectedAuthorId, authors]);

  // Profile Form Change Handler
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  // Submit profile changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('Saving author details...');
    try {
      const res = await fetch('/api/admin/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAuthorId,
          ...profileForm
        })
      });
      if (res.ok) {
        setProfileMessage('Author profile details saved!');
        fetchAdminData();
      } else {
        const err = await res.json();
        setProfileMessage(`Error: ${err.error || 'Failed'}`);
      }
    } catch (err) {
      setProfileMessage('Network error.');
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

  // Add Row to horizontal spreadsheet editor
  const handleAddSheetRow = () => {
    const newRow = {
      month: 'September',
      year: 2026,
      printingPrice: 85.0,
      shippingCost: 40.0,
      bookCost: 299.0,
      amazonSales: 0,
      amazonRoyaltyPerUnit: 174.0, // calculated from bookCost - printingPrice - shippingCost
      maybeifySales: 0,
      maybeifyRoyaltyPerUnit: 0.0,
      googleSales: 0,
      googleRoyaltyPerUnit: 55.0,
      kindleSales: 0,
      kindleRoyaltyPerUnit: 45.0,
      screenshot: ''
    };
    setSpreadsheetRows([...spreadsheetRows, newRow]);
  };

  // Row cell editing
  const handleCellChange = (index, field, value) => {
    const updated = [...spreadsheetRows];
    updated[index][field] = value;
    setSpreadsheetRows(updated);
  };

  // Delete row
  const handleDeleteSheetRow = (index) => {
    setSpreadsheetRows(spreadsheetRows.filter((_, i) => i !== index));
  };

  // Save spreadsheet grid rows
  const handleSaveSpreadsheet = async () => {
    if (!selectedBookId) return;
    setSheetMessage('Compiling and saving grid...');

    // Compile horizontal rows to platform reports list
    const reportsList = [];
    spreadsheetRows.forEach(row => {
      const pPrice = parseFloat(row.printingPrice) || 0.0;
      const sCost = parseFloat(row.shippingCost) || 0.0;
      const bCost = parseFloat(row.bookCost) || 0.0;
      const amzSales = parseInt(row.amazonSales) || 0;
      const amzRoyaltyPerUnit = bCost - pPrice - sCost;

      // Amazon
      reportsList.push({
        platform: 'AMAZON',
        month: row.month,
        year: parseInt(row.year) || 2026,
        mrp: bCost,
        printingCost: pPrice,
        shippingCost: sCost,
        royaltyPerUnit: amzRoyaltyPerUnit,
        unitsSold: amzSales,
        revenue: amzSales * amzRoyaltyPerUnit,
        screenshot: row.screenshot || null
      });
      // Maybeify
      reportsList.push({
        platform: 'MAYBEIFY',
        month: row.month,
        year: parseInt(row.year) || 2026,
        mrp: parseFloat(row.bookCost) || 0.0,
        printingCost: parseFloat(row.printingPrice) || 0.0,
        shippingCost: 0.00,
        royaltyPerUnit: parseFloat(row.maybeifyRoyaltyPerUnit) || 0.0,
        unitsSold: parseInt(row.maybeifySales) || 0,
        revenue: (parseInt(row.maybeifySales) || 0) * (parseFloat(row.maybeifyRoyaltyPerUnit) || 0.0),
        screenshot: row.screenshot || null
      });
      // Playbooks
      reportsList.push({
        platform: 'PLAYBOOKS',
        month: row.month,
        year: parseInt(row.year) || 2026,
        mrp: parseFloat(row.bookCost) || 0.0,
        printingCost: 0.0,
        shippingCost: 0.0,
        royaltyPerUnit: parseFloat(row.googleRoyaltyPerUnit) || 0.0,
        unitsSold: parseInt(row.googleSales) || 0,
        revenue: (parseInt(row.googleSales) || 0) * (parseFloat(row.googleRoyaltyPerUnit) || 0.0),
        screenshot: row.screenshot || null
      });
      // Kindle
      reportsList.push({
        platform: 'KINDLE',
        month: row.month,
        year: parseInt(row.year) || 2026,
        mrp: parseFloat(row.bookCost) || 0.0,
        printingCost: 0.0,
        shippingCost: 0.0,
        royaltyPerUnit: parseFloat(row.kindleRoyaltyPerUnit) || 0.0,
        unitsSold: parseInt(row.kindleSales) || 0,
        revenue: (parseInt(row.kindleSales) || 0) * (parseFloat(row.kindleRoyaltyPerUnit) || 0.0),
        screenshot: row.screenshot || null
      });
    });

    try {
      const res = await fetch('/api/admin/sales-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_import',
          bookId: selectedBookId,
          reportsList
        })
      });
      if (res.ok) {
        setSheetMessage('Excel Sales spreadsheet saved successfully to DB!');
        fetchAdminData();
      } else {
        const err = await res.json();
        setSheetMessage(`Error: ${err.error || 'Failed to save spreadsheet'}`);
      }
    } catch (err) {
      setSheetMessage('Network error occurred.');
    }
  };

  // Approve/Reject withdrawal
  const handleResolveWithdrawal = async (id, status) => {
    if (!confirm(`Resolve this withdrawal request as ${status}?`)) return;
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        alert(`Withdrawal request marked as ${status}!`);
        fetchAdminData();
      } else {
        alert('Operation failed.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const selectedAuthorObj = authors.find(a => a.id === selectedAuthorId);
  const authorBooks = selectedAuthorObj ? selectedAuthorObj.books : [];

  if (loading) return <div className={styles.container}>Loading administration console...</div>;

  return (
    <div className={styles.container} style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <h1 className="serif" style={{ fontSize: '2.8rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '2.5rem' }}>
        Maybeify Publishing Admin Console
      </h1>

      {/* Global Author Selector Header */}
      <SpotlightCard className="glass" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>Select Target Author:</h3>
          <select 
            value={selectedAuthorId} 
            onChange={(e) => setSelectedAuthorId(e.target.value)}
            style={{ 
              padding: '0.8rem 1.5rem', 
              borderRadius: '8px', 
              border: '1px solid rgba(255,255,255,0.3)', 
              background: '#1c1e24', 
              color: 'white', 
              outline: 'none', 
              fontWeight: 'bold',
              minWidth: '280px',
              cursor: 'pointer' 
            }}
          >
            <option value="">-- Choose Author Portal --</option>
            {authors.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
            ))}
          </select>
        </div>
      </SpotlightCard>

      {/* ── SECTION: AUTHOR DETAILS & BOOK CREATOR ── */}
      {selectedAuthorId && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          
          {/* Author Profile details editor */}
          <SpotlightCard className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
              Update Profile Details for {profileForm.name}
            </h2>
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#888' }}>Display Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={profileForm.name} 
                    onChange={handleProfileChange}
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#888' }}>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={profileForm.email} 
                    onChange={handleProfileChange}
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#888' }}>Contact Phone</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={profileForm.phone} 
                    onChange={handleProfileChange}
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#888' }}>Author Status</label>
                  <select 
                    name="status"
                    value={profileForm.status} 
                    onChange={handleProfileChange}
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: '#1c1e24', color: 'white', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#888' }}>Completion Percent (%)</label>
                <input 
                  type="number" 
                  name="completionPercent" 
                  value={profileForm.completionPercent} 
                  onChange={handleProfileChange}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#888' }}>Short Bio</label>
                <textarea 
                  name="bio"
                  value={profileForm.bio} 
                  onChange={handleProfileChange}
                  rows={2}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#888' }}>Awards & Achievments</label>
                <input 
                  type="text" 
                  name="awards" 
                  value={profileForm.awards} 
                  onChange={handleProfileChange}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#888' }}>Key Publications</label>
                <input 
                  type="text" 
                  name="publications" 
                  value={profileForm.publications} 
                  onChange={handleProfileChange}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold' }}>
                Save Author Profile Details
              </button>
              {profileMessage && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{profileMessage}</p>}
            </form>
          </SpotlightCard>

          {/* Book Creator */}
          <SpotlightCard className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
              Add a Book for this Author
            </h2>
            <form onSubmit={handleCreateBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#888' }}>Book Title</label>
                <input 
                  type="text" 
                  value={newBookTitle} 
                  onChange={(e) => setNewBookTitle(e.target.value)} 
                  placeholder="e.g. Beyond Blessed"
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#888' }}>Default Price (₹)</label>
                  <input 
                    type="number" 
                    value={newBookPrice} 
                    onChange={(e) => setNewBookPrice(e.target.value)} 
                    placeholder="e.g. 399.00"
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#888' }}>Cover Image Link</label>
                  <input 
                    type="text" 
                    value={newBookCover} 
                    onChange={(e) => setNewBookCover(e.target.value)}
                    placeholder="URL"
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#888' }}>Synopsis</label>
                <textarea 
                  value={newBookSynopsis} 
                  onChange={(e) => setNewBookSynopsis(e.target.value)}
                  rows={4}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold' }}>
                Register Book Title
              </button>
              {bookMessage && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{bookMessage}</p>}
            </form>
          </SpotlightCard>

        </div>
      )}

      {/* ── SECTION: INTERACTIVE HORIZONTAL EXCEL SPREADSHEET EDITOR ── */}
      {selectedAuthorId && (
        <SpotlightCard className="glass" style={{ padding: '2rem', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: 0, color: 'var(--accent)' }}>
                Spreadsheet Grid Editor
              </h2>
              <p style={{ color: '#aaa', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Edit the horizontal sales sheet values directly inside cells. Save spreadsheet once completed.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select 
                value={selectedBookId} 
                onChange={(e) => setSelectedBookId(e.target.value)}
                style={{ 
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.3)', 
                  background: '#1c1e24', 
                  color: 'white', 
                  outline: 'none', 
                  fontWeight: 'bold',
                  cursor: 'pointer' 
                }}
              >
                <option value="">-- Select Book --</option>
                {authorBooks.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>

              {selectedBookId && (
                <>
                  <button 
                    onClick={handleAddSheetRow}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Plus size={14} /> Add Row
                  </button>

                  <button 
                    onClick={handleSaveSpreadsheet}
                    className="btn-primary"
                    style={{
                      padding: '0.5rem 1.2rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}
                  >
                    <Save size={14} /> Save Sales Spreadsheet
                  </button>
                </>
              )}
            </div>
          </div>

          {selectedBookId ? (
            <div style={{ overflowX: 'auto', border: '1px solid #2d303a', borderRadius: '8px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'monospace, sans-serif',
                fontSize: '0.8rem',
                color: '#c9d1d9',
                minWidth: '1600px'
              }}>
                <thead>
                  {/* Alphabet excel row */}
                  <tr style={{ background: '#1c1e24', borderBottom: '1px solid #2d303a', textAlign: 'center' }}>
                    <th style={{ width: '40px', background: '#14161b', borderRight: '1px solid #2d303a' }}></th>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'].map((l, i) => (
                      <th key={i} style={{ padding: '0.3rem', borderRight: '1px solid #2d303a', color: '#888' }}>{l}</th>
                    ))}
                    <th style={{ width: '60px' }}>Actions</th>
                  </tr>
                  {/* Excel headers */}
                  <tr style={{ borderBottom: '1px solid #2d303a', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
                    <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}>1</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#d4af37', color: 'black' }}>Printing price</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#80cbc4', color: 'black' }}>Shipping cost</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#e28743', color: 'black' }}>Book cost</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#14161b' }}>Month</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#14161b' }}>Year</td>
                    {/* Amazon */}
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#2e7d32' }}>Amazon Sales</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#2e7d32' }}>Amazon Royalty (unit)</td>
                    {/* Maybeify */}
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#455a64' }}>Maybeify Sales</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#455a64' }}>Maybeify Royalty (unit)</td>
                    {/* Google Playbooks */}
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#f57f17', color: 'black' }}>Google Sales</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#f57f17', color: 'black' }}>Google Royalty (unit)</td>
                    {/* Kindle */}
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#c2185b' }}>Kindle Sales</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#c2185b' }}>Kindle Royalty (unit)</td>
                    
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#14161b' }}>Screenshot proof URL</td>
                    <td style={{ background: '#1c1e24' }}></td>
                  </tr>
                </thead>
                <tbody>
                  {spreadsheetRows.length === 0 ? (
                    <tr>
                      <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}>2</td>
                      <td colSpan={16} style={{ padding: '2rem', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                        No spreadsheet rows. Click "Add Row" to initialize.
                      </td>
                    </tr>
                  ) : (
                    spreadsheetRows.map((row, idx) => {
                      const rowNum = idx + 2;
                      const calculatedAmzRoyalty = row.bookCost - row.printingPrice - row.shippingCost;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #2d303a' }}>
                          <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888', fontWeight: 'bold', textAlign: 'center' }}>{rowNum}</td>
                          
                          {/* Printing price */}
                          <td style={{ borderRight: '1px solid #2d303a' }}>
                            <input 
                              type="number" 
                              value={row.printingPrice} 
                              onChange={(e) => handleCellChange(idx, 'printingPrice', parseFloat(e.target.value) || 0.0)} 
                              style={{ width: '80px', border: 'none', background: 'transparent', color: 'white', textAlign: 'center', outline: 'none' }}
                            />
                          </td>

                          {/* Shipping cost */}
                          <td style={{ borderRight: '1px solid #2d303a' }}>
                            <input 
                              type="number" 
                              value={row.shippingCost} 
                              onChange={(e) => handleCellChange(idx, 'shippingCost', parseFloat(e.target.value) || 0.0)} 
                              style={{ width: '80px', border: 'none', background: 'transparent', color: '#80cbc4', fontWeight: 'bold', textAlign: 'center', outline: 'none' }}
                            />
                          </td>

                          {/* Book cost */}
                          <td style={{ borderRight: '1px solid #2d303a' }}>
                            <input 
                              type="number" 
                              value={row.bookCost} 
                              onChange={(e) => handleCellChange(idx, 'bookCost', parseFloat(e.target.value) || 0.0)} 
                              style={{ width: '80px', border: 'none', background: 'transparent', color: 'white', textAlign: 'center', outline: 'none' }}
                            />
                          </td>

                          {/* Month */}
                          <td style={{ borderRight: '1px solid #2d303a' }}>
                            <input 
                              type="text" 
                              value={row.month} 
                              onChange={(e) => handleCellChange(idx, 'month', e.target.value)} 
                              style={{ width: '100px', border: 'none', background: 'transparent', color: 'white', textAlign: 'center', outline: 'none' }}
                            />
                          </td>

                          {/* Year */}
                          <td style={{ borderRight: '1px solid #2d303a' }}>
                            <input 
                              type="number" 
                              value={row.year} 
                              onChange={(e) => handleCellChange(idx, 'year', parseInt(e.target.value) || 2026)} 
                              style={{ width: '60px', border: 'none', background: 'transparent', color: 'white', textAlign: 'center', outline: 'none' }}
                            />
                          </td>

                          {/* Amazon Sales */}
                          <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(46, 125, 50, 0.03)' }}>
                            <input 
                              type="number" 
                              value={row.amazonSales} 
                              onChange={(e) => handleCellChange(idx, 'amazonSales', parseInt(e.target.value) || 0)} 
                              style={{ width: '60px', border: 'none', background: 'transparent', color: '#81c784', textAlign: 'center', outline: 'none', fontWeight: 'bold' }}
                            />
                          </td>

                          {/* Amazon Royalty per unit (LOCKED FORMULA CELL) */}
                          <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(46, 125, 50, 0.08)', textAlign: 'center', color: '#81c784', fontWeight: 'bold' }}>
                            ₹{calculatedAmzRoyalty.toFixed(2)}
                          </td>

                          {/* Maybeify Sales */}
                          <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(69, 90, 100, 0.03)' }}>
                            <input 
                              type="number" 
                              value={row.maybeifySales} 
                              onChange={(e) => handleCellChange(idx, 'maybeifySales', parseInt(e.target.value) || 0)} 
                              style={{ width: '60px', border: 'none', background: 'transparent', color: '#90a4ae', textAlign: 'center', outline: 'none', fontWeight: 'bold' }}
                            />
                          </td>

                          {/* Maybeify Royalty per unit */}
                          <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(69, 90, 100, 0.03)' }}>
                            <input 
                              type="number" 
                              value={row.maybeifyRoyaltyPerUnit} 
                              onChange={(e) => handleCellChange(idx, 'maybeifyRoyaltyPerUnit', parseFloat(e.target.value) || 0.0)} 
                              style={{ width: '70px', border: 'none', background: 'transparent', color: '#90a4ae', textAlign: 'center', outline: 'none' }}
                            />
                          </td>

                          {/* Google Sales */}
                          <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(245, 127, 23, 0.03)' }}>
                            <input 
                              type="number" 
                              value={row.googleSales} 
                              onChange={(e) => handleCellChange(idx, 'googleSales', parseInt(e.target.value) || 0)} 
                              style={{ width: '60px', border: 'none', background: 'transparent', color: '#ffd54f', textAlign: 'center', outline: 'none', fontWeight: 'bold' }}
                            />
                          </td>

                          {/* Google Royalty per unit */}
                          <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(245, 127, 23, 0.03)' }}>
                            <input 
                              type="number" 
                              value={row.googleRoyaltyPerUnit} 
                              onChange={(e) => handleCellChange(idx, 'googleRoyaltyPerUnit', parseFloat(e.target.value) || 0.0)} 
                              style={{ width: '70px', border: 'none', background: 'transparent', color: '#ffd54f', textAlign: 'center', outline: 'none' }}
                            />
                          </td>

                          {/* Kindle Sales */}
                          <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(194, 24, 91, 0.03)' }}>
                            <input 
                              type="number" 
                              value={row.kindleSales} 
                              onChange={(e) => handleCellChange(idx, 'kindleSales', parseInt(e.target.value) || 0)} 
                              style={{ width: '60px', border: 'none', background: 'transparent', color: '#f48fb1', textAlign: 'center', outline: 'none', fontWeight: 'bold' }}
                            />
                          </td>

                          {/* Kindle Royalty per unit */}
                          <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(194, 24, 91, 0.03)' }}>
                            <input 
                              type="number" 
                              value={row.kindleRoyaltyPerUnit} 
                              onChange={(e) => handleCellChange(idx, 'kindleRoyaltyPerUnit', parseFloat(e.target.value) || 0.0)} 
                              style={{ width: '70px', border: 'none', background: 'transparent', color: '#f48fb1', textAlign: 'center', outline: 'none' }}
                            />
                          </td>

                          {/* Screenshot URL */}
                          <td style={{ borderRight: '1px solid #2d303a' }}>
                            <input 
                              type="text" 
                              value={row.screenshot} 
                              onChange={(e) => handleCellChange(idx, 'screenshot', e.target.value)} 
                              placeholder="URL Link"
                              style={{ width: '150px', border: 'none', background: 'transparent', color: '#aaa', outline: 'none', fontSize: '0.75rem' }}
                            />
                          </td>

                          {/* Action Delete */}
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              onClick={() => handleDeleteSheetRow(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#FF4B4B', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#555', border: '1px dashed var(--surface-border)', borderRadius: '8px' }}>
              Select a Book from the dropdown menu to load and edit its platform sales spreadsheet.
            </div>
          )}
          {sheetMessage && <p style={{ color: 'var(--accent)', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '1.2rem', margin: '1.2rem 0 0' }}>{sheetMessage}</p>}
        </SpotlightCard>
      )}

      {/* ── SECTION: WITHDRAWAL REQUESTS MANAGER ── */}
      <section className={styles.section} style={{ marginBottom: '4rem' }}>
        <h2 className={styles.sectionTitle}>Authors Withdrawal Requests</h2>
        {withdrawals.length === 0 ? (
          <p className={styles.empty}>No withdrawal requests registered.</p>
        ) : (
          <div className={styles.grid}>
            {withdrawals.map(req => (
              <div key={req.id} className={styles.card} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: req.status === 'APPROVED' ? '1px solid var(--success)' : req.status === 'PENDING' ? '1px solid var(--accent)' : '1px solid #FF4B4B' }}>
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
                  <h3 style={{ margin: '0.8rem 0 0.2rem', fontSize: '1.5rem' }}>₹{req.amount.toFixed(2)}</h3>
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
      <section className={styles.section} style={{ marginBottom: '4rem' }}>
        <h2 className={styles.sectionTitle}>Manuscript Submissions</h2>
        <div className={styles.grid}>
          {apps.length === 0 && <p className={styles.empty}>No pending manuscripts.</p>}
          {apps.map(app => (
            <div key={app.id} className={styles.card} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
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
              <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                <button className={styles.approveBtn} onClick={() => handleApproveApp(app)}>Approve & Create Account</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: PENDING ACCOUNTS ── */}
      <section className={styles.section} style={{ marginBottom: '4rem' }}>
        <h2 className={styles.sectionTitle}>Account Requests</h2>
        <div className={styles.grid}>
          {pendingUsers.length === 0 && <p className={styles.empty}>No pending account requests.</p>}
          {pendingUsers.map(user => (
            <div key={user.id} className={styles.card} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
              <div className={styles.cardHeader}>
                <span className={styles.date}>{new Date(user.createdAt).toLocaleDateString()}</span>
                <h3>{user.name}</h3>
              </div>
              <div className={styles.authorInfo}>
                <span>{user.email}</span>
              </div>
              <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                <button className={styles.approveBtn} onClick={() => handleActivateUser(user)}>Activate Account</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: AWARD NOMINATIONS ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Award Nominations</h2>
        <div className={styles.grid}>
          {nominations.length === 0 && <p className={styles.empty}>No nominations submitted.</p>}
          {nominations.map(nom => (
            <div key={nom.id} className={styles.card} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
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
              <p className={styles.synopsis} style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#aaa' }}>
                <strong>Reason:</strong> {nom.reason}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

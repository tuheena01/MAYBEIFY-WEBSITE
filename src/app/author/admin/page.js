'use client';

import { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import { Save, Plus, Trash2 } from 'lucide-react';

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

  // Stacked spreadsheets state
  const [amazonRows, setAmazonRows] = useState([]);
  const [maybeifyRows, setMaybeifyRows] = useState([]);
  const [kindleRows, setKindleRows] = useState([]);
  const [googleRows, setGoogleRows] = useState([]);
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
    }
  }, [selectedAuthorId, authors]);

  // Reset selected book when author ID changes
  useEffect(() => {
    setSelectedBookId('');
    setAmazonRows([]);
    setMaybeifyRows([]);
    setKindleRows([]);
    setGoogleRows([]);
  }, [selectedAuthorId]);

  // Load platform-specific spreadsheet rows when book changes
  useEffect(() => {
    if (selectedBookId && selectedAuthorId) {
      const author = authors.find(a => a.id === selectedAuthorId);
      const book = author?.books?.find(b => b.id === selectedBookId);
      
      if (book && book.platformReports) {
        const bookReports = book.platformReports;
        
        setAmazonRows(bookReports.filter(r => r.platform.toUpperCase() === 'AMAZON'));
        setMaybeifyRows(bookReports.filter(r => r.platform.toUpperCase() === 'MAYBEIFY'));
        setKindleRows(bookReports.filter(r => r.platform.toUpperCase() === 'KINDLE'));
        setGoogleRows(bookReports.filter(r => r.platform.toUpperCase() === 'PLAYBOOKS'));
      } else {
        setAmazonRows([]);
        setMaybeifyRows([]);
        setKindleRows([]);
        setGoogleRows([]);
      }
    } else {
      setAmazonRows([]);
      setMaybeifyRows([]);
      setKindleRows([]);
      setGoogleRows([]);
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

  // Grid Row Add / Delete / Change Actions
  const handleAddRow = (platform) => {
    const author = authors.find(a => a.id === selectedAuthorId);
    const book = author?.books?.find(b => b.id === selectedBookId);
    const defaultPrice = book?.price || 299.0;

    const newRow = {
      month: 'August',
      year: 2026,
      printingCost: platform === 'AMAZON' || platform === 'MAYBEIFY' ? 208.0 : 0.0,
      shippingCost: platform === 'AMAZON' || platform === 'MAYBEIFY' ? 33.0 : 0.0,
      mrp: defaultPrice,
      unitsSold: 0,
      royaltyPerUnit: platform === 'KINDLE' || platform === 'PLAYBOOKS' ? (defaultPrice * 0.70) : 0.0,
      screenshot: ''
    };

    if (platform === 'AMAZON') setAmazonRows([...amazonRows, newRow]);
    else if (platform === 'MAYBEIFY') setMaybeifyRows([...maybeifyRows, newRow]);
    else if (platform === 'KINDLE') setKindleRows([...kindleRows, newRow]);
    else if (platform === 'PLAYBOOKS') setGoogleRows([...googleRows, newRow]);
  };

  const handleDeleteRow = (platform, index) => {
    if (platform === 'AMAZON') setAmazonRows(amazonRows.filter((_, i) => i !== index));
    else if (platform === 'MAYBEIFY') setMaybeifyRows(maybeifyRows.filter((_, i) => i !== index));
    else if (platform === 'KINDLE') setKindleRows(kindleRows.filter((_, i) => i !== index));
    else if (platform === 'PLAYBOOKS') setGoogleRows(googleRows.filter((_, i) => i !== index));
  };

  const handleCellChange = (platform, index, field, value) => {
    let targetRows, setTargetRows;
    if (platform === 'AMAZON') { targetRows = amazonRows; setTargetRows = setAmazonRows; }
    else if (platform === 'MAYBEIFY') { targetRows = maybeifyRows; setTargetRows = setMaybeifyRows; }
    else if (platform === 'KINDLE') { targetRows = kindleRows; setTargetRows = setKindleRows; }
    else if (platform === 'PLAYBOOKS') { targetRows = googleRows; setTargetRows = setGoogleRows; }

    const updated = [...targetRows];
    updated[index][field] = value;
    setTargetRows(updated);
  };

  // Batch Save all 4 grids
  const handleSaveSpreadsheets = async () => {
    if (!selectedBookId) return;
    setSheetMessage('Compiling and saving spreadsheets...');

    const reportsList = [];

    // 1. Amazon
    amazonRows.forEach(row => {
      const pCost = parseFloat(row.printingCost) || 0.0;
      const sCost = parseFloat(row.shippingCost) || 0.0;
      const mrp = parseFloat(row.mrp) || 0.0;
      const units = parseInt(row.unitsSold) || 0;
      const royaltyUnit = mrp - pCost - sCost; // formula!

      reportsList.push({
        platform: 'AMAZON',
        month: row.month,
        year: parseInt(row.year) || 2026,
        mrp,
        printingCost: pCost,
        shippingCost: sCost,
        royaltyPerUnit: royaltyUnit,
        unitsSold: units,
        revenue: units * royaltyUnit,
        screenshot: row.screenshot || null
      });
    });

    // 2. Maybeify
    maybeifyRows.forEach(row => {
      const pCost = parseFloat(row.printingCost) || 0.0;
      const sCost = parseFloat(row.shippingCost) || 0.0;
      const mrp = parseFloat(row.mrp) || 0.0;
      const units = parseInt(row.unitsSold) || 0;
      const royaltyUnit = mrp - pCost - sCost; // formula!

      reportsList.push({
        platform: 'MAYBEIFY',
        month: row.month,
        year: parseInt(row.year) || 2026,
        mrp,
        printingCost: pCost,
        shippingCost: sCost,
        royaltyPerUnit: royaltyUnit,
        unitsSold: units,
        revenue: units * royaltyUnit,
        screenshot: row.screenshot || null
      });
    });

    // 3. Kindle
    kindleRows.forEach(row => {
      const mrp = parseFloat(row.mrp) || 0.0;
      const units = parseInt(row.unitsSold) || 0;
      const royaltyUnit = parseFloat(row.royaltyPerUnit) !== undefined ? parseFloat(row.royaltyPerUnit) : (mrp * 0.70);

      reportsList.push({
        platform: 'KINDLE',
        month: row.month,
        year: parseInt(row.year) || 2026,
        mrp,
        printingCost: 0.0,
        shippingCost: 0.0,
        royaltyPerUnit: royaltyUnit,
        unitsSold: units,
        revenue: units * royaltyUnit,
        screenshot: row.screenshot || null
      });
    });

    // 4. Google Playbooks
    googleRows.forEach(row => {
      const mrp = parseFloat(row.mrp) || 0.0;
      const units = parseInt(row.unitsSold) || 0;
      const royaltyUnit = parseFloat(row.royaltyPerUnit) !== undefined ? parseFloat(row.royaltyPerUnit) : (mrp * 0.70);

      reportsList.push({
        platform: 'PLAYBOOKS',
        month: row.month,
        year: parseInt(row.year) || 2026,
        mrp,
        printingCost: 0.0,
        shippingCost: 0.0,
        royaltyPerUnit: royaltyUnit,
        unitsSold: units,
        revenue: units * royaltyUnit,
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
        setSheetMessage('All platform spreadsheets saved successfully to DB!');
        fetchAdminData();
      } else {
        const err = await res.json();
        setSheetMessage(`Error: ${err.error || 'Failed to save spreadsheet'}`);
      }
    } catch (err) {
      setSheetMessage('Network error occurred.');
    }
  };

  // Resolve withdrawal
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

  const renderAdminPlatformTable = (title, platform, rows, isFormula, colorTheme, labelSales, labelRoyalty) => {
    return (
      <div style={{ marginBottom: '3rem', background: '#0b0c10', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${colorTheme}22` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: colorTheme, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colorTheme }}></span>
            {title}
          </h3>
          <button 
            onClick={() => handleAddRow(platform)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${colorTheme}55`,
              color: colorTheme,
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            <Plus size={14} /> Add Row
          </button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #2d303a', borderRadius: '8px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'monospace, sans-serif',
            fontSize: '0.8rem',
            color: '#c9d1d9',
            minWidth: '1200px'
          }}>
            <thead>
              {/* Alphabet row */}
              <tr style={{ background: '#1c1e24', borderBottom: '1px solid #2d303a', textAlign: 'center' }}>
                <th style={{ width: '40px', background: '#14161b', borderRight: '1px solid #2d303a' }}></th>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((l, i) => (
                  <th key={i} style={{ padding: '0.3rem', borderRight: '1px solid #2d303a', color: '#888' }}>{l}</th>
                ))}
                <th style={{ width: '60px' }}>Actions</th>
              </tr>
              {/* Colored headers */}
              <tr style={{ borderBottom: '1px solid #2d303a', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
                <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}>1</td>
                <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#d4af37', color: 'black' }}>Printing price</td>
                <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#80cbc4', color: 'black' }}>Shipping cost</td>
                <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#e28743', color: 'black' }}>Book cost</td>
                <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#14161b' }}>Month</td>
                <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#14161b' }}>Year</td>
                <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: colorTheme, color: colorTheme === '#f57f17' ? 'black' : 'white' }}>{labelSales}</td>
                <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: colorTheme, color: colorTheme === '#f57f17' ? 'black' : 'white' }}>Royalty (unit)</td>
                <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: colorTheme, color: colorTheme === '#f57f17' ? 'black' : 'white', fontWeight: 'bold' }}>{labelRoyalty}</td>
                <td style={{ padding: '0.5rem', borderRight: '1px solid #2d303a', background: '#14161b' }}>Screenshot Proof URL</td>
                <td style={{ background: '#1c1e24' }}></td>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888' }}>2</td>
                  <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                    No rows configured for {title}. Click "Add Row" to initialize.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const rowNum = idx + 2;
                  const mrp = parseFloat(row.mrp) || 0.0;
                  const printingPrice = parseFloat(row.printingCost) || 0.0;
                  const shippingCost = parseFloat(row.shippingCost) || 0.0;
                  const unitsSold = parseInt(row.unitsSold) || 0;

                  const royaltyUnit = isFormula ? (mrp - printingPrice - shippingCost) : (parseFloat(row.royaltyPerUnit) || 0.0);
                  const totalRoyalty = unitsSold * royaltyUnit;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #2d303a' }}>
                      <td style={{ background: '#14161b', borderRight: '1px solid #2d303a', color: '#888', fontWeight: 'bold', textAlign: 'center' }}>{rowNum}</td>
                      
                      {/* Printing Price */}
                      <td style={{ borderRight: '1px solid #2d303a' }}>
                        <input 
                          type="number" 
                          value={row.printingCost} 
                          onChange={(e) => handleCellChange(platform, idx, 'printingCost', parseFloat(e.target.value) || 0.0)} 
                          style={{ width: '85px', border: 'none', background: 'transparent', color: 'white', textAlign: 'center', outline: 'none' }}
                          disabled={!isFormula}
                        />
                      </td>

                      {/* Shipping Cost */}
                      <td style={{ borderRight: '1px solid #2d303a' }}>
                        <input 
                          type="number" 
                          value={row.shippingCost} 
                          onChange={(e) => handleCellChange(platform, idx, 'shippingCost', parseFloat(e.target.value) || 0.0)} 
                          style={{ width: '85px', border: 'none', background: 'transparent', color: '#80cbc4', fontWeight: 'bold', textAlign: 'center', outline: 'none' }}
                          disabled={!isFormula}
                        />
                      </td>

                      {/* Book Cost */}
                      <td style={{ borderRight: '1px solid #2d303a' }}>
                        <input 
                          type="number" 
                          value={row.mrp} 
                          onChange={(e) => handleCellChange(platform, idx, 'mrp', parseFloat(e.target.value) || 0.0)} 
                          style={{ width: '85px', border: 'none', background: 'transparent', color: 'white', textAlign: 'center', outline: 'none' }}
                        />
                      </td>

                      {/* Month */}
                      <td style={{ borderRight: '1px solid #2d303a' }}>
                        <input 
                          type="text" 
                          value={row.month} 
                          onChange={(e) => handleCellChange(platform, idx, 'month', e.target.value)} 
                          style={{ width: '100px', border: 'none', background: 'transparent', color: 'white', textAlign: 'center', outline: 'none' }}
                        />
                      </td>

                      {/* Year */}
                      <td style={{ borderRight: '1px solid #2d303a' }}>
                        <input 
                          type="number" 
                          value={row.year} 
                          onChange={(e) => handleCellChange(platform, idx, 'year', parseInt(e.target.value) || 2026)} 
                          style={{ width: '60px', border: 'none', background: 'transparent', color: 'white', textAlign: 'center', outline: 'none' }}
                        />
                      </td>

                      {/* Platform Sales */}
                      <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(255,255,255,0.01)' }}>
                        <input 
                          type="number" 
                          value={row.unitsSold} 
                          onChange={(e) => handleCellChange(platform, idx, 'unitsSold', parseInt(e.target.value) || 0)} 
                          style={{ width: '65px', border: 'none', background: 'transparent', color: colorTheme, textAlign: 'center', outline: 'none', fontWeight: 'bold' }}
                        />
                      </td>

                      {/* Royalty per unit (LOCKED for Formula, EDITABLE for eBook) */}
                      <td style={{ borderRight: '1px solid #2d303a', background: isFormula ? 'rgba(255,255,255,0.03)' : 'transparent', color: colorTheme }}>
                        {isFormula ? (
                          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>₹{royaltyUnit.toFixed(2)}</div>
                        ) : (
                          <input 
                            type="number" 
                            value={row.royaltyPerUnit} 
                            onChange={(e) => handleCellChange(platform, idx, 'royaltyPerUnit', parseFloat(e.target.value) || 0.0)} 
                            style={{ width: '70px', border: 'none', background: 'transparent', color: colorTheme, textAlign: 'center', outline: 'none', fontWeight: 'bold' }}
                          />
                        )}
                      </td>

                      {/* Total Royalty */}
                      <td style={{ borderRight: '1px solid #2d303a', background: 'rgba(255, 255, 255, 0.04)', textAlign: 'center', color: colorTheme, fontWeight: 'bold' }}>
                        ₹{totalRoyalty.toFixed(2)}
                      </td>

                      {/* Screenshot URL */}
                      <td style={{ borderRight: '1px solid #2d303a' }}>
                        <input 
                          type="text" 
                          value={row.screenshot || ''} 
                          onChange={(e) => handleCellChange(platform, idx, 'screenshot', e.target.value)} 
                          placeholder="URL Link"
                          style={{ width: '140px', border: 'none', background: 'transparent', color: '#aaa', outline: 'none', fontSize: '0.75rem' }}
                        />
                      </td>

                      {/* Actions Delete */}
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteRow(platform, idx)}
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
      </div>
    );
  };

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

      {/* ── SECTION: INTERACTIVE STACKED SPREADSHEETS EDITOR ── */}
      {selectedAuthorId && (
        <SpotlightCard className="glass" style={{ padding: '2rem', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', margin: 0, color: 'var(--accent)' }}>
                Spreadsheet Grid Editors
              </h2>
              <p style={{ color: '#aaa', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Edit platform-specific Excel grids vertically. Click "Save Sales Spreadsheets" at the bottom to sync all.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#888' }}>Target Book:</label>
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
            </div>
          </div>

          {selectedBookId ? (
            <div>
              {renderAdminPlatformTable('1. Amazon Store (Paperback/Hardcover)', 'AMAZON', amazonRows, true, '#2e7d32', 'Amazon Sales', 'Total Amazon Royalty')}
              {renderAdminPlatformTable('2. Maybeify Direct Store', 'MAYBEIFY', maybeifyRows, true, '#455a64', 'Maybeify Sales', 'Total Maybeify Royalty')}
              {renderAdminPlatformTable('3. Amazon Kindle eBook Store', 'KINDLE', kindleRows, false, '#c2185b', 'Kindle Sales', 'Total Kindle Royalty')}
              {renderAdminPlatformTable('4. Google Playbooks eBook Store', 'PLAYBOOKS', googleRows, false, '#f57f17', 'Google Sales', 'Total Google Royalty')}

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--surface-border)', paddingTop: '2rem', marginTop: '2rem' }}>
                <button 
                  onClick={handleSaveSpreadsheets}
                  className="btn-primary"
                  style={{
                    padding: '0.8rem 2.5rem',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 24px rgba(212, 175, 55, 0.15)'
                  }}
                >
                  <Save size={18} /> Save All Sales Spreadsheets
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#555', border: '1px dashed var(--surface-border)', borderRadius: '8px' }}>
              Select an author's book from the dropdown menu to load and edit platform spreadsheets.
            </div>
          )}
          {sheetMessage && <p style={{ color: 'var(--accent)', fontSize: '1rem', fontWeight: 'bold', marginTop: '1.5rem', textAlign: 'center' }}>{sheetMessage}</p>}
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

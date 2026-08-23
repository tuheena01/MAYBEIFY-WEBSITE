'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import { IndianRupee, CreditCard, Send, CheckCircle, Clock } from 'lucide-react';

export default function AuthorEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    bankAccount: '',
    upiId: '',
    paymentMethod: 'BANK_TRANSFER',
    panGst: ''
  });
  const [saveStatus, setSaveStatus] = useState(null);

  const fetchEarnings = () => {
    fetch('/api/author/earnings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load earnings details');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setPaymentForm({
          bankAccount: resData.paymentDetails?.bankAccount || '',
          upiId: resData.paymentDetails?.upiId || '',
          paymentMethod: resData.paymentDetails?.paymentMethod || 'BANK_TRANSFER',
          panGst: resData.paymentDetails?.panGst || ''
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handlePaymentChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving settings...');
    try {
      const res = await fetch('/api/author/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_payment',
          ...paymentForm
        })
      });
      if (res.ok) {
        setSaveStatus('Payment settings updated!');
        fetchEarnings();
      } else {
        const err = await res.json();
        setSaveStatus(`Error: ${err.error || 'Failed to save'}`);
      }
    } catch (err) {
      setSaveStatus('Network error.');
    }
  };

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawStatus({ type: 'error', message: 'Enter a valid amount.' });
      return;
    }
    if (parseFloat(withdrawAmount) > data.metrics.pendingEarnings) {
      setWithdrawStatus({ type: 'error', message: 'Requested amount exceeds your pending balance.' });
      return;
    }

    setWithdrawStatus({ type: 'loading', message: 'Submitting request...' });
    try {
      const res = await fetch('/api/author/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_withdrawal',
          amount: parseFloat(withdrawAmount)
        })
      });

      if (res.ok) {
        setWithdrawStatus({ type: 'success', message: 'Withdrawal request submitted for approval!' });
        setWithdrawAmount('');
        fetchEarnings();
      } else {
        const err = await res.json();
        setWithdrawStatus({ type: 'error', message: err.error || 'Failed to request withdrawal' });
      }
    } catch (err) {
      setWithdrawStatus({ type: 'error', message: 'Network error occurred.' });
    }
  };

  const handleDownloadStatement = () => {
    alert('Statement statement_2026.pdf download initialized successfully!');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading earnings board...</p>
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

  const { metrics, transactions, withdrawals } = data;

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Earnings & Payments</h1>

      {/* Aggregate Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <SpotlightCard className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Total Earnings</h3>
          <p style={{ fontSize: '2.2rem', color: 'var(--foreground)', fontWeight: 'bold' }}>
            ₹{metrics.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </SpotlightCard>
        <SpotlightCard className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Pending Balance</h3>
          <p style={{ fontSize: '2.2rem', color: 'var(--accent)', fontWeight: 'bold' }}>
            ₹{metrics.pendingEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </SpotlightCard>
        <SpotlightCard className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Paid Amount</h3>
          <p style={{ fontSize: '2.2rem', color: 'var(--success)', fontWeight: 'bold' }}>
            ₹{metrics.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </SpotlightCard>
        <SpotlightCard className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>This Month</h3>
          <p style={{ fontSize: '2.2rem', color: 'var(--foreground)', fontWeight: 'bold' }}>
            ₹{metrics.thisMonthEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </SpotlightCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem', marginBottom: '3.5rem' }}>
        
        {/* Left Side: Request Withdrawal */}
        <div>
          <SpotlightCard className="glass" style={{ padding: '2rem', height: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              Request Withdrawal
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Transfer your pending balance to your bank account or UPI id. Withdrawal requests are processed by administrators within 2-3 business days.
            </p>
            <form onSubmit={handleWithdrawalRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#888' }}>Withdrawal Amount (₹)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Max ₹${metrics.pendingEarnings.toFixed(2)}`}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--surface-border)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    disabled={metrics.pendingEarnings <= 0}
                  >
                    Request
                  </button>
                </div>
              </div>
              {withdrawStatus && (
                <p style={{
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                  color: withdrawStatus.type === 'success' ? 'var(--success)' : 
                         withdrawStatus.type === 'error' ? '#FF4B4B' : 'var(--accent)'
                }}>
                  {withdrawStatus.message}
                </p>
              )}
            </form>
          </SpotlightCard>
        </div>

        {/* Right Side: Account Settings */}
        <div>
          <SpotlightCard className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Payment Settings</h3>
            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>Preferred Method</label>
                <select
                  name="paymentMethod"
                  value={paymentForm.paymentMethod}
                  onChange={handlePaymentChange}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: '#1c1e24',
                    color: 'white',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="BANK_TRANSFER">Bank Account Transfer</option>
                  <option value="UPI">UPI Id</option>
                </select>
              </div>

              {paymentForm.paymentMethod === 'BANK_TRANSFER' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#888' }}>Bank Account Number & IFSC</label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={paymentForm.bankAccount}
                    onChange={handlePaymentChange}
                    placeholder="e.g. Account: 1029384756 IFSC: SBIN000123"
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#888' }}>UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    value={paymentForm.upiId}
                    onChange={handlePaymentChange}
                    placeholder="e.g. authorname@okaxis"
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#888' }}>PAN / GSTIN (for tax compliance)</label>
                <input
                  type="text"
                  name="panGst"
                  value={paymentForm.panGst}
                  onChange={handlePaymentChange}
                  placeholder="e.g. ABCDE1234F"
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', marginTop: '1rem', alignSelf: 'flex-start', cursor: 'pointer' }}>
                Save Settings
              </button>
              {saveStatus && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{saveStatus}</p>}
            </form>
          </SpotlightCard>
        </div>

      </div>

      {/* Transaction History */}
      <SpotlightCard className="glass" style={{ overflow: 'hidden', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Transaction History</h3>
          <button 
            onClick={handleDownloadStatement}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--surface-border)',
              color: 'white',
              padding: '0.5rem 1.2rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Download Statement
          </button>
        </div>

        {transactions.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#888' }}>
            No transactions logged.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Description</th>
                <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Amount</th>
                <th style={{ padding: '1.5rem', color: '#888', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1.5rem' }}>{t.date}</td>
                  <td style={{ padding: '1.5rem' }}>{t.description}</td>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold', color: t.description.includes('Withdrawal') ? '#FF4B4B' : 'var(--accent)' }}>
                    {t.description.includes('Withdrawal') ? '-' : ''}₹{t.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <span style={{
                      padding: '0.3rem 0.7rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      background: t.status === 'PAID' ? 'rgba(0, 230, 118, 0.1)' : 
                                  t.status === 'PENDING' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 75, 75, 0.1)',
                      color: t.status === 'PAID' ? 'var(--success)' : 
                             t.status === 'PENDING' ? 'var(--accent)' : '#FF4B4B'
                    }}>
                      {t.status}
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

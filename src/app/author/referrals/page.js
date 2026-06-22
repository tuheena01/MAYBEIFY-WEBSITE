'use client';

import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

export default function AuthorReferrals() {
  const [copied, setCopied] = useState(false);
  const referralCode = "MAYBE26-X9A2"; // Mock code, in real app fetched from user profile
  const referralLink = `https://maybeify.com/submit?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Ambassador Dashboard</h1>
      
      <div className="glass" style={{ padding: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>Invite & Earn</h2>
        <p style={{ color: '#aaa', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
          Share your elite connection to Maybeify. For every talented writer you refer who signs a publishing contract, 
          you receive a 5% ambassador bonus on their first year of royalties.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', borderRadius: '30px', padding: '0.5rem', maxWidth: '100%', width: '500px' }}>
          <input 
            type="text" 
            readOnly 
            value={referralLink} 
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#ccc', padding: '0 1rem', fontSize: '1rem', outline: 'none' }}
          />
          <button 
            onClick={copyToClipboard}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '25px' }}
          >
            {copied ? <><CheckCircle size={18} /> Copied</> : <><Copy size={18} /> Copy Link</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ color: '#888', marginBottom: '0.5rem', fontSize: '1rem' }}>Successful Referrals</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--foreground)', fontWeight: 'bold' }}>0</p>
        </div>
        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ color: '#888', marginBottom: '0.5rem', fontSize: '1rem' }}>Pending Invites</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--foreground)', fontWeight: 'bold' }}>0</p>
        </div>
        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ color: '#888', marginBottom: '0.5rem', fontSize: '1rem' }}>Total Earned via Referrals</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>$0.00</p>
        </div>
      </div>
    </div>
  );
}
